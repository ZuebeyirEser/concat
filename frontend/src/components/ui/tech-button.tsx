import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const techButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-mono font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:scale-105 border-0 rounded-lg",
        outline:
          "border-2 border-purple-500 bg-transparent text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg shadow-sm hover:shadow-md",
        ghost: 
          "bg-transparent text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 border-0 rounded-lg",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 shadow-md hover:shadow-lg hover:scale-105 border-0 rounded-lg",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TechButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof techButtonVariants> {
  asChild?: boolean
}

const TechButton = React.forwardRef<HTMLButtonElement, TechButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(techButtonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
          textShadow: variant === 'default' ? '1px 1px 0px rgba(0,0,0,0.3)' : 'none',
          letterSpacing: '0.05em',
        }}
        {...props}
      />
    )
  }
)
TechButton.displayName = "TechButton"

export { TechButton, techButtonVariants }