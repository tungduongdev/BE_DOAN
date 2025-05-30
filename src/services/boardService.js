/* eslint-disable no-useless-catch */
import { slugify } from '../utils/formater.js'
import { boardModel } from '../models/boardModel.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import lodash from 'lodash'
import { columnModel } from '../models/columnModel.js'
import { cardModel } from '../models/cardModel.js'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '../utils/constants.js'

/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
*/
const { cloneDeep } = lodash
const createNew = async (userId, reqBody) => {
  //xu li logic du lieu
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    // goi toi tang model de luu vao database
    const createdBoard = await boardModel.createNew(userId, newBoard)
    //lay ban ghi baord moi tao ra va tra ve cho controller
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    //luon phai co return neu khong request se bi treo(chay mai mai) 
    return getNewBoard
  } catch (error) {
    throw error
  }
}
const getDetails = async (userId, boardId) => {
  //xu li logic du lieu
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    const resBoard = cloneDeep(board)
    //dua card ve dung column cua no
    resBoard.columns.forEach(column => {
      // mongo dv support ham equals de so sanh 2 object id
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
      //covert object id sang string de so sanh
      //column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    //xoa card trong board
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  //xu li logic du lieu
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updatedData)
    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  //xu li logic du lieu
  try {
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    await columnModel.update(reqBody.nexrColumnId, {
      cardOrderIds: reqBody.nexrCardOrderIds,
      updatedAt: Date.now()
    })
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })
    return {}
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const result = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10), queryFilters)
    return result
  } catch (error) {
    throw error
  }
}

const deleteBoard = async (boardId) => {
  try {
    const result = await boardModel.deleteBoard(boardId)
    return result
  } catch (error) {
    throw error
  }
}

const removeBoardMember = async (boardId, userId, requesterId) => {
  try {
    // Check if requester is owner of the board
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const isRequesterOwner = board.ownerIds.some(ownerId => ownerId.toString() === requesterId)
    if (!isRequesterOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only board owners can remove members!')
    }

    // Cannot remove yourself
    if (userId === requesterId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot remove yourself from the board!')
    }

    // Remove member from board
    const updatedBoard = await boardModel.removeMember(boardId, userId)
    if (!updatedBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to remove member!')
    }

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const changeBoardMemberRole = async (boardId, userId, newRole, requesterId) => {
  try {
    // Check if requester is owner of the board
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const isRequesterOwner = board.ownerIds.some(ownerId => ownerId.toString() === requesterId)
    if (!isRequesterOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only board owners can change member roles!')
    }

    // Cannot change your own role
    if (userId === requesterId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot change your own role!')
    }

    // Validate new role
    if (!['OWNER', 'MEMBER'].includes(newRole)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role! Must be OWNER or MEMBER')
    }

    // Change user role
    const updatedBoard = await boardModel.changeUserRole(boardId, userId, newRole)
    if (!updatedBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to change member role!')
    }

    return updatedBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteBoard,
  removeBoardMember,
  changeBoardMemberRole
}