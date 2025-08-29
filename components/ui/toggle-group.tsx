"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@lib/utils"
import { toggleVariants } from "@ui/toggle"

// Contexto para passar variantes e tamanhos
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
})

// Props comuns
type BaseToggleGroupProps = VariantProps<typeof toggleVariants> & {
  children: React.ReactNode
  className?: string
}

// Props ToggleGroup Single
type ToggleGroupSingleProps = BaseToggleGroupProps &
  Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>, "type" | "defaultValue"> & {
    type?: "single"
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }

// Props ToggleGroup Multiple
type ToggleGroupMultipleProps = BaseToggleGroupProps &
  Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>, "type" | "defaultValue"> & {
    type: "multiple"
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
  }

// Componente ToggleGroup Single
const ToggleGroupSingle = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupSingleProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const { type, defaultValue, ...rest } = props // remove type de props para evitar sobrescrever
    return (
      <ToggleGroupPrimitive.Root
        ref={ref}
        type="single"
        defaultValue={defaultValue as string | undefined}
        className={cn("flex items-center justify-center gap-1", className)}
        {...rest}
      >
        <ToggleGroupContext.Provider value={{ variant, size }}>
          {children}
        </ToggleGroupContext.Provider>
      </ToggleGroupPrimitive.Root>
    )
  }
)
ToggleGroupSingle.displayName = "ToggleGroupSingle"

// Componente ToggleGroup Multiple
const ToggleGroupMultiple = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupMultipleProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const { type, defaultValue, ...rest } = props
    return (
      <ToggleGroupPrimitive.Root
        ref={ref}
        type="multiple"
        defaultValue={defaultValue as string[] | undefined}
        className={cn("flex items-center justify-center gap-1", className)}
        {...rest}
      >
        <ToggleGroupContext.Provider value={{ variant, size }}>
          {children}
        </ToggleGroupContext.Provider>
      </ToggleGroupPrimitive.Root>
    )
  }
)
ToggleGroupMultiple.displayName = "ToggleGroupMultiple"

// Wrapper genérico
const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupSingleProps | ToggleGroupMultipleProps>(
  (props, ref) => {
    if (props.type === "multiple") {
      return <ToggleGroupMultiple ref={ref} {...(props as ToggleGroupMultipleProps)} />
    }
    return <ToggleGroupSingle ref={ref} {...(props as ToggleGroupSingleProps)} />
  }
)
ToggleGroup.displayName = "ToggleGroup"

// Props do ToggleGroupItem
type ToggleGroupItemProps = VariantProps<typeof toggleVariants> & {
  value: string
  children: React.ReactNode
  className?: string
} & React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>

// Componente ToggleGroupItem
const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>, ToggleGroupItemProps>(
  ({ className, children, variant, size, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)

    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    )
  }
)
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
