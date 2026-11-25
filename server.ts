import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const STORE_PATH = path.resolve(process.cwd(), '.pmb-runtime-store.json');
const WEBHOOK_SECRET =
  process.env.PMB_WEBHOOK_SECRET && process.env.PMB_WEBHOOK_SECRET !== 'MY_PMB_WEBHOOK_SECRET'
    ? process.env.PMB_WEBHOOK_SECRET
    : crypto.createHash('sha256').update('PMB_GROUP_SARL_RCCM_24_A_04653_KEY').digest('hex');

type PaymentChannel =
  | 'card_visa_mastercard'
  | 'mpesa'
  | 'orange_money'
  | 'airtel_money'
  | 'africell_money';

interface PaymentTransaction {
  txRef: string;
  receiptNumber: string | null;
  authCode: string | null;
  branchId: string;
  branchName: string;
  serviceLabel: string;
  amount: number;
  currency: 'USD' | 'CDF';
  channel: PaymentChannel;
  channelLabel: string;
  customerName: string;
  customerContact: string;
  maskedAccount: string;
  status: 'PENDING_WEBHOOK' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  settledAt: string | null;
  webhookVerified: boolean;
}

interface AgendaEvent {
  id: string;
  branchId: string;
  branchName: string;
  type: 'Webinaire' | 'Événement' | 'Logistique' | 'Action Sociale';
  title: string;
  dateLabel: string;
  location: string;
  summary: string;
  rsvpCount: number;
}

interface ForumReply {
  id: string;
  authorName: string;
  role: 'client' | 'team';
  message: string;
  createdAt: string;
}

interface ForumThread {
  id: string;
  branchId: string;
  branchName: string;
  authorName: string;
  title: string;
  question: string;
  status: 'Répondu' | 'Ouvert';
  createdAt: string;
  replies: ForumReply[];
}

interface QuoteRecord {
  reference: string;
  branchId: string;
  branchName: string;
  fullName: string;
  contact: string;
  message: string;
  createdAt: string;
}

interface QaIncidentRecord {
  id: string;
  type: 'syntax' | 'api' | 'responsive' | 'media';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  context: string;
  autoHealedAction: string | null;
  createdAt: string;
}

interface PaymentTicketRecord {
  ticketNumber: string;
  issuedAt: string;
  issuedAtLabel: string;
  candidateName: string;
  category: string;
  paymentMethod: 'mobile_money' | 'card_visa_mastercard' | 'bank_transfer';
  paymentMethodLabel: string;
  channelUsedLabel: string;
  destinationAccount: string;
  amountUsd: number;
  transactionRef: string;
  proofFileName: string | null;
  status: string;
}

interface RegistrationRecord {
  reference: string;
  fullName: string;
  gender: 'Femme' | 'Homme' | '';
  birthDate: string;
  birthContinent: string;
  birthCountry: string;
  birthCity: string;
  birthCommune: string;
  birthQuartier: string;
  resCommune: string;
  resQuartier: string;
  resAvenue: string;
  resNumber: string;
  phoneCountryIso: string;
  phoneCode: string;
  phoneNumber: string;
  category: string;
  photoMode: 'upload' | 'selfie' | 'skip';
  photoFileName: string | null;
  signaturesMode: 'manuscript_blank';
  paymentTicket: PaymentTicketRecord | null;
  createdAt: string;
}

interface RuntimeStore {
  transactions: PaymentTransaction[];
  agendaEvents: AgendaEvent[];
  forumThreads: ForumThread[];
  quotes: QuoteRecord[];
  qaIncidents: QaIncidentRecord[];
  registrations: RegistrationRecord[];
}

const DEFAULT_STORE: RuntimeStore = {
  transactions: [
    {
      txRef: 'PMB-TX-20261118-01',
      receiptNumber: 'REC-PMB-2026-00412',
      authCode: 'AUTH-9F42C1',
      branchId: 'pmb-transport',
      branchName: 'PMB Transport',
      serviceLabel: 'Réservation Fret Aérien Express (Kinshasa – International)',
      amount: 350,
      currency: 'USD',
      channel: 'mpesa',
      channelLabel: 'M-Pesa Vodacom RDC',
      customerName: 'Société Kongo Négoce',
      customerContact: '+243 89 00 12 450',
      maskedAccount: '+243 89***450',
      status: 'CONFIRMED',
      createdAt: '2026-11-18T09:15:00.000Z',
      settledAt: '2026-11-18T09:15:04.000Z',
      webhookVerified: true,
    },
    {
      txRef: 'PMB-TX-20261118-02',
      receiptNumber: 'REC-PMB-2026-00413',
      authCode: 'AUTH-7A18E9',
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      serviceLabel: 'Cotisation Mensuelle — Membre Sympathisant',
      amount: 25,
      currency: 'USD',
      channel: 'card_visa_mastercard',
      channelLabel: 'Carte Bancaire Visa / MasterCard',
      customerName: 'Marie-Claire Lukusa',
      customerContact: 'mclukusa@exemple.cd',
      maskedAccount: 'Visa •••• 4821',
      status: 'CONFIRMED',
      createdAt: '2026-11-18T10:40:00.000Z',
      settledAt: '2026-11-18T10:40:03.000Z',
      webhookVerified: true,
    },
  ],
  agendaEvents: [
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
        'Accueil des nouveaux membres Sympathisants, Bienfaiteurs et Actifs selon les Conditions Générales d’Adhésion PMB Fondation.',
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
  ],
  forumThreads: [
    {
      id: 'th-1',
      branchId: 'pmb-transport',
      branchName: 'PMB Transport',
      authorName: 'Jean-Paul Kasongo',
      title: 'Délai moyen pour un conteneur maritime (Paquebot) vers Kinshasa ?',
      question:
        'Bonjour l’équipe PMB Transport, nous importons du matériel commercial en gros. Proposez-vous le suivi complet du paquebot jusqu’à la livraison par camion à Kinshasa ?',
      status: 'Répondu',
      createdAt: '2026-11-17T14:20:00.000Z',
      replies: [
        {
          id: 'rep-1',
          authorName: 'Équipe Logistique PMB Transport',
          role: 'team',
          message:
            'Bonjour Jean-Paul. Oui, nous assurons la chaîne multimodale complète : acheminement maritime par paquebot, prise en charge portuaire, transport routier par semi-remorque jusqu’à votre dépôt à Kinshasa et suivi temps réel.',
          createdAt: '2026-11-17T15:05:00.000Z',
        },
      ],
    },
    {
      id: 'th-2',
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      authorName: 'Clarisse Nzuzi',
      title: 'Comment régler ma cotisation de Membre Sympathisant à distance ?',
      question:
        'Je viens de remplir la Fiche d’Adhésion mise à jour. Puis-je régler directement par M-Pesa ou Airtel Money et obtenir un reçu officiel ?',
      status: 'Répondu',
      createdAt: '2026-11-18T08:10:00.000Z',
      replies: [
        {
          id: 'rep-2',
          authorName: 'Secrétariat PMB Fondation',
          role: 'team',
          message:
            'Bonjour Clarisse ! Utilisez la section Paiement Multi-Canaux ci-dessous en sélectionnant « PMB Fondation » et votre opérateur (M-Pesa, Airtel Money, Orange Money, Africell Money ou Visa/MasterCard). Votre reçu officiel est consigné immédiatement.',
          createdAt: '2026-11-18T08:30:00.000Z',
        },
      ],
    },
  ],
  quotes: [],
  qaIncidents: [],
  registrations: [],
};

function readStore(): RuntimeStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<RuntimeStore>;
      return {
        transactions: Array.isArray(parsed.transactions)
          ? parsed.transactions
          : DEFAULT_STORE.transactions,
        agendaEvents: Array.isArray(parsed.agendaEvents)
          ? parsed.agendaEvents
          : DEFAULT_STORE.agendaEvents,
        forumThreads: Array.isArray(parsed.forumThreads)
          ? parsed.forumThreads
          : DEFAULT_STORE.forumThreads,
        quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
        qaIncidents: Array.isArray(parsed.qaIncidents) ? parsed.qaIncidents : [],
        registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
      };
    }
  } catch {
    // Fallback sur les données initiales en cas de fichier corrompu
  }
  return structuredClone(DEFAULT_STORE);
}

function writeStore(store: RuntimeStore): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PMB Store] Erreur écriture disque:', err);
  }
}

function signWebhookPayload(txRef: string, amount: number, currency: string): string {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(`${txRef}:${amount}:${currency}`)
    .digest('hex');
}

function getChannelLabel(channel: PaymentChannel): string {
  switch (channel) {
    case 'card_visa_mastercard':
      return 'Carte Bancaire Visa / MasterCard';
    case 'mpesa':
      return 'M-Pesa Vodacom RDC';
    case 'orange_money':
      return 'Orange Money RDC';
    case 'airtel_money':
      return 'Airtel Money RDC';
    case 'africell_money':
      return 'Africell Money RDC';
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PMB_CHATBOT_SYSTEM_INSTRUCTION = `Tu es l'assistant officiel et conseiller client intelligent de PMB GROUP SARL à Kinshasa (RDC).
Identité légale stricte :
- Raison sociale : PMB GROUP SARL
- RCCM : RCCM/24-A-04653 P-Id
- Identification Nationale : Nat/01-G4701-N52717A
- Siège social : Bandal Synkin — Arrêt Station Tshibangu, Réf. Immeuble Vodacom, croisement des avenues Kinsangani et Sundi n°1, Kinshasa, RDC.
- E-mail officiel : mboziprisca37@gmail.com
- Lignes directes & WhatsApp (cliquables en un clic sur https://wa.me/243...) : +243 89 66 60 558, +243 96 23 00 003, +243 83 39 93 994.

Les 6 branches opérationnelles :
1. PMB Shop (Corail) : Vente d'unités de crédit & forfaits internet tous réseaux (Vodacom, Airtel, Orange, Africell), smartphones neufs, opérations Mobile Money (M-Pesa, Airtel Money, Orange Money).
2. PMB Store (Ambre) : Vente en gros et détail d'Eau Vive, jus naturels frais, denrées alimentaires (FMCG) et approvisionnement Import-Export.
3. PMB Transport (Jaune) : Mobilité urbaine VTC, motos de livraison GPS, camions de fret, Transport Maritime & Fluvial (Paquebot / conteneurs sur le fleuve Congo et lignes maritimes), Transport Aérien (Avion / fret express international), billetterie QR Code.
4. PMB Immobilier (Champagne) : Gestion immobilière (achat, vente, location), travaux de construction/rénovation et fourniture de matériaux durables.
5. PMB Event (Violet) : Sonorisation, jeux de lumière, fabrication et installation d'écrans géants LED (indoor/outdoor, stades, églises, conférences, cérémonies présidentielles et concerts — 27 réalisations vidéo visibles sur le site).
6. PMB Fondation (Or) : Action sociale (« Une action aujourd'hui, un avenir meilleur demain »). 5 statuts de membres selon les Conditions Générales d'Adhésion mises à jour : Membre Fondateur, Membre d'Honneur, Membre Bienfaiteur (soutien financier/matériel, sans droit de vote), Membre Actif (18+ ans, 100$ ou équivalent, participation et vote) et Membre Sympathisant (cotisation mensuelle volontaire accessible). Deux documents PDF officiels sont téléchargeables dans la section Fondation : Conditions d'Adhésion et Fiche d'Adhésion mise à jour.

Passerelle de paiement multi-canaux :
- Les clients peuvent régler leurs commandes, réservations ou cotisations dans la section « Passerelle de Paiement » (#paiement) via Carte Bancaire (Visa / MasterCard) ou Mobile Money RDC (M-Pesa, Orange Money, Airtel Money, Africell Money), avec validation temps réel par webhook et reçu consigné dans leur compte client.

Consignes de réponse :
- Réponds toujours en français clair, courtois, structuré et professionnel.
- Sois concis (3 à 6 phrases max sauf si un détail complet est demandé).
- Oriente proactivement vers les sections du site (#paiement, #fondation, #videos-event, #communaute, #contact) ou vers WhatsApp (+243 89 66 60 558).
- N'invente jamais de numéros de téléphone ou d'identifiants légaux différents de ceux ci-dessus.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Santé API & Vérification de conformité backend
  app.get('/api/health', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({
      status: 'ok',
      company: 'PMB GROUP SARL',
      rccm: 'RCCM/24-A-04653 P-Id',
      idNat: 'Nat/01-G4701-N52717A',
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
      stats: {
        receiptsCount: store.transactions.length,
        agendaEventsCount: store.agendaEvents.length,
        forumThreadsCount: store.forumThreads.length,
        qaIncidentsCount: store.qaIncidents.length,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 1. PASSERELLE DE PAIEMENT MULTI-CANAUX & WEBHOOKS
  app.get('/api/payments/receipts', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ transactions: store.transactions });
  });

  app.post('/api/payments/initiate', (req: Request, res: Response) => {
    const body = req.body as {
      branchId?: string;
      branchName?: string;
      serviceLabel?: string;
      amount?: number;
      currency?: 'USD' | 'CDF';
      channel?: PaymentChannel;
      customerName?: string;
      customerContact?: string;
      maskedAccount?: string;
    };

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'Montant invalide. Veuillez saisir un montant positif.' });
      return;
    }

    const validChannels: PaymentChannel[] = [
      'card_visa_mastercard',
      'mpesa',
      'orange_money',
      'airtel_money',
      'africell_money',
    ];
    if (!body.channel || !validChannels.includes(body.channel)) {
      res.status(400).json({ error: 'Canal de paiement non reconnu.' });
      return;
    }

    if (!body.customerName || body.customerName.trim().length < 2) {
      res.status(400).json({ error: 'Le nom complet du client est requis.' });
      return;
    }

    const currency = body.currency === 'CDF' ? 'CDF' : 'USD';
    const now = new Date();
    const txRef = `PMB-TX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const transaction: PaymentTransaction = {
      txRef,
      receiptNumber: null,
      authCode: null,
      branchId: body.branchId || 'pmb-shop',
      branchName: body.branchName || 'PMB GROUP SARL',
      serviceLabel: (body.serviceLabel || 'Prestation PMB GROUP SARL').trim(),
      amount,
      currency,
      channel: body.channel,
      channelLabel: getChannelLabel(body.channel),
      customerName: body.customerName.trim(),
      customerContact: (body.customerContact || '').trim() || 'Client Kinshasa',
      maskedAccount: (body.maskedAccount || 'Compte vérifié').trim(),
      status: 'PENDING_WEBHOOK',
      createdAt: now.toISOString(),
      settledAt: null,
      webhookVerified: false,
    };

    const store = readStore();
    store.transactions.unshift(transaction);
    writeStore(store);

    const signature = signWebhookPayload(txRef, amount, currency);

    res.status(201).json({
      transaction,
      webhookCallbackUrl: '/api/payments/webhook',
      webhookSignature: signature,
    });
  });

  app.post('/api/payments/webhook', (req: Request, res: Response) => {
    const signatureHeader = String(req.headers['x-pmb-signature'] || '');
    const body = req.body as { txRef?: string; event?: string };

    if (!body.txRef) {
      res.status(400).json({ error: 'txRef manquant dans le payload webhook.' });
      return;
    }

    const store = readStore();
    const txIndex = store.transactions.findIndex((t) => t.txRef === body.txRef);
    if (txIndex === -1) {
      res.status(404).json({ error: 'Transaction introuvable.' });
      return;
    }

    const tx = store.transactions[txIndex];
    const expectedSig = signWebhookPayload(tx.txRef, tx.amount, tx.currency);

    const sigBuf = Buffer.from(signatureHeader);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      res.status(401).json({ error: 'Signature HMAC webhook invalide.' });
      return;
    }

    if (tx.status !== 'CONFIRMED') {
      const now = new Date();
      tx.status = 'CONFIRMED';
      tx.webhookVerified = true;
      tx.settledAt = now.toISOString();
      tx.receiptNumber = `REC-PMB-${now.getFullYear()}-${String(
        10000 + Math.floor(Math.random() * 89999)
      )}`;
      tx.authCode = `AUTH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      store.transactions[txIndex] = tx;
      writeStore(store);
    }

    res.json({
      verified: true,
      event: body.event || 'payment.settled',
      transaction: tx,
    });
  });

  app.get('/api/payments/:txRef/status', (req: Request, res: Response) => {
    const store = readStore();
    const tx = store.transactions.find((t) => t.txRef === req.params.txRef);
    if (!tx) {
      res.status(404).json({ error: 'Transaction introuvable.' });
      return;
    }
    res.json({ transaction: tx });
  });

  // 2. SECTION AGENDA, ANNONCES & FORUM CLIENTS
  app.get('/api/agenda', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ events: store.agendaEvents });
  });

  app.post('/api/agenda/:id/rsvp', (req: Request, res: Response) => {
    const store = readStore();
    const event = store.agendaEvents.find((ev) => ev.id === req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Événement introuvable.' });
      return;
    }
    event.rsvpCount += 1;
    writeStore(store);
    res.json({ event });
  });

  app.get('/api/forum', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ threads: store.forumThreads });
  });

  app.post('/api/forum', (req: Request, res: Response) => {
    const body = req.body as {
      branchId?: string;
      branchName?: string;
      authorName?: string;
      title?: string;
      question?: string;
    };

    if (!body.authorName || body.authorName.trim().length < 2) {
      res.status(400).json({ error: 'Veuillez indiquer votre nom.' });
      return;
    }
    if (!body.title || body.title.trim().length < 4) {
      res.status(400).json({ error: 'Le sujet de la question est trop court.' });
      return;
    }
    if (!body.question || body.question.trim().length < 8) {
      res.status(400).json({ error: 'Veuillez détailler votre question (min. 8 caractères).' });
      return;
    }

    const thread: ForumThread = {
      id: `th-${crypto.randomBytes(3).toString('hex')}`,
      branchId: body.branchId || 'pmb-shop',
      branchName: body.branchName || 'PMB GROUP SARL',
      authorName: body.authorName.trim(),
      title: body.title.trim(),
      question: body.question.trim(),
      status: 'Ouvert',
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const store = readStore();
    store.forumThreads.unshift(thread);
    writeStore(store);

    res.status(201).json({ thread });
  });

  app.post('/api/forum/:id/reply', (req: Request, res: Response) => {
    const body = req.body as { authorName?: string; role?: 'client' | 'team'; message?: string };
    if (!body.authorName || body.authorName.trim().length < 2) {
      res.status(400).json({ error: 'Nom requis.' });
      return;
    }
    if (!body.message || body.message.trim().length < 4) {
      res.status(400).json({ error: 'Réponse trop courte.' });
      return;
    }

    const store = readStore();
    const thread = store.forumThreads.find((t) => t.id === req.params.id);
    if (!thread) {
      res.status(404).json({ error: 'Sujet introuvable.' });
      return;
    }

    const reply: ForumReply = {
      id: `rep-${crypto.randomBytes(3).toString('hex')}`,
      authorName: body.authorName.trim(),
      role: body.role === 'team' ? 'team' : 'client',
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
    };

    thread.replies.push(reply);
    if (reply.role === 'team') {
      thread.status = 'Répondu';
    }
    writeStore(store);

    res.status(201).json({ thread });
  });

  // 3. DEMANDES DE DEVIS (PERSISTANCE SERVEUR)
  app.post('/api/quotes', (req: Request, res: Response) => {
    const body = req.body as {
      reference?: string;
      branchId?: string;
      branchName?: string;
      fullName?: string;
      contact?: string;
      message?: string;
    };

    if (!body.fullName || !body.contact || !body.message) {
      res.status(400).json({ error: 'Champs obligatoires manquants.' });
      return;
    }

    const record: QuoteRecord = {
      reference: body.reference || `PMB-${Date.now()}`,
      branchId: body.branchId || 'pmb-shop',
      branchName: body.branchName || 'PMB GROUP SARL',
      fullName: body.fullName.trim(),
      contact: body.contact.trim(),
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
    };

    const store = readStore();
    store.quotes.unshift(record);
    writeStore(store);

    res.status(201).json({ saved: true, quote: record });
  });

  // 3B. INSCRIPTION & PROFIL UTILISATEUR
  app.get('/api/registrations', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ registrations: store.registrations });
  });

  app.post('/api/registrations', (req: Request, res: Response) => {
    const body = req.body as Partial<RegistrationRecord>;
    if (!body.fullName || body.fullName.trim().length < 2) {
      res.status(400).json({ error: 'Le nom complet est requis.' });
      return;
    }
    if (body.gender !== 'Femme' && body.gender !== 'Homme') {
      res.status(400).json({ error: 'Le sexe / genre (Femme ou Homme) est requis.' });
      return;
    }
    if (!body.birthDate) {
      res.status(400).json({ error: 'La date de naissance est requise.' });
      return;
    }
    const cleanPhone = (body.phoneNumber || '').replace(/\D/g, '');
    if (!/^\d{9}$/.test(cleanPhone)) {
      res.status(400).json({
        error: 'Le numéro de téléphone après l’indicatif pays doit contenir exactement 9 chiffres.',
      });
      return;
    }

    const chosenCategory = body.category || 'Membre effectif';
    const submittedTicket = body.paymentTicket || null;

    if (chosenCategory === 'Membre effectif') {
      if (
        !submittedTicket ||
        !submittedTicket.ticketNumber ||
        typeof submittedTicket.amountUsd !== 'number' ||
        submittedTicket.amountUsd < 20
      ) {
        res.status(400).json({
          error:
            'Paiement obligatoire requis pour la catégorie « Membre effectif » (à partir de 20 $ USD avec ticket généré).',
        });
        return;
      }
    } else if (
      submittedTicket &&
      (!submittedTicket.ticketNumber ||
        typeof submittedTicket.amountUsd !== 'number' ||
        submittedTicket.amountUsd < 20)
    ) {
      res.status(400).json({
        error:
          'Une contribution volontaire jointe doit être d’au moins 20 $ USD avec un ticket valide.',
      });
      return;
    }

    const record: RegistrationRecord = {
      reference: `REG-PMB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      fullName: body.fullName.trim(),
      gender: body.gender,
      birthDate: body.birthDate,
      birthContinent: (body.birthContinent || '').trim(),
      birthCountry: (body.birthCountry || '').trim(),
      birthCity: (body.birthCity || '').trim(),
      birthCommune: (body.birthCommune || '').trim(),
      birthQuartier: (body.birthQuartier || '').trim(),
      resCommune: (body.resCommune || '').trim(),
      resQuartier: (body.resQuartier || '').trim(),
      resAvenue: (body.resAvenue || '').trim(),
      resNumber: (body.resNumber || '').trim(),
      phoneCountryIso: (body.phoneCountryIso || 'CD').trim(),
      phoneCode: body.phoneCode || '+243',
      phoneNumber: cleanPhone,
      category: chosenCategory,
      photoMode:
        body.photoMode === 'selfie' || body.photoMode === 'skip' ? body.photoMode : 'upload',
      photoFileName: body.photoFileName ? String(body.photoFileName).slice(0, 160) : null,
      signaturesMode: 'manuscript_blank',
      paymentTicket: submittedTicket,
      createdAt: new Date().toISOString(),
    };

    const store = readStore();
    store.registrations.unshift(record);
    writeStore(store);

    res.status(201).json({ saved: true, registration: record });
  });

  // 4. CHATBOT INTELLIGENT D'ASSISTANCE CLIENTS (GEMINI API SERVEUR)
  app.post('/api/chat', async (req: Request, res: Response) => {
    const body = req.body as {
      message?: string;
      history?: Array<{ role: 'user' | 'model'; text: string }>;
    };

    const message = (body.message || '').trim();
    if (!message) {
      res.status(400).json({ error: 'Veuillez saisir un message.' });
      return;
    }

    try {
      const ai = getGeminiClient();
      const historyContents = (body.history || []).slice(-8).map((item) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          ...historyContents,
          { role: 'user', parts: [{ text: message }] },
        ],
        config: {
          systemInstruction: PMB_CHATBOT_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({
          error: 'Réponse vide reçue du service IA. Veuillez réessayer.',
        });
        return;
      }

      res.json({ reply });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Erreur serveur IA';
      if (errMsg === 'GEMINI_API_KEY_MISSING') {
        res.status(503).json({
          error:
            'Clé GEMINI_API_KEY non configurée dans Settings > Secrets. Vous pouvez contacter nos conseillers sur WhatsApp au +243 89 66 60 558.',
        });
        return;
      }
      console.error('[PMB Chat] Erreur Gemini API:', errMsg);
      res.status(502).json({
        error: `Service d'assistance IA momentanément indisponible (${errMsg}). Contact direct WhatsApp : +243 89 66 60 558.`,
      });
    }
  });

  // 5. MODULE D'IA CORRECTRICE (AUTO-DEBUG & QA ROBOTIQUE)
  app.get('/api/qa/reports', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({ incidents: store.qaIncidents.slice(0, 50) });
  });

  app.post('/api/qa/report', (req: Request, res: Response) => {
    const body = req.body as Partial<QaIncidentRecord>;
    const incident: QaIncidentRecord = {
      id: `qa-${crypto.randomBytes(3).toString('hex')}`,
      type:
        body.type === 'syntax' ||
        body.type === 'api' ||
        body.type === 'responsive' ||
        body.type === 'media'
          ? body.type
          : 'api',
      severity:
        body.severity === 'critical' || body.severity === 'warning' ? body.severity : 'info',
      message: (body.message || 'Anomalie détectée').slice(0, 400),
      context: (body.context || 'Application web').slice(0, 300),
      autoHealedAction: body.autoHealedAction ? body.autoHealedAction.slice(0, 300) : null,
      createdAt: new Date().toISOString(),
    };

    const store = readStore();
    store.qaIncidents.unshift(incident);
    store.qaIncidents = store.qaIncidents.slice(0, 50);
    writeStore(store);

    res.status(201).json({ incident });
  });

  app.post('/api/qa/diagnose', async (req: Request, res: Response) => {
    const body = req.body as {
      viewportWidth?: number;
      overflowPx?: number;
      brokenMediaCount?: number;
      recentIncidents?: QaIncidentRecord[];
    };

    try {
      const ai = getGeminiClient();
      const snapshot = {
        viewportWidth: body.viewportWidth ?? 1440,
        overflowPx: body.overflowPx ?? 0,
        brokenMediaCount: body.brokenMediaCount ?? 0,
        recentIncidents: (body.recentIncidents || []).slice(0, 6),
      };

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyse ce rapport de surveillance temps réel du site PMB GROUP SARL et fournis un diagnostic d'expert Senior Full-Stack QA en français :\n${JSON.stringify(
          snapshot
        )}`,
        config: {
          systemInstruction:
            "Tu es un Lead Developer & Architecte QA Senior pour PMB GROUP SARL. Tu analyses les erreurs JS, requêtes API et audits responsive pour proposer des actions d'auto-correction précises en français.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthGrade: {
                type: Type.STRING,
                description: 'Niveau global : Optimal, Vigilance ou Critique',
              },
              summary: {
                type: Type.STRING,
                description: 'Synthèse technique en 2 phrases maximum.',
              },
              rootCause: {
                type: Type.STRING,
                description: 'Analyse de cause racine des anomalies ou confirmation de stabilité.',
              },
              recommendedPatch: {
                type: Type.STRING,
                description: 'Action corrective logicielle ou CSS recommandée.',
              },
            },
          },
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim()) as {
        healthGrade?: string;
        summary?: string;
        rootCause?: string;
        recommendedPatch?: string;
      };

      res.json({
        diagnostic: {
          healthGrade: parsed.healthGrade || 'Optimal',
          summary: parsed.summary || 'Audit terminé.',
          rootCause: parsed.rootCause || 'Aucune anomalie critique détectée.',
          recommendedPatch:
            parsed.recommendedPatch || 'Maintenir la surveillance DOM et API active.',
          analyzedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Erreur diagnostic IA';
      res.status(errMsg === 'GEMINI_API_KEY_MISSING' ? 503 : 502).json({
        error:
          errMsg === 'GEMINI_API_KEY_MISSING'
            ? 'Clé GEMINI_API_KEY requise dans Settings > Secrets pour exécuter le diagnostic IA Senior.'
            : `Impossible de joindre le moteur de diagnostic IA (${errMsg}).`,
      });
    }
  });

  // Montage Vite en développement ou fichiers statiques dist/ en production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`PMB GROUP SARL server listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PMB GROUP SARL server:', err);
  process.exit(1);
});
