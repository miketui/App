import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-basquiat border-2 border-basquiat-blue/30 bg-basquiat-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-basquiat-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basquiat-yellow focus-visible:ring-offset-2 focus-visible:border-basquiat-yellow disabled:cursor-not-allowed disabled:opacity-50 text-basquiat-text transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }