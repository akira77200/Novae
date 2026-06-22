// pages/index.js â€” NOVAE v5 â€” Homepage hub
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useApp } from '../context/AppContext'

const PILIERS = [
  {
    emoji: 'âœˆï¸',
    titleFr: 'Immigration',
    titleEn: 'Immigration',
    descFr: 'Checklist d\'arrivÃ©e Â· Coffre-fort documents Â· Calendrier d\'Ã©chÃ©ances Â· Guide d\'arrivÃ©e au Canada.',
    descEn: 'Arrival checklist Â· Document vault Â· Deadline calendar Â· Canada arrival guide.',
    href: '/dashboard',
    color: 'var(--text-h1)',
    colorLight: '#6B6F76',
    bg: 'rgba(21,101,192,0.10)',
    border: 'rgba(21,101,192,0.28)',
    items: ['Checklist', 'ðŸ“ Documents', 'ðŸ“… Ã‰chÃ©ances', 'Guide arrivÃ©e'],
  },
  {
    emoji: 'ðŸŽ“',
    titleFr: 'AcadÃ©mie',
    titleEn: 'Academia',
    descFr: 'Mon orientation Â· Bourses & universitÃ©s Â· Comparateur Â· Simulateur budget Â· Calendrier acadÃ©mique.',
    descEn: 'My path Â· Scholarships & universities Â· Comparator Â· Budget simulator Â· Academic calendar.',
    href: '/mon-avenir',
    color: 'var(--text-body)',
    colorLight: '#6B6F76',
    bg: 'rgba(106,27,154,0.10)',
    border: 'rgba(106,27,154,0.28)',
    items: ['Mon orientation', 'Bourses & Univs', 'ðŸ›ï¸ Univ. ou CollÃ¨ge', 'ðŸ’° Budget', 'ðŸ—“ï¸ Calendrier'],
  },
  {
    emoji: 'ðŸ’¼',
    titleFr: 'CarriÃ¨re',
    titleEn: 'Career',
    descFr: 'Mentors Â· CrÃ©ateur CV canadien Â· Simulation entrevue Â· RÃ©seau professionnel.',
    descEn: 'Mentors Â· Canadian resume builder Â· Interview simulator Â· Professional network.',
    href: '/mentors',
    color: 'var(--text-body)',
    colorLight: '#6B6F76',
    bg: 'rgba(230,81,0,0.10)',
    border: 'rgba(230,81,0,0.28)',
    items: ['Mentors', 'ðŸ“„ CV', 'ðŸŽ™ï¸ Entrevue IA', 'ðŸŽ¯ RÃ©seau'],
  },
  {
    emoji: 'ðŸ ',
    titleFr: 'IntÃ©gration',
    titleEn: 'Integration',
    descFr: 'Vie quotidienne Â· Mes tÃ¢ches Â· Bien-Ãªtre Â· Parrainage Â· Culture canadienne Â· Quiz culture.',
    descEn: 'Daily life Â· My tasks Â· Wellbeing Â· Peer mentoring Â· Canadian culture Â· Culture quiz.',
    href: '/day-to-day',
    color: 'var(--text-h1)',
    colorLight: '#0E1116',
    bg: 'rgba(30,58,95,0.12)',
    border: 'rgba(45,106,79,0.30)',
    items: ['Vie quotidienne', 'Mes tÃ¢ches', 'ðŸŒ± Bien-Ãªtre', 'ðŸ¤ Parrainage', 'Culture', 'ðŸŽ® Quiz'],
  },
]

const STATS = [
  { numFr: '150+',  numEn: '150+',  labelFr: 'pays reprÃ©sentÃ©s',         labelEn: 'countries represented'  },
  { numFr: '4',     numEn: '4',     labelFr: "piliers d'accompagnement", labelEn: 'pillars of support'     },
  { numFr: '100%',  numEn: '100%',  labelFr: 'gratuit pour commencer',   labelEn: 'free to get started'    },
]


export default function Home() {
  const router = useRouter()
  const { C, t, theme, lang, user, sb, mounted } = useApp()
  const [oauthHandled, setOauthHandled] = useState(false)

  // OAuth redirect handling â€” only when tokens present in URL
  useEffect(() => {
    if (!sb) return
    const hash   = typeof window !== 'undefined' ? window.location.hash   : ''
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const isOAuth = hash.includes('access_token') || search.includes('code=')

    if (!isOAuth) { setOauthHandled(true); return }

    const handleOAuth = async () => {
      await new Promise(r => setTimeout(r, 800))
      const { data: { session } } = await sb.auth.getSession()
      if (!session?.user) { setOauthHandled(true); return }
      const u = session.user
      const { data: profil } = await sb.from('profiles').select('id').eq('id', u.id).single()
      if (!profil) {
        await sb.from('profiles').upsert({
          id:         u.id,
          email:      u.email,
          full_name:  u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || '',
          avatar_url: u.user_metadata?.avatar_url || null,
        })
      }
      router.replace('/dashboard')
    }
    handleOAuth()
  }, [sb])

  // While OAuth is being processed, show minimal loader
  if (!oauthHandled && typeof window !== 'undefined' &&
     (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
    return (
      <div style={{ minHeight:'100vh', background:'#0E1116', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'#0E1116', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff', margin:'0 auto 16px' }}>N</div>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Connexion en coursâ€¦</p>
        </div>
      </div>
    )
  }

  const isDark = theme === 'dark'
  const isFr   = lang === 'fr'

  const pilierHref = (href) =>
    user ? href : `/auth/login?redirect=${encodeURIComponent(href)}`

  return (
    <div style={{ minHeight:'100vh', background: 'var(--bg-page)', fontFamily:'system-ui,-apple-system,sans-serif', color: 'var(--text-h1)' }}>

      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ position:'relative', overflow:'hidden', padding:'100px 24px 80px' }}>
        {/* Gradient orbs */}
        <div style={{ position:'absolute', top:-120, left:'50%', transform:'translateX(-50%)', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(30,58,95,0.18) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:60, right:'5%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(82,183,136,0.10) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ maxWidth:780, margin:'0 auto', textAlign:'center', position:'relative' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:100, border:`1px solid ${'#0E1116'}40`, background:'#0E111612', marginBottom:28 }}>
            <span style={{ fontSize:13 }}>ðŸŒ</span>
            <span style={{ fontSize:13, color: 'var(--text-body)', fontWeight:600, letterSpacing:0.3 }}>
              {isFr ? 'Pour les nouveaux arrivants au Canada' : 'For newcomers to Canada'}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.6rem)', fontWeight:800, lineHeight:1.12, letterSpacing:-1.5, margin:'0 0 20px' }}>
            <span style={{ color: 'var(--text-h1)' }}>
              {isFr ? 'RÃ©ussis ton parcours' : 'Succeed in your journey'}
            </span>
            <br />
            <span style={{ background:'var(--bg-subtle)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {isFr ? 'au Canada' : 'in Canada'}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize:'clamp(1rem,2.2vw,1.2rem)', color: 'var(--text-muted)', lineHeight:1.7, maxWidth:580, margin:'0 auto 10px', fontWeight:500 }}>
            {isFr
              ? 'La plateforme qui accompagne les Ã©tudiants internationaux au Canada'
              : 'The platform that supports international students in Canada'}
          </p>
          <p style={{ fontSize:'clamp(0.9rem,1.8vw,1rem)', color: 'var(--text-muted)', lineHeight:1.7, maxWidth:540, margin:'0 auto 36px' }}>
            {isFr
              ? "De l'orientation Ã  la carriÃ¨re â€” ton parcours complet, peu importe d'oÃ¹ tu viens."
              : 'From orientation to career â€” your complete journey, wherever you come from.'}
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {user ? (
              <>
                <Link href="/dashboard" style={{ padding:'14px 28px', borderRadius:12, background: '#0E1116', color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
                  {isFr ? 'Mon tableau de bord' : 'My dashboard'} â†’
                </Link>
                <Link href="/mon-avenir" style={{ padding:'14px 28px', borderRadius:12, border:'1.5px solid var(--border)', background:'transparent', color: 'var(--text-muted)', fontWeight:600, fontSize:15, textDecoration:'none' }}>
                  {isFr ? 'DÃ©couvrir mon avenir' : 'Discover my future'}
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" style={{ padding:'14px 28px', borderRadius:12, background: '#0E1116', color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
                  {isFr ? 'Commencer gratuitement' : 'Get started for free'} â†’
                </Link>
                <Link href="/auth/login" style={{ padding:'14px 28px', borderRadius:12, border:'1.5px solid var(--border)', background:'transparent', color: 'var(--text-muted)', fontWeight:600, fontSize:15, textDecoration:'none' }}>
                  {isFr ? 'Se connecter' : 'Sign in'}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* â”€â”€ 4 PILIERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ padding:'0 24px 80px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:700, margin:'0 0 10px', letterSpacing:-0.5 }}>
            {isFr ? '4 piliers pour rÃ©ussir' : '4 pillars to succeed'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize:15 }}>
            {isFr ? 'Un Ã©cosystÃ¨me complet pensÃ© pour toi' : 'A complete ecosystem designed for you'}
          </p>
        </div>

        <div className="piliers-grid">
          {PILIERS.map((p, i) => (
            <Link key={p.href} href={pilierHref(p.href)} style={{ textDecoration:'none' }}>
              <div className="pilier-card" style={{
                background: isDark ? '#FFFFFF' : '#fff',
                border: `1.5px solid ${p.border}`,
                borderRadius: 20,
                padding: '28px 24px',
                cursor: 'pointer',
                transition: 'all 0.22s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                animationDelay: `${i * 80}ms`,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:46, height:46, borderRadius:14, background: p.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                    {p.emoji}
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:700, color: p.colorLight, margin:0, lineHeight:1.3 }}>
                    {isFr ? p.titleFr : p.titleEn}
                  </h3>
                </div>
                <p style={{ fontSize:13, color: 'var(--text-muted)', lineHeight:1.65, margin:0 }}>
                  {isFr ? p.descFr : p.descEn}
                </p>
                {p.items && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {p.items.map(item => (
                      <span key={item} style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background: p.bg, color: p.colorLight, border:`1px solid ${p.border}`, fontWeight:500 }}>
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:6, color: p.colorLight, fontSize:13, fontWeight:600, marginTop:'auto' }}>
                  {isFr ? 'Explorer' : 'Explore'} <span>â†’</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* â”€â”€ STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ padding:'52px 24px', background: isDark ? '#FFFFFF' : '#F7F7F5', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:700, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, textAlign:'center' }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:800, color: 'var(--text-body)', letterSpacing:-1, lineHeight:1 }}>
                {isFr ? s.numFr : s.numEn}
              </div>
              <div style={{ fontSize:13, color: 'var(--text-muted)', marginTop:6 }}>
                {isFr ? s.labelFr : s.labelEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ CTA BOTTOM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!user && (
        <section style={{ padding:'64px 24px 80px', textAlign:'center' }}>
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            <h2 style={{ fontSize:'clamp(1.3rem,3vw,1.9rem)', fontWeight:700, letterSpacing:-0.5, marginBottom:14 }}>
              {isFr ? 'PrÃªt Ã  commencer ?' : 'Ready to start?'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize:15, marginBottom:28 }}>
              {isFr ? 'Rejoins des milliers de nouveaux arrivants qui rÃ©ussissent au Canada.' : 'Join thousands of newcomers succeeding in Canada.'}
            </p>
            <Link href="/auth/register" style={{ display:'inline-block', padding:'15px 36px', borderRadius:12, background: '#0E1116', color:'#fff', fontWeight:700, fontSize:16, textDecoration:'none' }}>
              {isFr ? 'CrÃ©er mon compte gratuit' : 'Create my free account'}
            </Link>
          </div>
        </section>
      )}

      {/* â”€â”€ ABONNEMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ padding:'72px 24px 80px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:700, margin:'0 0 10px', letterSpacing:-0.5 }}>
            {isFr ? 'Nos abonnements' : 'Our plans'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize:15 }}>
            {isFr ? 'Choisis le plan qui correspond Ã  tes besoins' : 'Choose the plan that fits your needs'}
          </p>
        </div>

        <div className="plans-grid">
          {/* PLAN GRATUIT */}
          <div className="plan-card" style={{
            background: isDark ? '#0E1116' : '#fff',
            borderLeft: '4px solid #888',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            animationDelay: '0ms',
          }}>
            <div style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:18, fontWeight:700, color: 'var(--text-h1)', margin:'0 0 8px' }}>
                {isFr ? 'Gratuit' : 'Free'}
              </h3>
              <p style={{ fontSize:32, fontWeight:800, color: 'var(--text-h1)', margin:0 }}>
                0<span style={{ fontSize:16, fontWeight:400, color: 'var(--text-muted)' }}>$/{isFr ? 'mois' : 'mo'}</span>
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[
                isFr ? 'âœ… Dashboard + checklist' : 'âœ… Dashboard + checklist',
                isFr ? 'âœ… Guides gratuits' : 'âœ… Free guides',
                isFr ? 'âœ… Quiz culture' : 'âœ… Culture quiz',
                isFr ? 'âœ… Carte vie quotidienne' : 'âœ… Daily life map',
                isFr ? 'âœ… 1 CV gÃ©nÃ©rÃ© par IA' : 'âœ… 1 AI-generated resume',
                isFr ? 'âœ… 5 messages Ã  Nova par jour' : 'âœ… 5 Nova messages/day',
                isFr ? 'âŒ Recommandations IA illimitÃ©es' : 'âŒ Unlimited AI recommendations',
                isFr ? 'âŒ Simulation entrevue' : 'âŒ Interview simulation',
              ].map((item, i) => (
                <p key={i} style={{ fontSize:13, color: item.startsWith('âœ…') ? '#0E1116' : '#6B6F76', margin:0 }}>
                  {item}
                </p>
              ))}
            </div>
            <Link href="/auth/register" style={{
              display:'block', padding:'12px', borderRadius:10,
              border:'1px solid var(--border)', background:'transparent',
              color: 'var(--text-h1)', fontWeight:600, fontSize:14,
              textDecoration:'none', textAlign:'center',
            }}>
              {isFr ? 'Commencer gratuitement' : 'Get started for free'}
            </Link>
          </div>

          {/* PLAN STARTER */}
          <div className="plan-card" style={{
            background: isDark ? '#0E1116' : '#fff',
            borderLeft: '4px solid #0E1116',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            animationDelay: '100ms',
            position:'relative',
          }}>
            <div style={{
              position:'absolute', top:-12, left:20,
              padding:'4px 12px', borderRadius:20,
              background:'#0E1116', color:'#fff',
              fontSize:11, fontWeight:700,
            }}>
              {isFr ? 'Populaire' : 'Popular'}
            </div>
            <div style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:18, fontWeight:700, color: 'var(--text-h1)', margin:'0 0 8px' }}>
                Starter
              </h3>
              <p style={{ fontSize:32, fontWeight:800, color: 'var(--text-h1)', margin:0 }}>
                4.99<span style={{ fontSize:16, fontWeight:400, color: 'var(--text-muted)' }}>$/{isFr ? 'mois' : 'mo'}</span>
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[
                isFr ? 'âœ… Tout le plan gratuit' : 'âœ… Everything in Free',
                isFr ? 'âœ… 5 CV gÃ©nÃ©rÃ©s par IA' : 'âœ… 5 AI-generated resumes',
                isFr ? 'âœ… 20 messages Ã  Nova par jour' : 'âœ… 20 Nova messages/day',
                isFr ? 'âœ… Recommandations IA illimitÃ©es' : 'âœ… Unlimited AI recommendations',
                isFr ? 'âœ… 3 simulations entrevue par mois' : 'âœ… 3 interview simulations/month',
                isFr ? 'âœ… Documents illimitÃ©s' : 'âœ… Unlimited documents',
                isFr ? 'âœ… Bourses et universitÃ©s' : 'âœ… Scholarships & universities',
              ].map((item, i) => (
                <p key={i} style={{ fontSize:13, color: item.startsWith('âœ…') ? '#0E1116' : '#6B6F76', margin:0 }}>
                  {item}
                </p>
              ))}
            </div>
            <Link href="/abonnement" style={{
              display:'block', padding:'12px', borderRadius:10,
              border:'none', background:'#0E1116',
              color:'#fff', fontWeight:600, fontSize:14,
              textDecoration:'none', textAlign:'center',
            }}>
              {isFr ? 'Commencer â€” 4.99$/mois' : 'Start â€” 4.99$/mo'}
            </Link>
          </div>

        </div>
      </section>

      <style jsx global>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 720px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .plans-grid { grid-template-columns: 1fr; }
        }
        .plan-card {
          animation: fadeSlideUp 0.45s ease both;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        }
      `}</style>

      {/* â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'32px 24px', background: isDark ? '#FFFFFF' : '#F7F7F5' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', gap:16, alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background: '#0E1116', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff' }}>N</div>
            <span style={{ fontWeight:700, fontSize:15, color: 'var(--text-h1)' }}>novae</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
            {[
              { href:'/dashboard',             fr:'Checklist',         en:'Checklist'       },
              { href:'/documents',             fr:'Documents',         en:'Documents'       },
              { href:'/bienetre',              fr:'Bien-Ãªtre',         en:'Wellbeing'       },
              { href:'/parrainage',            fr:'Parrainage',        en:'Peer mentoring'  },
              { href:'/bourses',               fr:'Bourses',           en:'Scholarships'    },
              { href:'/simulateur-budget',     fr:'Budget',            en:'Budget'          },
              { href:'/calendrier-academique', fr:'Calendrier',        en:'Calendar'        },
              { href:'/mon-avenir',            fr:'Mon Avenir',        en:'My Future'       },
              { href:'/cv',                    fr:'CV',                en:'Resume'          },
              { href:'/reseau',                fr:'RÃ©seau',            en:'Network'         },
              { href:'/entrevue',              fr:'Entrevue IA',       en:'Mock Interview'  },
              { href:'/bug-report',            fr:'Signaler un bug ðŸ›', en:'Report a bug ðŸ›' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize:12, color: 'var(--text-muted)', textDecoration:'none' }}>
                {isFr ? l.fr : l.en}
              </Link>
            ))}
          </div>
          <div style={{ fontSize:12, color: 'var(--text-muted)' }}>
            Â© {new Date().getFullYear()} Novae Â· {isFr ? 'Fait avec â¤ï¸ pour les nouveaux arrivants' : 'Made with â¤ï¸ for newcomers'}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .piliers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }
        @media (max-width: 640px) {
          .piliers-grid { grid-template-columns: 1fr; }
        }
        .pilier-card {
          animation: fadeSlideUp 0.45s ease both;
        }
        .pilier-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 820px) {
          .testimonials-grid { grid-template-columns: 1fr; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  )
}

