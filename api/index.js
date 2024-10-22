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
    res.send('initial Servidor backend funcionando correctamente');
});

// Configurar socket.io con cors
const io = socketIo(server, {
    cors: {
        origin: '*', // Permitir todos los orígenes, ajusta esto según sea necesario
        methods: ['GET', 'POST'],
        credentials: true,
    },
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

    // Manejar mensajes de texto
    socket.on('message', (message) => {
        socket.broadcast.emit('message', message); // Enviar a todos menos al emisor
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
