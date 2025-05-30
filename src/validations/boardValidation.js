
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { BOARD_TYPES } from '../utils/constants.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

const createNew = async (req, res, next) => {
  //validate du lieu o backend la dieu bat buoc de dam bao du lieu la chinh xac de luu vao database
  const correctConditions = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict().messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be an empty field',
      'string.min': 'Title must have at least {#limit} characters',
      'string.max': 'Title must have at most {#limit} characters',
      'any.required': 'Title is a required field'
    }),
    description: Joi.string().min(3).max(100).trim().strict().messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be an empty field',
      'string.min': 'Title must have at least {#limit} characters',
      'string.max': 'Title must have at most {#limit} characters',
      'any.required': 'Title is a required field'
    }),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).default(BOARD_TYPES.PUBLIC).messages({
      'string.base': 'Type must be a string',
      'string.empty': 'Type cannot be an empty field',
      'any.only': 'Type must be public or private'
    })
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
  //validate du lieu o backend la dieu bat buoc de dam bao du lieu la chinh xac de luu vao database
  const correctConditions = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict().messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be an empty field',
      'string.min': 'Title must have at least {#limit} characters',
      'string.max': 'Title must have at most {#limit} characters',
      'any.required': 'Title is a required field'
    }),
    description: Joi.string().min(3).max(100).trim().strict().messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be an empty field',
      'string.min': 'Title must have at least {#limit} characters',
      'string.max': 'Title must have at most {#limit} characters',
      'any.required': 'Title is a required field'
    }),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).default(BOARD_TYPES.PUBLIC).messages({
      'string.base': 'Type must be a string',
      'string.empty': 'Type cannot be an empty field',
      'any.only': 'Type must be public or private'
    }),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    //validate request body abortEarly: de truong hop co nhieu loi validate thi no se tra ve tat ca loi(vd 52)
    //allowUnknown: cho phep req.body co nhung truong khong duoc dinh nghia trong schema
    await correctConditions.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
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

const moveCardToDifferentColumn = async (req, res, next) => {
  //validate du lieu o backend la dieu bat buoc de dam bao du lieu la chinh xac de luu vao database
  const correctConditions = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),

    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    //validate request body abortEarly: de truong hop co nhieu loi validate thi no se tra ve tat ca loi(vd 52)
    //allowUnknown: cho phep req.body co nhung truong khong duoc dinh nghia trong schema
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

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
}
