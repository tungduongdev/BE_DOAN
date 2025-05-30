import express from 'express'
import { userValidation } from '../../validations/userValidation.js'
import { userController } from '../../controllers/userController.js'
import { authMiddlewere } from '../../middlewares/authMiddlewere.js'
import { multerUploadMiddleware } from '../../middlewares/multerUploadMiddleware.js'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)
Router.route('/logout')
  .delete(userController.logout)
Router.route('/refresh-token')
  .get(userController.refreshToken)
Router.route('/update')
  .put(authMiddlewere.isAuthorized, multerUploadMiddleware.upload.single('avatar'), userValidation.update, userController.update)
export const userRoute = Router

