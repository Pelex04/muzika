'use client'

import { createContext, useContext } from 'react'

interface ProfileCtx {
  avatarUrl: string | null
  avatarInitial: string
}

const ProfileContext = createContext<ProfileCtx>({ avatarUrl: null, avatarInitial: '?' })

export function ProfileProvider({
  avatarUrl,
  avatarInitial,
  children,
}: ProfileCtx & { children: React.ReactNode }) {
  return (
    <ProfileContext.Provider value={{ avatarUrl, avatarInitial }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
