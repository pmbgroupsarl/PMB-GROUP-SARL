import { useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { PMB_FONDATION_CHARTER } from '../../data/pmbData';
import { MembershipPaymentTicket } from '../../lib/membershipPayment';
import { RegistrationForm } from '../RegistrationForm';

interface FondationAdhesionPillarProps {
  sharedTicket: MembershipPaymentTicket | null;
  onSharedTicketChange: (ticket: MembershipPaymentTicket | null) => void;
}

export function FondationAdhesionPillar({
  sharedTicket,
  onSharedTicketChange,
}: FondationAdhesionPillarProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    PMB_FONDATION_CHARTER.categories[0].id
  );

  const activeCategory =
    PMB_FONDATION_CHARTER.categories.find((c) => c.id === activeCategoryId) ??
    PMB_FONDATION_CHARTER.categories[0];

  return (
    <div className="space-y-8">
      <div className="no-print max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
          Pilier 2 · Adhésion & Fiche Officielle (Format A4)
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          Catégories d’Adhésion & Formulaire Officiel PMB Fondation
        </h2>
        <p className="mt-2 text-sm sm:text-base text-zinc-400">
          Complétez la fiche d’adhésion officielle avec sexe (Femme / Homme), photo (Importer,
          Selfie caméra ou Ignorer — max. 25 Mo), 24 communes et quartiers de Kinshasa, indicatif
          +243 par défaut et deux lignes de signatures manuscrites.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne gauche : Règles, 4 Catégories & Téléchargements PDF */}
        <div className="no-print lg:col-span-4 space-y-6">
          <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Statuts & Catégories Officielles
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Consultez les droits, responsabilités et conditions d’adhésion.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5" role="tablist">
                {PMB_FONDATION_CHARTER.categories.map((cat) => {
                  const active = cat.id === activeCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#F59E0B] text-[#121212] border-[#F59E0B] font-semibold'
                          : 'bg-[#262626] text-zinc-300 hover:text-white border-white/10'
                      }`}
                    >
                      {cat.number}. {cat.title}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl bg-[#121212] border border-white/[0.08] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-white text-sm">
                    {activeCategory.number}. {activeCategory.title}
                  </span>
                  <span>Cotisation : {activeCategory.cotisation}</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{activeCategory.summary}</p>

                <div className="space-y-3 pt-2 border-t border-white/[0.08] text-xs">
                  <div>
                    <p className="font-semibold text-zinc-200 mb-1">Responsabilités :</p>
                    <ul className="space-y-1 text-zinc-400">
                      {activeCategory.responsibilities.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-[#F59E0B]" aria-hidden="true">
                            ·
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-zinc-200 mb-1">Conditions d’adhésion :</p>
                    <ul className="space-y-1 text-zinc-400">
                      {activeCategory.conditions.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-[#F59E0B]" aria-hidden="true">
                            ·
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-4 space-y-2 text-xs text-zinc-300">
              <p className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                <span>Règles communes d’adhésion</span>
              </p>
              <ul className="space-y-1 text-zinc-400">
                {PMB_FONDATION_CHARTER.commonRules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span aria-hidden="true" className="text-[#F59E0B]">
                      ·
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/[0.08] pt-4 flex flex-col gap-2">
              <a
                href={PMB_FONDATION_CHARTER.fichePdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#121212] bg-[#F59E0B] hover:bg-[#d98a06] rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Télécharger Fiche Vierge (PDF)</span>
              </a>
              <a
                href={PMB_FONDATION_CHARTER.conditionsPdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#262626] hover:bg-[#323232] border border-white/10 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Télécharger Conditions Générales (PDF)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Colonne droite : Formulaire complet + Fiche A4 imprimable PMB FONDATION */}
        <div className="lg:col-span-8">
          <RegistrationForm
            lockedBranchId="pmb-fondation"
            embedded
            externalPaymentTicket={sharedTicket}
            onExternalPaymentTicketChange={onSharedTicketChange}
          />
        </div>
      </div>
    </div>
  );
}
