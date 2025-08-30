import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-basquiat border-2 border-basquiat-blue/30 bg-basquiat-surface px-3 py-2 text-sm ring-offset-background placeholder:text-basquiat-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basquiat-yellow focus-visible:ring-offset-2 focus-visible:border-basquiat-yellow disabled:cursor-not-allowed disabled:opacity-50 text-basquiat-text transition-colors resize-vertical",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }