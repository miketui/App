import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-basquiat text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 font-semibold tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-basquiat-yellow text-basquiat-bg border-basquiat-yellow hover:bg-basquiat-yellow/90 hover:border-basquiat-yellow/90",
        destructive: "bg-basquiat-red text-basquiat-text border-basquiat-red hover:bg-basquiat-red/90 hover:border-basquiat-red/90",
        outline: "border-basquiat-blue text-basquiat-blue bg-transparent hover:bg-basquiat-blue hover:text-basquiat-bg",
        secondary: "bg-basquiat-teal text-basquiat-bg border-basquiat-teal hover:bg-basquiat-teal/90 hover:border-basquiat-teal/90",
        ghost: "border-transparent text-basquiat-text hover:bg-basquiat-surface hover:text-basquiat-text",
        link: "border-transparent text-basquiat-blue underline-offset-4 hover:underline",
        gradient: "basquiat-gradient text-basquiat-bg border-transparent hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }