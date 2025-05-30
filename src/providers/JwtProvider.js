import JWT from 'jsonwebtoken'


// hàm tạo mới token gồm 3  tham số đầu vào userInfor, secretKey, tokenLife
const generateToken = async (userInfor, secretKey, tokenLife) => {
  try {
    return JWT.sign(userInfor, secretKey, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {throw new Error(error)}
}

// hàm kiểm tra xem token có hợp lệ hay không
const verifyToken = async (token, secretKey) => {
  try {
    return JWT.verify(token, secretKey)
  } catch (error) {throw new Error(error)}
}

export const jwtProvider = {
  generateToken,
  verifyToken
}