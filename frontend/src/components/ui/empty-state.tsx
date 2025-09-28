import * as React from 'react'
import { cn } from '@/utils'

const EmptyState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}
    {...props}
  />
))
EmptyState.displayName = 'EmptyState'

const EmptyStateIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-4 text-4xl text-muted-foreground', className)}
    {...props}
  />
))
EmptyStateIcon.displayName = 'EmptyStateIcon'

const EmptyStateTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('mb-2 text-lg font-semibold', className)}
    {...props}
  />
))
EmptyStateTitle.displayName = 'EmptyStateTitle'

const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
EmptyStateDescription.displayName = 'EmptyStateDescription'

export { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription }
