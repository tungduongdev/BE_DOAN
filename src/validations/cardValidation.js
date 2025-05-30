import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

const createNew = async (req, res, next) => {
  //validate du lieu o backend la dieu bat buoc de dam bao du lieu la chinh xac de luu vao database
  const correctConditions = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({ OBJECT_ID_RULE_MESSAGE }),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({ OBJECT_ID_RULE_MESSAGE }),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })
  try {
    //validate request body abortEarly: de truong hop co nhieu loi validate thi no se tra ve tat ca loi(vd 52)
    await correctConditions.validateAsync(req.body, { abortEarly: false })
    //validate du lieu xong xuoi thi cho req di tiep sang controller
    next()
  } catch (error) {
    // const errorMessages = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessages)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   error: new Error(error).message
    // })
  }

}

const update = async (req, res, next) => {
  const correctConditions = Joi.object({
    title: Joi.string().optional().min(3).max(50).trim().strict(),
    description: Joi.string().optional()
  })
  try {
    await correctConditions.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const cardId = req.params.id
    if (!cardId || !cardId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid card ID format')
    }
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const cardValidation = {
  createNew,
  update,
  deleteItem
}
