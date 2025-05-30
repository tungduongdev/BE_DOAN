import { StatusCodes } from 'http-status-codes'
import express from 'express'
import { boardRoute } from './boardRoute.js'
import { columnRoute } from './columnRoute.js'
import { cardRoute } from './cardRoute.js'
import { userRoute } from './userRoute.js'
import { invitationRoute } from './invitationRoute.js'
import { chatRoute } from './chatRoute.js'

const Router = express.Router()

//check API status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: ' API V1 are ready to use' })
})

//boards APIs
Router.use('/boards', boardRoute)
//column APIs
Router.use('/columns', columnRoute)
//card APIs
Router.use('/cards', cardRoute)
//user APIs
Router.use('/users', userRoute)

Router.use('/invitations', invitationRoute)

Router.use('/chat', chatRoute)

export const APIs_v1 = Router