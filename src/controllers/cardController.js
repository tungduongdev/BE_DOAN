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

    // Emit socket event khi có cập nhật thành viên card
    if (req.body.incomingMemberInfor) {
      try {
        const io = req.app.get('socketIo');

        // Lấy thông tin user đầy đủ từ database thay vì dựa vào JWT
        const { userModel } = await import('../models/userModel.js');
        const fullUserInfo = await userModel.findOneById(userInfor._id);

        const memberUpdateData = {
          cardId: cardId,
          cardTitle: updatedCard.title,
          boardId: updatedCard.boardId,
          memberAction: req.body.incomingMemberInfor.action,
          userId: req.body.incomingMemberInfor.userId,
          updatedBy: {
            _id: fullUserInfo._id,
            displayName: fullUserInfo.displayName || fullUserInfo.email || 'Unknown User',
            email: fullUserInfo.email,
            avatar: fullUserInfo.avatar
          },
          timestamp: Date.now()
        };

        console.log('Emitting card member update:', memberUpdateData);
        io.emit('BE_CARD_MEMBER_UPDATED', memberUpdateData);
      } catch (socketError) {
        console.error('Error emitting card member update socket:', socketError);
        // Không throw error để không ảnh hưởng đến việc update card chính
      }
    }

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