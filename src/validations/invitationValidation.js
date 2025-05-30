import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

const createNewBoardInvitation = async (req, res, next) => {

  console.log('createNewBoardInvitation', req.body)
  const correctCondition = Joi.object({
    inviteeEmail: Joi.string().email().required(),
    boardId: Joi.string().required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const invitationValidation = {
  createNewBoardInvitation
}
