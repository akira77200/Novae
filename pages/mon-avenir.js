// pages/mon-avenir.js — NOVAE v5 — Orientation · Secteur · Vision
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'

const PAYS_LISTE = [
  "Afghanistan", "Afrique du Sud", "Albanie", 
  "Algérie", "Allemagne", "Angola", 
  "Arabie Saoudite", "Argentine", "Australie", 
  "Autriche", "Azerbaïdjan", "Bahreïn",
  "Bangladesh", "Belgique", "Bénin", "Birmanie",
  "Bolivie", "Bosnie-Herzégovine", "Brésil", 
  "Bulgarie", "Burkina Faso", "Burundi", 
  "Cambodge", "Cameroun", "Canada", "Chili", 
  "Chine", "Chypre", "Colombie", "Congo",
  "Corée du Sud", "Costa Rica", "Côte d'Ivoire",
  "Croatie", "Cuba", "Danemark", "Djibouti",
  "Égypte", "Émirats arabes unis", "Équateur",
  "Espagne", "Éthiopie", "États-Unis", 
  "Finlande", "France", "Gabon", "Ghana", 
  "Grèce", "Guatemala", "Guinée", 
  "Guinée-Bissau", "Haïti", "Honduras",
  "Hongrie", "Inde", "Indonésie", "Irak", 
  "Iran", "Irlande", "Israël", "Italie", 
  "Jamaïque", "Japon", "Jordanie", "Kazakhstan",
  "Kenya", "Koweït", "Laos", "Liban", "Libye",
  "Luxembourg", "Madagascar", "Malaisie", "Mali",
  "Maroc", "Mauritanie", "Mexique", "Moldavie",
  "Mongolie", "Mozambique", "Namibie", "Népal",
  "Nicaragua", "Niger", "Nigeria", "Norvège",
  "Nouvelle-Zélande", "Oman", "Ouganda", 
  "Ouzbékistan", "Pakistan", "Panama", 
  "Paraguay", "Pays-Bas", "Pérou", 
  "Philippines", "Pologne", "Portugal",
  "Qatar", "République centrafricaine", 
  "République dominicaine", "République tchèque",
  "Roumanie", "Royaume-Uni", "Russie", "Rwanda",
  "Sénégal", "Serbie", "Sierra Leone", 
  "Singapour", "Slovaquie", "Slovénie",
  "Somalie", "Soudan", "Sri Lanka", "Suède",
  "Suisse", "Syrie", "Taïwan", "Tanzanie",
  "Tchad", "Thaïlande", "Togo", "Tunisie",
  "Turkménistan", "Turquie", "Ukraine", 
  "Uruguay", "Venezuela", "Vietnam", 
  "Yémen", "Zambie", "Zimbabwe",
  "Mon pays n'est pas dans la liste",
]

// ── QUIZ — Questions ─────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'matieres',
    fr: 'Quelles sont tes matières fortes ?', en: 'What are your strong subjects?',
    sous_fr: 'Choisis jusqu\'à 3 matières', sous_en: 'Select up to 3 subjects',
    type: 'multi',
    options: [
      { id: 'math',         fr: 'Mathématiques / Statistiques',    en: 'Mathematics / Statistics'    },
      { id: 'sciences',     fr: 'Sciences (physique, chimie, bio)', en: 'Sciences (physics, chem, bio)'},
      { id: 'informatique', fr: 'Informatique / Technologie',       en: 'Computer Science / Tech'     },
      { id: 'langues',      fr: 'Langues / Communication',          en: 'Languages / Communication'   },
      { id: 'sh',           fr: 'Sciences humaines / Histoire',     en: 'Humanities / History'        },
      { id: 'arts',         fr: 'Arts / Créativité',                en: 'Arts / Creativity'           },
      { id: 'economie',     fr: 'Économie / Commerce',              en: 'Economics / Business'        },
    ],
  },
  {
    id: 'activite',
    fr: 'Ce que tu aimes vraiment faire', en: 'What you truly love doing',
    sous_fr: 'Choix unique', sous_en: 'Single choice',
    type: 'single',
    options: [
      { id: 'analyser',   fr: 'Analyser des données et résoudre des problèmes', en: 'Analyze data and solve problems' },
      { id: 'construire', fr: 'Construire et concevoir des systèmes',            en: 'Build and design systems'       },
      { id: 'aider',      fr: 'Aider et accompagner des personnes',              en: 'Help and support people'        },
      { id: 'diriger',    fr: 'Diriger et organiser des équipes',                en: 'Lead and organize teams'        },
      { id: 'innover',    fr: 'Créer et innover librement',                      en: 'Create and innovate freely'     },
    ],
  },
  {
    id: 'risque',
    fr: 'Ton rapport au risque', en: 'Your relationship with risk',
    sous_fr: 'Choix unique', sous_en: 'Single choice',
    type: 'single',
    options: [
      { id: 'stabilite',    fr: 'Je préfère la stabilité (grand employeur, fonction publique)', en: 'I prefer stability (large employer, public sector)' },
      { id: 'equilibre',    fr: "J'aime l'équilibre (PME, ONG, institutions)",                  en: 'I like balance (SME, NGO, institutions)'            },
      { id: 'entreprendre', fr: 'Je veux entreprendre (startup, freelance, indépendant)',        en: 'I want to start my own (startup, freelance)'        },
    ],
  },
  {
    id: 'horizon',
    fr: 'Ton horizon après les études', en: 'Your horizon after graduation',
    sous_fr: 'Choix unique', sous_en: 'Single choice',
    type: 'single',
    options: [
      { id: 'rester',  fr: 'Rester au Canada après mes études',  en: 'Stay in Canada after graduation' },
      { id: 'retour',  fr: "Retourner dans mon pays d'origine",   en: 'Return to my home country'       },
      { id: 'pont',    fr: 'Les deux — construire des ponts',      en: 'Both — build bridges'            },
    ],
  },
  {
    id: 'pays',
    fr: "Ton pays d'origine", en: 'Your country of origin',
    sous_fr: 'Sélectionne dans la liste', sous_en: 'Select from the list',
    type: 'select',
    options: PAYS_LISTE,
  },
  {
    id: 'budget',
    fr: 'Ton budget annuel estimé (études + vie)', en: 'Your estimated annual budget (studies + living)',
    sous_fr: 'Choix unique', sous_en: 'Single choice',
    type: 'single',
    options: [
      { id: 'moins15', fr: 'Moins de 15 000 $ CAD',  en: 'Under CAD 15,000'    },
      { id: '15-25',   fr: '15 000 – 25 000 $ CAD',  en: 'CAD 15,000 – 25,000' },
      { id: '25-40',   fr: '25 000 – 40 000 $ CAD',  en: 'CAD 25,000 – 40,000' },
      { id: 'plus40',  fr: 'Plus de 40 000 $ CAD',    en: 'Over CAD 40,000'     },
    ],
  },
]

// ── PROGRAMMES — matrice de scoring ─────────────────────────────
const PROGRAMMES = [
  { id:'data-science',     emoji:'📊', nom:{fr:'Data Science / Statistiques',      en:'Data Science / Statistics'      }, matieres:['math','informatique','economie'],        activites:['analyser']               },
  { id:'genie-logiciel',   emoji:'💻', nom:{fr:'Génie logiciel / Informatique',    en:'Software Engineering'           }, matieres:['informatique','math'],                  activites:['construire','innover']   },
  { id:'genie-civil',      emoji:'🏗️', nom:{fr:'Génie civil / Construction',       en:'Civil Engineering'              }, matieres:['math','sciences'],                      activites:['construire']             },
  { id:'finance',          emoji:'💰', nom:{fr:'Finance / Comptabilité',           en:'Finance / Accounting'           }, matieres:['math','economie'],                      activites:['analyser','diriger']     },
  { id:'administration',   emoji:'📋', nom:{fr:'Administration des affaires',      en:'Business Administration'        }, matieres:['economie','langues'],                   activites:['diriger']                },
  { id:'sante',            emoji:'🏥', nom:{fr:'Santé / Sciences infirmières',     en:'Health Sciences / Nursing'      }, matieres:['sciences','sh'],                        activites:['aider']                  },
  { id:'droit',            emoji:'⚖️', nom:{fr:'Droit / Sciences politiques',      en:'Law / Political Science'        }, matieres:['langues','sh'],                         activites:['aider','diriger']        },
  { id:'education',        emoji:'🎓', nom:{fr:"Éducation / Sciences de l'éducation", en:'Education'                  }, matieres:['sh','langues'],                         activites:['aider']                  },
  { id:'genie-electrique', emoji:'⚡', nom:{fr:'Génie électrique / Télécoms',      en:'Electrical Engineering / Telecom'}, matieres:['math','sciences','informatique'],      activites:['construire','innover']   },
  { id:'environnement',    emoji:'🌱', nom:{fr:'Environnement / Énergies renouvelables', en:'Environment / Renewable Energy'}, matieres:['sciences','math'],              activites:['construire','innover']   },
]

// ── PROGRAMMES INFO — fiches détaillées ─────────────────────────
const PROGRAMMES_INFO = {
  'data-science': {
    cest_quoi: "La data science c'est l'art de transformer des données brutes en décisions intelligentes. Tu apprends à lire ce que les chiffres racontent — et à aider les organisations à faire de meilleurs choix. Un data scientist peut prédire une épidémie, optimiser une chaîne logistique, ou identifier les tendances qui vont changer un marché. C'est une des disciplines les plus demandées de la prochaine décennie.",
    monde: [
      { ctx:"Épidémie de paludisme au Sénégal", action:"Le data scientist analyse les patterns géographiques et climatiques des cas", impact:"Les campagnes de prévention sont 3× plus ciblées, sauvant des milliers de vies" },
      { ctx:"Fraude bancaire en Côte d'Ivoire", action:"Modèles ML détectant les transactions suspectes en temps réel", impact:"Réduction de 40% de la fraude mobile dans les banques partenaires" },
      { ctx:"Agriculture au Maroc", action:"Prédiction des rendements agricoles via données satellitaires et météo", impact:"Les agriculteurs optimisent leurs récoltes et réduisent les pertes de 25%" },
    ],
    villes:[{v:'Montréal',s:'IA, finance, jeux vidéo, pharma',r:'75–95k$'},{v:'Toronto',s:'Banque, assurance, tech, conseil',r:'85–120k$'},{v:'Vancouver',s:'Tech, e-commerce, jeux, biotech',r:'80–110k$'},{v:'Calgary',s:'Énergie, pipeline, agritech',r:'80–105k$'},{v:'Ottawa',s:'Gouvernement, défense, IA civique',r:'75–100k$'}],
    metiers_now:['Data Analyst','Data Scientist','ML Engineer','Business Intelligence Analyst','Statisticien'],
    metiers_futur:['AI Ethics Specialist','DataOps Engineer','Synthetic Data Scientist','Quantum Data Analyst'],
    chemin:"Bac/Maîtrise stats ou informatique → stage en entreprise tech → poste junior → Lead Scientist → RP via Express Entry (score élevé)",
  },
  'genie-logiciel': {
    cest_quoi: "Le génie logiciel c'est construire les outils que le monde utilise chaque jour. Applications mobiles, plateformes web, systèmes embarqués, intelligence artificielle — tout est du code. Tu apprends à concevoir, développer et maintenir des systèmes fiables, scalables et sécurisés. C'est l'une des disciplines avec le plus d'offres d'emploi au Canada.",
    monde: [
      { ctx:"Paiement mobile en Afrique subsaharienne", action:"Les ingénieurs logiciel créent des apps adaptées aux zones à faible connectivité", impact:"Plus de 500M$ échangés mensuellement via M-Pesa et équivalents" },
      { ctx:"Santé numérique au Cameroun", action:"Développement de systèmes de suivi des patients dans les zones rurales", impact:"Amélioration du suivi postnatal de 60% dans les villages éloignés" },
      { ctx:"E-gouvernement au Maroc", action:"Plateformes de services publics digitaux (permis, impôts, identité)", impact:"Réduction de 70% du temps d'attente pour les services administratifs" },
    ],
    villes:[{v:'Montréal',s:'IA, jeux vidéo, startups SaaS, aérospatiale',r:'75–100k$'},{v:'Toronto',s:'Fintech, e-commerce, scale-ups, FAANG',r:'90–130k$'},{v:'Vancouver',s:'Gaming, cloud, tech américaine (Amazon, Apple)',r:'85–120k$'},{v:'Ottawa',s:'Gouvernement, cybersécurité, télécoms',r:'75–105k$'},{v:'Calgary',s:'Tech pétrolière, agritech, cleantech',r:'80–110k$'}],
    metiers_now:['Développeur Full Stack','Ingénieur Backend','DevOps Engineer','Mobile Developer','Architecte logiciel'],
    metiers_futur:['AI/LLM Engineer','Ingénieur Web3','Développeur XR/AR','Security Engineer'],
    chemin:"Bac génie logiciel/informatique → stage coop → développeur junior → senior en 3-5 ans → RP via Express Entry (score excellent)",
  },
  'genie-civil': {
    cest_quoi: "Le génie civil c'est concevoir et bâtir l'infrastructure physique du monde : routes, ponts, bâtiments, systèmes d'eau et d'assainissement. En Afrique comme au Canada, les besoins sont immenses. Un ingénieur civil travaille sur des projets qui transforment la vie des gens — souvent des projets qui durent des siècles.",
    monde: [
      { ctx:"Eau potable en RDC", action:"Les ingénieurs civils conçoivent des réseaux de distribution dans les villes secondaires", impact:"Accès à l'eau potable pour 2M de personnes supplémentaires en 5 ans" },
      { ctx:"Corridors routiers en Côte d'Ivoire", action:"Conception de routes reliant les zones agricoles aux marchés urbains", impact:"Réduction des pertes post-récolte de 30% par amélioration de la logistique" },
      { ctx:"Reconstruction post-conflit au Mali", action:"Ingénieurs civils supervisent la reconstruction d'écoles et d'hôpitaux", impact:"Rétablissement de services essentiels dans des zones de conflit stabilisées" },
    ],
    villes:[{v:'Montréal',s:'Infrastructures urbaines, métro, immobilier',r:'70–95k$'},{v:'Toronto',s:'Construction commerciale, transport, immobilier',r:'75–110k$'},{v:'Calgary',s:'Infrastructure pétrolière, construction industrielle',r:'85–120k$'},{v:'Vancouver',s:'Résidentiel, transport, green building',r:'75–105k$'},{v:'Ottawa',s:'Infrastructures gouvernementales, défense',r:'70–95k$'}],
    metiers_now:['Ingénieur civil de projet','Ingénieur structurel','Inspecteur municipal','Chargé de projet construction'],
    metiers_futur:['Green Infrastructure Specialist','BIM Manager','Smart City Engineer','Ingénieur résilience climatique'],
    chemin:"Bac génie civil → stage bureau d'ingénierie → poste junior → Ingénieur professionnel (P.Eng.) → RP via immigration économique",
  },
  'finance': {
    cest_quoi: "La finance c'est l'art de gérer l'argent, les risques et les opportunités. Tu apprends à analyser des bilans financiers, valoriser des entreprises, gérer des portefeuilles d'investissement et structurer des transactions complexes. Au Canada, le secteur financier est l'un des plus solides au monde — et il recrute constamment.",
    monde: [
      { ctx:"Microfinance au Sénégal", action:"Les analystes financiers structurent des produits adaptés aux petits commerçants", impact:"Plus de 200 000 entrepreneurs ruraux financés en dehors des banques classiques" },
      { ctx:"Marchés obligataires en Côte d'Ivoire", action:"Analyse et structuration d'émissions obligataires pour l'État ivoirien", impact:"Financement de 4 milliards $ d'infrastructure via le marché des capitaux régional" },
      { ctx:"Finance islamique au Maroc", action:"Développement de produits financiers conformes à la Sharia", impact:"Inclusion financière de segments de population non servis par les banques classiques" },
    ],
    villes:[{v:'Toronto',s:'Banque d\'investissement, fonds, assurance',r:'85–150k$'},{v:'Montréal',s:'Finance, Caisse Desjardins, fonds tech',r:'75–110k$'},{v:'Vancouver',s:'Capital-risque, immobilier, ressources',r:'80–120k$'},{v:'Calgary',s:'Finance de l\'énergie, fonds pétroliers',r:'85–120k$'},{v:'Ottawa',s:'Finance publique, Banque du Canada',r:'70–100k$'}],
    metiers_now:['Analyste financier','Comptable CPA','Gestionnaire de portefeuille','Analyste de crédit','Conseiller en placements'],
    metiers_futur:['FinTech Product Analyst','Quantitative Analyst (Quant)','ESG Investment Analyst','Crypto Asset Manager'],
    chemin:"Bac finance/comptabilité → CPA ou CFA → stage chez une banque → analyste junior → associé → RP via Express Entry",
  },
  'administration': {
    cest_quoi: "L'administration des affaires (MBA/BBA) te prépare à gérer des organisations de toute taille. Tu apprends le marketing, les opérations, la stratégie, les ressources humaines et la finance. C'est un programme transversal qui te permet de travailler dans presque tous les secteurs — et d'évoluer vers des postes de direction.",
    monde: [
      { ctx:"Scale-up tech à Dakar", action:"Le manager opérationnel structure les processus RH et finance pour passer de 10 à 100 employés", impact:"L'entreprise lève 10M$ et s'exporte en Afrique de l'Ouest" },
      { ctx:"Coopérative agricole au Cameroun", action:"Un administrateur restructure la gestion des ventes et la logistique", impact:"Revenus des agriculteurs membres multipliés par 2,5 en 18 mois" },
      { ctx:"ONG humanitaire au Mali", action:"Un directeur administratif optimise les opérations terrain avec des ressources limitées", impact:"Même budget, 40% de bénéficiaires supplémentaires atteints" },
    ],
    villes:[{v:'Toronto',s:'Conseil, FMCG, RH, marketing digital',r:'70–110k$'},{v:'Montréal',s:'Commerce, startups, institutions',r:'60–90k$'},{v:'Vancouver',s:'Tech, tourisme, import/export',r:'65–100k$'},{v:'Calgary',s:'Énergie, logistique, ressources',r:'70–105k$'},{v:'Ottawa',s:'Gouvernement, associations, lobbying',r:'60–90k$'}],
    metiers_now:['Analyste en gestion','Coordinateur de projet','Responsable marketing','Business Development Manager'],
    metiers_futur:['Chief of Staff','Growth Hacker','Sustainability Manager','Remote Work Consultant'],
    chemin:"BBA/MBA → stage en entreprise → poste junior → manager → directeur → RP via RÉQ (QC) ou Express Entry (ON)",
  },
  'sante': {
    cest_quoi: "Les sciences de la santé couvrent un vaste spectre : soins infirmiers, physiothérapie, médecine, santé publique, nutrition. Au Canada, le secteur de la santé est le plus grand employeur public — et souffre d'une pénurie chronique de professionnels qualifiés. Pour les nouveaux arrivants, c'est une porte d'entrée très sérieuse vers la résidence permanente.",
    monde: [
      { ctx:"Pénurie d'infirmiers au Sénégal", action:"Les professionnels de santé forment des agents de santé communautaires en zones rurales", impact:"Couverture vaccinale augmentée de 35% dans les zones isolées" },
      { ctx:"Malnutrition infantile au Niger", action:"Nutritionnistes et agents de santé déploient des protocoles d'intervention ciblés", impact:"Mortalité infantile réduite de 20% dans les zones d'intervention en 3 ans" },
      { ctx:"COVID-19 en RDC", action:"Épidémiologistes analysent les données de propagation pour guider les décisions", impact:"Stratégie de confinement ciblé évitant l'effondrement du système de santé" },
    ],
    villes:[{v:'Montréal',s:'CIUSSS, hôpitaux universitaires, CLSC',r:'65–95k$'},{v:'Toronto',s:'Sinai Health, UHN, cliniques privées',r:'70–105k$'},{v:'Vancouver',s:'VCH, BC Cancer, soins aux aînés',r:'70–100k$'},{v:'Ottawa',s:'Ottawa Hospital, Santé publique Canada',r:'65–95k$'},{v:'Calgary',s:'Alberta Health Services, Foothills',r:'70–105k$'}],
    metiers_now:['Infirmier(ère) autorisé(e)','Technicien en radiologie','Physiothérapeute','Épidémiologiste','Nutritionniste'],
    metiers_futur:['Infirmier(ère) en télémédecine','Analyste santé numérique','Spécialiste IA médicale','Gestionnaire soins intégrés'],
    chemin:"DEC ou Bac soins infirmiers → équivalence provinciale → stage clinique → poste hospitalier → RP via programme provincial ou Express Entry",
  },
  'droit': {
    cest_quoi: "Le droit t'apprend à comprendre les règles qui organisent la société et à défendre les droits des individus et des organisations. Au Canada, la formation juridique ouvre des portes dans les cabinets d'avocats, les entreprises, les gouvernements et les ONG. Le droit international et les droits humains sont des spécialisations particulièrement porteuses pour les nouveaux arrivants.",
    monde: [
      { ctx:"Droits fonciers au Cameroun", action:"Les juristes défendent les communautés rurales face aux accaparements de terres", impact:"Des milliers d'hectares restitués à des communautés autochtones spoliées" },
      { ctx:"Commerce international Afrique-Canada", action:"Avocats spécialisés structurent des accords dans le cadre de la ZLECAF", impact:"Facilitation de 2 milliards $ d'échanges entre entreprises canadiennes et africaines" },
      { ctx:"Migrations et droits humains", action:"Cliniques juridiques offrent une aide aux demandeurs d'asile africains au Canada", impact:"Taux d'acceptation des demandes augmenté grâce à une meilleure représentation légale" },
    ],
    villes:[{v:'Montréal',s:'Droit civil québécois, droits humains, ONG',r:'60–120k$'},{v:'Toronto',s:'Droit corporatif, finance, immigration',r:'70–150k$'},{v:'Ottawa',s:'Droit public, gouvernement fédéral, diplomatie',r:'65–110k$'},{v:'Vancouver',s:'Droit autochtone, environnemental, immobilier',r:'65–120k$'},{v:'Calgary',s:'Droit de l\'énergie, corporatif, réglementaire',r:'70–130k$'}],
    metiers_now:['Avocat(e)','Parajuriste','Conseiller juridique','Médiateur/Arbitre','Consultant en conformité'],
    metiers_futur:['LegalTech Consultant','AI Legal Analyst','Spécialiste droit du numérique','Expert arbitrage international'],
    chemin:"Bac + LLB ou JD au Canada → stage en cabinet → admission au Barreau → avocat junior → associé → RP via Express Entry",
  },
  'education': {
    cest_quoi: "L'éducation est le secteur le plus transformateur à long terme. Enseigner, former des enseignants, concevoir des curricula, gérer des institutions scolaires — ces rôles multiplient l'impact. Au Canada, il manque des enseignants qualifiés, surtout francophones. En Afrique, l'éducation est le levier de développement numéro un.",
    monde: [
      { ctx:"Déficit enseignants au Burkina Faso", action:"Formateurs pédagogiques déploient des formations accélérées pour instituteurs communautaires", impact:"Taux de scolarisation primaire augmenté de 15% en zones rurales en 2 ans" },
      { ctx:"Éducation numérique en Côte d'Ivoire", action:"Spécialistes en technologie éducative déploient des tablettes et contenus offline", impact:"50 000 élèves ruraux accèdent à du contenu pédagogique de qualité sans internet" },
      { ctx:"Alphabétisation adulte au Sénégal", action:"Éducateurs développent des programmes adaptés aux femmes adultes en langue locale", impact:"Taux d'alphabétisation féminine amélioré de 12 points dans les régions ciblées" },
    ],
    villes:[{v:'Montréal',s:'Commissions scolaires, universités, cégeps',r:'55–85k$'},{v:'Toronto',s:'Conseils scolaires, EdTech, formation prof.',r:'60–90k$'},{v:'Ottawa',s:'Écoles fédérales, instituts bilingues',r:'58–88k$'},{v:'Vancouver',s:'Écoles publiques BC, institutions privées',r:'60–88k$'},{v:'Calgary',s:'Calgary Board of Education, collèges',r:'58–85k$'}],
    metiers_now:['Enseignant(e) certifié(e)','Conseiller(ère) pédagogique','Orthopédagogue','Directeur(trice) d\'école'],
    metiers_futur:['Concepteur pédagogique IA','Spécialiste EdTech','Coach scolaire virtuel','Expert curriculum interculturel'],
    chemin:"Bac en éducation → stage de formation pratique → certification provinciale → commission scolaire → RP via PEQ (QC) ou OINP (ON)",
  },
  'genie-electrique': {
    cest_quoi: "Le génie électrique et les télécommunications sont au cœur de la révolution numérique. Tu conçois des systèmes d'énergie, de communication, d'automatisation et d'électronique. C'est un domaine qui relie les industries traditionnelles (énergie, transport) aux nouvelles technologies (IoT, 5G, IA embarquée). La demande est forte partout.",
    monde: [
      { ctx:"Électrification rurale en RDC", action:"Ingénieurs électriciens déploient des mini-réseaux solaires dans des villages isolés", impact:"200 villages alimentés en électricité pour la première fois, transformant l'éducation nocturne" },
      { ctx:"5G au Maroc", action:"Ingénieurs télécoms planifient le déploiement des antennes 5G dans les grandes villes", impact:"Couverture 5G à Casablanca et Rabat dès 2024, attirant des investissements tech majeurs" },
      { ctx:"Automatisation industrielle", action:"Ingénieurs en automation modernisent les lignes de production minières", impact:"Productivité augmentée de 30% avec réduction des accidents du travail de 50%" },
    ],
    villes:[{v:'Montréal',s:'Aérospatiale, télécoms, automatisation',r:'75–105k$'},{v:'Toronto',s:'Smart grid, IoT, véhicules électriques',r:'80–115k$'},{v:'Vancouver',s:'Cleantech, technologies propres, domotique',r:'78–110k$'},{v:'Calgary',s:'Énergie, pipelines intelligents, solaire',r:'85–120k$'},{v:'Ottawa',s:'Défense, gouvernement, cybersécurité',r:'75–105k$'}],
    metiers_now:['Ingénieur électricien','Ingénieur en télécoms','Ingénieur en automation','Concepteur de circuits'],
    metiers_futur:['Ingénieur IoT','Spécialiste véhicules électriques','Ingénieur énergie solaire','Expert cybersécurité industrielle'],
    chemin:"Bac génie électrique → stage coop → ingénieur junior → P.Eng. → senior → RP via Express Entry (score excellent pour ingénieurs)",
  },
  'environnement': {
    cest_quoi: "L'environnement et les énergies renouvelables sont devenus des priorités planétaires. Tu travailles sur le changement climatique, la pollution, la gestion des ressources naturelles et la transition énergétique. Le Canada investit massivement dans la décarbonation — et les gouvernements africains ont besoin d'experts pour naviguer la transition verte.",
    monde: [
      { ctx:"Déforestation au Cameroun", action:"Les experts analysent les données satellite et proposent des corridors de conservation", impact:"500 000 hectares de forêt tropicale protégés via des accords de conservation négociés" },
      { ctx:"Énergie solaire au Niger", action:"Ingénieurs en énergies renouvelables conçoivent des fermes solaires communautaires", impact:"60 000 ménages ruraux électrifiés avec de l'énergie propre et abordable" },
      { ctx:"Gestion de l'eau au Sénégal", action:"Hydrographes et gestionnaires de l'eau optimisent les réseaux d'irrigation", impact:"Réduction de 35% de la consommation d'eau tout en augmentant les rendements agricoles" },
    ],
    villes:[{v:'Montréal',s:'Éolien, solaire, gestion des eaux, CRSNG',r:'65–95k$'},{v:'Toronto',s:'Conseil ESG, clean energy, développement durable',r:'70–105k$'},{v:'Vancouver',s:'Forêts, mines responsables, éco-conseil',r:'68–100k$'},{v:'Calgary',s:'Transition pétrolière, géothermie, CCUS',r:'75–110k$'},{v:'Ottawa',s:'Environnement Canada, Parcs Canada, ONG',r:'62–90k$'}],
    metiers_now:['Consultant en environnement','Analyste ESG','Ingénieur en énergies renouvelables','Hydrogéologue'],
    metiers_futur:['Spécialiste CCUS (capture carbone)','Analyste transition énergétique','Expert biodiversité corporate','Ingénieur hydrogène vert'],
    chemin:"Bac/Maîtrise en environnement ou génie → stage gouvernemental ou ONG → consultant junior → senior → RP via Express Entry ou programme provincial",
  },
}

// ── PAYS — opportunités retour ───────────────────────────────────
const PAYS_OPPORTUNITES = {
  'Maroc': {
    'data-science':   { statut:'En développement', opportunites:['OCP Group recrute des data scientists pour optimiser ses chaînes de production mondiales','Bank Al-Maghrib et banques privées modernisent leur analyse de risque crédit avec le ML','Le programme Maroc Digital 2030 finance des startups IA, créant une demande forte de talents'], manque:"Il manque encore beaucoup de data scientists marocains formés à l'étranger avec une expérience Canada — tu seras très recherché(e)", acteurs:['OCP Group','CDVM / AMMC','Hub of Africa Startups','Université Mohammed VI Polytechnique'] },
    'finance':        { statut:'Mature', opportunites:['La Bourse de Casablanca recrute des analystes financiers avec une formation internationale','Les banques (Attijariwafa, BCP, BMCE) cherchent des profils CFA ou CPA pour leurs filiales africaines','Le développement de la finance islamique crée une niche à forte valeur ajoutée'], manque:'Le marché est mature mais les profils bilingues avec expérience canadienne restent rares', acteurs:['Bourse de Casablanca','Attijariwafa Bank','Bank of Africa','CDG Capital'] },
    'genie-logiciel': { statut:'En développement', opportunites:['Casablanca Tech City accueille des filiales de multinationales qui recrutent activement','Le secteur BPO marocain recrute massivement des développeurs pour des clients européens','Les startups marocaines cherchent des CTO et développeurs expérimentés'], manque:"Le marché tech marocain manque de développeurs seniors formés à des standards canadiens — c'est précisément ce profil que tu représentes", acteurs:['Disrupt Africa Maroc','CGEM Tech','Technoparc Casablanca','Rabat Digital Startup Hub'] },
  },
  'Sénégal': {
    'data-science':   { statut:'Émergent', opportunites:['La Banque de Développement du Sénégal cherche des analystes de données pour la planification nationale','Le secteur des télécoms (Orange, Expresso) développe des capacités Big Data pour le marché local','Les ONG et agences internationales financent des projets data pour la santé et l\'agriculture'], manque:"Il n'y a presque pas de data scientists sénégalais formés à l'international — tu seras parmi les premiers et les plus recherchés", acteurs:['ANSD','Orange Digital Center Dakar','Jokkolabs','Banque Mondiale Dakar'] },
    'environnement':  { statut:'Émergent', opportunites:['Le Programme Sénégal Émergent inclut des volets énergies renouvelables à développer avec des experts formés','La zone côtière face à l\'érosion critique — des experts en gestion des zones côtières très recherchés','L\'agriculture souffre de stress hydrique — des spécialistes en gestion de l\'eau peuvent transformer ce secteur'], manque:"L'expertise en énergies renouvelables et gestion environnementale est très rare — les projets de la Banque Mondiale attendent ce type de profil", acteurs:['ASER','Ministère de l\'Environnement','GreenTech Africa Dakar','AFD Sénégal'] },
    'sante':          { statut:'En développement', opportunites:['Le système de santé recrute activement des infirmiers qualifiés pour les zones rurales','Les organismes internationaux (OMS, MSF, UNICEF) cherchent des professionnels bilingues','La télémédecine est en plein essor — les spécialistes en santé numérique très demandés'], manque:"Le ratio médecin/habitant est 10× inférieur aux standards OMS — chaque professionnel de santé formé à l'étranger est un capital humain précieux", acteurs:['Ministère de la Santé du Sénégal','USAID Health Senegal','OMS Dakar','Africa Health Holdings'] },
  },
  "Côte d'Ivoire": {
    'finance':        { statut:'Mature', opportunites:['La BRVM et ses membres recrutent des analystes formés à l\'international','Abidjan Finance City concentre les sièges régionaux des grandes banques internationales','Le secteur des assurances sous-développé par rapport au PIB — une opportunité réelle de croissance'], manque:"La finance ivoirienne manque de profils qui connaissent à la fois les marchés canadiens et le contexte CEDEAO", acteurs:['BRVM','Abidjan Finance City','NSIA Banque','Ecobank CI'] },
    'genie-civil':    { statut:'En développement', opportunites:['Le Plan National de Développement investit des milliards dans les routes, ports et logements','Le programme Abidjan Smart City cherche des ingénieurs pour des infrastructures modernes','La BAD finance des projets de reconstruction nécessitant des ingénieurs civils qualifiés'], manque:"L'Afrique de l'Ouest manque d'ingénieurs civils formés aux normes canadiennes — un profil très rare et très demandé", acteurs:['BAD','BNETD','AGEROUTE','Bouygues Construction CI'] },
    'data-science':   { statut:'Émergent', opportunites:['MTN CI et Orange CI investissent dans le Big Data pour personnaliser leurs offres à 20M+ abonnés','Le secteur cacao (40% de la production mondiale) cherche des data scientists pour optimiser la chaîne','Le gouvernement finance des projets e-gouvernement nécessitant des experts en données publiques'], manque:"Très peu de data scientists ivoiriens ont une expérience internationale — tu représenteras le profil le plus rare et le plus recherché", acteurs:['MTN CI Digital','Orange Money CI','CIE','Conseil du Café-Cacao'] },
  },
  'Cameroun': {
    'genie-logiciel':   { statut:'En développement', opportunites:['ActivSpaces et Silicon Mountain à Buea forment un écosystème tech dynamique qui recrute des développeurs expérimentés','Les opérateurs télécoms (MTN, Orange) développent des solutions numériques locales','Le financement international de projets numériques crée une demande d\'ingénieurs qualifiés'], manque:"Silicon Mountain est reconnu comme le 'Silicon Valley africain' mais manque cruellement de développeurs seniors — ton profil canadien sera très valorisé", acteurs:['ActivSpaces Buea','INIT','MTN Cameroon Digital','ANTIC'] },
    'genie-electrique': { statut:'En développement', opportunites:['Le barrage de Nachtigal et les grands projets hydroélectriques ont besoin d\'ingénieurs qualifiés','L\'électrification rurale (moins de 20% connectée) est un chantier national prioritaire','Les industries extractives cherchent des ingénieurs électriciens pour leurs opérations'], manque:"Seuls 18% des ingénieurs électriciens camerounais sont formés à l'international — l'écart entre les besoins et les compétences disponibles est immense", acteurs:['ENEO','SONATREL','SONARA','SNH'] },
    'education':        { statut:'En développement', opportunites:['Le gouvernement investit dans la réforme des curricula — des spécialistes en sciences de l\'éducation sont recherchés','Les institutions bilingues cherchent des cadres pédagogiques avec une formation internationale','Le développement de l\'enseignement supérieur privé crée des postes de direction pédagogique'], manque:"Les spécialistes en technologie éducative et en ingénierie pédagogique sont pratiquement absents du marché", acteurs:['Université de Yaoundé I','MINEPAT','British Council Cameroun','Institut Panos Afrique Centrale'] },
  },
  'RDC': {
    'genie-civil':    { statut:'Émergent', opportunites:['Le projet Grand Inga va nécessiter des centaines d\'ingénieurs qualifiés','La reconstruction dans les zones post-conflit est financée massivement par la Banque Mondiale et l\'AFD','Kinshasa, 15 millions d\'habitants, a besoin urgent de planificateurs urbains et d\'ingénieurs'], manque:"La RDC a le plus faible ratio ingénieur/habitant d'Afrique centrale — chaque ingénieur civil formé à l'étranger est un actif stratégique national", acteurs:['INGA SARL','REGIDESO','Banque Mondiale RDC','MONUSCO génie civil'] },
    'environnement':  { statut:'Émergent', opportunites:['La RDC possède la 2e plus grande forêt tropicale du monde — la gestion durable est un enjeu international majeur','Les crédits carbone et REDD+ créent de nouvelles opportunités pour des experts en financement vert','La pollution minière nécessite des experts en remédiation environnementale très spécialisés'], manque:"La RDC possède 10% de la biodiversité mondiale mais manque cruellement d'experts en gestion environnementale formés aux standards internationaux", acteurs:['Ministère de l\'Environnement RDC','WWF Congo Basin','WCS','ICCN'] },
    'sante':          { statut:'En développement', opportunites:['Le système de santé congolais est l\'un des plus sous-financés — chaque professionnel qualifié fait une différence réelle','Les ONG médicales (MSF, IRC, IMC) opèrent massivement et cherchent des coordinateurs bilingues','L\'épidémie d\'Ebola récurrente crée un besoin permanent d\'épidémiologistes et spécialistes en crises sanitaires'], manque:"Avec 1 médecin pour 10 000 habitants (vs 23 au Canada), chaque professionnel de santé formé à l'international est inestimable", acteurs:['MSF RDC','IRC','OMS Kinshasa','CDC RDC'] },
  },
}

// ── Helpers ──────────────────────────────────────────────────────
const MATIERES_LABELS = { math:'mathématiques', sciences:'sciences', informatique:'informatique', langues:'langues', sh:'sciences humaines', arts:'arts', economie:'économie' }
const MATIERES_LABELS_EN = { math:'mathematics', sciences:'sciences', informatique:'computer science', langues:'languages', sh:'humanities', arts:'arts', economie:'economics' }
const ACTIVITES_LABELS = { analyser:'analyser des données', construire:'construire des systèmes', aider:'aider des personnes', diriger:'diriger des équipes', innover:'créer et innover' }
const ACTIVITES_LABELS_EN = { analyser:'analyze data', construire:'build systems', aider:'help people', diriger:'lead teams', innover:'create and innovate' }
const HORIZON_LABELS = { rester:'rester au Canada', retour:'retourner dans ton pays', pont:'construire des ponts entre les deux' }
const HORIZON_LABELS_EN = { rester:'stay in Canada', retour:'return home', pont:'build bridges between both' }
const BUDGET_LABELS = { moins15:'un budget serré (moins de 15 000 $)', '15-25':'un budget modéré', '25-40':'un budget confortable', plus40:'un budget élevé' }
const BUDGET_LABELS_EN = { moins15:'a tight budget (under CAD 15,000)', '15-25':'a moderate budget', '25-40':'a comfortable budget', plus40:'a high budget' }

const IMPACT_RETOUR = ['education', 'sante', 'genie-civil', 'environnement', 'administration', 'data-science', 'droit']
const PROGRAMMES_COURTS = ['education', 'sante', 'administration']

function calculerScore(reponses) {
  const matieres  = reponses.matieres || []
  const activite  = reponses.activite
  const horizon   = reponses.horizon
  const budget    = reponses.budget
  const risque    = reponses.risque

  const scored = PROGRAMMES.map((prog, idx) => {
    let score = idx * 0.07 // tiebreaker unique par programme

    prog.matieres.forEach(m => { if (matieres.includes(m)) score += 3 })
    if (prog.activites.includes(activite)) score += 4

    // Règles explicites demandées
    if (matieres.includes('math') && matieres.includes('informatique')) {
      if (prog.id === 'data-science')   score += 14
      if (prog.id === 'genie-logiciel') score += 12
    }

    if (activite === 'aider' && matieres.includes('sciences')) {
      if (prog.id === 'sante')     score += 16
      if (prog.id === 'education') score += 6
    }

    if (activite === 'diriger' && matieres.includes('economie')) {
      if (prog.id === 'administration') score += 14
      if (prog.id === 'finance')        score += 12
    }

    // Horizon retour → impact pays en développement
    if (horizon === 'retour' && IMPACT_RETOUR.includes(prog.id)) score += 8
    if (horizon === 'pont'   && IMPACT_RETOUR.includes(prog.id)) score += 5
    if (horizon === 'rester' && ['data-science', 'genie-logiciel', 'finance', 'genie-electrique'].includes(prog.id)) score += 4

    // Budget serré → collège / programmes courts
    if (budget === 'moins15') {
      if (PROGRAMMES_COURTS.includes(prog.id)) score += 10
      if (prog.id === 'administration') score += 5
      if (['genie-civil', 'genie-electrique', 'droit'].includes(prog.id)) score -= 5
    } else if (budget === 'plus40') {
      if (['droit', 'genie-electrique', 'data-science'].includes(prog.id)) score += 4
    }

    // Activité complémentaire
    if (activite === 'analyser'   && ['data-science', 'finance'].includes(prog.id)) score += 5
    if (activite === 'construire' && ['genie-logiciel', 'genie-civil', 'genie-electrique', 'environnement'].includes(prog.id)) score += 5
    if (activite === 'innover'    && ['genie-logiciel', 'environnement', 'data-science'].includes(prog.id)) score += 5
    if (activite === 'aider'      && ['education', 'droit', 'sante'].includes(prog.id)) score += 4

    // Rapport au risque
    if (risque === 'stabilite'    && ['sante', 'education', 'administration'].includes(prog.id)) score += 4
    if (risque === 'entreprendre' && ['genie-logiciel', 'data-science', 'environnement'].includes(prog.id)) score += 4
    if (risque === 'equilibre'    && ['finance', 'droit', 'administration'].includes(prog.id)) score += 3

    // Matières spécifiques
    if (matieres.includes('langues') && ['droit', 'administration', 'education'].includes(prog.id)) score += 3
    if (matieres.includes('arts')    && prog.id === 'education') score += 4
    if (matieres.includes('sh')      && ['droit', 'education', 'administration'].includes(prog.id)) score += 3

    return { ...prog, score }
  })

  const sorted = scored.sort((a, b) => b.score - a.score)
  const top3   = sorted.slice(0, 3)
  const max    = top3[0]?.score || 1
  const min    = top3[2]?.score || 0
  const spread = Math.max(max - min, 1)

  return top3.map((prog, i) => {
    const relative = (prog.score - min) / spread
    const pct = Math.round(Math.max(52, Math.min(97, 72 + relative * 22 - i * 3)))
    return { ...prog, pct }
  })
}

function genererPourquoi(prog, reponses, lang) {
  const matieres = reponses.matieres || []
  const isFr = lang === 'fr'
  const ml = isFr ? MATIERES_LABELS : MATIERES_LABELS_EN
  const al = isFr ? ACTIVITES_LABELS : ACTIVITES_LABELS_EN
  const hl = isFr ? HORIZON_LABELS : HORIZON_LABELS_EN
  const bl = isFr ? BUDGET_LABELS : BUDGET_LABELS_EN
  const raisons = []

  const matieresMatch = prog.matieres.filter(m => matieres.includes(m)).map(m => ml[m] || m)
  if (matieresMatch.length > 0) {
    raisons.push(isFr
      ? `tu excelles en ${matieresMatch.join(' et ')}`
      : `you excel in ${matieresMatch.join(' and ')}`)
  }

  if (reponses.activite && prog.activites.includes(reponses.activite)) {
    raisons.push(isFr
      ? `tu veux ${al[reponses.activite]}`
      : `you want to ${al[reponses.activite]}`)
  }

  if (matieres.includes('math') && matieres.includes('informatique') && ['data-science', 'genie-logiciel'].includes(prog.id)) {
    raisons.push(isFr
      ? 'ton combo math + informatique est un atout majeur dans ce secteur'
      : 'your math + computer science combo is a major asset in this field')
  }

  if (reponses.activite === 'aider' && matieres.includes('sciences') && prog.id === 'sante') {
    raisons.push(isFr
      ? 'ton profil sciences + envie d\'aider pointe vers les métiers de la santé'
      : 'your sciences profile + desire to help points to health careers')
  }

  if (reponses.activite === 'diriger' && matieres.includes('economie') && ['administration', 'finance'].includes(prog.id)) {
    raisons.push(isFr
      ? 'ton profil économie + leadership correspond aux métiers de gestion'
      : 'your economics profile + leadership fits management careers')
  }

  if (reponses.horizon === 'retour' && IMPACT_RETOUR.includes(prog.id)) {
    raisons.push(isFr
      ? `avec ton projet de retour${reponses.pays ? ` en ${reponses.pays}` : ''}, ce programme a un fort impact`
      : `with your plan to return${reponses.pays ? ` to ${reponses.pays}` : ''}, this program has strong impact`)
  }

  if (reponses.budget === 'moins15' && PROGRAMMES_COURTS.includes(prog.id)) {
    raisons.push(isFr
      ? `avec ${bl.moins15}, un parcours collégial ou court est plus adapté`
      : `with ${bl.moins15}, a college or shorter program is a better fit`)
  }

  if (reponses.risque === 'stabilite' && ['sante', 'education', 'administration'].includes(prog.id)) {
    raisons.push(isFr ? 'tu recherches la stabilité — ce secteur offre des débouchés sécurisés' : 'you seek stability — this sector offers secure opportunities')
  }

  const nom = prog.nom[lang]
  if (raisons.length === 0) {
    return isFr ? `${nom} correspond à ton profil global.` : `${nom} matches your overall profile.`
  }

  const intro = isFr ? 'Parce que ' : 'Because '
  const suffix = isFr ? ` — ${nom} est un excellent choix pour toi.` : ` — ${nom} is an excellent choice for you.`
  return intro + raisons.slice(0, 3).join(isFr ? ', ' : ', ') + suffix
}

function getPaysFiches(pays) {
  if (!pays) return null
  const p = pays.toLowerCase().trim()
  for (const [key, val] of Object.entries(PAYS_OPPORTUNITES)) {
    if (key.toLowerCase().trim() === p || p.includes(key.toLowerCase()) || key.toLowerCase().includes(p)) return { key, val }
  }
  return null
}

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────
export default function MonAvenir() {
  const { C, lang, profile, loading: authLoading, sb } = useApp()

  const [tab,         setTab]         = useState('orientation')
  const [step,        setStep]        = useState(0)
  const [reponses,    setReponses]    = useState({})
  const [quizResult,  setQuizResult]  = useState(null)
  const [selectedProg,setSelectedProg]= useState(null)
  const [vision,      setVision]      = useState(null)
  const [visLoading,  setVisLoading]  = useState(false)
  const [visError,    setVisError]    = useState('')
  const [paysAutre,   setPaysAutre]   = useState('')

  // Load saved quiz + pre-fill from profile
  useEffect(() => {
    const saved = localStorage.getItem('novae_quiz_result')
    if (saved) { try { setQuizResult(JSON.parse(saved)) } catch {} }
  }, [])

  useEffect(() => {
    if (!profile) return
    if (profile.pays_origine) setReponses(r => r.pays ? r : { ...r, pays: profile.pays_origine })
    if (profile.programme) {
      const prog = profile.programme.toLowerCase()
      const match = PROGRAMMES.find(p => prog.includes(p.id.split('-')[0]) || p.nom.fr.toLowerCase().includes(prog.split(' ')[0]))
      if (match && !selectedProg) { setSelectedProg(match.id); setTab('secteur') }
    }
  }, [profile])

  // ── Quiz helpers ──────────────────────────────────────────────
  const q = QUESTIONS[step]
  const currentAnswer = reponses[q?.id]
  const isAnswered = q?.type === 'multi' ? (currentAnswer || []).length > 0
    : q?.type === 'select' ? !!currentAnswer
    : !!currentAnswer

  const toggleMatiere = (id) => {
    const cur = reponses.matieres || []
    setReponses(r => ({ ...r, matieres: cur.includes(id) ? cur.filter(x => x !== id) : cur.length < 3 ? [...cur, id] : cur }))
  }

  const setSingle = (qid, val) => setReponses(r => ({ ...r, [qid]: val }))

  const voirResultats = () => {
    const top = calculerScore(reponses)
    const result = { top: top.map(p => ({ ...p, pourquoi: genererPourquoi(p, reponses, lang) })), reponses, date: new Date().toISOString() }
    localStorage.setItem('novae_quiz_result', JSON.stringify(result))
    setQuizResult(result)
  }

  const refaireQuiz = () => { setQuizResult(null); setStep(0); setReponses(p => ({ pays: p.pays })) }

  // ── Vision ────────────────────────────────────────────────────
  const visionProg = selectedProg || quizResult?.top[0]?.id
  const visionPays = profile?.pays_origine || reponses.pays || ''

  const genererVision = async () => {
    if (!visionProg) return
    setVisLoading(true); setVisError(''); setVision(null)
    try {
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token || ''
      if (!token) { setVisError(lang === 'fr' ? 'Connexion requise.' : 'Sign in required.'); return }

      const progInfo = PROGRAMMES.find(p => p.id === visionProg)
      const res = await fetch('/api/generer-vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ programme: progInfo ? progInfo.nom[lang] : visionProg, pays_origine: visionPays, horizon: reponses.horizon || 'non renseigné', activites: reponses.activite || 'non renseigné' }),
      })
      const data = await res.json()
      if (data.success) setVision(data.vision)
      else setVisError(data.error || 'Erreur')
    } catch (e) { setVisError(e.message) }
    finally { setVisLoading(false) }
  }

  // ── Style helpers ──────────────────────────────────────────────
  const chip = (active, color = C.accent) => ({
    padding: '8px 16px', borderRadius: 20, border: `1px solid ${active ? color + '55' : C.border}`,
    background: active ? color + '18' : 'transparent', color: active ? color : C.muted,
    fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
  })

  const TABS = [
    { id:'orientation', fr:'🎯 Mon orientation', en:'🎯 My Path'    },
    { id:'secteur',     fr:'📚 Mon secteur',     en:'📚 My Sector'  },
    { id:'vision',      fr:'✨ Ma vision',        en:'✨ My Vision'  },
  ]

  if (authLoading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:C.muted, fontSize:14 }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <Navbar />

      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeSlideUp 0.4s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.15s; }
        .fade-up-3 { animation-delay: 0.25s; }
      `}</style>

      <main style={{ maxWidth:820, margin:'0 auto', padding:'36px 20px 80px' }}>

        {/* Header */}
        <h1 style={{ fontSize:28, fontWeight:800, color:C.text, letterSpacing:-0.5, marginBottom:6 }}>
          🚀 {lang === 'fr' ? 'Mon Avenir' : 'My Future'}
        </h1>
        <p style={{ fontSize:15, color:C.muted, marginBottom:28, lineHeight:1.6 }}>
          {lang === 'fr' ? 'Découvre les programmes qui te correspondent et construis ta vision.' : 'Discover the programs that match you and build your vision.'}
        </p>

        {/* Tabs — style identique dashboard.js */}
        <div style={{ display:'flex', gap:4, marginBottom:28, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:4 }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{ flex:1, padding:'10px 12px', borderRadius:8, border:'none', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s', background: tab === tb.id ? C.accent : 'transparent', color: tab === tb.id ? '#fff' : C.muted }}>
              {lang === 'fr' ? tb.fr : tb.en}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* TAB 1 — MON ORIENTATION                                 */}
        {/* ════════════════════════════════════════════════════════ */}
        {tab === 'orientation' && (
          <>
            {/* RÉSULTATS */}
            {quizResult ? (
              <div className="fade-up">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
                  <p style={{ fontSize:16, fontWeight:700, color:C.text }}>
                    {lang === 'fr' ? '🎯 Tes programmes recommandés' : '🎯 Your recommended programs'}
                  </p>
                  <button onClick={refaireQuiz} style={{ padding:'7px 16px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:12, cursor:'pointer' }}>
                    {lang === 'fr' ? '↺ Refaire le quiz' : '↺ Retake quiz'}
                  </button>
                </div>

                <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:8 }}>
                  {quizResult.top.map((prog, i) => (
                    <div key={prog.id} className={`fade-up fade-up-${i+1}`} style={{ minWidth:240, maxWidth:260, flexShrink:0, background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 18px', display:'flex', flexDirection:'column', gap:10 }}>
                      <span style={{ fontSize:32 }}>{prog.emoji}</span>
                      <p style={{ fontSize:15, fontWeight:700, color:C.text, lineHeight:1.3 }}>{prog.nom[lang]}</p>
                      <div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <p style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>{lang === 'fr' ? 'Compatibilité' : 'Match'}</p>
                          <p style={{ fontSize:12, fontWeight:700, color:C.accent2 }}>{prog.pct}%</p>
                        </div>
                        <div style={{ height:6, background:C.border, borderRadius:3, overflow:'hidden' }}>
                          <div style={{ width:`${prog.pct}%`, height:'100%', background: i === 0 ? C.accent2 : i === 1 ? '#60A5FA' : C.rose, borderRadius:3, transition:'width 0.8s ease' }} />
                        </div>
                      </div>
                      <p style={{ fontSize:12, color:C.muted, lineHeight:1.6, flexGrow:1 }}>{prog.pourquoi || genererPourquoi(prog, quizResult.reponses, lang)}</p>
                      <button onClick={() => { setSelectedProg(prog.id); setTab('secteur') }}
                        style={{ padding:'9px 14px', background:`${C.accent}15`, border:`1px solid ${C.accent}35`, borderRadius:9, color:C.accent2, fontWeight:600, fontSize:12, cursor:'pointer' }}>
                        {lang === 'fr' ? 'Explorer ce programme →' : 'Explore this program →'}
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:20, padding:'14px 18px', background:`${C.accent}08`, border:`1px solid ${C.accent}20`, borderRadius:12 }}>
                  <p style={{ fontSize:13, color:C.accent2 }}>
                    ✨ {lang === 'fr' ? 'Quiz complété le ' : 'Quiz completed on '}{new Date(quizResult.date).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')} · {lang === 'fr' ? 'Va dans' : 'Go to'} <button onClick={() => setTab('vision')} style={{ background:'none', border:'none', color:C.accent2, fontWeight:700, cursor:'pointer', fontSize:13, padding:0, textDecoration:'underline' }}>{lang === 'fr' ? 'Ma Vision' : 'My Vision'}</button> {lang === 'fr' ? 'pour générer ton plan IA.' : 'to generate your AI plan.'}
                  </p>
                </div>
              </div>
            ) : (
              /* QUIZ — étape par étape */
              <div>
                {/* Barre de progression */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:C.muted }}>
                      {lang === 'fr' ? `Étape ${step + 1} sur 6` : `Step ${step + 1} of 6`}
                    </p>
                    <p style={{ fontSize:12, color:C.muted }}>{Math.round(((step) / 6) * 100)}%</p>
                  </div>
                  <div style={{ height:5, background:C.border, borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${((step) / 6) * 100}%`, height:'100%', background:C.accent2, borderRadius:3, transition:'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Question */}
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'24px 22px', marginBottom:20 }}>
                  <p style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:4 }}>
                    {lang === 'fr' ? q.fr : q.en}
                  </p>
                  <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>
                    {lang === 'fr' ? q.sous_fr : q.sous_en}
                  </p>

                  {/* Multi-select */}
                  {q.type === 'multi' && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                      {q.options.map(opt => {
                        const sel = (reponses.matieres || []).includes(opt.id)
                        const maxed = (reponses.matieres || []).length >= 3 && !sel
                        return (
                          <button key={opt.id} onClick={() => !maxed && toggleMatiere(opt.id)} style={{ ...chip(sel), opacity: maxed ? 0.4 : 1, cursor: maxed ? 'not-allowed' : 'pointer' }}>
                            {lang === 'fr' ? opt.fr : opt.en}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Single */}
                  {q.type === 'single' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {q.options.map(opt => {
                        const sel = reponses[q.id] === opt.id
                        return (
                          <button key={opt.id} onClick={() => setSingle(q.id, opt.id)} style={{ padding:'13px 18px', borderRadius:11, border:`1px solid ${sel ? C.accent + '55' : C.border}`, background: sel ? `${C.accent}15` : 'transparent', color: sel ? C.accent2 : C.text, fontSize:14, fontWeight: sel ? 600 : 400, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                            {lang === 'fr' ? opt.fr : opt.en}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Select dropdown */}
                  {q.type === 'select' && (
                    <>
                      <select value={reponses[q.id] || ''} onChange={e => { setSingle(q.id, e.target.value); if (e.target.value !== 'Mon pays n\'est pas dans la liste') setPaysAutre('') }}
                        style={{ width:'100%', maxWidth:340, padding:'12px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, color: reponses[q.id] ? C.text : C.muted, fontSize:14, outline:'none', cursor:'pointer', colorScheme:'dark' }}>
                        <option value="">{lang === 'fr' ? '-- Sélectionne ton pays --' : '-- Select your country --'}</option>
                        {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      {reponses[q.id] === 'Mon pays n\'est pas dans la liste' && (
                        <input
                          type="text"
                          placeholder={lang === 'fr' ? 'Écris ton pays ici...' : 'Write your country here...'}
                          value={paysAutre}
                          onChange={e => { setPaysAutre(e.target.value); setSingle(q.id, e.target.value) }}
                          style={{ marginTop: '8px', width: '100%', maxWidth:340, padding:'10px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, outline:'none' }}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
                  <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                    style={{ padding:'11px 22px', borderRadius:10, border:`1px solid ${C.border}`, background:'transparent', color: step === 0 ? C.border : C.muted, fontSize:14, cursor: step === 0 ? 'not-allowed' : 'pointer' }}>
                    ← {lang === 'fr' ? 'Retour' : 'Back'}
                  </button>

                  {step < 5 ? (
                    <button onClick={() => setStep(s => s + 1)} disabled={!isAnswered}
                      style={{ padding:'11px 28px', borderRadius:10, border:'none', background: isAnswered ? C.accent : C.border, color:'#fff', fontSize:14, fontWeight:600, cursor: isAnswered ? 'pointer' : 'not-allowed' }}>
                      {lang === 'fr' ? 'Suivant →' : 'Next →'}
                    </button>
                  ) : (
                    <button onClick={voirResultats} disabled={!isAnswered}
                      style={{ padding:'11px 28px', borderRadius:10, border:'none', background: isAnswered ? C.accent2 : C.border, color:'#fff', fontSize:14, fontWeight:700, cursor: isAnswered ? 'pointer' : 'not-allowed' }}>
                      {lang === 'fr' ? '✨ Voir mes recommandations →' : '✨ See my recommendations →'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* TAB 2 — MON SECTEUR                                     */}
        {/* ════════════════════════════════════════════════════════ */}
        {tab === 'secteur' && (
          <>
            {/* Sélecteur programme */}
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>
                {lang === 'fr' ? 'Choisis un programme' : 'Select a program'}
              </p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {PROGRAMMES.map(p => (
                  <button key={p.id} onClick={() => setSelectedProg(p.id)} style={{ ...chip(selectedProg === p.id), padding:'7px 14px' }}>
                    {p.emoji} {p.nom[lang]}
                  </button>
                ))}
              </div>
            </div>

            {!selectedProg && (
              <div style={{ textAlign:'center', padding:'48px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, color:C.muted }}>
                <p style={{ fontSize:36, marginBottom:12 }}>📚</p>
                <p style={{ fontSize:15 }}>{lang === 'fr' ? 'Sélectionne un programme ci-dessus pour voir la fiche détaillée.' : 'Select a program above to see the detailed profile.'}</p>
              </div>
            )}

            {selectedProg && (() => {
              const info = PROGRAMMES_INFO[selectedProg]
              const prog = PROGRAMMES.find(p => p.id === selectedProg)
              const paysFiche = getPaysFiches(profile?.pays_origine || reponses.pays)
              const ficheRetour = paysFiche?.val?.[selectedProg]
              if (!info) return null

              return (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

                  {/* BLOC A — C'est quoi vraiment */}
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:12 }}>{prog.emoji} {lang === 'fr' ? `C'est quoi vraiment — ${prog.nom.fr}` : `What is really — ${prog.nom.en}`} 🎯</p>
                    <p style={{ fontSize:14, color:C.muted, lineHeight:1.8 }}>{info.cest_quoi}</p>
                  </div>

                  {/* BLOC B — Le monde */}
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>🌍 {lang === 'fr' ? 'Ce que ça change dans le monde' : 'How it changes the world'}</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {info.monde.map((m, i) => (
                        <div key={i} style={{ padding:'12px 14px', background:C.surface2, borderRadius:10, borderLeft:`3px solid ${C.accent}` }}>
                          <p style={{ fontSize:12, fontWeight:700, color:C.accent2, marginBottom:4 }}>{m.ctx}</p>
                          <p style={{ fontSize:13, color:C.muted, marginBottom:3 }}>→ {m.action}</p>
                          <p style={{ fontSize:13, color:C.success, fontWeight:500 }}>✓ {m.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BLOC C — Canada */}
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>🍁 {lang === 'fr' ? 'Où aller et quoi viser au Canada' : 'Where to go and what to aim for in Canada'}</p>

                    {/* Table villes */}
                    <div style={{ overflowX:'auto', marginBottom:18 }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead>
                          <tr>
                            {[lang === 'fr' ? 'Ville' : 'City', lang === 'fr' ? 'Secteur dominant' : 'Main sector', lang === 'fr' ? 'Salaire moyen' : 'Average salary'].map((h,i) => (
                              <th key={i} style={{ padding:'9px 14px', background:C.surface2, border:`1px solid ${C.border}`, textAlign:'left', color:C.muted, fontSize:11, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {info.villes.map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? C.surface : 'transparent' }}>
                              <td style={{ padding:'9px 14px', border:`1px solid ${C.border}`, fontWeight:600, color:C.text }}>{row.v}</td>
                              <td style={{ padding:'9px 14px', border:`1px solid ${C.border}`, color:C.muted }}>{row.s}</td>
                              <td style={{ padding:'9px 14px', border:`1px solid ${C.border}`, fontWeight:700, color:C.accent2 }}>{row.r}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Métiers actuels */}
                    <p style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>{lang === 'fr' ? 'Métiers actuels' : 'Current jobs'}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
                      {info.metiers_now.map(m => <span key={m} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:'rgba(82,183,136,0.12)', color:C.accent2, border:`1px solid ${C.accent}25` }}>{m}</span>)}
                    </div>

                    {/* Métiers futurs */}
                    <p style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>{lang === 'fr' ? 'Métiers dans 10 ans' : 'Jobs in 10 years'}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
                      {info.metiers_futur.map(m => <span key={m} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:'rgba(96,165,250,0.12)', color:'#60A5FA', border:'1px solid rgba(96,165,250,0.2)' }}>{m}</span>)}
                    </div>

                    {/* Chemin type */}
                    <div style={{ padding:'12px 16px', background:`${C.accent}08`, border:`1px solid ${C.accent}20`, borderRadius:10 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:C.accent2, marginBottom:4 }}>🛤️ {lang === 'fr' ? 'Chemin type' : 'Typical path'}</p>
                      <p style={{ fontSize:13, color:C.muted, lineHeight:1.7 }}>{info.chemin}</p>
                    </div>
                  </div>

                  {/* BLOC D — Retour au pays */}
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:12 }}>🌍 {lang === 'fr' ? 'Le retour au pays' : 'Back home'}</p>
                    {!ficheRetour ? (
                      <div style={{ textAlign:'center', padding:'20px', background:C.surface2, borderRadius:10 }}>
                        <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:14 }}>
                          {lang === 'fr'
                            ? (profile?.pays_origine ? `Les données spécifiques pour ${profile.pays_origine} × ${prog.nom.fr} ne sont pas encore disponibles — mais ton expertise sera précieuse dans ton pays.` : "Renseigne ton pays d'origine dans ton profil pour voir les opportunités spécifiques →")
                            : (profile?.pays_origine ? `Specific data for ${profile.pays_origine} × ${prog.nom.en} is not yet available — but your expertise will be valuable back home.` : 'Add your country of origin in your profile to see specific opportunities →')}
                        </p>
                        {!profile?.pays_origine && <a href="/profile_1" style={{ padding:'8px 18px', background:C.accent, borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, textDecoration:'none' }}>{lang === 'fr' ? 'Compléter mon profil →' : 'Complete my profile →'}</a>}
                      </div>
                    ) : (
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                          <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, background: ficheRetour.statut === 'Mature' ? 'rgba(52,211,153,0.12)' : ficheRetour.statut === 'En développement' ? 'rgba(251,191,36,0.12)' : 'rgba(96,165,250,0.12)', color: ficheRetour.statut === 'Mature' ? C.success : ficheRetour.statut === 'En développement' ? C.warning : '#60A5FA', border:`1px solid currentColor` }}>
                            {ficheRetour.statut}
                          </span>
                          <p style={{ fontSize:14, fontWeight:600, color:C.text }}>{paysFiche.key} × {prog.nom[lang]}</p>
                        </div>

                        <p style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>{lang === 'fr' ? '3 opportunités concrètes' : '3 concrete opportunities'}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                          {ficheRetour.opportunites.map((opp, i) => (
                            <div key={i} style={{ display:'flex', gap:10, padding:'10px 14px', background:C.surface2, borderRadius:9 }}>
                              <span style={{ color:C.accent2, fontWeight:700, flexShrink:0 }}>{i + 1}.</span>
                              <p style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{opp}</p>
                            </div>
                          ))}
                        </div>

                        <div style={{ padding:'12px 16px', background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:10, marginBottom:12 }}>
                          <p style={{ fontSize:12, fontWeight:700, color:C.warning, marginBottom:4 }}>💡 {lang === 'fr' ? 'Le manque identifié' : 'The identified gap'}</p>
                          <p style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{ficheRetour.manque}</p>
                        </div>

                        <p style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>{lang === 'fr' ? 'Acteurs à connaître' : 'Key players'}</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                          {ficheRetour.acteurs.map(a => <span key={a} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:`${C.accent}10`, color:C.accent2, border:`1px solid ${C.accent}20` }}>{a}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* TAB 3 — MA VISION                                       */}
        {/* ════════════════════════════════════════════════════════ */}
        {tab === 'vision' && (
          <>
            {!visionProg || !visionPays ? (
              <div style={{ textAlign:'center', padding:'56px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:16 }}>
                <p style={{ fontSize:36, marginBottom:14 }}>✨</p>
                <p style={{ fontWeight:700, fontSize:18, color:C.text, marginBottom:10 }}>
                  {lang === 'fr' ? 'Complète d\'abord ton profil' : 'Complete your profile first'}
                </p>
                <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, maxWidth:420, margin:'0 auto 24px' }}>
                  {lang === 'fr'
                    ? 'Complète d\'abord le quiz d\'orientation et renseigne ton pays d\'origine dans ton profil pour générer ta vision personnalisée.'
                    : 'First complete the orientation quiz and add your country of origin in your profile to generate your personalized vision.'}
                </p>
                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                  {!visionProg && <button onClick={() => setTab('orientation')} style={{ padding:'10px 22px', background:C.accent, borderRadius:9, color:'#fff', fontWeight:600, fontSize:14, border:'none', cursor:'pointer' }}>{lang === 'fr' ? '🎯 Faire le quiz →' : '🎯 Take the quiz →'}</button>}
                  {!visionPays && <a href="/profile_1" style={{ padding:'10px 22px', background:`${C.accent}15`, border:`1px solid ${C.accent}35`, borderRadius:9, color:C.accent2, fontWeight:600, fontSize:14, textDecoration:'none' }}>{lang === 'fr' ? 'Compléter mon profil →' : 'Complete my profile →'}</a>}
                </div>
              </div>
            ) : (
              <div>
                {/* Programme et pays sélectionnés */}
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:24, padding:'14px 18px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:12 }}>
                  {(() => { const prog = PROGRAMMES.find(p => p.id === visionProg); return prog ? <><span style={{ fontSize:22 }}>{prog.emoji}</span><span style={{ fontSize:14, fontWeight:600, color:C.text }}>{prog.nom[lang]}</span></> : null })()}
                  <span style={{ color:C.border }}>·</span>
                  <span style={{ fontSize:14, color:C.muted }}>🌍 {visionPays}</span>
                  {!vision && !visLoading && (
                    <button onClick={genererVision} style={{ marginLeft:'auto', padding:'10px 22px', background:C.accent, border:'none', borderRadius:9, color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                      ✨ {lang === 'fr' ? 'Générer ma vision' : 'Generate my vision'}
                    </button>
                  )}
                  {vision && !visLoading && (
                    <button onClick={genererVision} style={{ marginLeft:'auto', padding:'7px 14px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:12, cursor:'pointer' }}>
                      ↻ {lang === 'fr' ? 'Régénérer' : 'Regenerate'}
                    </button>
                  )}
                </div>

                {visLoading && (
                  <div style={{ textAlign:'center', padding:'48px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:16 }}>
                    <p style={{ fontSize:14, color:C.muted }}>✨ {lang === 'fr' ? 'Génération de ta vision personnalisée...' : 'Generating your personalized vision...'}</p>
                  </div>
                )}

                {visError && <p style={{ color:C.error, fontSize:13, marginBottom:16 }}>⚠️ {visError}</p>}

                {vision && (
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

                    {/* Message motivation */}
                    {vision.message_motivation && (
                      <div className="fade-up" style={{ padding:'20px 24px', background:'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)', borderRadius:14 }}>
                        <p style={{ color:'#fff', fontSize:15, lineHeight:1.8, fontStyle:'italic', margin:0 }}>{vision.message_motivation}</p>
                      </div>
                    )}

                    {/* BLOC 1 — Métiers d'avenir */}
                    <div className="fade-up fade-up-1" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                      <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>💼 {lang === 'fr' ? 'Mes métiers d\'avenir' : 'My future careers'}</p>

                      <p style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>{lang === 'fr' ? 'Aujourd\'hui' : 'Today'}</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18 }}>
                        {(vision.metiers_actuels || []).map((m, i) => (
                          <div key={i} style={{ padding:'12px 16px', background:C.surface2, borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                            <div style={{ flex:1 }}>
                              <p style={{ fontWeight:600, fontSize:14, color:C.text, marginBottom:3 }}>{m.titre}</p>
                              <p style={{ fontSize:13, color:C.muted }}>{m.description}</p>
                            </div>
                            {m.salaire_canada && <span style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:`${C.success}12`, color:C.success, border:`1px solid ${C.success}25`, whiteSpace:'nowrap', fontWeight:600 }}>{m.salaire_canada}</span>}
                          </div>
                        ))}
                      </div>

                      <p style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>{lang === 'fr' ? 'Dans 10 ans' : 'In 10 years'}</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                        {(vision.metiers_futur || []).map((m, i) => (
                          <div key={i} style={{ padding:'12px 16px', background:'rgba(96,165,250,0.06)', borderRadius:10, border:'1px solid rgba(96,165,250,0.15)' }}>
                            <p style={{ fontWeight:600, fontSize:14, color:'#60A5FA', marginBottom:4 }}>{m.titre}</p>
                            <p style={{ fontSize:13, color:C.muted, marginBottom:6 }}>{m.description}</p>
                            <p style={{ fontSize:12, color:'#60A5FA', fontStyle:'italic' }}>→ {m.pourquoi_emerge}</p>
                          </div>
                        ))}
                      </div>

                      {vision.impact_ia && (
                        <div style={{ padding:'12px 16px', background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:10 }}>
                          <p style={{ fontSize:12, fontWeight:700, color:C.warning, marginBottom:4 }}>🤖 {lang === 'fr' ? 'Impact de l\'IA sur ce secteur' : 'AI impact on this sector'}</p>
                          <p style={{ fontSize:13, color:C.muted, lineHeight:1.7 }}>{vision.impact_ia}</p>
                        </div>
                      )}
                    </div>

                    {/* BLOC 2 — Idées startup */}
                    {(vision.startups || []).length > 0 && (
                      <div className="fade-up fade-up-2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>🚀 {lang === 'fr' ? 'Mes idées de startup' : 'My startup ideas'}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                          {vision.startups.map((s, i) => (
                            <div key={i} style={{ padding:'16px 18px', background:C.surface2, borderRadius:12, borderLeft:`3px solid ${i === 0 ? C.accent2 : i === 1 ? '#60A5FA' : C.rose}` }}>
                              <p style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:6 }}>🏢 {s.nom}</p>
                              <p style={{ fontSize:13, color:C.muted, marginBottom:4 }}><strong style={{ color:C.text }}>{lang === 'fr' ? 'Problème :' : 'Problem:'}</strong> {s.probleme}</p>
                              <p style={{ fontSize:13, color:C.muted, marginBottom:4 }}><strong style={{ color:C.text }}>{lang === 'fr' ? 'Solution :' : 'Solution:'}</strong> {s.solution}</p>
                              <p style={{ fontSize:13, color:C.accent2, marginBottom:4 }}>💡 {s.pourquoi_toi}</p>
                              <p style={{ fontSize:12, color:C.muted, fontStyle:'italic' }}>Modèle : {s.exemple_mondial}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BLOC 3 — Plan 5 ans */}
                    {vision.plan_5ans && (
                      <div className="fade-up fade-up-3" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>🗺️ {lang === 'fr' ? 'Mon plan en 5 ans' : 'My 5-year plan'}</p>
                        {[
                          { label: lang === 'fr' ? 'Années 1-2' : 'Years 1-2', text:vision.plan_5ans.annee_1_2, color:C.accent2, bg:`${C.accent}10` },
                          { label: lang === 'fr' ? 'Années 3-4' : 'Years 3-4', text:vision.plan_5ans.annee_3_4, color:'#60A5FA', bg:'rgba(96,165,250,0.08)' },
                          { label: lang === 'fr' ? 'Année 5' : 'Year 5',    text:vision.plan_5ans.annee_5,   color:C.rose,    bg:`${C.rose}10` },
                        ].map((row, i) => (
                          <div key={i} style={{ display:'flex', gap:14, marginBottom: i < 2 ? 12 : 0 }}>
                            <div style={{ width:80, flexShrink:0 }}>
                              <span style={{ display:'inline-block', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:row.bg, color:row.color }}>{row.label}</span>
                            </div>
                            <p style={{ fontSize:13, color:C.muted, lineHeight:1.7, paddingTop:2 }}>{row.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}
