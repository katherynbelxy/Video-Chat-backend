const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'https://video-chat-frontend-git-main-videochats-projects-ccc910e3.vercel.app/', // URL del frontend
        methods: ["GET", "POST"],
        credentials: true
    }
});


app.use(cors());

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');
    console.log(socket.id);
    socket.on('signal', (data) => {
        socket.to(data.to).emit('signal', {
            signal: data.signal,
            from: socket.id,
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


