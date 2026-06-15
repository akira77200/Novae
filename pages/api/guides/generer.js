// pages/api/guides/generer.js — NOVAE v5 — Guides PDF statiques complets

const GUIDES_COMPLETS = {
  ramq: {
    titre: 'Guide RAMQ — Assurance maladie Québec',
    titre_en: 'RAMQ Guide — Quebec Health Insurance',
    contenu: `GUIDE COMPLET — RAMQ
Assurance maladie du Québec
Pour les nouveaux arrivants au Canada

═══════════════════════════════════════════════

1. QU'EST-CE QUE LA RAMQ ?

La Régie de l'assurance maladie du Québec (RAMQ)
est le programme d'assurance maladie provincial
du Québec. Elle couvre les soins médicaux
essentiels pour les résidents du Québec.

Qui est couvert :
• Citoyens canadiens résidant au Québec
• Résidents permanents au Québec
• Étudiants internationaux avec permis
  d'études valide de 6 mois ou plus
• Travailleurs avec permis de travail valide


2. LE DÉLAI DE CARENCE — IMPORTANT ⚠️

Tu dois attendre 3 mois avant d'être couvert
par la RAMQ.

Les 3 mois commencent à compter du premier jour
du mois suivant ton arrivée au Québec.

Exemple : Si tu arrives le 15 septembre,
le délai commence le 1er octobre.
Tu seras couvert à partir du 1er janvier.

Pendant ce délai, tu dois avoir une assurance
privée obligatoirement.
La plupart des universités offrent une assurance
étudiante — inscris-toi dès ton arrivée.


3. DOCUMENTS REQUIS POUR S'INSCRIRE

Documents obligatoires :
□  Passeport valide
□  Permis d'études ou de travail valide
□  Preuve de résidence au Québec
   (bail, facture, lettre université)
□  Formulaire d'inscription RAMQ
   (disponible en ligne ou par la poste)

Documents supplémentaires selon ton statut :
• Étudiant : lettre d'admission de l'université
• Travailleur : contrat de travail
• Réfugié : document d'Immigration Canada


4. COMMENT S'INSCRIRE — ÉTAPES

Étape 1 : Télécharge le formulaire
Rends-toi sur www.ramq.gouv.qc.ca
Section : Citoyens → Assurance maladie → Inscription

Étape 2 : Remplis le formulaire
Formulaire ADH-005 pour les nouveaux arrivants
Disponible en français et en anglais

Étape 3 : Envoie tes documents
Par la poste :
  RAMQ
  Case postale 6600
  Québec (Québec) G1K 7T3

Ou en personne dans un bureau RAMQ :
  Montréal : 500, boul. René-Lévesque O.
  Québec : 2050, rue de Bleury

Étape 4 : Reçois ta carte
Délai : 3 à 4 semaines après réception
de ta demande complète


5. CE QUI EST COUVERT

✅ Consultations chez le médecin
✅ Soins à l'hôpital
✅ Chirurgies
✅ Analyses de laboratoire (prescrites)
✅ Radiographies (prescrites)
✅ Soins d'urgence

❌ Non couvert par la RAMQ :
• Médicaments (couvert par un autre régime)
• Soins dentaires (sauf urgences)
• Soins de la vue
• Ambulance (frais partiels)
• Médecine alternative


6. RÉGIME D'ASSURANCE MÉDICAMENTS

Séparé de la RAMQ, le régime public couvre
les médicaments pour ceux sans assurance privée.

Si ton université ou employeur offre une
assurance privée avec médicaments, tu peux
te désinscrire du régime public.

Coût : environ 90$ par mois (2024-2025)


7. RENOUVELLEMENT

Ta carte RAMQ expire en même temps que
ton statut d'immigration.

Renouvelle-la dès que tu renouvelles
ton permis. N'attends pas l'expiration.


8. CONTACTS UTILES

RAMQ : 1-800-561-9749 (gratuit)
Site web : www.ramq.gouv.qc.ca
Heures : Lundi-Vendredi 8h30-16h30

Urgences médicales : 911
Info-Santé (conseil médical par téléphone) : 811`,

    contenu_en: `COMPLETE GUIDE — RAMQ
Quebec Health Insurance
For newcomers to Canada

═══════════════════════════════════════════════

1. WHAT IS RAMQ?

The Régie de l'assurance maladie du Québec (RAMQ)
is Quebec's provincial health insurance program.
It covers essential medical care for Quebec residents.

Who is covered:
• Canadian citizens residing in Quebec
• Permanent residents in Quebec
• International students with a valid study permit
  of 6 months or more
• Workers with a valid work permit


2. THE WAITING PERIOD — IMPORTANT ⚠️

You must wait 3 months before being covered by RAMQ.

The 3 months begin on the first day of the month
following your arrival in Quebec.

Example: If you arrive on September 15,
the period starts October 1.
You will be covered from January 1.

During this period, you must have private insurance.
Most universities offer student insurance —
enroll as soon as you arrive.


3. REQUIRED DOCUMENTS TO REGISTER

Mandatory documents:
□  Valid passport
□  Valid study or work permit
□  Proof of residence in Quebec
   (lease, bill, university letter)
□  RAMQ registration form
   (available online or by mail)


4. HOW TO REGISTER — STEPS

Step 1: Download the form
Go to www.ramq.gouv.qc.ca
Section: Citizens → Health Insurance → Registration

Step 2: Fill out form ADH-005 for newcomers

Step 3: Send your documents
By mail:
  RAMQ, Case postale 6600
  Québec (Québec) G1K 7T3

Step 4: Receive your card
Timeframe: 3 to 4 weeks after receipt


5. WHAT IS COVERED

✅ Doctor consultations
✅ Hospital care
✅ Surgeries
✅ Lab tests (prescribed)
✅ X-rays (prescribed)
✅ Emergency care

❌ NOT covered by RAMQ:
• Medications (covered by another plan)
• Dental care (except emergencies)
• Vision care
• Ambulance (partial costs)


6. USEFUL CONTACTS

RAMQ: 1-800-561-9749 (toll-free)
Website: www.ramq.gouv.qc.ca
Hours: Monday-Friday 8:30am-4:30pm

Medical emergencies: 911
Health advice line: 811`,
  },

  nas: {
    titre: "Guide NAS — Numéro d'Assurance Sociale",
    titre_en: 'SIN Guide — Social Insurance Number',
    contenu: `GUIDE COMPLET — NAS
Numéro d'Assurance Sociale
Pour les nouveaux arrivants au Canada

═══════════════════════════════════════════════

1. QU'EST-CE QUE LE NAS ?

Le Numéro d'Assurance Sociale (NAS) est un
numéro à 9 chiffres qui t'identifie pour :
• Travailler légalement au Canada
• Payer des impôts
• Accéder aux programmes gouvernementaux
• Ouvrir certains comptes bancaires

⚠️ URGENT : Fais cette démarche dans les
PREMIERS JOURS de ton arrivée.
Sans NAS tu ne peux pas travailler légalement.


2. QUI PEUT OBTENIR UN NAS

✅ Citoyens canadiens
✅ Résidents permanents
✅ Permis de travail (ouvert ou fermé)
✅ Permis d'études avec autorisation de travail
✅ Réfugiés avec document valide

❌ Touristes et visiteurs : non éligibles

Note pour étudiants : Ton permis d'études
doit mentionner explicitement que tu es
autorisé à travailler (off-campus ou on-campus).


3. DOCUMENTS REQUIS

Document principal (UN seul requis) :
□  Passeport avec visa/permis canadien
□  Permis d'études valide
□  Permis de travail valide
□  Carte de résident permanent

Document secondaire (preuve d'identité) :
□  Passeport étranger
□  Carte d'identité nationale


4. OÙ ET COMMENT FAIRE LA DEMANDE

Option 1 — En personne (recommandé)
Centre Service Canada le plus proche

Trouver un centre :
www.servicecanada.gc.ca → Trouver un bureau

Documents à apporter : originaux + photocopies
Délai : Reçois ton NAS le jour même en général
(si documents complets)

Option 2 — Par la poste
Envoie copies certifiées conformes à :
Service Canada — Centre des opérations du NAS
Délai : 20 jours ouvrables

Option 3 — En ligne (limité)
Disponible pour certains statuts seulement
sur www.canada.ca/nas


5. TYPES DE NAS

NAS commençant par 9 :
Temporaire — valide tant que ton permis est valide
Doit être renouvelé avec ton permis

NAS commençant par 1-8 :
Permanent — pour citoyens et résidents permanents


6. PROTÉGER TON NAS ⚠️

Le NAS est CONFIDENTIEL.

À faire :
✅ Mémorise-le ou garde-le en lieu sûr
✅ Ne le donne qu'aux employeurs et banques
✅ Garde ta carte NAS en sécurité

À ne jamais faire :
❌ Ne le communique pas par email ou téléphone
❌ Ne le donne pas à des inconnus
❌ Ne le publie nulle part en ligne

En cas de vol d'identité :
Appelle Service Canada : 1-800-206-7218


7. RENOUVELLEMENT

Si ton NAS commence par 9 (temporaire) :
Renouvelle-le dès que tu renouvelles ton permis.
Apporte ton nouveau permis au bureau Service Canada.


8. CONTACTS

Service Canada : 1-800-206-7218
Site web : www.canada.ca/nas
Heures : Lundi-Vendredi 8h30-16h30`,
  },

  banque: {
    titre: 'Guide Bancaire — Ouvrir un compte au Canada',
    titre_en: 'Banking Guide — Open a Bank Account in Canada',
    contenu: `GUIDE COMPLET — COMPTE BANCAIRE
Ouvrir un compte au Canada
Pour les nouveaux arrivants

═══════════════════════════════════════════════

1. POURQUOI OUVRIR UN COMPTE RAPIDEMENT

Ouvrir un compte bancaire est une des premières
choses à faire au Canada. Voici pourquoi :

• Recevoir ton salaire par virement direct
• Payer ton loyer et tes factures
• Construire ta cote de crédit (essentiel !)
• Éviter les frais de change
• Accéder aux services gouvernementaux
• Envoyer de l'argent dans ton pays

Délai recommandé : Dans les 7 premiers jours.


2. LES GRANDES BANQUES CANADIENNES

TD Bank (Toronto-Dominion)
✅ Très présente, service en français
✅ Compte étudiant sans frais mensuels
✅ Application mobile excellente

RBC (Banque Royale du Canada)
✅ La plus grande banque canadienne
✅ Programme spécial nouveaux arrivants
✅ Service en plusieurs langues

BMO (Banque de Montréal)
✅ Bonne présence au Québec
✅ Compte étudiant avantageux

Scotiabank
✅ Programme "StartRight" pour immigrants
✅ Partenariats internationaux

CIBC
✅ Programme pour nouveaux arrivants
✅ Bon service en ligne

Banques québécoises :
• Desjardins — Coopérative, très présente au Québec
• Banque Nationale — Forte présence au Québec


3. COMPTES ÉTUDIANTS — SANS FRAIS

Tous les étudiants peuvent bénéficier de :
• Compte chèques sans frais mensuels
• Transactions illimitées
• Carte de débit gratuite
• Applications mobiles

Documents requis pour compte étudiant :
□  Passeport
□  Lettre d'admission ou carte étudiante
□  Permis d'études (pour étudiants internationaux)


4. COMMENT OUVRIR UN COMPTE

Étape 1 : Choisir ta banque
Compare les offres en ligne avant d'y aller.
Prends rendez-vous si possible.

Étape 2 : Préparer tes documents
□  2 pièces d'identité (passeport + permis)
□  Preuve d'adresse (bail ou lettre université)
□  NAS (si tu l'as déjà)
□  Dépôt initial (souvent non requis)

Étape 3 : Ouvrir le compte
En personne dans une succursale (recommandé)
ou en ligne sur le site de la banque.

Étape 4 : Commander ta carte
La carte de débit arrive en 5-10 jours.
Tu peux utiliser l'application mobile immédiatement.


5. CARTE DE DÉBIT VS CARTE DE CRÉDIT

Carte de débit (Interac) :
• Accès direct à ton argent
• Fonctionne partout au Canada
• Aucun intérêt à payer
• Ne construit PAS ta cote de crédit

Carte de crédit :
• Dépense maintenant, paye dans 30 jours
• CONSTRUIT TA COTE DE CRÉDIT (crucial !)
• Avantages et récompenses possibles
• Risque de dette si mal gérée

→ Idéal : avoir les deux et payer la carte
  de crédit en entier chaque mois.


6. CONSTRUIRE SA COTE DE CRÉDIT

La cote de crédit est ESSENTIELLE au Canada pour :
• Louer un appartement
• Obtenir un prêt ou hypothèque
• Obtenir une meilleure carte de crédit
• Parfois pour un emploi

Comment démarrer sans historique :
1. Demande une carte de crédit sécurisée
   (secured credit card) — dépôt de 200-500$
2. Utilise-la pour de petits achats mensuels
3. Paye le solde COMPLET chaque mois
4. Après 6-12 mois : cote de crédit établie

Objectif : Score de 700+ en 12-18 mois


7. TRANSFERTS INTERNATIONAUX

Pour envoyer de l'argent dans ton pays :
• Wise (anciennement TransferWise) —
  meilleur taux, peu de frais
• Western Union — rapide, disponible partout
• MoneyGram — bonne option
• Via ta banque — plus cher mais sécurisé

Compare toujours les taux avant d'envoyer.


8. CONTACTS UTILES

TD : 1-866-222-3456 | td.com/fr
RBC : 1-800-769-2511 | rbc.com/fr
BMO : 1-877-225-5266 | bmo.com/fr
Scotiabank : 1-800-472-6842 | scotiabank.com
CIBC : 1-800-465-2422 | cibc.com/fr
Desjardins : 1-800-224-7737 | desjardins.com`,
  },

  credit: {
    titre: 'Guide Crédit — Construire sa cote de crédit',
    titre_en: 'Credit Guide — Build Your Credit Score',
    contenu: `GUIDE COMPLET — COTE DE CRÉDIT
Construire son crédit au Canada
Pour les nouveaux arrivants

═══════════════════════════════════════════════

1. QU'EST-CE QUE LA COTE DE CRÉDIT ?

La cote de crédit (credit score) est un chiffre
entre 300 et 900 qui mesure ta fiabilité
financière aux yeux des prêteurs.

Plus ton score est élevé, plus tu es fiable.

Échelle :
300-559 : Mauvais (difficile d'obtenir du crédit)
560-659 : Passable (conditions moins avantageuses)
660-724 : Bon (accès à la plupart des produits)
725-759 : Très bon (bonnes conditions)
760-900 : Excellent (meilleures conditions)

Objectif nouveaux arrivants : 700+ en 12-18 mois


2. POURQUOI C'EST CRUCIAL AU CANADA

Sans bonne cote de crédit, tu auras du mal à :
❌ Louer un appartement (les propriétaires vérifient)
❌ Obtenir un prêt auto ou hypothécaire
❌ Avoir une carte de crédit standard
❌ Parfois même pour certains emplois

Chaque mois sans construire ton crédit =
un mois perdu. Commence DÈS ton arrivée.


3. COMMENT LA COTE EST CALCULÉE

Historique de paiements (35%) :
→ Paies-tu tes factures à temps ?

Utilisation du crédit (30%) :
→ Utilises-tu moins de 30% de ta limite ?

Durée du crédit (15%) :
→ Depuis combien de temps as-tu du crédit ?

Types de crédit (10%) :
→ As-tu différents types de crédit ?

Nouvelles demandes (10%) :
→ As-tu récemment demandé beaucoup de crédit ?


4. PLAN D'ACTION — 12 MOIS

MOIS 1-2 : DÉMARRAGE
□  Ouvre un compte bancaire
□  Demande une carte de crédit sécurisée
   (Secured Credit Card)
   Dépôt requis : 200-500$
   Recommandées : Home Trust Secured Visa,
   Capital One Secured Mastercard
□  Utilise la carte pour 1-2 achats/mois
□  Configure le paiement automatique du
   solde complet

MOIS 3-6 : DÉVELOPPEMENT
□  Vérifie ta cote sur Borrowell ou
   Credit Karma (gratuit)
□  Continue à payer à temps
□  Garde l'utilisation sous 30% de la limite
□  Ne ferme pas tes comptes (même inutilisés)

MOIS 6-12 : PROGRESSION
□  Demande une augmentation de limite
□  Considère une carte non-sécurisée standard
□  Continue les bonnes habitudes

APRÈS 12 MOIS :
□  Score cible : 700+
□  Tu peux maintenant louer sans garant
□  Accès aux meilleures cartes de crédit


5. ERREURS À ÉVITER

❌ Payer seulement le minimum mensuel
   (les intérêts s'accumulent rapidement : 20%+)

❌ Dépasser 30% de ta limite de crédit
   Exemple : Limite 500$ → utilise max 150$

❌ Faire trop de demandes de crédit en peu
   de temps (chaque demande diminue ton score)

❌ Fermer de vieux comptes (réduit l'historique)

❌ Ignorer tes relevés (surveille les fraudes)


6. SURVEILLER SA COTE GRATUITEMENT

Borrowell : borrowell.com/fr
→ Score Equifax gratuit chaque semaine

Credit Karma Canada : creditkarma.ca
→ Score TransUnion gratuit

Ces vérifications ne diminuent PAS ton score.


7. CONTACTS

Equifax Canada : 1-800-465-7166
TransUnion Canada : 1-800-663-9980`,
  },

  impots: {
    titre: 'Guide Impôts — Déclaration de revenus Canada',
    titre_en: 'Tax Guide — Canadian Tax Return',
    contenu: `GUIDE COMPLET — IMPÔTS
Déclaration de revenus au Canada
Pour les nouveaux arrivants

═══════════════════════════════════════════════

1. POURQUOI DÉCLARER SES IMPÔTS

Au Canada, déclarer ses impôts est OBLIGATOIRE
si tu as eu des revenus. Mais même sans revenus,
il est FORTEMENT recommandé de déclarer pour :

✅ Recevoir des remboursements d'impôt
✅ Accéder aux crédits et prestations :
   • TPS/TVH (crédit trimestriel)
   • Allocation canadienne pour enfants
   • Crédits provinciaux
✅ Construire un historique fiscal (pour PR)
✅ Éviter les pénalités


2. DATES IMPORTANTES

Date limite déclaration : 30 AVRIL chaque année
(pour les revenus de l'année précédente)

Exception travailleurs autonomes : 15 juin
(mais impôts dus le 30 avril quand même)

Si tu arrives en cours d'année :
Tu déclares pour la période où tu étais au Canada.


3. DEUX DÉCLARATIONS AU QUÉBEC

Si tu vis au Québec, tu dois faire
DEUX déclarations :

1. Fédérale (Agence du revenu du Canada - ARC)
2. Provinciale (Revenu Québec)

Dans les autres provinces : une seule déclaration.


4. DOCUMENTS À RASSEMBLER

En janvier-février, collecte ces documents :

□  T4 — Revenus d'emploi
   (fourni par ton employeur)

□  T4A — Bourses, subventions, revenus divers

□  T2202 — Frais de scolarité
   (fourni par ton université)
   → Crédit d'impôt important !

□  Reçus de déménagement
   (si déménagement pour études ou travail)

□  Feuillets d'intérêts bancaires (T5)

□  NAS (obligatoire)

□  Avis de cotisation de l'année précédente
   (si applicable)


5. LOGICIELS GRATUITS

Wealthsimple Impôt (anciennement SimpleTax) :
→ simpletax.ca — Gratuit, en français
→ Le plus recommandé pour étudiants

TurboImpôt :
→ turbotax.intuit.ca — Gratuit pour revenus simples

Cliniques d'impôts GRATUITES :
Disponibles dans toutes les universités
pendant la saison des impôts (mars-avril).
Cherche "clinique d'impôts" + nom de ta ville.


6. CRÉDITS IMPORTANTS POUR ÉTUDIANTS

Frais de scolarité (T2202) :
→ Crédit fédéral de 15% sur tes frais
→ Transférable à un proche si revenus insuffisants

Crédit pour la TPS/TVH :
→ Jusqu'à 500$/an selon tes revenus
→ Versé trimestriellement

Frais de déménagement :
→ Si tu déménages à 40+ km pour études/travail
→ Déductible des revenus d'emploi ou bourses


7. APRÈS LA DÉCLARATION

Avis de cotisation :
Reçu 2-8 semaines après ta déclaration
Vérifie que tout est correct.

Remboursement :
En général dans les 2-3 semaines
(par dépôt direct si configuré)

En cas d'erreur :
Tu as 10 ans pour modifier une déclaration
passée — ne panique pas.


8. CONTACTS

ARC (fédéral) : 1-800-959-7383
Revenu Québec : 1-800-267-6299
Mon dossier ARC : canada.ca/mon-dossier-arc`,
  },

  logement: {
    titre: 'Guide Logement — Trouver un appartement',
    titre_en: 'Housing Guide — Find an Apartment',
    contenu: `GUIDE COMPLET — LOGEMENT
Trouver un appartement au Canada
Pour les nouveaux arrivants

═══════════════════════════════════════════════

1. TYPES DE LOGEMENT DISPONIBLES

Résidence universitaire :
✅ Pratique, sécurisé, communauté étudiante
✅ Tout inclus (meubles, internet, électricité)
✅ Proche du campus
❌ Plus cher, règles strictes
❌ Places limitées — réserver tôt !
Prix moyen : 700-1200$/mois

Colocation (roommate) :
✅ Moins cher que vivre seul
✅ Souvent meublé
✅ Bonne façon de rencontrer des gens
❌ Moins d'intimité
Prix moyen par chambre : 500-900$/mois

Studio/1 chambre :
✅ Indépendance totale
❌ Plus cher, souvent non meublé
Prix moyen : 1000-1800$/mois (selon ville)


2. BUDGET PAR VILLE (2024-2025)

Montréal :
  Chambre coloc : 600-850$/mois
  Studio : 1000-1400$/mois
  1 chambre : 1200-1700$/mois

Toronto :
  Chambre coloc : 900-1200$/mois
  Studio : 1600-2200$/mois
  1 chambre : 1800-2500$/mois

Ottawa :
  Chambre coloc : 700-950$/mois
  Studio : 1200-1600$/mois
  1 chambre : 1400-1900$/mois

Vancouver :
  Chambre coloc : 1000-1400$/mois
  Studio : 1800-2500$/mois
  1 chambre : 2200-3000$/mois

Calgary :
  Chambre coloc : 700-950$/mois
  Studio : 1200-1600$/mois
  1 chambre : 1400-1800$/mois


3. OÙ CHERCHER

Sites recommandés :
• Kijiji.ca — Le plus populaire au Canada
• Rentals.ca — Annonces vérifiées
• PadMapper.com — Vue carte interactive
• Facebook Marketplace — Groupes locaux

Résidences universitaires :
→ Site web de ton université → Housing/Logement
⚠️ Réserve dès que tu as ta lettre d'admission !


4. ÉVITER LES ARNAQUES

Signes d'arnaque :
❌ Prix trop bas pour le quartier
❌ Propriétaire à l'étranger
❌ Demande de paiement par virement
   Western Union ou MoneyGram
❌ Refuse de te montrer l'appartement
❌ Demande un dépôt avant visite

Règles de sécurité :
✅ Visite toujours l'appartement en personne
✅ Ne paye jamais avant de signer un bail
✅ Cherche le propriétaire en ligne
✅ Si trop beau pour être vrai, c'est une arnaque


5. COMPRENDRE LE BAIL

Le bail est un contrat légal. Lis-le ATTENTIVEMENT.

Points importants :
• Durée : généralement 12 mois ou mensuel
• Loyer : montant exact et date de paiement
• Inclusions : eau, chauffage, électricité ?
• Animaux : autorisés ou non ?
• Sous-location : permise ou non ?

Au Québec :
✅ Bail obligatoirement en français (si demandé)
✅ Formulaire de bail standard (F.L.R.)
✅ Dépôt de garantie ILLÉGAL au Québec

Dans les autres provinces :
Dépôt généralement de 1/2 mois à 1 mois de loyer.


6. ÉTAT DES LIEUX — TRÈS IMPORTANT

Le jour de ton emménagement :
✅ Prends des photos de TOUT
   (murs, sols, appareils, portes)
✅ Note tous les dommages existants par écrit
✅ Envoie les photos par email au propriétaire
✅ Garde une copie de tout

Pourquoi ? Pour récupérer ton dépôt à la fin.


7. TES DROITS DE LOCATAIRE

Tes droits :
✅ Logement habitable et en bon état
✅ Chauffage adéquat (obligatoire en hiver)
✅ Vie privée — propriétaire doit prévenir
   24h avant visite (sauf urgence)
✅ Reçus de loyer sur demande

En cas de problème :
Québec : Tribunal administratif du logement
  1-800-683-2245 | tal.gouv.qc.ca
Ontario : Landlord and Tenant Board
  1-888-332-3234 | ltb.gov.on.ca


8. CONSEILS PRATIQUES

Avant de signer :
□  Visite en personne (jamais à distance)
□  Vérifie le chauffage (crucial en hiver !)
□  Vérifie les électroménagers
□  Teste la connexion internet
□  Vérifie la proximité des transports

Premier mois :
□  Configure tes paiements automatiques
□  Souscris à une assurance locataire
   (15-30$/mois, fortement recommandé)
□  Mémorise l'adresse pour tes documents

Assurance locataire :
Couvre tes effets personnels en cas de vol,
incendie ou dégât des eaux.
Très recommandé et peu coûteux.`,
  },
}

export default async function handler(req, res) {
  const { type, lang = 'fr' } = req.query

  if (!GUIDES_COMPLETS[type]) {
    return res.status(404).json({ error: 'Guide non trouvé' })
  }

  const guide = GUIDES_COMPLETS[type]
  const titre = (lang === 'en' && guide.titre_en) ? guide.titre_en : guide.titre
  const contenu = (lang === 'en' && guide.contenu_en) ? guide.contenu_en : guide.contenu
  const year = new Date().getFullYear()
  const footerLang = lang === 'en'
    ? `Informational guide — Always verify with official sources`
    : `Guide informatif — Vérifie toujours les informations officielles`
  const subtitleLang = lang === 'en'
    ? `Guide for newcomers to Canada · ${year}`
    : `Guide pour nouveaux arrivants au Canada · ${year}`

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titre} — Novae</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.65;
      color: #222;
      background: #fff;
      padding: 18mm 20mm;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #1E3A5F;
      padding-bottom: 14px;
      margin-bottom: 26px;
    }
    .logo {
      color: #1E3A5F;
      font-size: 22pt;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #3B82F6;
    }
    .titre-guide {
      font-size: 15pt;
      font-weight: 700;
      color: #1E3A5F;
      margin-top: 6px;
      line-height: 1.3;
    }
    .subtitle {
      color: #888;
      font-size: 9pt;
      margin-top: 4px;
    }
    .contenu {
      white-space: pre-wrap;
      font-size: 10.5pt;
      line-height: 1.75;
      color: #222;
      word-break: break-word;
    }
    .footer {
      margin-top: 32px;
      padding-top: 14px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #999;
      font-size: 8.5pt;
    }
    .btn-print {
      display: inline-block;
      margin: 0 0 24px;
      padding: 10px 22px;
      background: #1E3A5F;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
    }
    .btn-print:hover { background: #1E3A5F; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 10mm 12mm; }
      .footer { position: fixed; bottom: 8mm; left: 12mm; right: 12mm; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px;">
    <button class="btn-print" onclick="window.print()">
      🖨️ ${lang === 'en' ? 'Print / Save as PDF' : 'Imprimer / Enregistrer en PDF'}
    </button>
    <span style="font-size: 12px; color: #666; margin-left: 12px;">
      ${lang === 'en' ? '→ Select "Save as PDF" in the print dialog' : '→ Sélectionne « Enregistrer en PDF » dans la boîte d\'impression'}
    </span>
  </div>

  <div class="header">
    <div class="logo">N<span>OVAE</span></div>
    <div class="titre-guide">${titre}</div>
    <div class="subtitle">${subtitleLang}</div>
  </div>

  <div class="contenu">${contenu.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

  <div class="footer">
    <span>novae-app.netlify.app</span>
    <span>${footerLang}</span>
  </div>

  <script>
    // Auto-print if ?print=1 in URL
    if (new URLSearchParams(window.location.search).get('print') === '1') {
      window.addEventListener('load', function() {
        setTimeout(function() { window.print(); }, 800);
      });
    }
  </script>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}
