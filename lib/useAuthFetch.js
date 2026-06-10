import { useCallback } from 'react'
import { useApp } from '../context/AppContext'

export function useAuthFetch() {
  const { sb, accessToken } = useApp()

  const authFetch = useCallback(async (url, options = {}) => {
    // 1. Token en mémoire React (mis à jour par onAuthStateChange)
    let token = accessToken

    // 2. Fallback getSession (lecture localStorage)
    if (!token) {
      const { data } = await sb.auth.getSession()
      token = data?.session?.access_token
      console.log('[authFetch] getSession result:', data?.session ? 'OK' : 'NULL')
    }

    // 3. Fallback refreshSession (appel réseau vers Supabase)
    if (!token) {
      console.log('[authFetch] tentative refreshSession...')
      const { data: refreshData } = await sb.auth.refreshSession()
      token = refreshData?.session?.access_token
    }

    if (!token) {
      console.log('[authFetch] token ABSENT après 3 tentatives')
      throw new Error('SESSION_MISSING')
    }

    console.log('[authFetch] token utilisé:', token.substring(0, 20))

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })

    if (response.status === 401) {
      console.log('[authFetch] 401 reçu, refresh forcé...')
      const { data: refreshData } = await sb.auth.refreshSession()
      const newToken = refreshData?.session?.access_token

      if (!newToken) throw new Error('SESSION_EXPIRED')

      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...(options.headers || {}),
        },
      })
    }

    return response
  }, [sb, accessToken])

  return { authFetch }
}
