// pages/index.js — NOVAE v5 — Homepage hub
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useApp } from '../context/AppContext'

const PILIERS = [
  {
    emoji: '✈️',
    titleFr: 'Immigration',
    titleEn: 'Immigration',
    descFr: 'Checklist d\'arrivée · Coffre-fort documents · Calendrier d\'échéances · Guide d\'arrivée au Canada.',
    descEn: 'Arrival checklist · Document vault · Deadline calendar · Canada arrival guide.',
    href: '/dashboard',
    color: '#1565C0',
    colorLight: '#42A5F5',
    bg: 'rgba(21,101,192,0.10)',
    border: 'rgba(21,101,192,0.28)',
    items: ['Checklist', '📁 Documents', '📅 Échéances', 'Guide arrivée'],
  },
  {
    emoji: '🎓',
    titleFr: 'Académie',
    titleEn: 'Academia',
    descFr: 'Mon orientation · Bourses & universités · Comparateur · Simulateur budget · Calendrier académique.',
    descEn: 'My path · Scholarships & universities · Comparator · Budget simulator · Academic calendar.',
    href: '/mon-avenir',
    color: '#6A1B9A',
    colorLight: '#AB47BC',
    bg: 'rgba(106,27,154,0.10)',
    border: 'rgba(106,27,154,0.28)',
    items: ['Mon orientation', 'Bourses & Univs', '🏛️ Univ. ou Collège', '💰 Budget', '🗓️ Calendrier'],
  },
  {
    emoji: '💼',
    titleFr: 'Carrière',
    titleEn: 'Career',
    descFr: 'Mentors · Créateur CV canadien · Simulation entrevue · Réseau professionnel.',
    descEn: 'Mentors · Canadian resume builder · Interview simulator · Professional network.',
    href: '/mentors',
    color: '#E65100',
    colorLight: '#FF7043',
    bg: 'rgba(230,81,0,0.10)',
    border: 'rgba(230,81,0,0.28)',
    items: ['Mentors', '📄 CV', '🎙️ Entrevue IA', '🎯 Réseau'],
  },
  {
    emoji: '🏠',
    titleFr: 'Intégration',
    titleEn: 'Integration',
    descFr: 'Vie quotidienne · Mes tâches · Bien-être · Parrainage · Culture canadienne · Quiz culture.',
    descEn: 'Daily life · My tasks · Wellbeing · Peer mentoring · Canadian culture · Culture quiz.',
    href: '/day-to-day',
    color: '#2D6A4F',
    colorLight: '#52B788',
    bg: 'rgba(45,106,79,0.12)',
    border: 'rgba(45,106,79,0.30)',
    items: ['Vie quotidienne', 'Mes tâches', '🌱 Bien-être', '🤝 Parrainage', 'Culture', '🎮 Quiz'],
  },
]

const STATS = [
  { numFr: '12 000+', numEn: '12,000+', labelFr: 'nouveaux arrivants aidés', labelEn: 'newcomers helped' },
  { numFr: '47',      numEn: '47',       labelFr: 'pays représentés', labelEn: 'countries represented' },
  { numFr: '94%',     numEn: '94%',      labelFr: 'satisfaction', labelEn: 'satisfaction rate' },
]

const TESTIMONIALS = [
  {
    name: 'Amara Diallo',
    origin: 'Dakar → Montréal',
    avatar: 'A',
    textFr: 'Novae m\'a aidé à comprendre les démarches dès mon arrivée. En 2 semaines j\'avais mon NAS, mon compte bancaire et mes premiers contacts professionnels.',
    textEn: 'Novae helped me understand the steps from day one. In 2 weeks I had my SIN, bank account and first professional contacts.',
    color: '#2D6A4F',
  },
  {
    name: 'Fatou Mbaye',
    origin: 'Abidjan → Toronto',
    avatar: 'F',
    textFr: 'La section "Mon Avenir" m\'a ouvert les yeux sur des métiers que je ne connaissais pas. Mon mentor m\'a aidée à décrocher mon premier stage en tech.',
    textEn: 'The "My Future" section opened my eyes to careers I didn\'t know about. My mentor helped me land my first tech internship.',
    color: '#1565C0',
  },
  {
    name: 'Koffi Asante',
    origin: 'Yaoundé → Québec',
    avatar: 'K',
    textFr: 'Le guide culturel m\'a évité beaucoup de malentendus. Je recommande Novae à tous les nouveaux arrivants au Canada.',
    textEn: 'The cultural guide saved me from many misunderstandings. I recommend Novae to every newcomer in Canada.',
    color: '#6A1B9A',
  },
]

export default function Home() {
  const router = useRouter()
  const { C, t, theme, lang, user, sb, mounted } = useApp()
  const [oauthHandled, setOauthHandled] = useState(false)

  // OAuth redirect handling — only when tokens present in URL
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
      <div style={{ minHeight:'100vh', background:'#0F0F0F', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'#2D6A4F', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff', margin:'0 auto 16px' }}>N</div>
          <p style={{ color:'#6B7280', fontSize:14 }}>Connexion en cours…</p>
        </div>
      </div>
    )
  }

  const isDark = theme === 'dark'
  const isFr   = lang === 'fr'

  const pilierHref = (href) =>
    user ? href : `/auth/login?redirect=${encodeURIComponent(href)}`

  return (
    <div style={{ minHeight:'100vh', background: C.bg, fontFamily:'system-ui,-apple-system,sans-serif', color: C.text }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position:'relative', overflow:'hidden', padding:'100px 24px 80px' }}>
        {/* Gradient orbs */}
        <div style={{ position:'absolute', top:-120, left:'50%', transform:'translateX(-50%)', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(45,106,79,0.18) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:60, right:'5%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(82,183,136,0.10) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ maxWidth:780, margin:'0 auto', textAlign:'center', position:'relative' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:100, border:`1px solid ${C.accent}40`, background:`${C.accent}12`, marginBottom:28 }}>
            <span style={{ fontSize:13 }}>🌍</span>
            <span style={{ fontSize:13, color: C.accent2, fontWeight:600, letterSpacing:0.3 }}>
              {isFr ? 'Pour les nouveaux arrivants au Canada' : 'For newcomers to Canada'}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.6rem)', fontWeight:800, lineHeight:1.12, letterSpacing:-1.5, margin:'0 0 20px' }}>
            <span style={{ color: C.text }}>
              {isFr ? 'Réussis ton parcours' : 'Succeed in your journey'}
            </span>
            <br />
            <span style={{ background:`linear-gradient(135deg, ${C.accent} 0%, ${C.accent2} 100%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {isFr ? 'au Canada' : 'in Canada'}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize:'clamp(1rem,2.2vw,1.2rem)', color: C.muted, lineHeight:1.7, maxWidth:560, margin:'0 auto 36px' }}>
            {isFr
              ? 'De ton arrivée au Canada jusqu\'à ta première promotion — Novae t\'accompagne à chaque étape avec des outils IA, des mentors et une communauté.'
              : 'From your arrival in Canada to your first promotion — Novae supports you at every step with AI tools, mentors and a community.'}
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {user ? (
              <>
                <Link href="/dashboard" style={{ padding:'14px 28px', borderRadius:12, background: C.accent, color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
                  {isFr ? 'Mon tableau de bord' : 'My dashboard'} →
                </Link>
                <Link href="/mon-avenir" style={{ padding:'14px 28px', borderRadius:12, border:`1.5px solid ${C.border2}`, background:'transparent', color: C.text2, fontWeight:600, fontSize:15, textDecoration:'none' }}>
                  {isFr ? 'Découvrir mon avenir' : 'Discover my future'}
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" style={{ padding:'14px 28px', borderRadius:12, background: C.accent, color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
                  {isFr ? 'Commencer gratuitement' : 'Get started for free'} →
                </Link>
                <Link href="/auth/login" style={{ padding:'14px 28px', borderRadius:12, border:`1.5px solid ${C.border2}`, background:'transparent', color: C.text2, fontWeight:600, fontSize:15, textDecoration:'none' }}>
                  {isFr ? 'Se connecter' : 'Sign in'}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 4 PILIERS ─────────────────────────────────────────────────── */}
      <section style={{ padding:'0 24px 80px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:700, margin:'0 0 10px', letterSpacing:-0.5 }}>
            {isFr ? '4 piliers pour réussir' : '4 pillars to succeed'}
          </h2>
          <p style={{ color: C.muted, fontSize:15 }}>
            {isFr ? 'Un écosystème complet pensé pour toi' : 'A complete ecosystem designed for you'}
          </p>
        </div>

        <div className="piliers-grid">
          {PILIERS.map((p, i) => (
            <Link key={p.href} href={pilierHref(p.href)} style={{ textDecoration:'none' }}>
              <div className="pilier-card" style={{
                background: isDark ? C.surface : '#fff',
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
                <p style={{ fontSize:13, color: C.muted, lineHeight:1.65, margin:0 }}>
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
                  {isFr ? 'Explorer' : 'Explore'} <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section style={{ padding:'52px 24px', background: isDark ? C.surface : C.bg2, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:700, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, textAlign:'center' }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:800, color: C.accent2, letterSpacing:-1, lineHeight:1 }}>
                {isFr ? s.numFr : s.numEn}
              </div>
              <div style={{ fontSize:13, color: C.muted, marginTop:6 }}>
                {isFr ? s.labelFr : s.labelEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section style={{ padding:'72px 24px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:700, margin:'0 0 10px', letterSpacing:-0.5 }}>
            {isFr ? 'Ils ont transformé leur parcours' : 'They transformed their journey'}
          </h2>
          <p style={{ color: C.muted, fontSize:15 }}>
            {isFr ? 'Des milliers de nouveaux arrivants nous font confiance' : 'Thousands of newcomers trust us'}
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t_, i) => (
            <div key={i} style={{
              background: isDark ? C.surface : '#fff',
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: '26px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <p style={{ fontSize:14, color: C.text2, lineHeight:1.7, margin:0, fontStyle:'italic' }}>
                "{isFr ? t_.textFr : t_.textEn}"
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:'auto' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:`${t_.color}22`, border:`1.5px solid ${t_.color}44`, color: t_.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, flexShrink:0 }}>
                  {t_.avatar}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color: C.text }}>{t_.name}</div>
                  <div style={{ fontSize:12, color: C.muted }}>{t_.origin}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ────────────────────────────────────────────────── */}
      {!user && (
        <section style={{ padding:'64px 24px 80px', textAlign:'center' }}>
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            <h2 style={{ fontSize:'clamp(1.3rem,3vw,1.9rem)', fontWeight:700, letterSpacing:-0.5, marginBottom:14 }}>
              {isFr ? 'Prêt à commencer ?' : 'Ready to start?'}
            </h2>
            <p style={{ color: C.muted, fontSize:15, marginBottom:28 }}>
              {isFr ? 'Rejoins des milliers de nouveaux arrivants qui réussissent au Canada.' : 'Join thousands of newcomers succeeding in Canada.'}
            </p>
            <Link href="/auth/register" style={{ display:'inline-block', padding:'15px 36px', borderRadius:12, background: C.accent, color:'#fff', fontWeight:700, fontSize:16, textDecoration:'none' }}>
              {isFr ? 'Créer mon compte gratuit' : 'Create my free account'}
            </Link>
          </div>
        </section>
      )}

      {/* ── ABONNEMENTS ───────────────────────────────────────────────── */}
      <section style={{ padding:'72px 24px 80px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:700, margin:'0 0 10px', letterSpacing:-0.5 }}>
            {isFr ? 'Nos abonnements' : 'Our plans'}
          </h2>
          <p style={{ color: C.muted, fontSize:15 }}>
            {isFr ? 'Choisis le plan qui correspond à tes besoins' : 'Choose the plan that fits your needs'}
          </p>
        </div>

        <div className="plans-grid">
          {/* PLAN GRATUIT */}
          <div className="plan-card" style={{
            background: isDark ? '#162820' : '#fff',
            borderLeft: '4px solid #888',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            animationDelay: '0ms',
          }}>
            <div style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:18, fontWeight:700, color: C.text, margin:'0 0 8px' }}>
                {isFr ? 'Gratuit' : 'Free'}
              </h3>
              <p style={{ fontSize:32, fontWeight:800, color: C.text, margin:0 }}>
                0<span style={{ fontSize:16, fontWeight:400, color: C.muted }}>$/{isFr ? 'mois' : 'mo'}</span>
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[
                isFr ? '✅ Dashboard + checklist' : '✅ Dashboard + checklist',
                isFr ? '✅ Guides gratuits' : '✅ Free guides',
                isFr ? '✅ Quiz culture' : '✅ Culture quiz',
                isFr ? '✅ Carte vie quotidienne' : '✅ Daily life map',
                isFr ? '✅ 1 CV généré par IA' : '✅ 1 AI-generated resume',
                isFr ? '✅ 5 messages à Nova par jour' : '✅ 5 Nova messages/day',
                isFr ? '❌ Recommandations IA illimitées' : '❌ Unlimited AI recommendations',
                isFr ? '❌ Simulation entrevue' : '❌ Interview simulation',
                isFr ? '❌ Accès mentors' : '❌ Mentor access',
              ].map((item, i) => (
                <p key={i} style={{ fontSize:13, color: item.startsWith('✅') ? C.text : C.muted, margin:0 }}>
                  {item}
                </p>
              ))}
            </div>
            <Link href="/auth/register" style={{
              display:'block', padding:'12px', borderRadius:10,
              border:`1px solid ${C.border}`, background:'transparent',
              color: C.text, fontWeight:600, fontSize:14,
              textDecoration:'none', textAlign:'center',
            }}>
              {isFr ? 'Commencer gratuitement' : 'Get started for free'}
            </Link>
          </div>

          {/* PLAN STARTER */}
          <div className="plan-card" style={{
            background: isDark ? '#162820' : '#fff',
            borderLeft: '4px solid #1565C0',
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
              background:'#1565C0', color:'#fff',
              fontSize:11, fontWeight:700,
            }}>
              {isFr ? 'Populaire' : 'Popular'}
            </div>
            <div style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:18, fontWeight:700, color: C.text, margin:'0 0 8px' }}>
                Starter
              </h3>
              <p style={{ fontSize:32, fontWeight:800, color: C.text, margin:0 }}>
                9.99<span style={{ fontSize:16, fontWeight:400, color: C.muted }}>$/{isFr ? 'mois' : 'mo'}</span>
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[
                isFr ? '✅ Tout le plan gratuit' : '✅ Everything in Free',
                isFr ? '✅ 5 CV générés par IA' : '✅ 5 AI-generated resumes',
                isFr ? '✅ 20 messages à Nova par jour' : '✅ 20 Nova messages/day',
                isFr ? '✅ Recommandations IA illimitées' : '✅ Unlimited AI recommendations',
                isFr ? '✅ 3 simulations entrevue par mois' : '✅ 3 interview simulations/month',
                isFr ? '✅ Documents illimités' : '✅ Unlimited documents',
                isFr ? '✅ Bourses et universités' : '✅ Scholarships & universities',
                isFr ? '❌ Accès mentors prioritaire' : '❌ Priority mentor access',
              ].map((item, i) => (
                <p key={i} style={{ fontSize:13, color: item.startsWith('✅') ? C.text : C.muted, margin:0 }}>
                  {item}
                </p>
              ))}
            </div>
            <Link href="/abonnement" style={{
              display:'block', padding:'12px', borderRadius:10,
              border:'none', background:'#1565C0',
              color:'#fff', fontWeight:600, fontSize:14,
              textDecoration:'none', textAlign:'center',
            }}>
              {isFr ? 'Commencer — 9.99$/mois' : 'Start — 9.99$/mo'}
            </Link>
          </div>

          {/* PLAN PREMIUM */}
          <div className="plan-card" style={{
            background: isDark ? '#162820' : '#fff',
            borderLeft: '4px solid #2D6A4F',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            animationDelay: '200ms',
            position:'relative',
          }}>
            <div style={{
              position:'absolute', top:-12, left:20,
              padding:'4px 12px', borderRadius:20,
              background:'#2D6A4F', color:'#fff',
              fontSize:11, fontWeight:700,
            }}>
              ⭐ Premium
            </div>
            <div style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:18, fontWeight:700, color: C.text, margin:'0 0 8px' }}>
                Premium
              </h3>
              <p style={{ fontSize:32, fontWeight:800, color: C.text, margin:0 }}>
                19.99<span style={{ fontSize:16, fontWeight:400, color: C.muted }}>$/{isFr ? 'mois' : 'mo'}</span>
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[
                isFr ? '✅ Tout le plan Starter' : '✅ Everything in Starter',
                isFr ? '✅ CV illimités' : '✅ Unlimited resumes',
                isFr ? '✅ Nova illimitée' : '✅ Unlimited Nova',
                isFr ? '✅ Simulations entrevue illimitées' : '✅ Unlimited interview simulations',
                isFr ? '✅ Accès mentors prioritaire' : '✅ Priority mentor access',
                isFr ? '✅ Support prioritaire' : '✅ Priority support',
                isFr ? '✅ Nouvelles fonctionnalités en avant-première' : '✅ Early access to new features',
              ].map((item, i) => (
                <p key={i} style={{ fontSize:13, color: C.text, margin:0 }}>
                  {item}
                </p>
              ))}
            </div>
            <Link href="/abonnement" style={{
              display:'block', padding:'12px', borderRadius:10,
              border:'none', background:'#2D6A4F',
              color:'#fff', fontWeight:600, fontSize:14,
              textDecoration:'none', textAlign:'center',
            }}>
              {isFr ? 'Commencer — 19.99$/mois' : 'Start — 19.99$/mo'}
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
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

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:'32px 24px', background: isDark ? C.surface : C.bg2 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', gap:16, alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background: C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff' }}>N</div>
            <span style={{ fontWeight:700, fontSize:15, color: C.text }}>novae</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
            {[
              { href:'/dashboard',             fr:'Checklist',         en:'Checklist'       },
              { href:'/documents',             fr:'Documents',         en:'Documents'       },
              { href:'/bienetre',              fr:'Bien-être',         en:'Wellbeing'       },
              { href:'/parrainage',            fr:'Parrainage',        en:'Peer mentoring'  },
              { href:'/bourses',               fr:'Bourses',           en:'Scholarships'    },
              { href:'/simulateur-budget',     fr:'Budget',            en:'Budget'          },
              { href:'/calendrier-academique', fr:'Calendrier',        en:'Calendar'        },
              { href:'/mon-avenir',            fr:'Mon Avenir',        en:'My Future'       },
              { href:'/cv',                    fr:'CV',                en:'Resume'          },
              { href:'/reseau',                fr:'Réseau',            en:'Network'         },
              { href:'/entrevue',              fr:'Entrevue IA',       en:'Mock Interview'  },
              { href:'/bug-report',            fr:'Signaler un bug 🐛', en:'Report a bug 🐛' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize:12, color: C.muted, textDecoration:'none' }}>
                {isFr ? l.fr : l.en}
              </Link>
            ))}
          </div>
          <div style={{ fontSize:12, color: C.muted }}>
            © {new Date().getFullYear()} Novae · {isFr ? 'Fait avec ❤️ pour les nouveaux arrivants' : 'Made with ❤️ for newcomers'}
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
