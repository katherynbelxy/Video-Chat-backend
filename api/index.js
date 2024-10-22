const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
app.get('/', (req, res) => {
    res.send('Servidor backend funcionando correctamente');
});
// Configuración de socket.io con CORS
const io = socketIo(server, {
    cors: {
        origin: 'https://video-chat-frontend-one.vercel.app', // URL de tu frontend
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Permitir cookies/sesiones

    }
});

// Middleware CORS
app.use(cors());

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);

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
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
