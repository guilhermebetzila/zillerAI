import { Server as IOServer } from 'socket.io';

let io: IOServer;

export function initSocket(server: any) {
  io = new IOServer(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);
  });
}

export function getIO() {
  if (!io) throw new Error('Socket.io não inicializado!');
  return io;
}
