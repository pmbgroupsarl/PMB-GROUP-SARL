import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { PMB_BRANCHES, PMB_COMPANY } from '../data/pmbData';
import { usePmbStore } from '../lib/pmbStore';
import { monitoredFetch } from '../lib/selfHealingMonitor';

interface ContactQuoteSectionProps {
  preselectedBranchId: string;
  embedded?: boolean;
}

interface QuoteSubmission {
  reference: string;
  fullName: string;
  contact: string;
  branchName: string;
  message: string;
  submittedAt: string;
}

export function ContactQuoteSection({
  preselectedBranchId,
  embedded = false,
}: ContactQuoteSectionProps) {
  const { addOrder } = usePmbStore();
  const [branchId, setBranchId] = useState(preselectedBranchId || PMB_BRANCHES[0].id);
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; contact?: string; message?: string }>(
    {}
  );
  const [submitted, setSubmitted] = useState<QuoteSubmission | null>(null);

  useEffect(() => {
    if (preselectedBranchId) {
      setBranchId(preselectedBranchId);
    }
  }, [preselectedBranchId]);

  const activeBranch =
    PMB_BRANCHES.find((b) => b.id === branchId) ?? PMB_BRANCHES[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: { fullName?: string; contact?: string; message?: string } = {};

    if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Veuillez saisir votre nom complet ou raison sociale.';
    }

    const cleanContact = contact.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);
    const isValidPhone = /^[+\d\s().-]{8,}$/.test(cleanContact);
    if (!isValidEmail && !isValidPhone) {
      nextErrors.contact = 'Indiquez un numéro de téléphone ou une adresse e-mail valide.';
    }

    if (message.trim().length < 10) {
      nextErrors.message = 'Précisez votre besoin en quelques mots (minimum 10 caractères).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const now = new Date();
    const reference = `PMB-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(
      now.getMinutes()
    ).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    const submission: QuoteSubmission = {
      reference,
      fullName: fullName.trim(),
      contact: cleanContact,
      branchName: activeBranch.name,
      message: message.trim(),
      submittedAt: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setSubmitted(submission);

    addOrder({
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      customerName: submission.fullName,
      customerContact: submission.contact,
      serviceOrArticle: `Devis : ${submission.message}`,
      amountLabel: 'Sur devis',
      status: 'En attente',
    });

    void monitoredFetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference,
        branchId: activeBranch.id,
        branchName: activeBranch.name,
        fullName: submission.fullName,
        contact: submission.contact,
        message: submission.message,
      }),
    }).catch(() => {});

    setFullName('');
    setContact('');
    setMessage('');
  };

  return (
    <section id="contact" className={embedded ? 'no-print' : 'no-print py-16 lg:py-24 scroll-mt-20'}>
      <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {!embedded && (
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-medium text-[#229ED9] mb-2">
              Contact Direct & Localisation
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Parler à nos équipes à Kinshasa
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Retrouvez l’ensemble de nos coordonnées officielles à Bandal Synkin ou adressez une
              demande de devis ciblée à la division concernée.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne gauche : Coordonnées officielles permanentes */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <MapPin className="w-4 h-4 text-[#229ED9] shrink-0" aria-hidden="true" />
                  <span>Adresse du Siège (Kinshasa)</span>
                </div>
                <p className="text-sm text-zinc-200 font-medium">
                  {PMB_COMPANY.headquartersPlace}
                </p>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                  Référence : {PMB_COMPANY.headquartersReference}
                </p>
              </div>

              <div className="border-t border-white/[0.08] pt-5">
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-white mb-3">
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>WhatsApp Direct & Lignes Officielles</span>
                  </span>
                  <span className="text-[11px] font-normal text-zinc-400">1 clic multi-appareils</span>
                </div>
                <ul className="space-y-2.5">
                  {PMB_COMPANY.phones.map((phone) => (
                    <li key={phone.whatsappUrl}>
                      <a
                        href={phone.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#262626] hover:bg-[#2f2f32] border border-white/[0.06] transition-colors"
                      >
                        <span className="text-xs text-zinc-400">{phone.label}</span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white font-mono-tabular">
                          <span>{phone.display}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/[0.08] pt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <Mail className="w-4 h-4 text-[#229ED9] shrink-0" aria-hidden="true" />
                  <span>Adresse Électronique Officielle</span>
                </div>
                <a
                  href={`mailto:${PMB_COMPANY.email}`}
                  className="inline-flex items-center text-sm font-medium text-[#229ED9] hover:underline"
                >
                  {PMB_COMPANY.email}
                </a>
              </div>

              <div className="border-t border-white/[0.08] pt-5 text-xs text-zinc-400 space-y-1">
                <p className="font-mono-tabular">RCCM : {PMB_COMPANY.rccm}</p>
                <p className="font-mono-tabular">Identification Nationale : {PMB_COMPANY.idNat}</p>
              </div>
            </div>
          </div>

          {/* Colonne droite : Formulaire de demande de devis */}
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Demande de devis ou de rendez-vous
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Sélectionnez la branche concernée pour orienter votre demande.
              </p>

              {submitted ? (
                <div
                  role="status"
                  className="mt-6 rounded-xl bg-[#262626] border border-[#229ED9]/40 p-6 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-6 h-6 text-[#229ED9] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <h4 className="text-base font-semibold text-white">
                        Demande enregistrée ({submitted.reference})
                      </h4>
                      <p className="text-sm text-zinc-300 mt-1">
                        Votre demande pour{' '}
                        <strong className="text-white">{submitted.branchName}</strong> a bien été
                        préparée à {submitted.submittedAt}.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#121212] border border-white/[0.08] p-4 text-xs sm:text-sm text-zinc-300 space-y-1">
                    <p>
                      <span className="text-zinc-500">Demandeur :</span> {submitted.fullName}
                    </p>
                    <p>
                      <span className="text-zinc-500">Contact :</span> {submitted.contact}
                    </p>
                    <p>
                      <span className="text-zinc-500">Objet :</span> {submitted.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href={`mailto:${PMB_COMPANY.email}?subject=${encodeURIComponent(
                        `[${submitted.reference}] Devis ${submitted.branchName} — ${submitted.fullName}`
                      )}&body=${encodeURIComponent(
                        `Branche : ${submitted.branchName}\nDemandeur : ${submitted.fullName}\nContact : ${submitted.contact}\n\nBesoin :\n${submitted.message}`
                      )}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1b86b9] rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Transmettre par e-mail</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSubmitted(null)}
                      className="px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white bg-[#18181b] border border-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      Nouvelle demande
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                  {/* Sélection de branche */}
                  <div>
                    <label
                      htmlFor="quote-branch"
                      className="block text-sm font-medium text-zinc-200 mb-2"
                    >
                      Branche concernée
                    </label>
                    <select
                      id="quote-branch"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                    >
                      {PMB_BRANCHES.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.index}. {branch.name} — {branch.officialMission}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="quote-name"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        Nom complet ou entreprise
                      </label>
                      <input
                        id="quote-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex. : Patrick Mbozi"
                        aria-invalid={Boolean(errors.fullName)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                      />
                      {errors.fullName && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="quote-contact"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        Téléphone (+243) ou E-mail
                      </label>
                      <input
                        id="quote-contact"
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="+243 ... ou nom@exemple.com"
                        aria-invalid={Boolean(errors.contact)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                      />
                      {errors.contact && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.contact}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quote-message"
                      className="block text-sm font-medium text-zinc-200 mb-2"
                    >
                      Détails de votre besoin ({activeBranch.name})
                    </label>
                    <textarea
                      id="quote-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={activeBranch.quotePlaceholder}
                      aria-invalid={Boolean(errors.message)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#229ED9]"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-zinc-400">
                      Siège : {PMB_COMPANY.headquartersPlace}
                    </p>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1b86b9] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Valider la demande</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
