// pages/parrainage.js — NOVAE v5 — Système de parrainage bénévole
import { useState, useEffect, useRef } from 'react'

import { useApp } from '../context/AppContext'
import { useAuthFetch } from '../lib/useAuthFetch'

// ── Helpers ───────────────────────────────────────────────────────
const moisDepuis = (dateStr) => {
  if (!dateStr) return null
  const d    = new Date(dateStr)
  const now  = new Date()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24 * 30.44))
}

const SUJETS_OPTIONS = [
  { id: 'Logement',    fr: 'Logement',    en: 'Housing',    icon: '🏠' },
  { id: 'Banque',      fr: 'Banque',      en: 'Banking',    icon: '🏦' },
  { id: 'Transport',   fr: 'Transport',   en: 'Transit',    icon: '🚇' },
  { id: 'Université',  fr: 'Université',  en: 'University', icon: '🎓' },
  { id: 'Emploi',      fr: 'Emploi',      en: 'Employment', icon: '💼' },
  { id: 'Culture',     fr: 'Culture',     en: 'Culture',    icon: '🌍' },
  { id: 'RAMQ/OHIP',   fr: 'RAMQ/OHIP',  en: 'Healthcare', icon: '🏥' },
  { id: 'NAS',         fr: 'NAS',         en: 'SIN',        icon: '🪪' },
  { id: 'Impôts',      fr: 'Impôts',      en: 'Taxes',      icon: '📊' },
]

const DISPOS = [
  { id: '1-2h/semaine',         fr: '1–2h / semaine', en: '1–2h / week' },
  { id: '3-5h/semaine',         fr: '3–5h / semaine', en: '3–5h / week' },
  { id: 'Quand j\'ai le temps', fr: 'Quand j\'ai le temps', en: 'When I have time' },
]

// ── Page ──────────────────────────────────────────────────────────
export default function Parrainage() {
  const { C, lang, user, profile, loading: authLoading, sb } = useApp()
  const { authFetch } = useAuthFetch()

  const hasFetched = useRef(false)
  const [onglet,     setOnglet]     = useState('trouver')
  const [parrains,   setParrains]   = useState([])
  const [mesFilleuls,setMesFilleuls]= useState([])
  const [dejaParrain,setDejaParrain]= useState(false)
  const [ready,      setReady]      = useState(false)

  // Modal demande
  const [modalParrain, setModalParrain] = useState(null)
  const [msgModal,     setMsgModal]     = useState('')
  const [sending,      setSending]      = useState(false)
  const [sentTo,       setSentTo]       = useState(new Set())

  // Formulaire devenir parrain
  const [sujets,    setSujets]    = useState([])
  const [dispo,     setDispo]     = useState('1-2h/semaine')
  const [saving,    setSaving]    = useState(false)
  const [savedOk,   setSavedOk]   = useState(false)

  const moisArriv = moisDepuis(profile?.date_arrivee)

  const [premiereVisite, setPremiereVisite] = useState(false)
  useEffect(() => {
    try {
      if (!localStorage.getItem('novae_parrainage_visite')) {
        setPremiereVisite(true)
        localStorage.setItem('novae_parrainage_visite', '1')
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (authLoading || !sb) return
    if (hasFetched.current) return
    hasFetched.current = true
    charger()
  }, [authLoading, user?.id])

  const charger = async () => {
    try {
      // Parrains disponibles (niveau etudiant, actif, gratuit)
      const { data: parrainData } = await sb
        .from('mentors')
        .select('*')
        .eq('actif', true)
        .eq('disponible', true)
        .eq('niveau', 'etudiant')
        .eq('tarif_30min', 0)

      setParrains(parrainData || [])

      if (user) {
        // Vérifie si déjà parrain
        const { data: moi } = await sb.from('mentors').select('id').eq('user_id', user.id).eq('niveau', 'etudiant').single()
        setDejaParrain(!!moi)

        // Mes filleuls (si parrain)
        if (moi) {
          const { data: filleulsData } = await sb
            .from('parrainages')
            .select('*, profiles:filleul_id(full_name, ville_accueil, pays_origine, date_arrivee)')
            .eq('parrain_id', user.id)
          setMesFilleuls(filleulsData || [])
        }
      }
    } catch (e) { console.error(e) }
    finally { setReady(true) }
  }

  // Filtre parrains par ville
  const ville          = (profile?.ville_accueil || '').toLowerCase().split(',')[0].trim()
  const parrainsVille  = parrains.filter(p => (p.ville_accueil || '').toLowerCase().includes(ville) && ville)
  const parrainsAutres = parrains.filter(p => !parrainsVille.includes(p))
  const listeAffichee  = parrainsVille.length > 0 ? parrainsVille : parrainsAutres

  const demanderParrainage = async () => {
    if (!modalParrain || sending) return
    setSending(true)
    try {
      const res = await authFetch('/api/parrainages/demander', {
        method: 'POST',
        body:   JSON.stringify({ parrain_id: modalParrain.user_id, message: msgModal }),
      })
      if (res.ok) {
        setSentTo(p => new Set([...p, modalParrain.id]))
        setModalParrain(null)
        setMsgModal('')
      }
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  const devenirParrain = async () => {
    if (!sujets.length || saving) return
    setSaving(true)
    try {
      const res = await authFetch('/api/parrainages/devenir', {
        method: 'POST',
        body:   JSON.stringify({ sujets, disponibilite: dispo }),
      })
      if (res.ok) { setSavedOk(true); setDejaParrain(true) }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const toggleSujet = (id) => setSujets(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  // ── Gate auth ──────────────────────────────────────────────────
  if (!user && !authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'system-ui,sans-serif' }}>

      <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>🤝</p>
        <p style={{ fontSize: 16, color: 'var(--text-h1)', fontWeight: 600, marginBottom: 8 }}>{lang === 'fr' ? 'Connexion requise' : 'Login required'}</p>
        <a href="/auth/login" style={{ padding: '10px 24px', background: 'var(--btn-primary-bg)', borderRadius: 9, color: 'var(--bg-page)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          {lang === 'fr' ? 'Se connecter →' : 'Log in →'}
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-h1)', fontFamily: 'system-ui,sans-serif' }}>


      {/* ── Modal demande parrainage ── */}
      {modalParrain && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setModalParrain(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 420, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-h1)' }}>
                {lang === 'fr' ? `Demander à ${modalParrain.full_name}` : `Ask ${modalParrain.full_name}`}
              </p>
              <button onClick={() => setModalParrain(null)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>✕</button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                {lang === 'fr'
                  ? 'Présente-toi brièvement et explique pourquoi tu aimerais être en contact.'
                  : 'Briefly introduce yourself and explain why you\'d like to connect.'}
              </p>
              <textarea value={msgModal} onChange={e => setMsgModal(e.target.value)}
                placeholder={lang === 'fr' ? 'ex. Bonjour, je suis arrivé à Montréal il y a 2 semaines...' : 'e.g. Hi, I arrived in Montreal 2 weeks ago...'}
                rows={4}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-h1)', fontSize: 13, marginBottom: 16, boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'system-ui,sans-serif' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModalParrain(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button onClick={demanderParrainage} disabled={sending}
                  style={{ flex: 2, padding: '10px', background: sending ? 'var(--border)' : 'var(--btn-primary-bg)', border: 'none', borderRadius: 9, color: 'var(--bg-page)', fontWeight: 600, fontSize: 13, cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? '...' : (lang === 'fr' ? 'Envoyer la demande →' : 'Send request →')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Header */}
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-h1)', letterSpacing: -0.5, marginBottom: 4 }}>
          🤝 {lang === 'fr' ? 'Parrainage bénévole' : 'Peer Mentoring'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          {lang === 'fr'
            ? 'Des nouveaux arrivants qui ont vécu ce que tu vis, prêts à t\'aider gratuitement.'
            : 'Newcomers who lived what you\'re living, ready to help you for free.'}
        </p>

        {/* ── Comment ça marche (première visite) ── */}
        {premiereVisite && (
          <div style={{ padding: '20px 22px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 24 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-h1)', marginBottom: 16 }}>
              {lang === 'fr' ? '💡 Comment ça marche ?' : '💡 How does it work?'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { n: '1', fr: 'Trouve un parrain qui vit dans ta ville ou a étudié dans ton université.', en: 'Find a peer mentor who lives in your city or studied at your university.' },
                { n: '2', fr: 'Envoie-lui un message de présentation — explique ton projet et tes besoins.', en: 'Send them an intro message — explain your project and needs.' },
                { n: '3', fr: 'Échangez en ligne ou en personne. C\'est gratuit, bénévole, sans engagement.', en: 'Connect online or in person. Free, volunteer-based, no commitment.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--btn-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--bg-page)', flexShrink: 0 }}>{s.n}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, paddingTop: 4 }}>{lang === 'fr' ? s.fr : s.en}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setPremiereVisite(false)} style={{ marginTop: 14, background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
              {lang === 'fr' ? 'Masquer' : 'Hide'}
            </button>
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
          {[
            { id: 'trouver',  fr: '🔍 Trouver un parrain',    en: '🔍 Find a mentor'       },
            { id: 'devenir',  fr: '⭐ Devenir parrain',        en: '⭐ Become a mentor'     },
          ].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: onglet === o.id ? 'var(--btn-primary-bg)' : 'transparent', color: onglet === o.id ? 'var(--bg-page)' : 'var(--text-muted)' }}>
              {lang === 'fr' ? o.fr : o.en}
            </button>
          ))}
        </div>

        {/* ═══════════ ONGLET TROUVER ═══════════ */}
        {onglet === 'trouver' && (
          <>
            {/* Concept */}
            <div style={{ padding: '16px 18px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: 'var(--text-h1)', lineHeight: 1.7 }}>
                {lang === 'fr'
                  ? '💡 Un parrain est un nouveau arrivant installé avant toi dans la même ville. Il partage son expérience gratuitement et bénévolement — quelques messages suffisent.'
                  : '💡 A peer mentor is a newcomer who settled before you in the same city. They share their experience for free — a few messages is all it takes.'}
              </p>
            </div>

            {/* Contexte ville */}
            {ville && parrainsVille.length > 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                📍 {lang === 'fr' ? `${parrainsVille.length} parrain(s) disponible(s) à ${profile?.ville_accueil}` : `${parrainsVille.length} mentor(s) available in ${profile?.ville_accueil}`}
              </p>
            )}

            {!ready ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
            ) : listeAffichee.length === 0 ? (
              /* Aucun parrain */
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
                <p style={{ fontSize: 36, marginBottom: 14 }}>🤝</p>
                <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-h1)', marginBottom: 8 }}>
                  {lang === 'fr'
                    ? `Pas encore de parrain disponible à ${profile?.ville_accueil || 'ta ville'}.`
                    : `No mentor available yet in ${profile?.ville_accueil || 'your city'}.`}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                  {lang === 'fr' ? 'Veux-tu devenir le premier ?' : 'Do you want to be the first?'}
                </p>
                <button onClick={() => setOnglet('devenir')}
                  style={{ padding: '10px 22px', background: 'var(--btn-primary-bg)', border: 'none', borderRadius: 9, color: 'var(--bg-page)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {lang === 'fr' ? 'Devenir parrain →' : 'Become a mentor →'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {listeAffichee.map(p => {
                  const moisM   = p.annee_arrivee ? Math.floor((new Date().getFullYear() - p.annee_arrivee) * 12) : null
                  const isSent  = sentTo.has(p.id)
                  const sujets  = Array.isArray(p.sujets) ? p.sujets : []
                  const memeUniv = profile?.universite && p.bio?.toLowerCase().includes((profile.universite || '').toLowerCase().split(' ')[0])

                  return (
                    <div key={p.id} style={{ background: 'var(--bg-card)', border: `1px solid ${memeUniv ? 'var(--btn-primary-bg)' : 'var(--border)'}`, borderRadius: 14, padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                        {/* Avatar */}
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--text-body)', flexShrink: 0 }}>
                          {(p.full_name || '?')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-h1)' }}>{p.full_name}</p>
                            {memeUniv && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-subtle)', color: 'var(--text-body)' }}>{lang === 'fr' ? 'MÊME UNIV.' : 'SAME UNIV.'}</span>}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                            🌍 {p.pays_origine} → 📍 {p.ville_accueil}
                          </p>
                          {moisM !== null && (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {lang === 'fr' ? `Membre depuis ${moisM} mois` : `Member for ${moisM} months`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Sujets */}
                      {sujets.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                          {sujets.map(s => (
                            <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-subtle)', color: 'var(--text-body)', border: '1px solid var(--border)' }}>
                              {SUJETS_OPTIONS.find(o => o.id === s)?.icon || '·'} {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bio / dispo */}
                      {p.bio && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>⏱ {p.bio}</p>}

                      <button
                        onClick={() => !isSent && user && setModalParrain(p)}
                        disabled={isSent || !user}
                        style={{ padding: '9px 20px', background: isSent ? 'var(--text-h1)' : 'var(--btn-primary-bg)', border: 'none', borderRadius: 9, color: 'var(--bg-page)', fontWeight: 600, fontSize: 13, cursor: isSent || !user ? 'default' : 'pointer', opacity: !user ? 0.5 : 1 }}>
                        {isSent
                          ? (lang === 'fr' ? '✓ Demande envoyée' : '✓ Request sent')
                          : (lang === 'fr' ? 'Demander un parrainage →' : 'Request mentoring →')}
                      </button>
                      {!user && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{lang === 'fr' ? 'Connecte-toi pour envoyer une demande.' : 'Log in to send a request.'}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ═══════════ ONGLET DEVENIR PARRAIN ═══════════ */}
        {onglet === 'devenir' && (
          <>
            {/* Éligibilité */}
            {moisArriv !== null && moisArriv < 6 && (
              <div style={{ padding: '14px 18px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {lang === 'fr'
                    ? `⏳ Tu es arrivé(e) il y a ${moisArriv} mois. Le parrainage est recommandé après 6 mois d'expérience — mais tu peux déjà t'inscrire !`
                    : `⏳ You arrived ${moisArriv} months ago. Mentoring is recommended after 6 months — but you can already sign up!`}
                </p>
              </div>
            )}

            {/* Déjà parrain */}
            {dejaParrain && !savedOk ? (
              <div style={{ padding: '20px 22px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 24 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-h1)', marginBottom: 8 }}>
                  ⭐ {lang === 'fr' ? 'Tu es déjà parrain Novae !' : 'You\'re already a Novae mentor!'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  {lang === 'fr' ? 'Merci pour ton engagement bénévole. Voici tes filleuls actifs :' : 'Thank you for your volunteer engagement. Here are your active mentees:'}
                </p>
                {mesFilleuls.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'fr' ? 'Aucun filleul pour l\'instant — ta fiche est visible.' : 'No mentees yet — your profile is visible.'}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mesFilleuls.map(f => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--text-body)' }}>
                          {(f.profiles?.full_name || '?')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h1)' }}>{f.profiles?.full_name || '—'}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.profiles?.ville_accueil} · {f.profiles?.pays_origine}</p>
                        </div>
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'var(--bg-subtle)', color: f.statut === 'accepte' ? 'var(--text-h1)' : 'var(--text-muted)', fontWeight: 600 }}>
                          {f.statut === 'en_attente' ? (lang === 'fr' ? 'En attente' : 'Pending') : f.statut === 'accepte' ? (lang === 'fr' ? 'Actif' : 'Active') : f.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : savedOk ? (
              <div style={{ padding: '20px 22px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>🎉</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-h1)', marginBottom: 8 }}>
                  {lang === 'fr' ? 'Bravo ! Tu es maintenant parrain Novae.' : 'Congratulations! You\'re now a Novae mentor.'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {lang === 'fr' ? 'Ton profil est visible aux nouveaux arrivants de ta ville.' : 'Your profile is visible to newcomers in your city.'}
                </p>
              </div>
            ) : (
              /* Formulaire inscription */
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                {/* Explication */}
                <div style={{ padding: '14px 16px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-h1)', lineHeight: 1.7 }}>
                    {lang === 'fr'
                      ? '🌱 Tu peux aider 1 à 3 nouveaux arrivants par mois. Quelques messages suffisent — ton expérience est précieuse.'
                      : '🌱 You can help 1 to 3 newcomers per month. A few messages is all it takes — your experience is invaluable.'}
                  </p>
                </div>

                {/* Sujets */}
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 }}>
                  {lang === 'fr' ? 'Sujets sur lesquels tu peux aider' : 'Topics you can help with'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {SUJETS_OPTIONS.map(s => {
                    const sel = sujets.includes(s.id)
                    return (
                      <button key={s.id} onClick={() => toggleSujet(s.id)}
                        style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${sel ? 'var(--btn-primary-bg)' : 'var(--border)'}`, background: sel ? 'var(--bg-subtle)' : 'transparent', color: sel ? 'var(--text-h1)' : 'var(--text-muted)', fontSize: 13, fontWeight: sel ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                        {s.icon} {lang === 'fr' ? s.fr : s.en}
                        {sel ? ' ✓' : ''}
                      </button>
                    )
                  })}
                </div>

                {/* Disponibilité */}
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 }}>
                  {lang === 'fr' ? 'Ta disponibilité' : 'Your availability'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                  {DISPOS.map(d => (
                    <button key={d.id} onClick={() => setDispo(d.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 10, border: `1px solid ${dispo === d.id ? 'var(--btn-primary-bg)' : 'var(--border)'}`, background: dispo === d.id ? 'var(--bg-subtle)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${dispo === d.id ? 'var(--btn-primary-bg)' : 'var(--border)'}`, background: dispo === d.id ? 'var(--btn-primary-bg)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {dispo === d.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg-page)' }} />}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-h1)', fontWeight: dispo === d.id ? 600 : 400 }}>{lang === 'fr' ? d.fr : d.en}</p>
                    </button>
                  ))}
                </div>

                <button onClick={devenirParrain} disabled={!sujets.length || saving || !user}
                  style={{ width: '100%', padding: '13px', background: sujets.length && !saving && user ? 'var(--btn-primary-bg)' : 'var(--border)', border: 'none', borderRadius: 10, color: 'var(--bg-page)', fontWeight: 700, fontSize: 14, cursor: sujets.length && !saving && user ? 'pointer' : 'not-allowed', opacity: !user ? 0.5 : 1 }}>
                  {saving ? '...' : !user ? (lang === 'fr' ? 'Connexion requise' : 'Login required') : (lang === 'fr' ? '⭐ Devenir parrain bénévole →' : '⭐ Become a volunteer mentor →')}
                </button>
                {!user && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                    <a href="/auth/login" style={{ color: 'var(--text-body)', textDecoration: 'none' }}>{lang === 'fr' ? 'Se connecter' : 'Log in'}</a>
                    {lang === 'fr' ? ' pour t\'inscrire comme parrain.' : ' to register as a mentor.'}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
