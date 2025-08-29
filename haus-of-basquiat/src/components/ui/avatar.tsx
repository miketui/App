import * as React from "react"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg'
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border-2 border-basquiat-yellow",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            className="aspect-square h-full w-full object-cover"
            src={src}
            alt={alt || "Avatar"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-basquiat-surface text-basquiat-text font-semibold">
            {fallback || getInitials(alt || "User")}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }