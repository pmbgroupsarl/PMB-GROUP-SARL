export interface PhoneLine {
  label: string;
  display: string;
  href: string;
  whatsappUrl: string;
  telHref: string;
}

export interface CompanyInfo {
  legalName: string;
  rccm: string;
  idNat: string;
  city: string;
  country: string;
  headquartersPlace: string;
  headquartersReference: string;
  fullHeadquartersAddress: string;
  email: string;
  groupLogo: string;
  watermarkLogo: string;
  heroBannerLogo: string;
  phones: PhoneLine[];
  colors: {
    darkBackground: string;
    anthracite: string;
    blueHorizon: string;
    goldAccent: string;
  };
}

export type PaymentChannelId =
  | 'card_visa_mastercard'
  | 'mpesa'
  | 'orange_money'
  | 'airtel_money'
  | 'africell_money';

export interface PaymentChannelInfo {
  id: PaymentChannelId;
  name: string;
  shortName: string;
  category: 'card' | 'mobile_money';
  description: string;
  accentColor: string;
  prefixHint?: string;
}

export const PMB_PAYMENT_CHANNELS: PaymentChannelInfo[] = [
  {
    id: 'card_visa_mastercard',
    name: 'Carte Bancaire (Visa / MasterCard)',
    shortName: 'Visa / MasterCard',
    category: 'card',
    description: 'Paiement en ligne sécurisé 3D Secure connecté aux comptes officiels PMB GROUP SARL.',
    accentColor: '#229ED9',
  },
  {
    id: 'mpesa',
    name: 'M-Pesa (Vodacom RDC)',
    shortName: 'M-Pesa',
    category: 'mobile_money',
    description: 'Validation instantanée par notification USSD M-Pesa sur votre numéro +243 81/82/83.',
    accentColor: '#E11D48',
    prefixHint: '+243 81 / 82 / 83',
  },
  {
    id: 'orange_money',
    name: 'Orange Money (RDC)',
    shortName: 'Orange Money',
    category: 'mobile_money',
    description: 'Paiement Mobile Money Orange RDC avec confirmation webhook temps réel.',
    accentColor: '#F97316',
    prefixHint: '+243 84 / 85 / 89',
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money (RDC)',
    shortName: 'Airtel Money',
    category: 'mobile_money',
    description: 'Règlement direct Airtel Money RDC avec reçu consigné dans votre compte client.',
    accentColor: '#DC2626',
    prefixHint: '+243 97 / 98 / 99',
  },
  {
    id: 'africell_money',
    name: 'Africell Money (RDC)',
    shortName: 'Africell Money',
    category: 'mobile_money',
    description: 'Encaissement mobile Africell Money RDC sécurisé pour toutes les 6 branches.',
    accentColor: '#A855F7',
    prefixHint: '+243 90 / 91',
  },
];

export interface TransportMode {
  id: 'terrestre' | 'maritime' | 'aerien';
  title: string;
  subtitle: string;
  description: string;
}

export interface BranchItem {
  id: string;
  index: string;
  name: string;
  shortName: string;
  accentColor: string;
  colorName: string;
  logoImage: string;
  sceneImage: string;
  visualAnalysis: string;
  officialMission: string;
  services: string[];
  kinshasaImpact: string;
  quotePlaceholder: string;
  transportModes?: TransportMode[];
}

export type VideoCategory =
  | 'all'
  | 'led-installation'
  | 'conferences'
  | 'concerts-stades'
  | 'salles-ceremonies';

export interface EventVideoItem {
  id: string;
  number: string;
  title: string;
  fileName: string;
  videoUrl: string;
  category: Exclude<VideoCategory, 'all'>;
  categoryLabel: string;
  context: string;
  objective: string;
  specs: string;
}

export interface MembershipCategory {
  id: string;
  number: string;
  title: string;
  summary: string;
  contributionPrincipal: string;
  cotisation: string;
  responsibilities: string[];
  conditions: string[];
  inUpdatedForm: boolean;
}

export const PMB_COMPANY: CompanyInfo = {
  legalName: 'PMB GROUP SARL',
  rccm: 'RCCM/24-A-04653 P-Id',
  idNat: 'Nat/01-G4701-N52717A',
  city: 'Kinshasa',
  country: 'République Démocratique du Congo',
  headquartersPlace: 'Bandal Synkin, Arrêt Station Tshibangu (Réf. Immeuble Vodacom)',
  headquartersReference: 'Croisement des avenues Kisangani et Sundi N°1 — Kinshasa, RDC',
  fullHeadquartersAddress:
    'Bandal Synkin, Arrêt Station Tshibangu, Réf. Immeuble Vodacom, Croisement des avenues Kisangani et Sundi N°1 — Kinshasa, RDC',
  email: 'mboziprisca37@gmail.com',
  groupLogo: '/assets/aistudio/pmb_group_4fcc36f0.jpeg',
  watermarkLogo: '/assets/aistudio/logo_PMB_GROUP_3df9c593.jpeg',
  heroBannerLogo: '/assets/aistudio/landscape_8ae0a86b.jpg',
  phones: [
    {
      label: 'Ligne Principale',
      display: '+243 89 66 60 558',
      href: 'https://wa.me/243896660558',
      whatsappUrl: 'https://wa.me/243896660558',
      telHref: 'tel:+243896660558',
    },
    {
      label: 'Ligne Commerciale',
      display: '+243 96 23 00 003',
      href: 'https://wa.me/243962300003',
      whatsappUrl: 'https://wa.me/243962300003',
      telHref: 'tel:+243962300003',
    },
    {
      label: 'Support & Devis',
      display: '+243 83 39 93 994',
      href: 'https://wa.me/243833993994',
      whatsappUrl: 'https://wa.me/243833993994',
      telHref: 'tel:+243833993994',
    },
  ],
  colors: {
    darkBackground: '#121212',
    anthracite: '#262626',
    blueHorizon: '#229ED9',
    goldAccent: '#F59E0B',
  },
};

export const PMB_BRANCHES: BranchItem[] = [
  {
    id: 'pmb-shop',
    index: '01',
    name: 'PMB Shop',
    shortName: 'Shop',
    accentColor: '#D95B5B',
    colorName: 'Corail',
    logoImage: '/assets/aistudio/pmb_shop_a0d2907c.jpeg',
    sceneImage: '/assets/aistudio/Gemini_Generated_Image_nuvyq8nuvyq8nuvy__5__5b90af28.jpg',
    visualAnalysis:
      'Smartphone moderne affichant les opérateurs télécoms (Vodacom, Airtel, Orange, Africell), cartes de recharge et terminal de paiement électronique.',
    officialMission:
      'Connectivité et services numériques de proximité pour particuliers et revendeurs.',
    services: [
      "Achat instantané d'unités de crédit et forfaits internet tous réseaux",
      'Vente de smartphones neufs et accessoires certifiés',
      'Opérations Mobile Money sécurisées (M-Pesa, Airtel Money, Orange Money)',
    ],
    kinshasaImpact:
      'Guichet multiservice rapide à Bandal Synkin pour particuliers, commerçants et réseaux de revendeurs télécoms.',
    quotePlaceholder:
      'Ex. : Approvisionnement revendeur en unités multi-opérateurs ou achat groupé de terminaux.',
  },
  {
    id: 'pmb-store',
    index: '02',
    name: 'PMB Store',
    shortName: 'Store',
    accentColor: '#F9A825',
    colorName: 'Ambre',
    logoImage: '/assets/aistudio/pmb_store_d6018ccb.jpeg',
    sceneImage: '/assets/aistudio/Gemini_Generated_Image_nuvyq8nuvyq8nuvy__4__87317c7a.jpg',
    visualAnalysis:
      'Assortiment d’eau minérale purifiée « Eau Vive », jus naturels frais et produits alimentaires de grande consommation (FMCG).',
    officialMission:
      'Distribution de produits de première nécessité et de boissons de qualité.',
    services: [
      "Vente en gros et détail d'Eau Vive et jus naturels frais",
      'Approvisionnement en denrées alimentaires courantes',
      'Service Import-Export et gestion logistique de marchandises',
    ],
    kinshasaImpact:
      'Chaîne d’approvisionnement fiable pour ménages, points de vente, hôtels et entreprises de Kinshasa.',
    quotePlaceholder:
      'Ex. : Commande hebdomadaire de packs Eau Vive, jus frais ou approvisionnement FMCG en gros.',
  },
  {
    id: 'pmb-transport',
    index: '03',
    name: 'PMB Transport',
    shortName: 'Transport',
    accentColor: '#C9C238',
    colorName: 'Jaune',
    logoImage: '/assets/aistudio/pmb_trans_c760e3a3.jpeg',
    sceneImage: '/assets/aistudio/Gemini_Generated_Image_6u2dam6u2dam6u2d_21c6b955.jpg',
    visualAnalysis:
      'Flotte logistique complète PMB TRANS / PMB GROUP SARL IMPORT-EXPORT en zone portuaire : avion cargo, paquebot porte-conteneurs, semi-remorque et moto de livraison urbaine.',
    officialMission:
      'Mobilité urbaine, transport multimodal (terrestre, maritime par paquebot, aérien par avion) et logistique Import & Export connectée.',
    services: [
      'Transport Terrestre : VTC urbain, navettes, motos de livraison GPS et camions de fret',
      'Transport Maritime & Fluvial (Paquebot / Navire) : import-export de conteneurs et marchandises en gros sur le fleuve Congo et voies maritimes',
      'Transport Aérien (Avion / Fret Express) : expédition et réception rapide de colis et marchandises à haute valeur à l’international',
      'Billetterie numérique dématérialisée par QR Code et suivi GPS en temps réel',
    ],
    kinshasaImpact:
      'Chaîne logistique complète reliant Kinshasa aux corridors fluviaux, ports maritimes et liaisons aériennes internationales.',
    quotePlaceholder:
      'Ex. : Expédition fret aérien express, réservation conteneur maritime (Paquebot) ou flotte VTC Kinshasa.',
    transportModes: [
      {
        id: 'terrestre',
        title: 'Transport Terrestre',
        subtitle: 'VTC, Livraison GPS & Camions',
        description:
          'Déplacements privés VTC, navettes d’entreprise, scooters de livraison rapide avec suivi GPS et camions de fret urbain.',
      },
      {
        id: 'maritime',
        title: 'Transport Maritime (Paquebot)',
        subtitle: 'Import & Export Fluvial et Maritime',
        description:
          'Acheminement de conteneurs et marchandises en gros via paquebots et navires sur le fleuve Congo et les lignes maritimes internationales.',
      },
      {
        id: 'aerien',
        title: 'Transport Aérien (Avion)',
        subtitle: 'Fret Express International',
        description:
          'Expédition et réception prioritaire par avion de colis urgents, équipements techniques et marchandises à forte valeur ajoutée.',
      },
    ],
  },
  {
    id: 'pmb-immobilier',
    index: '04',
    name: 'PMB Immo',
    shortName: 'Immo',
    accentColor: '#C5B386',
    colorName: 'Champagne',
    logoImage: '/assets/aistudio/pmb_immo_4a936f47.jpeg',
    sceneImage: '/assets/aistudio/Gemini_Generated_Image_nuvyq8nuvyq8nuvy__2__3a1b4283.jpg',
    visualAnalysis:
      'Chantier moderne en cours de finition avec architecte en casque analysant des plans techniques (tons sable et champagne).',
    officialMission:
      'Immobilier, location, vente, gestion et rénovation de bâtiments.',
    services: [
      'Achat, vente et sécurisation de parcelles et biens immobiliers',
      'Location, gestion immobilière, architecture et plans 3D',
      "Rénovation complète de bâtiments (électricité, plomberie, carrelage, staff) et location d'engins",
    ],
    kinshasaImpact:
      'Accompagnement technique de bout en bout, de la vérification foncière à la livraison clé en main.',
    quotePlaceholder:
      'Ex. : Conception de plans 3D, travaux de rénovation complète ou sécurisation d’une parcelle.',
  },
  {
    id: 'pmb-event',
    index: '05',
    name: 'PMB Event',
    shortName: 'Event',
    accentColor: '#7B1FA2',
    colorName: 'Pourpre',
    logoImage: '/assets/aistudio/pmb_event_dc038133.jpeg',
    sceneImage: '/assets/aistudio/Gemini_Generated_Image_nuvyq8nuvyq8nuvy__1__313c3423.jpg',
    visualAnalysis:
      'Scène de concert professionnelle équipée d’écrans géants LED, régies son Line Array et structures d’éclairage scénique.',
    officialMission:
      'Production audiovisuelle, sonorisation Line Array, écrans LED et événements.',
    services: [
      'Fabrication, installation et calibration d’écrans géants LED haute définition (intérieur & extérieur)',
      'Location de sonorisation professionnelle Line Array et régies numériques',
      'Montage de podiums, structures truss, tentes VIP, éclairage scénique et scénographie complète',
    ],
    kinshasaImpact:
      'Déploiement prouvé sur les grandes scènes de Kinshasa : sommets parlementaires (UPA), stades, églises, défilés, concerts et cérémonies officielles.',
    quotePlaceholder:
      'Ex. : Installation d’écran géant LED, sonorisation Line Array, podium VIP et régie lumière.',
  },
  {
    id: 'pmb-fondation',
    index: '06',
    name: 'PMB Fondation',
    shortName: 'Fondation',
    accentColor: '#0284C7',
    colorName: 'Azurin & Or',
    logoImage: '/assets/aistudio/PMB_FONDATION_9f111416.png',
    sceneImage: '/assets/aistudio/Gemini_Generated_Image_nuvyq8nuvyq8nuvy_a05bbd57.jpg',
    visualAnalysis:
      'Action humanitaire de terrain à Kinshasa illustrant la distribution de kits alimentaires et scolaires aux familles et enfants.',
    officialMission:
      'Actions sociales, aide humanitaire et encadrement communautaire.',
    services: [
      "Apporter une assistance humanitaire d'urgence aux populations vulnérables de Kinshasa et de la RDC",
      "Soutenir l'éducation par des campagnes de distribution de kits scolaires et l'appui aux structures d'accueil",
      "Promouvoir l'autonomisation des jeunes et le développement communautaire durable par des projets solidaires",
    ],
    kinshasaImpact:
      'Présence solidaire directe auprès des familles, écoles et structures d’accueil des quartiers de Kinshasa avec adhésion ouverte aux membres.',
    quotePlaceholder:
      'Ex. : Partenariat social, parrainage de kits scolaires ou soutien à une opération humanitaire.',
  },
];

export const PMB_FONDATION_CHARTER = {
  documentTitle: 'FICHE D’ADHÉSION — PMB FONDATION',
  subtitle: 'PMB FONDATION — Formulaire officiel d’adhésion',
  motto: 'Une action aujourd’hui, un avenir meilleur demain.',
  fichePdfPath: '/assets/aistudio/fiche_adhesion_PMB_Fondation_mise_a_jour_711f6382.pdf',
  conditionsPdfPath: '/assets/aistudio/Conditions_adhesion_PMB_Fondation_7ce37c44.pdf',
  commitmentStatement:
    'Je soussigné(e), certifie que les renseignements fournis dans cette fiche sont exacts. Je sollicite mon adhésion à PMB Fondation et m’engage à respecter ses statuts, son règlement d’ordre intérieur, ses valeurs ainsi que les décisions régulièrement prises par ses organes.',
  privacyNotice:
    'Les informations recueillies sont destinées exclusivement à la gestion des adhésions de PMB Fondation.',
  importantDisposition:
    'L’adhésion à PMB Fondation ne donne pas automatiquement droit à un poste de responsabilité dans l’organigramme. Les fonctions administratives et dirigeantes sont attribuées suivant les statuts et les décisions des organes compétents.',
  adminNote:
    'Les montants des cotisations, les droits de vote et les modalités détaillées d’admission doivent être validés dans les statuts ou le règlement d’ordre intérieur avant leur application.',
  commonRules: [
    'Remplir la fiche officielle d’adhésion.',
    'Fournir des informations exactes.',
    'Accepter les statuts et le règlement d’ordre intérieur.',
    'Respecter les dirigeants, les membres et les bénéficiaires.',
    'Préserver la confidentialité des informations internes.',
    'Défendre l’image et les valeurs de PMB Fondation.',
    'Éviter toute utilisation personnelle ou abusive du nom de la fondation.',
  ],
  formCategories: [
    'Membre effectif',
    'Membre bienfaiteur',
    "Membre d'honneur",
    'Membre Bénévole',
  ],
  categories: [
    {
      id: 'membre-effectif',
      number: '01',
      title: 'Membre effectif',
      summary:
        'Le membre effectif participe activement à la vie et au fonctionnement de PMB Fondation. Il contribue aux décisions et à la réalisation des objectifs de la fondation.',
      contributionPrincipal: 'Participation et décisions',
      cotisation: 'Selon les statuts',
      responsibilities: [
        'Participer aux assemblées générales et aux réunions.',
        'Prendre part aux activités et projets sociaux.',
        'Contribuer aux décisions selon les statuts.',
        'Respecter les textes et les orientations de la fondation.',
        'Participer au développement de la fondation.',
      ],
      conditions: [
        'Être majeur et jouir de ses droits civiques.',
        'Adhérer aux valeurs et aux objectifs de la fondation.',
        'Accepter les statuts et le règlement intérieur.',
        'S’acquitter des cotisations prévues.',
        'Être accepté par les organes compétents.',
      ],
      inUpdatedForm: true,
    },
    {
      id: 'membre-adherent',
      number: '02',
      title: 'Membre adhérent',
      summary:
        'Le membre adhérent rejoint officiellement PMB Fondation et souhaite soutenir ses activités sans nécessairement participer à toutes les responsabilités administratives.',
      contributionPrincipal: 'Soutien et participation',
      cotisation: 'Selon les statuts',
      responsibilities: [
        'Participer aux activités selon ses disponibilités.',
        'Soutenir les initiatives de la fondation.',
        'Respecter les décisions et les règlements.',
        'Promouvoir les actions de la fondation.',
      ],
      conditions: [
        'Remplir la fiche officielle d’adhésion.',
        'Accepter les statuts et le règlement intérieur.',
        'S’acquitter de la cotisation prévue pour cette catégorie.',
        'Obtenir l’approbation de l’administration.',
      ],
      inUpdatedForm: true,
    },
    {
      id: 'membre-honneur',
      number: '03',
      title: 'Membre d’honneur',
      summary:
        'Cette distinction est accordée à une personnalité qui s’est particulièrement distinguée par ses services, son engagement ou sa contribution remarquable à la fondation ou à ses œuvres sociales.',
      contributionPrincipal: 'Reconnaissance et conseils',
      cotisation: 'Facultative selon décision',
      responsibilities: [
        'Représenter dignement les valeurs de la fondation.',
        'Apporter des conseils et orientations lorsque cela est sollicité.',
        'Encourager les initiatives sociales.',
        'Contribuer au rayonnement de PMB Fondation.',
      ],
      conditions: [
        'Être proposé par les organes dirigeants.',
        'Avoir apporté une contribution remarquable ou rendu des services importants.',
        'Être officiellement reconnu par la fondation.',
        'La cotisation peut être facultative selon la décision des organes compétents.',
      ],
      inUpdatedForm: true,
    },
    {
      id: 'membre-bienfaiteur',
      number: '04',
      title: 'Membre bienfaiteur',
      summary:
        'Le membre bienfaiteur est une personne physique ou morale qui apporte un soutien matériel, financier ou logistique à PMB Fondation pour permettre la réalisation de ses projets.',
      contributionPrincipal: 'Soutien financier et matériel',
      cotisation: 'Contribution volontaire',
      responsibilities: [
        'Soutenir financièrement ou matériellement les projets.',
        'Contribuer aux actions humanitaires et sociales.',
        'Encourager les initiatives de développement.',
        'Entretenir une relation de confiance avec la fondation.',
      ],
      conditions: [
        'Manifester une volonté réelle de soutenir la fondation.',
        'Effectuer une contribution volontaire.',
        'Respecter les valeurs et les objectifs de PMB Fondation.',
        'Accepter les règles de transparence dans les contributions.',
        'Le montant de la contribution est libre ou fixé selon les modalités convenues avec la fondation.',
      ],
      inUpdatedForm: true,
    },
    {
      id: 'membre-benevole',
      number: '05',
      title: 'Membre bénévole',
      summary:
        'Le membre bénévole met volontairement son temps, ses compétences et son énergie au service des activités de PMB Fondation, sans rechercher une rémunération.',
      contributionPrincipal: 'Temps et compétences',
      cotisation: 'Pas de cotisation obligatoire proposée',
      responsibilities: [
        'Participer aux activités humanitaires et sociales.',
        'Apporter son savoir-faire et ses compétences.',
        'Participer aux campagnes de sensibilisation.',
        'Accompagner les équipes sur le terrain.',
        'Respecter les consignes des responsables.',
      ],
      conditions: [
        'Être disponible selon les activités proposées.',
        'Avoir la volonté de servir la communauté.',
        'Respecter les règles de discipline et de confidentialité.',
        'Accepter les statuts et le règlement intérieur.',
        'Aucune cotisation obligatoire n’est proposée pour cette catégorie.',
      ],
      inUpdatedForm: true,
    },
  ] as MembershipCategory[],
  involvementDomains: [
    "Assistance humanitaire d'urgence & distribution de vivres",
    'Éducation, kits scolaires & appui aux structures d’accueil',
    'Autonomisation des jeunes & projets communautaires',
    'Logistique, sensibilisation & appui de terrain',
    'Mécénat, partenariats & mobilisation de ressources',
  ],
};

export const PMB_EVENT_VIDEO_CATEGORIES: { id: VideoCategory; label: string }[] = [
  { id: 'all', label: 'Toutes les vidéos' },
  { id: 'led-installation', label: 'Écrans LED & Montage' },
  { id: 'conferences', label: 'Conférences & Officiel' },
  { id: 'concerts-stades', label: 'Concerts & Grands Espaces' },
  { id: 'salles-ceremonies', label: 'Salles & Cérémonies' },
];

export const PMB_EVENT_VIDEOS: EventVideoItem[] = [
  {
    id: 'vid-01',
    number: '01',
    title: 'Multi fonction — Fabrication et installation d’écrans géants LED',
    fileName: 'Multi_fonction_fabrication_des_ecrant_et_installation_e35a7ca9.mp4',
    videoUrl: '/assets/aistudio/Multi_fonction_fabrication_des_ecrant_et_installation_e35a7ca9.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Vidéo promotionnelle officielle commentée présentant les ateliers de soudure, l’assemblage des dalles LED et les installations en églises, salles de fêtes, conférences et concerts.',
    objective:
      'Présenter l’ensemble du savoir-faire technique de PMB Events, de la fabrication sur mesure à la mise en service scénique.',
    specs: 'Voix off officielle · Atelier & Terrain · LED haute luminosité',
  },
  {
    id: 'vid-02',
    number: '02',
    title: 'Sanjola Event — Captation Live Grand Public',
    fileName: 'SANJOLA_EVENT_c8238563.mp4',
    videoUrl: '/assets/aistudio/SANJOLA_EVENT_c8238563.mp4',
    category: 'concerts-stades',
    categoryLabel: 'Concerts & Grands Espaces',
    context:
      'Ambiance musicale et festive lors d’un grand rassemblement nocturne équipé de trois écrans LED géants et de tours d’éclairage.',
    objective:
      'Mettre en valeur la puissance visuelle de la scène et la communion avec des milliers de spectateurs.',
    specs: 'Multi-écrans LED · Éclairage scénique · Son live immersif',
  },
  {
    id: 'vid-03',
    number: '03',
    title: 'Événement Sanjola Kinshasa — Scène Monumentale',
    fileName: 'EVENEMENT_SANJOLA_KINSHASA_7261c0ec.mp4',
    videoUrl: '/assets/aistudio/EVENEMENT_SANJOLA_KINSHASA_7261c0ec.mp4',
    category: 'concerts-stades',
    categoryLabel: 'Concerts & Grands Espaces',
    context:
      'Couverture en plein air à Kinshasa avec un immense mur LED panoramique affichant le drapeau de la RDC et les grappes Line Array suspendues.',
    objective:
      'Démontrer l’ancrage local et la capacité de PMB Event à déployer des scènes d’envergure nationale.',
    specs: 'Mur LED panoramique · Line Array suspendu · Gestion foule',
  },
  {
    id: 'vid-04',
    number: '04',
    title: 'Event Conférence — Régie & Écran Intérieur',
    fileName: 'EVENT_CONFERENCE_a9469b1a.mp4',
    videoUrl: '/assets/aistudio/EVENT_CONFERENCE_a9469b1a.mp4',
    category: 'conferences',
    categoryLabel: 'Conférences & Officiel',
    context:
      'Aménagement complet d’une salle de conférence professionnelle avec écran LED haute définition, podium bas et acoustique traitée.',
    objective:
      'Illustrer la précision de PMB Event pour les séminaires d’entreprise et conférences institutionnelles.',
    specs: 'Écran LED HD · Éclairage architectural · Régie audio-vidéo',
  },
  {
    id: 'vid-05',
    number: '05',
    title: 'Événement Conférence — Sommet UPA Kinshasa',
    fileName: 'EVENEMENT_CONFERENCE_e066d56f.mp4',
    videoUrl: '/assets/aistudio/EVENEMENT_CONFERENCE_e066d56f.mp4',
    category: 'conferences',
    categoryLabel: 'Conférences & Officiel',
    context:
      '84e Session du Comité Exécutif et 47e Conférence des Présidents des Parlements de l’Union Parlementaire Africaine (UPA) à Kinshasa.',
    objective:
      'Prouver la fiabilité protocolaire de PMB Event sur les sommets internationaux de haut niveau.',
    specs: 'Multi-écrans latéraux & central · Sonorisation conférence · Protocoles VIP',
  },
  {
    id: 'vid-06',
    number: '06',
    title: 'LED Screen — Scène Triple Écran Haute Définition',
    fileName: 'LED_SCREEN_e18161e8.mp4',
    videoUrl: '/assets/aistudio/LED_SCREEN_e18161e8.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Configuration scénique intérieure associant un grand mur LED central encadré de deux écrans latéraux synchronisés.',
    objective:
      'Démontrer la netteté d’image et l’homogénéité colorimétrique des dalles LED PMB Events.',
    specs: 'Résolution HD/4K · Triple mur LED · Synchronisation vidéo',
  },
  {
    id: 'vid-07',
    number: '07',
    title: 'Event Salle Inside — Scénographie & Tapis Rouge',
    fileName: 'EVENT_SALLE_INSIDE_83bc8ecb.mp4',
    videoUrl: '/assets/aistudio/EVENT_SALLE_INSIDE_83bc8ecb.mp4',
    category: 'salles-ceremonies',
    categoryLabel: 'Salles & Cérémonies',
    context:
      'Immersion à l’intérieur d’une salle d’exposition et conférence dotée de murs LED continus, podium blanc et tapis rouge protocolaire.',
    objective:
      'Mettre en avant la maîtrise de l’agencement intérieur pour forums, lancements et salons professionnels.',
    specs: 'Murs LED modulaires · Podium événementiel · Éclairage d’ambiance',
  },
  {
    id: 'vid-08',
    number: '08',
    title: 'PMB Présentation LED Screen — Mur Géant & Line Array',
    fileName: 'PMB_PRESENTATION_LED_SCREEN_e79e8f6f.mp4',
    videoUrl: '/assets/aistudio/PMB_PRESENTATION_LED_SCREEN_e79e8f6f.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Démonstration réelle d’un mur LED géant installé sur scène avec deux systèmes de sonorisation Line Array suspendus en façade.',
    objective:
      'Convaincre les organisateurs de la complémentarité entre affichage géant et couverture acoustique homogène.',
    specs: 'Écran LED grand format · Line Array · Truss aluminium',
  },
  {
    id: 'vid-09',
    number: '09',
    title: 'Présentation Écran LED PMB — Plateau Conférence',
    fileName: 'PRESENTATION_ECRAN_LED_PMB_6552d389.mp4',
    videoUrl: '/assets/aistudio/PRESENTATION_ECRAN_LED_PMB_6552d389.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Rendu visuel lumineux du logo PMB Events sur un mur LED derrière un plateau de conférenciers en salle.',
    objective:
      'Mettre en valeur la précision des contrastes et la lisibilité des supports de marque en milieu éclairé.',
    specs: 'Contraste élevé · Fauteuils plateau · Éclairage neutre',
  },
  {
    id: 'vid-10',
    number: '10',
    title: 'Multi Event — Plateau Officiel Visit RDC',
    fileName: 'MULTI_EVENT_0096cf02.mp4',
    videoUrl: '/assets/aistudio/MULTI_EVENT_0096cf02.mp4',
    category: 'conferences',
    categoryLabel: 'Conférences & Officiel',
    context:
      'Scène de conférence en hôtel prestigieux équipée d’un mur LED central haute définition et d’une mise en scène institutionnelle.',
    objective:
      'Illustrer la polyvalence de PMB Event dans les hôtels et centres de congrès de Kinshasa.',
    specs: 'Mur LED HD · Pupitre officiel · Hôtellerie 5 étoiles',
  },
  {
    id: 'vid-11',
    number: '11',
    title: 'Big Event — Déploiement Sommet au Golden Tulip Kinshasa',
    fileName: 'BIG_EVENT_0be04748.mp4',
    videoUrl: '/assets/aistudio/BIG_EVENT_0be04748.mp4',
    category: 'conferences',
    categoryLabel: 'Conférences & Officiel',
    context:
      'Reportage complet avec vues aériennes drone, salle plénière, traduction simultanée et équipements audiovisuels au Golden Tulip Kinshasa.',
    objective:
      'Prouver la capacité à couvrir et équiper des conférences panafricaines multi-délégations.',
    specs: 'Captation aérienne & salle · Multi-caméras · Écrans plénière',
  },
  {
    id: 'vid-12',
    number: '12',
    title: 'PMB LED Screen — Panneau Urbain Extérieur',
    fileName: 'PMB_Led_screen_52993276.mp4',
    videoUrl: '/assets/aistudio/PMB_Led_screen_52993276.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Écran publicitaire LED grand format installé en hauteur en zone urbaine à Kinshasa diffusant l’identité de PMB GROUP SARL.',
    objective:
      'Démontrer la résistance aux intempéries et la forte luminosité diurne des écrans extérieurs PMB.',
    specs: 'Panneau Outdoor IP65 · Haute luminosité jour · Charpente acier',
  },
  {
    id: 'vid-13',
    number: '13',
    title: 'PMB Event — Salle de Réception & Écrans Colonnes',
    fileName: 'PMB_EVENT_48abb7e6.mp4',
    videoUrl: '/assets/aistudio/PMB_EVENT_48abb7e6.mp4',
    category: 'salles-ceremonies',
    categoryLabel: 'Salles & Cérémonies',
    context:
      'Salle habillée sous chapiteau drapé avec éclairage magenta/pourpre, grand mur LED et quatre totems LED verticaux.',
    objective:
      'Valoriser l’esthétique événementielle pour lancements de marques télécoms, galas et dîners de prestige.',
    specs: 'Chapiteau drapé · Totems LED verticaux · Wash lights pourpre',
  },
  {
    id: 'vid-14',
    number: '14',
    title: 'Installation Event — Défilé de Mode & Podium Central',
    fileName: 'Installation_event_8528a29d.mp4',
    videoUrl: '/assets/aistudio/Installation_event_8528a29d.mp4',
    category: 'salles-ceremonies',
    categoryLabel: 'Salles & Cérémonies',
    context:
      'Catwalk lumineux entouré de ponts aluminium, projecteurs asservis et doubles colonnes LED en salle VIP.',
    objective:
      'Montrer l’adaptation sur mesure aux défilés de mode et événements culturels.',
    specs: 'Catwalk scénique · Ponts truss · Éclairage directionnel',
  },
  {
    id: 'vid-15',
    number: '15',
    title: 'Installation Publique — Place de l’Échangeur de Limete',
    fileName: 'Installation_publique_7daf196c.mp4',
    videoUrl: '/assets/aistudio/Installation_publique_7daf196c.mp4',
    category: 'concerts-stades',
    categoryLabel: 'Concerts & Grands Espaces',
    context:
      'Production en plein air au pied de la Tour de l’Échangeur de Limete avec écran LED central, tours d’éclairage et captation multi-caméras.',
    objective:
      'Illustrer la maîtrise des événements culturels et citoyens sur les sites emblématiques de Kinshasa.',
    specs: 'Plein air · Structure portique truss · Régie broadcast',
  },
  {
    id: 'vid-16',
    number: '16',
    title: 'Installation Structure & Lumière Nocturne',
    fileName: 'Installation_structure_et_lumiere_c4b199f2.mp4',
    videoUrl: '/assets/aistudio/Installation_structure_et_lumiere_c4b199f2.mp4',
    category: 'concerts-stades',
    categoryLabel: 'Concerts & Grands Espaces',
    context:
      'Tests nocturnes des faisceaux beam, consoles lumière DMX et charpente scénique de grande portée.',
    objective:
      'Mettre en avant la précision du pilotage lumière et la sécurité des installations nocturnes.',
    specs: 'Consoles DMX · Faisceaux Beam · Tours de levage',
  },
  {
    id: 'vid-17',
    number: '17',
    title: 'Installation Écran Église & Grand Auditorium',
    fileName: 'Installation_ecranEglise_d5c9a8d8.mp4',
    videoUrl: '/assets/aistudio/Installation_ecranEglise_d5c9a8d8.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Déploiement d’un écran géant LED central et de systèmes Line Array dans un grand auditorium en plein aménagement.',
    objective:
      'Démontrer la capacité d’équipement fixe ou temporaire des lieux de culte et amphithéâtres.',
    specs: 'Grand auditorium · Mur LED central · Audio suspendu',
  },
  {
    id: 'vid-18',
    number: '18',
    title: 'Event Church & Soirée Extérieure LED',
    fileName: 'Event_church_4be00de7.mp4',
    videoUrl: '/assets/aistudio/Event_church_4be00de7.mp4',
    category: 'salles-ceremonies',
    categoryLabel: 'Salles & Cérémonies',
    context:
      'Écran géant LED monté sous portique aluminium pour diffusion vidéo et animation de soirée en plein air.',
    objective:
      'Illustrer la souplesse d’installation des écrans géants autonomes en esplanade.',
    specs: 'Portique truss · Écran géant HD · Diffusion live',
  },
  {
    id: 'vid-19',
    number: '19',
    title: 'Cérémonie Officielle — Bordure du Fleuve Congo',
    fileName: 'Ceremonie_Presidentielle_808cf9c0.mp4',
    videoUrl: '/assets/aistudio/Ceremonie_Presidentielle_808cf9c0.mp4',
    category: 'conferences',
    categoryLabel: 'Conférences & Officiel',
    context:
      'Déploiement de haut niveau au bord du fleuve Congo avec podium officiel, double écran latéral, tour de sonorisation et rangées de tentes VIP.',
    objective:
      'Prouver la rigueur d’exécution lors des cérémonies officielles et d’État en extérieur.',
    specs: 'Tentes VIP · Tour Line Array · Double écran LED extérieur',
  },
  {
    id: 'vid-20',
    number: '20',
    title: 'Configuration Écran Géant Intérieur — Conférence',
    fileName: 'Ecran_installation_et_configuration_ecran_geant_cf331753.mp4',
    videoUrl: '/assets/aistudio/Ecran_installation_et_configuration_ecran_geant_cf331753.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Tests de calibrage final d’un mur LED géant en salle de conférence avec effet laser d’ambiance et réglages techniques.',
    objective:
      'Montrer l’exigence de vérification colorimétrique et d’alignement avant chaque ouverture de salle.',
    specs: 'Calibrage colorimétrique · Mur LED grand format · Régie live',
  },
  {
    id: 'vid-21',
    number: '21',
    title: 'Cérémonie & Hommage Solennel — Tentes VIP & Double Écran',
    fileName: 'Event_funeraile_d51d3d3d.mp4',
    videoUrl: '/assets/aistudio/Event_funeraile_d51d3d3d.mp4',
    category: 'salles-ceremonies',
    categoryLabel: 'Salles & Cérémonies',
    context:
      'Installation complète avec chapiteau cintré blanc, tapis rouge, potelets dorés et deux écrans LED latéraux sur tours truss.',
    objective:
      'Démontrer la dignité et la finition soignée des aménagements protocolaires extérieurs.',
    specs: 'Chapiteau VIP · Tapis rouge & potelets · Double écran LED',
  },
  {
    id: 'vid-22',
    number: '22',
    title: 'Fixation Écran Géant Extérieur — Façade Urbaine Gombe',
    fileName: 'Installation_ecran_geant_fixation_outside_65091e20.mp4',
    videoUrl: '/assets/aistudio/Installation_ecran_geant_fixation_outside_65091e20.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Panneau LED commercial de grande taille fixé en façade d’immeuble à la Gombe pour diffusion publicitaire continue.',
    objective:
      'Mettre en avant l’expertise en affichage digital permanent (DOOH) pour entreprises et commerces.',
    specs: 'Fixation façade · Haute luminosité · Exploitation 24/7',
  },
  {
    id: 'vid-23',
    number: '23',
    title: 'Grand Rassemblement au Stade — Scène & Régie Presse',
    fileName: 'Installation_ecran_geant_en_publique_stade_26478677.mp4',
    videoUrl: '/assets/aistudio/Installation_ecran_geant_en_publique_stade_26478677.mp4',
    category: 'concerts-stades',
    categoryLabel: 'Concerts & Grands Espaces',
    context:
      'Événement massif dans un stade comble avec chapiteau scénique central, tours techniques, écrans géants et plateau caméras presse.',
    objective:
      'Prouver l’aptitude à orchestrer des méga-événements de stade devant des dizaines de milliers de personnes.',
    specs: 'Stade · Tours truss haute portée · Régie TV & Presse',
  },
  {
    id: 'vid-24',
    number: '24',
    title: 'Écran Publicitaire Extérieur — Artère Commerçante',
    fileName: 'installation_ecran_outside_place_65091e20.mp4',
    videoUrl: '/assets/aistudio/installation_ecran_outside_place_65091e20.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Vue urbaine de l’écran géant LED en fonctionnement de jour sur une artère fréquentée de Kinshasa.',
    objective:
      'Confirmer la visibilité optimale des écrans PMB même par forte lumière naturelle.',
    specs: 'Outdoor LED · Angle de vision large · Résistance climatique',
  },
  {
    id: 'vid-25',
    number: '25',
    title: 'Montage Écran Inside — Calibrage sur Échafaudage',
    fileName: 'montage_ecran_inside_2_466ee304.mp4',
    videoUrl: '/assets/aistudio/montage_ecran_inside_2_466ee304.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Équipe technique en intervention sur échafaudage pour la pose des derniers modules supérieurs et la vérification du signal vidéo.',
    objective:
      'Mettre en lumière le savoir-faire pratique et la rapidité des monteurs spécialisés PMB.',
    specs: 'Pose modulaire · Câblage données & puissance · Test live',
  },
  {
    id: 'vid-26',
    number: '26',
    title: 'Montage Écran Inside — Assemblage des Cabinets LED',
    fileName: 'montage_ecran_inside__8f7a2919.mp4',
    videoUrl: '/assets/aistudio/montage_ecran_inside__8f7a2919.mp4',
    category: 'led-installation',
    categoryLabel: 'Écrans LED & Montage',
    context:
      'Coulisses d’assemblage des dalles LED depuis la rangée inférieure jusqu’au plafond avec préparation des modules au sol.',
    objective:
      'Documenter la rigueur de câblage et la modularité du parc matériel PMB Events.',
    specs: 'Cabinets LED modulaires · Câblage structuré · Montage rapide',
  },
  {
    id: 'vid-27',
    number: '27',
    title: 'Event Outside — Charpente Truss & Grappes Line Array',
    fileName: 'Event_outside_13c0fbbf.mp4',
    videoUrl: '/assets/aistudio/Event_outside_13c0fbbf.mp4',
    category: 'concerts-stades',
    categoryLabel: 'Concerts & Grands Espaces',
    context:
      'Vue d’ensemble d’une structure métallique extérieure grand format équipée de projecteurs asservis et de multiples colonnes Line Array.',
    objective:
      'Démontrer la capacité structurelle et la puissance sonore déployées pour les festivals en plein air.',
    specs: 'Structure grand format · Multi-grappes Line Array · Flight-cases pro',
  },
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const pmbFaqData: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Général',
    question: 'Quels sont les principaux domaines d’activité de PMB GROUP SARL ?',
    answer:
      'PMB GROUP SARL opère à Kinshasa à travers six pôles d’excellence : PMB Shop (accessoires mobiles et unités), PMB Event (sonorisation, écrans LED et production événementielle), PMB Immo (immobilier et rénovation), PMB Store (commerce général et import-export), PMB Transport (mobilité urbaine et logistique) et PMB Fondation (actions sociales).',
  },
  {
    id: 'faq-2',
    category: 'PMB Event',
    question:
      'Proposez-vous la location d’équipements audiovisuels pour des concerts ou conférences ?',
    answer:
      'Oui. PMB Event met à disposition des systèmes de sonorisation Line Array, des écrans géants LED (P4.81), des jeux de lumière professionnels ainsi qu’une équipe technique complète pour vos événements en plein air ou en salle.',
  },
  {
    id: 'faq-3',
    category: 'PMB Immo',
    question: 'Comment fonctionne l’accompagnement immobilier avec PMB Immo ?',
    answer:
      'Nous accompagnons les particuliers et les entreprises dans l’achat, la vente, la location et la rénovation complète de bâtiments résidentiels ou commerciaux à Kinshasa.',
  },
  {
    id: 'faq-4',
    category: 'PMB Transport',
    question: 'Vos services de transport couvrent-ils toute la ville de Kinshasa ?',
    answer:
      'Absolument. PMB Transport assure des déplacements sécurisés et ponctuels pour le transport privé, professionnel et la logistique de marchandises dans l’ensemble des communes de la capitale.',
  },
  {
    id: 'faq-5',
    category: 'Adhésion',
    question: 'Comment devenir membre ou partenaire sur la plateforme PMB ?',
    answer:
      'Il vous suffit de remplir le formulaire d’adhésion en choisissant votre catégorie souhaitée (Membre effectif, Membre bienfaiteur, Membre d\'honneur ou Membre Bénévole), puis de prévisualiser, imprimer ou transmettre votre fiche.',
  },
];

export type { CountryCode } from './worldDialCodes';
import { worldDialCodes } from './worldDialCodes';

export const countryDialCodes = worldDialCodes;

export const geographyData: Record<string, Record<string, string[]>> = {
  Afrique: {
    'République Démocratique du Congo': [
      'Kinshasa',
      'Lubumbashi',
      'Goma',
      'Matadi',
      'Kisangani',
      'Kolwezi',
    ],
    'Congo-Brazzaville': ['Brazzaville', 'Pointe-Noire'],
    'Afrique du Sud': ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban'],
    "Côte d'Ivoire": ['Abidjan', 'Yamoussoukro'],
    Cameroun: ['Douala', 'Yaoundé'],
  },
  Europe: {
    France: ['Paris', 'Lyon', 'Marseille', 'Lille'],
    Belgique: ['Bruxelles', 'Anvers', 'Liège'],
    'Royaume-Uni': ['Londres', 'Manchester'],
  },
  Amérique: {
    'États-Unis': ['Dallas', 'New York', 'Houston', 'Atlanta'],
    Canada: ['Montréal', 'Toronto', 'Ottawa'],
  },
  Asie: {
    Chine: ['Guangzhou', 'Pékin', 'Shanghai'],
    'Émirats Arabes Unis': ['Dubaï', 'Abu Dhabi'],
  },
  Océanie: {
    Australie: ['Sydney', 'Melbourne'],
  },
};

export const kinshasaCommunes: Record<string, string[]> = {
  Bandalungwa: ['Adoula', 'Bisengo', 'Kasa-Vubu', 'Kokolo', 'Lingwala', 'Lumumba', 'Makelele', 'Synkin'],
  Barumbu: ['Bitshakutshaku', 'Bon Marché', 'Funa I', 'Funa II', 'Kapinga Bapu', 'Kasafi', 'Libulu', 'Mozindo', 'Ndolo'],
  Bumbu: ['Diomi', 'Kwango', 'Lieutenant Mbaki', 'Lokoro', 'Lukenie', 'Mai-Ndombe', 'Matadi', 'Mbandaka', 'Mongala', 'Ntomba', 'Ubangi'],
  Gombe: ['Batetela', 'Cliniques', 'Commerce', 'Croix-Rouge', 'Fleuve', 'Gare', 'Golf', 'Haut-Commandement', 'Révolution', 'Socimat'],
  Kalamu: ['Immo-Congo', 'Kauka I', 'Kauka II', 'Kauka III', 'Kimpe', 'Matonge I', 'Matonge II', 'Matonge III', 'Pinzi', 'Yolo-Nord I', 'Yolo-Nord II', 'Yolo-Nord III', 'Yolo-Sud I', 'Yolo-Sud II', 'Yolo-Sud III', 'Yolo-Sud IV'],
  'Kasa-Vubu': ['Anciens Combattants', 'Assossa', 'Katanga', 'Lodja', 'Lubumbashi', 'ONL', 'Salongo'],
  Kimbanseke: ['17 Mai', 'Bahumbu', 'Bianda', 'Boma', 'Disasi', 'Esanga', 'Kikimi', 'Kingasani', 'Kutu', 'Luebo', 'Malonda', 'Maviokele', 'Mikondo', 'Mokali', 'Mpasa I', 'Mpasa II', 'Mpasa III', 'Ngampani', 'Ngandu', 'Ngobila', 'Nsanga', 'Nsumba', 'Sakombi', 'Salongo'],
  Kinshasa: ['Aketi', 'Anunga', 'Boyoma', 'Djombo', 'Kasaï', 'Lufungula', 'Madimba', 'Mongala', 'Ngafani', 'Pende'],
  Kintambo: ['Itimbiri', 'Jamaïque', 'Kilimani', 'Lisala', 'Lubudi', 'Nganda', 'Salongo', 'Tshinkela', 'Wenze'],
  Kisenso: ['17 Mai', 'Amba', 'Bikanga', 'Dingi-Dingi', 'Kabila', 'Kisenso-Gare', 'Kitomesa', 'Libération', 'Mbuku', 'Mission', 'Mujinga', 'Ngomba', 'Nsola', 'Regideso', 'Révolution'],
  Lemba: ['Camp Riche', 'Commercial', 'Echangeur', 'Foire', 'Gombele', 'Kemi', 'Kimpwanza', 'Livulu', 'Madrandele', 'Masano', 'Mbanza-Lemba', 'Molo', 'Salongo Nord', 'Salongo Sud'],
  Limete: ['Agricole', 'Funa', 'Industriel', 'Kingabwa', 'Mateba', 'Mayulu', 'Mombele', 'Mososo', 'Moteurs', 'Ndjili-Kilambu', 'Nzadi', 'Résidentiel', 'Salongo'],
  Lingwala: ['30 Juin', 'CNSS', 'Lufungula', 'Ngunda-Lokombe', 'Paka-Djuma', 'Singa-Mopepe', 'Voix du Peuple', 'Wenze'],
  Makala: ['Bagata', 'Bahumbu', 'Bolima', 'Kabila', 'Kisantu', 'Kwango', 'Lemba-Village', 'Mabulu', 'Malala', 'Mikondo', 'Salongo', 'Selba', 'Uele'],
  Maluku: ['Bita', 'Dumi', 'Kimpoko', 'Kingakati', 'Mai-Ndombe', 'Maluku-Centre', 'Menkao', 'Mbankana', 'Monaco', 'Ngamanzo', 'Yuo'],
  Masina: ['Abattoir', 'Boba', 'Congo', 'Efoloko', 'Imbali', 'Kasai', 'Kimbangu', 'Lokali', 'Mafuta-Kizola', 'Mapela', 'Market', 'Matadi', 'Mazi', 'Nsola', 'Pascal', 'Pelende', 'Petro-Congo', 'Sans-Fil', 'Telecom', 'Tshangu'],
  Matete: ['Anunga', 'Baboma', 'Bateke', 'Bumba', 'Congo', 'De Bonhomme', 'Kinsaku', 'Kunda', 'Kwenge', 'Lokele', 'Maindombe', 'Malemba', 'Mandina', 'Maziba', 'Mongo', 'Mpudi', 'Ngilima', 'Pululu', 'Sumbuka', 'Tomba', 'Viaza', 'Vitamine'],
  'Mont-Ngafula': ['Cité Verte', 'CPK', 'Kimwenza', 'Kindele', 'Lutendele', 'Mama Mobutu', 'Mama Yemo', 'Masanga-Mbila', 'Matadi-Kibala', 'Matadi-Mayo', 'Mazamba', 'Mitendi', 'Mbudi', 'Musangu', 'Ngansele', 'Plateau', 'Vunda-Manenga'],
  Ndjili: ['Quartier 1', 'Quartier 2', 'Quartier 3', 'Quartier 4', 'Quartier 5', 'Quartier 6', 'Quartier 7', 'Quartier 8', 'Quartier 9', 'Quartier 10', 'Quartier 11', 'Quartier 12', 'Quartier 13'],
  Ngaba: ['Baobab', 'Bula-Mbemba', 'Luyi', 'Mateba', 'Mpila', 'Mukelenge'],
  Ngaliema: ['Anciens Combattants', 'Bumba', 'Congo', 'Djelo-Binza', 'GB', 'Joli Parc', 'Kinsuka-Pêcheurs', 'Kunga', 'Lonzo', 'Lubudi', 'Lukusa', 'Ma Campagne', 'Manenga', 'Mfinda', 'Mimosa', 'Musey', 'Ngomba-Kinkusa', 'Pigeon', 'Punza', 'Upn'],
  'Ngiri-Ngiri': ['24 Novembre', 'Assossa', 'Diomi', 'Elengesa', 'Karthoum', 'Petit-Petit', 'Saïo'],
  Nsele: ['Badara', 'Bahumbu', 'Bibwa', 'Buma', 'Dingi-Dingi', 'Kinkole', 'Mikonga', 'Mpasa', 'Mpassa-Maba', 'Nsele-Centre', 'Talangai'],
  Selembao: ['Badiadingi', 'Cité Verte', 'Herady', 'Inga', 'Kalunga', 'Kingù', 'Libération', 'Lubudi', 'Maduda', 'Mbala', 'Molende', 'Muana-Ntunu', 'Ndobe', 'Ngafani', 'Nkulu', 'Pululu-Mbambu'],
};

// Catégories d'adhésion officielles (4 options exclusives)
export const userCategories: string[] = [
  'Membre effectif',
  'Membre bienfaiteur',
  "Membre d'honneur",
  'Membre Bénévole',
];

export const PMB_MEMBERSHIP_PAYMENT_INFO = {
  minAmountUsd: 20,
  presetAmountsUsd: [20, 30, 50, 100] as const,
  mobileMoneyNumbers: [
    { id: 'orange_money', networkName: 'Orange Money', number: '+243 896 660 558' },
    { id: 'airtel_money', networkName: 'Airtel Money', number: '+243 962 300 003' },
    { id: 'mpesa', networkName: 'M-Pesa', number: '+243 83 39 93 994' },
  ],
  bankTransfer: {
    accountNumber: '700200168688373',
    beneficiaryName: 'Mbozi Beloti Prisca',
  },
} as const;

export interface FondationProjectItem {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  summary: string;
  status: 'En cours' | 'Planifié' | 'Réalisé';
}

export interface CatalogArticleItem {
  id: string;
  branchId: 'pmb-shop' | 'pmb-store';
  branchName: 'PMB Shop' | 'PMB Store';
  title: string;
  priceLabel: string;
  description: string;
  inStock: boolean;
}

export const DEFAULT_FONDATION_PROJECTS: FondationProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Dotation de 250 kits scolaires & manuels à Matete et Bandalungwa',
    dateLabel: 'Novembre 2026',
    location: 'Kinshasa (Matete & Bandal)',
    summary:
      'Appui direct aux enfants vulnérables et orphelinats partenaires pour garantir la continuité scolaire.',
    status: 'En cours',
  },
  {
    id: 'proj-2',
    title: 'Atelier d’insertion numérique et entrepreneuriat des jeunes',
    dateLabel: 'Décembre 2026',
    location: 'Bandal Synkin — Kinshasa',
    summary:
      'Formation pratique aux outils numériques, gestion commerciale et micro-projets communautaires.',
    status: 'Planifié',
  },
  {
    id: 'proj-3',
    title: 'Campagne solidaire d’aide alimentaire de fin d’année',
    dateLabel: 'Décembre 2026',
    location: 'Kinshasa, RDC',
    summary:
      'Distribution de vivres de première nécessité et d’eau potable en partenariat avec PMB Store.',
    status: 'Planifié',
  },
];

export const DEFAULT_CATALOG_ARTICLES: CatalogArticleItem[] = [
  {
    id: 'art-1',
    branchId: 'pmb-shop',
    branchName: 'PMB Shop',
    title: 'Pack Revendeur Unités Multi-Opérateurs (Vodacom, Airtel, Orange, Africell)',
    priceLabel: '50 $ USD',
    description: 'Recharge grossiste multi-réseaux avec marge revendeur et assistance immédiate.',
    inStock: true,
  },
  {
    id: 'art-2',
    branchId: 'pmb-shop',
    branchName: 'PMB Shop',
    title: 'Smartphone 4G/5G Neuf + Accessoires Certifiés & Garantie Kinshasa',
    priceLabel: '145 $ USD',
    description: 'Appareil scellé livré avec coque, verre trempé et chargeur rapide d’origine.',
    inStock: true,
  },
  {
    id: 'art-3',
    branchId: 'pmb-store',
    branchName: 'PMB Store',
    title: 'Lot de 20 Packs Eau Vive Purifiée + Jus Naturels Frais (Événements & Hôtels)',
    priceLabel: '65 $ USD',
    description: 'Livraison directe à Kinshasa pour salles de fête, conférences et supermarchés.',
    inStock: true,
  },
  {
    id: 'art-4',
    branchId: 'pmb-store',
    branchName: 'PMB Store',
    title: 'Panier Approvisionnement Denrées Alimentaires & Import-Export',
    priceLabel: '90 $ USD',
    description: 'Assortiment de produits de première nécessité conditionnés pour ménages et commerces.',
    inStock: true,
  },
];



