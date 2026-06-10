import { useCallback } from 'react'
import { useApp } from '../context/AppContext'

export function useAuthFetch() {
  const { sb } = useApp()

  const authFetch = useCallback(async (url, options = {}) => {
    const { data, error } = await sb.auth.getSession()

    if (error || !data?.session?.access_token) {
      throw new Error('SESSION_MISSING')
    }

    const token = data.session.access_token

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (response.status === 401) {
      const { data: refreshData } = await sb.auth.refreshSession()

      if (!refreshData?.session?.access_token) {
        throw new Error('SESSION_EXPIRED')
      }

      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshData.session.access_token}`,
          ...options.headers,
        },
      })

      return retryResponse
    }

    return response
  }, [sb])

  return { authFetch }
}
