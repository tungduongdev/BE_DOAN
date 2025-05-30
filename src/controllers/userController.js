import { StatusCodes } from 'http-status-codes'
import { userService } from '../services/userService.js'
import ApiError from '../utils/ApiError.js'
import ms from 'ms'


const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    res.cookie('accessToken', result.accessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms('14 days')
      })
    res.cookie('refreshToken', result.refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms('14 days')
      })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    // Xóa cookie - đơn giản là làm ngược lại so với việc gắn cookie ở hàm login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Please Sign In! (Error from refresh Token)'
      )
    )
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    //console.log('userId', userId)
    const userAvatarFile = req.file
    console.log('userAvatarFile', userAvatarFile)
    const updatedUser = await userService.update(userId, req.body, userAvatarFile)
    //console.log('updatedUser', updatedUser)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}
