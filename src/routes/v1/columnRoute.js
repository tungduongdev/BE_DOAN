
import { StatusCodes } from 'http-status-codes'
import express from 'express'
import { columnValidation } from '../../validations/columnValidation.js'
import { columnController } from '../../controllers/columnController.js'
import { authMiddlewere } from '../../middlewares/authMiddlewere.js'

const Router = express.Router()

Router.route('/')
  .post(authMiddlewere.isAuthorized, columnValidation.createNew, columnController.createNew)
Router.route('/:id')
  .put(authMiddlewere.isAuthorized, columnValidation.update, columnController.update)
  .delete(authMiddlewere.isAuthorized, columnValidation.deleteItem, columnController.deleteItem)
export const columnRoute = Router