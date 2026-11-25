import { useEffect, useState } from 'react';
import { BranchItem, PMB_BRANCHES, PMB_COMPANY } from './data/pmbData';
import { PmbStoreProvider } from './lib/pmbStore';
import { AppPage, Header } from './components/Header';
import { HeroCarousel3D } from './components/HeroCarousel3D';
import { GlobalServicesExplorer } from './components/GlobalServicesExplorer';
import { EventVideoShowcase } from './components/EventVideoShowcase';
import { AgendaForumSection } from './components/AgendaForumSection';
import { FAQSection } from './components/FAQSection';
import { AboutSection } from './components/AboutSection';
import { BranchDetailModal } from './components/BranchDetailModal';
import { ContactQuoteSection } from './components/ContactQuoteSection';
import { FondationPillarId, FondationSpaceView } from './components/FondationSpaceView';
import { FondationPortalSubTab } from './components/fondation/FondationPortalPillar';
import { Footer } from './components/Footer';
import { PmbChatbotWidget } from './components/PmbChatbotWidget';
import { AdminQADashboardModal } from './components/AdminQADashboardModal';
import { startSelfHealingMonitor } from './lib/selfHealingMonitor';

function AppContent() {
  const [activePage, setActivePage] = useState<AppPage>(() =>
    typeof window !== 'undefined' && window.location.hash.startsWith('#fondation')
      ? 'fondation'
      : 'home'
  );
  const [fondationPillar, setFondationPillar] = useState<FondationPillarId>('pilier-4');
  const [fondationPortalSubTab, setFondationPortalSubTab] =
    useState<FondationPortalSubTab>('member');

  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [inspectedBranch, setInspectedBranch] = useState<BranchItem | null>(null);
  const [quoteBranchId, setQuoteBranchId] = useState<string>(PMB_BRANCHES[0].id);
  const [qaDashboardOpen, setQaDashboardOpen] = useState(false);

  useEffect(() => {
    const stopMonitor = startSelfHealingMonitor();
    return () => stopMonitor();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const h = window.location.hash;
      if (h.startsWith('#fondation')) {
        setActivePage('fondation');
      } else if (h && !h.startsWith('#fondation')) {
        setActivePage('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateHome = (sectionId?: string) => {
    setActivePage('home');
    setInspectedBranch(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', sectionId ? `#${sectionId}` : '#accueil');
    }
    setTimeout(() => {
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  const navigateFondation = (
    pillar: FondationPillarId = 'pilier-4',
    portalSubTab?: FondationPortalSubTab
  ) => {
    setInspectedBranch(null);
    setFondationPillar(pillar);
    if (portalSubTab) {
      setFondationPortalSubTab(portalSubTab);
    }
    setActivePage('fondation');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#fondation/${pillar}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRequestQuoteForBranch = (branchId: string) => {
    setQuoteBranchId(branchId);
    setInspectedBranch(null);
    navigateHome('contact');
  };

  const handleJumpToSection = (sectionId: string) => {
    setInspectedBranch(null);
    if (sectionId === 'fondation') {
      navigateFondation('pilier-2');
      return;
    }
    navigateHome(sectionId);
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
          style={{ opacity: 0.2 }}
          className="w-[min(86vw,780px)] h-auto object-contain select-none opacity-20 mix-blend-screen"
        />
      </div>

      <Header
        activePage={activePage}
        onNavigateHome={navigateHome}
        onNavigateFondation={() => navigateFondation('pilier-4')}
        onRequestQuote={() => navigateHome('contact')}
      />

      <main className="relative z-10 flex-1">
        {activePage === 'fondation' ? (
          <FondationSpaceView
            activePillar={fondationPillar}
            onChangePillar={setFondationPillar}
            activePortalSubTab={fondationPortalSubTab}
            onChangePortalSubTab={setFondationPortalSubTab}
            onBackToGroupHome={() => navigateHome('accueil')}
            onOpenQaDashboard={() => setQaDashboardOpen(true)}
          />
        ) : (
          <>
            <HeroCarousel3D
              activeIndex={activeCarouselIndex}
              onChangeIndex={setActiveCarouselIndex}
              onSelectBranch={(branch) => setInspectedBranch(branch)}
              onEnterFondation={() => navigateFondation('pilier-4')}
              onExploreAll={() => navigateHome('services')}
              isModalOpen={Boolean(inspectedBranch) || qaDashboardOpen}
            />

            <GlobalServicesExplorer
              onSelectBranch={(branch) => setInspectedBranch(branch)}
              onEnterFondation={() => navigateFondation('pilier-4')}
            />

            <EventVideoShowcase
              onRequestEventQuote={() => handleRequestQuoteForBranch('pmb-event')}
            />

            <AgendaForumSection />

            <FAQSection />

            <AboutSection onSelectBranchIndex={setActiveCarouselIndex} />

            <ContactQuoteSection preselectedBranchId={quoteBranchId} />
          </>
        )}
      </main>

      <Footer
        onNavigateHome={navigateHome}
        onOpenFondationSpace={() => navigateFondation('pilier-4')}
        onOpenAdminPortal={() => navigateFondation('pilier-3', 'admin')}
        onOpenQaDashboard={() => setQaDashboardOpen(true)}
      />

      <PmbChatbotWidget />

      <BranchDetailModal
        branch={inspectedBranch}
        onClose={() => setInspectedBranch(null)}
        onRequestQuoteForBranch={handleRequestQuoteForBranch}
        onEnterFondation={(pillar) => navigateFondation(pillar || 'pilier-2')}
        onJumpToSection={handleJumpToSection}
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
