import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-sm border",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-violet-500/20 border-purple-300/30 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-purple-500/30 hover:via-blue-500/30 hover:to-violet-500/30 hover:scale-105",
        outline:
          "bg-white/10 dark:bg-gray-900/10 border-purple-300/50 dark:border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/50 hover:border-purple-400/70",
        ghost: 
          "bg-transparent border-transparent text-purple-600 dark:text-purple-400 hover:bg-purple-100/30 dark:hover:bg-purple-900/30",
        destructive:
          "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-300/30 dark:border-red-500/30 text-red-700 dark:text-red-300 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-red-600/30 hover:scale-105",
        solid:
          "bg-gradient-to-r from-purple-600 via-blue-600 to-violet-600 border-transparent text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-purple-700 hover:via-blue-700 hover:to-violet-700",
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

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }