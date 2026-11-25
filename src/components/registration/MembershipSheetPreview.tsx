import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Laptop,
  Mail,
  MessageCircle,
  Printer,
  Smartphone,
} from 'lucide-react';
import { PMB_COMPANY } from '../../data/pmbData';
import {
  MembershipExportPayload,
  buildMailtoUrl,
  buildWhatsAppShareUrl,
  downloadHtmlSheet,
  downloadJsonArchive,
  formatFrenchDate,
  resolveBranchBrand,
  saveOnPhoneOrShare,
  triggerCleanPrint,
} from '../../lib/membershipExport';
import { PaymentProofTicketCard } from './PaymentProofTicketCard';

interface MembershipSheetPreviewProps {
  data: MembershipExportPayload;
  onEditForm: () => void;
  printScope?: 'registration' | 'fondation' | 'portal';
}

export function MembershipSheetPreview({
  data,
  onEditForm,
  printScope = 'registration',
}: MembershipSheetPreviewProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const brand = resolveBranchBrand(data);

  const handleSaveOnPhone = async () => {
    const result = await saveOnPhoneOrShare(data);
    setActionFeedback(
      result === 'shared'
        ? 'Fiche partagée / enregistrée via votre téléphone.'
        : 'Fiche téléchargée sur votre appareil (format A4 prêt à enregistrer).'
    );
  };

  const handleDownloadSheet = () => {
    downloadHtmlSheet(data);
    setActionFeedback('Fiche A4 téléchargée sur votre appareil.');
  };

  const handleExportComputer = () => {
    downloadJsonArchive(data);
    setActionFeedback('Dossier complet exporté vers votre ordinateur (.json).');
  };

  return (
    <div className="space-y-6">
      {/* BANDEAU DE CONFIRMATION + ACTIONS POST-ENREGISTREMENT */}
      <div className="no-print rounded-xl bg-[#1c1c1e]/95 border border-emerald-500/35 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Fiche d’adhésion enregistrée ({data.reference})
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                {brand.branchName} · {data.fullName} · {data.category} ·{' '}
                <span className="font-mono-tabular text-zinc-300">{data.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#229ED9]/60 bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                  <span>Masquer l’aperçu</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  <span>Prévisualiser</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onEditForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs sm:text-sm font-medium text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
              <span>Modifier / Nouvelle fiche</span>
            </button>
          </div>
        </div>

        {/* BARRE D'ACTIONS : IMPRIMER, TÉLÉCHARGER, EXPORTER, TÉLÉPHONE, WHATSAPP, E-MAIL */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (!showPreview) setShowPreview(true);
              setTimeout(() => triggerCleanPrint(printScope), 80);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-[#121212] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Imprimer (Format A4)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSheet}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Télécharger / Enregistrer</span>
          </button>

          <button
            type="button"
            onClick={handleExportComputer}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <Laptop className="w-4 h-4 text-[#229ED9]" aria-hidden="true" />
            <span>Exporter vers l’ordinateur</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSaveOnPhone()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <Smartphone className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
            <span>Enregistrer sur le téléphone</span>
          </button>

          <a
            href={buildWhatsAppShareUrl(data)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span>Envoyer sur WhatsApp</span>
          </a>

          <a
            href={buildMailtoUrl(data)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-white text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Mail className="w-4 h-4 text-zinc-200" aria-hidden="true" />
            <span>Envoyer par e-mail</span>
          </a>
        </div>

        {actionFeedback && (
          <p role="status" className="text-xs text-emerald-400 font-medium">
            {actionFeedback}
          </p>
        )}
      </div>

      {/* PRÉVISUALISATION COMPLÈTE DE LA FICHE D'ADHÉSION (UNIQUEMENT LOGO DE LA BRANCHE) */}
      {showPreview && (
        <article className="print-certificate rounded-xl bg-white text-zinc-900 border border-zinc-300 p-6 sm:p-10 space-y-6 shadow-sm">
          {/* En-tête officiel dédié à la branche (sans logo PMB GROUP SARL) */}
          <div
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b-2 pb-5"
            style={{ borderColor: brand.accentColor }}
          >
            <div className="space-y-1">
              <div className="flex items-start gap-3.5">
                <img
                  src={brand.branchLogo}
                  alt={`Logo ${brand.branchName}`}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-md object-contain bg-white border border-zinc-200 p-1 shrink-0"
                />
                <div>
                  <p className="text-lg font-extrabold tracking-tight text-zinc-950 uppercase">
                    {brand.branchName}
                  </p>
                  <p className="text-xs text-zinc-600 font-mono-tabular mt-0.5">
                    RCCM/24-A-04653 · Id. Nat/01-G4701-N52717A
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                    Siège local : {PMB_COMPANY.fullHeadquartersAddress}
                  </p>
                </div>
              </div>
              <h3
                className="text-base sm:text-lg font-bold pt-2"
                style={{ color: brand.accentColor }}
              >
                FICHE D’ADHÉSION OFFICIELLE — {brand.branchName.toUpperCase()}
              </h3>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3 shrink-0">
              <div className="text-left sm:text-right text-xs text-zinc-700 space-y-0.5">
                <p>
                  <span className="text-zinc-500">N° Dossier :</span>{' '}
                  <strong className="font-mono-tabular text-zinc-950">{data.reference}</strong>
                </p>
                <p>
                  <span className="text-zinc-500">Date :</span>{' '}
                  <span className="font-mono-tabular">{data.createdAtLabel}</span>
                </p>
              </div>

              {data.photoDataUrl ? (
                <img
                  src={data.photoDataUrl}
                  alt={`Photo d'identité de ${data.fullName}`}
                  referrerPolicy="no-referrer"
                  className="w-24 h-28 object-cover rounded border border-zinc-400"
                />
              ) : (
                <div className="w-24 h-28 rounded border border-dashed border-zinc-400 flex items-center justify-center text-center text-[11px] text-zinc-500 p-2">
                  Photo d’identité
                </div>
              )}
            </div>
          </div>

          {/* Données complètes saisies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 border-b border-zinc-200 pb-1.5 mb-4">
              1. Identité & Coordonnées du Membre
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Nom complet</dt>
                <dd className="font-semibold text-zinc-950 mt-0.5">{data.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Sexe / Genre</dt>
                <dd className="font-semibold text-zinc-950 mt-0.5">{data.gender}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Date de naissance</dt>
                <dd className="font-mono-tabular text-zinc-900 mt-0.5">
                  {formatFrenchDate(data.birthDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Catégorie d’adhésion</dt>
                <dd className="font-bold text-zinc-950 mt-0.5">{data.category}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-zinc-500">Lieu de naissance</dt>
                <dd className="text-zinc-900 mt-0.5">{data.birthPlace}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-zinc-500">Adresse complète à Kinshasa</dt>
                <dd className="text-zinc-900 mt-0.5">{data.address}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Téléphone international</dt>
                <dd className="font-mono-tabular font-semibold text-zinc-950 mt-0.5">
                  {data.phone}
                </dd>
              </div>
              {data.extraRows?.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs text-zinc-500">{row.label}</dt>
                  <dd className="text-zinc-900 mt-0.5">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {data.paymentTicket && (
            <div className="border-t border-zinc-200 pt-5">
              <PaymentProofTicketCard
                ticket={data.paymentTicket}
                candidateNameOverride={data.fullName}
                variant="light"
              />
            </div>
          )}

          {/* Zone des 2 lignes vierges de signature manuscrite */}
          <div className="border-t border-zinc-200 pt-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              2. Signatures Manuscrites Officielles
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-zinc-900">
                  Signature du / de la secrétaire
                </p>
                <p className="text-xs text-zinc-500">Nom, cachet et signature manuscrite :</p>
                <div className="pt-12 border-b-2 border-zinc-800" />
                <p className="text-[11px] font-mono-tabular text-zinc-500 pt-1">
                  ________________________________________
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-zinc-900">
                  Signature du candidat / membre d’adhésion
                </p>
                <p className="text-xs text-zinc-500">{data.fullName} — Lu et approuvé :</p>
                <div className="pt-12 border-b-2 border-zinc-800" />
                <p className="text-[11px] font-mono-tabular text-zinc-500 pt-1">
                  ________________________________________
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span>
              {brand.branchName.toUpperCase()} · Bandal Synkin, Croisement Av. Kisangani & Sundi
              N°1, Kinshasa
            </span>
            <span>Document officiel généré pour impression A4</span>
          </div>
        </article>
      )}
    </div>
  );
}
