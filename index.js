const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
// const socketio = require('socket.io');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});


const PORT = process.env.PORT || 8000;

// const cors = require('cors');
// app.use(cors());

// const io = socketio(server);


const users = {};
const userDetails ={};

io.on('connection', socket => {
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }

  socket.on('addMyId', (data)=>{
    if (!userDetails[socket.id]) {
      userDetails[socket.id] = data.myId;
    }
    io.sockets.emit('allUserDetails' ,userDetails );

  })

  socket.emit("yourID", socket.id);
  io.sockets.emit("allUsers", users);

  socket.on('disconnect', () => {
    delete users[socket.id];
    delete userDetails[socket.id];
    io.sockets.emit("allUsers", users);
    io.sockets.emit('allUserDetails' ,userDetails );

  })

  socket.on('leaveRoom', (data) => {
    io.to(data.userToCall).emit('endCall', {});
    io.to(data.from).emit('endCall', {});
  })

  socket.on('leaveMeeting', () => {
    delete users[socket.id];
    delete userDetails[socket.id];
    io.sockets.emit("allUsers", users);
    io.sockets.emit('allUserDetails' ,userDetails );

  })



  socket.on("callUser", (data) => {

    io.to(data.userToCall).emit('calling', { signal: data.signalData, from: data.from });
  })

  socket.on("acceptCall", (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  })
});

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));