// app/scripts/socket/io.ts
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

httpServer.listen(4000, () => {
  console.log('🟢 Socket.IO rodando na porta 4000')
})

export default io
