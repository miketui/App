import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-basquiat-yellow bg-basquiat-yellow text-basquiat-bg",
        secondary: "border-basquiat-blue bg-basquiat-blue text-basquiat-text",
        destructive: "border-basquiat-red bg-basquiat-red text-basquiat-text",
        success: "border-basquiat-teal bg-basquiat-teal text-basquiat-bg",
        outline: "border-basquiat-blue text-basquiat-blue bg-transparent",
        ghost: "border-transparent bg-basquiat-surface text-basquiat-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }