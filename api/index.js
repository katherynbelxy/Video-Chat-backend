app.get('/', (req, res) => {
    res.send('Servidor backend funcionando correctamente');
});
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configura CORS para HTTP y WebSocket
const corsOptions = {
    origin: 'https://video-chat-frontend-one.vercel.app', // URL del frontend desplegado en Vercel
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permitir cookies/sesiones
};

// Usa CORS middleware para todas las rutas HTTP
app.use(cors(corsOptions));

// Configura Socket.io con CORS
const io = socketIo(server, {
    cors: {
        origin: 'https://video-chat-frontend-one.vercel.app', // URL del frontend desplegado
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');
    console.log('Socket ID:', socket.id);

    // Escucha evento 'signal' enviado desde el frontend
    socket.on('signal', (data) => {
        console.log(`Enviando señal a ${data.to}`);
        socket.to(data.to).emit('signal', {
            signal: data.signal,
            from: socket.id,
        });
    });

    // Escucha evento de desconexión
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
