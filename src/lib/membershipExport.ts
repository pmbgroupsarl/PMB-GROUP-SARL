import { PMB_BRANCHES, PMB_COMPANY } from '../data/pmbData';
import { MembershipPaymentTicket } from './membershipPayment';

export interface MembershipExportPayload {
  reference: string;
  createdAtLabel: string;
  title: string;
  branchId?: string;
  branchName?: string;
  branchLogo?: string;
  accentColor?: string;
  fullName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  phone: string;
  category: string;
  photoDataUrl?: string | null;
  paymentTicket?: MembershipPaymentTicket | null;
  extraRows?: Array<{ label: string; value: string }>;
  commitmentText?: string;
}

export function resolveBranchBrand(data: {
  branchId?: string;
  branchName?: string;
  branchLogo?: string;
  accentColor?: string;
}) {
  const found =
    PMB_BRANCHES.find((b) => b.id === data.branchId) ||
    PMB_BRANCHES.find(
      (b) => b.name.toLowerCase() === (data.branchName || '').trim().toLowerCase()
    ) ||
    PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;

  return {
    branchId: found.id,
    branchName: data.branchName || found.name,
    branchLogo: data.branchLogo || found.logoImage,
    accentColor: data.accentColor || (found.id === 'pmb-fondation' ? '#0284c7' : found.accentColor),
  };
}

export function formatFrenchDate(isoOrDate: string): string {
  const trimmed = (isoOrDate || '').trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return trimmed;
}

export function checkNameGenderCoherence(fullName: string, gender: string): string | null {
  const normalized = fullName.trim().toLowerCase();
  if (!normalized || !gender) return null;

  const isFemaleGender = gender === 'Femme' || gender === 'Féminin';
  const isMaleGender = gender === 'Homme' || gender === 'Masculin';

  const femaleHints = [
    'prisca',
    'marie',
    'claire',
    'clarisse',
    'sarah',
    'esther',
    'grace',
    'ruth',
    'nathalie',
    'nadine',
    'aline',
    'carine',
    'christelle',
    'chancelle',
    'rebecca',
    'miriam',
    'mimy',
    'dorcas',
    'deborah',
    'bibiche',
  ];
  const maleHints = [
    'patrick',
    'jean',
    'pierre',
    'paul',
    'joseph',
    'samuel',
    'emmanuel',
    'daniel',
    'david',
    'jonathan',
    'christian',
    'fabrice',
    'cedric',
    'serge',
    'alain',
    'eric',
    'franck',
  ];

  const tokens = normalized.split(/[\s'-]+/).filter(Boolean);
  const looksFemale = tokens.some((t) => femaleHints.includes(t));
  const looksMale = tokens.some((t) => maleHints.includes(t));

  if (looksFemale && !looksMale && isMaleGender) {
    return 'Vérification de cohérence : le prénom saisi semble féminin alors que le genre sélectionné est masculin. Veuillez vérifier avant validation.';
  }
  if (looksMale && !looksFemale && isFemaleGender) {
    return 'Vérification de cohérence : le prénom saisi semble masculin alors que le genre sélectionné est féminin. Veuillez vérifier avant validation.';
  }
  return null;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildMembershipTextSummary(data: MembershipExportPayload): string {
  const brand = resolveBranchBrand(data);
  const extraLines = (data.extraRows || [])
    .map((row) => `${row.label} : ${row.value}`)
    .join('\n');

  return [
    `FICHE D'ADHÉSION OFFICIELLE — ${brand.branchName.toUpperCase()}`,
    `Référence : ${data.reference}`,
    `Date d'enregistrement : ${data.createdAtLabel}`,
    '',
    `Nom complet : ${data.fullName}`,
    `Sexe / Genre : ${data.gender}`,
    `Date de naissance : ${formatFrenchDate(data.birthDate)}`,
    `Lieu de naissance : ${data.birthPlace}`,
    `Adresse complète : ${data.address}`,
    `Téléphone : ${data.phone}`,
    `Catégorie d'adhésion : ${data.category}`,
    data.paymentTicket
      ? `\nTICKET / PREUVE DE PAIEMENT :\nN° Ticket : ${data.paymentTicket.ticketNumber}\nDate/Heure : ${data.paymentTicket.issuedAtLabel}\nCatégorie : ${data.paymentTicket.category}\nCanal utilisé : ${data.paymentTicket.channelUsedLabel}\nMontant payé : ${data.paymentTicket.amountUsd.toFixed(2)} $ USD\nRéférence : ${data.paymentTicket.transactionRef}\nStatut : ${data.paymentTicket.status}`
      : '',
    extraLines ? `\n${extraLines}` : '',
    '',
    'SIGNATURES MANUSCRITES :',
    '1. Signature du / de la secrétaire : ________________________',
    "2. Signature du candidat / membre d'adhésion : ________________________",
    '',
    `${brand.branchName.toUpperCase()} — RCCM/24-A-04653 · Id. Nat/01-G4701-N52717A`,
    PMB_COMPANY.fullHeadquartersAddress,
  ]
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n');
}

export function buildWhatsAppShareUrl(data: MembershipExportPayload): string {
  const text = buildMembershipTextSummary(data);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function buildMailtoUrl(data: MembershipExportPayload): string {
  const brand = resolveBranchBrand(data);
  const subject = `[${data.reference}] Fiche d'Adhésion ${brand.branchName} — ${data.fullName}`;
  const body = buildMembershipTextSummary(data);
  return `mailto:${PMB_COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildPrintableA4Html(data: MembershipExportPayload): string {
  const brand = resolveBranchBrand(data);
  const formattedBirthDate = formatFrenchDate(data.birthDate);
  const branchUpper = brand.branchName.toUpperCase();
  const originUrl =
    typeof window !== 'undefined' && window.location ? window.location.origin : '';
  const logoSrc = brand.branchLogo.startsWith('http')
    ? brand.branchLogo
    : `${originUrl}${brand.branchLogo}`;

  const extraHtml = (data.extraRows || [])
    .map(
      (row) => `
      <div class="field">
        <div class="label">${escapeHtml(row.label)}</div>
        <div class="value">${escapeHtml(row.value)}</div>
      </div>`
    )
    .join('');

  const photoBlock = data.photoDataUrl
    ? `<img src="${data.photoDataUrl}" alt="Photo du membre" class="photo-img" />`
    : `<div class="photo-placeholder">Photo<br/>d'identité</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fiche d'Adhésion ${escapeHtml(data.reference)} — ${escapeHtml(branchUpper)}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;
      color: #111827;
      background: #f3f4f6;
      margin: 0;
      padding: 20px;
    }
    .sheet {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d1d5db;
      padding: 24px 28px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      border-bottom: 2px solid ${escapeHtml(brand.accentColor)};
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand-block {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .branch-logo {
      width: 86px;
      height: 86px;
      object-fit: contain;
      border-radius: 6px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      padding: 4px;
      flex-shrink: 0;
    }
    .company { font-size: 19px; font-weight: 800; letter-spacing: 0.02em; color: #0f172a; }
    .legal { font-size: 11px; color: #4b5563; margin-top: 3px; line-height: 1.4; }
    .doc-title { font-size: 15px; font-weight: 700; margin-top: 8px; color: ${escapeHtml(brand.accentColor)}; }
    .ref-box { text-align: right; font-size: 12px; color: #374151; flex-shrink: 0; }
    .photo-img {
      width: 92px; height: 112px; object-fit: cover;
      border: 1px solid #9ca3af; border-radius: 4px; margin-top: 8px; margin-left: auto;
    }
    .photo-placeholder {
      width: 92px; height: 112px; border: 1px dashed #9ca3af;
      display: flex; align-items: center; justify-content: center;
      text-align: center; font-size: 11px; color: #6b7280; margin-top: 8px; margin-left: auto;
    }
    .section-title {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #0f172a; border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px; margin: 16px 0 10px;
    }
    .grid {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px;
    }
    .field .label { font-size: 11px; color: #6b7280; }
    .field .value { font-size: 13px; font-weight: 600; color: #111827; margin-top: 2px; }
    .full { grid-column: 1 / -1; }
    .ticket-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 12px 14px;
      border-radius: 6px;
    }
    .commitment { font-size: 12px; color: #374151; line-height: 1.5; margin-top: 14px; }
    .signatures {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 32px; margin-top: 24px; padding-top: 10px;
    }
    .sig-box { font-size: 12px; color: #111827; }
    .sig-title { font-weight: 700; margin-bottom: 4px; }
    .sig-subtitle { font-size: 11px; color: #6b7280; }
    .sig-line {
      margin-top: 46px;
      border-bottom: 1.5px solid #111827;
      width: 100%;
    }
    .footer {
      margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb;
      font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; gap: 12px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="brand-block">
        <img src="${escapeHtml(logoSrc)}" alt="Logo ${escapeHtml(brand.branchName)}" class="branch-logo" />
        <div>
          <div class="company">${escapeHtml(branchUpper)}</div>
          <div class="legal">RCCM/24-A-04653 · Id. Nat/01-G4701-N52717A</div>
          <div class="legal">
            Siège local : Bandal Synkin, Arrêt Station Tshibangu (Réf. Immeuble Vodacom),<br/>
            Croisement des avenues Kisangani et Sundi N°1 — Kinshasa, RDC
          </div>
          <div class="doc-title">FICHE D’ADHÉSION OFFICIELLE — ${escapeHtml(branchUpper)}</div>
        </div>
      </div>
      <div class="ref-box">
        <div><strong>N° Dossier :</strong> ${escapeHtml(data.reference)}</div>
        <div><strong>Date :</strong> ${escapeHtml(data.createdAtLabel)}</div>
        ${photoBlock}
      </div>
    </div>

    <div class="section-title">Informations du Membre d'Adhésion</div>
    <div class="grid">
      <div class="field">
        <div class="label">Nom complet</div>
        <div class="value">${escapeHtml(data.fullName)}</div>
      </div>
      <div class="field">
        <div class="label">Sexe / Genre</div>
        <div class="value">${escapeHtml(data.gender)}</div>
      </div>
      <div class="field">
        <div class="label">Date de naissance</div>
        <div class="value">${escapeHtml(formattedBirthDate)}</div>
      </div>
      <div class="field">
        <div class="label">Catégorie d'adhésion</div>
        <div class="value">${escapeHtml(data.category)}</div>
      </div>
      <div class="field full">
        <div class="label">Lieu de naissance</div>
        <div class="value">${escapeHtml(data.birthPlace)}</div>
      </div>
      <div class="field full">
        <div class="label">Adresse actuelle</div>
        <div class="value">${escapeHtml(data.address)}</div>
      </div>
      <div class="field">
        <div class="label">Téléphone international</div>
        <div class="value">${escapeHtml(data.phone)}</div>
      </div>
      ${extraHtml}
    </div>

    ${
      data.paymentTicket
        ? `
    <div class="section-title">Ticket / Preuve de Paiement d'Adhésion</div>
    <div class="grid ticket-box">
      <div class="field">
        <div class="label">N° Ticket</div>
        <div class="value">${escapeHtml(data.paymentTicket.ticketNumber)}</div>
      </div>
      <div class="field">
        <div class="label">Statut</div>
        <div class="value">${escapeHtml(data.paymentTicket.status)}</div>
      </div>
      <div class="field">
        <div class="label">Montant payé</div>
        <div class="value">${escapeHtml(data.paymentTicket.amountUsd.toFixed(2))} $ USD</div>
      </div>
      <div class="field">
        <div class="label">Catégorie</div>
        <div class="value">${escapeHtml(data.paymentTicket.category)}</div>
      </div>
      <div class="field full">
        <div class="label">Canal utilisé</div>
        <div class="value">${escapeHtml(data.paymentTicket.channelUsedLabel)}</div>
      </div>
      <div class="field full">
        <div class="label">Date / Heure &amp; Référence</div>
        <div class="value">${escapeHtml(data.paymentTicket.issuedAtLabel)} · ${escapeHtml(data.paymentTicket.transactionRef)}</div>
      </div>
    </div>`
        : ''
    }

    ${
      data.commitmentText
        ? `<div class="commitment">${escapeHtml(data.commitmentText)}</div>`
        : `<div class="commitment">Je soussigné(e), certifie que les renseignements fournis dans cette fiche sont exacts. Je sollicite mon adhésion à <strong>${escapeHtml(branchUpper)}</strong> et m’engage à respecter ses statuts, son règlement d’ordre intérieur et ses valeurs.</div>`
    }

    <div class="section-title">Signatures Manuscrites Officielles</div>
    <div class="signatures">
      <div class="sig-box">
        <div class="sig-title">Signature du / de la secrétaire</div>
        <div class="sig-subtitle">Nom et signature manuscrite :</div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <div class="sig-title">Signature du candidat / membre d'adhésion</div>
        <div class="sig-subtitle">${escapeHtml(data.fullName)} :</div>
        <div class="sig-line"></div>
      </div>
    </div>

    <div class="footer">
      <span>${escapeHtml(branchUpper)} · Bandal Synkin, Croisement Av. Kisangani &amp; Sundi N°1, Kinshasa</span>
      <span>Document officiel généré pour impression A4</span>
    </div>
  </div>
</body>
</html>`;
}

function triggerFileDownload(content: string, mimeType: string, fileName: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadHtmlSheet(data: MembershipExportPayload): void {
  const brand = resolveBranchBrand(data);
  const slug = brand.branchName.toLowerCase().replace(/\s+/g, '-');
  const html = buildPrintableA4Html(data);
  triggerFileDownload(
    html,
    'text/html;charset=utf-8',
    `fiche-adhesion-${slug}-${data.reference}.html`
  );
}

export function downloadJsonArchive(data: MembershipExportPayload): void {
  const brand = resolveBranchBrand(data);
  const archive = {
    branch: brand.branchName,
    rccm: PMB_COMPANY.rccm,
    idNat: PMB_COMPANY.idNat,
    headquarters: PMB_COMPANY.fullHeadquartersAddress,
    exportedAt: new Date().toISOString(),
    signatures: {
      secretary: '________________________',
      applicantMember: '________________________',
    },
    ...data,
    photoDataUrl: undefined,
  };
  triggerFileDownload(
    JSON.stringify(archive, null, 2),
    'application/json;charset=utf-8',
    `dossier-adhesion-${data.reference}.json`
  );
}

export async function saveOnPhoneOrShare(
  data: MembershipExportPayload
): Promise<'shared' | 'downloaded'> {
  const brand = resolveBranchBrand(data);
  const slug = brand.branchName.toLowerCase().replace(/\s+/g, '-');
  const html = buildPrintableA4Html(data);
  const fileName = `fiche-adhesion-${slug}-${data.reference}.html`;
  const summary = buildMembershipTextSummary(data);

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const htmlFile = new File([html], fileName, { type: 'text/html' });
      if (
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [htmlFile] })
      ) {
        await navigator.share({
          title: `Fiche d'Adhésion ${data.reference} — ${brand.branchName}`,
          text: summary,
          files: [htmlFile],
        });
        return 'shared';
      }

      await navigator.share({
        title: `Fiche d'Adhésion ${data.reference} — ${brand.branchName}`,
        text: summary,
      });
      return 'shared';
    } catch {
      // Fallback vers téléchargement direct sur l'appareil
    }
  }

  triggerFileDownload(html, 'text/html;charset=utf-8', fileName);
  return 'downloaded';
}

export function triggerCleanPrint(scope: 'registration' | 'fondation' | 'portal'): void {
  const className =
    scope === 'registration'
      ? 'pmb-print-registration'
      : scope === 'fondation'
        ? 'pmb-print-fondation'
        : 'pmb-print-portal';
  document.body.classList.add(className);

  const cleanup = () => {
    document.body.classList.remove(className);
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  setTimeout(cleanup, 4000);
  window.print();
}
