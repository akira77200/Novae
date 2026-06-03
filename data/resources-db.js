// data/resources-db.js — Base de données d'URLs vérifiées pour NOVAE

const RESOURCES_DB = {
  banques: [
    { name: "TD Banque",    url: "https://www.td.com/ca/fr",                              description: "Compte étudiant sans frais mensuels", province: "all" },
    { name: "Banque Scotia", url: "https://www.scotiabank.com/ca/fr/particuliers.html",    description: "Compte étudiant avec avantages",      province: "all" },
    { name: "BMO",          url: "https://www.bmo.com/fr-ca",                             description: "Compte chèques étudiant BMO",          province: "all" },
    { name: "RBC",          url: "https://www.rbc.com/fr/particuliers",                   description: "Compte étudiant RBC",                  province: "all" },
    { name: "Desjardins",   url: "https://www.desjardins.com/fr/particuliers/produits-services/comptes/compte-cheques-etudiant.html", description: "Idéal pour les étudiants au Québec", province: "QC" },
  ],

  sante: [
    { name: "RAMQ – Inscription",          url: "https://www.ramq.gouv.qc.ca/fr/citoyens/assurance-maladie/inscription", description: "Assurance maladie Québec",            province: "QC" },
    { name: "OHIP – Carte santé Ontario",  url: "https://www.ontario.ca/fr/page/assurance-sante-ohip",                   description: "Assurance santé Ontario",             province: "ON" },
    { name: "MSP Colombie-Britannique",    url: "https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp",    description: "Assurance santé C.-B.",               province: "BC" },
    { name: "Alberta Health Care (AHCIP)", url: "https://www.alberta.ca/ahcip",                                           description: "Assurance santé Alberta",             province: "AB" },
    { name: "Manitoba Health (MHSIP)",     url: "https://www.gov.mb.ca/health/mhsip",                                    description: "Assurance santé Manitoba",            province: "MB" },
    { name: "Saskatchewan Health",         url: "https://www.saskatchewan.ca/residents/health/prescription-drug-plans-and-health-coverage/health-coverage-for-residents-of-saskatchewan", description: "Assurance santé Saskatchewan", province: "SK" },
    { name: "Nova Scotia Health (MSI)",    url: "https://novascotia.ca/dhw/msi",                                          description: "Assurance santé Nouvelle-Écosse",    province: "NS" },
    { name: "New Brunswick Health",        url: "https://www2.gnb.ca/content/gnb/fr/ministeres/sante.html",               description: "Assurance santé Nouveau-Brunswick",  province: "NB" },
  ],

  immigration: [
    { name: "IRCC – Permis d'études",      url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/permis-etudes.html",                          description: "Tout sur ton permis d'études", province: "all" },
    { name: "IRCC – Renouvellement",       url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/renouveler-prolonger-changer-conditions/etudiants.html",    description: "Renouveler ton statut",         province: "all" },
    { name: "Service Canada – NAS",        url: "https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html",                                   description: "Obtenir ton NAS",               province: "all" },
  ],

  credit: [
    { name: "Borrowell – Cote de crédit gratuite", url: "https://borrowell.com/fr",         description: "Vérifie ta cote de crédit gratuitement", province: "all" },
    { name: "Credit Karma Canada",                  url: "https://www.creditkarma.ca",        description: "Surveille ton crédit",                   province: "all" },
  ],

  impots: [
    { name: "ARC – Impôts Canada",   url: "https://www.canada.ca/fr/agence-revenu.html",                        description: "Déclaration de revenus fédérale",       province: "all" },
    { name: "Revenu Québec",          url: "https://www.revenuquebec.ca/fr/citoyens/declaration-de-revenus",    description: "Déclaration provinciale Québec",         province: "QC"  },
    { name: "TurboImpôt Canada",      url: "https://turbotax.intuit.ca",                                        description: "Logiciel de déclaration gratuit",        province: "all" },
  ],

  emploi: [
    // National — toujours présent
    { name: "Guichet Emplois Canada", url: "https://www.guichetemplois.gc.ca", description: "Offres d'emploi partout au Canada",      province: "all", city: "all" },
    { name: "Indeed Canada",          url: "https://ca.indeed.com",            description: "Moteur de recherche d'emploi",           province: "all", city: "all" },
    { name: "LinkedIn Jobs",          url: "https://www.linkedin.com/jobs",    description: "Réseau professionnel + offres d'emploi", province: "all", city: "all" },
    // Indeed filtré par ville
    { name: "Emplois à Montréal – Indeed",  url: "https://ca.indeed.com/jobs?l=Montr%C3%A9al%2C+QC", description: "Offres d'emploi à Montréal",  province: "QC", city: "montreal"  },
    { name: "Emplois à Québec – Indeed",    url: "https://ca.indeed.com/jobs?l=Qu%C3%A9bec%2C+QC",   description: "Offres d'emploi à Québec",    province: "QC", city: "quebec"    },
    { name: "Emplois à Ottawa – Indeed",    url: "https://ca.indeed.com/jobs?l=Ottawa%2C+ON",         description: "Offres d'emploi à Ottawa",    province: "ON", city: "ottawa"    },
    { name: "Emplois à Toronto – Indeed",   url: "https://ca.indeed.com/jobs?l=Toronto%2C+ON",        description: "Offres d'emploi à Toronto",   province: "ON", city: "toronto"   },
    { name: "Emplois à Vancouver – Indeed", url: "https://ca.indeed.com/jobs?l=Vancouver%2C+BC",      description: "Offres d'emploi à Vancouver", province: "BC", city: "vancouver" },
    { name: "Emplois à Calgary – Indeed",   url: "https://ca.indeed.com/jobs?l=Calgary%2C+AB",        description: "Offres d'emploi à Calgary",   province: "AB", city: "calgary"   },
    { name: "Emplois à Edmonton – Indeed",  url: "https://ca.indeed.com/jobs?l=Edmonton%2C+AB",       description: "Offres d'emploi à Edmonton",  province: "AB", city: "edmonton"  },
    { name: "Emplois à Winnipeg – Indeed",  url: "https://ca.indeed.com/jobs?l=Winnipeg%2C+MB",       description: "Offres d'emploi à Winnipeg",  province: "MB", city: "winnipeg"  },
    { name: "Emplois à Halifax – Indeed",   url: "https://ca.indeed.com/jobs?l=Halifax%2C+NS",        description: "Offres d'emploi à Halifax",   province: "NS", city: "halifax"   },
    { name: "Emplois à Saskatoon – Indeed", url: "https://ca.indeed.com/jobs?l=Saskatoon%2C+SK",      description: "Offres d'emploi à Saskatoon", province: "SK", city: "saskatoon" },
    { name: "Emplois à Regina – Indeed",    url: "https://ca.indeed.com/jobs?l=Regina%2C+SK",         description: "Offres d'emploi à Regina",    province: "SK", city: "regina"    },
    { name: "Emplois à Moncton – Indeed",   url: "https://ca.indeed.com/jobs?l=Moncton%2C+NB",        description: "Offres d'emploi à Moncton",   province: "NB", city: "moncton"   },
    // Guichet Emplois filtré par ville
    { name: "Guichet Emplois – Montréal",  url: "https://www.guichetemplois.gc.ca/jobsearch/jobsearch?mid=15&term=&location=Montr%C3%A9al", description: "Guichet Emplois – Montréal",  province: "QC", city: "montreal"  },
    { name: "Guichet Emplois – Ottawa",    url: "https://www.guichetemplois.gc.ca/jobsearch/jobsearch?mid=15&term=&location=Ottawa",        description: "Guichet Emplois – Ottawa",    province: "ON", city: "ottawa"    },
    { name: "Guichet Emplois – Toronto",   url: "https://www.guichetemplois.gc.ca/jobsearch/jobsearch?mid=15&term=&location=Toronto",       description: "Guichet Emplois – Toronto",   province: "ON", city: "toronto"   },
    { name: "Guichet Emplois – Vancouver", url: "https://www.guichetemplois.gc.ca/jobsearch/jobsearch?mid=15&term=&location=Vancouver",     description: "Guichet Emplois – Vancouver", province: "BC", city: "vancouver" },
    { name: "Guichet Emplois – Calgary",   url: "https://www.guichetemplois.gc.ca/jobsearch/jobsearch?mid=15&term=&location=Calgary",       description: "Guichet Emplois – Calgary",   province: "AB", city: "calgary"   },
  ],

  logement: [
    // National
    { name: "Kijiji – Logements Canada", url: "https://www.kijiji.ca/b-appartement-condo/",  description: "Annonces de logement au Canada",       province: "all", city: null },
    { name: "PadMapper Canada",          url: "https://www.padmapper.com",                    description: "Carte interactive des logements",      province: "all", city: null },
    { name: "Rentals.ca",                url: "https://rentals.ca/fr",                        description: "Locations au Canada",                  province: "all", city: null },
    // Par ville
    { name: "Logement Montréal – Kijiji",  url: "https://www.kijiji.ca/b-appartement-condo/ville-de-montreal",  description: "Logements à Montréal",  province: "QC", city: "montreal"  },
    { name: "Logement Ottawa – Kijiji",    url: "https://www.kijiji.ca/b-appartement-condo/ottawa",              description: "Logements à Ottawa",    province: "ON", city: "ottawa"    },
    { name: "Logement Toronto – Kijiji",   url: "https://www.kijiji.ca/b-appartement-condo/ville-de-toronto",   description: "Logements à Toronto",   province: "ON", city: "toronto"   },
    { name: "Logement Vancouver – Kijiji", url: "https://www.kijiji.ca/b-appartement-condo/vancouver",           description: "Logements à Vancouver", province: "BC", city: "vancouver" },
    { name: "Logement Calgary – Kijiji",   url: "https://www.kijiji.ca/b-appartement-condo/calgary",             description: "Logements à Calgary",   province: "AB", city: "calgary"   },
  ],

  universites: [
    { name: "uOttawa",                url: "https://www.uottawa.ca",      province: "ON", keywords: ["ottawa", "uottawa"]               },
    { name: "McGill",                 url: "https://www.mcgill.ca",       province: "QC", keywords: ["mcgill"]                          },
    { name: "UdeM",                   url: "https://www.umontreal.ca",    province: "QC", keywords: ["udem", "umontreal"]               },
    { name: "Université de Toronto",  url: "https://www.utoronto.ca",     province: "ON", keywords: ["toronto", "uoft"]                 },
    { name: "UBC",                    url: "https://www.ubc.ca",          province: "BC", keywords: ["ubc", "vancouver"]                },
    { name: "Concordia",              url: "https://www.concordia.ca",    province: "QC", keywords: ["concordia"]                       },
    { name: "York University",        url: "https://www.yorku.ca",        province: "ON", keywords: ["york"]                            },
    { name: "Université Laval",       url: "https://www.ulaval.ca",       province: "QC", keywords: ["laval", "québec", "quebec"]       },
    { name: "Université de Sherbrooke", url: "https://www.usherbrooke.ca", province: "QC", keywords: ["sherbrooke"]                    },
    { name: "Carleton University",    url: "https://carleton.ca",         province: "ON", keywords: ["carleton", "ottawa"]              },
    { name: "University of Calgary",  url: "https://www.ucalgary.ca",     province: "AB", keywords: ["calgary", "ucalgary"]             },
    { name: "University of Alberta",  url: "https://www.ualberta.ca",     province: "AB", keywords: ["edmonton", "ualberta", "alberta"] },
    { name: "University of Manitoba", url: "https://umanitoba.ca",        province: "MB", keywords: ["winnipeg", "manitoba"]            },
    { name: "Dalhousie University",   url: "https://www.dal.ca",          province: "NS", keywords: ["halifax", "dalhousie"]            },
  ],
}

export default RESOURCES_DB
