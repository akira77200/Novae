// data/resources-db.js — Base de données de ressources pour NOVAE
// Toutes les URLs proviennent de lib/safeLinks.js (domaines racine uniquement)

import SAFE_LINKS from '../lib/safeLinks'

const RESOURCES_DB = {
  banques: [
    { name: 'TD Banque',     url: SAFE_LINKS.td.url,         description: "Compte étudiant sans frais mensuels", province: 'all' },
    { name: 'Banque Scotia', url: SAFE_LINKS.scotia.url,     description: 'Compte étudiant avec avantages',      province: 'all' },
    { name: 'BMO',           url: SAFE_LINKS.bmo.url,        description: 'Compte chèques étudiant BMO',         province: 'all' },
    { name: 'RBC',           url: SAFE_LINKS.rbc.url,        description: 'Compte étudiant RBC',                 province: 'all' },
    { name: 'Desjardins',    url: SAFE_LINKS.desjardins.url, description: 'Idéal pour les étudiants au Québec',  province: 'QC'  },
  ],

  sante: [
    { name: 'RAMQ — Assurance maladie Québec',  url: SAFE_LINKS.ramq.url,              description: 'Assurance maladie Québec',           province: 'QC' },
    { name: 'OHIP — Carte santé Ontario',        url: SAFE_LINKS.ohip.url,              description: 'Assurance santé Ontario',            province: 'ON' },
    { name: 'MSP Colombie-Britannique',          url: SAFE_LINKS.msp.url,               description: 'Assurance santé C.-B.',              province: 'BC' },
    { name: 'Alberta Health Care (AHCIP)',       url: SAFE_LINKS.albertaHealth.url,     description: 'Assurance santé Alberta',            province: 'AB' },
    { name: 'Manitoba Health (MHSIP)',           url: SAFE_LINKS.manitobaHealth.url,    description: 'Assurance santé Manitoba',           province: 'MB' },
    { name: 'Saskatchewan Health',              url: SAFE_LINKS.saskatchewanHealth.url, description: 'Assurance santé Saskatchewan',       province: 'SK' },
    { name: 'Nova Scotia Health (MSI)',          url: SAFE_LINKS.novaScotiaHealth.url,  description: 'Assurance santé Nouvelle-Écosse',    province: 'NS' },
    { name: 'New Brunswick Health',             url: SAFE_LINKS.newBrunswickHealth.url, description: 'Assurance santé Nouveau-Brunswick',  province: 'NB' },
  ],

  immigration: [
    { name: "IRCC — Permis d'études",  url: SAFE_LINKS.ircc.url,          description: "Tout sur ton permis d'études", province: 'all' },
    { name: 'IRCC — Renouvellement',   url: SAFE_LINKS.ircc.url,          description: 'Renouveler ton statut',         province: 'all' },
    { name: 'Service Canada — NAS',    url: SAFE_LINKS.serviceCanada.url, description: 'Obtenir ton NAS',               province: 'all' },
  ],

  credit: [
    { name: 'Borrowell — Cote de crédit gratuite', url: SAFE_LINKS.borrowell.url,   description: 'Vérifie ta cote de crédit gratuitement', province: 'all' },
    { name: 'Credit Karma Canada',                  url: SAFE_LINKS.creditKarma.url, description: 'Surveille ton crédit',                   province: 'all' },
  ],

  impots: [
    { name: 'ARC — Impôts Canada', url: SAFE_LINKS.arc.url,          description: 'Déclaration de revenus fédérale',  province: 'all' },
    { name: 'Revenu Québec',        url: SAFE_LINKS.revenuQuebec.url, description: 'Déclaration provinciale Québec',   province: 'QC'  },
    { name: 'TurboImpôt Canada',    url: SAFE_LINKS.turboimpot.url,   description: 'Logiciel de déclaration gratuit',  province: 'all' },
  ],

  emploi: [
    // National
    { name: 'Guichet Emplois Canada', url: SAFE_LINKS.guichetEmplois.url, description: "Offres d'emploi partout au Canada",      province: 'all', city: 'all' },
    { name: 'Indeed Canada',           url: SAFE_LINKS.indeed.url,         description: "Moteur de recherche d'emploi",           province: 'all', city: 'all' },
    { name: 'LinkedIn Jobs',           url: SAFE_LINKS.linkedin.url,       description: 'Réseau professionnel + offres d\'emploi', province: 'all', city: 'all' },
    // Indeed par ville (domaine racine — l'utilisateur filtre sur place)
    { name: 'Indeed — Montréal',  url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Montréal",  province: 'QC', city: 'montreal'  },
    { name: 'Indeed — Québec',    url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Québec",    province: 'QC', city: 'quebec'    },
    { name: 'Indeed — Ottawa',    url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Ottawa",    province: 'ON', city: 'ottawa'    },
    { name: 'Indeed — Toronto',   url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Toronto",   province: 'ON', city: 'toronto'   },
    { name: 'Indeed — Vancouver', url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Vancouver", province: 'BC', city: 'vancouver' },
    { name: 'Indeed — Calgary',   url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Calgary",   province: 'AB', city: 'calgary'   },
    { name: 'Indeed — Edmonton',  url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Edmonton",  province: 'AB', city: 'edmonton'  },
    { name: 'Indeed — Winnipeg',  url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Winnipeg",  province: 'MB', city: 'winnipeg'  },
    { name: 'Indeed — Halifax',   url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Halifax",   province: 'NS', city: 'halifax'   },
    { name: 'Indeed — Saskatoon', url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Saskatoon", province: 'SK', city: 'saskatoon' },
    { name: 'Indeed — Regina',    url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Regina",    province: 'SK', city: 'regina'    },
    { name: 'Indeed — Moncton',   url: SAFE_LINKS.indeed.url,         description: "Offres d'emploi à Moncton",   province: 'NB', city: 'moncton'   },
    // Guichet Emplois par ville (domaine racine — l'utilisateur filtre sur place)
    { name: 'Guichet Emplois — Montréal',  url: SAFE_LINKS.guichetEmplois.url, description: "Guichet Emplois — Montréal",  province: 'QC', city: 'montreal'  },
    { name: 'Guichet Emplois — Ottawa',    url: SAFE_LINKS.guichetEmplois.url, description: "Guichet Emplois — Ottawa",    province: 'ON', city: 'ottawa'    },
    { name: 'Guichet Emplois — Toronto',   url: SAFE_LINKS.guichetEmplois.url, description: "Guichet Emplois — Toronto",   province: 'ON', city: 'toronto'   },
    { name: 'Guichet Emplois — Vancouver', url: SAFE_LINKS.guichetEmplois.url, description: "Guichet Emplois — Vancouver", province: 'BC', city: 'vancouver' },
    { name: 'Guichet Emplois — Calgary',   url: SAFE_LINKS.guichetEmplois.url, description: "Guichet Emplois — Calgary",   province: 'AB', city: 'calgary'   },
  ],

  logement: [
    // National
    { name: 'Kijiji — Logements Canada', url: SAFE_LINKS.kijiji.url,    description: 'Annonces de logement au Canada',  province: 'all', city: null },
    { name: 'PadMapper Canada',           url: SAFE_LINKS.padmapper.url, description: 'Carte interactive des logements', province: 'all', city: null },
    { name: 'Rentals.ca',                 url: SAFE_LINKS.rentals.url,   description: 'Locations au Canada',             province: 'all', city: null },
    // Par ville (domaine racine — l'utilisateur filtre sur place)
    { name: 'Kijiji — Montréal',  url: SAFE_LINKS.kijiji.url, description: 'Logements à Montréal',  province: 'QC', city: 'montreal'  },
    { name: 'Kijiji — Ottawa',    url: SAFE_LINKS.kijiji.url, description: 'Logements à Ottawa',    province: 'ON', city: 'ottawa'    },
    { name: 'Kijiji — Toronto',   url: SAFE_LINKS.kijiji.url, description: 'Logements à Toronto',   province: 'ON', city: 'toronto'   },
    { name: 'Kijiji — Vancouver', url: SAFE_LINKS.kijiji.url, description: 'Logements à Vancouver', province: 'BC', city: 'vancouver' },
    { name: 'Kijiji — Calgary',   url: SAFE_LINKS.kijiji.url, description: 'Logements à Calgary',   province: 'AB', city: 'calgary'   },
  ],

  universites: [
    { name: 'uOttawa',                url: SAFE_LINKS.uottawa.url,    province: 'ON', keywords: ['ottawa', 'uottawa']               },
    { name: 'McGill',                 url: SAFE_LINKS.mcgill.url,     province: 'QC', keywords: ['mcgill']                          },
    { name: 'UdeM',                   url: SAFE_LINKS.udem.url,       province: 'QC', keywords: ['udem', 'umontreal']               },
    { name: 'Université de Toronto',  url: SAFE_LINKS.utoronto.url,   province: 'ON', keywords: ['toronto', 'uoft']                 },
    { name: 'UBC',                    url: SAFE_LINKS.ubc.url,        province: 'BC', keywords: ['ubc', 'vancouver']                },
    { name: 'Concordia',              url: SAFE_LINKS.concordia.url,  province: 'QC', keywords: ['concordia']                       },
    { name: 'York University',        url: SAFE_LINKS.york.url,       province: 'ON', keywords: ['york']                            },
    { name: 'Université Laval',       url: SAFE_LINKS.laval.url,      province: 'QC', keywords: ['laval', 'québec', 'quebec']       },
    { name: 'Université de Sherbrooke', url: SAFE_LINKS.sherbrooke.url, province: 'QC', keywords: ['sherbrooke']                   },
    { name: 'Carleton University',    url: SAFE_LINKS.carleton.url,   province: 'ON', keywords: ['carleton', 'ottawa']              },
    { name: 'University of Calgary',  url: SAFE_LINKS.ucalgary.url,   province: 'AB', keywords: ['calgary', 'ucalgary']             },
    { name: 'University of Alberta',  url: SAFE_LINKS.ualberta.url,   province: 'AB', keywords: ['edmonton', 'ualberta', 'alberta'] },
    { name: 'University of Manitoba', url: SAFE_LINKS.umanitoba.url,  province: 'MB', keywords: ['winnipeg', 'manitoba']            },
    { name: 'Dalhousie University',   url: SAFE_LINKS.dalhousie.url,  province: 'NS', keywords: ['halifax', 'dalhousie']            },
  ],
}

export default RESOURCES_DB
