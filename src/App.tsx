import { useEffect, useState } from 'react';
import { PMB_BRANCHES, PMB_COMPANY } from './data/pmbData';
import { PmbStoreProvider } from './lib/pmbStore';
import { startSelfHealingMonitor } from './lib/selfHealingMonitor';
import { AdminQADashboardModal } from './components/AdminQADashboardModal';
import { BranchInternalTab, BranchSpaceView } from './components/BranchSpaceView';
import { FondationPillarId } from './components/FondationSpaceView';
import { FondationPortalSubTab } from './components/fondation/FondationPortalPillar';
import { Footer } from './components/Footer';
import { GroupInfoModal, GroupInfoTab } from './components/GroupInfoModal';
import { AppView, Header } from './components/Header';
import { HomeHubView } from './components/HomeHubView';
import { PmbChatbotWidget } from './components/PmbChatbotWidget';
import { QuoteDrawerModal } from './components/QuoteDrawerModal';

function resolveInitialNavigation(): { view: AppView; branchId: string | null } {
  if (typeof window === 'undefined') return { view: 'home', branchId: null };
  const hash = window.location.hash;
  if (hash.startsWith('#fondation')) {
    return { view: 'branch', branchId: 'pmb-fondation' };
  }
  if (hash.startsWith('#branche/')) {
    const id = hash.replace('#branche/', '').split('/')[0];
    if (PMB_BRANCHES.some((b) => b.id === id)) {
      return { view: 'branch', branchId: id };
    }
  }
  return { view: 'home', branchId: null };
}

function AppContent() {
  const initial = resolveInitialNavigation();
  const [activeView, setActiveView] = useState<AppView>(initial.view);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(initial.branchId);
  const [branchInitialTab, setBranchInitialTab] = useState<BranchInternalTab>('services');

  const [fondationPillar, setFondationPillar] = useState<FondationPillarId>('pilier-4');
  const [fondationPortalSubTab, setFondationPortalSubTab] =
    useState<FondationPortalSubTab>('member');

  const [quoteDrawerOpen, setQuoteDrawerOpen] = useState(false);
  const [quoteBranchId, setQuoteBranchId] = useState<string>(PMB_BRANCHES[0].id);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [groupInfoTab, setGroupInfoTab] = useState<GroupInfoTab>('about');
  const [qaDashboardOpen, setQaDashboardOpen] = useState(false);

  useEffect(() => {
    const stopMonitor = startSelfHealingMonitor();
    return () => stopMonitor();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const next = resolveInitialNavigation();
      setActiveView(next.view);
      setActiveBranchId(next.branchId);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateHome = () => {
    setActiveView('home');
    setActiveBranchId(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#accueil');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateBranch = (
    branchId: string,
    tab: BranchInternalTab = 'services',
    pillar?: FondationPillarId,
    portalSubTab?: FondationPortalSubTab
  ) => {
    setActiveBranchId(branchId);
    setBranchInitialTab(tab);
    if (branchId === 'pmb-fondation') {
      if (pillar) setFondationPillar(pillar);
      if (portalSubTab) setFondationPortalSubTab(portalSubTab);
    }
    setActiveView('branch');
    if (typeof window !== 'undefined') {
      const nextHash =
        branchId === 'pmb-fondation'
          ? `#fondation/${pillar || fondationPillar}`
          : `#branche/${branchId}`;
      window.history.replaceState(null, '', nextHash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openQuoteForBranch = (branchId?: string) => {
    setQuoteBranchId(branchId || activeBranchId || PMB_BRANCHES[0].id);
    setQuoteDrawerOpen(true);
  };

  const openGroupInfo = (tab: GroupInfoTab = 'about') => {
    setGroupInfoTab(tab);
    setGroupInfoOpen(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#121212] text-[#F4F4F5] overflow-x-clip">
      {/* Filigrane de fond global */}
      <div
        aria-hidden="true"
        className="no-print pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <img
          src={PMB_COMPANY.watermarkLogo}
          alt=""
          referrerPolicy="no-referrer"
          style={{ opacity: 0.16 }}
          className="w-[min(86vw,780px)] h-auto object-contain select-none mix-blend-screen"
        />
      </div>

      <Header
        activeView={activeView}
        activeBranchId={activeBranchId}
        onNavigateHome={navigateHome}
        onSelectBranch={(branchId) => navigateBranch(branchId)}
        onOpenGroupInfo={() => openGroupInfo('about')}
        onOpenQuoteDrawer={() => openQuoteForBranch()}
      />

      <main className="relative z-10 flex-1">
        {activeView === 'branch' && activeBranchId ? (
          <BranchSpaceView
            branchId={activeBranchId}
            initialTab={branchInitialTab}
            fondationPillar={fondationPillar}
            onChangeFondationPillar={setFondationPillar}
            fondationPortalSubTab={fondationPortalSubTab}
            onChangeFondationPortalSubTab={setFondationPortalSubTab}
            onSelectBranch={(id) => navigateBranch(id)}
            onBackHome={navigateHome}
            onOpenQaDashboard={() => setQaDashboardOpen(true)}
          />
        ) : (
          <HomeHubView
            onSelectBranch={(branchId) => navigateBranch(branchId)}
            onOpenQuoteDrawer={() => openQuoteForBranch()}
            onOpenGroupInfo={() => openGroupInfo('about')}
          />
        )}
      </main>

      <Footer
        onNavigateHome={navigateHome}
        onSelectBranch={(branchId) => navigateBranch(branchId)}
        onOpenAdminPortal={() =>
          navigateBranch('pmb-fondation', 'services', 'pilier-3', 'admin')
        }
        onOpenGroupInfo={openGroupInfo}
        onOpenQaDashboard={() => setQaDashboardOpen(true)}
      />

      <PmbChatbotWidget
        onOpenPayment={() => navigateBranch('pmb-fondation', 'services', 'pilier-1')}
        onOpenFondationAdhesion={() => navigateBranch('pmb-fondation', 'services', 'pilier-2')}
      />

      <QuoteDrawerModal
        isOpen={quoteDrawerOpen}
        preselectedBranchId={quoteBranchId}
        onClose={() => setQuoteDrawerOpen(false)}
      />

      <GroupInfoModal
        isOpen={groupInfoOpen}
        initialTab={groupInfoTab}
        onClose={() => setGroupInfoOpen(false)}
        onExploreBranch={(branchId) => navigateBranch(branchId)}
      />

      <AdminQADashboardModal
        isOpen={qaDashboardOpen}
        onClose={() => setQaDashboardOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PmbStoreProvider>
      <AppContent />
    </PmbStoreProvider>
  );
}
