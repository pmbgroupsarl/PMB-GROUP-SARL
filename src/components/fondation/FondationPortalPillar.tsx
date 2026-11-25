import { HeartHandshake, LayoutDashboard, UserCheck } from 'lucide-react';
import { AdminDashboard } from '../AdminDashboard';
import { MemberAccountGate } from '../portal/MemberAccountGate';
import { VisitorOneTimeAidBox } from '../portal/VisitorOneTimeAidBox';

export type FondationPortalSubTab = 'member' | 'visitor' | 'admin';

interface FondationPortalPillarProps {
  activeSubTab: FondationPortalSubTab;
  onChangeSubTab: (tab: FondationPortalSubTab) => void;
  onGoToAdhesion: () => void;
  onOpenQaDashboard: () => void;
}

export function FondationPortalPillar({
  activeSubTab,
  onChangeSubTab,
  onGoToAdhesion,
  onOpenQaDashboard,
}: FondationPortalPillarProps) {
  return (
    <div className="space-y-8">
      <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#229ED9]">
            Pilier 3 · Portail Membres, Visiteurs & Administration
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Espace Membre Effectif, Aide Visiteur & Dashboard Admin
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Connectez-vous à votre espace Membre effectif, soutenez ponctuellement sans compte en
            tant que Visiteur ou pilotez l’ensemble des adhésions, paiements et contenus CMS.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Portails PMB Fondation"
          className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#1c1c1e] border border-white/10 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'member'}
            onClick={() => onChangeSubTab('member')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'member'
                ? 'bg-[#229ED9] text-white'
                : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Espace Membre Effectif</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'visitor'}
            onClick={() => onChangeSubTab('visitor')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'visitor'
                ? 'bg-[#F59E0B] text-[#121212]'
                : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
            }`}
          >
            <HeartHandshake className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Visiteur — Aider 1 fois</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'admin'}
            onClick={() => onChangeSubTab('admin')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'admin'
                ? 'bg-white text-[#121212]'
                : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Dashboard Admin</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'member' && (
        <MemberAccountGate onJumpToMembershipForm={onGoToAdhesion} />
      )}

      {activeSubTab === 'visitor' && (
        <VisitorOneTimeAidBox
          onSubscribeClick={() => {
            onChangeSubTab('member');
            onGoToAdhesion();
          }}
        />
      )}

      {activeSubTab === 'admin' && (
        <AdminDashboard onOpenQaDashboard={onOpenQaDashboard} />
      )}
    </div>
  );
}
