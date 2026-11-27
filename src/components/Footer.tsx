import { ExternalLink, Mail, MapPin, MessageCircle, Wrench } from 'lucide-react';
import { HUB_BRANCH_IDS, PMB_BRANCHES, PMB_COMPANY } from '../data/pmbData';
import { MediaImage } from './MediaImage';

interface FooterProps {
  onNavigateHome: () => void;
  onSelectBranch: (branchId: string) => void;
  onOpenAdminPortal: () => void;
  onOpenGroupInfo: (tab?: 'about' | 'faq' | 'community' | 'newsletter') => void;
  onOpenQaDashboard: () => void;
}

export function Footer({
  onNavigateHome,
  onSelectBranch,
  onOpenAdminPortal,
  onOpenGroupInfo,
  onOpenQaDashboard,
}: FooterProps) {
  const orderedBranches = HUB_BRANCH_IDS.map(
    (id) => PMB_BRANCHES.find((b) => b.id === id)!
  ).filter(Boolean);

  return (
    <footer className="no-print relative z-10 bg-[#0e0e0f]/92 border-t border-white/[0.08] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-white/[0.08]">
          {/* Identité compacte */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-10 h-10 rounded-lg overflow-hidden border border-white/15 bg-[#121212] shrink-0 cursor-pointer"
            >
              <MediaImage
                src={PMB_COMPANY.watermarkLogo}
                alt="Logo officiel PMB GROUP SARL"
                fallbackTitle="PMB"
                className="w-full h-full object-contain"
              />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white tracking-tight truncate">
                {PMB_COMPANY.legalName}
              </p>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#229ED9] shrink-0" aria-hidden="true" />
                <span className="truncate">{PMB_COMPANY.headquartersPlace}, Kinshasa</span>
              </p>
            </div>
          </div>

          {/* Raccourcis directs des 6 pôles */}
          <nav
            aria-label="Liens rapides des 6 branches"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400"
          >
            {orderedBranches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => onSelectBranch(branch.id)}
                className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {branch.name}
              </button>
            ))}
          </nav>

          {/* Contact direct & Utilitaires */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href={PMB_COMPANY.phones[0].whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-mono-tabular whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{PMB_COMPANY.phones[0].display}</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>

            <a
              href={`mailto:${PMB_COMPANY.email}`}
              className="inline-flex items-center gap-1.5 text-[#229ED9] hover:underline whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>E-mail</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenGroupInfo('newsletter')}
              className="text-zinc-300 hover:text-white cursor-pointer whitespace-nowrap"
            >
              Newsletter
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <p className="font-mono-tabular">
            {PMB_COMPANY.rccm} · {PMB_COMPANY.idNat} · © {new Date().getFullYear()}{' '}
            {PMB_COMPANY.legalName}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenGroupInfo('about')}
              className="text-zinc-400 hover:text-white cursor-pointer whitespace-nowrap"
            >
              À propos & FAQ
            </button>
            <button
              type="button"
              onClick={onOpenAdminPortal}
              className="text-[#229ED9] hover:underline font-medium cursor-pointer whitespace-nowrap"
            >
              Admin PMB Fondation
            </button>
            <button
              type="button"
              onClick={onOpenQaDashboard}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#F59E0B] cursor-pointer whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Console QA</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
