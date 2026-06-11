// lib/safeLinks.js — Source unique de vérité pour tous les liens externes Novae
// RÈGLE : Toujours utiliser le domaine racine. Les sous-pages changent, les domaines restent.

const SAFE_LINKS = {
  // ── GOUVERNEMENT CANADA ──
  canada: {
    name: 'Gouvernement du Canada',
    url: 'https://www.canada.ca',
    description: {
      fr: 'Site officiel du gouvernement canadien',
      en: 'Official Canadian government website'
    }
  },
  serviceCanada: {
    name: 'Service Canada',
    url: 'https://www.canada.ca',
    description: {
      fr: 'Recherche "NAS" ou "Numéro d\'Assurance Sociale"',
      en: 'Search "SIN" or "Social Insurance Number"'
    }
  },
  ircc: {
    name: 'Immigration Canada (IRCC)',
    url: 'https://www.canada.ca',
    description: {
      fr: 'Recherche "permis d\'études" ou "immigration"',
      en: 'Search "study permit" or "immigration"'
    }
  },
  arc: {
    name: 'Agence du revenu du Canada',
    url: 'https://www.canada.ca',
    description: {
      fr: 'Recherche "déclaration de revenus"',
      en: 'Search "tax return"'
    }
  },

  // ── SANTÉ PROVINCIALE ──
  ramq: {
    name: 'RAMQ — Assurance maladie Québec',
    url: 'https://www.ramq.gouv.qc.ca',
    description: {
      fr: 'Recherche "inscription" ou "carte d\'assurance maladie"',
      en: 'Search "registration" or "health insurance card"'
    }
  },
  ohip: {
    name: 'OHIP — Assurance santé Ontario',
    url: 'https://www.ontario.ca',
    description: {
      fr: 'Recherche "OHIP" ou "carte santé"',
      en: 'Search "OHIP" or "health card"'
    }
  },
  msp: {
    name: 'MSP — Santé Colombie-Britannique',
    url: 'https://www2.gov.bc.ca',
    description: {
      fr: 'Recherche "MSP" ou "health insurance"',
      en: 'Search "MSP" or "health insurance"'
    }
  },
  albertaHealth: {
    name: 'Alberta Health Care',
    url: 'https://www.alberta.ca',
    description: {
      fr: 'Recherche "health care insurance"',
      en: 'Search "health care insurance"'
    }
  },
  manitobaHealth: {
    name: 'Manitoba Health',
    url: 'https://www.gov.mb.ca',
    description: {
      fr: 'Recherche "health insurance"',
      en: 'Search "health insurance"'
    }
  },
  saskatchewanHealth: {
    name: 'Saskatchewan Health',
    url: 'https://www.saskatchewan.ca',
    description: {
      fr: 'Recherche "health coverage"',
      en: 'Search "health coverage"'
    }
  },
  novaScotiaHealth: {
    name: 'Nova Scotia Health (MSI)',
    url: 'https://novascotia.ca',
    description: {
      fr: 'Recherche "MSI" ou "medical services insurance"',
      en: 'Search "MSI" or "medical services insurance"'
    }
  },
  newBrunswickHealth: {
    name: 'New Brunswick Health',
    url: 'https://www2.gnb.ca',
    description: {
      fr: 'Recherche "assurance maladie"',
      en: 'Search "health insurance"'
    }
  },
  revenuQuebec: {
    name: 'Revenu Québec',
    url: 'https://www.revenuquebec.ca',
    description: {
      fr: 'Recherche "déclaration de revenus"',
      en: 'Search "tax return"'
    }
  },

  // ── BANQUES ──
  td: {
    name: 'TD Banque',
    url: 'https://www.td.com',
    description: {
      fr: 'Recherche "compte étudiant"',
      en: 'Search "student account"'
    }
  },
  rbc: {
    name: 'RBC Banque Royale',
    url: 'https://www.rbc.com',
    description: {
      fr: 'Recherche "nouveaux arrivants" ou "compte étudiant"',
      en: 'Search "newcomers" or "student account"'
    }
  },
  bmo: {
    name: 'BMO Banque de Montréal',
    url: 'https://www.bmo.com',
    description: {
      fr: 'Recherche "compte étudiant"',
      en: 'Search "student account"'
    }
  },
  scotia: {
    name: 'Banque Scotia',
    url: 'https://www.scotiabank.com',
    description: {
      fr: 'Recherche "StartRight" ou "nouveaux arrivants"',
      en: 'Search "StartRight" or "newcomers"'
    }
  },
  cibc: {
    name: 'CIBC',
    url: 'https://www.cibc.com',
    description: {
      fr: 'Recherche "nouveaux arrivants"',
      en: 'Search "newcomers"'
    }
  },
  desjardins: {
    name: 'Desjardins',
    url: 'https://www.desjardins.com',
    description: {
      fr: 'Recherche "compte étudiant"',
      en: 'Search "student account"'
    }
  },
  bnc: {
    name: 'Banque Nationale',
    url: 'https://www.bnc.ca',
    description: {
      fr: 'Recherche "compte étudiant"',
      en: 'Search "student account"'
    }
  },

  // ── CRÉDIT ──
  borrowell: {
    name: 'Borrowell',
    url: 'https://borrowell.com',
    description: {
      fr: 'Vérifie ta cote de crédit gratuitement',
      en: 'Check your credit score for free'
    }
  },
  creditKarma: {
    name: 'Credit Karma Canada',
    url: 'https://www.creditkarma.ca',
    description: {
      fr: 'Surveille ton crédit gratuitement',
      en: 'Monitor your credit for free'
    }
  },

  // ── IMPÔTS ──
  turboimpot: {
    name: 'TurboImpôt',
    url: 'https://turbotax.intuit.ca',
    description: {
      fr: 'Logiciel de déclaration gratuit pour étudiants',
      en: 'Free tax filing software for students'
    }
  },
  wealthsimpleTax: {
    name: 'Wealthsimple Tax',
    url: 'https://www.wealthsimple.com',
    description: {
      fr: 'Recherche "impôts" ou "déclaration"',
      en: 'Search "tax" or "tax filing"'
    }
  },

  // ── EMPLOI ──
  guichetEmplois: {
    name: 'Guichet Emplois Canada',
    url: 'https://www.guichetemplois.gc.ca',
    description: {
      fr: 'Offres d\'emploi partout au Canada',
      en: 'Job listings across Canada'
    }
  },
  indeed: {
    name: 'Indeed Canada',
    url: 'https://ca.indeed.com',
    description: {
      fr: 'Moteur de recherche d\'emploi',
      en: 'Job search engine'
    }
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com',
    description: {
      fr: 'Réseau professionnel',
      en: 'Professional network'
    }
  },

  // ── LOGEMENT ──
  kijiji: {
    name: 'Kijiji',
    url: 'https://www.kijiji.ca',
    description: {
      fr: 'Annonces de logement au Canada',
      en: 'Housing listings in Canada'
    }
  },
  rentals: {
    name: 'Rentals.ca',
    url: 'https://rentals.ca',
    description: {
      fr: 'Locations au Canada',
      en: 'Rentals in Canada'
    }
  },
  padmapper: {
    name: 'PadMapper',
    url: 'https://www.padmapper.com',
    description: {
      fr: 'Carte interactive des logements',
      en: 'Interactive housing map'
    }
  },

  // ── UNIVERSITÉS ──
  uottawa: {
    name: "Université d'Ottawa",
    url: 'https://www.uottawa.ca',
    description: {
      fr: 'Seule grande université bilingue au Canada',
      en: "Canada's only large bilingual university"
    }
  },
  mcgill: {
    name: 'Université McGill',
    url: 'https://www.mcgill.ca',
    description: {
      fr: 'Une des meilleures universités au Canada',
      en: "One of Canada's top universities"
    }
  },
  udem: {
    name: 'Université de Montréal',
    url: 'https://www.umontreal.ca',
    description: {
      fr: 'Grande université francophone',
      en: 'Large French-language university'
    }
  },
  uqam: {
    name: 'UQAM',
    url: 'https://www.uqam.ca',
    description: {
      fr: 'Université du Québec à Montréal',
      en: 'University of Quebec in Montreal'
    }
  },
  utoronto: {
    name: 'Université de Toronto',
    url: 'https://www.utoronto.ca',
    description: {
      fr: 'Top 3 des universités canadiennes',
      en: 'Top 3 Canadian university'
    }
  },
  ubc: {
    name: 'UBC — Université de la C.-B.',
    url: 'https://www.ubc.ca',
    description: {
      fr: 'Top université à Vancouver',
      en: 'Top university in Vancouver'
    }
  },
  concordia: {
    name: 'Université Concordia',
    url: 'https://www.concordia.ca',
    description: {
      fr: 'Université anglophone à Montréal',
      en: 'English-language university in Montreal'
    }
  },
  york: {
    name: 'Université York',
    url: 'https://www.yorku.ca',
    description: {
      fr: 'Grande université à Toronto',
      en: 'Large university in Toronto'
    }
  },
  laval: {
    name: 'Université Laval',
    url: 'https://www.ulaval.ca',
    description: {
      fr: 'Grande université à Québec',
      en: 'Large university in Quebec City'
    }
  },
  sherbrooke: {
    name: 'Université de Sherbrooke',
    url: 'https://www.usherbrooke.ca',
    description: {
      fr: 'Université au Québec',
      en: 'University in Quebec'
    }
  },
  carleton: {
    name: 'Université Carleton',
    url: 'https://carleton.ca',
    description: {
      fr: 'Université à Ottawa',
      en: 'University in Ottawa'
    }
  },
  waterloo: {
    name: 'Université de Waterloo',
    url: 'https://uwaterloo.ca',
    description: {
      fr: 'Top université en technologie',
      en: 'Top technology university'
    }
  },
  mcmaster: {
    name: 'Université McMaster',
    url: 'https://www.mcmaster.ca',
    description: {
      fr: 'Reconnue en santé et ingénierie',
      en: 'Renowned for health and engineering'
    }
  },
  queens: {
    name: "Université Queen's",
    url: 'https://www.queensu.ca',
    description: {
      fr: 'Université à Kingston, Ontario',
      en: 'University in Kingston, Ontario'
    }
  },
  dalhousie: {
    name: 'Université Dalhousie',
    url: 'https://www.dal.ca',
    description: {
      fr: 'Université à Halifax',
      en: 'University in Halifax'
    }
  },
  umanitoba: {
    name: 'Université du Manitoba',
    url: 'https://umanitoba.ca',
    description: {
      fr: 'Université à Winnipeg',
      en: 'University in Winnipeg'
    }
  },
  ucalgary: {
    name: 'Université de Calgary',
    url: 'https://www.ucalgary.ca',
    description: {
      fr: 'Université à Calgary',
      en: 'University in Calgary'
    }
  },
  ualberta: {
    name: "Université de l'Alberta",
    url: 'https://www.ualberta.ca',
    description: {
      fr: 'Université à Edmonton',
      en: 'University in Edmonton'
    }
  },
  sfu: {
    name: 'Université Simon Fraser',
    url: 'https://www.sfu.ca',
    description: {
      fr: 'Université à Burnaby, C.-B.',
      en: 'University in Burnaby, BC'
    }
  },

  // ── BOURSES ──
  vanier: {
    name: 'Bourse Vanier Canada',
    url: 'https://vanier.gc.ca',
    description: {
      fr: 'Recherche "Vanier" pour les conditions',
      en: 'Search "Vanier" for eligibility'
    }
  },
  crsh: {
    name: 'CRSH — Conseil de recherches',
    url: 'https://www.sshrc-crsh.gc.ca',
    description: {
      fr: 'Bourses de recherche en sciences humaines',
      en: 'Social sciences research grants'
    }
  },
  crsng: {
    name: 'CRSNG',
    url: 'https://www.nserc-crsng.gc.ca',
    description: {
      fr: 'Bourses en sciences naturelles',
      en: 'Natural sciences grants'
    }
  },
  mastercardFoundation: {
    name: 'Mastercard Foundation Scholars',
    url: 'https://mastercardfdn.org',
    description: {
      fr: 'Recherche "Scholars Program"',
      en: 'Search "Scholars Program"'
    }
  },
  oif: {
    name: 'Organisation Internationale de la Francophonie',
    url: 'https://www.francophonie.org',
    description: {
      fr: 'Bourses pour étudiants francophones',
      en: 'Grants for French-speaking students'
    }
  },
  educanada: {
    name: 'EduCanada',
    url: 'https://www.educanada.ca',
    description: {
      fr: "Bourses d'excellence du Canada",
      en: "Canada's excellence scholarships"
    }
  },
  amci: {
    name: 'AMCI — Coopération internationale Maroc',
    url: 'https://www.amci.ma',
    description: {
      fr: 'Agence Marocaine de Coopération Internationale',
      en: 'Moroccan Agency for International Cooperation'
    }
  },
  mesrs: {
    name: 'MESRS — Algérie',
    url: 'https://www.mesrs.dz',
    description: {
      fr: "Ministère de l'Enseignement Supérieur Algérien",
      en: 'Algerian Ministry of Higher Education'
    }
  },
  campusFrance: {
    name: 'Campus France',
    url: 'https://www.campusfrance.org',
    description: {
      fr: 'Bourses et mobilité internationale',
      en: 'Scholarships and international mobility'
    }
  },

  // ── FORMATION / PASSERELLES ──
  fedecegeps: {
    name: 'Fédération des cégeps',
    url: 'https://www.fedecegeps.qc.ca',
    description: { fr: 'Info sur les DEC-BAC et passerelles cégep → université', en: 'Info on DEC-BAC and college-to-university bridges' }
  },
  ontransfer: {
    name: 'ONTransfer',
    url: 'https://ontransfer.ca',
    description: { fr: 'Transferts de crédits collège → université en Ontario', en: 'College-to-university credit transfers in Ontario' }
  },
  inforoutefpt: {
    name: 'Inforoute FPT',
    url: 'https://www.inforoutefpt.org',
    description: { fr: 'Formations professionnelles et techniques au Québec', en: 'Vocational and technical programs in Quebec' }
  },

  // ── AUTRES ──
  canva: {
    name: 'Canva',
    url: 'https://www.canva.com',
    description: {
      fr: 'Recherche "CV" ou "resume" pour les templates',
      en: 'Search "resume" for templates'
    }
  },
  torontoDistress: {
    name: 'Distress Centre Canada',
    url: 'https://www.torontodistresscentre.com',
    description: {
      fr: 'Soutien en santé mentale — 1-800-268-9688',
      en: 'Mental health support — 1-800-268-9688'
    }
  },

  // ── RÉSEAU / ÉVÉNEMENTS ──
  eventbrite: {
    name: 'Eventbrite Canada',
    url: 'https://www.eventbrite.ca',
    description: {
      fr: 'Événements networking au Canada',
      en: 'Networking events in Canada'
    }
  },
}

export default SAFE_LINKS

export function getLinkInfo(key, lang = 'fr') {
  const link = SAFE_LINKS[key]
  if (!link) return null
  return {
    name: link.name,
    url: link.url,
    hint: link.description[lang] || link.description.fr,
  }
}
