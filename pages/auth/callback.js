import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useApp } from '../../context/AppContext'

export default function AuthCallback() {
  const router = useRouter()
  const { sb } = useApp()

  useEffect(() => {
    if (!sb) return
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
      else router.replace('/auth/login')
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#fff', fontSize: 16 }}>Connexion en cours...</p>
    </div>
  )
}
