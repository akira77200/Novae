// pages/mon-avenir.js — NOVAE v5 — Orientation · Secteur · Vision
import { useState, useEffect } from 'react'

import FeedbackSection from '../components/FeedbackSection'
import { useApp } from '../context/AppContext'
import { useAuthFetch } from '../lib/useAuthFetch'

const PAYS_PAR_REGION = {
  "🌍 Afrique": [
    "Afrique du Sud","Algérie","Angola","Bénin","Botswana","Burkina Faso",
    "Burundi","Cameroun","Cap-Vert","Centrafrique","Comores","Congo",
    "Côte d'Ivoire","Djibouti","Égypte","Éthiopie","Gabon","Gambie","Ghana",
    "Guinée","Guinée-Bissau","Kenya","Lesotho","Libéria","Libye",
    "Madagascar","Malawi","Mali","Maroc","Maurice","Mauritanie","Mozambique",
    "Namibie","Niger","Nigeria","Ouganda","Rwanda","Sénégal","Sierra Leone",
    "Somalie","Soudan","Tanzanie","Tchad","Togo","Tunisie","Zambie","Zimbabwe",
  ],
  "🌏 Asie": [
    "Afghanistan","Arabie Saoudite","Bangladesh","Birmanie","Cambodge",
    "Chine","Corée du Sud","Émirats arabes unis","Inde","Indonésie","Irak",
    "Iran","Israël","Japon","Jordanie","Kazakhstan","Koweït","Laos","Liban",
    "Malaisie","Mongolie","Népal","Oman","Ouzbékistan","Pakistan","Philippines",
    "Qatar","Singapour","Sri Lanka","Syrie","Taïwan","Thaïlande","Turquie",
    "Viêt Nam","Yémen",
  ],
  "🌎 Amériques": [
    "Argentine","Bolivie","Brésil","Chili","Colombie","Costa Rica","Cuba",
    "Équateur","États-Unis","Guatemala","Haïti","Honduras","Jamaïque",
    "Mexique","Nicaragua","Panama","Paraguay","Pérou",
    "République dominicaine","Salvador","Suriname","Trinité-et-Tobago",
    "Uruguay","Venezuela",
  ],
  "🌍 Europe": [
    "Albanie","Allemagne","Autriche","Belgique","Biélorussie","Bulgarie",
    "Croatie","Danemark","Espagne","Finlande","France","Grèce","Hongrie",
    "Irlande","Italie","Moldavie","Norvège","Pays-Bas","Pologne","Portugal",
    "République tchèque","Roumanie","Royaume-Uni","Russie","Serbie",
    "Slovaquie","Slovénie","Suède","Suisse","Ukraine",
  ],
  "🌊 Océanie": [
    "Australie","Fidji","Nouvelle-Zélande","Papouasie-Nouvelle-Guinée","Samoa",
  ],
}

// ── QUIZ — Données des questions ────────────────────────────────
const MATIERES_CHIPS = [
  { id:'math',         fr:'Mathématiques / Statistiques',     en:'Mathematics / Statistics'     },
  { id:'sciences',     fr:'Sciences (physique, chimie, bio)', en:'Sciences (physics, chem, bio)' },
  { id:'informatique', fr:'Informatique / Technologie',        en:'Computer Science / Tech'      },
  { id:'langues',      fr:'Langues / Communication',           en:'Languages / Communication'    },
  { id:'sh',           fr:'Sciences humaines / Histoire',      en:'Humanities / History'         },
  { id:'arts',         fr:'Arts / Créativité',                 en:'Arts / Creativity'            },
  { id:'economie',     fr:'Économie / Commerce',               en:'Economics / Business'         },
]
const ACTIVITE_OPTIONS = [
  { id:'analyser',   fr:'Analyser des données et résoudre des problèmes', en:'Analyze data and solve problems' },
  { id:'construire', fr:'Construire et concevoir des systèmes',            en:'Build and design systems'       },
  { id:'aider',      fr:'Aider et accompagner des personnes',              en:'Help and support people'        },
  { id:'diriger',    fr:'Diriger et organiser des équipes',                en:'Lead and organize teams'        },
  { id:'innover',    fr:'Créer et innover librement',                      en:'Create and innovate freely'     },
]
const RISQUE_OPTIONS = [
  { id:'stabilite',    fr:'Je préfère la stabilité (grand employeur, fonction publique)', en:'I prefer stability (large employer, public sector)' },
  { id:'equilibre',    fr:"J'aime l'équilibre (PME, ONG, institutions)",                  en:'I like balance (SME, NGO, institutions)'            },
  { id:'entreprendre', fr:'Je veux entreprendre (startup, freelance, indépendant)',        en:'I want to start my own (startup, freelance)'        },
  { id:'autre',        fr:'Autre — décris ton rapport au risque',                          en:'Other — describe your relationship with risk'       },
]
const HORIZON_OPTIONS = [
  { id:'rester', fr:'Rester au Canada après mes études',  en:'Stay in Canada after graduation' },
  { id:'retour', fr:"Retourner dans mon pays d'origine",   en:'Return to my home country'       },
  { id:'pont',   fr:'Les deux — construire des ponts',     en:'Both — build bridges'            },
  { id:'autre',  fr:'Autre — décris ton projet',           en:'Other — describe your project'   },
]
const BUDGET_OPTIONS = [
  { id:'moins15', fr:'Moins de 15 000 $ CAD',  en:'Under CAD 15,000'    },
  { id:'15-25',   fr:'15 000 – 25 000 $ CAD',  en:'CAD 15,000 – 25,000' },
  { id:'25-40',   fr:'25 000 – 40 000 $ CAD',  en:'CAD 25,000 – 40,000' },
  { id:'plus40',  fr:'Plus de 40 000 $ CAD',    en:'Over CAD 40,000'     },
]

// ── PROGRAMMES — 25 programmes groupés par domaine ──────────────
const PROGRAMMES = [
  // 💻 TECH & DATA
  { id:'data-science',    emoji:'📊', nom:{fr:'Data Science / Statistiques',            en:'Data Science'},              domaine:'tech'         },
  { id:'genie-logiciel',  emoji:'💻', nom:{fr:'Génie logiciel / Informatique',          en:'Software Engineering'},      domaine:'tech'         },
  { id:'cybersecurite',   emoji:'🔐', nom:{fr:'Cybersécurité',                          en:'Cybersecurity'},             domaine:'tech'         },
  { id:'ia-ml',           emoji:'🤖', nom:{fr:'Intelligence artificielle / ML',         en:'AI / ML'},                   domaine:'tech'         },
  { id:'reseaux',         emoji:'📡', nom:{fr:'Réseaux & Télécommunications',            en:'Networks & Telecom'},        domaine:'tech'         },
  // ⚙️ INGÉNIERIE
  { id:'genie-civil',     emoji:'🏗️', nom:{fr:'Génie civil / Construction',             en:'Civil Engineering'},         domaine:'ingenierie'   },
  { id:'genie-electrique',emoji:'⚡', nom:{fr:'Génie électrique',                       en:'Electrical Engineering'},    domaine:'ingenierie'   },
  { id:'genie-mecanique', emoji:'⚙️', nom:{fr:'Génie mécanique',                        en:'Mechanical Engineering'},    domaine:'ingenierie'   },
  { id:'genie-minier',    emoji:'⛏️', nom:{fr:'Génie minier / Géologie',               en:'Mining Engineering'},        domaine:'ingenierie'   },
  // 💼 BUSINESS & FINANCE
  { id:'finance',         emoji:'💰', nom:{fr:'Finance / Comptabilité',                 en:'Finance / Accounting'},      domaine:'business'     },
  { id:'administration',  emoji:'📋', nom:{fr:'Administration des affaires',            en:'Business Administration'},   domaine:'business'     },
  { id:'marketing',       emoji:'📣', nom:{fr:'Marketing / Communication',              en:'Marketing'},                 domaine:'business'     },
  { id:'entrepreneuriat', emoji:'🚀', nom:{fr:'Entrepreneuriat / Innovation',           en:'Entrepreneurship'},          domaine:'business'     },
  { id:'rh',              emoji:'👥', nom:{fr:'Ressources humaines',                    en:'Human Resources'},           domaine:'business'     },
  // 🏥 SANTÉ
  { id:'sante',           emoji:'🏥', nom:{fr:'Sciences infirmières / Soins',           en:'Nursing / Health'},          domaine:'sante'        },
  { id:'pharmacie',       emoji:'💊', nom:{fr:'Pharmacie',                              en:'Pharmacy'},                  domaine:'sante'        },
  { id:'sante-publique',  emoji:'🌡️', nom:{fr:'Santé publique / Épidémiologie',        en:'Public Health'},             domaine:'sante'        },
  { id:'psychologie',     emoji:'🧠', nom:{fr:'Psychologie / Travail social',           en:'Psychology'},                domaine:'sante'        },
  // ⚖️ SCIENCES SOCIALES
  { id:'droit',           emoji:'⚖️', nom:{fr:'Droit / Sciences juridiques',            en:'Law'},                       domaine:'social'       },
  { id:'sciences-po',     emoji:'🌍', nom:{fr:'Sciences politiques / Relations intern.',en:'Political Science'},         domaine:'social'       },
  { id:'education',       emoji:'🎓', nom:{fr:'Éducation / Enseignement',               en:'Education'},                 domaine:'social'       },
  // 🌱 ENVIRONNEMENT
  { id:'environnement',   emoji:'🌱', nom:{fr:'Environnement / Développement durable',  en:'Environment'},               domaine:'environnement'},
  { id:'energie',         emoji:'☀️', nom:{fr:'Énergies renouvelables',                 en:'Renewable Energy'},          domaine:'environnement'},
  { id:'agriculture',     emoji:'🌾', nom:{fr:'Agriculture / Agroalimentaire',          en:'Agriculture'},               domaine:'environnement'},
  // 🎨 ARTS & MÉDIAS
  { id:'design-ux',       emoji:'🎨', nom:{fr:'Design / UX / Architecture',             en:'Design / UX'},               domaine:'arts'         },
]

const DOMAINES_LABELS = {
  tech:          { fr:'💻 Tech & Data',          en:'💻 Tech & Data'          },
  ingenierie:    { fr:'⚙️ Ingénierie',           en:'⚙️ Engineering'          },
  business:      { fr:'💼 Business & Finance',   en:'💼 Business & Finance'   },
  sante:         { fr:'🏥 Santé',                en:'🏥 Health'               },
  social:        { fr:'⚖️ Sciences sociales',    en:'⚖️ Social Sciences'      },
  environnement: { fr:'🌱 Environnement',        en:'🌱 Environment'          },
  arts:          { fr:'🎨 Arts & Médias',        en:'🎨 Arts & Media'         },
}

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
  const { matieres = [], activite, risque, horizon, budget } = reponses

  const scores = {}
  PROGRAMMES.forEach(p => { scores[p.id] = 0 })

  // MATIÈRES — impact fort (+30 par match)
  if (matieres.includes('math')) {
    scores['data-science']     += 30; scores['finance']          += 25
    scores['genie-logiciel']   += 25; scores['genie-electrique'] += 30
    scores['ia-ml']            += 25
  }
  if (matieres.includes('informatique')) {
    scores['genie-logiciel']   += 35; scores['data-science']     += 30
    scores['cybersecurite']    += 30; scores['ia-ml']            += 35
    scores['reseaux']          += 25
  }
  if (matieres.includes('sciences')) {
    scores['sante']            += 30; scores['environnement']    += 30
    scores['genie-civil']      += 20; scores['genie-electrique'] += 25
    scores['pharmacie']        += 30; scores['sante-publique']   += 25
    scores['genie-mecanique']  += 25; scores['energie']          += 25
    scores['agriculture']      += 20
  }
  if (matieres.includes('economie')) {
    scores['finance']          += 35; scores['administration']   += 30
    scores['droit']            += 20; scores['entrepreneuriat']  += 25
    scores['marketing']        += 20
  }
  if (matieres.includes('langues')) {
    scores['droit']            += 25; scores['administration']   += 20
    scores['education']        += 30; scores['marketing']        += 25
    scores['sciences-po']      += 25; scores['rh']               += 20
  }
  if (matieres.includes('sh')) {
    scores['education']        += 35; scores['droit']            += 25
    scores['sante']            += 15; scores['psychologie']      += 35
    scores['sciences-po']      += 30; scores['rh']               += 25
  }
  if (matieres.includes('arts')) {
    scores['design-ux']        += 40; scores['marketing']        += 25
    scores['education']        += 15
  }

  // ACTIVITÉ (+25)
  if (activite === 'analyser') {
    scores['data-science']     += 25; scores['finance']          += 20
    scores['sante-publique']   += 20; scores['ia-ml']            += 20
  }
  if (activite === 'construire') {
    scores['genie-civil']      += 25; scores['genie-electrique'] += 20
    scores['genie-logiciel']   += 15; scores['genie-mecanique']  += 25
    scores['genie-minier']     += 20
  }
  if (activite === 'aider') {
    scores['sante']            += 25; scores['education']        += 20
    scores['droit']            += 15; scores['psychologie']      += 25
    scores['rh']               += 20
  }
  if (activite === 'diriger') {
    scores['administration']   += 25; scores['droit']            += 20
    scores['entrepreneuriat']  += 25; scores['sciences-po']      += 20
    scores['rh']               += 15
  }
  if (activite === 'innover') {
    scores['genie-logiciel']   += 25; scores['data-science']     += 20
    scores['environnement']    += 20; scores['genie-electrique'] += 15
    scores['ia-ml']            += 30; scores['entrepreneuriat']  += 30
    scores['design-ux']        += 20
  }

  // RISQUE (+15)
  if (risque === 'startup' || risque === 'entreprendre') {
    scores['genie-logiciel']   += 15; scores['data-science']     += 15
    scores['entrepreneuriat']  += 25; scores['ia-ml']            += 15
    scores['design-ux']        += 10
  }
  if (risque === 'stabilite') {
    scores['sante']            += 15; scores['education']        += 15
    scores['droit']            += 10; scores['genie-civil']      += 10
    scores['pharmacie']        += 15
  }

  // HORIZON (+10)
  if (horizon === 'retour') {
    scores['sante']            += 10; scores['education']        += 10
    scores['genie-civil']      += 10; scores['environnement']    += 15
    scores['agriculture']      += 20; scores['energie']          += 15
    scores['sante-publique']   += 15
  }
  if (horizon === 'rester') {
    scores['genie-logiciel']   += 10; scores['data-science']     += 10
    scores['finance']          += 10; scores['cybersecurite']    += 10
    scores['ia-ml']            += 10
  }
  if (horizon === 'pont' || horizon === 'les-deux') {
    scores['entrepreneuriat']  += 15; scores['data-science']     += 5
    scores['sciences-po']      += 10
  }

  // BUDGET (+10)
  if (budget === 'moins15' || budget === 'moins15k') {
    scores['education']        += 10; scores['administration']   += 10
    scores['marketing']        += 10
  }
  if (budget === 'plus40' || budget === 'plus40k') {
    scores['sante']            += 10; scores['droit']            += 10
    scores['pharmacie']        += 15
  }

  const maxScore = Math.max(...Object.values(scores), 1)

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, score]) => {
      const prog = PROGRAMMES.find(p => p.id === id) || { id, emoji:'📋', nom:{fr:id,en:id} }
      return { ...prog, score, pct: Math.min(Math.round((score / maxScore) * 100), 99) }
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

  // Matières pertinentes selon le programme
  const PROG_MATIERES = {
    'data-science':['math','informatique','economie'], 'genie-logiciel':['informatique','math'],
    'genie-civil':['math','sciences'], 'finance':['math','economie'], 'administration':['economie','langues'],
    'sante':['sciences','sh'], 'droit':['langues','sh'], 'education':['sh','langues'],
    'genie-electrique':['math','sciences','informatique'], 'environnement':['sciences','math'],
    'cybersecurite':['informatique','math'], 'ia-ml':['informatique','math'],
    'reseaux':['informatique','math','sciences'], 'genie-mecanique':['math','sciences'],
    'genie-minier':['math','sciences'], 'marketing':['economie','langues'],
    'entrepreneuriat':['economie'], 'rh':['langues','sh'], 'pharmacie':['sciences'],
    'sante-publique':['sciences','sh'], 'psychologie':['sh'], 'sciences-po':['langues','sh'],
    'energie':['sciences','math'], 'agriculture':['sciences'], 'design-ux':['arts'],
  }
  const progMatieres = PROG_MATIERES[prog.id] || []
  const matieresMatch = progMatieres.filter(m => matieres.includes(m)).map(m => ml[m] || m)
  if (matieresMatch.length > 0) {
    raisons.push(isFr
      ? `tu excelles en ${matieresMatch.join(' et ')}`
      : `you excel in ${matieresMatch.join(' and ')}`)
  }

  const PROG_ACTIVITES = {
    'data-science':['analyser'], 'genie-logiciel':['construire','innover'], 'genie-civil':['construire'],
    'finance':['analyser','diriger'], 'administration':['diriger'], 'sante':['aider'],
    'droit':['aider','diriger'], 'education':['aider'], 'genie-electrique':['construire','innover'],
    'environnement':['construire','innover'], 'cybersecurite':['analyser','construire'],
    'ia-ml':['analyser','innover'], 'reseaux':['construire'], 'genie-mecanique':['construire'],
    'genie-minier':['construire'], 'marketing':['innover'], 'entrepreneuriat':['innover','diriger'],
    'rh':['aider','diriger'], 'pharmacie':['aider'], 'sante-publique':['analyser','aider'],
    'psychologie':['aider'], 'sciences-po':['analyser','diriger'], 'energie':['construire','innover'],
    'agriculture':['construire'], 'design-ux':['innover'],
  }
  if (reponses.activite && (PROG_ACTIVITES[prog.id] || []).includes(reponses.activite)) {
    raisons.push(isFr
      ? `tu veux ${al[reponses.activite]}`
      : `you want to ${al[reponses.activite]}`)
  }

  if (matieres.includes('math') && matieres.includes('informatique') && ['data-science', 'genie-logiciel', 'ia-ml', 'cybersecurite'].includes(prog.id)) {
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

const LOAD_MSGS_FR = [
  'Lecture de ton profil...', 'Identification de tes forces...',
  'Recherche des meilleures correspondances...', 'Préparation de tes recommandations...', 'Finalisation de ton analyse...',
]
const LOAD_MSGS_EN = [
  'Reading your profile...', 'Identifying your strengths...',
  'Searching for best matches...', 'Preparing your recommendations...', 'Finalizing your analysis...',
]


// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────
export default function MonAvenir() {
  const { C, lang, profile, loading: authLoading, sb } = useApp()
  const { authFetch } = useAuthFetch()

  const [tab,         setTab]         = useState('orientation')
  const [selectedProg,setSelectedProg]= useState(null)
  const [vision,      setVision]      = useState(null)
  const [visLoading,  setVisLoading]  = useState(false)
  const [visError,    setVisError]    = useState('')
  const [reponses,    setReponses]    = useState({}) // kept for vision tab
  const [visionForm,  setVisionForm]  = useState({ passion:'', defi:'', impact:'', contexte:'' })
  const [visionCache, setVisionCache] = useState(null)

  // ── Orientation conversationnelle (T7) ────────────────────────
  const [orientStep,    setOrientStep]    = useState(0)  // 0-4
  const [orientPhase,   setOrientPhase]   = useState('questions') // 'questions'|'loading'|'results'
  const [orientAnalyse, setOrientAnalyse] = useState(null)
  const [orientErr,     setOrientErr]     = useState('')
  const [loadMsgIdx,    setLoadMsgIdx]    = useState(0)
  const [orientData,    setOrientData]    = useState({
    matieres: [], matieresTexte: '',
    activite: '', activiteTexte: '',
    risque: '', risqueTexte: '',
    horizon: '', horizonTexte: '',
    pays: '', paysAutre2: '',
    budget: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('novae_orientation_v2')
    if (saved) { try { const d = JSON.parse(saved); if (d.analyse) { setOrientAnalyse(d.analyse); setOrientData(d.reponses || {}); setOrientPhase('results') } } catch {} }
    const savedVision = localStorage.getItem('novae_vision_complete')
    if (savedVision) { try { const v = JSON.parse(savedVision); if (v.vision) setVision(v.vision) } catch {} }
  }, [])

  useEffect(() => {
    if (!profile) return
    if (profile.pays_origine) {
      setOrientData(d => d.pays ? d : { ...d, pays: profile.pays_origine })
      setReponses(r => r.pays ? r : { ...r, pays: profile.pays_origine })
    }
    if (profile.programme) {
      const prog = profile.programme.toLowerCase()
      const match = PROGRAMMES.find(p => prog.includes(p.id.split('-')[0]) || p.nom.fr.toLowerCase().includes(prog.split(' ')[0]))
      if (match && !selectedProg) { setSelectedProg(match.id); setTab('secteur') }
    }
  }, [profile])

  // ── Orientation helpers ───────────────────────────────────────
  const setOD = (k, v) => setOrientData(d => ({ ...d, [k]: v }))
  const toggleChip = (field, id, max = Infinity) => setOrientData(d => {
    const cur = d[field] || []
    if (cur.includes(id)) return { ...d, [field]: cur.filter(x => x !== id) }
    if (cur.length >= max) return d
    return { ...d, [field]: [...cur, id] }
  })

  const stepOks = [
    orientData.matieres.length > 0,
    !!orientData.activite,
    !!orientData.risque,
    !!orientData.horizon,
    !!(orientData.pays && (orientData.pays !== 'Autre' || orientData.paysAutre2.trim())),
    !!orientData.budget,
  ]
  const stepOk = stepOks[orientStep] ?? false

  const analyserProfil = async () => {
    setOrientPhase('loading')
    setOrientErr('')
    let msgTimer
    try {
      msgTimer = setInterval(() => setLoadMsgIdx(i => (i + 1) % 5), 2000)
      const res = await authFetch('/api/analyser-profil', {
        method: 'POST',
        body: JSON.stringify({ reponses: orientData }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { setOrientPhase('questions'); setOrientErr(json.error || (lang === 'fr' ? 'Erreur' : 'Error')); return }
      setOrientAnalyse(json.analyse)
      setOrientPhase('results')
      try { localStorage.setItem('novae_orientation_v2', JSON.stringify({ reponses: orientData, analyse: json.analyse, date: new Date().toISOString() })) } catch {}
    } catch (e) {
      setOrientPhase('questions')
      if (e.message === 'SESSION_MISSING' || e.message === 'SESSION_EXPIRED') {
        setOrientErr(lang === 'fr' ? 'Session expirée. Reconnecte-toi.' : 'Session expired. Please reconnect.')
      } else {
        setOrientErr(e.message)
      }
    }
    finally { clearInterval(msgTimer) }
  }

  useEffect(() => {
    if (tab === 'vision' && !vision) {
      try {
        const raw = localStorage.getItem('novae_vision_complete')
        if (raw) setVisionCache(JSON.parse(raw))
      } catch {}
    }
  }, [tab])

  const refaireOrientation = () => {
    setOrientPhase('questions'); setOrientStep(0); setOrientAnalyse(null); setOrientErr('')
    setOrientData({ matieres:[], matieresTexte:'', activite:'', activiteTexte:'', risque:'', risqueTexte:'', horizon:'', horizonTexte:'', pays: orientData.pays, paysAutre2:'', budget:'' })
    try { localStorage.removeItem('novae_orientation_v2') } catch {}
  }

  // ── Vision ────────────────────────────────────────────────────
  const visionProg = selectedProg || orientAnalyse?.programmes_recommandes?.[0]?.id
  const visionPays = profile?.pays_origine || orientData.pays || ''

  const genererVision = async () => {
    if (!visionProg) return
    setVisLoading(true); setVisError(''); setVision(null)

    try {
      const progInfo = PROGRAMMES.find(p => p.id === visionProg)
      const payload = {
        programme: progInfo ? progInfo.nom[lang] : visionProg,
        pays_origine: visionPays,
        horizon: orientData.horizon || 'non renseigné',
        activites: orientData.activite || 'non renseigné',
        description: [
          orientData.matieresTexte,
          orientData.activiteTexte,
          orientData.horizonTexte,
        ].filter(Boolean).join(' | '),
        passion:  visionForm.passion,
        defi:     visionForm.defi,
        impact:   visionForm.impact,
        contexte: visionForm.contexte,
      }

      const res = await authFetch('/api/generer-vision', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const rawText = await res.text()

      let data
      try {
        data = JSON.parse(rawText)
      } catch (parseErr) {
        setVisError(lang === 'fr' ? `Réponse inattendue: ${rawText.substring(0, 200)}` : `Unexpected response: ${rawText.substring(0, 200)}`)
        return
      }

      if (!res.ok) {
        setVisError(data.error || (lang === 'fr' ? 'Erreur inconnue' : 'Unknown error'))
        return
      }

      if (data.success) {
        setVision(data.vision)
        try { localStorage.setItem('novae_vision_complete', JSON.stringify({ vision: data.vision, prog: visionProg, pays: visionPays, date: new Date().toISOString() })) } catch {}
        if (profile?.id && sb) {
          try { await sb.from('profiles').update({ ai_recommendations: data.vision }).eq('id', profile.id) } catch {}
        }
      } else {
        setVisError(data.error || (lang === 'fr' ? 'Erreur' : 'Error'))
      }
    } catch (err) {
      setVisError(`${err.name}: ${err.message}`)
    } finally {
      setVisLoading(false)
    }
  }

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  const telechargerVisionPDF = () => {
    // 1. Ouvrir immédiatement (synchrone — requis par Safari/iOS)
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert(lang === 'fr'
        ? "Ton navigateur a bloqué l'ouverture. Autorise les popups pour ce site."
        : 'Your browser blocked the popup. Allow popups for this site.')
      return
    }

    // 2. Loader temporaire
    printWindow.document.write(
      '<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;"><p>Génération en cours...</p></body></html>'
    )

    // 3. Vérifier l'élément (synchrone)
    const visionElement = document.getElementById('vision-print')
    if (!visionElement) {
      printWindow.close()
      alert(lang === 'fr'
        ? "Génère d'abord ta vision avant de télécharger."
        : 'Generate your vision first before downloading.')
      return
    }

    // 4. Réécrire le contenu final
    printWindow.document.open()
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${lang === 'fr' ? 'Ma Vision' : 'My Vision'} - Novae</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10.5pt; line-height: 1.6; color: #1a1a1a; background: #fff; padding: 15mm; }
    h1, h2, h3 { color: #1E3A5F; }
    h2 { font-size: 13pt; border-bottom: 2px solid #1E3A5F; padding-bottom: 6px; margin: 20px 0 10px; }
    h3 { font-size: 11pt; margin: 12px 0 6px; }
    p { margin-bottom: 8px; color: #333; }
    .badge { display: inline-block; background: #DBEAFE; color: #1E3A5F; padding: 3px 10px; border-radius: 99px; font-size: 9pt; font-weight: 600; margin: 4px 4px 4px 0; }
    .card { border: 1px solid rgba(45,106,79,0.2); border-radius: 8px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid; }
    .italic { font-style: italic; color: #555; }
    .green-box { background: #DBEAFE; padding: 10px; border-radius: 8px; margin: 10px 0; }
    .orange-box { background: #FEF3E2; padding: 10px; border-radius: 8px; margin: 10px 0; }
    .blue-box { background: #E3F2FD; padding: 10px; border-radius: 8px; margin: 10px 0; }
    .no-print, button { display: none !important; }
    /* Forcer fond blanc et texte foncé sur tous les éléments inline */
    div, section, article { background: transparent !important; color: #1a1a1a !important; border-color: rgba(45,106,79,0.2) !important; }
    span { color: #333 !important; }
    strong { color: #111 !important; }
    @page { size: A4; margin: 0; }
    @media print { body { padding: 12mm; } }
  </style>
</head>
<body>
  <div style="border-bottom:2px solid #1E3A5F; padding-bottom:10px; margin-bottom:16px;">
    <div style="color:#1E3A5F; font-size:18pt; font-weight:bold;">NOVAE</div>
    <div style="color:#888; font-size:9pt;">${lang === 'fr' ? 'Ta vision personnalisée' : 'Your personalized vision'} · ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')}</div>
  </div>
  ${visionElement.innerHTML}
</body>
</html>`)

    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.document.querySelectorAll('.no-print, button').forEach(el => {
        el.style.display = 'none'
      })
      setTimeout(() => printWindow.print(), 500)
    }
  }


  // ── Style helpers ──────────────────────────────────────────────
  const chip = (active, color = C.accent) => ({
    padding: '8px 16px', borderRadius: 20, border: `1px solid ${active ? color + '55' : C.border}`,
    background: active ? color + '18' : 'transparent', color: active ? color : C.muted,
    fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
  })

  const selectProg = (id) => {
    setSelectedProg(id)
    try { localStorage.setItem('novae_programme_choisi', id) } catch {}
  }

  const TABS = [
    { id:'orientation', fr:'🎯 Mon orientation', en:'🎯 My Path'    },
    { id:'secteur',     fr:'📚 Mon secteur',     en:'📚 My Sector'  },
    { id:'vision',      fr:'✨ Ma vision',        en:'✨ My Vision'  },
  ]

  if (authLoading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:C.muted, fontSize:14 }}>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>


      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes novaDot { 0%,80%,100%{ transform:scale(0.6); opacity:0.4; } 40%{ transform:scale(1); opacity:1; } }
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

        {/* Stepper de progression */}
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:16, flexWrap:'nowrap', overflowX:'auto' }}>
          {TABS.map((tb, i) => {
            const done = tb.id === 'orientation' ? orientPhase === 'results' : tb.id === 'secteur' ? !!selectedProg : !!vision
            const active = tab === tb.id
            return [
              i > 0 && <div key={`sep${i}`} style={{ flex:1, minWidth:16, height:2, background: done ? C.accent+'50' : C.border, borderRadius:2 }} />,
              <button key={tb.id} onClick={() => setTab(tb.id)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:20, border:`1px solid ${active ? C.accent+'60' : done ? C.accent+'30' : C.border}`, background: active ? `${C.accent}15` : done ? `${C.accent}08` : 'transparent', color: active ? C.accent2 : done ? C.accent2 : C.muted, fontSize:12, fontWeight: active ? 700 : 500, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}>
                <span style={{ width:16, height:16, borderRadius:'50%', border:`1.5px solid ${active ? C.accent : done ? C.accent+'60' : C.border}`, display:'flex', alignItems:'center', justifyContent:'center', background: done ? `${C.accent}15` : 'transparent', fontSize:9, flexShrink:0 }}>
                  {done ? '✓' : i + 1}
                </span>
                {lang === 'fr' ? tb.fr : tb.en}
              </button>
            ]
          })}
        </div>

        {/* Tabs — style identique dashboard.js */}
        <div style={{ display:'flex', gap:4, marginBottom:28, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:4 }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{ flex:1, padding:'10px 12px', borderRadius:8, border:'none', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s', background: tab === tb.id ? C.accent : 'transparent', color: tab === tb.id ? '#fff' : C.muted }}>
              {lang === 'fr' ? tb.fr : tb.en}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* TAB 1 — MON ORIENTATION — 3 PHASES                      */}
        {/* ════════════════════════════════════════════════════════ */}
        {tab === 'orientation' && (
          <>
            {/* ── PHASE 2 : CHARGEMENT ── */}
            {orientPhase === 'loading' && (
              <div style={{ textAlign:'center', padding:'80px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:20 }}>
                <div style={{ fontSize:48, marginBottom:24 }}>✨</div>
                <p style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:12 }}>
                  {lang === 'fr' ? 'Analyse de ton profil en cours...' : 'Analyzing your profile...'}
                </p>
                <p style={{ fontSize:14, color:C.accent2, marginBottom:32, minHeight:24, transition:'all 0.3s' }}>
                  {lang === 'fr' ? LOAD_MSGS_FR[loadMsgIdx] : LOAD_MSGS_EN[loadMsgIdx]}
                </p>
                <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:C.accent2,
                      animation:`novaDot 1.4s infinite ${i*0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── PHASE 1 : QUESTIONS ── */}
            {orientPhase === 'questions' && (
              <div>
                {/* Barre de progression */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:C.muted }}>
                      {lang === 'fr' ? `Question ${orientStep + 1} sur 6` : `Question ${orientStep + 1} of 6`}
                    </p>
                    <p style={{ fontSize:12, color:C.muted }}>{Math.round((orientStep / 6) * 100)}%</p>
                  </div>
                  <div style={{ height:5, background:C.border, borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${(orientStep / 6) * 100}%`, height:'100%', background:C.accent2, borderRadius:3, transition:'width 0.4s ease' }} />
                  </div>
                </div>

                {orientErr && (
                  <div style={{ padding:'12px 16px', background:`${C.error}15`, border:`1px solid ${C.error}40`, borderRadius:10, color:C.error, fontSize:13, marginBottom:16 }}>
                    ⚠️ {orientErr}
                  </div>
                )}

                {/* ── Q0 : Matières fortes ── */}
                {orientStep === 0 && (
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'28px 24px' }}>
                    <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>
                      {lang === 'fr' ? '📚 Tes matières fortes' : '📚 Your strong subjects'}
                    </p>
                    <p style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
                      {lang === 'fr' ? 'Choisis jusqu\'à 3 matières' : 'Select up to 3 subjects'}
                    </p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:22 }}>
                      {MATIERES_CHIPS.map(m => {
                        const sel = orientData.matieres.includes(m.id)
                        const maxed = orientData.matieres.length >= 3 && !sel
                        return (
                          <button key={m.id} onClick={() => !maxed && toggleChip('matieres', m.id, 3)}
                            style={{ ...chip(sel), padding:'9px 18px', opacity: maxed ? 0.4 : 1, cursor: maxed ? 'not-allowed' : 'pointer' }}>
                            {lang === 'fr' ? m.fr : m.en}
                          </button>
                        )
                      })}
                    </div>
                    <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                      {lang === 'fr' ? 'Tu peux aussi décrire ce que tu aimes en tes propres mots :' : 'You can also describe what you enjoy in your own words:'}
                    </p>
                    <textarea
                      value={orientData.matieresTexte}
                      onChange={e => setOD('matieresTexte', e.target.value)}
                      placeholder={lang === 'fr' ? "Ex: J'adore comprendre comment les systèmes fonctionnent, résoudre des énigmes..." : 'Ex: I love understanding how systems work, solving puzzles...'}
                      rows={3}
                      style={{ width:'100%', padding:'12px', background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'system-ui,sans-serif' }}
                    />
                  </div>
                )}

                {/* ── Q1 : Ce que tu aimes faire ── */}
                {orientStep === 1 && (
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'28px 24px' }}>
                    <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>
                      {lang === 'fr' ? '⚡ Ce que tu aimes vraiment faire' : '⚡ What you truly love doing'}
                    </p>
                    <p style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
                      {lang === 'fr' ? 'Choix unique' : 'Single choice'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
                      {ACTIVITE_OPTIONS.map(a => (
                        <button key={a.id} onClick={() => setOD('activite', a.id)}
                          style={{ padding:'13px 18px', borderRadius:11, border:`1px solid ${orientData.activite === a.id ? C.accent+'55' : C.border}`, background: orientData.activite === a.id ? `${C.accent}15` : 'transparent', color: orientData.activite === a.id ? C.accent2 : C.text, fontSize:14, fontWeight: orientData.activite === a.id ? 600 : 400, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                          {lang === 'fr' ? a.fr : a.en}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                      {lang === 'fr' ? 'Décris une activité où tu perds la notion du temps :' : 'Describe an activity where you lose track of time:'}
                    </p>
                    <textarea
                      value={orientData.activiteTexte}
                      onChange={e => setOD('activiteTexte', e.target.value)}
                      placeholder={lang === 'fr' ? "Ex: Quand je code, quand j'aide quelqu'un à résoudre un problème..." : 'Ex: When I code, when I help someone solve a problem...'}
                      rows={3}
                      style={{ width:'100%', padding:'12px', background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'system-ui,sans-serif' }}
                    />
                  </div>
                )}

                {/* ── Q2 : Rapport au risque ── */}
                {orientStep === 2 && (
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'28px 24px' }}>
                    <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>
                      {lang === 'fr' ? '🎯 Ton rapport au risque' : '🎯 Your relationship with risk'}
                    </p>
                    <p style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
                      {lang === 'fr' ? 'Choix unique' : 'Single choice'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: orientData.risque === 'autre' ? 16 : 0 }}>
                      {RISQUE_OPTIONS.map(r => (
                        <button key={r.id} onClick={() => setOD('risque', r.id)}
                          style={{ padding:'13px 18px', borderRadius:11, border:`1px solid ${orientData.risque === r.id ? C.accent+'55' : C.border}`, background: orientData.risque === r.id ? `${C.accent}15` : 'transparent', color: orientData.risque === r.id ? C.accent2 : C.text, fontSize:14, fontWeight: orientData.risque === r.id ? 600 : 400, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                          {lang === 'fr' ? r.fr : r.en}
                        </button>
                      ))}
                    </div>
                    {orientData.risque === 'autre' && (
                      <textarea
                        value={orientData.risqueTexte}
                        onChange={e => setOD('risqueTexte', e.target.value)}
                        placeholder={lang === 'fr' ? 'Décris ton rapport au risque...' : 'Describe your relationship with risk...'}
                        rows={3}
                        style={{ width:'100%', padding:'12px', background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'system-ui,sans-serif' }}
                      />
                    )}
                  </div>
                )}

                {/* ── Q3 : Horizon ── */}
                {orientStep === 3 && (
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'28px 24px' }}>
                    <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>
                      {lang === 'fr' ? '🌍 Ton horizon après les études' : '🌍 Your horizon after graduation'}
                    </p>
                    <p style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
                      {lang === 'fr' ? 'Choix unique' : 'Single choice'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: orientData.horizon === 'autre' ? 16 : 0 }}>
                      {HORIZON_OPTIONS.map(h => (
                        <button key={h.id} onClick={() => setOD('horizon', h.id)}
                          style={{ padding:'13px 18px', borderRadius:11, border:`1px solid ${orientData.horizon === h.id ? C.accent+'55' : C.border}`, background: orientData.horizon === h.id ? `${C.accent}15` : 'transparent', color: orientData.horizon === h.id ? C.accent2 : C.text, fontSize:14, fontWeight: orientData.horizon === h.id ? 600 : 400, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                          {lang === 'fr' ? h.fr : h.en}
                        </button>
                      ))}
                    </div>
                    {orientData.horizon === 'autre' && (
                      <textarea
                        value={orientData.horizonTexte}
                        onChange={e => setOD('horizonTexte', e.target.value)}
                        placeholder={lang === 'fr' ? 'Ex: Je veux créer une entreprise entre le Canada et mon pays...' : 'Ex: I want to build a company bridging Canada and my home country...'}
                        rows={3}
                        style={{ width:'100%', padding:'12px', background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'system-ui,sans-serif' }}
                      />
                    )}
                  </div>
                )}

                {/* ── Q4 : Pays d'origine ── */}
                {orientStep === 4 && (
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'28px 24px' }}>
                    <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>
                      {lang === 'fr' ? '🌏 Ton pays d\'origine' : '🌏 Your country of origin'}
                    </p>
                    <p style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
                      {lang === 'fr' ? 'Sélectionne dans la liste' : 'Select from the list'}
                    </p>
                    <select
                      value={orientData.pays}
                      onChange={e => { setOD('pays', e.target.value); if (e.target.value !== 'Autre') setOD('paysAutre2', '') }}
                      style={{ width:'100%', maxWidth:380, padding:'12px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, color: orientData.pays ? C.text : C.muted, fontSize:14, outline:'none', colorScheme:'dark' }}
                    >
                      <option value="">{lang === 'fr' ? '-- Sélectionne ton pays --' : '-- Select your country --'}</option>
                      {Object.entries(PAYS_PAR_REGION).map(([region, pays]) => (
                        <optgroup key={region} label={region}>
                          {pays.map(p => <option key={p} value={p}>{p}</option>)}
                        </optgroup>
                      ))}
                      <option value="Autre">🌐 {lang === 'fr' ? 'Mon pays n\'est pas dans la liste' : 'My country is not listed'}</option>
                    </select>
                    {orientData.pays === 'Autre' && (
                      <input type="text"
                        placeholder={lang === 'fr' ? 'Écris ton pays ici...' : 'Write your country here...'}
                        value={orientData.paysAutre2}
                        onChange={e => setOD('paysAutre2', e.target.value)}
                        style={{ marginTop:10, width:'100%', maxWidth:380, padding:'10px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, outline:'none', boxSizing:'border-box' }}
                      />
                    )}
                  </div>
                )}

                {/* ── Q5 : Budget ── */}
                {orientStep === 5 && (
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'28px 24px' }}>
                    <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>
                      {lang === 'fr' ? '💰 Ton budget annuel estimé' : '💰 Your estimated annual budget'}
                    </p>
                    <p style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
                      {lang === 'fr' ? 'Études + vie courante (CAD)' : 'Studies + living expenses (CAD)'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {BUDGET_OPTIONS.map(b => (
                        <button key={b.id} onClick={() => setOD('budget', b.id)}
                          style={{ padding:'13px 18px', borderRadius:11, border:`1px solid ${orientData.budget === b.id ? C.accent+'55' : C.border}`, background: orientData.budget === b.id ? `${C.accent}15` : 'transparent', color: orientData.budget === b.id ? C.accent2 : C.text, fontSize:14, fontWeight: orientData.budget === b.id ? 600 : 400, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                          {lang === 'fr' ? b.fr : b.en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display:'flex', justifyContent:'space-between', gap:10, marginTop:20 }}>
                  <button onClick={() => setOrientStep(s => Math.max(0, s - 1))} disabled={orientStep === 0}
                    style={{ padding:'11px 22px', borderRadius:10, border:`1px solid ${C.border}`, background:'transparent', color: orientStep === 0 ? C.border : C.muted, fontSize:14, cursor: orientStep === 0 ? 'not-allowed' : 'pointer' }}>
                    ← {lang === 'fr' ? 'Retour' : 'Back'}
                  </button>

                  {orientStep < 5 ? (
                    <button onClick={() => setOrientStep(s => s + 1)} disabled={!stepOk}
                      style={{ padding:'11px 28px', borderRadius:10, border:'none', background: stepOk ? C.accent : C.border, color:'#fff', fontSize:14, fontWeight:600, cursor: stepOk ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
                      {lang === 'fr' ? 'Suivant →' : 'Next →'}
                    </button>
                  ) : (
                    <button onClick={analyserProfil} disabled={!stepOk}
                      style={{ padding:'11px 28px', borderRadius:10, border:'none', background: stepOk ? C.accent2 : C.border, color:'#fff', fontSize:14, fontWeight:700, cursor: stepOk ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
                      ✨ {lang === 'fr' ? 'Analyser mon profil →' : 'Analyze my profile →'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── PHASE 3 : RÉSULTATS ENRICHIS ── */}
            {orientPhase === 'results' && orientAnalyse && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

                {/* Header résultats */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <p style={{ fontSize:16, fontWeight:700, color:C.text }}>
                    🎯 {lang === 'fr' ? 'Ton analyse personnalisée' : 'Your personalized analysis'}
                  </p>
                  <button onClick={refaireOrientation}
                    style={{ padding:'7px 16px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:12, cursor:'pointer' }}>
                    ↺ {lang === 'fr' ? 'Refaire l\'analyse' : 'Redo analysis'}
                  </button>
                </div>

                {/* SECTION A — Ce qu'on a compris */}
                <div className="fade-up" style={{ background:'linear-gradient(135deg, #1B3A2D 0%, #1F4332 100%)', border:`1px solid ${C.accent}40`, borderRadius:16, padding:'24px' }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.accent2, marginBottom:16 }}>
                    ✨ {lang === 'fr' ? 'Ce qu\'on a compris de toi' : 'What we understood about you'}
                  </p>

                  {/* Message personnalisé */}
                  {orientAnalyse.message_personnalise && (
                    <p style={{ fontSize:14, color:'#D1FAE5', lineHeight:1.8, fontStyle:'italic', marginBottom:20 }}>
                      "{orientAnalyse.message_personnalise}"
                    </p>
                  )}

                  {/* Traits + Valeurs */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {orientAnalyse.traits_dominants?.length > 0 && (
                      <div>
                        <p style={{ fontSize:11, fontWeight:700, color:C.accent2, textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>
                          {lang === 'fr' ? 'Traits dominants' : 'Dominant traits'}
                        </p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          {orientAnalyse.traits_dominants.map((t,i) => (
                            <span key={i} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:`${C.accent}30`, color:C.accent2, border:`1px solid ${C.accent}40` }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {orientAnalyse.valeurs_profondes?.length > 0 && (
                      <div>
                        <p style={{ fontSize:11, fontWeight:700, color:'#60A5FA', textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>
                          {lang === 'fr' ? 'Valeurs profondes' : 'Core values'}
                        </p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          {orientAnalyse.valeurs_profondes.map((v,i) => (
                            <span key={i} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:'rgba(96,165,250,0.15)', color:'#60A5FA', border:'1px solid rgba(96,165,250,0.3)' }}>{v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {(orientAnalyse.type_environnement || orientAnalyse.style_travail) && (
                    <div style={{ marginTop:16, display:'flex', gap:16, flexWrap:'wrap' }}>
                      {orientAnalyse.type_environnement && (
                        <div style={{ flex:1, minWidth:140, padding:'10px 14px', background:'rgba(0,0,0,0.2)', borderRadius:10 }}>
                          <p style={{ fontSize:11, color:C.accent2, fontWeight:600, marginBottom:4 }}>🏢 {lang === 'fr' ? 'Environnement' : 'Environment'}</p>
                          <p style={{ fontSize:13, color:'#D1FAE5' }}>{orientAnalyse.type_environnement}</p>
                        </div>
                      )}
                      {orientAnalyse.style_travail && (
                        <div style={{ flex:1, minWidth:140, padding:'10px 14px', background:'rgba(0,0,0,0.2)', borderRadius:10 }}>
                          <p style={{ fontSize:11, color:C.accent2, fontWeight:600, marginBottom:4 }}>⚡ {lang === 'fr' ? 'Style de travail' : 'Work style'}</p>
                          <p style={{ fontSize:13, color:'#D1FAE5' }}>{orientAnalyse.style_travail}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SECTION B — 3 programmes recommandés */}
                {orientAnalyse.programmes_recommandes?.length > 0 && (
                  <div className="fade-up fade-up-1">
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>
                      📚 {lang === 'fr' ? 'Tes 3 programmes recommandés' : 'Your top 3 programs'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {orientAnalyse.programmes_recommandes.slice(0,3).map((rec, i) => {
                        const progData = PROGRAMMES.find(p => p.id === rec.id)
                        const barColors = [C.accent2, '#60A5FA', C.rose]
                        return (
                          <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                              <span style={{ fontSize:28 }}>{progData?.emoji || '📋'}</span>
                              <div style={{ flex:1 }}>
                                <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:2 }}>{progData ? progData.nom[lang] : rec.id}</p>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <div style={{ flex:1, height:6, background:C.border, borderRadius:3, overflow:'hidden' }}>
                                    <div style={{ width:`${rec.score || 80}%`, height:'100%', background:barColors[i], borderRadius:3, transition:'width 0.8s ease' }} />
                                  </div>
                                  <p style={{ fontSize:12, fontWeight:700, color:barColors[i], flexShrink:0 }}>{rec.score || 80}%</p>
                                </div>
                              </div>
                            </div>
                            {rec.raison && (
                              <div style={{ padding:'10px 14px', background:`${C.accent}08`, borderRadius:10, marginBottom:10 }}>
                                <p style={{ fontSize:13, color:C.text2, lineHeight:1.65 }}>💡 {rec.raison}</p>
                              </div>
                            )}
                            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                              {rec.avertissement && (
                                <p style={{ fontSize:12, color:C.warning, flex:1, minWidth:200 }}>⚠️ {rec.avertissement}</p>
                              )}
                              {rec.alternative && (
                                <p style={{ fontSize:12, color:C.muted, flex:1, minWidth:200 }}>↳ {rec.alternative}</p>
                              )}
                            </div>
                            <button onClick={() => { setSelectedProg(rec.id); setTab('secteur') }}
                              style={{ marginTop:12, padding:'8px 16px', background:`${C.accent}15`, border:`1px solid ${C.accent}35`, borderRadius:9, color:C.accent2, fontWeight:600, fontSize:12, cursor:'pointer' }}>
                              {lang === 'fr' ? 'Explorer ce programme →' : 'Explore this program →'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* SECTION C — Questions de réflexion */}
                {orientAnalyse.questions_reflexion?.length > 0 && (
                  <div className="fade-up fade-up-2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>
                      🤔 {lang === 'fr' ? 'Questions pour aller plus loin' : 'Questions to go further'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {orientAnalyse.questions_reflexion.map((q,i) => (
                        <div key={i} style={{ padding:'12px 16px', background:`${C.accent}08`, borderLeft:`3px solid ${C.accent}`, borderRadius:'0 10px 10px 0' }}>
                          <p style={{ fontSize:14, color:C.text2, lineHeight:1.65 }}>{q}</p>
                        </div>
                      ))}
                    </div>
                    <a href="/mentors" style={{ display:'inline-block', marginTop:14, padding:'9px 18px', background:`${C.accent}15`, border:`1px solid ${C.accent}35`, borderRadius:9, color:C.accent2, fontWeight:600, fontSize:13, textDecoration:'none' }}>
                      🤝 {lang === 'fr' ? 'Parler à un mentor →' : 'Talk to a mentor →'}
                    </a>
                  </div>
                )}

                {/* SECTION D — Cheminement suggéré */}
                {orientAnalyse.plan_suggere && (
                  <div className="fade-up fade-up-3" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>
                      🛤️ {lang === 'fr' ? 'Ton cheminement suggéré' : 'Your suggested path'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {orientAnalyse.plan_suggere.annee_1_2 && (
                        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                          <span style={{ width:28, height:28, borderRadius:'50%', background:C.accent, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>1-2</span>
                          <div><p style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:3 }}>{lang === 'fr' ? 'Années 1-2 — Focus' : 'Years 1-2 — Focus'}</p><p style={{ fontSize:14, color:C.text2, lineHeight:1.6 }}>{orientAnalyse.plan_suggere.annee_1_2}</p></div>
                        </div>
                      )}
                      {orientAnalyse.plan_suggere.competences_cles?.length > 0 && (
                        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                          <span style={{ width:28, height:28, borderRadius:'50%', background:'#1565C0', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>⚡</span>
                          <div>
                            <p style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:6 }}>{lang === 'fr' ? 'Compétences clés à développer' : 'Key skills to develop'}</p>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                              {orientAnalyse.plan_suggere.competences_cles.map((c,i) => (
                                <span key={i} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:'rgba(21,101,192,0.12)', color:'#60A5FA', border:'1px solid rgba(96,165,250,0.2)' }}>{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {orientAnalyse.plan_suggere.premier_emploi && (
                        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                          <span style={{ width:28, height:28, borderRadius:'50%', background:'#E65100', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>💼</span>
                          <div><p style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:3 }}>{lang === 'fr' ? 'Premier emploi réaliste' : 'Realistic first job'}</p><p style={{ fontSize:14, color:C.text2, lineHeight:1.6 }}>{orientAnalyse.plan_suggere.premier_emploi}</p></div>
                        </div>
                      )}
                      {orientAnalyse.plan_suggere.vision_5_ans && (
                        <div style={{ padding:'14px 16px', background:'linear-gradient(135deg, #1B3A2D 0%, #1F4332 100%)', borderRadius:12, marginTop:4 }}>
                          <p style={{ fontSize:12, fontWeight:700, color:C.accent2, marginBottom:4 }}>🌟 {lang === 'fr' ? 'Vision 5 ans' : '5-year vision'}</p>
                          <p style={{ fontSize:14, color:'#D1FAE5', lineHeight:1.7, fontStyle:'italic' }}>{orientAnalyse.plan_suggere.vision_5_ans}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* TAB 2 — MON SECTEUR                                     */}
        {/* ════════════════════════════════════════════════════════ */}
        {tab === 'secteur' && (
          <>
            {/* Sélecteur programme groupé */}
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:14 }}>
                {lang === 'fr' ? 'Choisis un programme' : 'Select a program'}
              </p>
              {Object.entries(DOMAINES_LABELS).map(([domaine, label]) => {
                const progs = PROGRAMMES.filter(p => p.domaine === domaine)
                if (!progs.length) return null
                return (
                  <div key={domaine} style={{ marginBottom:16 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:8 }}>{lang === 'fr' ? label.fr : label.en}</p>
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                      {progs.map(p => (
                        <button key={p.id} onClick={() => selectProg(p.id)} style={{ ...chip(selectedProg === p.id), padding:'6px 13px', fontSize:12 }}>
                          {p.emoji} {p.nom[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
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
                      {info.metiers_now.map(m => <span key={m} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:'rgba(59,130,246,0.12)', color:C.accent2, border:`1px solid ${C.accent}25` }}>{m}</span>)}
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

                {/* Barre info programme/pays + PDF si résultats */}
                <div className="no-print" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:24, padding:'14px 18px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:12 }}>
                  {(() => { const prog = PROGRAMMES.find(p => p.id === visionProg); return prog ? <><span style={{ fontSize:22 }}>{prog.emoji}</span><span style={{ fontSize:14, fontWeight:600, color:C.text }}>{prog.nom[lang]}</span></> : null })()}
                  <span style={{ color:C.border }}>·</span>
                  <span style={{ fontSize:14, color:C.muted }}>🌍 {visionPays}</span>
                  {vision && !visLoading && (
                    <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                      <button onClick={telechargerVisionPDF} style={{ padding:'8px 16px', background:`${C.accent}15`, border:`1px solid ${C.accent}35`, borderRadius:8, color:C.accent2, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                        📄 {lang === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
                      </button>
                      {isIOS && (
                        <p style={{ fontSize:11, color:C.muted, lineHeight:1.5, maxWidth:260, textAlign:'right' }}>
                          💡 {lang === 'fr'
                            ? 'Sur iPhone : autorise les popups si demandé (Réglages → Safari → Bloquer les fenêtres publicitaires → Désactiver pour ce site)'
                            : 'On iPhone: allow popups if prompted (Settings → Safari → Block Pop-ups → Disable for this site)'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Cache recovery banner */}
                {visionCache && !vision && !visLoading && (
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', padding:'14px 18px', background:`${C.accent}10`, border:`1px solid ${C.accent}30`, borderRadius:12, marginBottom:16 }}>
                    <div style={{ flex:1, minWidth:180 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:C.accent2, marginBottom:2 }}>
                        💾 {lang === 'fr' ? 'Vision précédente disponible' : 'Previous vision available'}
                      </p>
                      <p style={{ fontSize:12, color:C.muted }}>
                        {lang === 'fr' ? `Générée le ${new Date(visionCache.date).toLocaleDateString('fr-CA')}` : `Generated on ${new Date(visionCache.date).toLocaleDateString('en-CA')}`}
                      </p>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => { setVision(visionCache.vision); setVisionCache(null) }}
                        style={{ padding:'8px 16px', background:C.accent, border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                        {lang === 'fr' ? '↺ Reprendre' : '↺ Restore'}
                      </button>
                      <button onClick={() => { setVisionCache(null); try { localStorage.removeItem('novae_vision_complete') } catch {} }}
                        style={{ padding:'7px 11px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:12, cursor:'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* ── FORMULAIRE (si pas de vision et pas en chargement) ── */}
                {!vision && !visLoading && (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {/* Intro */}
                    <div style={{ padding:'16px 20px', background:`${C.accent}08`, border:`1px solid ${C.accent}20`, borderRadius:12 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.accent2, marginBottom:4 }}>✨ {lang === 'fr' ? 'Dis-moi qui tu es vraiment' : 'Tell me who you really are'}</p>
                      <p style={{ fontSize:13, color:C.muted, lineHeight:1.7, margin:0 }}>
                        {lang === 'fr'
                          ? 'Plus tu partages, plus ta vision sera personnalisée. L\'IA citera tes propres mots dans ses recommandations.'
                          : 'The more you share, the more personalized your vision will be. The AI will quote your own words in its recommendations.'}
                      </p>
                    </div>

                    {/* Q1 — Passion */}
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.accent2, textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }}>
                        {lang === 'fr' ? '❤️ Ta passion profonde' : '❤️ Your deep passion'}
                      </label>
                      <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                        {lang === 'fr' ? 'Qu\'est-ce qui te passionne vraiment ?' : 'What truly drives and excites you?'}
                      </p>
                      <textarea
                        value={visionForm.passion}
                        onChange={e => setVisionForm(f => ({ ...f, passion: e.target.value }))}
                        rows={4}
                        placeholder={lang === 'fr'
                          ? 'Ex : J\'adore comprendre comment les données peuvent prédire des comportements. Je passe des heures à analyser des tendances...'
                          : 'Ex: I love understanding how data can predict human behavior. I spend hours analyzing trends...'}
                        style={{ width:'100%', padding:'12px 14px', background:C.surface2, border:`1.5px solid ${visionForm.passion.length >= 20 ? C.accent+'60' : C.border}`, borderRadius:10, color:C.text, fontSize:13, lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
                      />
                      <p style={{ fontSize:11, color: visionForm.passion.length >= 20 ? C.success : C.muted, textAlign:'right', marginTop:4 }}>
                        {visionForm.passion.length}/20 {lang === 'fr' ? 'caractères min.' : 'chars min.'}
                      </p>
                    </div>

                    {/* Q2 — Défi */}
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#60A5FA', textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }}>
                        {lang === 'fr' ? '🌍 Ton plus grand défi' : '🌍 Your biggest challenge'}
                      </label>
                      <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                        {lang === 'fr' ? 'Quel problème dans ton pays ou dans le monde t\'empêche de dormir ?' : 'What problem in your country or the world keeps you up at night?'}
                      </p>
                      <textarea
                        value={visionForm.defi}
                        onChange={e => setVisionForm(f => ({ ...f, defi: e.target.value }))}
                        rows={4}
                        placeholder={lang === 'fr'
                          ? 'Ex : Dans mon pays, 60% des agriculteurs perdent leurs récoltes faute d\'information météo fiable. Je veux changer ça...'
                          : 'Ex: In my country, 60% of farmers lose their harvests due to unreliable weather information. I want to change that...'}
                        style={{ width:'100%', padding:'12px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box' }}
                      />
                    </div>

                    {/* Q3 — Impact */}
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#F59E0B', textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }}>
                        {lang === 'fr' ? '🌟 Ton impact rêvé' : '🌟 Your dream impact'}
                      </label>
                      <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                        {lang === 'fr' ? 'Dans 10 ans, quelle trace veux-tu avoir laissée ?' : 'In 10 years, what impact do you want to have made?'}
                      </p>
                      <textarea
                        value={visionForm.impact}
                        onChange={e => setVisionForm(f => ({ ...f, impact: e.target.value }))}
                        rows={4}
                        placeholder={lang === 'fr'
                          ? 'Ex : J\'aimerais avoir créé une technologie qui permet à 1 million de personnes d\'accéder à des soins de qualité...'
                          : "Ex: I'd like to have created a technology that gives 1 million people access to quality healthcare..."}
                        style={{ width:'100%', padding:'12px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box' }}
                      />
                    </div>

                    {/* Q4 — Contexte */}
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, marginBottom:6 }}>
                        {lang === 'fr' ? '🧭 Ton contexte personnel' : '🧭 Your personal context'}
                      </label>
                      <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                        {lang === 'fr' ? 'Parle-moi de ton parcours et de ce qui te rend unique' : 'Tell me about your journey and what makes you unique'}
                      </p>
                      <textarea
                        value={visionForm.contexte}
                        onChange={e => setVisionForm(f => ({ ...f, contexte: e.target.value }))}
                        rows={4}
                        placeholder={lang === 'fr'
                          ? 'Ex : J\'ai grandi dans une famille d\'agriculteurs au Sénégal. J\'ai fait mes études en France avant de venir au Canada. Je parle 3 langues...'
                          : 'Ex: I grew up in a farming family in Senegal. I studied in France before coming to Canada. I speak 3 languages...'}
                        style={{ width:'100%', padding:'12px 14px', background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box' }}
                      />
                    </div>

                    {visError && <p style={{ color:C.error, fontSize:13 }}>⚠️ {visError}</p>}

                    {/* Bouton générer */}
                    <button
                      onClick={genererVision}
                      disabled={visionForm.passion.length < 20 || visLoading}
                      style={{ width:'100%', padding:'15px', background: visionForm.passion.length >= 20 ? C.accent : C.border, border:'none', borderRadius:12, color: visionForm.passion.length >= 20 ? '#fff' : C.muted, fontWeight:700, fontSize:15, cursor: visionForm.passion.length >= 20 ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
                      {visLoading
                        ? (lang === 'fr' ? '⏳ Analyse en cours... (30-45 sec)' : '⏳ Analyzing... (30-45 sec)')
                        : (lang === 'fr' ? '✨ Générer ma vision personnalisée →' : '✨ Generate my personalized vision →')}
                    </button>
                  </div>
                )}

                {/* ── CHARGEMENT ── */}
                {visLoading && (
                  <div style={{ textAlign:'center', padding:'60px 24px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:16 }}>
                    <p style={{ fontSize:32, marginBottom:16 }}>✨</p>
                    <p style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>{lang === 'fr' ? 'Génération de ta vision...' : 'Generating your vision...'}</p>
                    <p style={{ fontSize:13, color:C.muted, marginBottom:28 }}>{lang === 'fr' ? 'L\'IA analyse ton profil en profondeur (30-45 sec)' : 'AI is deeply analyzing your profile (30-45 sec)'}</p>
                    <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:C.accent2, animation:`novaDot 1.4s infinite ${i*0.2}s` }} />)}
                    </div>
                  </div>
                )}

                {/* ── RÉSULTATS ENRICHIS 7 SECTIONS ── */}
                {vision && (
                  <div id="vision-print" style={{ display:'flex', flexDirection:'column', gap:20 }}>

                    {/* SECTION 0 — "Ce qu'on a compris de toi" */}
                    <div className="fade-up" style={{ padding:'22px 24px', background:'linear-gradient(135deg, #1E3A5F 0%, #25487A 100%)', borderRadius:16 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
                        💎 {lang === 'fr' ? 'Ce qu\'on a compris de toi' : 'What we understood about you'}
                      </p>
                      {vision.profil_resume && (
                        <p style={{ color:'rgba(255,255,255,0.9)', fontSize:14, lineHeight:1.8, fontStyle:'italic', marginBottom: vision.insight_unique ? 16 : 0 }}>{vision.profil_resume}</p>
                      )}
                      {vision.insight_unique && (
                        <div style={{ padding:'12px 16px', background:'rgba(96,165,250,0.2)', border:'1px solid rgba(96,165,250,0.35)', borderRadius:10 }}>
                          <p style={{ fontSize:11, fontWeight:700, color:'#93C5FD', marginBottom:6 }}>💡 {lang === 'fr' ? 'Ce que tu n\'as peut-être pas réalisé :' : 'What you may not have realized:'}</p>
                          <p style={{ fontSize:13, color:'rgba(255,255,255,0.9)', lineHeight:1.7, margin:0 }}>{vision.insight_unique}</p>
                        </div>
                      )}
                    </div>

                    {/* SECTION 1 — Métiers aujourd'hui */}
                    {(vision.metiers_actuels || []).length > 0 && (
                      <div className="fade-up fade-up-1" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>💼 {lang === 'fr' ? 'Tes métiers aujourd\'hui' : 'Your careers today'}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                          {vision.metiers_actuels.map((m, i) => (
                            <div key={i} style={{ padding:'14px 16px', background:C.surface2, borderRadius:10, borderLeft:`3px solid ${C.accent}` }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap', marginBottom:8 }}>
                                <p style={{ fontWeight:700, fontSize:14, color:C.text, margin:0 }}>{m.titre}</p>
                                {m.salaire_canada && <span style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:`${C.success}12`, color:C.success, border:`1px solid ${C.success}25`, whiteSpace:'nowrap', fontWeight:600, flexShrink:0 }}>{m.salaire_canada}</span>}
                              </div>
                              {(m.lien_avec_passion) && (
                                <p style={{ fontSize:12, color:C.accent2, fontStyle:'italic', marginBottom:8 }}>
                                  🔗 {lang === 'fr' ? 'Lien avec ta passion :' : 'Link to your passion:'} {m.lien_avec_passion}
                                </p>
                              )}
                              <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom: (m.entreprises_types||[]).length > 0 ? 8 : 0 }}>{m.description}</p>
                              {(m.entreprises_types||[]).length > 0 && (
                                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                                  {m.entreprises_types.map((e, j) => (
                                    <span key={j} style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:`${C.accent}12`, color:C.accent2, border:`1px solid ${C.accent}25` }}>{e}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2 — Métiers dans 10 ans */}
                    {(vision.metiers_futur || []).length > 0 && (
                      <div className="fade-up fade-up-2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>🚀 {lang === 'fr' ? 'Tes métiers dans 10 ans' : 'Your careers in 10 years'}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom: vision.impact_ia ? 16 : 0 }}>
                          {vision.metiers_futur.map((m, i) => (
                            <div key={i} style={{ padding:'14px 16px', background:'rgba(96,165,250,0.06)', borderRadius:10, border:'1px solid rgba(96,165,250,0.15)' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                                <p style={{ fontWeight:700, fontSize:14, color:'#60A5FA', margin:0 }}>{m.titre}</p>
                                {m.horizon && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'rgba(96,165,250,0.15)', color:'#60A5FA' }}>{m.horizon}</span>}
                              </div>
                              {(m.pourquoi_pour_lui || m.pourquoi_emerge) && (
                                <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:8 }}>
                                  <strong style={{ color:C.text }}>{lang === 'fr' ? 'Pourquoi ce métier pour TOI :' : 'Why this career for YOU:'}</strong> {m.pourquoi_pour_lui || m.pourquoi_emerge}
                                </p>
                              )}
                              {m.comment_y_arriver && (
                                <p style={{ fontSize:12, color:C.accent2, borderTop:`1px solid ${C.border}`, paddingTop:8, marginBottom:0 }}>
                                  ✅ {m.comment_y_arriver}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        {vision.impact_ia && (
                          <div style={{ padding:'14px 16px', background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:10 }}>
                            <p style={{ fontSize:12, fontWeight:700, color:'#F59E0B', marginBottom:6 }}>🤖 {lang === 'fr' ? 'Impact de l\'IA sur ce secteur' : 'AI impact on this sector'}</p>
                            <p style={{ fontSize:13, color:C.muted, lineHeight:1.7, margin:0 }}>{vision.impact_ia}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 3 — Idées startup */}
                    {(vision.startups || []).length > 0 && (
                      <div className="fade-up fade-up-3" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>💡 {lang === 'fr' ? 'Tes idées de startup' : 'Your startup ideas'}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                          {vision.startups.map((s, i) => (
                            <div key={i} style={{ padding:'16px 18px', background:C.surface2, borderRadius:12, borderLeft:`3px solid ${i === 0 ? C.accent2 : i === 1 ? '#60A5FA' : '#F59E0B'}` }}>
                              <p style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:10 }}>🏢 {s.nom}</p>
                              <p style={{ fontSize:13, color:C.muted, marginBottom:6 }}>
                                <strong style={{ color:C.text }}>{lang === 'fr' ? 'Problème résolu :' : 'Problem solved:'}</strong> {s.probleme_resolu || s.probleme}
                              </p>
                              <p style={{ fontSize:13, color:C.muted, marginBottom:6 }}>
                                <strong style={{ color:C.text }}>{lang === 'fr' ? 'Solution :' : 'Solution:'}</strong> {s.solution}
                              </p>
                              {(s.marche_cible || s.marche) && (
                                <p style={{ fontSize:13, color:C.muted, marginBottom:8 }}>
                                  <strong style={{ color:C.text }}>{lang === 'fr' ? 'Marché cible :' : 'Target market:'}</strong> {s.marche_cible || s.marche}
                                </p>
                              )}
                              {(s.pourquoi_lui || s.pourquoi_toi) && (
                                <p style={{ fontSize:13, color:C.accent2, marginBottom:10 }}>💡 {s.pourquoi_lui || s.pourquoi_toi}</p>
                              )}
                              {s.premier_pas && (
                                <div style={{ padding:'10px 14px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:8, marginBottom:8 }}>
                                  <p style={{ fontSize:12, fontWeight:700, color:'#F59E0B', marginBottom:4 }}>🎯 {lang === 'fr' ? 'Premier pas cette semaine :' : 'First step this week:'}</p>
                                  <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.6 }}>{s.premier_pas}</p>
                                </div>
                              )}
                              <p style={{ fontSize:12, color:C.muted, fontStyle:'italic', margin:0 }}>
                                {lang === 'fr' ? 'Modèle mondial :' : 'Global model:'} {s.exemple_mondial}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4 — Plan 5 ans */}
                    {(vision.plan_5_ans || vision.plan_5ans) && (
                      <div className="fade-up" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>📅 {lang === 'fr' ? 'Ton plan en 5 ans' : 'Your 5-year plan'}</p>
                        {(() => {
                          const plan = vision.plan_5_ans || vision.plan_5ans
                          return [
                            { label: lang === 'fr' ? 'Années 1-2' : 'Years 1-2', text: plan.annee_1_2, color: C.accent2, bg: `${C.accent}10` },
                            { label: lang === 'fr' ? 'Années 3-4' : 'Years 3-4', text: plan.annee_3_4, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
                            { label: lang === 'fr' ? 'Année 5' : 'Year 5', text: plan.annee_5, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                          ].map((row, i) => (
                            <div key={i} style={{ display:'flex', gap:14, marginBottom: i < 2 ? 14 : 0, paddingBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                              <div style={{ width:84, flexShrink:0, paddingTop:2 }}>
                                <span style={{ display:'inline-block', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:row.bg, color:row.color }}>{row.label}</span>
                              </div>
                              <p style={{ fontSize:13, color:C.muted, lineHeight:1.7, margin:0 }}>{row.text}</p>
                            </div>
                          ))
                        })()}
                      </div>
                    )}

                    {/* SECTION 5 — Ressources clés */}
                    {(vision.ressources_cles || []).length > 0 && (
                      <div className="fade-up" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>📚 {lang === 'fr' ? 'Ressources clés pour toi' : 'Key resources for you'}</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                          {vision.ressources_cles.map((r, i) => (
                            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 14px', background:C.surface2, borderRadius:10 }}>
                              <span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, background:`${C.accent}12`, color:C.accent2, border:`1px solid ${C.accent}25`, whiteSpace:'nowrap', flexShrink:0, marginTop:2 }}>{r.type}</span>
                              <div>
                                <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:'0 0 3px' }}>{r.nom}</p>
                                <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.6 }}>{r.pourquoi_lui || r.pourquoi}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 6 — Message final */}
                    {(vision.message_final || vision.message_motivation) && (
                      <div className="fade-up" style={{ padding:'24px 26px', background:'linear-gradient(135deg, #1E3A5F 0%, #25487A 100%)', borderRadius:16, textAlign:'center' }}>
                        <p style={{ fontSize:22, marginBottom:12 }}>💬</p>
                        <p style={{ color:'#fff', fontSize:15, lineHeight:1.9, fontStyle:'italic', margin:0 }}>
                          {vision.message_final || vision.message_motivation}
                        </p>
                      </div>
                    )}

                    {/* Bouton modifier & régénérer */}
                    <div className="no-print" style={{ textAlign:'center', paddingTop:8 }}>
                      <button
                        onClick={() => { setVision(null); setVisError('') }}
                        style={{ padding:'10px 24px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:10, color:C.muted, fontSize:13, cursor:'pointer' }}>
                        🔄 {lang === 'fr' ? 'Modifier mes réponses & régénérer' : 'Edit my answers & regenerate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}


        <FeedbackSection page="mon-avenir" />
      </main>
    </div>
  )
}
