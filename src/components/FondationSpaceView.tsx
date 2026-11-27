import { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { PMB_BRANCHES, PMB_COMPANY, PMB_FONDATION_CHARTER } from '../data/pmbData';
import { MembershipPaymentTicket } from '../lib/membershipPayment';
import { FondationAdhesionPillar } from './fondation/FondationAdhesionPillar';
import { FondationIdentityPillar } from './fondation/FondationIdentityPillar';
import { FondationPaymentPillar } from './fondation/FondationPaymentPillar';
import {
  FondationPortalPillar,
  FondationPortalSubTab,
} from './fondation/FondationPortalPillar';

export type FondationPillarId = 'pilier-1' | 'pilier-2' | 'pilier-3' | 'pilier-4';

interface FondationSpaceViewProps {
  activePillar: FondationPillarId;
  onChangePillar: (pillar: FondationPillarId) => void;
  activePortalSubTab: FondationPortalSubTab;
  onChangePortalSubTab: (tab: FondationPortalSubTab) => void;
  onBackToGroupHome: () => void;
  onOpenQaDashboard: () => void;
  embedded?: boolean;
}

export function FondationSpaceView({
  activePillar,
  onChangePillar,
  activePortalSubTab,
  onChangePortalSubTab,
  onBackToGroupHome,
  onOpenQaDashboard,
  embedded = false,
}: FondationSpaceViewProps) {
  const fondationBranch = PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;
  const [sharedPaymentTicket, setSharedPaymentTicket] =
    useState<MembershipPaymentTicket | null>(null);

  const pillars: {
    id: FondationPillarId;
    label: string;
    shortDesc: string;
    icon: typeof CreditCard;
  }[] = [
    {
      id: 'pilier-1',
      label: 'Pilier 1 · Paiement & Reçus',
      shortDesc: 'Mobile Money, Carte & Virement',
      icon: CreditCard,
    },
    {
      id: 'pilier-2',
      label: 'Pilier 2 · Adhésion & Fiche A4',
      shortDesc: '4 catégories & Fiche officielle',
      icon: FileText,
    },
    {
      id: 'pilier-3',
      label: 'Pilier 3 · Portail & Admin',
      shortDesc: 'Membre, Visiteur & CMS',
      icon: Users,
    },
    {
      id: 'pilier-4',
      label: 'Pilier 4 · Identité & Actions',
      shortDesc: 'Devise & Projets Kinshasa',
      icon: HeartHandshake,
    },
  ];

  return (
    <div className={embedded ? 'space-y-6' : 'relative z-10 py-8 lg:py-12'}>
      <div className={embedded ? 'space-y-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8'}>
        {/* En-tête exclusif PMB FONDATION */}
        <div className="no-print rounded-2xl bg-[#1c1c1e] border border-[#0284c7]/40 p-5 sm:p-6 space-y-5">
          {!embedded && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <button
                type="button"
                onClick={onBackToGroupHome}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#121212] hover:bg-[#262626] border border-white/15 text-xs sm:text-sm font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4 text-[#229ED9]" aria-hidden="true" />
                <span>Retour à l’accueil PMB GROUP SARL</span>
              </button>

              <span className="text-xs text-zinc-400 font-mono-tabular">
                {PMB_COMPANY.headquartersPlace}
              </span>
            </div>
          )}

          {/* Identité & Devise officielle PMB FONDATION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={fondationBranch.logoImage}
                alt="Logo officiel PMB FONDATION"
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-contain bg-white p-1.5 border border-white/20 shrink-0"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#38BDF8]">
                  Espace Dédié & Autonome · Branche Sociale
                </p>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                  PMB FONDATION
                </h1>
                <p className="mt-1.5 text-sm sm:text-base font-medium text-[#F59E0B]">
                  « PMB Fondation · {PMB_FONDATION_CHARTER.motto} »
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-zinc-300 bg-[#121212] border border-white/10 rounded-lg px-3.5 py-2.5 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#0284c7] shrink-0" aria-hidden="true" />
              <span>4 Piliers · Adhésion, Paiement, Portail & Admin</span>
            </div>
          </div>

          {/* Sélecteur des 4 Piliers exacts */}
          <div
            role="tablist"
            aria-label="Les 4 piliers de PMB FONDATION"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
          >
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const active = activePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChangePillar(pillar.id)}
                  className={`rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0284c7] border-[#38BDF8] text-white'
                      : 'bg-[#121212] border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-[#F59E0B]'}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{pillar.label}</span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 truncate ${
                      active ? 'text-sky-100' : 'text-zinc-400'
                    }`}
                  >
                    {pillar.shortDesc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu du Pilier Actif */}
        {activePillar === 'pilier-1' && (
          <FondationPaymentPillar
            activeTicket={sharedPaymentTicket}
            onTicketGenerated={setSharedPaymentTicket}
            onGoToAdhesion={() => onChangePillar('pilier-2')}
          />
        )}

        {activePillar === 'pilier-2' && (
          <FondationAdhesionPillar
            sharedTicket={sharedPaymentTicket}
            onSharedTicketChange={setSharedPaymentTicket}
          />
        )}

        {activePillar === 'pilier-3' && (
          <FondationPortalPillar
            activeSubTab={activePortalSubTab}
            onChangeSubTab={onChangePortalSubTab}
            onGoToAdhesion={() => onChangePillar('pilier-2')}
            onOpenQaDashboard={onOpenQaDashboard}
          />
        )}

        {activePillar === 'pilier-4' && (
          <FondationIdentityPillar
            onGoToPayment={() => onChangePillar('pilier-1')}
            onGoToAdhesion={() => onChangePillar('pilier-2')}
            onGoToVisitor={() => {
              onChangePortalSubTab('visitor');
              onChangePillar('pilier-3');
            }}
          />
        )}
      </div>
    </div>
  );
}
