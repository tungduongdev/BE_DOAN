/* eslint-disable no-useless-catch */
import { slugify } from '../utils/formater.js'
import { cardModel } from '../models/cardModel.js'
import { columnModel } from '../models/columnModel.js'
import { CloudinaryProvider } from '../providers/CloudinaryProvider.js'

const createNew = async (reqBody) => {
  //xu li logic du lieu
  try {
    console.log('Data before validation:', reqBody)
    const newCard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    // goi toi tang model de luu vao database
    const createdCard = await cardModel.createNew(newCard)
    //lay ban ghi baord moi tao ra va tra ve cho controller
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    //luon phai co return neu khong request se bi treo(chay mai mai)
    if (getNewCard) {
      await columnModel.pushCardOderIds(getNewCard)
    }
    console.log(getNewCard)
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, updatedData, cardCoverFile, userInfor) => {
  try {
    const updatedCardData = {
      ...updatedData,
      updateAt: Date.now()
    }

    let updatedCard = {}
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      console.log('uploadResult', uploadResult)

      //lưu lại url của file ảnh vào db
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updatedData.commentToAdd) {
      const commentToAdd = {
        ...updatedData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfor._id,
        userEmail: userInfor.email,
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentToAdd)
    } else if (updatedData.incomingMemberInfor) {
      updatedCard = await cardModel.updateMembers(cardId, updatedData.incomingMemberInfor)
    } else {
      updatedCardData.cardCover = null
      updatedCard = await cardModel.update(cardId, updatedCardData)
    }
    return updatedCard
  } catch (error) {
    throw error
  }
}

const deleteItem = async (cardId) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new Error('Card not found!')
    }

    // Delete the card
    await cardModel.deleteOneById(cardId)

    return { deleteResult: 'Card deleted successfully!' }
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update,
  deleteItem
}