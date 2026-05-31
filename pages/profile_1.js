// pages/profile.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

const PAYS = ['Canada','France','Belgique','Royaume-Uni','Allemagne','Autre']
const STATUTS = [
  {id:'etudiant',fr:'🎓 Étudiant(e)',en:'🎓 Student'},
  {id:'travailleur',fr:'💼 Travailleur(se)',en:'💼 Worker'},
  {id:'famille',fr:'👨‍👩‍👧 Famille',en:'👨‍👩‍👧 Family'},
  {id:'autre',fr:'👤 Autre',en:'👤 Other'},
]

export default function Profile() {
  const { C, lang, user: contextUser, loading: authLoading } = useApp()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({full_name:'',pays_origine:'',pays_accueil:'',ville_accueil:'',statut:'',date_arrivee:'',universite:'',programme:''})
  const [profileLoading, setProfileLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const getSb = () => createPagesBrowserClient()
  useEffect(() => {
    if (authLoading) return
    if (!contextUser) {
      router.replace('/auth/login')
      return
    }
    setUser(contextUser)
    setProfileLoading(true)
    const sb = getSb()
    sb.from('profiles').select('*').eq('id', contextUser.id).single().then(({ data }) => {
      if (data) setForm({ full_name: data.full_name||contextUser.user_metadata?.full_name||'', pays_origine: data.pays_origine||'', pays_accueil: data.pays_accueil||'', ville_accueil: data.ville_accueil||'', statut: data.statut||'', date_arrivee: data.date_arrivee||'', universite: data.universite||'', programme: data.programme||'' })
      setProfileLoading(false)
    })
  }, [authLoading, contextUser])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const sauvegarder = async () => {
    if (!user) return
    setSaving(true); setError(''); setSaved(false)
    const sb = getSb()
    const { error: e } = await sb.from('profiles').update({...form, updated_at: new Date().toISOString()}).eq('id', user.id)
    if (e) setError(e.message)
    else { setSaved(true); setTimeout(()=>setSaved(false), 3000) }
    setSaving(false)
  }

  const logout = async () => {
    const sb = getSb()
    await sb.auth.signOut()
    router.push('/')
  }

  const jours = form.date_arrivee ? Math.max(0, Math.floor((Date.now()-new Date(form.date_arrivee))/86400000)) : null
  const inp = {width:'100%',padding:'11px 14px',background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:14,outline:'none',boxSizing:'border-box',colorScheme:'dark'}
  const lbl = {display:'block',fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:0.8,marginBottom:7,marginTop:18}
  const chip = (active) => ({padding:'7px 14px',borderRadius:20,border:`1px solid ${active?C.accent+'60':C.border}`,background:active?C.accent+'18':'transparent',color:active?C.accent2:C.muted,fontSize:13,cursor:'pointer'})

  if (authLoading || profileLoading) return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,borderRadius:10,background:C.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',margin:'0 auto 14px'}}>N</div>
        <p style={{color:C.muted,fontSize:14}}>Chargement du profil...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:C.bg,color:C.text,fontFamily:'system-ui,sans-serif'}}>
      <Navbar />
      <main style={{maxWidth:640,margin:'0 auto',padding:'36px 20px 80px'}}>
        <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:`${C.accent}20`,border:`2px solid ${C.accent}40`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22,color:C.accent2,flexShrink:0}}>
            {(form.full_name||user?.email||'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:4}}>{form.full_name||user?.email}</h1>
            <p style={{fontSize:13,color:C.muted}}>{user?.email}{jours!==null&&` · J+${jours}`}</p>
          </div>
        </div>

        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
          <p style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:16}}>{lang==='fr'?'Mes informations':'My Information'}</p>

          <label style={lbl}>{lang==='fr'?'Nom complet':'Full name'}</label>
          <input value={form.full_name} onChange={e=>set('full_name',e.target.value)} style={inp}/>

          <label style={lbl}>{lang==='fr'?"Pays d'origine":'Country of origin'}</label>
          <input value={form.pays_origine} onChange={e=>set('pays_origine',e.target.value)} placeholder="Côte d'Ivoire, Sénégal..." style={inp}/>

          <label style={lbl}>{lang==='fr'?"Pays d'accueil":'Destination'}</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:4}}>
            {PAYS.map(p=><button key={p} onClick={()=>set('pays_accueil',p)} style={chip(form.pays_accueil===p)}>{p}</button>)}
          </div>

          <label style={lbl}>{lang==='fr'?'Ville':'City'}</label>
          <input value={form.ville_accueil} onChange={e=>set('ville_accueil',e.target.value)} placeholder="Montréal, Toronto..." style={inp}/>

          <label style={lbl}>{lang==='fr'?'Statut':'Status'}</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:4}}>
            {STATUTS.map(s=><button key={s.id} onClick={()=>set('statut',s.id)} style={chip(form.statut===s.id)}>{lang==='fr'?s.fr:s.en}</button>)}
          </div>

          <label style={lbl}>{lang==='fr'?"Date d'arrivée":'Arrival date'}</label>
          <input type="date" value={form.date_arrivee} onChange={e=>set('date_arrivee',e.target.value)} style={inp}/>

          <label style={lbl}>{lang==='fr'?'Université':'University'}</label>
          <input value={form.universite} onChange={e=>set('universite',e.target.value)} placeholder="UdeM, McGill..." style={inp}/>

          <label style={lbl}>{lang==='fr'?"Programme d'études":'Program'}</label>
          <input value={form.programme} onChange={e=>set('programme',e.target.value)} placeholder="Informatique, Gestion..." style={inp}/>

          {error&&<div style={{padding:'10px 14px',background:`${C.error}12`,border:`1px solid ${C.error}30`,borderRadius:9,color:C.error,fontSize:13,marginTop:16}}>{error}</div>}
          {saved&&<div style={{padding:'10px 14px',background:`${C.success}12`,border:`1px solid ${C.success}30`,borderRadius:9,color:C.success,fontSize:13,marginTop:16}}>✓ {lang==='fr'?'Profil sauvegardé':'Profile saved'}</div>}

          <button onClick={sauvegarder} disabled={saving} style={{width:'100%',padding:'12px',background:C.accent,border:'none',borderRadius:10,color:'#fff',fontWeight:600,fontSize:15,cursor:saving?'not-allowed':'pointer',opacity:saving?0.7:1,marginTop:22}}>
            {saving?'...':(lang==='fr'?'💾 Sauvegarder':'💾 Save')}
          </button>
        </div>

        <div style={{marginTop:16,textAlign:'center'}}>
          <button onClick={logout} style={{padding:'10px 24px',background:'transparent',border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:14,cursor:'pointer'}}>
            {lang==='fr'?'Déconnexion':'Logout'}
          </button>
        </div>
      </main>
    </div>
  )
}



