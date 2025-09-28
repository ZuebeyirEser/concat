import { type PropsWithChildren } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from './sonner'

export function UIProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
