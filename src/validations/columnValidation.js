
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

const createNew = async (req, res, next) => {
  //validate du lieu o backend la dieu bat buoc de dam bao du lieu la chinh xac de luu vao database
  const correctConditions = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({ OBJECT_ID_RULE_MESSAGE }),
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
  //validate du lieu o backend la dieu bat buoc de dam bao du lieu la chinh xac de luu vao database
  const correctConditions = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict().messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be an empty field',
      'string.min': 'Title must have at least {#limit} characters',
      'string.max': 'Title must have at most {#limit} characters',
      'any.required': 'Title is a required field'
    }),
    cardOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
    //boardId: Joi.string().pattern(OBJECT_ID_RULE).messages({ OBJECT_ID_RULE_MESSAGE })
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

const deleteItem = async (req, res, next) => {
  console.log('🚀 ~ deleteItem ~ req:', req.params)
  //validate du lieu o backend la dieu bat buoc de dam bao du lieu la chinh xac de luu vao database

  const correctConditions = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({ OBJECT_ID_RULE_MESSAGE })
  })

  try {
    await correctConditions.validateAsync(req.params)
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

export const columnValidation = {
  createNew,
  update,
  deleteItem
}
