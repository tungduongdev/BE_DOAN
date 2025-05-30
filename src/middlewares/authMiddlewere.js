import { StatusCodes } from 'http-status-codes'
import { jwtProvider } from '../providers/JwtProvider.js'
import ApiError from '../utils/ApiError.js'
import { env } from '../config/environment.js'

const isAuthorized = async (req, res, next) => {
  // lấy access token từ cookie
  const accessToken = req.cookies?.accessToken
  // nếu không có access token thì trả về lỗi
  if (!accessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Access token not found'))
    return
  }

  try {
    // thực hiện giải mã token xem có hợp lệ không
    const accessTokenDecoded = await jwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET)
    // lưu thông tin user vào req để sử dụng ở các middleware khác
    req.jwtDecoded = accessTokenDecoded
    next()
  } catch (error) {
    // nếu access token hết hạn thì sẽ trả về lỗi
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid access token')) 
  }
}

export const authMiddlewere = {
  isAuthorized
}