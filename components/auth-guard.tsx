'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { createApiClient, type UserRole } from './api-client'
import { clearStoredSession, getAccessToken, getStoredSession } from './auth-session'
import { getPublicRuntimeConfig } from './runtime-config'

type AuthGuardProps = {
  children: ReactNode
  allowedRoles: readonly UserRole[]
  loginPath?: string
}

export function AuthGuard({
  children,
  allowedRoles,
  loginPath = '/login',
}: AuthGuardProps): JSX.Element | null {
  const config = getPublicRuntimeConfig()
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: config.apiUrl, getAccessToken }),
    [config.apiUrl],
  )
  const [status, setStatus] = useState<'checking' | 'allowed' | 'blocked'>('checking')

  useEffect(() => {
    let cancelled = false

    async function validateSession(): Promise<void> {
      const session = getStoredSession()
      if (!session) {
        setStatus('blocked')
        window.location.replace(loginPath)
        return
      }

      try {
        const profile = await apiClient.me()
        if (!allowedRoles.includes(profile.user.role)) {
          clearStoredSession()
          setStatus('blocked')
          window.location.replace(loginPath)
          return
        }

        if (!cancelled) setStatus('allowed')
      } catch {
        clearStoredSession()
        if (!cancelled) {
          setStatus('blocked')
          window.location.replace(loginPath)
        }
      }
    }

    void validateSession()

    return () => {
      cancelled = true
    }
  }, [apiClient, allowedRoles, loginPath])

  if (status !== 'allowed') {
    return null
  }

  return <>{children}</>
}
