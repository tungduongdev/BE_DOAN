import express from 'express'
import { invitationValidation } from '../../validations/invitationValidation.js'
import { invitationController } from '../../controllers/invitationController.js'
import { authMiddlewere } from '../../middlewares/authMiddlewere.js'

const Router = express.Router()

Router.route('/board')
  .post(
    authMiddlewere.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
  )
  //get invitation by user
Router.route('/')
  .get(
    authMiddlewere.isAuthorized,
    invitationController.getInvitations
  )
Router.route('/board/:invitationId')
  .put(
    authMiddlewere.isAuthorized,
    invitationController.updateBoardInvitation
  )

export const invitationRoute = Router
