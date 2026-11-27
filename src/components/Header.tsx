import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { HUB_BRANCH_IDS, PMB_BRANCHES, PMB_COMPANY } from '../data/pmbData';
import { MediaImage } from './MediaImage';

export type AppView = 'home' | 'branch';

interface HeaderProps {
  activeView: AppView;
  activeBranchId: string | null;
  onNavigateHome: () => void;
  onSelectBranch: (branchId: string) => void;
  onOpenGroupInfo: () => void;
  onOpenQuoteDrawer: () => void;
}

export function Header({
  activeView,
  activeBranchId,
  onNavigateHome,
  onSelectBranch,
  onOpenGroupInfo,
  onOpenQuoteDrawer,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branchesMenuOpen, setBranchesMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const orderedBranches = HUB_BRANCH_IDS.map(
    (id) => PMB_BRANCHES.find((b) => b.id === id)!
  ).filter(Boolean);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBranchesMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBranchesMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleBranchPick = (branchId: string) => {
    setBranchesMenuOpen(false);
    setMobileMenuOpen(false);
    onSelectBranch(branchId);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-[#121212]/92 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1 : Logotype officiel + Wordmark sur une ligne */}
        <a
          href="#accueil"
          onClick={(e) => {
            e.preventDefault();
            setBranchesMenuOpen(false);
            setMobileMenuOpen(false);
            onNavigateHome();
          }}
          className="inline-flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] rounded"
        >
          <span className="w-8 h-8 rounded-md overflow-hidden border border-white/15 bg-[#1c1c1e] shrink-0">
            <MediaImage
              src={PMB_COMPANY.groupLogo}
              alt="Logo PMB GROUP SARL"
              fallbackTitle="PMB"
              className="w-full h-full object-cover"
            />
          </span>
          <span>PMB GROUP SARL</span>
        </a>

        {/* Zone 2 : Navigation concise + Sélecteur rapide "Nos Branches" */}
        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300"
        >
          <button
            type="button"
            onClick={() => {
              setBranchesMenuOpen(false);
              onNavigateHome();
            }}
            className={`transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] rounded-sm ${
              activeView === 'home'
                ? 'text-white border-[#229ED9]'
                : 'text-zinc-300 hover:text-white border-transparent hover:border-[#229ED9]'
            }`}
          >
            Accueil
          </button>

          {/* Menu déroulant rapide Nos Branches */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={branchesMenuOpen}
              onClick={() => setBranchesMenuOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] rounded-sm ${
                activeView === 'branch'
                  ? 'text-white border-[#229ED9]'
                  : 'text-zinc-300 hover:text-white border-transparent hover:border-[#229ED9]'
              }`}
            >
              <span>Nos Branches</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-150 ${
                  branchesMenuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {branchesMenuOpen && (
              <div
                role="menu"
                aria-label="Sélectionner une branche"
                className="absolute left-0 top-full mt-3 w-80 rounded-xl bg-[#18181b] border border-white/15 shadow-2xl p-2 z-50"
              >
                {orderedBranches.map((branch) => {
                  const isCurrent = activeView === 'branch' && activeBranchId === branch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleBranchPick(branch.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#262626] text-white'
                          : 'text-zinc-200 hover:bg-[#262626]/70 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: branch.accentColor }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{branch.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{branch.hubSummary}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleBranchPick('pmb-fondation')}
            className={`transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] rounded-sm ${
              activeView === 'branch' && activeBranchId === 'pmb-fondation'
                ? 'text-white border-[#F59E0B]'
                : 'text-zinc-300 hover:text-white border-transparent hover:border-[#F59E0B]'
            }`}
          >
            PMB Fondation
          </button>

          <button
            type="button"
            onClick={() => {
              setBranchesMenuOpen(false);
              onOpenGroupInfo();
            }}
            className="transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent text-zinc-300 hover:text-white hover:border-[#229ED9] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] rounded-sm"
          >
            À propos & FAQ
          </button>
        </nav>

        {/* Zone 3 : Action principale unique + menu mobile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenQuoteDrawer}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1c89be] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Demander un devis
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#262626] text-zinc-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#18181b] border-b border-white/10 px-4 py-4 max-h-[80vh] overflow-y-auto">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateHome();
              }}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeView === 'home'
                  ? 'bg-[#229ED9]/20 text-white'
                  : 'text-zinc-200 hover:text-white hover:bg-[#262626]'
              }`}
            >
              Accueil
            </button>

            <p className="px-3 pt-2 pb-1 text-xs font-medium text-zinc-400">Nos 6 Branches</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {orderedBranches.map((branch) => {
                const isCurrent = activeView === 'branch' && activeBranchId === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleBranchPick(branch.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#262626] text-white border border-white/20'
                        : 'text-zinc-200 hover:text-white hover:bg-[#262626]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: branch.accentColor }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{branch.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGroupInfo();
              }}
              className="mt-1 px-3 py-2.5 text-left text-sm font-medium text-zinc-200 hover:text-white hover:bg-[#262626] rounded-lg transition-colors cursor-pointer"
            >
              À propos & FAQ
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuoteDrawer();
              }}
              className="mt-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1c89be] rounded-lg transition-colors cursor-pointer"
            >
              Demander un devis
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
