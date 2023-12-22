// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('a user connected ' + socket.id);

  socket.on('join_room', (data) => {
    console.log('joining room ' + data.roomid);
    socket.join(data.roomid);
  });

  socket.on('data_send', (data) => {
    console.log(data);
    io.to(data.roomid).emit('data_receive', data);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
