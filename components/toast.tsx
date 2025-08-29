// components/ui/toast.tsx
"use client"

import * as React from "react"

export interface ToastProps {
  title?: string
  description?: string
}

export function Toast({ title, description }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 rounded-lg bg-black text-white p-4 shadow-lg">
      {title && <strong className="block">{title}</strong>}
      {description && <span>{description}</span>}
    </div>
  )
}
