const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const mongoUrl = "mongodb+srv://test:boond@cluster0.4y4rngu.mongodb.net/ByteBond";
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000','https://bytebond.vercel.app'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

mongoose.connect(mongoUrl);
const messageSchema = new mongoose.Schema(
  {
    roomid: String,
    sender: String,
    message: String,
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('a user connected ' + socket.id);

  socket.on('join_room', (data) => {
    console.log('joining room ' + data.roomid);
    socket.join(data.roomid);
    const room = io.sockets.adapter.rooms.get(data.roomid);
    io.to(data.roomid).emit('online', {
      size: room.size,
    });
  });

  socket.on('data_send', (data) => {
    console.log(data);
    io.to(data.roomid).emit('data_receive', data);
    const newMessage = new Message(data);
    newMessage.save();
  });

  socket.on('typing', (data) => {
    io.to(data.roomid).emit('typing_recived', data);
  });

  socket.on('disconnect', () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      const currentRoom = io.sockets.adapter.rooms.get(room);
      if (currentRoom) {
        io.to(room).emit('online', {
          size: currentRoom.size,
        });
      }
    });
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
