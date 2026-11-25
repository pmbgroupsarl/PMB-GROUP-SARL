import { FormEvent, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  Copy,
  CreditCard,
  Lock,
  Receipt,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
} from 'lucide-react';
import { PMB_BRANCHES, PMB_MEMBERSHIP_PAYMENT_INFO } from '../../data/pmbData';
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
import { usePmbStore } from '../../lib/pmbStore';
import { PaymentProofTicketCard } from '../registration/PaymentProofTicketCard';

interface FondationPaymentPillarProps {
  activeTicket: MembershipPaymentTicket | null;
  onTicketGenerated: (ticket: MembershipPaymentTicket | null) => void;
  onGoToAdhesion: () => void;
}

type PaymentModeType = 'membre_effectif' | 'voluntary_contribution';

export function FondationPaymentPillar({
  activeTicket,
  onTicketGenerated,
  onGoToAdhesion,
}: FondationPaymentPillarProps) {
  const { currentMember, addOrder, addMembershipRecord } = usePmbStore();
  const fondationBranch = PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;

  const [paymentModeType, setPaymentModeType] = useState<PaymentModeType>('membre_effectif');
  const [candidateName, setCandidateName] = useState(currentMember?.fullName || '');
  const [candidateContact, setCandidateContact] = useState(currentMember?.phone || '+243 ');
  const [amountInput, setAmountInput] = useState('20');

  const [method, setMethod] = useState<MembershipPaymentMethod>('mobile_money');
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>(
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers[0].id
  );
  const [mobileRef, setMobileRef] = useState('');

  const [cardHolder, setCardHolder] = useState(currentMember?.fullName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [bankRef, setBankRef] = useState('');
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [proofFile, setProofFile] = useState<{ name: string; size: number } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receiptHistory, setReceiptHistory] = useState<MembershipPaymentTicket[]>([]);

  const selectedNetwork =
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers.find((n) => n.id === selectedNetworkId) ??
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers[0];

  const handleCopy = async (key: string, textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 2000);
    } catch {
      // Clipboard indisponible
    }
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const err = validateProofUploadFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setProofFile({ name: file.name, size: file.size });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (candidateName.trim().length < 2) {
      setError('Veuillez saisir le nom complet du membre ou du contributeur.');
      return;
    }

    let validAmount = 0;
    if (paymentModeType === 'membre_effectif') {
      const check = validateContributionAmountUsd(amountInput);
      if (!check.valid) {
        setError(check.error);
        return;
      }
      validAmount = check.amount;
    } else {
      const parsed = Number(amountInput.replace(',', '.').trim());
      if (!Number.isFinite(parsed) || parsed < 1) {
        setError(
          'Veuillez saisir un montant valide en USD (contribution libre ou à partir de 20 $ USD).'
        );
        return;
      }
      validAmount = Math.round(parsed * 100) / 100;
    }

    const categoryLabel =
      paymentModeType === 'membre_effectif'
        ? 'Membre effectif (Cotisation obligatoire)'
        : 'Contribution volontaire / Don ponctuel';

    let generated: MembershipPaymentTicket;

    if (method === 'mobile_money') {
      if (mobileRef.trim().length < 4 && !proofFile) {
        setError(
          `Veuillez saisir la référence de transaction ${selectedNetwork.networkName} ou joindre une capture de paiement.`
        );
        return;
      }
      generated = createMembershipPaymentTicket({
        candidateName: candidateName.trim(),
        category: categoryLabel,
        paymentMethod: 'mobile_money',
        channelUsedLabel: `${selectedNetwork.networkName} — ${selectedNetwork.number}`,
        destinationAccount: selectedNetwork.number,
        amountUsd: validAmount,
        transactionRef: mobileRef.trim() || 'PREUVE-CAPTURE-JOINTE',
        proofFileName: proofFile ? proofFile.name : null,
      });
    } else if (method === 'card_visa_mastercard') {
      const cardErr = validateCardPaymentFields({
        cardHolder: cardHolder.trim() || candidateName.trim(),
        cardNumber,
        expiry: cardExpiry,
        cvv: cardCvv,
      });
      if (cardErr) {
        setError(cardErr);
        return;
      }
      const digits = cardNumber.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      generated = createMembershipPaymentTicket({
        candidateName: candidateName.trim(),
        category: categoryLabel,
        paymentMethod: 'card_visa_mastercard',
        channelUsedLabel: `Visa / Mastercard (•••• ${last4})`,
        destinationAccount: `Visa / Mastercard •••• ${last4} (PMB Fondation)`,
        amountUsd: validAmount,
        transactionRef: `AUTH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        proofFileName: null,
      });
    } else {
      if (bankRef.trim().length < 4 && !proofFile) {
        setError(
          'Veuillez saisir la référence du virement bancaire ou joindre le bordereau de virement.'
        );
        return;
      }
      const acct = PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber;
      const benef = PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName;
      generated = createMembershipPaymentTicket({
        candidateName: candidateName.trim(),
        category: categoryLabel,
        paymentMethod: 'bank_transfer',
        channelUsedLabel: `Virement Bancaire — Compte ${acct} / Bénéficiaire : ${benef}`,
        destinationAccount: `${acct} — ${benef}`,
        amountUsd: validAmount,
        transactionRef: bankRef.trim() || 'BORDEREAU-VIREMENT-JOINT',
        proofFileName: proofFile ? proofFile.name : null,
      });
    }

    onTicketGenerated(generated);
    setReceiptHistory((prev) => [generated, ...prev]);

    addOrder({
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      customerName: candidateName.trim(),
      customerContact: candidateContact.trim() || '+243',
      serviceOrArticle: `${categoryLabel} (${generated.ticketNumber})`,
      amountLabel: `${validAmount.toFixed(2)} $ USD`,
      status: 'Confirmée',
    });

    if (paymentModeType === 'voluntary_contribution') {
      const now = new Date();
      addMembershipRecord({
        dossierId: `PMB-DON-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(
          now.getDate()
        ).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`,
        kind: 'visitor',
        branchId: 'pmb-fondation',
        branchName: 'PMB Fondation',
        fullName: candidateName.trim(),
        gender: 'Non précisé',
        birthDate: '—',
        birthPlace: 'Kinshasa, RDC',
        address: 'Contribution via Pilier 1 (PMB Fondation)',
        phone: candidateContact.trim() || 'Non renseigné',
        email: currentMember?.email || 'donateur@pmb-fondation.cd',
        category: 'Contribution volontaire / Don ponctuel',
        subscriptionStatus: 'Don ponctuel confirmé',
        expiresAtIso: null,
        expiresAtLabel: 'Contribution unique',
        createdAtLabel: now.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        paymentTicket: generated,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête Pilier 1 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
            Pilier 1 · Passerelle de Paiement Multi-Canaux & Reçus Clients
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Régler votre cotisation ou contribution PMB Fondation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Paiement obligatoire (à partir de <strong className="text-white">20 $ USD</strong>) pour
            valider une adhésion <strong className="text-white">Membre effectif</strong> ;
            contribution volontaire (à partir de 20 $ USD ou montant libre supérieur) pour les autres
            catégories et dons ponctuels. Chaque transaction génère un Ticket / Reçu officiel.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-zinc-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#0284c7]" aria-hidden="true" />
          <span>Orange Money · Airtel Money · M-Pesa · Visa / Mastercard · Virement Bancaire</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne gauche : Formulaire de paiement multi-canaux */}
        <div className="lg:col-span-7 rounded-xl bg-[#1c1c1e] border border-white/10 p-6 sm:p-8 space-y-6">
          {/* Sélecteur de règle métier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 rounded-xl bg-[#121212] border border-white/10">
            <button
              type="button"
              onClick={() => {
                setPaymentModeType('membre_effectif');
                if (Number(amountInput) < 20) setAmountInput('20');
                setError(null);
              }}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-left transition-colors cursor-pointer ${
                paymentModeType === 'membre_effectif'
                  ? 'bg-[#229ED9] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block">Membre effectif (Obligatoire)</span>
              <span className="block text-[11px] opacity-85 font-normal">
                Minimum 20 $ USD · Valide l’adhésion
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentModeType('voluntary_contribution');
                setError(null);
              }}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-left transition-colors cursor-pointer ${
                paymentModeType === 'voluntary_contribution'
                  ? 'bg-[#F59E0B] text-[#121212]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="block">Contribution volontaire / Don ponctuel</span>
              <span className="block text-[11px] opacity-85 font-normal">
                À partir de 20 $ ou montant libre
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p1-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nom complet du membre / donateur *
                </label>
                <input
                  id="p1-name"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Ex. : Prisca Mbozi"
                  className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="p1-contact" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Téléphone WhatsApp ou e-mail
                </label>
                <input
                  id="p1-contact"
                  type="text"
                  value={candidateContact}
                  onChange={(e) => setCandidateContact(e.target.value)}
                  placeholder="+243 896 660 558"
                  className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                />
              </div>
            </div>

            {/* Montant USD */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <label htmlFor="p1-amount" className="font-medium text-zinc-300">
                  Montant en USD{' '}
                  {paymentModeType === 'membre_effectif'
                    ? '(obligatoire : à partir de 20 $ USD)'
                    : '(20 $ USD ou montant libre)'}
                </label>
                <span className="font-mono-tabular text-zinc-400">Devise : $ USD</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {PMB_MEMBERSHIP_PAYMENT_INFO.presetAmountsUsd.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountInput(String(preset))}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-mono-tabular font-semibold cursor-pointer ${
                      Number(amountInput) === preset
                        ? 'bg-[#F59E0B] text-[#121212] border-[#F59E0B]'
                        : 'bg-[#121212] text-zinc-300 border-white/15 hover:border-white/30'
                    }`}
                  >
                    {preset} $
                  </button>
                ))}
                <div className="relative flex-1 min-w-[150px]">
                  <input
                    id="p1-amount"
                    type="number"
                    min={paymentModeType === 'membre_effectif' ? 20 : 1}
                    step="1"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#121212] pl-3.5 pr-12 py-2 text-sm text-white font-mono-tabular focus:border-[#229ED9] focus:outline-none"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-tabular text-zinc-400">
                    USD
                  </span>
                </div>
              </div>
            </div>

            {/* Sélection du canal */}
            <div className="space-y-4">
              <span className="block text-xs font-medium text-zinc-300">
                Canal de paiement officiel PMB Fondation
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('mobile_money');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap ${
                    method === 'mobile_money'
                      ? 'bg-[#229ED9] text-white border-[#229ED9]'
                      : 'bg-[#121212] text-zinc-300 border-white/15 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Mobile Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod('card_visa_mastercard');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap ${
                    method === 'card_visa_mastercard'
                      ? 'bg-[#229ED9] text-white border-[#229ED9]'
                      : 'bg-[#121212] text-zinc-300 border-white/15 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod('bank_transfer');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap ${
                    method === 'bank_transfer'
                      ? 'bg-[#229ED9] text-white border-[#229ED9]'
                      : 'bg-[#121212] text-zinc-300 border-white/15 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Virement Bancaire</span>
                </button>
              </div>

              {method === 'mobile_money' && (
                <div className="rounded-xl border border-white/10 bg-[#121212] p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers.map((line) => (
                      <div
                        key={line.id}
                        className={`rounded-lg border p-3 flex items-center justify-between gap-2 ${
                          selectedNetworkId === line.id
                            ? 'border-[#229ED9] bg-[#229ED9]/10'
                            : 'border-white/10 bg-[#1c1c1e]'
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
                          <span className="block text-xs font-bold font-mono-tabular text-white truncate mt-0.5">
                            {line.number}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleCopy(line.id, line.number)}
                          aria-label={`Copier ${line.networkName}`}
                          className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-200 cursor-pointer shrink-0"
                        >
                          {copiedKey === line.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label
                      htmlFor="p1-mm-ref"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      Référence de transaction {selectedNetwork.networkName}
                    </label>
                    <input
                      id="p1-mm-ref"
                      type="text"
                      value={mobileRef}
                      onChange={(e) => setMobileRef(e.target.value)}
                      placeholder="Ex. : TX261119.1422.A98412"
                      className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {method === 'card_visa_mastercard' && (
                <div className="rounded-xl border border-white/10 bg-[#121212] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Nom du titulaire de la carte"
                    className="sm:col-span-2 rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumberDisplay(e.target.value))}
                    placeholder="Numéro Visa / Mastercard"
                    className="sm:col-span-2 rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatCardExpiryDisplay(e.target.value))}
                    placeholder="MM/AA"
                    className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="CVV"
                    className="rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                </div>
              )}

              {method === 'bank_transfer' && (
                <div className="rounded-xl border border-white/10 bg-[#121212] p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-[#1c1c1e] p-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] text-zinc-400">Compte N°</span>
                        <span className="block text-sm font-bold font-mono-tabular text-white">
                          {PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(
                            'p1-acct',
                            PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber
                          )
                        }
                        className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                        aria-label="Copier le numéro de compte"
                      >
                        {copiedKey === 'p1-acct' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#1c1c1e] p-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] text-zinc-400">Bénéficiaire</span>
                        <span className="block text-sm font-bold text-[#F59E0B]">
                          {PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(
                            'p1-benef',
                            PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName
                          )
                        }
                        className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                        aria-label="Copier le nom du bénéficiaire"
                      >
                        {copiedKey === 'p1-benef' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="Référence du virement bancaire..."
                    className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                </div>
              )}

              {method !== 'card_visa_mastercard' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-dashed border-white/20 bg-[#121212] px-4 py-3">
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
                        Justificatif : {proofFile.name} ({formatFileSize(proofFile.size)})
                      </span>
                    ) : (
                      <span>Capture ou bordereau de paiement (optionnel si référence saisie)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-white cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{proofFile ? 'Remplacer' : 'Joindre preuve'}</span>
                    </button>
                    {proofFile && (
                      <button
                        type="button"
                        onClick={() => setProofFile(null)}
                        aria-label="Retirer"
                        className="p-1.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2 text-xs text-red-300"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Receipt className="w-4 h-4" aria-hidden="true" />
                <span>Générer le Ticket / Reçu Officiel</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-[#229ED9]" aria-hidden="true" />
                <span>Impression A4 & téléchargement immédiats</span>
              </span>
            </div>
          </form>
        </div>

        {/* Colonne droite : Reçu Officiel Généré & Historique */}
        <div className="lg:col-span-5 space-y-5">
          {activeTicket ? (
            <div className="space-y-4">
              <PaymentProofTicketCard
                ticket={activeTicket}
                variant="dark"
                onResetPayment={() => onTicketGenerated(null)}
              />

              <div className="rounded-xl bg-[#1c1c1e] border border-[#229ED9]/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#229ED9]">Étape suivante (Pilier 2)</p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Ce ticket est automatiquement lié à votre fiche d’adhésion PMB Fondation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onGoToAdhesion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Remplir la Fiche Officielle</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                <img
                  src={fondationBranch.logoImage}
                  alt="Logo PMB FONDATION"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-white/15 shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold text-white">Aperçu du Ticket / Reçu Officiel</h3>
                  <p className="text-xs text-zinc-400">
                    S’affiche instantanément après validation du paiement.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-[#121212] border border-white/[0.08] p-4 space-y-2 text-xs text-zinc-400">
                <p className="font-semibold text-zinc-200">Canaux officiels acceptés :</p>
                <p>· Orange Money : +243 896 660 558</p>
                <p>· Airtel Money : +243 962 300 003</p>
                <p>· M-Pesa : +243 83 39 93 994</p>
                <p>· Carte Bancaire : Visa / Mastercard</p>
                <p>· Virement : Compte 700200168688373 (Mbozi Beloti Prisca)</p>
              </div>
            </div>
          )}

          {receiptHistory.length > 0 && (
            <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Reçus générés durant cette session ({receiptHistory.length})
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {receiptHistory.map((item) => (
                  <button
                    key={item.ticketNumber}
                    type="button"
                    onClick={() => onTicketGenerated(item)}
                    className="w-full text-left rounded-lg bg-[#121212] hover:bg-[#262626] border border-white/10 p-3 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-mono-tabular text-white truncate">
                        {item.ticketNumber}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {item.candidateName} · {item.channelUsedLabel}
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono-tabular text-[#F59E0B] shrink-0">
                      {item.amountUsd.toFixed(2)} $
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
