const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Configuración del servidor Express
const app = express();
app.use(cors());

const server = http.createServer(app);

// Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Permitir acceso desde cualquier origen
    methods: ["GET", "POST"]
  }
});

// Manejador de conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);
  
  // Enviar el ID del socket actual al cliente
  socket.emit('me', socket.id);

  // Unir a los usuarios a una sala
  socket.on('join', () => {
    console.log('Usuario se unió:', socket.id);
    const partnerId = findPartner(socket.id);
    if (partnerId) {
      // Informar a ambos usuarios que tienen un compañero
      socket.emit('partnerId', partnerId);
      io.to(partnerId).emit('partnerId', socket.id);
    }
  });

  // Manejar el intercambio de señales
  socket.on('signal', (data) => {
    console.log(`Señal recibida de ${socket.id} para ${data.to}`);
    io.to(data.to).emit('signal', { signal: data.signal, from: socket.id });
  });

  // Manejar el intercambio de mensajes
  socket.on('message', (message) => {
    console.log(`Mensaje recibido de ${socket.id}: ${message}`);
    io.emit('message', message); // Envía el mensaje a todos los usuarios conectados
  });

  // Manejar la desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Encuentra un compañero disponible para el chat
const findPartner = (currentSocketId) => {
  const connectedSockets = Array.from(io.sockets.sockets.keys());
  // Filtrar para encontrar otro usuario conectado
  const partnerId = connectedSockets.find(id => id !== currentSocketId);
  return partnerId || null; // Devuelve el ID del compañero o null si no hay nadie
};

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
