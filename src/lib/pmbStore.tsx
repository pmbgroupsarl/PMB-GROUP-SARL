import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  CatalogArticleItem,
  DEFAULT_CATALOG_ARTICLES,
  DEFAULT_FONDATION_PROJECTS,
  FAQItem,
  FondationProjectItem,
  PMB_BRANCHES,
  pmbFaqData,
} from '../data/pmbData';
import { MembershipPaymentTicket } from './membershipPayment';

export type SubscriptionStatus =
  | 'En attente de validation'
  | 'Actif'
  | 'Expire bientôt'
  | 'Expiré'
  | 'Don ponctuel confirmé';

export type OrderStatus = 'En attente' | 'Confirmée' | 'Livrée / Terminée';

export interface MemberAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

export interface MembershipSubscriberRecord {
  id: string;
  dossierId: string;
  kind: 'member' | 'visitor';
  accountEmail?: string;
  branchId: string;
  branchName: string;
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  subscriptionStatus: SubscriptionStatus;
  expiresAtIso: string | null;
  expiresAtLabel: string;
  lastReminderAtLabel: string | null;
  paymentTicket: MembershipPaymentTicket | null;
  createdAtLabel: string;
  extraRows?: Array<{ label: string; value: string }>;
  commitmentText?: string;
  photoDataUrl?: string | null;
}

export interface MemberNotification {
  id: string;
  memberEmail: string;
  memberName: string;
  branchName: string;
  title: string;
  message: string;
  type: 'renewal_auto' | 'admin_reminder' | 'validation';
  createdAtLabel: string;
  read: boolean;
}

export interface BranchOrderRecord {
  id: string;
  reference: string;
  branchId: string;
  branchName: string;
  customerName: string;
  customerContact: string;
  serviceOrArticle: string;
  amountLabel: string;
  status: OrderStatus;
  createdAtLabel: string;
}

export interface NewsActuItem {
  id: string;
  branchId: string;
  branchName: string;
  type: 'Actualité' | 'Webinaire' | 'Événement' | 'Logistique' | 'Action Sociale';
  title: string;
  dateLabel: string;
  location: string;
  summary: string;
  rsvpCount: number;
}

export interface CmsContentState {
  branchServices: Record<string, string[]>;
  fondationProjects: FondationProjectItem[];
  catalogArticles: CatalogArticleItem[];
  faqs: FAQItem[];
  newsActus: NewsActuItem[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  preferredBranch: string;
  createdAtLabel: string;
}

const STORAGE_KEYS = {
  accounts: 'pmb_member_accounts_v2',
  currentEmail: 'pmb_current_member_email_v2',
  memberships: 'pmb_memberships_records_v2',
  notifications: 'pmb_member_notifications_v2',
  orders: 'pmb_branch_orders_v2',
  cms: 'pmb_cms_content_v2',
  newsletter: 'pmb_newsletter_subscribers_v2',
} as const;

function buildDefaultBranchServices(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const branch of PMB_BRANCHES) {
    map[branch.id] = [...branch.services];
  }
  return map;
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatFrDateFromIso(iso: string | null): string {
  if (!iso) return 'Ponctuel';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const DEFAULT_ACCOUNTS: MemberAccount[] = [
  {
    id: 'acc-1',
    fullName: 'MBOZI BELOTI PRISCA',
    email: 'mboziprisca37@gmail.com',
    phone: '+243 896 660 558',
    password: 'pmb2026',
    createdAt: '2026-11-19T12:00:00.000Z',
  },
  {
    id: 'acc-2',
    fullName: 'Patrick Kabasele',
    email: 'patrick.kabasele@pmb-demo.cd',
    phone: '+243 812 345 678',
    password: 'pmb2026',
    createdAt: '2026-10-25T09:30:00.000Z',
  },
  {
    id: 'acc-3',
    fullName: 'Sarah Ngalula',
    email: 'sarah.ngalula@pmb-demo.cd',
    phone: '+243 998 112 233',
    password: 'pmb2026',
    createdAt: '2026-10-01T14:00:00.000Z',
  },
];

function createDefaultMemberships(): MembershipSubscriberRecord[] {
  const expSoonIso = isoDaysFromNow(5);
  const expiredIso = isoDaysFromNow(-4);
  const validLongIso = isoDaysFromNow(28);

  return [
    {
      id: 'mem-1',
      dossierId: 'PMB-FOND-2026-1119-45',
      kind: 'member',
      accountEmail: 'mboziprisca37@gmail.com',
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      fullName: 'MBOZI BELOTI PRISCA',
      gender: 'Féminin',
      birthDate: '1996-05-22',
      birthPlace: 'Q. Kwenge, C. Matete, Kinshasa, République Démocratique du Congo, Afrique',
      address: 'C. Matete, Q. Kwenge, Avenue Sous-Région, N° 33',
      phone: '+243 896 660 558',
      email: 'mboziprisca37@gmail.com',
      category: 'Membre effectif',
      subscriptionStatus: 'En attente de validation',
      expiresAtIso: validLongIso,
      expiresAtLabel: formatFrDateFromIso(validLongIso),
      lastReminderAtLabel: null,
      createdAtLabel: '19/11/2026',
      commitmentText:
        'Je soussigné(e), certifie que les renseignements fournis dans cette fiche sont exacts. Je sollicite mon adhésion à PMB Fondation et m’engage à respecter ses statuts, son règlement d’ordre intérieur, ses valeurs ainsi que les décisions régulièrement prises par ses organes. Fait à Kinshasa, le 19/11/2026.',
      extraRows: [
        { label: 'État civil', value: 'Célibataire' },
        { label: 'Nationalité', value: 'Congolaise (RDC)' },
        { label: 'Profession', value: 'Libérale' },
        { label: 'E-mail', value: 'mboziprisca37@gmail.com' },
        { label: "Contact d'urgence", value: '+243 833 993 994' },
        { label: 'Domaine / Commission', value: 'Logistique, sensibilisation & appui de terrain' },
        { label: "Motif d'adhésion", value: 'Aider les enfants dans le besoin' },
      ],
      paymentTicket: {
        ticketNumber: 'TKT-PMB-20261119-6UAX',
        issuedAt: '2026-11-19T13:05:00.000Z',
        issuedAtLabel: '19/11/2026 13:05',
        candidateName: 'MBOZI BELOTI PRISCA',
        category: 'Membre effectif',
        paymentMethod: 'mobile_money',
        paymentMethodLabel: 'Mobile Money',
        channelUsedLabel: 'Orange Money — +243 896 660 558',
        destinationAccount: '+243 896 660 558',
        amountUsd: 50,
        transactionRef: 'Mbozi Prisca',
        proofFileName: null,
        status:
          'Preuve de paiement enregistrée (en attente de validation par les organes compétents)',
      },
    },
    {
      id: 'mem-2',
      dossierId: 'PMB-FOND-2026-1025-12',
      kind: 'member',
      accountEmail: 'patrick.kabasele@pmb-demo.cd',
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      fullName: 'Patrick Kabasele',
      gender: 'Masculin',
      birthDate: '1989-03-14',
      birthPlace: 'C. Kalamu, Kinshasa, République Démocratique du Congo, Afrique',
      address: 'C. Bandalungwa, Q. Synkin, Av. Kisangani, N° 18',
      phone: '+243 812 345 678',
      email: 'patrick.kabasele@pmb-demo.cd',
      category: 'Membre effectif',
      subscriptionStatus: 'Expire bientôt',
      expiresAtIso: expSoonIso,
      expiresAtLabel: formatFrDateFromIso(expSoonIso),
      lastReminderAtLabel: '18/11/2026 09:30',
      createdAtLabel: '25/10/2026',
      paymentTicket: {
        ticketNumber: 'TKT-PMB-20261025-4K9B',
        issuedAt: '2026-10-25T09:35:00.000Z',
        issuedAtLabel: '25/10/2026 09:35',
        candidateName: 'Patrick Kabasele',
        category: 'Membre effectif',
        paymentMethod: 'mobile_money',
        paymentMethodLabel: 'Mobile Money',
        channelUsedLabel: 'M-Pesa — +243 83 39 93 994',
        destinationAccount: '+243 83 39 93 994',
        amountUsd: 25,
        transactionRef: 'MP-261025-8841',
        proofFileName: null,
        status:
          'Preuve de paiement enregistrée (en attente de validation par les organes compétents)',
      },
    },
    {
      id: 'mem-3',
      dossierId: 'PMB-EVT-2026-1001-09',
      kind: 'member',
      accountEmail: 'sarah.ngalula@pmb-demo.cd',
      branchId: 'pmb-event',
      branchName: 'PMB Event',
      fullName: 'Sarah Ngalula',
      gender: 'Féminin',
      birthDate: '1993-08-19',
      birthPlace: 'C. Gombe, Kinshasa, République Démocratique du Congo, Afrique',
      address: 'C. Ngaliema, Q. Joli Parc, Av. des Flamboyants, N° 07',
      phone: '+243 998 112 233',
      email: 'sarah.ngalula@pmb-demo.cd',
      category: 'Membre effectif',
      subscriptionStatus: 'Expiré',
      expiresAtIso: expiredIso,
      expiresAtLabel: formatFrDateFromIso(expiredIso),
      lastReminderAtLabel: '16/11/2026 14:15',
      createdAtLabel: '01/10/2026',
      paymentTicket: {
        ticketNumber: 'TKT-PMB-20261001-9Z2P',
        issuedAt: '2026-10-01T14:10:00.000Z',
        issuedAtLabel: '01/10/2026 14:10',
        candidateName: 'Sarah Ngalula',
        category: 'Membre effectif',
        paymentMethod: 'card_visa_mastercard',
        paymentMethodLabel: 'Mastercard / Visa',
        channelUsedLabel: 'Mastercard / Visa (•••• 4491)',
        destinationAccount: 'Mastercard / Visa •••• 4491 (PMB GROUP SARL)',
        amountUsd: 30,
        transactionRef: 'AUTH-99104E',
        proofFileName: null,
        status:
          'Preuve de paiement enregistrée (en attente de validation par les organes compétents)',
      },
    },
    {
      id: 'mem-4',
      dossierId: 'PMB-VIS-2026-1118-31',
      kind: 'visitor',
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      fullName: 'Jean-Luc Tshibangu',
      gender: 'Non précisé',
      birthDate: '—',
      birthPlace: 'Kinshasa, RDC',
      address: 'C. Limete, Q. Résidentiel, Kinshasa',
      phone: '+243 834 551 090',
      email: 'jltshibangu@exemple.cd',
      category: 'Visiteur — Aide ponctuelle',
      subscriptionStatus: 'Don ponctuel confirmé',
      expiresAtIso: null,
      expiresAtLabel: 'Contribution unique',
      lastReminderAtLabel: null,
      createdAtLabel: '18/11/2026',
      paymentTicket: {
        ticketNumber: 'TKT-PMB-20261118-VIS1',
        issuedAt: '2026-11-18T16:45:00.000Z',
        issuedAtLabel: '18/11/2026 16:45',
        candidateName: 'Jean-Luc Tshibangu',
        category: 'Visiteur — Aide ponctuelle',
        paymentMethod: 'mobile_money',
        paymentMethodLabel: 'Mobile Money',
        channelUsedLabel: 'Airtel Money — +243 962 300 003',
        destinationAccount: '+243 962 300 003',
        amountUsd: 30,
        transactionRef: 'AM-261118-3302',
        proofFileName: null,
        status:
          'Preuve de paiement enregistrée (en attente de validation par les organes compétents)',
      },
    },
    {
      id: 'mem-5',
      dossierId: 'PMB-FOND-2026-1115-04',
      kind: 'member',
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      fullName: 'Aline Mukendi',
      gender: 'Féminin',
      birthDate: '1986-11-04',
      birthPlace: 'Lubumbashi, République Démocratique du Congo, Afrique',
      address: 'C. Gombe, Q. Golf, Av. Batetela, N° 22',
      phone: '+243 897 220 441',
      email: 'aline.mukendi@exemple.cd',
      category: 'Membre bienfaiteur',
      subscriptionStatus: 'Actif',
      expiresAtIso: validLongIso,
      expiresAtLabel: formatFrDateFromIso(validLongIso),
      lastReminderAtLabel: null,
      createdAtLabel: '15/11/2026',
      paymentTicket: {
        ticketNumber: 'TKT-PMB-20261115-BNF2',
        issuedAt: '2026-11-15T11:20:00.000Z',
        issuedAtLabel: '15/11/2026 11:20',
        candidateName: 'Aline Mukendi',
        category: 'Membre bienfaiteur',
        paymentMethod: 'bank_transfer',
        paymentMethodLabel: 'Virement Bancaire',
        channelUsedLabel:
          'Virement Bancaire — Compte 700200168688373 / Bénéficiaire : Mbozi Beloti Prisca',
        destinationAccount: '700200168688373 — Mbozi Beloti Prisca',
        amountUsd: 100,
        transactionRef: 'VIR-20261115-088',
        proofFileName: null,
        status:
          'Preuve de paiement enregistrée (en attente de validation par les organes compétents)',
      },
    },
  ];
}

const DEFAULT_NOTIFICATIONS: MemberNotification[] = [
  {
    id: 'notif-1',
    memberEmail: 'patrick.kabasele@pmb-demo.cd',
    memberName: 'Patrick Kabasele',
    branchName: 'PMB Fondation',
    title: 'Rappel automatique de réabonnement (J-5)',
    message:
      'Votre cotisation de Membre effectif arrive à échéance dans 5 jours. Renouvelez dès maintenant (à partir de 20 $ USD) pour conserver vos droits actifs.',
    type: 'renewal_auto',
    createdAtLabel: '19/11/2026 08:00',
    read: false,
  },
  {
    id: 'notif-2',
    memberEmail: 'sarah.ngalula@pmb-demo.cd',
    memberName: 'Sarah Ngalula',
    branchName: 'PMB Event',
    title: 'Abonnement expiré — Renouvellement requis',
    message:
      'Votre période de cotisation Membre effectif est arrivée à échéance. Effectuez votre réabonnement via Mobile Money, Carte ou Virement.',
    type: 'renewal_auto',
    createdAtLabel: '18/11/2026 09:15',
    read: false,
  },
  {
    id: 'notif-3',
    memberEmail: 'mboziprisca37@gmail.com',
    memberName: 'MBOZI BELOTI PRISCA',
    branchName: 'PMB Fondation',
    title: 'Dossier PMB-FOND-2026-1119-45 enregistré',
    message:
      'Votre fiche d’adhésion et votre preuve de paiement (50.00 $ USD via Orange Money) sont en cours de vérification par le secrétariat.',
    type: 'validation',
    createdAtLabel: '19/11/2026 13:06',
    read: false,
  },
];

const DEFAULT_ORDERS: BranchOrderRecord[] = [
  {
    id: 'ord-1',
    reference: 'CMD-EVT-2026-014',
    branchId: 'pmb-event',
    branchName: 'PMB Event',
    customerName: 'Église Nouvelle Alliance Gombe',
    customerContact: '+243 815 440 210',
    serviceOrArticle: 'Location écran géant LED P4.81 + Sonorisation Line Array (3 jours)',
    amountLabel: '1 850 $ USD',
    status: 'Confirmée',
    createdAtLabel: '18/11/2026',
  },
  {
    id: 'ord-2',
    reference: 'CMD-STR-2026-089',
    branchId: 'pmb-store',
    branchName: 'PMB Store',
    customerName: 'Hôtel Fleuve Congo Services',
    customerContact: '+243 894 112 700',
    serviceOrArticle: '40 Packs Eau Vive + 15 Cartons Jus Naturels Frais',
    amountLabel: '320 $ USD',
    status: 'En attente',
    createdAtLabel: '19/11/2026',
  },
  {
    id: 'ord-3',
    reference: 'CMD-TRS-2026-052',
    branchId: 'pmb-transport',
    branchName: 'PMB Transport',
    customerName: 'Établissements Kongo Négoce',
    customerContact: '+243 833 009 112',
    serviceOrArticle: 'Fret Aérien Express + Dédouanement Kinshasa (Colis 85 kg)',
    amountLabel: '540 $ USD',
    status: 'En attente',
    createdAtLabel: '19/11/2026',
  },
  {
    id: 'ord-4',
    reference: 'CMD-SHP-2026-103',
    branchId: 'pmb-shop',
    branchName: 'PMB Shop',
    customerName: 'Kiosque Bandal Centre',
    customerContact: '+243 971 224 890',
    serviceOrArticle: 'Pack Revendeur Unités Multi-Opérateurs (Vodacom / Orange / Airtel)',
    amountLabel: '250 $ USD',
    status: 'Livrée / Terminée',
    createdAtLabel: '17/11/2026',
  },
  {
    id: 'ord-5',
    reference: 'CMD-IMM-2026-019',
    branchId: 'pmb-immobilier',
    branchName: 'PMB Immo',
    customerName: 'Dr. Kabongo Lukusa',
    customerContact: '+243 821 778 901',
    serviceOrArticle: 'Rénovation complète toiture, électricité et staff — Villa Ngaliema',
    amountLabel: 'Sur devis validé',
    status: 'Confirmée',
    createdAtLabel: '16/11/2026',
  },
];

const DEFAULT_NEWS_ACTUS: NewsActuItem[] = [
  {
    id: 'ag-1',
    branchId: 'pmb-transport',
    branchName: 'PMB Transport',
    type: 'Webinaire',
    title: 'Webinaire Import-Export : Liaisons Paquebot Matadi & Fret Aérien Kinshasa',
    dateLabel: '28 Nov 2026 · 14h00 (Kinshasa)',
    location: 'En ligne & Siège Bandal Synkin',
    summary:
      'Présentation des corridors maritimes par paquebot, dédouanement et expéditions aériennes express pour les importateurs congolais.',
    rsvpCount: 34,
  },
  {
    id: 'ag-2',
    branchId: 'pmb-event',
    branchName: 'PMB Event',
    type: 'Événement',
    title: 'Démonstration Technique Écrans Géants LED Outdoor & Régie Scénique',
    dateLabel: '05 Déc 2026 · 16h30',
    location: 'Bandal Synkin — Arrêt Station Tshibangu',
    summary:
      'Session ouverte aux organisateurs de concerts, conférences et églises : calibrage LED haute luminosité, sonorisation et structures.',
    rsvpCount: 51,
  },
  {
    id: 'ag-3',
    branchId: 'pmb-fondation',
    branchName: 'PMB Fondation',
    type: 'Action Sociale',
    title: 'Campagne d’Adhésion & Dotation Scolaire de Fin d’Année',
    dateLabel: '12 Déc 2026 · 09h30',
    location: 'Kinshasa — Communes partenaires',
    summary:
      'Accueil des nouveaux membres effectifs, bienfaiteurs, d’honneur et bénévoles selon les Conditions Générales d’Adhésion PMB Fondation.',
    rsvpCount: 68,
  },
  {
    id: 'ag-4',
    branchId: 'pmb-store',
    branchName: 'PMB Store',
    type: 'Logistique',
    title: 'Ouverture des Contrats Grossistes Eau Vive & Jus Naturels (Fin d’Année)',
    dateLabel: '18 Déc 2026 · 08h30',
    location: 'Entrepôt PMB Store, Kinshasa',
    summary:
      'Tarification préférentielle pour hôtels, supermarchés, salles de fête et revendeurs sur les packs Eau Vive et denrées de base.',
    rsvpCount: 27,
  },
];

const DEFAULT_CMS: CmsContentState = {
  branchServices: buildDefaultBranchServices(),
  fondationProjects: DEFAULT_FONDATION_PROJECTS,
  catalogArticles: DEFAULT_CATALOG_ARTICLES,
  faqs: pmbFaqData,
  newsActus: DEFAULT_NEWS_ACTUS,
};

function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage plein ou indisponible
  }
}

interface PmbStoreContextValue {
  accounts: MemberAccount[];
  currentMember: MemberAccount | null;
  memberships: MembershipSubscriberRecord[];
  notifications: MemberNotification[];
  orders: BranchOrderRecord[];
  cms: CmsContentState;
  newsletterSubscribers: NewsletterSubscriber[];

  subscribeNewsletter: (
    email: string,
    preferredBranch?: string
  ) => { ok: boolean; error?: string; subscriber?: NewsletterSubscriber };

  loginMember: (identifier: string, password: string) => { ok: boolean; error?: string };
  quickLoginDemoMember: (email: string) => void;
  registerMemberAccount: (params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: boolean; error?: string; account?: MemberAccount };
  changeMemberPassword: (
    currentPassword: string,
    newPassword: string
  ) => { ok: boolean; error?: string };
  logoutMember: () => void;

  addMembershipRecord: (
    record: Omit<MembershipSubscriberRecord, 'id' | 'lastReminderAtLabel'>
  ) => MembershipSubscriberRecord;
  adminCreateMember: (params: {
    branchId: string;
    fullName: string;
    gender: string;
    email: string;
    phone: string;
    category: string;
    address: string;
    birthDate?: string;
    birthPlace?: string;
    subscriptionStatus: SubscriptionStatus;
    initialPassword?: string;
    initialAmountUsd?: number;
  }) => { ok: boolean; error?: string; record?: MembershipSubscriberRecord };
  validateMembership: (id: string) => void;
  sendRenewalReminder: (id: string) => void;
  renewMemberSubscription: (
    membershipId: string,
    ticket: MembershipPaymentTicket
  ) => void;
  markNotificationRead: (notifId: string) => void;

  addOrder: (order: Omit<BranchOrderRecord, 'id' | 'reference' | 'createdAtLabel'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  addBranchService: (branchId: string, serviceText: string) => void;
  updateBranchService: (branchId: string, index: number, nextText: string) => void;
  deleteBranchService: (branchId: string, index: number) => void;

  addFondationProject: (project: Omit<FondationProjectItem, 'id'>) => void;
  updateFondationProject: (project: FondationProjectItem) => void;
  deleteFondationProject: (id: string) => void;

  addCatalogArticle: (article: Omit<CatalogArticleItem, 'id'>) => void;
  updateCatalogArticle: (article: CatalogArticleItem) => void;
  deleteCatalogArticle: (id: string) => void;

  addFaqItem: (faq: Omit<FAQItem, 'id'>) => void;
  updateFaqItem: (faq: FAQItem) => void;
  deleteFaqItem: (id: string) => void;

  addNewsActu: (actu: Omit<NewsActuItem, 'id' | 'rsvpCount'>) => void;
  updateNewsActu: (actu: NewsActuItem) => void;
  deleteNewsActu: (id: string) => void;
  incrementNewsRsvp: (id: string) => void;

  resetAllDemoData: () => void;
}

const PmbStoreContext = createContext<PmbStoreContextValue | null>(null);

export function PmbStoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<MemberAccount[]>(() =>
    readJsonStorage(STORAGE_KEYS.accounts, DEFAULT_ACCOUNTS)
  );
  const [currentEmail, setCurrentEmail] = useState<string | null>(() =>
    readJsonStorage<string | null>(STORAGE_KEYS.currentEmail, null)
  );
  const [memberships, setMemberships] = useState<MembershipSubscriberRecord[]>(() =>
    readJsonStorage(STORAGE_KEYS.memberships, createDefaultMemberships())
  );
  const [notifications, setNotifications] = useState<MemberNotification[]>(() =>
    readJsonStorage(STORAGE_KEYS.notifications, DEFAULT_NOTIFICATIONS)
  );
  const [orders, setOrders] = useState<BranchOrderRecord[]>(() =>
    readJsonStorage(STORAGE_KEYS.orders, DEFAULT_ORDERS)
  );
  const [cms, setCms] = useState<CmsContentState>(() => {
    const stored = readJsonStorage<Partial<CmsContentState>>(STORAGE_KEYS.cms, DEFAULT_CMS);
    return {
      branchServices: stored.branchServices ?? DEFAULT_CMS.branchServices,
      fondationProjects: stored.fondationProjects ?? DEFAULT_CMS.fondationProjects,
      catalogArticles: stored.catalogArticles ?? DEFAULT_CMS.catalogArticles,
      faqs: stored.faqs ?? DEFAULT_CMS.faqs,
      newsActus: stored.newsActus ?? DEFAULT_CMS.newsActus,
    };
  });
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>(() =>
    readJsonStorage(STORAGE_KEYS.newsletter, [])
  );

  useEffect(() => writeJsonStorage(STORAGE_KEYS.accounts, accounts), [accounts]);
  useEffect(() => writeJsonStorage(STORAGE_KEYS.currentEmail, currentEmail), [currentEmail]);
  useEffect(() => writeJsonStorage(STORAGE_KEYS.memberships, memberships), [memberships]);
  useEffect(() => writeJsonStorage(STORAGE_KEYS.notifications, notifications), [notifications]);
  useEffect(() => writeJsonStorage(STORAGE_KEYS.orders, orders), [orders]);
  useEffect(() => writeJsonStorage(STORAGE_KEYS.cms, cms), [cms]);
  useEffect(
    () => writeJsonStorage(STORAGE_KEYS.newsletter, newsletterSubscribers),
    [newsletterSubscribers]
  );

  const subscribeNewsletter = (email: string, preferredBranch = 'Toutes les branches') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: 'Veuillez saisir une adresse e-mail valide.' };
    }
    const exists = newsletterSubscribers.some(
      (item) => item.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      return {
        ok: false,
        error: 'Cette adresse e-mail est déjà inscrite aux actualités de PMB Group.',
      };
    }
    const created: NewsletterSubscriber = {
      id: `news-${Date.now()}`,
      email: cleanEmail,
      preferredBranch: preferredBranch.trim() || 'Toutes les branches',
      createdAtLabel: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
    setNewsletterSubscribers((prev) => [created, ...prev]);
    return { ok: true, subscriber: created };
  };

  const currentMember = currentEmail
    ? accounts.find((a) => a.email.toLowerCase() === currentEmail.toLowerCase()) ?? null
    : null;

  const loginMember = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const found = accounts.find(
      (a) =>
        a.email.toLowerCase() === cleanId ||
        (cleanDigits.length >= 8 && a.phone.replace(/\D/g, '').endsWith(cleanDigits.slice(-9)))
    );
    if (!found) {
      return { ok: false, error: 'Aucun compte trouvé avec cet e-mail ou numéro.' };
    }
    if (found.password !== password) {
      return { ok: false, error: 'Mot de passe incorrect.' };
    }
    setCurrentEmail(found.email);
    return { ok: true };
  };

  const quickLoginDemoMember = (email: string) => {
    setCurrentEmail(email);
  };

  const registerMemberAccount = (params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: 'Adresse e-mail invalide.' };
    }
    if (params.fullName.trim().length < 2) {
      return { ok: false, error: 'Veuillez saisir votre nom complet.' };
    }
    if (params.password.length < 4) {
      return { ok: false, error: 'Le mot de passe doit comporter au moins 4 caractères.' };
    }
    const exists = accounts.some((a) => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { ok: false, error: 'Un compte existe déjà avec cet e-mail. Connectez-vous.' };
    }
    const newAcc: MemberAccount = {
      id: `acc-${Date.now()}`,
      fullName: params.fullName.trim(),
      email: cleanEmail,
      phone: params.phone.trim() || '+243',
      password: params.password,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [newAcc, ...prev]);
    setCurrentEmail(newAcc.email);
    return { ok: true, account: newAcc };
  };

  const changeMemberPassword = (currentPassword: string, newPassword: string) => {
    if (!currentMember) {
      return { ok: false, error: 'Aucune session membre active.' };
    }
    if (currentPassword !== currentMember.password) {
      return { ok: false, error: 'Le mot de passe actuel est incorrect.' };
    }
    if (newPassword.length < 4) {
      return {
        ok: false,
        error: 'Le nouveau mot de passe doit contenir au moins 4 caractères.',
      };
    }
    if (newPassword === currentPassword) {
      return {
        ok: false,
        error: 'Le nouveau mot de passe doit être différent de l’actuel.',
      };
    }
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === currentMember.id ? { ...acc, password: newPassword } : acc))
    );
    return { ok: true };
  };

  const logoutMember = () => setCurrentEmail(null);

  const addMembershipRecord = (
    record: Omit<MembershipSubscriberRecord, 'id' | 'lastReminderAtLabel'>
  ): MembershipSubscriberRecord => {
    const created: MembershipSubscriberRecord = {
      ...record,
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      lastReminderAtLabel: null,
    };
    setMemberships((prev) => [created, ...prev]);

    if (created.kind === 'member' && created.accountEmail) {
      const nowLabel = new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          memberEmail: created.accountEmail!,
          memberName: created.fullName,
          branchName: created.branchName,
          title: `Dossier ${created.dossierId} enregistré (${created.category})`,
          message: created.paymentTicket
            ? `Votre preuve de paiement de ${created.paymentTicket.amountUsd.toFixed(
                2
              )} $ USD (${created.paymentTicket.channelUsedLabel}) a été enregistrée. Un rappel automatique sera émis avant la date d'échéance.`
            : `Votre adhésion (${created.category}) pour ${created.branchName} a bien été enregistrée.`,
          type: 'validation',
          createdAtLabel: nowLabel,
          read: false,
        },
        ...prev,
      ]);
    }
    return created;
  };

  const adminCreateMember = (params: {
    branchId: string;
    fullName: string;
    gender: string;
    email: string;
    phone: string;
    category: string;
    address: string;
    birthDate?: string;
    birthPlace?: string;
    subscriptionStatus: SubscriptionStatus;
    initialPassword?: string;
    initialAmountUsd?: number;
  }) => {
    const cleanName = params.fullName.trim();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPhone = params.phone.trim();

    if (cleanName.length < 2) {
      return { ok: false, error: 'Le nom complet doit contenir au moins 2 caractères.' };
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: 'Veuillez saisir une adresse e-mail valide.' };
    }
    if (cleanPhone.length < 6) {
      return { ok: false, error: 'Veuillez saisir un numéro de téléphone valide.' };
    }

    const branch = PMB_BRANCHES.find((b) => b.id === params.branchId) ?? PMB_BRANCHES[0];
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    const branchCodeMap: Record<string, string> = {
      'pmb-fondation': 'FOND',
      'pmb-shop': 'SHOP',
      'pmb-event': 'EVT',
      'pmb-immobilier': 'IMM',
      'pmb-store': 'STR',
      'pmb-transport': 'TRS',
    };
    const branchCode = branchCodeMap[branch.id] ?? 'PMB';
    const dossierId = `PMB-${branchCode}-${y}-${m}${d}-${sec}`;

    let expIso: string | null = isoDaysFromNow(30);
    if (params.subscriptionStatus === 'Expire bientôt') {
      expIso = isoDaysFromNow(5);
    } else if (params.subscriptionStatus === 'Expiré') {
      expIso = isoDaysFromNow(-3);
    } else if (params.subscriptionStatus === 'Don ponctuel confirmé') {
      expIso = null;
    }

    const createdAtLabel = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const nowTimeLabel = now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const amountUsd =
      typeof params.initialAmountUsd === 'number' && params.initialAmountUsd >= 20
        ? Math.round(params.initialAmountUsd * 100) / 100
        : null;

    const paymentTicket: MembershipPaymentTicket | null = amountUsd
      ? {
          ticketNumber: `TKT-ADM-${y}${m}${d}-${sec}`,
          issuedAt: now.toISOString(),
          issuedAtLabel: nowTimeLabel,
          candidateName: cleanName,
          category: params.category,
          paymentMethod: 'mobile_money',
          paymentMethodLabel: 'Enregistrement Administrateur',
          channelUsedLabel: 'Guichet Administration PMB',
          destinationAccount: branch.name,
          amountUsd,
          transactionRef: `ADM-${Date.now().toString().slice(-6)}`,
          proofFileName: null,
          status:
            'Preuve de paiement enregistrée (en attente de validation par les organes compétents)',
        }
      : null;

    const accountPassword =
      params.initialPassword && params.initialPassword.trim().length >= 4
        ? params.initialPassword.trim()
        : 'pmb2026';

    const existingAccount = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!existingAccount) {
      const newAcc: MemberAccount = {
        id: `acc-${Date.now()}`,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: accountPassword,
        createdAt: now.toISOString(),
      };
      setAccounts((prev) => [newAcc, ...prev]);
    }

    const createdRecord: MembershipSubscriberRecord = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      dossierId,
      kind: 'member',
      accountEmail: cleanEmail,
      branchId: branch.id,
      branchName: branch.name,
      fullName: cleanName,
      gender: params.gender || 'Non précisé',
      birthDate: params.birthDate?.trim() || '—',
      birthPlace: params.birthPlace?.trim() || 'Kinshasa, RDC',
      address: params.address.trim() || 'Kinshasa, RDC',
      phone: cleanPhone,
      email: cleanEmail,
      category: params.category,
      subscriptionStatus: params.subscriptionStatus,
      expiresAtIso: expIso,
      expiresAtLabel: formatFrDateFromIso(expIso),
      lastReminderAtLabel: null,
      paymentTicket,
      createdAtLabel,
    };

    setMemberships((prev) => [createdRecord, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-adm-${Date.now()}`,
        memberEmail: cleanEmail,
        memberName: cleanName,
        branchName: branch.name,
        title: `Compte & dossier ${dossierId} créés par l'administration`,
        message: `Votre adhésion (${params.category}) pour ${branch.name} est enregistrée avec le statut « ${params.subscriptionStatus} ».${
          !existingAccount
            ? ` Mot de passe initial : ${accountPassword} (modifiable dans votre Espace Membre).`
            : ''
        }`,
        type:
          params.subscriptionStatus === 'Expire bientôt' || params.subscriptionStatus === 'Expiré'
            ? 'renewal_auto'
            : 'validation',
        createdAtLabel: nowTimeLabel,
        read: false,
      },
      ...prev,
    ]);

    return { ok: true, record: createdRecord };
  };

  const validateMembership = (id: string) => {
    const nextExpIso = isoDaysFromNow(30);
    const nextExpLabel = formatFrDateFromIso(nextExpIso);
    const nowLabel = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setMemberships((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (m.accountEmail || m.email) {
          const targetEmail = (m.accountEmail || m.email).toLowerCase();
          setNotifications((nPrev) => [
            {
              id: `notif-val-${Date.now()}`,
              memberEmail: targetEmail,
              memberName: m.fullName,
              branchName: m.branchName,
              title: `Adhésion validée — ${m.branchName}`,
              message: `Votre dossier ${m.dossierId} (${m.category}) a été officiellement validé par l'administration. Échéance active : ${nextExpLabel}.`,
              type: 'validation',
              createdAtLabel: nowLabel,
              read: false,
            },
            ...nPrev,
          ]);
        }
        return {
          ...m,
          subscriptionStatus: m.kind === 'visitor' ? 'Don ponctuel confirmé' : 'Actif',
          expiresAtIso: m.kind === 'visitor' ? null : nextExpIso,
          expiresAtLabel: m.kind === 'visitor' ? 'Contribution unique' : nextExpLabel,
        };
      })
    );
  };

  const sendRenewalReminder = (id: string) => {
    const nowLabel = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setMemberships((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const targetEmail = (m.accountEmail || m.email || '').toLowerCase();
        if (targetEmail) {
          setNotifications((nPrev) => [
            {
              id: `notif-rem-${Date.now()}`,
              memberEmail: targetEmail,
              memberName: m.fullName,
              branchName: m.branchName,
              title: `Rappel officiel de réabonnement — ${m.branchName}`,
              message: `Bonjour ${m.fullName}, l'administration de ${m.branchName} vous invite à renouveler votre cotisation (${m.category}) à partir de 20 $ USD depuis votre espace personnel.`,
              type: 'admin_reminder',
              createdAtLabel: nowLabel,
              read: false,
            },
            ...nPrev,
          ]);
        }
        return {
          ...m,
          lastReminderAtLabel: nowLabel,
        };
      })
    );
  };

  const renewMemberSubscription = (membershipId: string, ticket: MembershipPaymentTicket) => {
    const nextExpIso = isoDaysFromNow(30);
    const nextExpLabel = formatFrDateFromIso(nextExpIso);
    const nowLabel = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setMemberships((prev) =>
      prev.map((m) => {
        if (m.id !== membershipId) return m;
        const targetEmail = (m.accountEmail || m.email || '').toLowerCase();
        if (targetEmail) {
          setNotifications((nPrev) => [
            {
              id: `notif-ren-${Date.now()}`,
              memberEmail: targetEmail,
              memberName: m.fullName,
              branchName: m.branchName,
              title: `Réabonnement enregistré (${ticket.amountUsd.toFixed(2)} $ USD)`,
              message: `Ticket ${ticket.ticketNumber} via ${ticket.channelUsedLabel}. Prochaine échéance : ${nextExpLabel}.`,
              type: 'validation',
              createdAtLabel: nowLabel,
              read: false,
            },
            ...nPrev,
          ]);
        }
        return {
          ...m,
          subscriptionStatus: 'Actif',
          expiresAtIso: nextExpIso,
          expiresAtLabel: nextExpLabel,
          paymentTicket: ticket,
        };
      })
    );
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const addOrder = (order: Omit<BranchOrderRecord, 'id' | 'reference' | 'createdAtLabel'>) => {
    const now = new Date();
    const created: BranchOrderRecord = {
      ...order,
      id: `ord-${Date.now()}`,
      reference: `CMD-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(
        now.getMinutes()
      ).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`,
      createdAtLabel: now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
    setOrders((prev) => [created, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const addBranchService = (branchId: string, serviceText: string) => {
    const clean = serviceText.trim();
    if (!clean) return;
    setCms((prev) => ({
      ...prev,
      branchServices: {
        ...prev.branchServices,
        [branchId]: [...(prev.branchServices[branchId] || []), clean],
      },
    }));
  };

  const updateBranchService = (branchId: string, index: number, nextText: string) => {
    const clean = nextText.trim();
    if (!clean) return;
    setCms((prev) => ({
      ...prev,
      branchServices: {
        ...prev.branchServices,
        [branchId]: (prev.branchServices[branchId] || []).map((item, idx) =>
          idx === index ? clean : item
        ),
      },
    }));
  };

  const deleteBranchService = (branchId: string, index: number) => {
    setCms((prev) => ({
      ...prev,
      branchServices: {
        ...prev.branchServices,
        [branchId]: (prev.branchServices[branchId] || []).filter((_, idx) => idx !== index),
      },
    }));
  };

  const addFondationProject = (project: Omit<FondationProjectItem, 'id'>) => {
    setCms((prev) => ({
      ...prev,
      fondationProjects: [{ ...project, id: `proj-${Date.now()}` }, ...prev.fondationProjects],
    }));
  };

  const updateFondationProject = (project: FondationProjectItem) => {
    setCms((prev) => ({
      ...prev,
      fondationProjects: prev.fondationProjects.map((p) => (p.id === project.id ? project : p)),
    }));
  };

  const deleteFondationProject = (id: string) => {
    setCms((prev) => ({
      ...prev,
      fondationProjects: prev.fondationProjects.filter((p) => p.id !== id),
    }));
  };

  const addCatalogArticle = (article: Omit<CatalogArticleItem, 'id'>) => {
    setCms((prev) => ({
      ...prev,
      catalogArticles: [{ ...article, id: `art-${Date.now()}` }, ...prev.catalogArticles],
    }));
  };

  const updateCatalogArticle = (article: CatalogArticleItem) => {
    setCms((prev) => ({
      ...prev,
      catalogArticles: prev.catalogArticles.map((a) => (a.id === article.id ? article : a)),
    }));
  };

  const deleteCatalogArticle = (id: string) => {
    setCms((prev) => ({
      ...prev,
      catalogArticles: prev.catalogArticles.filter((a) => a.id !== id),
    }));
  };

  const addFaqItem = (faq: Omit<FAQItem, 'id'>) => {
    setCms((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { ...faq, id: `faq-${Date.now()}` }],
    }));
  };

  const updateFaqItem = (faq: FAQItem) => {
    setCms((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === faq.id ? faq : f)),
    }));
  };

  const deleteFaqItem = (id: string) => {
    setCms((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
  };

  const addNewsActu = (actu: Omit<NewsActuItem, 'id' | 'rsvpCount'>) => {
    setCms((prev) => ({
      ...prev,
      newsActus: [
        { ...actu, id: `actu-${Date.now()}`, rsvpCount: 0 },
        ...prev.newsActus,
      ],
    }));
  };

  const updateNewsActu = (actu: NewsActuItem) => {
    setCms((prev) => ({
      ...prev,
      newsActus: prev.newsActus.map((a) => (a.id === actu.id ? actu : a)),
    }));
  };

  const deleteNewsActu = (id: string) => {
    setCms((prev) => ({
      ...prev,
      newsActus: prev.newsActus.filter((a) => a.id !== id),
    }));
  };

  const incrementNewsRsvp = (id: string) => {
    setCms((prev) => ({
      ...prev,
      newsActus: prev.newsActus.map((a) =>
        a.id === id ? { ...a, rsvpCount: a.rsvpCount + 1 } : a
      ),
    }));
  };

  const resetAllDemoData = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    setMemberships(createDefaultMemberships());
    setNotifications(DEFAULT_NOTIFICATIONS);
    setOrders(DEFAULT_ORDERS);
    setCms(DEFAULT_CMS);
  };

  return (
    <PmbStoreContext.Provider
      value={{
        accounts,
        currentMember,
        memberships,
        notifications,
        orders,
        cms,
        newsletterSubscribers,
        subscribeNewsletter,
        loginMember,
        quickLoginDemoMember,
        registerMemberAccount,
        changeMemberPassword,
        logoutMember,
        addMembershipRecord,
        adminCreateMember,
        validateMembership,
        sendRenewalReminder,
        renewMemberSubscription,
        markNotificationRead,
        addOrder,
        updateOrderStatus,
        addBranchService,
        updateBranchService,
        deleteBranchService,
        addFondationProject,
        updateFondationProject,
        deleteFondationProject,
        addCatalogArticle,
        updateCatalogArticle,
        deleteCatalogArticle,
        addFaqItem,
        updateFaqItem,
        deleteFaqItem,
        addNewsActu,
        updateNewsActu,
        deleteNewsActu,
        incrementNewsRsvp,
        resetAllDemoData,
      }}
    >
      {children}
    </PmbStoreContext.Provider>
  );
}

export function usePmbStore(): PmbStoreContextValue {
  const ctx = useContext(PmbStoreContext);
  if (!ctx) {
    throw new Error('usePmbStore doit être utilisé à l’intérieur de PmbStoreProvider.');
  }
  return ctx;
}
