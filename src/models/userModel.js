import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongodb.js'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '../utils/validators.js'

const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE), // unique
  password: Joi.string().required(),
  // username có thể không unique bởi sự trùng lặp từ các nhà cung cấp email khác nhau
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

// Các trường không được phép cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

// Xác thực dữ liệu trước khi tạo mới
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Tạo user mới
const createNew = async (data) => {
  try {
    const validatedData = await validateBeforeCreate(data)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validatedData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm user theo ID
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm user theo email
const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật user
const update = async (userId, data) => {
  try {
    // Loại bỏ các trường không hợp lệ
    Object.keys(data).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete data[key]
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result // Trả về giá trị sau khi cập nhật
  } catch (error) {
    throw new Error(error)
  }
}

// Export 
export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  update
}
