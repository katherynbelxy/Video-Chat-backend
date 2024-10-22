const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://video-chat-frontend-one.vercel.app/', // Cambia por tu frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

app.use(cors());

const users = {};

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  // Cuando un usuario se une, guarda su ID
  socket.on('join', (peerId) => {
    users[socket.id] = peerId;

    // Compartir el ID del compañero con el usuario
    const partnerId = Object.values(users).find(id => id !== peerId);
    if (partnerId) {
      socket.emit('partnerId', partnerId);
      socket.to(Object.keys(users).find(key => users[key] === partnerId)).emit('partnerId', peerId);
    }
  });

  // Limpiar al desconectarse
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
