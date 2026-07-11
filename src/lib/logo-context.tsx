'use client'

import { createContext, useContext } from 'react'

const LogoContext = createContext<string>('/logo.png')

export function LogoProvider({ logoUrl, children }: { logoUrl: string | null; children: React.ReactNode }) {
  return (
    <LogoContext.Provider value={logoUrl || '/logo.png'}>
      {children}
    </LogoContext.Provider>
  )
}

export function useLogo() {
  return useContext(LogoContext)
}
