import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

export default function Logout() {
  useEffect(() => {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    sb.auth.signOut().then(() => { window.location.href = "/" })
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#fff", fontSize: 16 }}>Deconnexion...</p>
    </div>
  )
}
