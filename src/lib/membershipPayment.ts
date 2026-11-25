import { PMB_MEMBERSHIP_PAYMENT_INFO } from '../data/pmbData';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatFileSize } from './registrationMedia';

export type MembershipPaymentMethod =
  | 'mobile_money'
  | 'card_visa_mastercard'
  | 'bank_transfer';

export type PaymentTicketStatus =
  'Preuve de paiement enregistrée (en attente de validation par les organes compétents)';

export interface MembershipPaymentTicket {
  ticketNumber: string;
  issuedAt: string;
  issuedAtLabel: string;
  candidateName: string;
  category: string;
  paymentMethod: MembershipPaymentMethod;
  paymentMethodLabel: string;
  channelUsedLabel: string;
  destinationAccount: string;
  amountUsd: number;
  transactionRef: string;
  proofFileName: string | null;
  status: PaymentTicketStatus;
}

export function validateContributionAmountUsd(raw: string): {
  valid: boolean;
  amount: number;
  error: string | null;
} {
  const normalized = raw.replace(',', '.').trim();
  const parsed = Number(normalized);

  if (!normalized || Number.isNaN(parsed)) {
    return {
      valid: false,
      amount: 0,
      error: `Veuillez saisir un montant valide en USD (à partir de ${PMB_MEMBERSHIP_PAYMENT_INFO.minAmountUsd} $).`,
    };
  }

  if (parsed < PMB_MEMBERSHIP_PAYMENT_INFO.minAmountUsd) {
    return {
      valid: false,
      amount: parsed,
      error: `Le montant doit être d’au moins ${PMB_MEMBERSHIP_PAYMENT_INFO.minAmountUsd} $ USD (20 $ ou tout autre montant supérieur à 20 $).`,
    };
  }

  return {
    valid: true,
    amount: Math.round(parsed * 100) / 100,
    error: null,
  };
}

export function validateProofUploadFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `La preuve « ${file.name} » (${formatFileSize(file.size)}) dépasse la limite de ${MAX_FILE_SIZE_MB} Mo.`;
  }
  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();
  const isAllowed =
    mime.startsWith('image/') ||
    mime === 'application/pdf' ||
    /\.(jpg|jpeg|png|webp|tif|tiff|pdf)$/i.test(name);

  if (!isAllowed) {
    return 'Format non pris en charge. Utilisez une capture image (.jpg, .png, .webp) ou un fichier .pdf.';
  }
  return null;
}

export function formatCardNumberDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatCardExpiryDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

export function validateCardPaymentFields(params: {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}): string | null {
  if (params.cardHolder.trim().length < 3) {
    return 'Veuillez saisir le nom complet du titulaire de la carte.';
  }
  const digits = params.cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 16) {
    return 'Le numéro de carte bancaire doit comporter entre 13 et 16 chiffres.';
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(params.expiry.trim())) {
    return 'Date d’expiration invalide (format attendu : MM/AA).';
  }
  const [mmStr, yyStr] = params.expiry.split('/');
  const expMonth = Number(mmStr);
  const expYear = 2000 + Number(yyStr);
  const now = new Date();
  if (
    expYear < now.getFullYear() ||
    (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
  ) {
    return 'Cette carte bancaire est expirée.';
  }
  if (!/^\d{3,4}$/.test(params.cvv.trim())) {
    return 'Le code CVV doit comporter 3 ou 4 chiffres.';
  }
  return null;
}

export function createMembershipPaymentTicket(params: {
  candidateName: string;
  category: string;
  paymentMethod: MembershipPaymentMethod;
  channelUsedLabel: string;
  destinationAccount: string;
  amountUsd: number;
  transactionRef: string;
  proofFileName?: string | null;
}): MembershipPaymentTicket {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();

  const methodLabelMap: Record<MembershipPaymentMethod, string> = {
    mobile_money: 'Mobile Money',
    card_visa_mastercard: 'Mastercard / Visa',
    bank_transfer: 'Virement Bancaire',
  };

  return {
    ticketNumber: `TKT-PMB-${datePart}-${rand}`,
    issuedAt: now.toISOString(),
    issuedAtLabel: now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    candidateName: params.candidateName.trim() || 'Candidat / Membre PMB',
    category: params.category || 'Membre effectif',
    paymentMethod: params.paymentMethod,
    paymentMethodLabel: methodLabelMap[params.paymentMethod],
    channelUsedLabel: params.channelUsedLabel,
    destinationAccount: params.destinationAccount,
    amountUsd: params.amountUsd,
    transactionRef: params.transactionRef.trim(),
    proofFileName: params.proofFileName ?? null,
    status:
      'Preuve de paiement enregistrée (en attente de validation par les organes compétents)',
  };
}
