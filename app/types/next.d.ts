// types/next.ts

import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'
import type { NextApiResponse } from 'next'

/**
 * Tipagem personalizada para permitir o uso do Socket.IO no objeto `res.socket.server`
 * em rotas API do Next.js.
 */
export type NextApiResponseServerIO = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io: IOServer
    }
  }
}
