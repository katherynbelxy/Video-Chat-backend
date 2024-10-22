const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Importar cors

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurar CORS
app.use(cors({
    origin: 'https://video-chat-frontend-one.vercel.app',  // URL de tu frontend
    methods: ['GET', 'POST'],
    credentials: true // Si necesitas enviar cookies
}));
app.get('/', (req, res) => {
  res.send('Servidor de Video Chat funcionando');
});

let users = {};

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    // Almacena la ID del usuario
    users[socket.id] = socket.id;

    socket.emit('me', socket.id);
    socket.broadcast.emit('partnerId', socket.id);

    socket.on('join', () => {
        console.log('Usuario se unió:', socket.id);
    });

    socket.on('signal', (data) => {
        console.log('Señal enviada a:', data.to);
        socket.to(data.to).emit('signal', { signal: data.signal, from: socket.id });
    });

    socket.on('message', (message) => {
        console.log('Mensaje enviado:', message);
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        delete users[socket.id];
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
