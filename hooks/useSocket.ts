import { useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = () => {
  const socket = useRef<Socket | null>(null)

  useEffect(() => {
    socket.current = io('http://localhost:4000') // porta do server.ts

    return () => {
      socket.current?.disconnect()
    }
  }, [])

  return socket
}
