import {
  ArrowRight,
  Building2,
  Clapperboard,
  HeartHandshake,
  ShoppingBag,
  Smartphone,
  Truck,
} from 'lucide-react';
import { HUB_BRANCH_IDS, PMB_BRANCHES, PMB_COMPANY } from '../data/pmbData';
import { MediaImage } from './MediaImage';

interface HomeHubViewProps {
  onSelectBranch: (branchId: string) => void;
  onOpenQuoteDrawer: () => void;
  onOpenGroupInfo: () => void;
}

const BRANCH_ICON_MAP = {
  'pmb-shop': Smartphone,
  'pmb-event': Clapperboard,
  'pmb-immobilier': Building2,
  'pmb-store': ShoppingBag,
  'pmb-transport': Truck,
  'pmb-fondation': HeartHandshake,
} as const;

export function HomeHubView({
  onSelectBranch,
  onOpenQuoteDrawer,
  onOpenGroupInfo,
}: HomeHubViewProps) {
  const orderedBranches = HUB_BRANCH_IDS.map(
    (id) => PMB_BRANCHES.find((b) => b.id === id)!
  ).filter(Boolean);

  return (
    <section
      id="accueil"
      className="no-print relative py-6 sm:py-8 lg:py-10"
      aria-labelledby="hub-hero-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
        {/* Hero court et percutant */}
        <div className="rounded-2xl bg-[#18181b]/92 border border-white/10 p-5 sm:p-7 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-3.5">
              <p className="text-xs sm:text-sm text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[#229ED9] font-medium">{PMB_COMPANY.legalName}</span>
                <span aria-hidden="true">·</span>
                <span>{PMB_COMPANY.headquartersPlace}</span>
                <span aria-hidden="true">·</span>
                <span>Kinshasa, RDC</span>
              </p>

              <h1
                id="hub-hero-title"
                className="text-2xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-white tracking-tight leading-[1.12] max-w-2xl"
              >
                Six pôles d’activité réunis sur une plateforme unique
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                PMB GROUP SARL accompagne particuliers et entreprises en RDC dans la téléphonie,
                l’événementiel LED, l’immobilier, le commerce général, le transport multimodal et
                l’action sociale.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onOpenQuoteDrawer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1b86b9] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Demander un devis</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={onOpenGroupInfo}
                  className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer whitespace-nowrap"
                >
                  À propos du groupe & FAQ
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#121212]">
                <MediaImage
                  src={PMB_COMPANY.heroBannerLogo}
                  alt="PMB GROUP SARL — Groupe Multisectoriel Kinshasa"
                  fallbackTitle={PMB_COMPANY.legalName}
                  className="w-full h-36 sm:h-44 lg:h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grille interactive compacte des 6 pôles d'activité */}
        <div aria-labelledby="hub-branches-heading" className="space-y-3.5">
          <div className="flex items-center justify-between gap-4">
            <h2 id="hub-branches-heading" className="text-sm sm:text-base font-bold text-white">
              Sélectionnez votre pôle d’activité
            </h2>
            <span className="text-xs text-zinc-400 font-mono-tabular">6 branches dédiées</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {orderedBranches.map((branch) => {
              const Icon =
                BRANCH_ICON_MAP[branch.id as keyof typeof BRANCH_ICON_MAP] ?? Building2;
              return (
                <article
                  key={branch.id}
                  onClick={() => onSelectBranch(branch.id)}
                  className="group rounded-xl bg-[#1c1c1e]/95 hover:bg-[#232327] border border-white/10 hover:border-white/25 p-4 sm:p-5 flex flex-col justify-between gap-4 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                        style={{
                          backgroundColor: `${branch.accentColor}22`,
                          color: branch.accentColor,
                        }}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                          {branch.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 truncate mt-0.5">
                          {branch.hubSummary}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-lg overflow-hidden border border-white/15 shrink-0 ${
                        branch.id === 'pmb-fondation' ? 'bg-white p-0.5' : 'bg-[#121212]'
                      }`}
                    >
                      <MediaImage
                        src={branch.logoImage}
                        alt={`Logo ${branch.name}`}
                        fallbackTitle={branch.shortName}
                        accentColor={branch.accentColor}
                        className={`w-full h-full ${
                          branch.id === 'pmb-fondation' ? 'object-contain' : 'object-cover'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between gap-3">
                    <span className="text-xs text-zinc-500 font-mono-tabular">
                      Pôle {branch.index}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBranch(branch.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#121212] rounded-lg transition-transform duration-150 group-hover:translate-x-0.5 cursor-pointer whitespace-nowrap shrink-0"
                      style={{ backgroundColor: branch.accentColor }}
                    >
                      <span>Accéder</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
