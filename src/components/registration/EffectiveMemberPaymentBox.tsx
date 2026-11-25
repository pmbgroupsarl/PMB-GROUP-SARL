import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  HeartHandshake,
  Lock,
  Receipt,
  Smartphone,
  Trash2,
  Upload,
} from 'lucide-react';
import { PMB_MEMBERSHIP_PAYMENT_INFO } from '../../data/pmbData';
import {
  MembershipPaymentMethod,
  MembershipPaymentTicket,
  createMembershipPaymentTicket,
  formatCardExpiryDisplay,
  formatCardNumberDisplay,
  validateCardPaymentFields,
  validateContributionAmountUsd,
  validateProofUploadFile,
} from '../../lib/membershipPayment';
import { formatFileSize } from '../../lib/registrationMedia';
import { PaymentProofTicketCard } from './PaymentProofTicketCard';

interface EffectiveMemberPaymentBoxProps {
  category: string;
  candidateName: string;
  ticket: MembershipPaymentTicket | null;
  onTicketChange: (next: MembershipPaymentTicket | null) => void;
  paymentGateError?: string | null;
}

export function EffectiveMemberPaymentBox({
  category,
  candidateName,
  ticket,
  onTicketChange,
  paymentGateError,
}: EffectiveMemberPaymentBoxProps) {
  const isMandatory = category === 'Membre effectif';
  const [voluntaryOpen, setVoluntaryOpen] = useState(false);

  const [amountInput, setAmountInput] = useState<string>('20');
  const [method, setMethod] = useState<MembershipPaymentMethod>('mobile_money');

  // Mobile Money nommé (Orange Money, Airtel Money, M-Pesa)
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>(
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers[0].id
  );
  const [mobileRef, setMobileRef] = useState('');

  // Carte Bancaire (Mastercard / Visa)
  const [cardHolder, setCardHolder] = useState(candidateName);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Virement Bancaire
  const [bankRef, setBankRef] = useState('');

  // Preuve optionnelle jointe (Mobile Money / Virement)
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [proofFile, setProofFile] = useState<{ name: string; size: number } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
  }, [category]);

  const selectedNetwork =
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers.find(
      (n) => n.id === selectedNetworkId
    ) ?? PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers[0];

  const amountCheck = validateContributionAmountUsd(amountInput);

  const handleCopy = async (key: string, textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch {
      // Clipboard API indisponible
    }
  };

  const handleProofFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const err = validateProofUploadFile(file);
    if (err) {
      setLocalError(err);
      return;
    }

    setLocalError(null);
    setProofFile({ name: file.name, size: file.size });
  };

  const handleGenerateTicket = () => {
    setLocalError(null);

    if (!amountCheck.valid) {
      setLocalError(amountCheck.error);
      return;
    }

    if (method === 'mobile_money') {
      if (mobileRef.trim().length < 4 && !proofFile) {
        setLocalError(
          `Veuillez saisir la référence de transaction ${selectedNetwork.networkName} ou joindre une capture de paiement.`
        );
        return;
      }

      const channelUsedLabel = `${selectedNetwork.networkName} — ${selectedNetwork.number}`;
      const nextTicket = createMembershipPaymentTicket({
        candidateName,
        category,
        paymentMethod: 'mobile_money',
        channelUsedLabel,
        destinationAccount: selectedNetwork.number,
        amountUsd: amountCheck.amount,
        transactionRef: mobileRef.trim() || 'PREUVE-CAPTURE-JOINTE',
        proofFileName: proofFile ? proofFile.name : null,
      });
      onTicketChange(nextTicket);
      return;
    }

    if (method === 'card_visa_mastercard') {
      const effectiveHolder = cardHolder.trim() || candidateName.trim();
      const cardErr = validateCardPaymentFields({
        cardHolder: effectiveHolder,
        cardNumber,
        expiry: cardExpiry,
        cvv: cardCvv,
      });
      if (cardErr) {
        setLocalError(cardErr);
        return;
      }

      const digits = cardNumber.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      const authCode = `AUTH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const nextTicket = createMembershipPaymentTicket({
        candidateName: candidateName.trim() || effectiveHolder,
        category,
        paymentMethod: 'card_visa_mastercard',
        channelUsedLabel: `Mastercard / Visa (•••• ${last4})`,
        destinationAccount: `Mastercard / Visa •••• ${last4} (PMB GROUP SARL)`,
        amountUsd: amountCheck.amount,
        transactionRef: authCode,
        proofFileName: null,
      });
      onTicketChange(nextTicket);
      return;
    }

    // Virement bancaire
    if (bankRef.trim().length < 4 && !proofFile) {
      setLocalError(
        'Veuillez indiquer la référence du virement bancaire ou joindre le bordereau de virement.'
      );
      return;
    }

    const bankAcct = PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber;
    const bankBenef = PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName;

    const nextTicket = createMembershipPaymentTicket({
      candidateName,
      category,
      paymentMethod: 'bank_transfer',
      channelUsedLabel: `Virement Bancaire — Compte ${bankAcct} / Bénéficiaire : ${bankBenef}`,
      destinationAccount: `${bankAcct} — ${bankBenef}`,
      amountUsd: amountCheck.amount,
      transactionRef: bankRef.trim() || 'BORDEREAU-VIREMENT-JOINT',
      proofFileName: proofFile ? proofFile.name : null,
    });
    onTicketChange(nextTicket);
  };

  const showPaymentForm = isMandatory || voluntaryOpen || Boolean(ticket);

  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 space-y-5 ${
        paymentGateError && !ticket && isMandatory
          ? 'border-red-500/50 bg-[#121212]'
          : isMandatory
            ? 'border-[#229ED9]/35 bg-[#121212]'
            : 'border-white/10 bg-[#121212]/90'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              isMandatory ? 'text-[#F59E0B]' : 'text-[#229ED9]'
            }`}
          >
            {isMandatory
              ? 'Étape obligatoire · Catégorie Membre effectif'
              : `Contribution volontaire (facultative) · ${category}`}
          </p>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            {isMandatory
              ? 'Règlement & Preuve de paiement d’adhésion (à partir de 20 $)'
              : 'Effectuer un versement volontaire (à partir de 20 $ USD)'}
          </h3>
        </div>

        {isMandatory ? (
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-300 shrink-0">
            <Lock className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
            <span>Obligatoire avant validation</span>
          </div>
        ) : (
          !ticket && (
            <button
              type="button"
              onClick={() => setVoluntaryOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
              <span>
                {voluntaryOpen
                  ? 'Masquer le paiement volontaire'
                  : 'Contribuer maintenant (≥ 20 $)'}
              </span>
              {voluntaryOpen ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          )
        )}
      </div>

      {!isMandatory && !showPaymentForm && (
        <p className="text-xs sm:text-sm text-zinc-400">
          Pour la catégorie <strong className="text-zinc-200">{category}</strong>, le paiement
          n’est pas obligatoire pour valider votre adhésion. Vous pouvez valider directement
          ci-dessous ou choisir d’effectuer une contribution volontaire à partir de{' '}
          <span className="font-mono-tabular text-zinc-200">20 $ USD</span>.
        </p>
      )}

      {showPaymentForm &&
        (ticket ? (
          <PaymentProofTicketCard
            ticket={ticket}
            candidateNameOverride={candidateName}
            variant="dark"
            onResetPayment={() => {
              onTicketChange(null);
              setLocalError(null);
              if (!isMandatory) setVoluntaryOpen(true);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* 1. CHOIX DU MONTANT (À PARTIR DE 20 $ OU SUPÉRIEUR À 20 $) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label
                  htmlFor="membership-amount-usd"
                  className="text-xs font-medium text-zinc-200"
                >
                  1. Montant en USD (à partir de 20 $ ou tout autre montant supérieur à 20 $){' '}
                  <span className="text-[#F59E0B]">*</span>
                </label>
                <span className="text-xs font-mono-tabular text-zinc-400">
                  Minimum : {PMB_MEMBERSHIP_PAYMENT_INFO.minAmountUsd} $ USD
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {PMB_MEMBERSHIP_PAYMENT_INFO.presetAmountsUsd.map((preset) => {
                  const isSelected = Number(amountInput.replace(',', '.')) === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmountInput(String(preset));
                        setLocalError(null);
                      }}
                      className={`px-4 py-2 rounded-lg border text-xs sm:text-sm font-mono-tabular font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#F59E0B] text-[#121212] border-[#F59E0B]'
                          : 'bg-[#1c1c1e] text-zinc-200 border-white/15 hover:border-white/30'
                      }`}
                    >
                      {preset} $
                    </button>
                  );
                })}

                <div className="relative flex-1 min-w-[170px] max-w-xs">
                  <input
                    id="membership-amount-usd"
                    type="number"
                    inputMode="decimal"
                    min={PMB_MEMBERSHIP_PAYMENT_INFO.minAmountUsd}
                    step="1"
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value);
                      setLocalError(null);
                    }}
                    placeholder="20 $ ou plus..."
                    className={`w-full rounded-lg border bg-[#1c1c1e] pl-3.5 pr-14 py-2 text-sm text-white font-mono-tabular focus:outline-none ${
                      !amountCheck.valid
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-white/15 focus:border-[#229ED9]'
                    }`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-tabular text-zinc-400">
                    $ USD
                  </span>
                </div>
              </div>

              {!amountCheck.valid && (
                <p role="alert" className="text-xs text-red-400">
                  {amountCheck.error}
                </p>
              )}
            </div>

            {/* 2. CHOIX DU MOYEN DE PAIEMENT */}
            <div className="space-y-4">
              <span className="block text-xs font-medium text-zinc-200">
                2. Moyen de paiement <span className="text-[#F59E0B]">*</span>
              </span>

              <div
                role="tablist"
                aria-label="Moyen de paiement"
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === 'mobile_money'}
                  onClick={() => {
                    setMethod('mobile_money');
                    setLocalError(null);
                  }}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    method === 'mobile_money'
                      ? 'bg-[#229ED9] text-white border-[#229ED9]'
                      : 'bg-[#1c1c1e] text-zinc-300 border-white/15 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Mobile Money</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={method === 'card_visa_mastercard'}
                  onClick={() => {
                    setMethod('card_visa_mastercard');
                    setLocalError(null);
                  }}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    method === 'card_visa_mastercard'
                      ? 'bg-[#229ED9] text-white border-[#229ED9]'
                      : 'bg-[#1c1c1e] text-zinc-300 border-white/15 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Mastercard / Visa</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={method === 'bank_transfer'}
                  onClick={() => {
                    setMethod('bank_transfer');
                    setLocalError(null);
                  }}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    method === 'bank_transfer'
                      ? 'bg-[#229ED9] text-white border-[#229ED9]'
                      : 'bg-[#1c1c1e] text-zinc-300 border-white/15 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Virement Bancaire</span>
                </button>
              </div>

              {/* OPTION 1 : MOBILE MONEY NOMMÉ */}
              {method === 'mobile_money' && (
                <div className="rounded-xl border border-white/10 bg-[#1c1c1e]/80 p-4 sm:p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200 mb-2">
                      Sélectionnez le réseau Mobile Money et copiez le numéro officiel :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers.map((line) => {
                        const active = selectedNetworkId === line.id;
                        const isCopied = copiedKey === line.id;
                        return (
                          <div
                            key={line.id}
                            className={`rounded-lg border p-3 flex items-center justify-between gap-2 transition-colors ${
                              active
                                ? 'border-[#229ED9] bg-[#229ED9]/10'
                                : 'border-white/10 bg-[#121212]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedNetworkId(line.id)}
                              className="text-left min-w-0 flex-1 cursor-pointer"
                            >
                              <span className="block text-xs font-semibold text-[#F59E0B]">
                                {line.networkName}
                              </span>
                              <span className="block text-xs sm:text-sm font-bold font-mono-tabular text-white truncate mt-0.5">
                                {line.number}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleCopy(line.id, line.number)}
                              aria-label={`Copier ${line.networkName} ${line.number}`}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 shrink-0 cursor-pointer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                                  <span className="text-emerald-400">Copié</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" aria-hidden="true" />
                                  <span>Copier</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mm-tx-ref"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      Référence de transaction {selectedNetwork.networkName} (ou joignez une
                      capture ci-dessous)
                    </label>
                    <input
                      id="mm-tx-ref"
                      type="text"
                      value={mobileRef}
                      onChange={(e) => {
                        setMobileRef(e.target.value);
                        setLocalError(null);
                      }}
                      placeholder="Ex. : TX261119.1422.A98412"
                      className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 font-mono-tabular focus:border-[#229ED9] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* OPTION 2 : CARTE BANCAIRE (MASTERCARD / VISA) */}
              {method === 'card_visa_mastercard' && (
                <div className="rounded-xl border border-white/10 bg-[#1c1c1e]/80 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
                    <span>Paiement sécurisé par Carte Bancaire (Mastercard / Visa)</span>
                    <span className="font-mono-tabular font-semibold text-[#F59E0B]">
                      Montant :{' '}
                      {amountCheck.valid ? `${amountCheck.amount.toFixed(2)} $ USD` : '—'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="card-holder"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Nom du titulaire <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        id="card-holder"
                        type="text"
                        value={cardHolder}
                        onChange={(e) => {
                          setCardHolder(e.target.value);
                          setLocalError(null);
                        }}
                        placeholder="Ex. : BENI MATONDO"
                        className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="card-number"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Numéro de carte (Mastercard / Visa){' '}
                        <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(formatCardNumberDisplay(e.target.value));
                          setLocalError(null);
                        }}
                        placeholder="5412 7512 3412 3456"
                        className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 font-mono-tabular focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="card-expiry"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Expiration (MM/AA) <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => {
                          setCardExpiry(formatCardExpiryDisplay(e.target.value));
                          setLocalError(null);
                        }}
                        placeholder="11/28"
                        className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 font-mono-tabular focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="card-cvv"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Code CVV <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        id="card-cvv"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => {
                          setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                          setLocalError(null);
                        }}
                        placeholder="•••"
                        className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 font-mono-tabular focus:border-[#229ED9] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OPTION 3 : VIREMENT BANCAIRE */}
              {method === 'bank_transfer' && (
                <div className="rounded-xl border border-white/10 bg-[#1c1c1e]/80 p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-[#121212] p-3.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] text-zinc-400">
                          Numéro de compte bancaire
                        </span>
                        <span className="block text-sm sm:text-base font-bold font-mono-tabular text-white mt-0.5">
                          {PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(
                            'bank-acct',
                            PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-zinc-200 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'bank-acct' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            <span className="text-emerald-400">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#121212] p-3.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] text-zinc-400">
                          Nom du bénéficiaire du compte
                        </span>
                        <span className="block text-sm sm:text-base font-bold text-[#F59E0B] mt-0.5">
                          {PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(
                            'bank-benef',
                            PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-zinc-200 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'bank-benef' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            <span className="text-emerald-400">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bank-tx-ref"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      Référence du virement bancaire (ou joignez le bordereau ci-dessous)
                    </label>
                    <input
                      id="bank-tx-ref"
                      type="text"
                      value={bankRef}
                      onChange={(e) => {
                        setBankRef(e.target.value);
                        setLocalError(null);
                      }}
                      placeholder="Ex. : VIR-20261119-0048"
                      className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 font-mono-tabular focus:border-[#229ED9] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TÉLÉVERSEMENT OPTIONNEL DE PREUVE / CAPTURE (MOBILE MONEY & VIREMENT) */}
              {method !== 'card_visa_mastercard' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-dashed border-white/20 bg-[#1c1c1e]/50 px-4 py-3">
                  <input
                    ref={proofInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleProofFileChange}
                    className="sr-only"
                  />
                  <div className="text-xs text-zinc-300">
                    {proofFile ? (
                      <span className="text-emerald-400 font-medium">
                        Preuve jointe : {proofFile.name} ({formatFileSize(proofFile.size)})
                      </span>
                    ) : (
                      <span>
                        Joindre une capture / bordereau de paiement (image ou PDF, optionnel si
                        référence saisie)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-white cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{proofFile ? 'Remplacer' : 'Téléverser preuve'}</span>
                    </button>
                    {proofFile && (
                      <button
                        type="button"
                        onClick={() => setProofFile(null)}
                        aria-label="Retirer la preuve"
                        className="p-1.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {(localError || paymentGateError) && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2 text-xs text-red-300"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{localError || paymentGateError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleGenerateTicket}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Receipt className="w-4 h-4" aria-hidden="true" />
                <span>Valider le paiement et générer le ticket</span>
              </button>

              <span className="text-xs text-zinc-400">
                Génère un ticket / preuve de paiement prévisualisable, imprimable et exportable.
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}
