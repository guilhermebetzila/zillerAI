// components/ui/toast.d.ts
import * as React from "react"

declare module "@/components/ui/toast" {
  export interface ToastProps {
    title?: string
    description?: string
  }

  export function Toast(props: ToastProps): React.JSX.Element
}
