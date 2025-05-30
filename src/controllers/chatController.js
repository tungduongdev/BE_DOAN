import { StatusCodes } from 'http-status-codes'
import { chatService } from '../services/chatService.js'

const chat = async (req, res, next) => {
  try {
    const result = await chatService.chat(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const chatController = {
  chat
} 