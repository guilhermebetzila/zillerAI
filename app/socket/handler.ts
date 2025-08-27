import { Server } from 'socket.io';

export function socketHandler(io: Server) {
  io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });

    // Exemplo: evento personalizado
    socket.on('mensagem', (data) => {
      console.log('Mensagem recebida:', data);
      io.emit('mensagem', data);
    });
  });
}
