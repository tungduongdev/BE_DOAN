

export const inviteUserToBoardSocket = async (socket) => {
  // lắng nghe sự kiện từ client
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //cách làm nhanh và đơn giản nhất là: emit ngược  lại một sự kiện cho tất cả các client đang kết nối đến server ngoại trừ client vừa gửi sự kiện này
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}