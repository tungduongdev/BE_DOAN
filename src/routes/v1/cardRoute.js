import { StatusCodes } from 'http-status-codes'
import express from 'express'
import { cardValidation } from '../../validations/cardValidation.js'
import { cardController } from '../../controllers/cardController.js'
import { authMiddlewere } from '../../middlewares/authMiddlewere.js'
import { multerUploadMiddleware } from '../../middlewares/multerUploadMiddleware.js'

const Router = express.Router()

Router.route('/')
  .post(authMiddlewere.isAuthorized, cardValidation.createNew, cardController.createNew)
Router.route('/:id')
  .put(authMiddlewere.isAuthorized, multerUploadMiddleware.upload.single('cardCover'), cardValidation.update, cardController.update)
  .delete(authMiddlewere.isAuthorized, cardValidation.deleteItem, cardController.deleteItem)

export const cardRoute = Router