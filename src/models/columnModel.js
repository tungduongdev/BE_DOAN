import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { GET_DB } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  slug: Joi.string().required().min(3).trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId']

const createNew = async (data) => {
  try {
    const validateData = await validateBeforeCreate(data)
    // Convert string to ObjectId
    const newColumnToAdd = {
      ...validateData,
      boardId: new ObjectId(validateData.boardId)
    }
    const createdColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd)
    return createdColumn
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
  } catch (error) {
    throw new Error(error)
  }
}

const pushCardOderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      { $push: { cardOrderIds: new ObjectId(card._id) } },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (columnId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(key => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updatedData[key]
      }
    })
    if (updatedData.cardOrderIds) {
      updatedData.cardOrderIds = updatedData.cardOrderIds.map(cardId => new ObjectId(cardId))
    }
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(columnId) },
      { $set: updatedData },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async (columnId) => {
  const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({ _id : new ObjectId(columnId) })
  return result
}
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOderIds,
  update,
  deleteOneById
}