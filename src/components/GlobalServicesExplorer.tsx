import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Plane, Search, Ship, ShoppingBag, Truck, X } from 'lucide-react';
import { BranchItem, PMB_BRANCHES } from '../data/pmbData';
import { usePmbStore } from '../lib/pmbStore';
import { MediaImage } from './MediaImage';

interface GlobalServicesExplorerProps {
  onSelectBranch: (branch: BranchItem) => void;
  onEnterFondation: () => void;
}

export function GlobalServicesExplorer({
  onSelectBranch,
  onEnterFondation,
}: GlobalServicesExplorerProps) {
  const { cms, addOrder, currentMember } = usePmbStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const filteredBranches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PMB_BRANCHES.filter((branch) => {
      if (selectedFilter !== 'all' && branch.id !== selectedFilter) {
        return false;
      }
      const dynamicServices = cms.branchServices[branch.id] ?? branch.services;
      if (!q) return true;
      return (
        branch.name.toLowerCase().includes(q) ||
        branch.officialMission.toLowerCase().includes(q) ||
        dynamicServices.some((s) => s.toLowerCase().includes(q)) ||
        (branch.transportModes?.some(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q)
        ) ??
          false)
      );
    });
  }, [cms.branchServices, query, selectedFilter]);

  return (
    <section
      id="services"
      className="no-print py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#229ED9] mb-2">
              Répertoire complet du groupe
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Tous nos services et modules opérationnels
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Consultez l’ensemble des six divisions de PMB GROUP SARL, incluant la chaîne
              logistique Import & Export (Terrestre, Maritime Paquebot, Aérien Avion), nos 27
              vidéos PMB Event et la Fondation.
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="w-full lg:w-80 relative">
            <label htmlFor="service-search" className="sr-only">
              Rechercher un service ou une division
            </label>
            <Search
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (Avion, Paquebot, LED...)"
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#1c1c1e] text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:outline-none focus:border-[#229ED9]"
            />
            {query && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Onglets de filtrage interactif */}
        <div
          role="tablist"
          aria-label="Filtrer par branche"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[#229ED9] text-white'
                : 'bg-[#1c1c1e] text-zinc-300 hover:text-white border border-white/10'
            }`}
          >
            Toutes les branches (6)
          </button>

          {PMB_BRANCHES.map((branch) => {
            const active = selectedFilter === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedFilter(branch.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                  active
                    ? 'bg-[#262626] text-white border-white/30'
                    : 'bg-[#1c1c1e] text-zinc-400 hover:text-white border-white/10'
                }`}
              >
                {branch.index}. {branch.name}
              </button>
            );
          })}
        </div>

        {/* État vide si aucun résultat */}
        {filteredBranches.length === 0 ? (
          <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-10 text-center">
            <p className="text-base font-medium text-white">
              Aucune prestation ne correspond à « {query} »
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Réinitialisez le filtre pour afficher l’ensemble des six divisions.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedFilter('all');
              }}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#229ED9] hover:bg-[#1c89be] rounded-lg transition-colors cursor-pointer"
            >
              Afficher toutes les branches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch, idx) => {
              const isWide = selectedFilter === 'all' && (idx === 0 || idx === 2);
              return (
                <article
                  key={branch.id}
                  className={`group rounded-xl bg-[#1c1c1e] border border-white/10 hover:border-white/25 overflow-hidden flex flex-col transition-colors duration-200 ${
                    isWide ? 'lg:col-span-2' : 'lg:col-span-1'
                  }`}
                >
                  {/* Visuel scène + Logo officiel */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-[#262626]">
                    <MediaImage
                      src={branch.sceneImage}
                      alt={`${branch.name} — ${branch.visualAnalysis}`}
                      fallbackTitle={branch.name}
                      accentColor={branch.accentColor}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/40 to-transparent"
                    />

                    {/* Logo officiel de la branche uniquement */}
                    <div
                      className={`absolute top-4 left-4 w-14 h-14 rounded-lg overflow-hidden border border-white/20 ${
                        branch.id === 'pmb-fondation' ? 'bg-white p-1' : 'bg-[#121212]/90'
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

                  {/* Corps de carte */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: branch.accentColor }}
                          aria-hidden="true"
                        />
                        <span className="font-mono-tabular">Branche {branch.index}</span>
                        <span aria-hidden="true">·</span>
                        <span>{branch.colorName}</span>
                        {branch.id === 'pmb-transport' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-zinc-200 font-medium">Import & Export</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {branch.name}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                        {branch.officialMission}
                      </p>

                      {/* Modes logistiques étendus pour PMB Transport */}
                      {branch.transportModes && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/[0.08]">
                          {branch.transportModes.map((mode) => (
                            <div
                              key={mode.id}
                              className="rounded-lg bg-[#262626]/70 border border-white/[0.07] p-3"
                            >
                              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                                {mode.id === 'terrestre' && (
                                  <Truck className="w-4 h-4 text-[#C9C238] shrink-0" aria-hidden="true" />
                                )}
                                {mode.id === 'maritime' && (
                                  <Ship className="w-4 h-4 text-[#C9C238] shrink-0" aria-hidden="true" />
                                )}
                                {mode.id === 'aerien' && (
                                  <Plane className="w-4 h-4 text-[#C9C238] shrink-0" aria-hidden="true" />
                                )}
                                <span>{mode.title}</span>
                              </div>
                              <p className="mt-1 text-xs text-zinc-400 leading-snug">
                                {mode.subtitle}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <ul className="mt-4 space-y-2 border-t border-white/[0.08] pt-4">
                        {(cms.branchServices[branch.id] ?? branch.services).map((service) => (
                          <li
                            key={service}
                            className="text-sm text-zinc-300 flex items-start gap-2.5 leading-snug"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: branch.accentColor }}
                            />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/[0.08]">
                      <span className="text-xs text-zinc-400">
                        {branch.id === 'pmb-transport'
                          ? 'Kinshasa & International'
                          : 'Kinshasa, RDC'}
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {branch.id === 'pmb-fondation' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onSelectBranch(branch)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-200 bg-[#262626] hover:bg-[#323232] border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <span>Fiche</span>
                            </button>
                            <button
                              type="button"
                              onClick={onEnterFondation}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-[#121212] bg-[#F59E0B] hover:bg-[#d98a07] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <span>Accéder à PMB Fondation</span>
                              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectBranch(branch)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#262626] hover:bg-[#323232] border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span>Accéder à l’espace {branch.shortName}</span>
                            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Vitrine Articles & Offres PMB Shop / Store pilotée par le CMS Admin */}
        {cms.catalogArticles.length > 0 && (
          <div className="mt-12 rounded-xl bg-[#1c1c1e] border border-white/10 p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#229ED9]">
                  Catalogue Rapide · PMB Shop & PMB Store
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                  Articles & Offres Disponibles à la Commande
                </h3>
              </div>
              {orderNotice && (
                <p
                  role="status"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{orderNotice}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cms.catalogArticles.map((art) => {
                const artBranch = PMB_BRANCHES.find((b) => b.id === art.branchId);
                return (
                  <div
                    key={art.id}
                    className="rounded-xl bg-[#121212] border border-white/10 p-4 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {artBranch && (
                            <img
                              src={artBranch.logoImage}
                              alt={`Logo ${artBranch.name}`}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded object-cover border border-white/15 shrink-0"
                            />
                          )}
                          <span className="text-xs font-semibold text-zinc-300 truncate">
                            {artBranch?.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-tabular text-zinc-400">
                          {art.inStock ? 'Disponible' : 'Sur commande'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white leading-snug">{art.title}</p>
                      <p className="text-xs text-zinc-400">{art.description}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
                      <span className="text-sm font-bold font-mono-tabular text-[#F59E0B]">
                        {art.priceLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          addOrder({
                            branchId: art.branchId,
                            branchName: artBranch?.name || 'PMB Shop',
                            customerName: currentMember?.fullName || 'Client Site Web',
                            customerContact: currentMember?.phone || '+243',
                            serviceOrArticle: art.title,
                            amountLabel: art.priceLabel,
                            status: 'En attente',
                          });
                          setOrderNotice(
                            `Commande « ${art.title} » envoyée au Dashboard Administrateur.`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Commander</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
