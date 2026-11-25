import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  CreditCard,
  HeartHandshake,
  Smartphone,
} from 'lucide-react';
import { PMB_BRANCHES, PMB_MEMBERSHIP_PAYMENT_INFO } from '../../data/pmbData';
import {
  MembershipPaymentMethod,
  MembershipPaymentTicket,
  createMembershipPaymentTicket,
  formatCardExpiryDisplay,
  formatCardNumberDisplay,
  validateCardPaymentFields,
} from '../../lib/membershipPayment';
import { usePmbStore } from '../../lib/pmbStore';
import { PaymentProofTicketCard } from '../registration/PaymentProofTicketCard';

interface VisitorOneTimeAidBoxProps {
  onSubscribeClick: () => void;
}

export function VisitorOneTimeAidBox({ onSubscribeClick }: VisitorOneTimeAidBoxProps) {
  const { addMembershipRecord } = usePmbStore();
  const fondationBranch = PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;

  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('+243 ');
  const [amountInput, setAmountInput] = useState('20');
  const [method, setMethod] = useState<MembershipPaymentMethod>('mobile_money');
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>(
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers[0].id
  );
  const [txRef, setTxRef] = useState('');

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<MembershipPaymentTicket | null>(null);

  const selectedNetwork =
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers.find((n) => n.id === selectedNetworkId) ??
    PMB_MEMBERSHIP_PAYMENT_INFO.mobileMoneyNumbers[0];

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 2000);
    } catch {
      // Clipboard indisponible
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amountInput.replace(',', '.').trim());
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez saisir un montant libre positif en USD (ex. : 20 $).');
      return;
    }

    const cleanName = donorName.trim() || 'Visiteur solidaire';

    let ticket: MembershipPaymentTicket;
    if (method === 'mobile_money') {
      if (txRef.trim().length < 3) {
        setError(
          `Veuillez saisir votre nom ou référence de transfert ${selectedNetwork.networkName}.`
        );
        return;
      }
      ticket = createMembershipPaymentTicket({
        candidateName: cleanName,
        category: 'Visiteur — Aide ponctuelle',
        paymentMethod: 'mobile_money',
        channelUsedLabel: `${selectedNetwork.networkName} — ${selectedNetwork.number}`,
        destinationAccount: selectedNetwork.number,
        amountUsd: Math.round(parsedAmount * 100) / 100,
        transactionRef: txRef.trim(),
      });
    } else if (method === 'card_visa_mastercard') {
      const cardErr = validateCardPaymentFields({
        cardHolder: cardHolder.trim() || cleanName,
        cardNumber,
        expiry: cardExpiry,
        cvv: cardCvv,
      });
      if (cardErr) {
        setError(cardErr);
        return;
      }
      const last4 = cardNumber.replace(/\D/g, '').slice(-4);
      ticket = createMembershipPaymentTicket({
        candidateName: cleanName,
        category: 'Visiteur — Aide ponctuelle',
        paymentMethod: 'card_visa_mastercard',
        channelUsedLabel: `Mastercard / Visa (•••• ${last4})`,
        destinationAccount: `Mastercard / Visa •••• ${last4} (PMB Fondation)`,
        amountUsd: Math.round(parsedAmount * 100) / 100,
        transactionRef: `DON-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      });
    } else {
      if (txRef.trim().length < 3) {
        setError('Veuillez saisir la référence du virement bancaire.');
        return;
      }
      const acct = PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber;
      const benef = PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName;
      ticket = createMembershipPaymentTicket({
        candidateName: cleanName,
        category: 'Visiteur — Aide ponctuelle',
        paymentMethod: 'bank_transfer',
        channelUsedLabel: `Virement Bancaire — Compte ${acct} / Bénéficiaire : ${benef}`,
        destinationAccount: `${acct} — ${benef}`,
        amountUsd: Math.round(parsedAmount * 100) / 100,
        transactionRef: txRef.trim(),
      });
    }

    const now = new Date();
    addMembershipRecord({
      dossierId: `PMB-VIS-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}${String(now.getDate()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`,
      kind: 'visitor',
      branchId: fondationBranch.id,
      branchName: fondationBranch.name,
      fullName: cleanName,
      gender: 'Non précisé',
      birthDate: '—',
      birthPlace: 'Kinshasa, RDC',
      address: 'Contribution Visiteur (Sans compte)',
      phone: donorPhone.trim() || 'Non renseigné',
      email: 'visiteur@pmb-fondation.cd',
      category: 'Visiteur — Aide ponctuelle',
      subscriptionStatus: 'Don ponctuel confirmé',
      expiresAtIso: null,
      expiresAtLabel: 'Contribution unique',
      createdAtLabel: now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      paymentTicket: ticket,
    });

    setGeneratedTicket(ticket);
  };

  return (
    <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 sm:p-8 space-y-6">
      {/* En-tête avec logo dédié PMB Fondation + bouton bascule vers abonnement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-start gap-4">
          <img
            src={fondationBranch.logoImage}
            alt="Logo PMB Fondation"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-lg object-contain bg-white p-1.5 border border-white/15 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
              Parcours rapide sans compte · PMB Fondation
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              Visiteur — Aider une seule fois
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Effectuez une aide ou un don ponctuel (à partir de 20 $ ou montant libre) sans
              obligation de créer un compte membre.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubscribeClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>S’abonner à PMB Fondation</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {generatedTicket ? (
        <div className="space-y-4">
          <PaymentProofTicketCard
            ticket={generatedTicket}
            variant="dark"
            onResetPayment={() => {
              setGeneratedTicket(null);
              setTxRef('');
            }}
          />

          <div className="rounded-xl bg-[#121212] border border-[#229ED9]/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-zinc-300">
              Merci pour votre soutien ponctuel. Souhaitez-vous devenir{' '}
              <strong className="text-white">Membre effectif</strong> avec suivi et rappels ?
            </p>
            <button
              type="button"
              onClick={onSubscribeClick}
              className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
            >
              S’abonner à PMB Fondation
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="vis-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nom / Prénom (ou Anonyme)
              </label>
              <input
                id="vis-name"
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Ex. : Jean-Luc Tshibangu"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="vis-phone" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Téléphone (optionnel)
              </label>
              <input
                id="vis-phone"
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="+243 896 660 558"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="vis-amount" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Montant ($ USD — 20 $ ou montant libre)
              </label>
              <input
                id="vis-amount"
                type="number"
                min="1"
                step="1"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white font-mono-tabular focus:border-[#229ED9] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[10, 20, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountInput(String(val))}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono-tabular font-semibold cursor-pointer ${
                  Number(amountInput) === val
                    ? 'bg-[#F59E0B] text-[#121212] border-[#F59E0B]'
                    : 'bg-[#121212] text-zinc-300 border-white/15 hover:border-white/30'
                }`}
              >
                {val} $ USD
              </button>
            ))}
          </div>

          {/* Choix du moyen de paiement */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setMethod('mobile_money')}
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
              onClick={() => setMethod('card_visa_mastercard')}
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
              onClick={() => setMethod('bank_transfer')}
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
                      <span className="block text-xs font-bold font-mono-tabular text-white truncate">
                        {line.number}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopy(line.id, line.number)}
                      className="p-1.5 rounded bg-[#262626] hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                      aria-label={`Copier ${line.networkName}`}
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
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder={`Référence de transaction ${selectedNetwork.networkName}...`}
                className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>
          )}

          {method === 'card_visa_mastercard' && (
            <div className="rounded-xl border border-white/10 bg-[#121212] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Titulaire de la carte"
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
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-zinc-400">Compte : </span>
                  <strong className="font-mono-tabular text-white">
                    {PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.accountNumber}
                  </strong>
                  <span className="text-zinc-400"> · Bénéficiaire : </span>
                  <strong className="text-[#F59E0B]">
                    {PMB_MEMBERSHIP_PAYMENT_INFO.bankTransfer.beneficiaryName}
                  </strong>
                </div>
              </div>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder="Référence du virement bancaire..."
                className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <HeartHandshake className="w-4 h-4" aria-hidden="true" />
            <span>Valider mon aide ponctuelle</span>
          </button>
        </form>
      )}
    </div>
  );
}
