"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  text: string
  size?: number
  className?: string
}

export function QRCodeGenerator({ text, size = 200, className = "" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const generateQRCode = async () => {
      try {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&bgcolor=1f2937&color=ffffff&margin=2`

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          canvas.width = size
          canvas.height = size
          ctx.drawImage(img, 0, 0, size, size)
        }
        img.onerror = () => {
          drawFallbackQR(ctx, size)
        }
        img.src = qrCodeUrl
      } catch (error) {
        console.error("Erro ao gerar QR Code:", error)
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!
        drawFallbackQR(ctx, size)
      }
    }

    generateQRCode()
  }, [text, size])

  const drawFallbackQR = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.fillStyle = "#1f2937"
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = "#ffffff"
    const moduleSize = size / 25

    const pattern = [
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    ]

    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === 1) {
          ctx.fillRect(col * moduleSize + 10, row * moduleSize + 10, moduleSize, moduleSize)
        }
      }
    }
  }

  const downloadQRCode = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "betdreams-qrcode.png"
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const shareQRCode = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (!blob) return

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "betdreams-qrcode.png", { type: "image/png" })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "QR Code BetDreams",
              text: "Escaneie para se cadastrar na BetDreams!",
              files: [file],
            })
            return
          }
        }
        downloadQRCode()
      }, "image/png")
    } catch (error) {
      console.error("Erro ao compartilhar QR Code:", error)
      downloadQRCode()
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-600 rounded-lg bg-gray-800"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={downloadQRCode}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          Baixar
        </button>
        <button
          onClick={shareQRCode}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
        >
          Compartilhar
        </button>
      </div>
    </div>
  )
}
