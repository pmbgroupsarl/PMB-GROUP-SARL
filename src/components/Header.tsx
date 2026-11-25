import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PMB_COMPANY } from '../data/pmbData';
import { MediaImage } from './MediaImage';

export type AppPage = 'home' | 'fondation';

interface HeaderProps {
  activePage: AppPage;
  onNavigateHome: (sectionId?: string) => void;
  onNavigateFondation: () => void;
  onRequestQuote: () => void;
}

export function Header({
  activePage,
  onNavigateHome,
  onNavigateFondation,
  onRequestQuote,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: string;
    label: string;
    isActive?: boolean;
    onClick: () => void;
  }[] = [
    {
      id: 'accueil',
      label: 'Accueil',
      isActive: activePage === 'home',
      onClick: () => onNavigateHome('accueil'),
    },
    {
      id: 'services',
      label: '6 Branches',
      onClick: () => onNavigateHome('services'),
    },
    {
      id: 'fondation',
      label: 'PMB Fondation',
      isActive: activePage === 'fondation',
      onClick: onNavigateFondation,
    },
    {
      id: 'communaute',
      label: 'Actualités',
      onClick: () => onNavigateHome('communaute'),
    },
    {
      id: 'contact',
      label: 'Contact',
      onClick: () => onNavigateHome('contact'),
    },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1 : Logotype officiel PMB GROUP SARL + Wordmark sur une ligne */}
        <a
          href="#accueil"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome('accueil');
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

        {/* Zone 2 : 5 liens de navigation concis */}
        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] rounded-sm ${
                item.isActive
                  ? 'text-white border-[#229ED9]'
                  : 'text-zinc-300 hover:text-white border-transparent hover:border-[#229ED9]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3 : Action principale unique + bouton menu mobile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRequestQuote}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1c89be] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Demander un devis
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#262626] text-zinc-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#18181b] border-b border-white/10 px-4 py-4">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  item.onClick();
                }}
                className={`px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  item.isActive
                    ? 'bg-[#229ED9]/20 text-white'
                    : 'text-zinc-200 hover:text-white hover:bg-[#262626]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestQuote();
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
