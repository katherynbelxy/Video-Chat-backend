const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
app.get('/', (req, res) => {
    res.send('Servidor backend funcionando correctamente2');
});
// Configurar socket.io con cors y habilitar polling
const io = socketIo(server, {
    cors: {
        origin: 'https://video-chat-frontend-one.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'], // Asegúrate de incluir 'websocket' aquí
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');
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
