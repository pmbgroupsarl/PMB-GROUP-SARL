import { useState } from 'react';
import {
  Clock,
  Download,
  Eye,
  EyeOff,
  MessageCircle,
  Printer,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { PMB_BRANCHES, PMB_COMPANY, PMB_FONDATION_CHARTER } from '../../data/pmbData';
import { MembershipPaymentTicket } from '../../lib/membershipPayment';

interface PaymentProofTicketCardProps {
  ticket: MembershipPaymentTicket;
  candidateNameOverride?: string;
  variant?: 'dark' | 'light';
  onResetPayment?: () => void;
}

function buildStandaloneTicketHtml(
  ticket: MembershipPaymentTicket,
  memberName: string,
  fondationLogoUrl: string
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Reçu Officiel ${ticket.ticketNumber} — PMB FONDATION</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: "Segoe UI", Arial, sans-serif; color: #111827; padding: 24px; background: #f8fafc; }
    .ticket { max-width: 680px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; padding: 24px; border-radius: 10px; }
    .top { border-bottom: 2px solid #0284c7; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { width: 52px; height: 52px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px; background: #fff; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; font-size: 13px; }
    .label { font-size: 11px; color: #64748b; }
    .val { font-weight: 600; margin-top: 2px; }
    .status { margin-top: 18px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; font-size: 12px; font-weight: 600; border-radius: 6px; }
    .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="top">
      <div class="brand">
        <img src="${fondationLogoUrl}" alt="Logo PMB FONDATION" />
        <div>
          <strong style="font-size:15px;">PMB FONDATION</strong><br/>
          <span style="font-size:12px;color:#0284c7;font-weight:600;">Ticket / Reçu Officiel de Paiement</span><br/>
          <span style="font-size:11px;color:#64748b;">« ${PMB_FONDATION_CHARTER.motto} »</span>
        </div>
      </div>
      <div style="text-align:right;font-size:12px;">
        <strong>${ticket.ticketNumber}</strong><br/>
        <span>${ticket.issuedAtLabel}</span>
      </div>
    </div>
    <div class="grid">
      <div><div class="label">Membre / Contributeur</div><div class="val">${memberName}</div></div>
      <div><div class="label">Catégorie / Objet</div><div class="val">${ticket.category}</div></div>
      <div><div class="label">Montant réglé</div><div class="val">${ticket.amountUsd.toFixed(2)} $ USD</div></div>
      <div><div class="label">Référence transaction</div><div class="val">${ticket.transactionRef}</div></div>
      <div style="grid-column:1 / -1;"><div class="label">Canal utilisé</div><div class="val">${ticket.channelUsedLabel}</div></div>
    </div>
    <div class="status">Statut : ${ticket.status}</div>
    <div class="footer">
      Siège local : ${PMB_COMPANY.fullHeadquartersAddress}
    </div>
  </div>
</body>
</html>`;
}

function downloadStandaloneTicketHtml(
  ticket: MembershipPaymentTicket,
  memberName: string,
  fondationLogoUrl: string
) {
  const html = buildStandaloneTicketHtml(ticket, memberName, fondationLogoUrl);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recu-PMB-FONDATION-${ticket.ticketNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function printStandaloneTicket(
  ticket: MembershipPaymentTicket,
  memberName: string,
  fondationLogoUrl: string
) {
  const html = buildStandaloneTicketHtml(ticket, memberName, fondationLogoUrl);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1200);
    }, 180);
  }
}

export function PaymentProofTicketCard({
  ticket,
  candidateNameOverride,
  variant = 'dark',
  onResetPayment,
}: PaymentProofTicketCardProps) {
  const [showDetailedPreview, setShowDetailedPreview] = useState(true);
  const isLight = variant === 'light';
  const displayName = (candidateNameOverride || '').trim() || ticket.candidateName;
  const fondationLogo =
    PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')?.logoImage ||
    '/assets/aistudio/PMB_FONDATION_9f111416.png';

  const absoluteLogoUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${fondationLogo}` : fondationLogo;

  const whatsappText = [
    `REÇU OFFICIEL — PMB FONDATION`,
    `N° Ticket : ${ticket.ticketNumber}`,
    `Date & Heure : ${ticket.issuedAtLabel}`,
    `Membre / Donateur : ${displayName}`,
    `Catégorie : ${ticket.category}`,
    `Montant : ${ticket.amountUsd.toFixed(2)} $ USD`,
    `Canal utilisé : ${ticket.channelUsedLabel}`,
    `Référence transaction : ${ticket.transactionRef}`,
    `Statut : ${ticket.status}`,
  ].join('\n');

  return (
    <div
      className={
        isLight
          ? 'rounded-lg border border-zinc-300 bg-zinc-50 p-4 sm:p-5 space-y-3 text-zinc-900'
          : 'rounded-xl border border-emerald-500/40 bg-[#121212] p-5 space-y-4 text-zinc-100'
      }
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
          isLight ? 'border-zinc-200' : 'border-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          {!isLight && (
            <img
              src={fondationLogo}
              alt="Logo PMB FONDATION"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-md object-contain bg-white p-1 border border-white/20 shrink-0"
            />
          )}
          <Receipt
            className={`w-4 h-4 shrink-0 ${isLight ? 'text-zinc-800' : 'text-[#F59E0B]'}`}
            aria-hidden="true"
          />
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Ticket / Reçu Officiel · PMB Fondation
            </p>
            <p className="text-sm sm:text-base font-bold font-mono-tabular">
              {ticket.ticketNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono-tabular text-zinc-400">{ticket.issuedAtLabel}</span>
          {!isLight && (
            <button
              type="button"
              onClick={() => setShowDetailedPreview((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-white/15 bg-[#1c1c1e] hover:bg-zinc-800 text-[11px] font-medium text-zinc-200 cursor-pointer whitespace-nowrap"
            >
              {showDetailedPreview ? (
                <>
                  <EyeOff className="w-3 h-3" aria-hidden="true" />
                  <span>Masquer</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" aria-hidden="true" />
                  <span>Prévisualiser</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showDetailedPreview && (
        <>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div>
              <dt className={isLight ? 'text-xs text-zinc-500' : 'text-xs text-zinc-400'}>
                Nom du membre / donateur
              </dt>
              <dd className="font-semibold mt-0.5">{displayName}</dd>
            </div>

            <div>
              <dt className={isLight ? 'text-xs text-zinc-500' : 'text-xs text-zinc-400'}>
                Catégorie / Objet
              </dt>
              <dd className="font-semibold mt-0.5">{ticket.category}</dd>
            </div>

            <div>
              <dt className={isLight ? 'text-xs text-zinc-500' : 'text-xs text-zinc-400'}>
                Montant (USD)
              </dt>
              <dd
                className={`font-bold font-mono-tabular mt-0.5 ${
                  isLight ? 'text-zinc-950' : 'text-[#F59E0B]'
                }`}
              >
                {ticket.amountUsd.toFixed(2)} $ USD
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className={isLight ? 'text-xs text-zinc-500' : 'text-xs text-zinc-400'}>
                Canal utilisé
              </dt>
              <dd className="font-medium mt-0.5 break-words">{ticket.channelUsedLabel}</dd>
            </div>

            <div>
              <dt className={isLight ? 'text-xs text-zinc-500' : 'text-xs text-zinc-400'}>
                Référence transaction
              </dt>
              <dd className="font-mono-tabular mt-0.5">{ticket.transactionRef}</dd>
            </div>

            {ticket.proofFileName && (
              <div className="sm:col-span-3">
                <dt className={isLight ? 'text-xs text-zinc-500' : 'text-xs text-zinc-400'}>
                  Justificatif joint
                </dt>
                <dd className="mt-0.5 truncate">{ticket.proofFileName}</dd>
              </div>
            )}
          </dl>

          <div
            className={`rounded-lg border px-3.5 py-2.5 flex items-start gap-2 text-xs font-medium ${
              isLight
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Statut : {ticket.status}</span>
          </div>
        </>
      )}

      {!isLight && (
        <div className="no-print pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => printStandaloneTicket(ticket, displayName, absoluteLogoUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] text-xs font-bold text-[#121212] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Imprimer le reçu</span>
            </button>

            <button
              type="button"
              onClick={() => downloadStandaloneTicketHtml(ticket, displayName, absoluteLogoUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Télécharger le reçu</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-xs font-semibold text-white transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Partager sur WhatsApp</span>
            </a>
          </div>

          {onResetPayment && (
            <button
              type="button"
              onClick={onResetPayment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Nouveau paiement / Modifier</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
