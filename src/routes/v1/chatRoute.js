import express from 'express'
import { chatController } from '../../controllers/chatController.js'

const Router = express.Router()

Router.route('/')
  .post(chatController.chat)

export const chatRoute = Router 