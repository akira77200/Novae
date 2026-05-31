import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { profile } = req.body;
  if (!profile?.id) return res.status(400).json({ error: 'Profil manquant' });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Tu es un conseiller bienveillant pour étudiants africains
francophones arrivant au Canada. Génère des recommandations PERSONNALISÉES.

Profil :
- Nom : ${profile.full_name || 'Non renseigné'}
- Pays d'origine : ${profile.pays_origine || 'Non renseigné'}
- Ville au Canada : ${profile.ville_accueil || 'Non renseignée'}
- Université : ${profile.universite || 'Non renseignée'}
- Programme : ${profile.programme || 'Non renseigné'}
- Statut : ${profile.statut || 'etudiant'}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "welcome_message": "Message chaleureux personnalisé de 2 phrases pour ${profile.full_name?.split(' ')[0] || 'toi'}",
  "books": [
    {"title": "...", "author": "...", "why": "Explication courte pourquoi ce livre", "emoji": "📚"},
    {"title": "...", "author": "...", "why": "...", "emoji": "📘"},
    {"title": "...", "author": "...", "why": "...", "emoji": "📗"}
  ],
  "tips": [
    {"text": "Conseil concret et actionnable", "category": "finance", "emoji": "💰"},
    {"text": "...", "category": "social", "emoji": "🤝"},
    {"text": "...", "category": "academique", "emoji": "🎓"},
    {"text": "...", "category": "sante", "emoji": "🏥"}
  ],
  "resources": [
    {"name": "...", "url": "https://...", "description": "...", "emoji": "🔗"},
    {"name": "...", "url": "https://...", "description": "...", "emoji": "🔗"}
  ]
}

Règles :
- Pour books : recommande des vrais livres avec vrais auteurs adaptés au programme
- Si programme contient statistique/math → livres académiques réels (ex: Casella & Berger)
- Si programme contient informatique → livres tech réels
- Si programme non renseigné → livres sur l'intégration au Canada + développement personnel
- Pour resources : URLs réelles et vérifiables (gouvernement canadien, université, etc.)
- Tout en français`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content[0].text.trim();
    const recommendations = JSON.parse(raw);

    // Sauvegarder dans Supabase avec la clé service (bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase
      .from('profiles')
      .update({ ai_recommendations: recommendations })
      .eq('id', profile.id);

    res.status(200).json({ success: true, recommendations });

  } catch (err) {
    console.error('[generate-recommendations]', err.message);
    res.status(500).json({ error: err.message });
  }
}
