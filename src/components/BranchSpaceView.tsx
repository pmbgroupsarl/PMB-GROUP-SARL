import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Film,
  Layers,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Plane,
  Ship,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import {
  HUB_BRANCH_IDS,
  PMB_BRANCHES,
  PMB_COMPANY,
  PMB_EVENT_VIDEOS,
} from '../data/pmbData';
import { usePmbStore } from '../lib/pmbStore';
import { AgendaForumSection } from './AgendaForumSection';
import { ContactQuoteSection } from './ContactQuoteSection';
import { EventVideoShowcase } from './EventVideoShowcase';
import { FAQSection } from './FAQSection';
import { FondationPillarId, FondationSpaceView } from './FondationSpaceView';
import { FondationPortalSubTab } from './fondation/FondationPortalPillar';
import { MediaImage } from './MediaImage';
import { PaymentGatewaySection } from './PaymentGatewaySection';

export type BranchInternalTab = 'services' | 'galerie' | 'tarifs' | 'actualites' | 'contact';

interface BranchSpaceViewProps {
  branchId: string;
  initialTab?: BranchInternalTab;
  fondationPillar: FondationPillarId;
  onChangeFondationPillar: (pillar: FondationPillarId) => void;
  fondationPortalSubTab: FondationPortalSubTab;
  onChangeFondationPortalSubTab: (tab: FondationPortalSubTab) => void;
  onSelectBranch: (branchId: string) => void;
  onBackHome: () => void;
  onOpenQaDashboard: () => void;
}

export function BranchSpaceView({
  branchId,
  initialTab = 'services',
  fondationPillar,
  onChangeFondationPillar,
  fondationPortalSubTab,
  onChangeFondationPortalSubTab,
  onSelectBranch,
  onBackHome,
  onOpenQaDashboard,
}: BranchSpaceViewProps) {
  const { cms, addOrder, currentMember } = usePmbStore();
  const [activeTab, setActiveTab] = useState<BranchInternalTab>(initialTab);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [communitySubView, setCommunitySubView] = useState<'forum' | 'faq'>('forum');

  const branch = useMemo(
    () => PMB_BRANCHES.find((b) => b.id === branchId) ?? PMB_BRANCHES[0],
    [branchId]
  );

  const orderedBranches = useMemo(
    () =>
      HUB_BRANCH_IDS.map((id) => PMB_BRANCHES.find((b) => b.id === id)!).filter(Boolean),
    []
  );

  useEffect(() => {
    setActiveTab(initialTab);
    setOrderNotice(null);
  }, [branchId, initialTab]);

  const branchServices = cms.branchServices[branch.id] ?? branch.services;
  const branchArticles = cms.catalogArticles.filter((a) => a.branchId === branch.id);

  const commercialTabs: {
    id: BranchInternalTab;
    label: string;
    icon: typeof Layers;
  }[] = [
    {
      id: 'services',
      label:
        branch.id === 'pmb-transport'
          ? 'Services & Modes'
          : branch.id === 'pmb-event'
            ? 'Services & Équipements'
            : branch.id === 'pmb-shop' || branch.id === 'pmb-store'
              ? 'Services & Catalogue'
              : 'Services & Offres',
      icon: Layers,
    },
    ...(branch.id === 'pmb-event'
      ? [
          {
            id: 'galerie' as BranchInternalTab,
            label: `Galerie Vidéo (${PMB_EVENT_VIDEOS.length})`,
            icon: Film,
          },
        ]
      : []),
    {
      id: 'tarifs',
      label: 'Tarifs & Paiement',
      icon: CreditCard,
    },
    {
      id: 'actualites',
      label: 'Actualités & FAQ',
      icon: MessageSquare,
    },
    {
      id: 'contact',
      label: 'Contact & Réservation',
      icon: Phone,
    },
  ];

  return (
    <div className="relative z-10 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Fil d'Ariane + Retour à l'accueil + Bascule rapide entre les 6 pôles */}
        <div className="no-print rounded-xl bg-[#18181b]/95 border border-white/10 px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#323232] border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#229ED9]" aria-hidden="true" />
              <span>Retour à l’accueil</span>
            </button>

            <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-zinc-400">
              <button
                type="button"
                onClick={onBackHome}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Accueil
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
              <span className="font-semibold text-white">{branch.name}</span>
            </nav>
          </div>

          {/* Bascule directe 1 clic entre les 6 branches */}
          <div
            role="navigation"
            aria-label="Changement rapide de branche"
            className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          >
            {orderedBranches.map((item) => {
              const isCurrent = item.id === branch.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectBranch(item.id)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'bg-[#262626] text-white border-white/30'
                      : 'bg-[#121212] text-zinc-400 hover:text-white border-white/[0.08]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ backgroundColor: item.accentColor }}
                    aria-hidden="true"
                  />
                  <span>{item.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vue dédiée PMB Fondation (4 Piliers) OU Vue dédiée aux 5 autres pôles */}
        {branch.id === 'pmb-fondation' ? (
          <FondationSpaceView
            embedded
            activePillar={fondationPillar}
            onChangePillar={onChangeFondationPillar}
            activePortalSubTab={fondationPortalSubTab}
            onChangePortalSubTab={onChangeFondationPortalSubTab}
            onBackToGroupHome={onBackHome}
            onOpenQaDashboard={onOpenQaDashboard}
          />
        ) : (
          <div className="space-y-5">
            {/* En-tête compact résumant la branche + Onglets internes */}
            <div className="no-print rounded-2xl bg-[#1c1c1e]/95 border border-white/10 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-white/15 bg-[#121212] shrink-0">
                    <MediaImage
                      src={branch.logoImage}
                      alt={`Logo officiel ${branch.name}`}
                      fallbackTitle={branch.shortName}
                      accentColor={branch.accentColor}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ backgroundColor: branch.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="font-mono-tabular">Pôle {branch.index}</span>
                      <span aria-hidden="true">·</span>
                      <span>Kinshasa, RDC</span>
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {branch.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-0.5 line-clamp-2">
                      {branch.officialMission}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <a
                    href={PMB_COMPANY.phones[0].whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#121212] hover:bg-[#262626] border border-white/15 text-xs sm:text-sm font-medium text-emerald-400 transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contact')}
                    className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#121212] transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: branch.accentColor }}
                  >
                    Demander un devis
                  </button>
                </div>
              </div>

              {/* Onglets internes anti-scroll */}
              <div
                role="tablist"
                aria-label={`Navigation interne ${branch.name}`}
                className="flex items-center gap-1.5 overflow-x-auto pt-4 border-t border-white/[0.08]"
              >
                {commercialTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                        active
                          ? 'bg-[#229ED9] text-white border-[#229ED9]'
                          : 'bg-[#121212] text-zinc-300 hover:text-white border-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenu de l'onglet actif */}
            <div className="rounded-2xl bg-[#18181b]/90 border border-white/10 p-5 sm:p-6">
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Colonne gauche : Visuel officiel & Impact Kinshasa */}
                    <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-[#121212] border border-white/10 overflow-hidden">
                      <div className="relative h-52 sm:h-60 bg-[#262626]">
                        <MediaImage
                          src={branch.sceneImage}
                          alt={`${branch.name} — ${branch.visualAnalysis}`}
                          fallbackTitle={branch.name}
                          accentColor={branch.accentColor}
                          className="w-full h-full object-cover"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/35 to-transparent"
                        />
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h2 className="text-sm font-bold text-white">
                            Déploiement à Kinshasa & Opérations
                          </h2>
                          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                            {branch.kinshasaImpact}
                          </p>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {branch.visualAnalysis}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2 text-xs text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-[#229ED9] shrink-0" aria-hidden="true" />
                          <span className="truncate">{PMB_COMPANY.headquartersPlace}</span>
                        </div>
                      </div>
                    </div>

                    {/* Colonne droite : Prestations clés + Modules spécifiques */}
                    <div className="lg:col-span-7 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                          Prestations & Solutions {branch.name}
                        </h2>
                        <span className="text-xs text-zinc-400 font-mono-tabular">
                          {branchServices.length} prestations
                        </span>
                      </div>

                      <ul className="space-y-2.5">
                        {branchServices.map((service) => (
                          <li
                            key={service}
                            className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121212] border border-white/[0.08]"
                          >
                            <span
                              className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[#121212]"
                              style={{ backgroundColor: branch.accentColor }}
                            >
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            </span>
                            <span className="text-sm text-zinc-100 leading-snug">{service}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Modes logistiques multimodaux pour PMB Transport */}
                      {branch.transportModes && (
                        <div className="pt-3 border-t border-white/[0.08] space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">
                              Chaîne Logistique Import & Export
                            </h3>
                            <span className="text-xs text-zinc-400">
                              Terrestre · Maritime · Aérien
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {branch.transportModes.map((mode) => (
                              <div
                                key={mode.id}
                                className="rounded-xl bg-[#121212] border border-white/[0.08] p-3.5 space-y-1.5"
                              >
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
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
                                <p className="text-[11px] font-medium text-[#C9C238]">
                                  {mode.subtitle}
                                </p>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                  {mode.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raccourci direct vers la galerie vidéo pour PMB Event */}
                      {branch.id === 'pmb-event' && (
                        <div className="rounded-xl bg-[#121212] border border-[#7B1FA2]/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              <Film className="w-4 h-4 text-[#A855F7]" aria-hidden="true" />
                              <span>
                                {PMB_EVENT_VIDEOS.length} vidéos réelles disponibles dans la galerie
                              </span>
                            </p>
                            <p className="text-xs text-zinc-400">
                              Sommet UPA, Sanjola, Golden Tulip, Limete & installations LED.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('galerie')}
                            className="px-4 py-2 rounded-lg bg-[#7B1FA2] hover:bg-[#6a1b8c] text-white text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Ouvrir la Galerie Vidéo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Articles commandables pour PMB Shop & PMB Store */}
                  {branchArticles.length > 0 && (
                    <div className="pt-5 border-t border-white/[0.08] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            Catalogue Rapide · {branch.name}
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Passez commande en 1 clic pour traitement par nos équipes à Kinshasa.
                          </p>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {branchArticles.map((art) => (
                          <div
                            key={art.id}
                            className="rounded-xl bg-[#121212] border border-white/10 p-4 flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                                <span>{art.branchName}</span>
                                <span className="font-mono-tabular">
                                  {art.inStock ? 'Disponible' : 'Sur commande'}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-white leading-snug">
                                {art.title}
                              </p>
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
                                    branchName: branch.name,
                                    customerName: currentMember?.fullName || 'Client Site Web',
                                    customerContact: currentMember?.phone || '+243',
                                    serviceOrArticle: art.title,
                                    amountLabel: art.priceLabel,
                                    status: 'En attente',
                                  });
                                  setOrderNotice(
                                    `Commande « ${art.title} » transmise au Dashboard Administrateur.`
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Commander</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'galerie' && branch.id === 'pmb-event' && (
                <EventVideoShowcase
                  embedded
                  onRequestEventQuote={() => setActiveTab('contact')}
                />
              )}

              {activeTab === 'tarifs' && (
                <PaymentGatewaySection embedded preselectedBranchId={branch.id} />
              )}

              {activeTab === 'actualites' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">
                        Actualités, Forum & Questions Fréquentes
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Échanges directs et réponses sur les services {branch.name}.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#121212] border border-white/10">
                      <button
                        type="button"
                        onClick={() => setCommunitySubView('forum')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                          communitySubView === 'forum'
                            ? 'bg-[#229ED9] text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Agenda & Forum
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommunitySubView('faq')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                          communitySubView === 'faq'
                            ? 'bg-[#229ED9] text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        FAQ PMB Group
                      </button>
                    </div>
                  </div>

                  {communitySubView === 'forum' ? (
                    <AgendaForumSection embedded initialBranchFilter={branch.id} />
                  ) : (
                    <FAQSection embedded />
                  )}
                </div>
              )}

              {activeTab === 'contact' && (
                <ContactQuoteSection embedded preselectedBranchId={branch.id} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
