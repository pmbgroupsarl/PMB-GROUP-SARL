import { FormEvent, useMemo, useState } from 'react';
import {
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { usePmbStore } from '../../lib/pmbStore';
import { MemberDashboard } from '../MemberDashboard';

interface MemberAccountGateProps {
  compact?: boolean;
  onJumpToMembershipForm?: () => void;
}

export function MemberAccountGate({
  compact = false,
  onJumpToMembershipForm,
}: MemberAccountGateProps) {
  const {
    currentMember,
    notifications,
    loginMember,
    quickLoginDemoMember,
    registerMemberAccount,
    logoutMember,
  } = usePmbStore();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+243 ');
  const [authError, setAuthError] = useState<string | null>(null);

  const memberNotifs = useMemo(() => {
    if (!currentMember) return [];
    const targetEmail = currentMember.email.toLowerCase();
    return notifications.filter((n) => n.memberEmail.toLowerCase() === targetEmail);
  }, [currentMember, notifications]);

  const unreadCount = memberNotifs.filter((n) => !n.read).length;

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginMember(identifier, password);
    if (!res.ok) {
      setAuthError(res.error || 'Connexion impossible.');
      return;
    }
    setIdentifier('');
    setPassword('');
  };

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = registerMemberAccount({ fullName, email, phone, password });
    if (!res.ok) {
      setAuthError(res.error || 'Inscription impossible.');
      return;
    }
    setFullName('');
    setEmail('');
    setPhone('+243 ');
    setPassword('');
  };

  if (!currentMember) {
    return (
      <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#229ED9]">
              Accès Membre Effectif & Abonnements
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              Connexion ou création de compte obligatoire
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Pour adhérer en tant que <strong className="text-zinc-200">Membre effectif</strong>{' '}
              et recevoir vos rappels automatiques de réabonnement, connectez-vous ou créez votre
              compte personnel.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121212] border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                authMode === 'login'
                  ? 'bg-[#229ED9] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                authMode === 'signup'
                  ? 'bg-[#229ED9] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Créer un compte
            </button>
          </div>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="m-login-id" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Adresse e-mail ou téléphone
              </label>
              <input
                id="m-login-id"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ex. : mboziprisca37@gmail.com"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="m-login-pwd" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Mot de passe
              </label>
              <input
                id="m-login-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            {authError && (
              <p role="alert" className="md:col-span-2 text-xs text-red-400">
                {authError}
              </p>
            )}

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Se connecter à mon espace</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-zinc-400">Comptes démo (1 clic) :</span>
                <button
                  type="button"
                  onClick={() => quickLoginDemoMember('mboziprisca37@gmail.com')}
                  className="px-2.5 py-1.5 rounded-md bg-[#262626] hover:bg-zinc-700 border border-white/10 text-zinc-200 cursor-pointer whitespace-nowrap"
                >
                  Prisca Mbozi
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginDemoMember('patrick.kabasele@pmb-demo.cd')}
                  className="px-2.5 py-1.5 rounded-md bg-[#262626] hover:bg-zinc-700 border border-amber-500/30 text-amber-300 cursor-pointer whitespace-nowrap"
                >
                  Patrick K. (Expire J-5)
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginDemoMember('sarah.ngalula@pmb-demo.cd')}
                  className="px-2.5 py-1.5 rounded-md bg-[#262626] hover:bg-zinc-700 border border-red-500/30 text-red-300 cursor-pointer whitespace-nowrap"
                >
                  Sarah N. (Expiré)
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="m-sign-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nom complet *
              </label>
              <input
                id="m-sign-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex. : Grâce Mbuyi"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="m-sign-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Adresse e-mail *
              </label>
              <input
                id="m-sign-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="m-sign-phone" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Téléphone WhatsApp
              </label>
              <input
                id="m-sign-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243 896 660 558"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white font-mono-tabular placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="m-sign-pwd" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Créer un mot de passe (min. 4 caractères) *
              </label>
              <input
                id="m-sign-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
              />
            </div>

            {authError && (
              <p role="alert" className="md:col-span-2 text-xs text-red-400">
                {authError}
              </p>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                <span>Créer mon compte Membre</span>
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (!compact) {
    return <MemberDashboard onJumpToMembershipForm={onJumpToMembershipForm} />;
  }

  return (
    <div className="rounded-xl bg-[#1c1c1e] border border-[#229ED9]/35 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#229ED9]/15 border border-[#229ED9]/40 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-[#229ED9]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-semibold">
              Compte Membre connecté · Notifications non lues :{' '}
              <span className="font-mono-tabular">{unreadCount}</span>
            </p>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {currentMember.fullName}
            </h3>
            <p className="text-xs text-zinc-400 font-mono-tabular">
              {currentMember.email} · {currentMember.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onJumpToMembershipForm && (
            <button
              type="button"
              onClick={onJumpToMembershipForm}
              className="px-3.5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Remplir une fiche d’adhésion
            </button>
          )}
          <button
            type="button"
            onClick={logoutMember}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
