export const cardMemberNotificationSocket = async (socket) => {
  // Lắng nghe sự kiện khi có người dùng được thêm/xóa khỏi card
  socket.on('FE_CARD_MEMBER_UPDATED', (memberUpdateData) => {
    // Phát thông báo đến tất cả client ngoại trừ client vừa gửi sự kiện
    socket.broadcast.emit('BE_CARD_MEMBER_UPDATED', memberUpdateData)
  })
} 