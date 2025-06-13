import { StatusCodes } from 'http-status-codes'
import { jwtProvider } from '../providers/JwtProvider.js'
import ApiError from '../utils/ApiError.js'
import { env } from '../config/environment.js'

const isAuthorized = async (req, res, next) => {
  console.log('🔐 [AUTH MIDDLEWARE] Starting authentication check...')
  console.log('📍 [AUTH MIDDLEWARE] Request URL:', req.originalUrl)
  console.log('🍪 [AUTH MIDDLEWARE] All cookies:', req.cookies)

  // lấy access token từ cookie
  const accessToken = req.cookies?.accessToken
  console.log('🎫 [AUTH MIDDLEWARE] Access token present:', !!accessToken)
  console.log('🎫 [AUTH MIDDLEWARE] Access token (first 20 chars):', accessToken?.substring(0, 20) + '...')

  // nếu không có access token thì trả về lỗi
  if (!accessToken) {
    console.log('❌ [AUTH MIDDLEWARE] No access token found in cookies')
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Access token not found'))
    return
  }

  try {
    console.log('🔍 [AUTH MIDDLEWARE] Verifying access token...')
    // thực hiện giải mã token xem có hợp lệ không
    const accessTokenDecoded = await jwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET)
    console.log('✅ [AUTH MIDDLEWARE] Token verified successfully')
    console.log('👤 [AUTH MIDDLEWARE] User info from token:', {
      _id: accessTokenDecoded._id,
      email: accessTokenDecoded.email
    })

    // lưu thông tin user vào req để sử dụng ở các middleware khác
    req.jwtDecoded = accessTokenDecoded
    next()
  } catch (error) {
    console.log('❌ [AUTH MIDDLEWARE] Token verification failed:', error.message)
    console.log('🔍 [AUTH MIDDLEWARE] Error details:', error)

    // nếu access token hết hạn thì sẽ trả về lỗi
    if (error?.message?.includes('jwt expired')) {
      console.log('⏰ [AUTH MIDDLEWARE] Token expired, sending 410 status')
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }
    console.log('🚫 [AUTH MIDDLEWARE] Invalid token, sending 401 status')
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid access token'))
  }
}

export const authMiddlewere = {
  isAuthorized
}