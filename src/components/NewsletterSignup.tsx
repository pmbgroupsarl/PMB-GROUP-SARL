import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import { PMB_BRANCHES } from '../data/pmbData';
import { NewsletterSubscriber, usePmbStore } from '../lib/pmbStore';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function NewsletterSignup() {
  const { newsletterSubscribers, subscribeNewsletter } = usePmbStore();

  const [email, setEmail] = useState('');
  const [preferredBranch, setPreferredBranch] = useState('Toutes les branches');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedSubscriber, setConfirmedSubscriber] =
    useState<NewsletterSubscriber | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMsg('Veuillez saisir votre adresse e-mail.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg('Adresse e-mail invalide (format attendu : nom@domaine.com).');
      return;
    }

    setIsSubmitting(true);

    timerRef.current = window.setTimeout(() => {
      try {
        const res = subscribeNewsletter(trimmedEmail, preferredBranch);
        if (!res.ok || !res.subscriber) {
          setErrorMsg(res.error || "Impossible d'enregistrer votre inscription.");
          return;
        }

        setConfirmedSubscriber(res.subscriber);
        setEmail('');
      } finally {
        setIsSubmitting(false);
        timerRef.current = null;
      }
    }, 350);
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="rounded-xl bg-[#141416] border border-white/10 p-5 sm:p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-center">
        {/* Présentation */}
        <div className="lg:col-span-5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#229ED9]">
            <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Newsletter PMB Group</span>
          </div>
          <h3
            id="newsletter-heading"
            className="text-base sm:text-lg font-bold text-white tracking-tight"
          >
            Recevez nos actualités & événements à Kinshasa
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Annonces des 6 branches, départs fret & import-export, offres PMB Store et actions
            sociales de la Fondation directement par e-mail.
          </p>
        </div>

        {/* Formulaire ou confirmation */}
        <div className="lg:col-span-7">
          {confirmedSubscriber ? (
            <div
              role="status"
              className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-white">
                    Inscription confirmée pour{' '}
                    <span className="font-mono-tabular text-emerald-300">
                      {confirmedSubscriber.email}
                    </span>
                  </p>
                  <p className="text-zinc-300 mt-0.5">
                    Thématique : {confirmedSubscriber.preferredBranch} · Enregistré le{' '}
                    <span className="font-mono-tabular">
                      {confirmedSubscriber.createdAtLabel}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmedSubscriber(null);
                  setErrorMsg(null);
                }}
                className="text-xs font-semibold text-[#229ED9] hover:underline shrink-0 cursor-pointer self-start sm:self-center"
              >
                Inscrire une autre adresse
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1 min-w-0">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Adresse e-mail pour la newsletter PMB Group
                  </label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    value={email}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? 'footer-newsletter-error' : undefined}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="votre.nom@exemple.com"
                    autoComplete="email"
                    className={`w-full rounded-lg border bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                      errorMsg
                        ? 'border-red-500/60 focus:border-red-400'
                        : 'border-white/15 focus:border-[#229ED9]'
                    }`}
                  />
                </div>

                <div className="sm:w-48 shrink-0">
                  <label htmlFor="footer-newsletter-branch" className="sr-only">
                    Branche d’intérêt
                  </label>
                  <select
                    id="footer-newsletter-branch"
                    value={preferredBranch}
                    disabled={isSubmitting}
                    onChange={(e) => setPreferredBranch(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#121212] px-3 py-2.5 text-xs sm:text-sm text-zinc-200 focus:border-[#229ED9] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="Toutes les branches">Toutes les branches</option>
                    {PMB_BRANCHES.map((branch) => (
                      <option key={branch.id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] disabled:bg-[#229ED9]/60 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      <span>Inscription…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>S’abonner</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                {errorMsg ? (
                  <p
                    id="footer-newsletter-error"
                    role="alert"
                    className="text-red-400 flex items-center gap-1.5 font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </p>
                ) : (
                  <span>Désinscription possible à tout moment · Aucun spam.</span>
                )}

                {newsletterSubscribers.length > 0 && (
                  <span className="font-mono-tabular text-zinc-500">
                    {newsletterSubscribers.length} abonné
                    {newsletterSubscribers.length > 1 ? 's' : ''} enregistré
                    {newsletterSubscribers.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
