const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

const users = {};

io.on('connection', socket => {
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }
  socket.emit("yourID", socket.id);
  io.sockets.emit("allUsers", users);

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.sockets.emit("allUsers", users);
  })

  socket.on('leaveRoom', (data) => {
    io.to(data.userToCall).emit('endCall', {});
    io.to(data.from).emit('endCall', {});
  })

  socket.on('leaveMeeting', () => {
    delete users[socket.id];
    io.sockets.emit("allUsers", users);
  })



  socket.on("callUser", (data) => {

    io.to(data.userToCall).emit('calling', { signal: data.signalData, from: data.from });
  })

  socket.on("acceptCall", (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  })
});

server.listen(8000, () => console.log('server is running on port 8000'));