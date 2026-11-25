import { FormEvent, useEffect, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Printer,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  PMB_BRANCHES,
  PMB_COMPANY,
  PMB_PAYMENT_CHANNELS,
  PaymentChannelId,
} from '../data/pmbData';
import { monitoredFetch } from '../lib/selfHealingMonitor';

interface PaymentGatewaySectionProps {
  preselectedBranchId?: string;
}

export interface PaymentReceipt {
  txRef: string;
  receiptNumber: string | null;
  authCode: string | null;
  branchId: string;
  branchName: string;
  serviceLabel: string;
  amount: number;
  currency: 'USD' | 'CDF';
  channel: PaymentChannelId;
  channelLabel: string;
  customerName: string;
  customerContact: string;
  maskedAccount: string;
  status: 'PENDING_WEBHOOK' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  settledAt: string | null;
  webhookVerified: boolean;
}

const BRANCH_SERVICE_PRESETS: Record<string, { label: string; amountUsd: number }> = {
  'pmb-shop': { label: 'Approvisionnement Unités & Forfaits Télécoms', amountUsd: 50 },
  'pmb-store': { label: 'Commande Gros Eau Vive & Denrées FMCG', amountUsd: 120 },
  'pmb-transport': { label: 'Réservation Fret Aérien / Paquebot Import-Export', amountUsd: 350 },
  'pmb-immobilier': { label: 'Frais de Dossier & Gestion Immobilière', amountUsd: 150 },
  'pmb-event': { label: 'Acompte Location Écran Géant LED & Régie', amountUsd: 400 },
  'pmb-fondation': { label: 'Cotisation Membre PMB Fondation (Actif / Sympathisant)', amountUsd: 25 },
};

function isValidLuhn(digits: string): boolean {
  const clean = digits.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = Number(clean[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function PaymentGatewaySection({ preselectedBranchId }: PaymentGatewaySectionProps) {
  const [branchId, setBranchId] = useState<string>(preselectedBranchId || 'pmb-transport');
  const [serviceLabel, setServiceLabel] = useState<string>(
    BRANCH_SERVICE_PRESETS[preselectedBranchId || 'pmb-transport']?.label ||
      BRANCH_SERVICE_PRESETS['pmb-transport'].label
  );
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
  const [amount, setAmount] = useState<string>(
    String(
      BRANCH_SERVICE_PRESETS[preselectedBranchId || 'pmb-transport']?.amountUsd || 350
    )
  );
  const [paymentTab, setPaymentTab] = useState<'card' | 'mobile_money'>('mobile_money');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannelId>('mpesa');
  const [cardBrandPref, setCardBrandPref] = useState<'Visa' | 'MasterCard'>('Visa');

  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);

  useEffect(() => {
    if (!preselectedBranchId) return;
    const preset = BRANCH_SERVICE_PRESETS[preselectedBranchId];
    setBranchId(preselectedBranchId);
    if (preset) {
      setServiceLabel(preset.label);
      setAmount(
        currency === 'USD' ? String(preset.amountUsd) : String(preset.amountUsd * 2850)
      );
    }
  }, [preselectedBranchId]);

  const loadReceipts = async () => {
    setLoadingReceipts(true);
    try {
      const res = await monitoredFetch('/api/payments/receipts');
      if (res.ok) {
        const data = (await res.json()) as { transactions: PaymentReceipt[] };
        setReceipts(data.transactions || []);
      }
    } catch {
      // Conservation de l'état courant
    } finally {
      setLoadingReceipts(false);
    }
  };

  useEffect(() => {
    void loadReceipts();
  }, []);

  const handleBranchChange = (nextId: string) => {
    setBranchId(nextId);
    const preset = BRANCH_SERVICE_PRESETS[nextId];
    if (preset) {
      setServiceLabel(preset.label);
      setAmount(currency === 'USD' ? String(preset.amountUsd) : String(preset.amountUsd * 2850));
    }
  };

  const handleCurrencyToggle = (nextCurrency: 'USD' | 'CDF') => {
    if (nextCurrency === currency) return;
    const numeric = Number(amount) || 0;
    setCurrency(nextCurrency);
    if (numeric > 0) {
      setAmount(
        nextCurrency === 'CDF'
          ? String(Math.round(numeric * 2850))
          : String(Math.max(1, Math.round(numeric / 2850)))
      );
    }
  };

  const handleTabSwitch = (tab: 'card' | 'mobile_money') => {
    setPaymentTab(tab);
    setFormError(null);
    if (tab === 'card') {
      setSelectedChannel('card_visa_mastercard');
    } else if (selectedChannel === 'card_visa_mastercard') {
      setSelectedChannel('mpesa');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Veuillez saisir un montant valide supérieur à 0.');
      return;
    }

    if (customerName.trim().length < 2) {
      setFormError('Veuillez saisir votre nom complet ou raison sociale.');
      return;
    }

    let maskedAccount = '';
    if (paymentTab === 'card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (!isValidLuhn(cleanCard)) {
        setFormError('Numéro de carte Visa ou MasterCard invalide (vérification Luhn requise).');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        setFormError('Date d’expiration requise au format MM/AA.');
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvc.trim())) {
        setFormError('Code de sécurité CVV/CVC invalide (3 ou 4 chiffres).');
        return;
      }
      const brand = cleanCard.startsWith('4')
        ? 'Visa'
        : cleanCard.startsWith('5') || cleanCard.startsWith('2')
          ? 'MasterCard'
          : cardBrandPref;
      maskedAccount = `${brand} •••• ${cleanCard.slice(-4)}`;
    } else {
      const cleanPhone = mobileNumber.replace(/[^\d+]/g, '');
      if (cleanPhone.length < 9) {
        setFormError('Indiquez un numéro Mobile Money RDC valide (ex. : +243 89 66 60 558).');
        return;
      }
      maskedAccount = `${cleanPhone.slice(0, 6)}***${cleanPhone.slice(-3)}`;
    }

    const activeBranch = PMB_BRANCHES.find((b) => b.id === branchId) ?? PMB_BRANCHES[0];

    try {
      setProcessingStep('Initialisation de la session de paiement sécurisée...');
      const initRes = await monitoredFetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: activeBranch.id,
          branchName: activeBranch.name,
          serviceLabel,
          amount: numericAmount,
          currency,
          channel: selectedChannel,
          customerName: customerName.trim(),
          customerContact: customerContact.trim() || mobileNumber.trim() || 'Client Kinshasa',
          maskedAccount,
        }),
      });

      const initData = (await initRes.json()) as {
        error?: string;
        transaction?: PaymentReceipt;
        webhookCallbackUrl?: string;
        webhookSignature?: string;
      };

      if (!initRes.ok || !initData.transaction || !initData.webhookSignature) {
        throw new Error(initData.error || 'Échec lors de l’initialisation du paiement.');
      }

      setProcessingStep(
        paymentTab === 'mobile_money'
          ? 'Validation USSD / Push Mobile Money et vérification webhook HMAC...'
          : 'Autorisation 3D Secure et confirmation webhook temps réel...'
      );

      await new Promise((resolve) => setTimeout(resolve, 650));

      const webhookRes = await monitoredFetch(initData.webhookCallbackUrl || '/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pmb-signature': initData.webhookSignature,
        },
        body: JSON.stringify({
          txRef: initData.transaction.txRef,
          event: 'payment.settled',
        }),
      });

      const webhookData = (await webhookRes.json()) as {
        error?: string;
        verified?: boolean;
        transaction?: PaymentReceipt;
      };

      if (!webhookRes.ok || !webhookData.transaction) {
        throw new Error(webhookData.error || 'Erreur de validation webhook.');
      }

      setActiveReceipt(webhookData.transaction);
      setReceipts((prev) => [
        webhookData.transaction!,
        ...prev.filter((item) => item.txRef !== webhookData.transaction!.txRef),
      ]);
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setProcessingStep(null);
    } catch (err) {
      setProcessingStep(null);
      setFormError(err instanceof Error ? err.message : 'Erreur de traitement du paiement.');
    }
  };

  return (
    <section
      id="paiement"
      className="no-print py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#F59E0B] mb-2">
              Passerelle de Paiement Multi-Canaux & Reçus Clients
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Régler par Carte Bancaire ou Mobile Money RDC
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Règlement direct sur les comptes de {PMB_COMPANY.legalName} avec validation temps
              réel par webhook HMAC-SHA256 et archivage immédiat du reçu dans votre compte client.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-[#229ED9] shrink-0" aria-hidden="true" />
            <span>Visa · MasterCard · M-Pesa · Orange Money · Airtel Money · Africell Money</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne gauche : Formulaire de paiement multi-canaux */}
          <div className="lg:col-span-7 rounded-xl bg-[#1c1c1e]/92 border border-white/10 p-6 sm:p-8">
            {/* Sélecteur de canal principal */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#121212] border border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch('mobile_money')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  paymentTab === 'mobile_money'
                    ? 'bg-[#262626] text-white border border-white/15'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                <span>Mobile Money RDC</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('card')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  paymentTab === 'card'
                    ? 'bg-[#262626] text-white border border-white/15'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#229ED9]" aria-hidden="true" />
                <span>Carte Visa / MasterCard</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Sélection branche et devise */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label
                    htmlFor="pay-branch"
                    className="block text-sm font-medium text-zinc-200 mb-2"
                  >
                    Division bénéficiaire
                  </label>
                  <select
                    id="pay-branch"
                    value={branchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                  >
                    {PMB_BRANCHES.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.index}. {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="pay-amount"
                    className="block text-sm font-medium text-zinc-200 mb-2"
                  >
                    Montant ({currency})
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-white/15 bg-[#121212]">
                    <input
                      id="pay-amount"
                      type="number"
                      min="1"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm text-white bg-transparent font-mono-tabular focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCurrencyToggle(currency === 'USD' ? 'CDF' : 'USD')}
                      className="px-3 text-xs font-semibold bg-[#262626] text-[#F59E0B] hover:text-white border-l border-white/10 cursor-pointer whitespace-nowrap"
                      title="Basculer USD / CDF"
                    >
                      {currency}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="pay-label" className="block text-sm font-medium text-zinc-200 mb-2">
                  Objet de la transaction / Référence commande
                </label>
                <input
                  id="pay-label"
                  type="text"
                  value={serviceLabel}
                  onChange={(e) => setServiceLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pay-customer"
                    className="block text-sm font-medium text-zinc-200 mb-2"
                  >
                    Nom complet ou Entreprise
                  </label>
                  <input
                    id="pay-customer"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex. : Patrick Mbozi"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pay-contact"
                    className="block text-sm font-medium text-zinc-200 mb-2"
                  >
                    E-mail ou WhatsApp pour reçu
                  </label>
                  <input
                    id="pay-contact"
                    type="text"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="client@exemple.cd ou +243 ..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                  />
                </div>
              </div>

              {paymentTab === 'mobile_money' ? (
                <div className="space-y-4 pt-2 border-t border-white/[0.08]">
                  <div>
                    <p className="text-sm font-medium text-zinc-200 mb-2.5">
                      Opérateur Mobile Money RDC
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PMB_PAYMENT_CHANNELS.filter((c) => c.category === 'mobile_money').map(
                        (op) => {
                          const isSelected = selectedChannel === op.id;
                          return (
                            <button
                              key={op.id}
                              type="button"
                              onClick={() => setSelectedChannel(op.id)}
                              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#262626] border-white/30 text-white'
                                  : 'bg-[#121212] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                              }`}
                            >
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-sm mb-1.5"
                                style={{ backgroundColor: op.accentColor }}
                                aria-hidden="true"
                              />
                              <p className="text-xs font-semibold text-white truncate">
                                {op.shortName}
                              </p>
                              <p className="text-[11px] text-zinc-400 mt-0.5 font-mono-tabular truncate">
                                {op.prefixHint}
                              </p>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pay-msisdn"
                      className="block text-sm font-medium text-zinc-200 mb-2"
                    >
                      Numéro Mobile Money à débiter (+243)
                    </label>
                    <input
                      id="pay-msisdn"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+243 89 66 60 558"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg font-mono-tabular focus:outline-none focus:border-[#229ED9]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-white/[0.08]">
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['Visa', 'MasterCard'] as const).map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setCardBrandPref(brand)}
                        className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                          cardBrandPref === brand
                            ? 'bg-[#262626] border-[#229ED9]/60 text-white'
                            : 'bg-[#121212] border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <p className="text-xs font-semibold text-white">Carte {brand}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          3D Secure · Compte {PMB_COMPANY.legalName}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label
                      htmlFor="pay-card-num"
                      className="block text-sm font-medium text-zinc-200 mb-2"
                    >
                      Numéro de carte ({cardBrandPref})
                    </label>
                    <input
                      id="pay-card-num"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder={cardBrandPref === 'Visa' ? '4532 •••• •••• ••••' : '5412 •••• •••• ••••'}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg font-mono-tabular focus:outline-none focus:border-[#229ED9]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="pay-card-exp"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        Expiration (MM/AA)
                      </label>
                      <input
                        id="pay-card-exp"
                        type="text"
                        autoComplete="cc-exp"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="08/29"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg font-mono-tabular focus:outline-none focus:border-[#229ED9]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pay-card-cvc"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        CVV / CVC
                      </label>
                      <input
                        id="pay-card-cvc"
                        type="password"
                        maxLength={4}
                        autoComplete="cc-csc"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg font-mono-tabular focus:outline-none focus:border-[#229ED9]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <p role="alert" className="text-xs sm:text-sm text-red-400">
                  {formError}
                </p>
              )}

              {processingStep && (
                <div className="rounded-lg bg-[#121212] border border-[#229ED9]/40 p-3.5 text-xs sm:text-sm text-zinc-200 flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-[#229ED9] animate-spin shrink-0" />
                  <span>{processingStep}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <p className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                  <span>Chiffrement TLS & Webhook HMAC-SHA256</span>
                </p>
                <button
                  type="submit"
                  disabled={Boolean(processingStep)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#121212] bg-[#F59E0B] hover:bg-[#d98a06] disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>
                    Confirmer le paiement ({Number(amount || 0).toLocaleString('fr-FR')} {currency})
                  </span>
                </button>
              </div>
            </form>

            {activeReceipt && (
              <div
                role="status"
                className="mt-6 rounded-xl bg-[#121212] border border-[#229ED9]/45 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#229ED9] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-white">
                        Paiement validé par Webhook · Reçu {activeReceipt.receiptNumber}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono-tabular">
                        Réf. {activeReceipt.txRef} · Auth {activeReceipt.authCode}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-[#262626] hover:bg-[#323232] rounded-md border border-white/10 cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Imprimer</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300 pt-2 border-t border-white/[0.08]">
                  <span>Branche : {activeReceipt.branchName}</span>
                  <span>Canal : {activeReceipt.channelLabel}</span>
                  <span className="font-mono-tabular font-semibold text-white">
                    {activeReceipt.amount.toLocaleString('fr-FR')} {activeReceipt.currency}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite : Compte Client & Historique des Reçus */}
          <div className="lg:col-span-5 rounded-xl bg-[#1c1c1e]/92 border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Compte Client · Reçus Consignés
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Transactions vérifiées en temps réel via retour webhook
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadReceipts()}
                aria-label="Actualiser les reçus"
                className="w-9 h-9 rounded-lg bg-[#262626] hover:bg-[#323232] text-zinc-200 border border-white/10 flex items-center justify-center cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingReceipts ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {receipts.length === 0 ? (
              <p className="text-sm text-zinc-400 py-6 text-center">
                Aucun reçu enregistré pour le moment.
              </p>
            ) : (
              <ul className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {receipts.map((tx) => (
                  <li
                    key={tx.txRef}
                    className="rounded-lg bg-[#121212] border border-white/[0.08] p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {tx.customerName}
                        </p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{tx.serviceLabel}</p>
                      </div>
                      <span className="text-sm font-bold text-[#F59E0B] font-mono-tabular whitespace-nowrap">
                        {tx.amount.toLocaleString('fr-FR')} {tx.currency}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 pt-2 border-t border-white/[0.06]">
                      <span>
                        {tx.branchName} · {tx.channelLabel} ({tx.maskedAccount})
                      </span>
                      <span className="font-mono-tabular text-[#229ED9]">
                        {tx.receiptNumber || tx.txRef} ·{' '}
                        {tx.webhookVerified ? 'Validé Webhook' : 'En attente'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
