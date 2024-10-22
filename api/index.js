
;const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');
  const cors = require('cors');
  
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: 'https://video-chat-frontend-one.vercel.app', // Cambia esto a tu URL de frontend
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  app.use(cors());
  app.get('/', (req, res) => {
    res.send('3Servidor de Video Chat funcionando');
  })
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
  
    socket.emit('me', socket.id);
    
    socket.on('join', () => {
      console.log('Usuario se unió a la llamada:', socket.id);
      socket.broadcast.emit('partnerId', socket.id);
    });
  
    socket.on('signal', ({ to, signal }) => {
      console.log(`Enviando señal a ${to}:`, signal);
      socket.to(to).emit('signal', { signal, from: socket.id });
    });
  
    socket.on('message', (message) => {
      console.log('Mensaje enviado:', message);
      socket.broadcast.emit('message', message);
    });
  
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });
  
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
  