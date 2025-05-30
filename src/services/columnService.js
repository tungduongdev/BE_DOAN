/* eslint-disable no-useless-catch */
import { slugify } from '../utils/formater.js'
import { columnModel } from '../models/columnModel.js'
import { boardModel } from '../models/boardModel.js'
import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import lodash from 'lodash'
const { cloneDeep } = lodash

import { cardModel } from '../models/cardModel.js'

/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
const createNew = async (reqBody) => {
  //xu li logic du lieu
  try {
    const newColumn = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    // goi toi tang model de luu vao database
    const createdColumn = await columnModel.createNew(newColumn)
    //lay ban ghi baord moi tao ra va tra ve cho controller
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    //luon phai co return neu khong request se bi treo(chay mai mai)
    if (getNewColumn) {
      getNewColumn.cards = []
      await boardModel.pushColumnIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) {
    throw error
  }
}
const update = async (columnId, reqBody) => {
  //xu li logic du lieu
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updatedData)
    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    const taggerColumn = await columnModel.findOneById(columnId)
    if (!taggerColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    await columnModel.deleteOneById(columnId)
    await cardModel.deleteManyByColumnId(columnId)
    await boardModel.pullColumnIds(taggerColumn)
    return { deleteResult: 'delete column successfully!' }
  }
  catch (error) {
    throw error
  }
}


export const columnService = {
  createNew,
  update,
  deleteItem
}