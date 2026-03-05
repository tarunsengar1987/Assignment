'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'
import React, { useState, useEffect } from 'react'

export function Provider(props: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider 
        attribute="class" 
        disableTransitionOnChange
        enableSystem
        defaultTheme="light"
      >
        {mounted ? props.children : <div style={{ visibility: 'hidden' }}>{props.children}</div>}
      </ThemeProvider>
    </ChakraProvider>
  )
}
