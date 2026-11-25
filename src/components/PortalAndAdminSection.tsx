import { HeartHandshake, LayoutDashboard, UserCheck } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { MemberAccountGate } from './portal/MemberAccountGate';
import { VisitorOneTimeAidBox } from './portal/VisitorOneTimeAidBox';

export type PortalTab = 'member' | 'visitor' | 'admin';

interface PortalAndAdminSectionProps {
  activeTab: PortalTab;
  onChangeTab: (tab: PortalTab) => void;
  onJumpToMembershipForm: () => void;
  onOpenQaDashboard: () => void;
}

export function PortalAndAdminSection({
  activeTab,
  onChangeTab,
  onJumpToMembershipForm,
  onOpenQaDashboard,
}: PortalAndAdminSectionProps) {
  return (
    <section
      id="portail"
      className="py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#229ED9] mb-2">
              Portail Membres, Visiteurs & Administration
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Espace Personnel, Aide Ponctuelle & Pilotage Admin
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Choisissez votre parcours : gérez vos abonnements et rappels en tant que{' '}
              <strong className="text-white">Membre effectif</strong>, réalisez une aide ponctuelle
              en tant que <strong className="text-white">Visiteur</strong>, ou ouvrez le{' '}
              <strong className="text-white">Dashboard Administrateur tout-en-un</strong>.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Espaces du portail PMB"
            className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#1c1c1e] border border-white/10 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'member'}
              onClick={() => onChangeTab('member')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'member'
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
              aria-selected={activeTab === 'visitor'}
              onClick={() => onChangeTab('visitor')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'visitor'
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
              aria-selected={activeTab === 'admin'}
              onClick={() => onChangeTab('admin')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-white text-[#121212]'
                  : 'text-zinc-300 hover:text-white hover:bg-[#262626]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Dashboard Admin</span>
            </button>
          </div>
        </div>

        {activeTab === 'member' && (
          <MemberAccountGate onJumpToMembershipForm={onJumpToMembershipForm} />
        )}

        {activeTab === 'visitor' && (
          <VisitorOneTimeAidBox
            onSubscribeClick={() => {
              onChangeTab('member');
              onJumpToMembershipForm();
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard onOpenQaDashboard={onOpenQaDashboard} />
        )}
      </div>
    </section>
  );
}
