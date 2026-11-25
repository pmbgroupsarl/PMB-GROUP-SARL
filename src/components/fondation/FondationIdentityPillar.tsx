import { ArrowRight, CalendarDays, HeartHandshake, MapPin, ShieldCheck, Users } from 'lucide-react';
import { PMB_BRANCHES, PMB_COMPANY, PMB_FONDATION_CHARTER } from '../../data/pmbData';
import { usePmbStore } from '../../lib/pmbStore';
import { MediaImage } from '../MediaImage';

interface FondationIdentityPillarProps {
  onGoToPayment: () => void;
  onGoToAdhesion: () => void;
  onGoToVisitor: () => void;
}

export function FondationIdentityPillar({
  onGoToPayment,
  onGoToAdhesion,
  onGoToVisitor,
}: FondationIdentityPillarProps) {
  const { cms } = usePmbStore();
  const fondationBranch = PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;
  const fondationServices = cms.branchServices['pmb-fondation'] ?? fondationBranch.services;
  const fondationFaqs = cms.faqs.filter(
    (f) =>
      f.category.toLowerCase().includes('fondation') ||
      f.category.toLowerCase().includes('adhésion')
  );

  return (
    <div className="space-y-8">
      {/* Bannière Identitaire & Devise Officielle */}
      <div className="rounded-xl bg-[#1c1c1e] border border-[#0284c7]/40 p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
              Pilier 4 · Identité & Devise de PMB Fondation
            </p>
            <blockquote className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              « PMB Fondation · {PMB_FONDATION_CHARTER.motto} »
            </blockquote>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {fondationBranch.officialMission}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {fondationBranch.kinshasaImpact}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onGoToAdhesion}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                <span>Devenir Membre (Pilier 2)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onGoToVisitor}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
              >
                <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                <span>Aider ponctuellement</span>
              </button>
              <button
                type="button"
                onClick={onGoToPayment}
                className="px-4 py-2.5 rounded-lg bg-[#262626] hover:bg-zinc-700 border border-white/15 text-white text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                Passerelle de Paiement
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden border border-white/15 bg-[#121212]">
              <div className="relative h-56">
                <MediaImage
                  src={fondationBranch.sceneImage}
                  alt="Actions communautaires PMB Fondation à Kinshasa"
                  fallbackTitle="PMB Fondation"
                  className="w-full h-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <img
                    src={fondationBranch.logoImage}
                    alt="Logo officiel PMB FONDATION"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-contain bg-white p-1.5 border border-white/20 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">PMB FONDATION</p>
                    <p className="text-xs text-zinc-300">Kinshasa, RDC · Bandal Synkin</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/[0.08] flex items-start gap-2.5 text-xs text-zinc-400">
                <MapPin className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{PMB_COMPANY.fullHeadquartersAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programmes sociaux & Projets sur le terrain à Kinshasa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl bg-[#1c1c1e] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <h3 className="text-lg font-bold text-white">
              Projets Sociaux & Actions sur le Terrain à Kinshasa
            </h3>
            <span className="text-xs font-mono-tabular text-[#F59E0B]">
              {cms.fondationProjects.length} programmes actifs
            </span>
          </div>

          <div className="space-y-3">
            {cms.fondationProjects.map((proj) => (
              <article
                key={proj.id}
                className="rounded-xl bg-[#121212] border border-white/10 p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#38BDF8] font-medium">
                    <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{proj.dateLabel}</span>
                  </span>
                  <span className="text-zinc-400">
                    {proj.location} · <strong className="text-white">{proj.status}</strong>
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{proj.title}</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{proj.summary}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Engagements & FAQ de la fondation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              <span>Axes d’Intervention Communautaire</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              {fondationServices.map((srv) => (
                <li key={srv} className="flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-2 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{srv}</span>
                </li>
              ))}
            </ul>
          </div>

          {fondationFaqs.length > 0 && (
            <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#229ED9]" aria-hidden="true" />
                <span>Questions sur PMB Fondation</span>
              </h3>
              <div className="space-y-3">
                {fondationFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-lg bg-[#121212] border border-white/[0.08] p-3.5 space-y-1"
                  >
                    <p className="text-xs font-bold text-white">{faq.question}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
