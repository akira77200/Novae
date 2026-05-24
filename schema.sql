-- ================================================================
-- NOVAE v5 — Schéma Supabase complet
-- Exécuter en UNE SEULE FOIS dans SQL Editor → New query → Run
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  full_name           TEXT,
  email               TEXT,
  avatar_url          TEXT,
  pays_origine        TEXT,
  pays_accueil        TEXT DEFAULT 'Canada',
  ville_accueil       TEXT,
  ville_custom        TEXT,
  statut              TEXT CHECK (statut IN ('etudiant','travailleur','famille','autre')),
  date_arrivee        DATE,
  type_visa           TEXT,
  universite          TEXT,
  programme           TEXT,
  langue              TEXT DEFAULT 'fr',
  theme               TEXT DEFAULT 'dark',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_customer_id  TEXT UNIQUE
);

-- ── 2. MENTORS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentors (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  bio             TEXT,
  pays_origine    TEXT NOT NULL,
  pays_accueil    TEXT NOT NULL DEFAULT 'Canada',
  ville_accueil   TEXT,
  langues         TEXT[] DEFAULT ARRAY['fr'],
  annee_arrivee   INTEGER,
  sujets          TEXT[] DEFAULT ARRAY[]::TEXT[],
  niveau          TEXT DEFAULT 'etudiant' CHECK (niveau IN ('etudiant','professionnel','expert')),
  tarif_30min     INTEGER DEFAULT 1499,
  tarif_45min     INTEGER DEFAULT 1999,
  devise          TEXT DEFAULT 'cad',
  disponible      BOOLEAN DEFAULT TRUE,
  actif           BOOLEAN DEFAULT FALSE,
  calendly_url    TEXT,
  sessions_total  INTEGER DEFAULT 0,
  note_moyenne    NUMERIC(3,2) DEFAULT 0.00,
  avis_count      INTEGER DEFAULT 0
);

-- ── 3. SESSIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id                          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  utilisateur_id              UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentor_id                   UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  sujet                       TEXT NOT NULL,
  duree_minutes               INTEGER DEFAULT 30,
  statut                      TEXT DEFAULT 'en_attente'
                              CHECK (statut IN ('en_attente','confirme','termine','annule','rembourse')),
  date_heure                  TIMESTAMPTZ,
  montant                     INTEGER NOT NULL,
  devise                      TEXT DEFAULT 'cad',
  commission_novae            INTEGER,
  montant_mentor              INTEGER,
  stripe_checkout_session_id  TEXT UNIQUE,
  stripe_payment_intent_id    TEXT UNIQUE,
  paye_at                     TIMESTAMPTZ,
  note_utilisateur            INTEGER CHECK (note_utilisateur BETWEEN 1 AND 5),
  avis_texte                  TEXT
);

-- ── 4. TÂCHES SYSTÈME ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.taches (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titre           TEXT NOT NULL,
  titre_en        TEXT,
  categorie       TEXT,
  priorite        TEXT DEFAULT 'normale',
  pays_accueil    TEXT[],
  lien_officiel   TEXT,
  type_ressource  TEXT,
  ressource_id    TEXT,
  icone           TEXT,
  ordre           INTEGER DEFAULT 0,
  actif           BOOLEAN DEFAULT TRUE
);

-- ── 5. PROGRESSION TÂCHES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.taches_utilisateur (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  utilisateur_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tache_id        UUID REFERENCES public.taches(id) ON DELETE CASCADE,
  complete        BOOLEAN DEFAULT FALSE,
  complete_at     TIMESTAMPTZ,
  UNIQUE(utilisateur_id, tache_id)
);

-- ── 6. TODOS PERSONNELS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.todos (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  utilisateur_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre           TEXT NOT NULL,
  complete        BOOLEAN DEFAULT FALSE,
  complete_at     TIMESTAMPTZ
);

-- ── 7. ALERTES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alertes (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  utilisateur_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  titre           TEXT NOT NULL,
  message         TEXT,
  lien            TEXT,
  date_echeance   DATE NOT NULL,
  date_alerte     DATE NOT NULL,
  lu              BOOLEAN DEFAULT FALSE,
  complete        BOOLEAN DEFAULT FALSE
);

-- ── 8. GUIDES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guides (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  slug            TEXT UNIQUE NOT NULL,
  titre           TEXT NOT NULL,
  titre_en        TEXT,
  contenu         TEXT NOT NULL DEFAULT '',
  contenu_en      TEXT DEFAULT '',
  resume          TEXT,
  categorie       TEXT,
  pays_accueil    TEXT[],
  temps_lecture   INTEGER,
  gratuit         BOOLEAN DEFAULT TRUE,
  publie          BOOLEAN DEFAULT TRUE,
  ordre           INTEGER DEFAULT 0,
  vues            INTEGER DEFAULT 0
);

-- ── 9. PAIEMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.paiements (
  id                          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  utilisateur_id              UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id                  UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  stripe_payment_intent_id    TEXT UNIQUE,
  montant                     INTEGER NOT NULL,
  devise                      TEXT DEFAULT 'cad',
  statut                      TEXT DEFAULT 'en_attente',
  description                 TEXT
);

-- ================================================================
-- SÉCURITÉ RLS
-- ================================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taches_utilisateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taches             ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Mentors : lecture publique si actif, écriture propriétaire
CREATE POLICY "mentors_read"   ON public.mentors FOR SELECT USING (actif = TRUE OR auth.uid() = user_id);
CREATE POLICY "mentors_insert" ON public.mentors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mentors_update" ON public.mentors FOR UPDATE USING (auth.uid() = user_id);

-- Sessions
CREATE POLICY "sessions_own" ON public.sessions FOR ALL
  USING (auth.uid() = utilisateur_id OR
         auth.uid() = (SELECT user_id FROM public.mentors WHERE id = mentor_id));

-- Tâches utilisateur
CREATE POLICY "taches_user_own" ON public.taches_utilisateur FOR ALL USING (auth.uid() = utilisateur_id);

-- Todos
CREATE POLICY "todos_own" ON public.todos FOR ALL USING (auth.uid() = utilisateur_id);

-- Alertes
CREATE POLICY "alertes_own" ON public.alertes FOR ALL USING (auth.uid() = utilisateur_id);

-- Guides : lecture publique
CREATE POLICY "guides_read" ON public.guides FOR SELECT USING (publie = TRUE);

-- Tâches : lecture publique
CREATE POLICY "taches_read" ON public.taches FOR SELECT USING (actif = TRUE);

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ================================================================
-- DONNÉES DE BASE — Guides gratuits
-- ================================================================

INSERT INTO public.guides (slug, titre, titre_en, resume, contenu, contenu_en, categorie, pays_accueil, temps_lecture, gratuit, ordre) VALUES

('ramq', 'Inscription RAMQ : fais-le cette semaine',
'RAMQ Registration: Do It This Week',
'Tu as 3 mois après ton arrivée. La majorité des étudiants ratent cette fenêtre.',
E'## Qu''est-ce que la RAMQ ?\nLa Régie de l''assurance maladie du Québec couvre tes soins de santé.\n\n## La règle des 3 mois\nTu as exactement 3 mois après ton arrivée pour t''inscrire. Une visite aux urgences sans couverture coûte entre 800 et 2 500 $.\n\n## Documents nécessaires\n- Passeport valide\n- Permis d''études ou de travail\n- Preuve d''adresse québécoise\n\n## Où s''inscrire\nTout bureau RAMQ — sans rendez-vous. Durée : 20 minutes.\nwww.ramq.gouv.qc.ca\n\n## L''erreur classique\nL''assurance de l''université ne remplace PAS la RAMQ.',
E'## What is RAMQ?\nThe Régie de l''assurance maladie du Québec covers your healthcare in Quebec.\n\n## The 3-month rule\nYou have exactly 3 months after arrival to register. An ER visit without coverage costs $800–$2,500.\n\n## Required documents\n- Valid passport\n- Study or work permit\n- Quebec proof of address\n\n## Where to register\nAny RAMQ office — no appointment needed. Duration: 20 minutes.',
'sante', ARRAY['Canada'], 3, TRUE, 1),

('banque', 'Ouvrir un compte bancaire sans historique',
'Open a Bank Account Without Credit History',
'Tu n''as pas besoin de NAS dès le Jour 1.',
E'## Ce que tu peux faire dès le Jour 1\nTu n''as pas besoin de ton NAS. Apporte ton passeport et ton permis d''études.\n\n## Quelle banque choisir\n- Banque Nationale : compte étudiant 0$ de frais\n- Desjardins : coopérative, excellente réputation\n- TD : bonne pour les services en anglais\n\n## Important\nAjoute ton NAS plus tard. N''attends pas pour ouvrir le compte.',
E'## What you can do from Day 1\nYou don''t need your SIN. Bring your passport and study permit.\n\n## Which bank to choose\n- Banque Nationale: free student account\n- Desjardins: cooperative, excellent reputation\n- TD: good for English services',
'banque', ARRAY['Canada'], 4, TRUE, 2),

('credit', 'La cote de crédit : construis-la dès le mois 1',
'Credit Score: Build It From Month 1',
'80% des étudiants la découvrent trop tard.',
E'## Pourquoi c''est important\nSans cote de crédit, tu ne peux pas louer seul, obtenir un prêt, ni certains emplois.\n\n## Le plan en 6 mois\n1. Secured Visa Banque Nationale (dépôt 200–500$)\n2. Utilise pour l''épicerie chaque mois\n3. Rembourse EN TOTALITÉ avant la date limite\n4. En 6 mois : cote correcte établie\n\n## L''erreur fatale\nPayer seulement le minimum. Intérêts à 20%/an.',
E'## Why it matters\nWithout a credit score, you can''t rent alone, get a loan, or some jobs.\n\n## The 6-month plan\n1. Secured Visa Banque Nationale (deposit $200–500)\n2. Use it for groceries each month\n3. Pay IN FULL before the due date\n4. In 6 months: established credit score',
'banque', ARRAY['Canada'], 5, TRUE, 3),

('logement', 'Logement : 5 arnaques à éviter',
'Housing: 5 Scams to Avoid',
'Le dépôt de garantie est illégal au Québec.',
E'## Les 5 arnaques principales\n\n**1. Dépôt de garantie illégal**\nAu Québec, c''est ILLÉGAL. Refuse toujours.\n\n**2. Bail non écrit**\nInsiste toujours sur un bail signé.\n\n**3. Loyer trop cher près de l''université**\nRosemont coûte 200$ de moins que CDN pour le même trajet.\n\n**4. Fausses annonces Kijiji**\nVisite toujours avant de payer.\n\n**5. Sous-louer sans accord**\nIllégal au Québec.',
E'## The 5 main scams\n\n**1. Illegal security deposit**\nIn Quebec, this is ILLEGAL. Always refuse.\n\n**2. No written lease**\nAlways insist on a signed lease.\n\n**3. Overpriced rent near university**\nRosemont costs $200 less than NDG for the same commute.\n\n**4. Fake Kijiji listings**\nAlways visit before paying.\n\n**5. Subletting without consent**\nIllegal in Quebec.',
'logement', ARRAY['Canada'], 4, TRUE, 4),

('impots', 'Impôts : ne rate pas tes crédits',
'Taxes: Don''t Miss Your Credits',
'Économise 300 à 800$ en déclarant correctement.',
E'## Date limite : 30 avril\nMême sans revenus, déclare pour recevoir tes crédits.\n\n## Les crédits disponibles\n- Crédit TPS/TVH : 60–300$/an automatique\n- Crédit frais de scolarité (T2202)\n- Crédit de résidence (Québec)\n\n## Déclarer gratuitement\n- Wealthsimple Tax : gratuit, en français\n- Cliniques bénévoles en université (mars–avril)',
E'## Deadline: April 30\nEven without income, file to receive your credits.\n\n## Available credits\n- GST/HST credit: $60–300/year automatic\n- Tuition credit (T2202)\n- Quebec residence credit\n\n## File for free\n- Wealthsimple Tax: free, available in French\n- Volunteer clinics at university (March–April)',
'admin', ARRAY['Canada'], 3, TRUE, 5)

ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- DONNÉES DE BASE — Tâches Canada
-- ================================================================

INSERT INTO public.taches (titre, titre_en, categorie, priorite, pays_accueil, lien_officiel, icone, ordre) VALUES
('Obtenir ton NAS (Numéro d''Assurance Sociale)', 'Get your SIN (Social Insurance Number)', 'admin', 'critique', ARRAY['Canada'], 'https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html', '🪪', 1),
('Ouvrir un compte bancaire étudiant', 'Open a student bank account', 'banque', 'critique', ARRAY['Canada'], NULL, '🏦', 2),
('S''inscrire à la RAMQ', 'Register for RAMQ', 'sante', 'critique', ARRAY['Canada'], 'https://www.ramq.gouv.qc.ca/fr/citoyens/assurance-maladie/inscription', '🏥', 3),
('Demander une carte de crédit sécurisée', 'Apply for a secured credit card', 'banque', 'haute', ARRAY['Canada'], NULL, '💳', 4),
('Activer le permis de travail hors campus', 'Activate off-campus work permit', 'admin', 'haute', ARRAY['Canada'], 'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/permis-travail/hors-campus.html', '📋', 5),
('S''inscrire à l''assurance maladie universitaire', 'Register for university health insurance', 'sante', 'haute', ARRAY['Canada'], NULL, '🩺', 6),
('Explorer les quartiers et le transport', 'Explore neighborhoods and transit', 'logement', 'normale', ARRAY['Canada'], NULL, '🗺️', 7),
('Rejoindre un groupe de compatriotes', 'Join a community group', 'social', 'normale', ARRAY['Canada'], NULL, '🤝', 8),
('Comprendre ton programme universitaire', 'Understand your university program', 'univ', 'haute', ARRAY['Canada'], NULL, '🎓', 9),
('Préparer ta déclaration d''impôts', 'Prepare your tax return', 'admin', 'critique', ARRAY['Canada'], 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/faire-impots.html', '📊', 10)
ON CONFLICT DO NOTHING;

-- ================================================================
-- VÉRIFICATION
-- ================================================================
SELECT
  (SELECT COUNT(*) FROM public.profiles)  AS profiles,
  (SELECT COUNT(*) FROM public.guides)    AS guides,
  (SELECT COUNT(*) FROM public.taches)    AS taches,
  (SELECT COUNT(*) FROM public.mentors)   AS mentors,
  'NOVAE v5 prêt ✓' AS statut;
