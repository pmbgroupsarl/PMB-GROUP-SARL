import { PMB_BRANCHES, PMB_COMPANY, PMB_EVENT_VIDEOS } from '../data/pmbData';
import { MediaImage } from './MediaImage';

interface AboutSectionProps {
  embedded?: boolean;
  onExploreBranch?: (branchId: string) => void;
}

export function AboutSection({ embedded = false, onExploreBranch }: AboutSectionProps) {
  return (
    <section
      id="groupe"
      className={
        embedded
          ? 'no-print'
          : 'no-print py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20'
      }
    >
      <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Colonne gauche : Emblème officiel du groupe */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[300px] lg:min-h-[420px] rounded-xl overflow-hidden bg-[#1c1c1e] border border-white/10">
              <MediaImage
                src={PMB_COMPANY.groupLogo}
                alt="Logo officiel de PMB GROUP SARL"
                fallbackTitle={PMB_COMPANY.legalName}
                className="w-full h-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-transparent to-transparent"
              />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs text-zinc-300">Identité officielle du groupe</p>
                <p className="text-lg font-bold text-white tracking-tight mt-0.5">
                  {PMB_COMPANY.legalName}
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite : Gouvernance légale & ancrage Kinshasa */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div>
              <p className="text-sm font-medium text-[#229ED9] mb-2">
                Institution & Conformité Légale
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Un groupe multisectoriel ancré à Kinshasa
              </h2>
              <p className="mt-4 text-base text-zinc-300 leading-relaxed">
                Enregistrée en République Démocratique du Congo, la société{' '}
                <strong className="text-white font-semibold">{PMB_COMPANY.legalName}</strong>{' '}
                fédère six divisions complémentaires pour répondre aux besoins quotidiens des
                particuliers, des entreprises et des communautés à Kinshasa : connectivité numérique,
                distribution de biens essentiels, mobilité urbaine, bâtiment, production
                événementielle et action sociale.
              </p>
            </div>

            {/* Tableau officiel des mentions légales */}
            <div className="rounded-xl bg-[#1c1c1e] border border-white/10 overflow-hidden">
              <dl className="divide-y divide-white/[0.08] text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-5 py-3.5">
                  <dt className="text-zinc-400 font-medium">Raison Sociale</dt>
                  <dd className="sm:col-span-2 text-white font-semibold">
                    {PMB_COMPANY.legalName}
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-5 py-3.5">
                  <dt className="text-zinc-400 font-medium">Registre de Commerce</dt>
                  <dd className="sm:col-span-2 text-zinc-100 font-mono-tabular">
                    {PMB_COMPANY.rccm}
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-5 py-3.5">
                  <dt className="text-zinc-400 font-medium">Identification Nationale</dt>
                  <dd className="sm:col-span-2 text-zinc-100 font-mono-tabular">
                    {PMB_COMPANY.idNat}
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-5 py-3.5">
                  <dt className="text-zinc-400 font-medium">Siège Social</dt>
                  <dd className="sm:col-span-2 text-zinc-200 leading-relaxed">
                    <span className="block font-medium text-white">
                      {PMB_COMPANY.headquartersPlace}
                    </span>
                    <span className="text-zinc-400">{PMB_COMPANY.headquartersReference}</span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Chiffres clés factuels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg bg-[#1c1c1e] border border-white/10 p-4">
                <p className="text-2xl font-bold text-white font-mono-tabular">06</p>
                <p className="text-xs text-zinc-400 mt-1">Branches opérationnelles</p>
              </div>
              <div className="rounded-lg bg-[#1c1c1e] border border-white/10 p-4">
                <p className="text-2xl font-bold text-white font-mono-tabular">
                  {PMB_BRANCHES.reduce((acc, b) => acc + b.services.length, 0)}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Prestations structurées</p>
              </div>
              <div className="rounded-lg bg-[#1c1c1e] border border-white/10 p-4">
                <p className="text-2xl font-bold text-white font-mono-tabular">
                  {PMB_EVENT_VIDEOS.length}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Vidéos PMB Event</p>
              </div>
              <button
                type="button"
                onClick={() => onExploreBranch?.(PMB_BRANCHES[0].id)}
                className="rounded-lg bg-[#262626] hover:bg-[#303030] border border-white/10 p-4 text-left transition-colors cursor-pointer"
              >
                <p className="text-sm font-semibold text-[#229ED9]">Accéder aux pôles</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {PMB_BRANCHES.length} espaces dédiés
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
