

import { StatusCodes } from 'http-status-codes'
import express from 'express'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: ' get: API GET LIST BOARDS' })
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: ' POST: API V1 get list board' })
  })
export const boardRoutes = Router