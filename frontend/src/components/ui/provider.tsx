"use client"

import React, { type PropsWithChildren } from "react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "./sonner"

export function CustomProvider(props: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {props.children}
      <Toaster />
    </ThemeProvider>
  )
}
