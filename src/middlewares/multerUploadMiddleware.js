import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '../utils/ApiError.js'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '../utils/validators.js'

// function kiểm tra file
const customFileFilter = (req, file, callback) => {
  console.log(file)
  // đối với multer kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null)
  }
  // nếu không có lỗi thì trả về true
  return callback(null, true)
}

// khởi tạo fun upload
const upload = multer({
  fileFilter: customFileFilter,
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE }
})

export const multerUploadMiddleware = { upload }