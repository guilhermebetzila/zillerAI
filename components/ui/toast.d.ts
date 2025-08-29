// components/ui/toast.d.ts
import * as React from "react"

export type ToastActionElement = {
  label: string
  onClick: () => void
}

export type ToastProps = {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
