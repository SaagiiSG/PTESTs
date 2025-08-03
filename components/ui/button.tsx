"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-md active:scale-95",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:shadow-md active:scale-95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-95 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:shadow-md active:scale-95",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm active:scale-95 dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:scale-95",
        gradient: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xs hover:from-blue-600 hover:to-blue-700 hover:shadow-md active:scale-95",
        gradientYellow: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-xs hover:from-yellow-500 hover:to-yellow-600 hover:shadow-md active:scale-95",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ripple = true, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !loading) {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const id = Date.now()
        
        setRipples(prev => [...prev, { id, x, y }])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id))
        }, 600)
      }
    }

    // If asChild is true, we need to handle the Slot component properly
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          onClick={handleClick}
          disabled={loading || props.disabled}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    // Regular button with animations
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map(({ id, x, y }) => (
          <span
            key={id}
            className="absolute rounded-full bg-white/30 animate-ping"
            style={{
              left: x - 10,
              top: y - 10,
              width: 20,
              height: 20,
              animationDuration: '600ms',
            }}
          />
        ))}
        
        {/* Loading spinner */}
        {loading && (
          <div className="spinner mr-2" />
        )}
        
        {/* Button content */}
        <span className={cn(loading && "opacity-0")}>
          {children}
        </span>
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
