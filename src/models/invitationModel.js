import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongodb.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '../utils/constants.js'
import { userModel } from './userModel.js'
import { boardModel } from './boardModel.js'

const INVITATION_COLLECTION_NAME = 'invitations'

const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),

  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVITATION_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt', 'boardInvitation']

const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId),
    }

    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (!INVITATION_UPDATE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })

    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    console.log('result', result)
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const findAllByUserId = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(userId) },
      { _destroy: false }
    ];

    const results = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: queryConditions
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
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
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
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
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'board'
          }
        }
      ])
      .toArray();

    return results || null;
  } catch (error) {
    throw new Error(error);
  }
};

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(boardModel.BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $addToSet: { memberIds: new ObjectId(userId) } }, // addToSet tránh trùng user
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findAllByUserId,
  pushMemberIds
}
