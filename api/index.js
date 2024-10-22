const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.get('/', (req, res) => {
    res.send('Servidor backend funcionando correctamente');
    res.send('Nativo Servidor backend funcionando correctamente');
});
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'https://video-chat-frontend-one.vercel.app/', // Cambia esto por la URL de tu frontend
        origin: '*', // Permitir todos los orígenes, ajusta esto según sea necesario
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

// Middleware CORS
app.use(cors({
  origin: 'https://video-chat-frontend-one.vercel.app/', // La URL de tu frontend
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type'], // Encabezados permitidos
  credentials: true, // Permitir el uso de credenciales (cookies, tokens, etc.)
}));

const users = {};

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  socket.on('join', (peerId) => {
    users[socket.id] = peerId;

    // Encontrar un compañero disponible y enviar el ID del compañero al cliente
    const partnerId = Object.values(users).find(id => id !== peerId);
    if (partnerId) {
      socket.emit('partnerId', partnerId);
      socket.to(Object.keys(users).find(key => users[key] === partnerId)).emit('partnerId', peerId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
