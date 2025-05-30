/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes'
import { boardService } from '../services/boardService.js'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    //dieu huong du lieu sang tang service
    const createNewBoard = await boardService.createNew(userId, req.body)
    //co ket qua thif tra ve phia client
    res.status(StatusCodes.CREATED).json(createNewBoard)
  } catch (error) { next(error) }
}
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    //consp;pg req.params.id de lay id tu client
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // page va itemsPerPage được truyền thông qua query params
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    const result = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deleteBoard = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const result = await boardService.deleteBoard(boardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const removeMember = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const userId = req.params.userId
    const requesterId = req.jwtDecoded._id

    const result = await boardService.removeBoardMember(boardId, userId, requesterId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const changeRole = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const userId = req.params.userId
    const { newRole } = req.body
    const requesterId = req.jwtDecoded._id

    const result = await boardService.changeBoardMemberRole(boardId, userId, newRole, requesterId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteBoard,
  removeMember,
  changeRole
}