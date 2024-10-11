"use client"
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './components/theme-provider';

function Providers({children}:{children:React.ReactNode}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}

export default Providers;