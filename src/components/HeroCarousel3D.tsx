import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';
import { BranchItem, PMB_BRANCHES, PMB_COMPANY } from '../data/pmbData';
import { usePmbStore } from '../lib/pmbStore';
import { MediaImage } from './MediaImage';

interface HeroCarousel3DProps {
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onSelectBranch: (branch: BranchItem) => void;
  onEnterFondation: () => void;
  onExploreAll: () => void;
  isModalOpen: boolean;
}

export function HeroCarousel3D({
  activeIndex,
  onChangeIndex,
  onSelectBranch,
  onEnterFondation,
  onExploreAll,
  isModalOpen,
}: HeroCarousel3DProps) {
  const { cms } = usePmbStore();
  const total = PMB_BRANCHES.length;
  const activeBranch = PMB_BRANCHES[activeIndex];
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handlePrev = useCallback(() => {
    onChangeIndex((activeIndex - 1 + total) % total);
  }, [activeIndex, onChangeIndex, total]);

  const handleNext = useCallback(() => {
    onChangeIndex((activeIndex + 1) % total);
  }, [activeIndex, onChangeIndex, total]);

  // Défilement automatique fluide en boucle (respecte prefers-reduced-motion et le survol)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || isModalOpen) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      onChangeIndex((activeIndex + 1) % total);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [activeIndex, isAutoPlaying, isHovered, isModalOpen, onChangeIndex, total]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev]);

  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section
      id="accueil"
      className="no-print relative pt-10 pb-16 lg:pt-14 lg:pb-20 overflow-hidden border-b border-white/[0.08]"
    >
      {/* Halo discret aux couleurs de la branche active */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-20 transition-colors duration-500"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 10%, ${activeBranch.accentColor}, transparent 75%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête visuel du Hero : remplacement du texte par le logo principal officiel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10 lg:mb-12">
          <div className="lg:col-span-8">
            <h1 className="sr-only">
              PMB GROUP SARL — Six pôles opérationnels au service de Kinshasa et de l’Import-Export
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-zinc-400 mb-4">
              <span>{PMB_COMPANY.legalName}</span>
              <span aria-hidden="true">·</span>
              <span>{PMB_COMPANY.headquartersPlace}</span>
              <span aria-hidden="true">·</span>
              <span>Kinshasa, RDC</span>
            </div>

            <div className="max-w-2xl rounded-xl overflow-hidden border border-white/15 bg-[#1c1c1e] shadow-xl">
              <MediaImage
                src={PMB_COMPANY.heroBannerLogo}
                alt="PMB GROUP SARL — RCCM/24-A-04653 P-Id · Nat/01-G4701-N52717A"
                fallbackTitle={PMB_COMPANY.legalName}
                className="w-full h-auto block object-contain"
              />
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <button
              type="button"
              onClick={onExploreAll}
              className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1b86b9] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Explorer tous nos services et modules</span>
              <ArrowDown className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Carrousel 3D Interactif (Boucle fluide + flèches gauche/droite) */}
        <div
          id="carrousel"
          className="scroll-mt-24"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400">
              <span className="font-semibold text-white">Carrousel 3D des 6 branches</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">
                {activeBranch.index} / 0{total}
              </span>
            </div>

            {/* Contrôles Lecture Auto + Flèches Gauche / Droite */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                aria-pressed={isAutoPlaying}
                className="inline-flex items-center gap-1.5 px-3 h-11 rounded-lg bg-[#1c1c1e] hover:bg-[#262626] text-xs font-medium text-zinc-200 border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pause boucle</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Lecture boucle</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrev}
                aria-label="Branche précédente"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#262626] hover:bg-[#323232] text-white border border-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Branche suivante"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#262626] hover:bg-[#323232] text-white border border-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scène 3D */}
          <div
            className="carousel-stage relative h-[410px] sm:h-[460px] lg:h-[490px] w-full flex items-center justify-center select-none"
            role="region"
            aria-roledescription="carrousel"
            aria-label="Les six branches de PMB GROUP SARL"
          >
            {PMB_BRANCHES.map((branch, index) => {
              const offset = getOffset(index);
              const absOffset = Math.abs(offset);
              const isCenter = offset === 0;
              const isVisible = absOffset <= 2;

              if (!isVisible) return null;

              const translateX = offset * 260;
              const translateZ = -absOffset * 130;
              const rotateY = offset * -20;
              const scale = isCenter ? 1 : absOffset === 1 ? 0.84 : 0.68;
              const opacity = isCenter ? 1 : absOffset === 1 ? 0.68 : 0.32;
              const zIndex = 30 - absOffset * 10;

              return (
                <article
                  key={branch.id}
                  onClick={() => {
                    if (isCenter) {
                      if (branch.id === 'pmb-fondation') {
                        onEnterFondation();
                      } else {
                        onSelectBranch(branch);
                      }
                    } else {
                      onChangeIndex(index);
                    }
                  }}
                  style={{
                    transform: `translate3d(${translateX}px, 0, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    opacity,
                    zIndex,
                  }}
                  className={`carousel-card-3d absolute w-[88%] max-w-[680px] h-[390px] sm:h-[430px] lg:h-[455px] rounded-xl overflow-hidden bg-[#262626] border cursor-pointer ${
                    isCenter
                      ? 'border-white/25 shadow-2xl shadow-black/70'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <MediaImage
                    src={branch.sceneImage}
                    alt={`${branch.name} — ${branch.visualAnalysis}`}
                    fallbackTitle={branch.name}
                    accentColor={branch.accentColor}
                    className="w-full h-full object-cover"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/65 to-black/15"
                  />

                  <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-white/15 shrink-0 ${
                          branch.id === 'pmb-fondation'
                            ? 'bg-white p-1.5'
                            : 'bg-[#121212]/80'
                        }`}
                      >
                        <MediaImage
                          src={branch.logoImage}
                          alt={`Logo officiel ${branch.name}`}
                          fallbackTitle={branch.shortName}
                          accentColor={branch.accentColor}
                          className={`w-full h-full ${
                            branch.id === 'pmb-fondation' ? 'object-contain' : 'object-cover'
                          }`}
                        />
                      </div>

                      <div className="text-right text-xs text-zinc-300">
                        <span
                          className="inline-block w-3 h-3 rounded-sm align-middle mr-2"
                          style={{ backgroundColor: branch.accentColor }}
                          aria-hidden="true"
                        />
                        <span className="font-mono-tabular">
                          {branch.index}. {branch.name}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-zinc-300 mb-1.5">
                        Division {branch.index} · {branch.colorName}
                        {branch.id === 'pmb-transport' ? ' · Terrestre, Maritime & Aérien' : ''}
                        {branch.id === 'pmb-event' ? ' · 27 réalisations vidéo' : ''}
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {branch.name}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-zinc-200 max-w-xl line-clamp-2">
                        {branch.officialMission}
                      </p>

                      {isCenter && (
                        <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs sm:text-sm text-zinc-300">
                            {(cms.branchServices[branch.id] ?? branch.services).length} prestations clés
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (branch.id === 'pmb-fondation') {
                                onEnterFondation();
                              } else {
                                onSelectBranch(branch);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#121212] rounded-lg transition-transform duration-150 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                            style={{ backgroundColor: branch.accentColor }}
                          >
                            <span>
                              {branch.id === 'pmb-fondation'
                                ? 'Ouvrir l’espace PMB Fondation'
                                : 'Ouvrir la fiche détaillée'}
                            </span>
                            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Barre sélectrice directe des 6 branches */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PMB_BRANCHES.map((branch, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => onChangeIndex(idx)}
                  aria-current={isActive ? 'true' : 'false'}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left border transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#262626] text-white border-white/25'
                      : 'bg-[#18181b] text-zinc-400 hover:text-zinc-200 border-white/[0.07] hover:border-white/15'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: branch.accentColor }}
                    aria-hidden="true"
                  />
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {branch.index}. {branch.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
