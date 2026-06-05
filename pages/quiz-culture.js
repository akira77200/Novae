// pages/quiz-culture.js — NOVAE v5 — Quiz culture canadienne
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

// ─────────────────────────────────────────────────────────────────
// DONNÉES DU QUIZ
// ─────────────────────────────────────────────────────────────────
const QUIZ_DATA = {
  codes_sociaux: {
    titre: { fr: 'Codes sociaux', en: 'Social Codes' },
    emoji: '🤝',
    color: '#52B788',
    questions: [
      {
        q: { fr: "Au Canada, quand quelqu'un te tient la porte, tu dois :", en: "In Canada, when someone holds the door for you, you should:" },
        options: {
          fr: ["Dire merci et sourire","Passer sans rien dire","Attendre qu'ils passent d'abord","Faire un signe de tête"],
          en: ["Say thank you and smile","Walk through without a word","Wait for them to go first","Nod your head"]
        },
        correct: 0,
        explication: { fr: "Au Canada, dire 'merci' quand quelqu'un tient la porte est une norme sociale très forte. Ne pas le faire peut paraître impoli.", en: "In Canada, saying 'thank you' when someone holds the door is a very strong social norm. Not doing so can seem rude." }
      },
      {
        q: { fr: "Au travail canadien, ton patron te demande ton avis. Tu :", en: "At a Canadian workplace, your boss asks your opinion. You:" },
        options: {
          fr: ["Attends qu'il finisse de parler","Approuves ce qu'il dit","Restes silencieux par respect","Donnes ton avis honnêtement même s'il diffère"],
          en: ["Wait for them to finish","Agree with what they say","Stay silent out of respect","Give your honest opinion even if different"]
        },
        correct: 3,
        explication: { fr: "La culture de travail canadienne valorise les opinions directes et honnêtes. Approuver par politesse peut être perçu comme un manque d'engagement.", en: "Canadian work culture values direct and honest opinions. Agreeing just to be polite can be seen as a lack of engagement." }
      },
      {
        q: { fr: "Un collègue dit 'How are you?' en passant. Tu :", en: "A colleague says 'How are you?' in passing. You:" },
        options: {
          fr: ["Racontes tes problèmes de la semaine","Restes silencieux — c'est une formule","Dis 'Good, thanks! You?' et continues","Demandes pourquoi il veut savoir"],
          en: ["Tell them about your week's problems","Stay silent — it's just a phrase","Say 'Good, thanks! You?' and continue","Ask why they want to know"]
        },
        correct: 2,
        explication: { fr: "'How are you?' au Canada est une salutation, pas une vraie question. La réponse standard est courte et positive.", en: "'How are you?' in Canada is a greeting, not a real question. The standard response is short and positive." }
      },
      {
        q: { fr: "Quelqu'un dit 'On devrait se voir bientôt !' Tu interprètes ça comme :", en: "Someone says 'We should hang out soon!' You interpret this as:" },
        options: {
          fr: ["Une politesse — attends qu'ils proposent une date","Une invitation ferme à planifier","Une promesse — tu le rappelles demain","Un refus poli"],
          en: ["A pleasantry — wait for them to suggest a date","A firm invitation to plan something","A promise — you call them tomorrow","A polite refusal"]
        },
        correct: 0,
        explication: { fr: "'On devrait se voir' est souvent une formule de politesse. Si la personne veut vraiment te voir, elle proposera une date et un lieu précis.", en: "'We should hang out' is often a pleasantry. If the person truly wants to meet, they'll suggest a specific date and place." }
      },
      {
        q: { fr: "Tu es invité chez quelqu'un pour dîner. Tu arrives :", en: "You're invited to someone's home for dinner. You arrive:" },
        options: {
          fr: ["30 minutes en avance pour aider","10–15 minutes en retard (norme sociale)","Quand tu peux — c'est chez des amis","À l'heure exacte, avec un petit cadeau"],
          en: ["30 minutes early to help","10–15 minutes late (social norm)","Whenever you can — it's friends","On time, with a small gift"]
        },
        correct: 3,
        explication: { fr: "Être à l'heure est très important en contexte social canadien. Apporter un vin, dessert ou fleurs est fortement recommandé.", en: "Being on time is very important in Canadian social contexts. Bringing wine, dessert or flowers is strongly recommended." }
      },
    ]
  },
  hiver: {
    titre: { fr: "Survivre à l'hiver", en: 'Surviving Winter' },
    emoji: '❄️',
    color: '#60A5FA',
    questions: [
      {
        q: { fr: "En hiver canadien (-20°C), la règle vestimentaire est :", en: "In Canadian winter (-20°C), the dressing rule is:" },
        options: {
          fr: ["Un gros manteau suffit","S'habiller comme en automne et marcher vite","3 couches : base thermique + isolant + imperméable","Rester à l'intérieur — c'est trop froid"],
          en: ["One big coat is enough","Dress like fall and walk fast","3 layers: thermal base + insulator + waterproof shell","Stay inside — it's too cold"]
        },
        correct: 2,
        explication: { fr: "La règle des 3 couches est fondamentale. La base évacue l'humidité, l'isolant retient la chaleur, l'imperméable protège du vent et de la neige.", en: "The 3-layer rule is key. The base wicks moisture, the insulator retains heat, the shell protects from wind and snow." }
      },
      {
        q: { fr: "Ton trottoir devant chez toi est enneigé. Tu :", en: "The sidewalk in front of your home is snowy. You:" },
        options: {
          fr: ["Déneiges dans les 24h — c'est obligatoire","Attends que la ville vienne déneiger","Mets du sel et c'est bon","C'est la responsabilité du proprio uniquement"],
          en: ["Clear it within 24h — it's required by law","Wait for the city to clear it","Put salt and that's enough","It's only the landlord's responsibility"]
        },
        correct: 0,
        explication: { fr: "Dans la plupart des villes canadiennes, les résidents ont l'obligation légale de déneiger dans les 24h. Amende possible si non respecté.", en: "In most Canadian cities, residents are legally required to clear snow within 24 hours. Fines may apply." }
      },
      {
        q: { fr: "Quelle température fait-il à Montréal en janvier en moyenne ?", en: "What is the average temperature in Montreal in January?" },
        options: {
          fr: ["-5°C","0°C","-25°C","-15°C"],
          en: ["-5°C","0°C","-25°C","-15°C"]
        },
        correct: 3,
        explication: { fr: "Montréal a en moyenne -15°C en janvier, avec des épisodes pouvant descendre à -30°C avec le vent. Prépare-toi bien!", en: "Montreal averages -15°C in January, with wind chill making it feel like -30°C. Prepare accordingly!" }
      },
      {
        q: { fr: "Pour garder tes pieds au chaud par grand froid, tu choisis :", en: "To keep your feet warm in extreme cold, you choose:" },
        options: {
          fr: ["Des baskets avec 2 paires de chaussettes","Des bottines de cuir stylées","Des bottes d'hiver imperméables et isolées (-30°C)","Des bottes de pluie"],
          en: ["Sneakers with 2 pairs of socks","Stylish leather ankle boots","Waterproof insulated winter boots (-30°C)","Rain boots"]
        },
        correct: 2,
        explication: { fr: "Les bottes d'hiver certifiées -30°C sont indispensables à Montréal, Ottawa et dans la plupart des villes canadiennes.", en: "Winter boots rated to -30°C are essential in Montreal, Ottawa and most Canadian cities." }
      },
      {
        q: { fr: "Le phénomène du 'windchill' (refroidissement éolien) signifie :", en: "The 'windchill' phenomenon means:" },
        options: {
          fr: ["La température réelle sur le thermomètre","Le vent fort sans froid","La neige soufflée par le vent","La température ressentie avec le vent — peut être 10-15°C de moins"],
          en: ["The actual thermometer temperature","Strong wind without cold","Snow blown by the wind","The felt temperature with wind — can be 10-15°C colder"]
        },
        correct: 3,
        explication: { fr: "Le windchill peut rendre -15°C aussi dangereux que -25°C. La météo canadienne indique toujours les deux valeurs.", en: "Windchill can make -15°C feel as dangerous as -25°C. Canadian weather reports always show both values." }
      },
    ]
  },
  travail: {
    titre: { fr: 'Culture du travail', en: 'Work Culture' },
    emoji: '💼',
    color: '#FBBF24',
    questions: [
      {
        q: { fr: "Tu arrives à un entretien d'embauche. L'heure recommandée :", en: "You're going to a job interview. The recommended arrival time:" },
        options: {
          fr: ["5-10 minutes en avance","Exactement à l'heure","30 minutes en avance pour montrer ta motivation","1-2 minutes en avance"],
          en: ["5-10 minutes early","Exactly on time","30 minutes early to show motivation","1-2 minutes early"]
        },
        correct: 0,
        explication: { fr: "Arriver 5-10 minutes en avance est la norme. Trop en avance gêne l'employeur. En retard, même d'une minute, fait mauvaise impression.", en: "Arriving 5-10 minutes early is the norm. Too early can inconvenience the employer. Even 1 minute late makes a bad impression." }
      },
      {
        q: { fr: "70% des emplois au Canada se trouvent par :", en: "70% of jobs in Canada are found through:" },
        options: {
          fr: ["Les sites d'emploi (Indeed, LinkedIn)","Les agences de placement","Le réseau professionnel (bouche-à-oreille, contacts)","Les kiosques emploi dans les universités"],
          en: ["Job boards (Indeed, LinkedIn)","Staffing agencies","Professional networking (word of mouth, contacts)","University job fairs"]
        },
        correct: 2,
        explication: { fr: "Le marché caché de l'emploi représente 70% des postes. Développer ton réseau dès ton arrivée est crucial.", en: "The hidden job market accounts for 70% of positions. Building your network from day one is crucial." }
      },
      {
        q: { fr: "Un CV canadien ne doit PAS contenir :", en: "A Canadian resume should NOT contain:" },
        options: {
          fr: ["Tes réalisations chiffrées","Le nom de tes références","Tes compétences techniques","Ta photo et ton âge"],
          en: ["Your measurable achievements","The names of your references","Your technical skills","Your photo and age"]
        },
        correct: 3,
        explication: { fr: "Au Canada, les droits anti-discrimination interdisent de demander des infos personnelles comme l'âge, la photo ou la situation familiale.", en: "In Canada, anti-discrimination laws prohibit personal info like age, photo or family status on resumes." }
      },
      {
        q: { fr: "Dans une réunion d'équipe canadienne, tu dois :", en: "In a Canadian team meeting, you should:" },
        options: {
          fr: ["Parler uniquement si on te pose une question","Attendre la fin de la réunion pour donner ton avis","Participer activement, poser des questions et proposer des idées","Laisser le manager parler — c'est son rôle"],
          en: ["Only speak if asked","Wait until the end to share your opinion","Actively participate, ask questions and propose ideas","Let the manager talk — that's their role"]
        },
        correct: 2,
        explication: { fr: "La participation active est valorisée dans la culture de travail canadienne. Le silence peut être interprété comme un manque d'intérêt.", en: "Active participation is valued in Canadian work culture. Silence can be interpreted as lack of interest." }
      },
      {
        q: { fr: "Tu ne comprends pas une tâche donnée par ton superviseur. Tu :", en: "You don't understand a task given by your supervisor. You:" },
        options: {
          fr: ["Demandes des clarifications immédiatement","Essaies de te débrouiller pour ne pas paraître incompétent","Attends de voir si quelqu'un d'autre pose la question","Cherches secrètement sur internet"],
          en: ["Ask for clarification immediately","Try to figure it out to not look incompetent","Wait to see if someone else asks","Secretly search online"]
        },
        correct: 0,
        explication: { fr: "Demander des clarifications est vu positivement — cela montre que tu veux bien faire le travail. Le silence et les erreurs coûtent plus cher.", en: "Asking for clarification is seen positively — it shows you want to do the job right. Silence leading to errors is far more costly." }
      },
    ]
  },
  finances: {
    titre: { fr: 'Finances et banque', en: 'Finance & Banking' },
    emoji: '💳',
    color: '#F97316',
    questions: [
      {
        q: { fr: "Pour construire ta cote de crédit rapidement au Canada :", en: "To build your credit score quickly in Canada:" },
        options: {
          fr: ["Obtenir une carte de crédit sécurisée et la payer chaque mois","Épargner beaucoup d'argent","Éviter les cartes de crédit — trop risqué","Faire beaucoup de retraits au guichet"],
          en: ["Get a secured credit card and pay it in full monthly","Save a lot of money","Avoid credit cards — too risky","Make many ATM withdrawals"]
        },
        correct: 0,
        explication: { fr: "La cote de crédit est basée sur l'utilisation responsable du crédit. Une carte sécurisée payée mensuellement en totalité est la méthode la plus rapide.", en: "Credit score is built through responsible credit use. A secured card paid in full monthly is the fastest method for newcomers." }
      },
      {
        q: { fr: "La date limite pour la déclaration de revenus au Canada est :", en: "The income tax filing deadline in Canada is:" },
        options: {
          fr: ["31 mars","31 mai","1er juin","30 avril"],
          en: ["March 31","May 31","June 1","April 30"]
        },
        correct: 3,
        explication: { fr: "Le 30 avril est la date limite. Même sans revenus, déclarer te donne accès au crédit TPS/TVH — jusqu'à 300$/an automatique.", en: "April 30 is the deadline. Even without income, filing gives you access to the GST/HST credit — up to $300/year automatically." }
      },
      {
        q: { fr: "Le 'credit score' minimum recommandé pour louer un appartement au Canada est :", en: "The minimum recommended credit score to rent an apartment in Canada is:" },
        options: {
          fr: ["300–500","750–800","600–660","N'a pas d'importance"],
          en: ["300–500","750–800","600–660","Doesn't matter"]
        },
        correct: 2,
        explication: { fr: "La plupart des propriétaires exigent un score de 600+. Un score de 700+ donne accès aux meilleurs logements et taux de prêt.", en: "Most landlords require a score of 600+. A score of 700+ gives access to the best apartments and loan rates." }
      },
      {
        q: { fr: "Au Québec, il est ILLÉGAL pour un propriétaire de demander :", en: "In Quebec, it is ILLEGAL for a landlord to ask for:" },
        options: {
          fr: ["Une preuve de revenu","Une référence d'un ancien propriétaire","Une copie de ton permis de conduire","Un dépôt de garantie (dernier mois)"],
          en: ["Proof of income","A reference from a previous landlord","A copy of your driver's license","A security deposit (last month)"]
        },
        correct: 3,
        explication: { fr: "Au Québec, exiger un dépôt de garantie ou le paiement de plusieurs mois à l'avance est ILLÉGAL. Seul le premier mois de loyer peut être demandé.", en: "In Quebec, requiring a security deposit or multiple months' rent upfront is ILLEGAL. Only the first month's rent can be requested." }
      },
      {
        q: { fr: "Le NAS (Numéro d'Assurance Sociale) est nécessaire pour :", en: "The SIN (Social Insurance Number) is required for:" },
        options: {
          fr: ["Ouvrir un compte bancaire uniquement","Prendre les transports en commun","Travailler légalement et payer des impôts","Accéder aux soins de santé"],
          en: ["Opening a bank account only","Using public transit","Working legally and paying taxes","Accessing healthcare"]
        },
        correct: 2,
        explication: { fr: "Le NAS est obligatoire pour travailler, payer des impôts et accéder aux prestations sociales. Il faut l'obtenir dès les premières semaines.", en: "The SIN is mandatory for working, paying taxes and accessing social benefits. Get it in your first weeks." }
      },
    ]
  },
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
const getPct = (score, total) => total > 0 ? Math.round((score / total) * 100) : 0

const getResultat = (pct, lang) => {
  if (pct >= 80) return { label: lang==='fr'?'🏆 Expert canadien !':'🏆 Canadian Expert!', color:'#34D399' }
  if (pct >= 60) return { label: lang==='fr'?'🌟 Tu apprends vite !':'🌟 Fast learner!', color:'#FBBF24' }
  if (pct >= 40) return { label: lang==='fr'?'📚 Continue à explorer':'📚 Keep exploring', color:'#60A5FA' }
  return { label: lang==='fr'?'💡 La culture canadienne te réserve encore des surprises !':'💡 Canadian culture still has surprises for you!', color:'#F87171' }
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
export default function QuizCulture() {
  const { C, lang, user, sb } = useApp()

  const [ecran,       setEcran]       = useState('selection') // 'selection'|'quiz'|'resultats'
  const [catId,       setCatId]       = useState(null)
  const [qIndex,      setQIndex]      = useState(0)
  const [choix,       setChoix]       = useState(null)        // index sélectionné
  const [montre,      setMontre]      = useState(false)       // affiche correction
  const [score,       setScore]       = useState(0)
  const [scores,      setScores]      = useState({})          // meilleurs scores sauvegardés
  const [anim,        setAnim]        = useState(false)

  // Charge les meilleurs scores depuis localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem('novae_quiz_scores')
      if (s) setScores(JSON.parse(s))
    } catch {}
  }, [])

  const cat       = catId ? QUIZ_DATA[catId] : null
  const questions = cat?.questions || []
  const qActuelle = questions[qIndex]
  const options   = qActuelle?.options?.[lang] || qActuelle?.options?.fr || []

  const choisir = (idx) => {
    if (montre) return
    setChoix(idx)
    setMontre(true)
    if (idx === qActuelle.correct) setScore(s => s + 1)
  }

  const suivant = () => {
    setAnim(true)
    setTimeout(() => {
      setAnim(false)
      if (qIndex + 1 < questions.length) {
        setQIndex(q => q + 1)
        setChoix(null)
        setMontre(false)
      } else {
        // Fin du quiz
        const finalScore = choix === qActuelle.correct ? score + 1 : score
        const total      = questions.length
        terminer(finalScore, total)
      }
    }, 180)
  }

  const terminer = async (finalScore, total) => {
    // Sauvegarde locale
    const newScores = { ...scores, [catId]: Math.max(scores[catId] || 0, getPct(finalScore, total)) }
    setScores(newScores)
    try { localStorage.setItem('novae_quiz_scores', JSON.stringify(newScores)) } catch {}

    // Sauvegarde Supabase si connecté
    if (user && sb) {
      try {
        const { data: { session } } = await sb.auth.getSession()
        if (session?.access_token) {
          const res = await fetch('/api/quiz/sauvegarder', {
            method:  'POST',
            headers: { 'Content-Type':'application/json', Authorization:`Bearer ${session.access_token}` },
            body:    JSON.stringify({ categorie: catId, score: finalScore, total }),
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            console.warn('[quiz] Failed to save score:', body.error || res.statusText)
          }
        }
      } catch (e) {
        console.warn('[quiz] Failed to save score:', e.message)
      }
    }
    setScore(finalScore)
    setEcran('resultats')
  }

  const recommencer = () => {
    setQIndex(0); setChoix(null); setMontre(false); setScore(0); setEcran('quiz')
  }

  const autreCategorie = () => {
    setQIndex(0); setChoix(null); setMontre(false); setScore(0); setCatId(null); setEcran('selection')
  }

  const demarrer = (id) => {
    setCatId(id); setQIndex(0); setChoix(null); setMontre(false); setScore(0); setEcran('quiz')
  }

  const pct      = ecran === 'resultats' ? getPct(score, questions.length) : 0
  const resultat = ecran === 'resultats' ? getResultat(pct, lang) : null

  // ── ÉCRAN SÉLECTION ──────────────────────────────────────────
  if (ecran === 'selection') return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth:680, margin:'0 auto', padding:'36px 20px 80px' }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:-0.5, marginBottom:6 }}>
          🎮 {lang==='fr'?'Quiz culture canadienne':'Canadian Culture Quiz'}
        </h1>
        <p style={{ fontSize:14, color:C.muted, marginBottom:32, lineHeight:1.6 }}>
          {lang==='fr'
            ? 'Teste tes connaissances sur les codes sociaux, l\'hiver, le travail et les finances au Canada.'
            : 'Test your knowledge of social codes, winter, work and finances in Canada.'}
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {Object.entries(QUIZ_DATA).map(([id, cat]) => {
            const meilleur = scores[id]
            return (
              <button key={id} onClick={()=>demarrer(id)}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, cursor:'pointer', textAlign:'left', transition:'border-color 0.15s' }}>
                <div style={{ width:52, height:52, borderRadius:14, background:cat.color+'20', border:`1.5px solid ${cat.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                  {cat.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:4 }}>{cat.titre[lang]||cat.titre.fr}</p>
                  <p style={{ fontSize:12, color:C.muted }}>{cat.questions.length} {lang==='fr'?'questions':'questions'}</p>
                </div>
                {meilleur !== undefined ? (
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize:20, fontWeight:800, color: meilleur>=80?'#34D399':meilleur>=60?'#FBBF24':'#F87171' }}>{meilleur}%</p>
                    <p style={{ fontSize:10, color:C.muted }}>{lang==='fr'?'Meilleur score':'Best score'}</p>
                  </div>
                ) : (
                  <span style={{ fontSize:12, color:cat.color, fontWeight:600, flexShrink:0 }}>
                    {lang==='fr'?'Commencer →':'Start →'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <p style={{ fontSize:12, color:C.muted, textAlign:'center', marginTop:24 }}>
          {lang==='fr'?'Tes scores sont sauvegardés automatiquement.':'Your scores are saved automatically.'}
        </p>
      </main>
    </div>
  )

  // ── ÉCRAN QUIZ ───────────────────────────────────────────────
  if (ecran === 'quiz') return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth:640, margin:'0 auto', padding:'32px 20px 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={autreCategorie} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:12, cursor:'pointer' }}>
            ← {lang==='fr'?'Catégories':'Categories'}
          </button>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:700, color:cat.color }}>{cat.emoji} {cat.titre[lang]||cat.titre.fr}</p>
          </div>
          <p style={{ fontSize:13, color:C.muted, fontWeight:600 }}>
            {qIndex+1}/{questions.length}
          </p>
        </div>

        {/* Barre de progression */}
        <div style={{ height:5, background:C.border, borderRadius:3, overflow:'hidden', marginBottom:28 }}>
          <div style={{ width:`${((qIndex)/(questions.length))*100}%`, height:'100%', background:cat.color, borderRadius:3, transition:'width 0.4s' }} />
        </div>

        {/* Question */}
        <div style={{ opacity:anim?0:1, transition:'opacity 0.18s' }}>
          <p style={{ fontSize:18, fontWeight:700, color:C.text, lineHeight:1.5, marginBottom:24 }}>
            {qActuelle?.q?.[lang] || qActuelle?.q?.fr}
          </p>

          {/* Options */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
            {options.map((opt, i) => {
              const isCorrect  = i === qActuelle.correct
              const isSelected = i === choix
              const showResult = montre

              let bg     = C.surface
              let border = C.border
              let color  = C.text

              if (showResult) {
                if (isCorrect)                    { bg = 'rgba(52,211,153,0.12)'; border = '#34D399'; color = '#34D399' }
                else if (isSelected && !isCorrect){ bg = 'rgba(248,113,113,0.12)'; border = '#F87171'; color = '#F87171' }
                else                              { bg = C.surface; border = C.border; color = C.muted }
              } else if (isSelected) {
                bg = cat.color+'18'; border = cat.color; color = cat.color
              }

              return (
                <button key={i} onClick={()=>choisir(i)} disabled={montre}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:bg, border:`2px solid ${border}`, borderRadius:12, cursor:montre?'default':'pointer', textAlign:'left', transition:'all 0.15s', width:'100%' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:bg, border:`1.5px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontWeight:700, fontSize:13, color }}>
                    {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : String.fromCharCode(65+i)}
                  </div>
                  <p style={{ fontSize:14, color, lineHeight:1.5, fontWeight: isSelected||isCorrect&&showResult?600:400 }}>{opt}</p>
                </button>
              )
            })}
          </div>

          {/* Explication */}
          {montre && (
            <div style={{ padding:'14px 16px', background: choix===qActuelle.correct?'rgba(52,211,153,0.08)':'rgba(248,113,113,0.06)', border:`1px solid ${choix===qActuelle.correct?'#34D39930':'#F8717130'}`, borderRadius:12, marginBottom:20 }}>
              <p style={{ fontSize:13, color:C.text, lineHeight:1.7 }}>
                💡 {qActuelle.explication?.[lang] || qActuelle.explication?.fr}
              </p>
            </div>
          )}

          {/* Bouton suivant */}
          {montre && (
            <button onClick={suivant}
              style={{ width:'100%', padding:'13px', background:cat.color, border:'none', borderRadius:12, color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer' }}>
              {qIndex+1 < questions.length
                ? (lang==='fr'?'Question suivante →':'Next question →')
                : (lang==='fr'?'Voir mes résultats →':'See my results →')}
            </button>
          )}
        </div>
      </main>
    </div>
  )

  // ── ÉCRAN RÉSULTATS ──────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />
      <main style={{ maxWidth:560, margin:'0 auto', padding:'48px 20px 80px', textAlign:'center' }}>

        <p style={{ fontSize:56, marginBottom:16 }}>{cat?.emoji}</p>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>
          {resultat?.label}
        </h2>
        <p style={{ fontSize:14, color:C.muted, marginBottom:32 }}>
          {cat?.titre?.[lang]} · {lang==='fr'?`${score}/${questions.length} bonnes réponses`:`${score}/${questions.length} correct answers`}
        </p>

        {/* Score cercle */}
        <div style={{ width:140, height:140, borderRadius:'50%', background:`${resultat?.color}15`, border:`4px solid ${resultat?.color}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', margin:'0 auto 32px' }}>
          <p style={{ fontSize:40, fontWeight:900, color:resultat?.color, lineHeight:1 }}>{pct}%</p>
          <p style={{ fontSize:12, color:C.muted, marginTop:4 }}>{lang==='fr'?'Score':'Score'}</p>
        </div>

        {/* Barre score */}
        <div style={{ height:8, background:C.border, borderRadius:4, overflow:'hidden', marginBottom:32, maxWidth:300, margin:'0 auto 32px' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg, ${resultat?.color}80, ${resultat?.color})`, borderRadius:4, transition:'width 0.8s' }} />
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={recommencer}
            style={{ padding:'12px 24px', background:cat?.color, border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            ↺ {lang==='fr'?'Recommencer':'Try again'}
          </button>
          <button onClick={autreCategorie}
            style={{ padding:'12px 24px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:10, color:C.muted, fontWeight:600, fontSize:14, cursor:'pointer' }}>
            {lang==='fr'?'Autre catégorie →':'Another category →'}
          </button>
        </div>

        <p style={{ fontSize:12, color:C.muted, marginTop:24 }}>
          {lang==='fr'?'Score sauvegardé automatiquement.':'Score saved automatically.'}
        </p>
      </main>
    </div>
  )
}
