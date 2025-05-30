
import express from 'express'
import { boardValidation } from '../../validations/boardValidation.js'
import { boardController } from '../../controllers/boardController.js'
import { authMiddlewere } from '../../middlewares/authMiddlewere.js'

const Router = express.Router()

Router.route('/')
  .get(authMiddlewere.isAuthorized, boardController.getBoards)
  .post(authMiddlewere.isAuthorized, authMiddlewere.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddlewere.isAuthorized, boardController.getDetails)
  .put(authMiddlewere.isAuthorized, boardValidation.update, boardController.update)
  .delete(authMiddlewere.isAuthorized, boardController.deleteBoard)

//Api hỗ trợ cho việc di chuyển card giữa các column
Router.route('/supports/moving_card')
  .put(authMiddlewere.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)

// Board member management APIs
Router.route('/:boardId/members/:userId')
  .delete(authMiddlewere.isAuthorized, boardController.removeMember)

Router.route('/:boardId/members/:userId/role')
  .put(authMiddlewere.isAuthorized, boardController.changeRole)

export const boardRoute = Router