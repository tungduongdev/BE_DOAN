/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import { columnService } from '../services/columnService.js'

const createNew = async (req, res, next) => {
  try {
    //dieu huong du lieu sang tang service
    const createNewcolumn = await columnService.createNew(req.body)
    //co ket qua thif tra ve phia client
    res.status(StatusCodes.CREATED).json(createNewcolumn)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const updatedColumn = await columnService.update(columnId, req.body)
    res.status(StatusCodes.OK).json(updatedColumn)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const deletedColumn = await columnService.deleteItem(columnId)
    res.status(StatusCodes.OK).json(deletedColumn)
  } catch (error) { next(error) }
}
export const columnController = {
  createNew,
  update,
  deleteItem
}