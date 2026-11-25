import { useEffect } from 'react';
import {
  Check,
  Film,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plane,
  Ship,
  Truck,
  X,
} from 'lucide-react';
import { BranchItem, PMB_COMPANY, PMB_EVENT_VIDEOS } from '../data/pmbData';
import { usePmbStore } from '../lib/pmbStore';
import { MediaImage } from './MediaImage';

import { FondationPillarId } from './FondationSpaceView';

interface BranchDetailModalProps {
  branch: BranchItem | null;
  onClose: () => void;
  onRequestQuoteForBranch: (branchId: string) => void;
  onEnterFondation: (pillar?: FondationPillarId) => void;
  onJumpToSection: (sectionId: string) => void;
}

export function BranchDetailModal({
  branch,
  onClose,
  onRequestQuoteForBranch,
  onEnterFondation,
  onJumpToSection,
}: BranchDetailModalProps) {
  const { cms } = usePmbStore();
  useEffect(() => {
    if (!branch) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [branch, onClose]);

  if (!branch) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-modal-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#18181b] border border-white/15 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visuel d'en-tête */}
        <div className="relative h-56 sm:h-72 bg-[#262626] overflow-hidden">
          <MediaImage
            src={branch.sceneImage}
            alt={`${branch.name} — ${branch.visualAnalysis}`}
            fallbackTitle={branch.name}
            accentColor={branch.accentColor}
            className="w-full h-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/55 to-black/20"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche détaillée"
            className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-[#121212]/80 hover:bg-[#121212] text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/20 shrink-0 ${
                branch.id === 'pmb-fondation' ? 'bg-white p-1.5' : 'bg-[#121212]'
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

            <div>
              <p className="text-xs sm:text-sm text-zinc-300 flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: branch.accentColor }}
                  aria-hidden="true"
                />
                <span className="font-mono-tabular">Branche {branch.index}</span>
                <span aria-hidden="true">·</span>
                <span>{branch.colorName}</span>
              </p>
              <h2
                id="branch-modal-title"
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5"
              >
                {branch.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Contenu détaillé */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">Mission officielle</h3>
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                {branch.officialMission}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">
                Déploiement opérationnel
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {branch.kinshasaImpact}
              </p>
            </div>
          </div>

          {/* Extension logistique multimodale pour PMB Transport */}
          {branch.transportModes && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-base font-semibold text-white">
                  Chaîne Logistique Globale · Import & Export
                </h3>
                <span className="text-xs text-zinc-400">Terrestre · Maritime · Aérien</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branch.transportModes.map((mode) => (
                  <div
                    key={mode.id}
                    className="rounded-xl bg-[#262626]/70 border border-white/[0.08] p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      {mode.id === 'terrestre' && (
                        <Truck className="w-4 h-4 text-[#C9C238]" aria-hidden="true" />
                      )}
                      {mode.id === 'maritime' && (
                        <Ship className="w-4 h-4 text-[#C9C238]" aria-hidden="true" />
                      )}
                      {mode.id === 'aerien' && (
                        <Plane className="w-4 h-4 text-[#C9C238]" aria-hidden="true" />
                      )}
                      <span>{mode.title}</span>
                    </div>
                    <p className="text-xs font-medium text-[#C9C238]">{mode.subtitle}</p>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prestations clés */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-base font-semibold text-white mb-4">
              Services & Prestations Clés
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              {(cms.branchServices[branch.id] ?? branch.services).map((service) => (
                <li
                  key={service}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-[#262626]/70 border border-white/[0.07]"
                >
                  <span
                    className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[#121212]"
                    style={{ backgroundColor: branch.accentColor }}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm sm:text-base text-zinc-100">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Accès direct à la médiathèque pour PMB Event */}
          {branch.id === 'pmb-event' && (
            <div className="rounded-xl bg-[#121212] border border-[#7B1FA2]/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Film className="w-4 h-4 text-[#A855F7]" aria-hidden="true" />
                  <span>{PMB_EVENT_VIDEOS.length} vidéos réelles de prestations disponibles</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Sanjola, Sommet UPA, Golden Tulip, Échangeur de Limete et installations LED.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJumpToSection('videos-event')}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-[#7B1FA2] hover:bg-[#6a1b8c] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Voir les 27 vidéos
              </button>
            </div>
          )}

          {/* Accès direct à l'espace autonome PMB Fondation */}
          {branch.id === 'pmb-fondation' && (
            <div className="rounded-xl bg-[#121212] border border-[#F59E0B]/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                  <span>Espace Dédié PMB Fondation (4 Piliers)</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">
                  « Une action aujourd’hui, un avenir meilleur demain. » · Paiement multi-canaux,
                  adhésion A4, portail membre/visiteur et administration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterFondation('pilier-2')}
                className="px-4 py-2.5 text-sm font-semibold text-[#121212] bg-[#F59E0B] hover:bg-[#d98a06] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Ouvrir l’espace PMB Fondation
              </button>
            </div>
          )}

          {/* Contexte du visuel officiel */}
          <div className="rounded-xl bg-[#121212] border border-white/[0.08] p-4">
            <p className="text-xs font-medium text-zinc-400 mb-1">
              Descriptif du visuel métier officiel
            </p>
            <p className="text-sm text-zinc-300">{branch.visualAnalysis}</p>
          </div>

          {/* Actions de contact rapide & Devis */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#229ED9] shrink-0" aria-hidden="true" />
                <span>{PMB_COMPANY.headquartersPlace}, Kinshasa</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={PMB_COMPANY.phones[0].whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:text-emerald-400 transition-colors font-mono-tabular"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>{PMB_COMPANY.phones[0].display} (WhatsApp)</span>
                </a>
                <a
                  href={`mailto:${PMB_COMPANY.email}?subject=${encodeURIComponent(
                    `Demande d'information — ${branch.name}`
                  )}`}
                  className="inline-flex items-center gap-1.5 text-white hover:text-[#229ED9] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{PMB_COMPANY.email}</span>
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {branch.id === 'pmb-fondation' ? (
                <button
                  type="button"
                  onClick={() => onEnterFondation('pilier-1')}
                  className="px-4 py-3 text-sm font-semibold text-white bg-[#262626] hover:bg-[#323232] border border-white/15 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Passerelle de Paiement Fondation
                </button>
              ) : (
                <a
                  href={PMB_COMPANY.phones[0].whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 text-sm font-semibold text-white bg-[#262626] hover:bg-[#323232] border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Contacter sur WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => onRequestQuoteForBranch(branch.id)}
                className="px-5 py-3 text-sm font-semibold text-[#121212] rounded-lg transition-transform duration-150 hover:scale-[1.02] cursor-pointer whitespace-nowrap shrink-0"
                style={{ backgroundColor: branch.accentColor }}
              >
                Demander un devis pour {branch.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
