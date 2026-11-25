import { ExternalLink, Mail, MapPin, MessageCircle, ShieldCheck, Wrench } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { PMB_COMPANY } from '../data/pmbData';
import { MediaImage } from './MediaImage';
import { NewsletterSignup } from './NewsletterSignup';

interface FooterProps {
  onNavigateHome: (sectionId?: string) => void;
  onOpenFondationSpace: () => void;
  onOpenAdminPortal: () => void;
  onOpenQaDashboard: () => void;
}

export function Footer({
  onNavigateHome,
  onOpenFondationSpace,
  onOpenAdminPortal,
  onOpenQaDashboard,
}: FooterProps) {
  const prefersReducedMotion = useReducedMotion();

  const fadeProps = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <footer className="no-print relative z-10 bg-[#0e0e0f]/88 border-t border-white/[0.08] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <motion.div {...fadeProps(0.05)}>
          <NewsletterSignup />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/[0.08]">
          {/* Colonne 1 : Identité & Logo officiel */}
          <motion.div {...fadeProps(0.12)} className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/15 bg-[#121212] shrink-0">
                <MediaImage
                  src={PMB_COMPANY.watermarkLogo}
                  alt="Logo officiel PMB GROUP SARL"
                  fallbackTitle="PMB"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-base font-bold text-white tracking-tight">
                  {PMB_COMPANY.legalName}
                </p>
                <p className="text-xs text-zinc-400 font-mono-tabular mt-0.5">
                  {PMB_COMPANY.rccm}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Six pôles opérationnels au service de Kinshasa et de l’Import-Export : Shop, Store,
              Transport (Terrestre, Maritime Paquebot & Aérien Avion), Immobilier, Event et
              Fondation.
            </p>

            <div className="flex items-start gap-2 text-xs text-zinc-300">
              <MapPin className="w-4 h-4 text-[#229ED9] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{PMB_COMPANY.fullHeadquartersAddress}</span>
            </div>
          </motion.div>

          {/* Colonne 2 : Navigation & Espaces */}
          <motion.div {...fadeProps(0.19)} className="lg:col-span-3 space-y-3">
            <p className="text-xs font-semibold text-white">Navigation & Branches</p>
            <nav
              aria-label="Liens de pied de page"
              className="grid grid-cols-2 md:grid-cols-1 gap-2.5 text-xs sm:text-sm text-zinc-400"
            >
              <button
                type="button"
                onClick={() => onNavigateHome('carrousel')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Carrousel 3D des 6 branches
              </button>
              <button
                type="button"
                onClick={() => onNavigateHome('services')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                6 Divisions opérationnelles
              </button>
              <button
                type="button"
                onClick={() => onNavigateHome('videos-event')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Médiathèque PMB Event
              </button>
              <button
                type="button"
                onClick={onOpenFondationSpace}
                className="text-left font-semibold text-[#F59E0B] hover:underline cursor-pointer"
              >
                Espace PMB Fondation (4 Piliers)
              </button>
              <button
                type="button"
                onClick={() => onNavigateHome('communaute')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Actualités & Forum Clients
              </button>
              <button
                type="button"
                onClick={() => onNavigateHome('faq')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Questions Fréquentes (FAQ)
              </button>
              <button
                type="button"
                onClick={() => onNavigateHome('contact')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Contact & Devis Kinshasa
              </button>
            </nav>
          </motion.div>

          {/* Colonne 3 : WhatsApp Universel en 1 clic */}
          <motion.div {...fadeProps(0.26)} className="lg:col-span-3 space-y-3">
            <p className="text-xs font-semibold text-white">
              WhatsApp Universel (Web & Mobile)
            </p>
            <ul className="space-y-2">
              {PMB_COMPANY.phones.map((phone) => (
                <li key={phone.whatsappUrl}>
                  <a
                    href={phone.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-300 hover:text-emerald-400 transition-colors font-mono-tabular"
                  >
                    <MessageCircle
                      className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{phone.display}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <a
                href={`mailto:${PMB_COMPANY.email}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#229ED9] hover:underline"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{PMB_COMPANY.email}</span>
              </a>
            </div>
          </motion.div>

          {/* Colonne 4 : Paiements Fondation & Admin */}
          <motion.div {...fadeProps(0.33)} className="lg:col-span-2 space-y-3">
            <p className="text-xs font-semibold text-white">Canaux PMB Fondation</p>
            <div className="space-y-1.5 text-xs text-zinc-400">
              <p className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" aria-hidden="true" />
                <span>Visa & Mastercard</span>
              </p>
              <p>Orange Money RDC</p>
              <p>Airtel Money RDC</p>
              <p>M-Pesa Vodacom RDC</p>
              <p>Virement Bancaire</p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="block text-xs font-semibold text-[#229ED9] hover:underline cursor-pointer text-left"
              >
                Dashboard Admin (PMB Fondation)
              </button>
              <button
                type="button"
                onClick={onOpenQaDashboard}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-[#F59E0B] transition-colors cursor-pointer text-left"
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Console QA & Auto-Debug IA</span>
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...fadeProps(0.4)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500"
        >
          <p className="font-mono-tabular">
            {PMB_COMPANY.rccm} · {PMB_COMPANY.idNat}
          </p>
          <p>
            © {new Date().getFullYear()} {PMB_COMPANY.legalName} — Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
