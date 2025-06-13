import { StatusCodes } from 'http-status-codes'
import { userModel } from '../models/userModel.js'
import ApiError from '../utils/ApiError.js'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '../utils/formater.js'
import { WEBSITE_DOMAIN } from '../utils/constants.js'
import { brevoProvider } from '../providers/BravoProvider.js'
import { env } from '../config/environment.js'
import { jwtProvider } from '../providers/JwtProvider.js'
import { CloudinaryProvider } from '../providers/CloudinaryProvider.js'


const createNew = async (reqBody) => {
  try {
    //kiêm tra xem email đã tồn tại chưa
    const existuser = await userModel.findOneByEmail(reqBody.email)
    if (existuser) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    //tạo dât để lưu vào db
    // tạo tên người dùng từ email
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }
    const createdUser = await userModel.createNew(newUser)
    const getUser = await userModel.findOneById(createdUser.insertedId)

    // Kiểm tra cấu hình email trước khi gửi
    if (env.BREVO_API_KEY && env.ADMIN_EMAIL_ADDRESS && WEBSITE_DOMAIN) {
      try {
        //gửi mail xác nhận tài khoản
        const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getUser.email}&token=${getUser.verifyToken}`
        const custonSubject = ' Please verify your email address before logging in to your account'
        const htmlContent = `
          <h3>Hi ${getUser.displayName},</h3>
          <p>Thanks for signing up with us. Please verify your email address by clicking on the link below.</p>
          <a href="${verificationLink}">Verify your email address</a>
          <p>If you did not create an account, no further action is required.</p>
          <p>Thanks,</p>
          <p>TungDuongCo</p>
        `
        await brevoProvider.sendEmail(getUser.email, custonSubject, htmlContent)
        console.log('Verification email sent successfully to:', getUser.email)
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError.message)
        // Không throw error để không làm crash quá trình đăng ký
        // User vẫn được tạo thành công nhưng không nhận được email xác nhận
      }
    } else {
      console.warn('Email configuration missing. User created but verification email not sent.')
      console.warn('Missing:', {
        BREVO_API_KEY: !env.BREVO_API_KEY,
        ADMIN_EMAIL_ADDRESS: !env.ADMIN_EMAIL_ADDRESS,
        WEBSITE_DOMAIN: !WEBSITE_DOMAIN
      })
    }

    //gọi tới provider gửi mail
    //luu dữ liệu vào db
    //trả về dữ liệu cho controller
    return pickUser(getUser)
  } catch (error) { throw new Error(error) }
}

const verifyAccount = async (reqBody) => {
  try {
    const existsUser = await userModel.findOneByEmail(reqBody.email)
    if (!existsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    if (existsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is already verified')
    if (reqBody.token !== existsUser.verifyToken) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token')
    //update dữ liệu
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existsUser._id, updateData)
    return pickUser(updatedUser)
  } catch (error) { throw new Error(error) }
}

const login = async (reqBody) => {
  try {
    const existsUser = await userModel.findOneByEmail(reqBody.email)
    if (!existsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    if (!existsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not verified')
    if (!bcryptjs.compareSync(reqBody.password, existsUser.password))
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your email or password is incorrect')
    // nếu mọi thứ oke bắt đầu tạo token đăng nhập trả về fe

    // thông tin user sẽ đính kèm trong token bao gồm id, email
    const userInfo = {
      _id: existsUser._id,
      email: existsUser.email
    }
    // tạp 2 loại token là access token và refresh token
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET,
      env.REFRESH_TOKEN_LIFE
    )

    return {
      accessToken,
      refreshToken,
      ...pickUser(existsUser)
    }
  } catch (error) { throw new Error(error) }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await jwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET
    )

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi,
    // vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo accessToken mới
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET,
      //5 // 5 giây để test accessToken hết hạn
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) { throw new Error(error) }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    //kiểm tra xem user có tồn tại không
    //console.log(userId)
    const existsUser = await userModel.findOneById(userId)
    //console.log(existsUser)
    if (!existsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    if (!existsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not verified')
    //khởi tạo kết quả update
    let updateUser = {}

    //TH: change password
    if (reqBody.current_password && reqBody.new_password) {
      if (!bcryptjs.compareSync(reqBody.current_password, existsUser.password))
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect')
      updateUser = await userModel.update(existsUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      console.log('uploadResult', uploadResult)

      //lưu lại url của file ảnh vào db
      updateUser = await userModel.update(existsUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      updateUser = await userModel.update(existsUser._id, reqBody)
      //console.log('updateUser', updateUser)
    }
    return pickUser(updateUser)
  } catch (error) { throw new Error(error) }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}