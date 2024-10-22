const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Middleware para habilitar CORS
app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor backend funcionando correctamente');
});

// Configurar socket.io con cors y habilitar polling
const io = socketIo(server, {
    cors: {
        origin: 'https://video-chat-frontend-one.vercel.app/', // Cambia esto por la URL de tu frontend
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

// Almacena los IDs de los usuarios conectados
const users = {};

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);
    
    // Generar un ID único para cada usuario
    users[socket.id] = socket.id;

    // Enviar el ID del usuario a sí mismo
    socket.emit('me', socket.id);

    // Compartir el ID del compañero con otros usuarios
    socket.on('join', () => {
        const partnerId = Object.keys(users).find(id => id !== socket.id);
        if (partnerId) {
            socket.emit('partnerId', partnerId);
            socket.to(partnerId).emit('partnerId', socket.id);
        }
    });

    // Manejar la señalización
    socket.on('signal', (data) => {
        socket.to(data.to).emit('signal', {
            signal: data.signal,
            from: socket.id,
        });
    });

    // Manejar mensajes
    socket.on('message', (message) => {
        console.log('Mensaje recibido:', message);
        io.emit('message', message); // Reenviar el mensaje a todos los usuarios
    });

    // Limpiar la lista de usuarios desconectados
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        delete users[socket.id];
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
