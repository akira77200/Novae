import { useEffect } from "react"
import { useApp } from '../context/AppContext'

export default function Logout() {
  const { sb } = useApp()
  useEffect(() => {
    if (!sb) return
    sb.auth.signOut().then(() => { window.location.href = "/" })
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#fff", fontSize: 16 }}>Deconnexion...</p>
    </div>
  )
}
