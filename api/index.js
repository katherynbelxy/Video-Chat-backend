const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

let users = {};

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  // Enviar el ID del usuario conectado
  socket.emit('me', socket.id);

  // Unirse a la sala y asignar compañero
  socket.on('join', () => {
    const userIds = Object.keys(users);
    if (userIds.length === 1) {
      const partnerId = userIds[0];
      users[socket.id] = partnerId;
      users[partnerId] = socket.id;
      socket.emit('partnerId', partnerId);
      io.to(partnerId).emit('partnerId', socket.id);
    } else {
      users[socket.id] = null; // Esperar a otro usuario
    }
  });

  // Manejo de señales (WebRTC)
  socket.on('signal', (data) => {
    const partnerId = users[socket.id];
    if (partnerId) {
      io.to(data.to).emit('signal', { signal: data.signal, from: socket.id });
    }
  });

  // Manejo de mensajes de chat de texto
  socket.on('message', (message) => {
    io.emit('message', message);
  });

  // Desconectar
  socket.on('disconnect', () => {
    const partnerId = users[socket.id];
    if (partnerId) {
      io.to(partnerId).emit('partnerId', null);
      users[partnerId] = null;
    }
    delete users[socket.id];
  });
});

server.listen(5000, () => {
  console.log('Servidor escuchando en el puerto 5000');
});
