import { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FilePlus2,
  KeyRound,
  LogOut,
  Printer,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { PMB_BRANCHES, PMB_COMPANY } from '../data/pmbData';
import { MembershipPaymentTicket } from '../lib/membershipPayment';
import { MembershipSubscriberRecord, usePmbStore } from '../lib/pmbStore';
import { EffectiveMemberPaymentBox } from './registration/EffectiveMemberPaymentBox';

type MemberDashboardTab = 'subscriptions' | 'card' | 'notifications' | 'security';

interface MemberDashboardProps {
  onJumpToMembershipForm?: () => void;
}

function getDaysRemaining(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'PM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function downloadDigitalCardHtml(record: MembershipSubscriberRecord) {
  const branch =
    PMB_BRANCHES.find((b) => b.id === record.branchId) ||
    PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;
  const absLogoUrl =
    typeof window !== 'undefined'
      ? new URL(branch.logoImage, window.location.origin).href
      : branch.logoImage;
  const accent = branch.id === 'pmb-fondation' ? '#0284c7' : branch.accentColor;

  const esc = (s: string) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Carte de Membre - ${esc(record.dossierId)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px 16px;
      background: #0f172a;
      font-family: "Segoe UI", Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      width: 100%;
      max-width: 520px;
      background: #141821;
      color: #f8fafc;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.14);
      overflow: hidden;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 18px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(135deg, rgba(34,158,217,0.16), rgba(15,23,42,0.85));
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      background: #ffffff;
      padding: 4px;
      border-radius: 10px;
    }
    .brand-title { font-size: 16px; font-weight: 800; letter-spacing: 0.02em; }
    .brand-sub { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
    .status {
      font-size: 11px;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid ${accent};
      color: #ffffff;
      background: rgba(255,255,255,0.06);
    }
    .body {
      display: flex;
      gap: 18px;
      padding: 22px;
      align-items: center;
    }
    .avatar {
      width: 88px;
      height: 104px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.18);
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      color: #e2e8f0;
      overflow: hidden;
      flex-shrink: 0;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .info { flex: 1; min-width: 0; }
    .name { font-size: 18px; font-weight: 800; margin: 0 0 4px; }
    .cat { font-size: 13px; color: #f59e0b; font-weight: 700; margin: 0 0 12px; }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 14px;
      font-size: 12px;
    }
    .label { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
    .val { font-family: ui-monospace, monospace; font-size: 12px; color: #f1f5f9; margin-top: 2px; }
    .footer {
      padding: 12px 22px;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .card { border: 1px solid #cbd5e1; }
    }
  </style>
</head>
<body>
  <article class="card">
    <header class="topbar">
      <div class="brand">
        <img src="${esc(absLogoUrl)}" alt="Logo ${esc(record.branchName)}" />
        <div>
          <div class="brand-title">${esc(record.branchName.toUpperCase())}</div>
          <div class="brand-sub">Carte de Membre Numérique</div>
        </div>
      </div>
      <span class="status">${esc(record.subscriptionStatus)}</span>
    </header>
    <section class="body">
      <div class="avatar">
        ${
          record.photoDataUrl
            ? `<img src="${esc(record.photoDataUrl)}" alt="${esc(record.fullName)}" />`
            : esc(getInitials(record.fullName))
        }
      </div>
      <div class="info">
        <h1 class="name">${esc(record.fullName)}</h1>
        <p class="cat">${esc(record.category)}</p>
        <div class="meta">
          <div>
            <div class="label">N° Dossier</div>
            <div class="val">${esc(record.dossierId)}</div>
          </div>
          <div>
            <div class="label">Échéance</div>
            <div class="val">${esc(record.expiresAtLabel)}</div>
          </div>
          <div>
            <div class="label">Téléphone</div>
            <div class="val">${esc(record.phone)}</div>
          </div>
          <div>
            <div class="label">Enregistré le</div>
            <div class="val">${esc(record.createdAtLabel)}</div>
          </div>
        </div>
      </div>
    </section>
    <footer class="footer">
      <span>${esc(PMB_COMPANY.fullHeadquartersAddress)}</span>
    </footer>
  </article>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carte-membre-${record.dossierId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function MemberDashboard({ onJumpToMembershipForm }: MemberDashboardProps) {
  const {
    currentMember,
    memberships,
    notifications,
    logoutMember,
    markNotificationRead,
    renewMemberSubscription,
    changeMemberPassword,
  } = usePmbStore();

  const [activeTab, setActiveTab] = useState<MemberDashboardTab>('subscriptions');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Renouvellement
  const [renewTargetId, setRenewTargetId] = useState<string | null>(null);
  const [renewTicket, setRenewTicket] = useState<MembershipPaymentTicket | null>(null);
  const [renewNotice, setRenewNotice] = useState<string | null>(null);

  // Changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPwdFields, setShowPwdFields] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const memberRecords = useMemo(() => {
    if (!currentMember) return [];
    const targetEmail = currentMember.email.toLowerCase();
    return memberships.filter(
      (m) =>
        m.kind === 'member' &&
        ((m.accountEmail && m.accountEmail.toLowerCase() === targetEmail) ||
          m.email.toLowerCase() === targetEmail)
    );
  }, [currentMember, memberships]);

  const memberNotifs = useMemo(() => {
    if (!currentMember) return [];
    const targetEmail = currentMember.email.toLowerCase();
    return notifications.filter((n) => n.memberEmail.toLowerCase() === targetEmail);
  }, [currentMember, notifications]);

  if (!currentMember) {
    return null;
  }

  const unreadCount = memberNotifs.filter((n) => !n.read).length;
  const activeCardRecord =
    memberRecords.find((r) => r.id === selectedCardId) ?? memberRecords[0] ?? null;

  const avatarPhoto = memberRecords.find((r) => Boolean(r.photoDataUrl))?.photoDataUrl ?? null;

  const handleMarkAllRead = () => {
    for (const notif of memberNotifs) {
      if (!notif.read) {
        markNotificationRead(notif.id);
      }
    }
  };

  const handleStartRenewalFromAlert = () => {
    const target =
      memberRecords.find(
        (r) => r.subscriptionStatus === 'Expire bientôt' || r.subscriptionStatus === 'Expiré'
      ) ?? memberRecords[0];
    if (target) {
      setActiveTab('subscriptions');
      setRenewTargetId(target.id);
      setRenewTicket(null);
      setRenewNotice(null);
    } else if (onJumpToMembershipForm) {
      onJumpToMembershipForm();
    }
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPwdFeedback(null);

    if (newPassword !== confirmNewPassword) {
      setPwdFeedback({
        type: 'error',
        text: 'La confirmation ne correspond pas au nouveau mot de passe.',
      });
      return;
    }

    const res = changeMemberPassword(currentPassword, newPassword);
    if (!res.ok) {
      setPwdFeedback({
        type: 'error',
        text: res.error || 'Impossible de modifier le mot de passe.',
      });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPwdFeedback({
      type: 'success',
      text: 'Mot de passe mis à jour avec succès. Utilisez-le lors de votre prochaine connexion.',
    });
  };

  const handlePrintCard = () => {
    document.body.classList.add('pmb-print-portal');
    const cleanup = () => {
      document.body.classList.remove('pmb-print-portal');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  return (
    <div className="rounded-xl bg-[#1c1c1e] border border-white/10 overflow-hidden">
      {/* En-tête session connectée */}
      <div className="no-print p-5 sm:p-6 border-b border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#18181b]">
        <div className="flex items-center gap-3.5">
          {avatarPhoto ? (
            <img
              src={avatarPhoto}
              alt={currentMember.fullName}
              className="w-12 h-12 rounded-lg object-cover border border-[#229ED9]/40 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#229ED9]/15 border border-[#229ED9]/40 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-[#229ED9]" aria-hidden="true" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs text-emerald-400 font-semibold">
              Espace Membre connecté ·{' '}
              <span className="font-mono-tabular">
                {memberRecords.length} dossier{memberRecords.length > 1 ? 's' : ''}
              </span>
            </p>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {currentMember.fullName}
            </h3>
            <p className="text-xs text-zinc-400 font-mono-tabular truncate">
              {currentMember.email} · {currentMember.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onJumpToMembershipForm && (
            <button
              type="button"
              onClick={onJumpToMembershipForm}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Remplir une fiche d’adhésion</span>
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

      {/* Barre de navigation interne du tableau de bord membre */}
      <div
        role="tablist"
        aria-label="Modules de l'espace membre"
        className="no-print flex flex-wrap items-center gap-1.5 px-5 sm:px-6 py-3 border-b border-white/[0.08] bg-[#141416]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'subscriptions'}
          onClick={() => setActiveTab('subscriptions')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'subscriptions'
              ? 'bg-[#229ED9] text-white'
              : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Statut & Abonnements</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'card'}
          onClick={() => setActiveTab('card')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'card'
              ? 'bg-[#229ED9] text-white'
              : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Carte de Membre Numérique</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-[#229ED9] text-white'
              : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
          }`}
        >
          <Bell className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Notifications & Rappels</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-[#F59E0B] text-[#121212] text-[10px] font-bold font-mono-tabular">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-[#229ED9] text-white'
              : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Mot de passe</span>
        </button>
      </div>

      {/* Contenu principal */}
      <div className="p-5 sm:p-6">
        {/* ==================== ONGLET 1 : STATUT & ABONNEMENTS ==================== */}
        {activeTab === 'subscriptions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">
                  Mes abonnements & dossiers par branche
                </h4>
                <span className="text-xs font-mono-tabular text-zinc-400">
                  {memberRecords.length} actif{memberRecords.length > 1 ? 's' : ''}
                </span>
              </div>

              {memberRecords.length === 0 ? (
                <div className="rounded-lg bg-[#121212] border border-white/10 p-5 space-y-3">
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Aucun dossier d’adhésion n’est encore rattaché à votre adresse e-mail{' '}
                    <span className="font-mono-tabular text-zinc-200">{currentMember.email}</span>.
                  </p>
                  {onJumpToMembershipForm && (
                    <button
                      type="button"
                      onClick={onJumpToMembershipForm}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                      <span>Déposer ma fiche d’adhésion</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {memberRecords.map((rec) => {
                    const branch = PMB_BRANCHES.find((b) => b.id === rec.branchId);
                    const daysLeft = getDaysRemaining(rec.expiresAtIso);
                    const needsRenewal =
                      rec.subscriptionStatus === 'Expire bientôt' ||
                      rec.subscriptionStatus === 'Expiré';

                    return (
                      <div
                        key={rec.id}
                        className="rounded-lg bg-[#121212] border border-white/10 p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {branch && (
                              <img
                                src={branch.logoImage}
                                alt={`Logo ${branch.name}`}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded object-contain bg-white p-1 border border-white/15 shrink-0"
                              />
                            )}
                            <div>
                              <p className="text-sm font-bold text-white">
                                {rec.branchName} · {rec.category}
                              </p>
                              <p className="text-xs text-zinc-400 font-mono-tabular">
                                Dossier {rec.dossierId} · Échéance : {rec.expiresAtLabel}
                                {daysLeft !== null && (
                                  <span className="ml-1.5 text-zinc-300">
                                    ({daysLeft > 0 ? `J-${daysLeft}` : 'Expiré'})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              rec.subscriptionStatus === 'Actif'
                                ? 'text-emerald-400'
                                : rec.subscriptionStatus === 'Expiré'
                                  ? 'text-red-400'
                                  : 'text-[#F59E0B]'
                            }`}
                          >
                            {rec.subscriptionStatus === 'Actif' ? (
                              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span>{rec.subscriptionStatus}</span>
                          </span>
                        </div>

                        {rec.paymentTicket ? (
                          <p className="text-xs text-zinc-300 font-mono-tabular">
                            Dernier paiement : {rec.paymentTicket.amountUsd.toFixed(2)} $ USD ·{' '}
                            {rec.paymentTicket.channelUsedLabel} ({rec.paymentTicket.ticketNumber})
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-500">
                            Aucune cotisation réglée sur ce dossier pour le moment.
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.08]">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCardId(rec.id);
                              setActiveTab('card');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#229ED9] hover:underline cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Voir ma carte numérique</span>
                          </button>

                          {needsRenewal && (
                            <button
                              type="button"
                              onClick={() => {
                                setRenewTargetId(rec.id);
                                setRenewTicket(null);
                                setRenewNotice(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs font-bold cursor-pointer whitespace-nowrap"
                            >
                              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Renouveler (≥ 20 $)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {renewTargetId && (
                <div className="pt-2 space-y-3">
                  <EffectiveMemberPaymentBox
                    category="Membre effectif"
                    candidateName={currentMember.fullName}
                    ticket={renewTicket}
                    onTicketChange={(ticket) => {
                      setRenewTicket(ticket);
                      if (ticket) {
                        renewMemberSubscription(renewTargetId, ticket);
                        setRenewNotice(
                          `Réabonnement validé (${ticket.ticketNumber}). Votre statut est désormais Actif pour 30 jours.`
                        );
                        setRenewTargetId(null);
                      }
                    }}
                  />
                </div>
              )}

              {renewNotice && (
                <p
                  role="status"
                  className="text-xs text-emerald-400 font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{renewNotice}</span>
                </p>
              )}
            </div>

            {/* Aperçu rapide notifications dans la vue d'ensemble */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                  <span>Rappels récents</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className="text-xs text-[#229ED9] hover:underline cursor-pointer"
                >
                  Tout voir ({memberNotifs.length})
                </button>
              </div>

              {memberNotifs.length === 0 ? (
                <div className="rounded-lg bg-[#121212] border border-white/10 p-4 text-xs text-zinc-400">
                  Aucune notification en attente pour ce compte.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {memberNotifs.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg border p-3.5 space-y-1.5 ${
                        n.read
                          ? 'bg-[#121212]/70 border-white/[0.07]'
                          : 'bg-[#121212] border-[#F59E0B]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-white">{n.title}</p>
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(n.id)}
                            aria-label="Marquer comme lu"
                            className="inline-flex items-center gap-1 text-[11px] text-[#229ED9] hover:underline shrink-0 cursor-pointer"
                          >
                            <Check className="w-3 h-3" aria-hidden="true" />
                            <span>Lu</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-zinc-500 font-mono-tabular">
                        {n.branchName} · {n.createdAtLabel}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== ONGLET 2 : CARTE DE MEMBRE NUMÉRIQUE ==================== */}
        {activeTab === 'card' && (
          <div className="space-y-5">
            {!activeCardRecord ? (
              <div className="rounded-xl bg-[#121212] border border-white/10 p-6 text-center space-y-3 max-w-xl mx-auto">
                <CreditCard className="w-8 h-8 text-[#F59E0B] mx-auto" aria-hidden="true" />
                <h4 className="text-base font-bold text-white">
                  Carte de membre numérique non encore générée
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Votre carte numérique officielle est générée automatiquement dès qu’un dossier
                  d’adhésion est enregistré pour votre compte ({currentMember.email}).
                </p>
                {onJumpToMembershipForm && (
                  <button
                    type="button"
                    onClick={onJumpToMembershipForm}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                    <span>Remplir la fiche d’adhésion</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Sélecteur si le membre a plusieurs dossiers */}
                <div className="no-print flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {memberRecords.length > 1 &&
                      memberRecords.map((rec) => (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => setSelectedCardId(rec.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                            activeCardRecord.id === rec.id
                              ? 'bg-[#229ED9] border-[#229ED9] text-white'
                              : 'bg-[#121212] border-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          {rec.branchName} ({rec.dossierId})
                        </button>
                      ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadDigitalCardHtml(activeCardRecord)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Télécharger la carte</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintCard}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#262626] hover:bg-zinc-700 border border-white/15 text-zinc-100 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Imprimer</span>
                    </button>
                  </div>
                </div>

                {/* Carte de Membre Numérique officielle */}
                {(() => {
                  const branch =
                    PMB_BRANCHES.find((b) => b.id === activeCardRecord.branchId) ||
                    PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;
                  const statusTone =
                    activeCardRecord.subscriptionStatus === 'Actif'
                      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                      : activeCardRecord.subscriptionStatus === 'Expiré'
                        ? 'text-red-400 border-red-500/40 bg-red-500/10'
                        : 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10';

                  return (
                    <div className="print-certificate max-w-xl mx-auto rounded-2xl border border-white/15 print:border-zinc-300 bg-gradient-to-br from-[#141923] via-[#121212] to-[#1a1f2b] print:bg-none print:bg-white overflow-hidden">
                      {/* En-tête de la carte avec logo exclusif de la branche */}
                      <div className="px-5 py-4 border-b border-white/10 print:border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-[#18202c]/70 print:bg-zinc-50">
                        <div className="flex items-center gap-3">
                          <img
                            src={branch.logoImage}
                            alt={`Logo officiel ${activeCardRecord.branchName}`}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-contain bg-white p-1.5 border border-white/20 print:border-zinc-300 shrink-0"
                          />
                          <div>
                            <p className="text-sm font-bold text-white print:text-zinc-900 tracking-wide uppercase">
                              {activeCardRecord.branchName}
                            </p>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#229ED9] print:text-sky-700">
                              Carte de Membre Numérique
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold print:bg-white ${statusTone}`}
                        >
                          {activeCardRecord.subscriptionStatus === 'Actif' ? (
                            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          <span>{activeCardRecord.subscriptionStatus}</span>
                        </span>
                      </div>

                      {/* Corps de la carte */}
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        {activeCardRecord.photoDataUrl ? (
                          <img
                            src={activeCardRecord.photoDataUrl}
                            alt={activeCardRecord.fullName}
                            className="w-24 h-28 rounded-xl object-cover border border-white/20 print:border-zinc-300 bg-[#1c1c1e] shrink-0"
                          />
                        ) : (
                          <div className="w-24 h-28 rounded-xl border border-white/15 print:border-zinc-300 bg-[#1e293b] print:bg-zinc-100 flex flex-col items-center justify-center shrink-0">
                            <span className="text-2xl font-bold text-zinc-200 print:text-zinc-800 tracking-wider">
                              {getInitials(activeCardRecord.fullName)}
                            </span>
                            <span className="text-[10px] text-zinc-400 print:text-zinc-600 uppercase mt-1">
                              Membre
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-3 w-full">
                          <div>
                            <h4 className="text-lg sm:text-xl font-bold text-white print:text-zinc-900 tracking-tight truncate">
                              {activeCardRecord.fullName}
                            </h4>
                            <p className="text-xs font-semibold text-[#F59E0B] print:text-amber-700 mt-0.5">
                              {activeCardRecord.category} · {activeCardRecord.gender}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2 border-t border-white/[0.08] print:border-zinc-200">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-400 print:text-zinc-500">
                                N° Dossier Officiel
                              </p>
                              <p className="text-xs font-semibold text-white print:text-zinc-900 font-mono-tabular mt-0.5">
                                {activeCardRecord.dossierId}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-400 print:text-zinc-500">
                                Échéance Cotisation
                              </p>
                              <p className="text-xs font-semibold text-white print:text-zinc-900 font-mono-tabular mt-0.5">
                                {activeCardRecord.expiresAtLabel}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-400 print:text-zinc-500">
                                Téléphone
                              </p>
                              <p className="text-xs text-zinc-200 print:text-zinc-800 font-mono-tabular mt-0.5">
                                {activeCardRecord.phone}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-400 print:text-zinc-500">
                                Date d’enregistrement
                              </p>
                              <p className="text-xs text-zinc-200 print:text-zinc-800 font-mono-tabular mt-0.5 flex items-center gap-1">
                                <Calendar
                                  className="w-3 h-3 text-zinc-400 print:text-zinc-500"
                                  aria-hidden="true"
                                />
                                <span>{activeCardRecord.createdAtLabel}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pied de carte */}
                      <div className="px-5 py-3 border-t border-white/[0.08] print:border-zinc-200 bg-[#121212]/80 print:bg-zinc-50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 print:text-zinc-600">
                        <span className="truncate">{PMB_COMPANY.fullHeadquartersAddress}</span>
                        {activeCardRecord.paymentTicket && (
                          <span className="font-mono-tabular text-zinc-300 print:text-zinc-800 shrink-0">
                            Réf. {activeCardRecord.paymentTicket.ticketNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ==================== ONGLET 3 : NOTIFICATIONS & RAPPELS ==================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Boîte de notifications & rappels de réabonnement
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Alertes automatiques J-5, avis d’expiration et validations de secrétariat.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-zinc-700 border border-white/10 text-xs font-medium text-zinc-200 cursor-pointer whitespace-nowrap"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#229ED9]" aria-hidden="true" />
                  <span>Tout marquer comme lu ({unreadCount})</span>
                </button>
              )}
            </div>

            {memberNotifs.length === 0 ? (
              <div className="rounded-lg bg-[#121212] border border-white/10 p-6 text-center text-xs sm:text-sm text-zinc-400">
                Vous n’avez aucune notification ou alerte de réabonnement pour le moment.
              </div>
            ) : (
              <div className="space-y-2.5">
                {memberNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg border p-4 space-y-2 ${
                      n.read
                        ? 'bg-[#121212]/70 border-white/[0.07]'
                        : 'bg-[#121212] border-[#F59E0B]/45'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white">{n.title}</p>
                        <p className="text-[11px] text-zinc-400 font-mono-tabular mt-0.5">
                          {n.branchName} · {n.createdAtLabel}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(n.type === 'renewal_auto' || n.type === 'admin_reminder') && (
                          <button
                            type="button"
                            onClick={handleStartRenewalFromAlert}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-[11px] font-bold cursor-pointer whitespace-nowrap"
                          >
                            <RefreshCw className="w-3 h-3" aria-hidden="true" />
                            <span>Renouveler</span>
                          </button>
                        )}
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(n.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#262626] hover:bg-zinc-700 border border-white/10 text-[11px] text-[#229ED9] cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-3 h-3" aria-hidden="true" />
                            <span>Marquer lu</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== ONGLET 4 : CHANGER MON MOT DE PASSE ==================== */}
        {activeTab === 'security' && (
          <div className="max-w-xl space-y-5">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Modifier le mot de passe de votre compte
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Sécurisez l’accès à votre Espace Membre ({currentMember.email}) en mettant à jour
                votre mot de passe personnel.
              </p>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              noValidate
              className="rounded-lg bg-[#121212] border border-white/10 p-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="m-pwd-current"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  Mot de passe actuel *
                </label>
                <div className="relative">
                  <input
                    id="m-pwd-current"
                    type={showPwdFields ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe actuel"
                    className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdFields((v) => !v)}
                    aria-label={
                      showPwdFields
                        ? 'Masquer les mots de passe'
                        : 'Afficher les mots de passe'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showPwdFields ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="m-pwd-new"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Nouveau mot de passe (min. 4 caractères) *
                  </label>
                  <input
                    id="m-pwd-new"
                    type={showPwdFields ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="m-pwd-confirm"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Confirmer le nouveau mot de passe *
                  </label>
                  <input
                    id="m-pwd-confirm"
                    type={showPwdFields ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#229ED9] focus:outline-none"
                  />
                </div>
              </div>

              {pwdFeedback && (
                <div
                  role={pwdFeedback.type === 'error' ? 'alert' : 'status'}
                  className={`rounded-lg border px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 ${
                    pwdFeedback.type === 'error'
                      ? 'border-red-500/40 bg-red-500/10 text-red-300'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  }`}
                >
                  {pwdFeedback.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{pwdFeedback.text}</span>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                  <span>Mettre à jour mon mot de passe</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
