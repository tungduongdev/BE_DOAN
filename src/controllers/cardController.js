import { StatusCodes } from 'http-status-codes'
import { cardService } from '../services/cardService.js'

const createNew = async (req, res, next) => {
  try {
    //dieu huong du lieu sang tang service
    const createNewcard = await cardService.createNew(req.body)
    //co ket qua thif tra ve phia client
    res.status(StatusCodes.CREATED).json(createNewcard)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfor = req.jwtDecoded
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, userInfor)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const result = await cardService.deleteItem(cardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update,
  deleteItem
}