
import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { GET_DB } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '../utils/constants.js'
import { columnModel } from './columnModel.js'
import { cardModel } from './cardModel.js'
import { pagingSkipValue } from '../utils/algorithms.js'
import { userModel } from './userModel.js'

const BOARD_COLLECTION_NAME = 'boards'

const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(100).trim().strict(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  //admin
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).default(BOARD_TYPES.PUBLIC),

  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validateData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validateData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return createdBoard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
  } catch (error) {
    throw new Error(error)
  }
}
const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      {
        _destroy: false
      },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }]
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          $and: queryConditions
        }
      },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id', //field cua column dang dung hien tai
          foreignField: 'boardId', //field cua board dang dung hien tai
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'ownerIds',
          foreignField: '_id',
          as: 'owners',
          // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
          // $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
          pipeline: [
            {
              $project: {
                password: 0,
                verifyToken: 0
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
          pipeline: [
            {
              $project: {
                password: 0,
                verifyToken: 0
              }
            }
          ]
        }
      }
    ]).toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}
// Add columnId to columnOrderIds array in board
const pushColumnIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}

const pullColumnIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(key => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updatedData[key]
      }
    })
    if (updatedData.columnOrderIds) {
      updatedData.columnOrderIds = updatedData.columnOrderIds.map(columnId => new ObjectId(columnId))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updatedData },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [
      //dk1: board chưa bị xoá
      {
        _destroy: false
      },
      //dk2: board được yêu cầu xoá bởi người dùng thì phải là thành viên hoặc là chủ sở hữu
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }]
    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
        if (queryFilters[key]) {
          queryConditions.push({
            [key]: { $regex: queryFilters[key], $options: 'i' }
          })
        }
      })
    }
    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          $and: queryConditions
        }
      },
      {
        // sắp xếp theo thứ tự tăng dần của title
        $sort: {
          title: 1
        }
      },
      {
        // để xử lí nhiều luồng trong 1 query
        $facet: {
          // luòng1: query board
          'queryBoards': [
            //bỏ qua số lượng bản ghi của những trang trước
            { $skip: pagingSkipValue(page, itemsPerPage) },
            { $limit: itemsPerPage }
          ],
          //luồng2: quert đếm tổng tất cả số lượng bản ghi board có trong db và trả về cho client
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        }
      }
    ],
      {
        // sắp xếp theo thứ tự tăng dần của title(fix B đứng trước a)
        collation: { locale: 'en' }
      }).toArray()
    console.log(query)

    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0] ? res.queryTotalBoards[0].countedAllBoards : 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteBoard = async (boardId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: { _destroy: true } },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}

const removeMember = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      {
        $pull: {
          memberIds: new ObjectId(userId),
          ownerIds: new ObjectId(userId)
        }
      },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}

const changeUserRole = async (boardId, userId, newRole) => {
  try {
    let updateCondition = {}

    if (newRole === 'OWNER') {
      // Move from member to owner
      updateCondition = {
        $pull: { memberIds: new ObjectId(userId) },
        $addToSet: { ownerIds: new ObjectId(userId) }
      }
    } else if (newRole === 'MEMBER') {
      // Move from owner to member
      updateCondition = {
        $pull: { ownerIds: new ObjectId(userId) },
        $addToSet: { memberIds: new ObjectId(userId) }
      }
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      updateCondition,
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    throw new Error(error)
  }
}


export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnIds,
  update,
  pullColumnIds,
  getBoards,
  deleteBoard,
  removeMember,
  changeUserRole
}
