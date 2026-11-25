import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { PMB_FONDATION_CHARTER } from '../../data/pmbData';

const MEMBRE_EFFECTIF_DATA = PMB_FONDATION_CHARTER.categories[0];

export function MembreEffectifInfoCard() {
  return (
    <div className="rounded-xl border border-[#F59E0B]/35 bg-[#121212]/90 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#F59E0B] shrink-0" aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Fiche & Règles du « {MEMBRE_EFFECTIF_DATA.title} »
          </h3>
        </div>
        <span className="text-xs sm:text-sm font-medium text-[#F59E0B]">
          Cotisation : {MEMBRE_EFFECTIF_DATA.cotisation}.
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Statut & Rôle
        </h4>
        <p className="text-sm text-zinc-200 leading-relaxed">
          {MEMBRE_EFFECTIF_DATA.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-white/[0.08]">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Responsabilités
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300">
            {MEMBRE_EFFECTIF_DATA.responsibilities.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-[#229ED9] shrink-0 mt-1"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Conditions d’adhésion
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300">
            {MEMBRE_EFFECTIF_DATA.conditions.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-1"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
