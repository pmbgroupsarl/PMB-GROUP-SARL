import { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  HeartHandshake,
  Laptop,
  Mail,
  MessageCircle,
  Printer,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  PMB_BRANCHES,
  PMB_COMPANY,
  PMB_FONDATION_CHARTER,
  countryDialCodes,
  geographyData,
  kinshasaCommunes,
} from '../data/pmbData';
import {
  MembershipExportPayload,
  buildMailtoUrl,
  buildWhatsAppShareUrl,
  checkNameGenderCoherence,
  downloadHtmlSheet,
  downloadJsonArchive,
  formatFrenchDate,
  saveOnPhoneOrShare,
  triggerCleanPrint,
} from '../lib/membershipExport';
import { MembershipPaymentTicket } from '../lib/membershipPayment';
import { usePmbStore } from '../lib/pmbStore';
import { HybridSelectInput } from './HybridSelectInput';
import { MemberAccountGate } from './portal/MemberAccountGate';
import { EffectiveMemberPaymentBox } from './registration/EffectiveMemberPaymentBox';
import { MembreEffectifInfoCard } from './registration/MembreEffectifInfoCard';
import { PaymentProofTicketCard } from './registration/PaymentProofTicketCard';

interface FondationMembershipSectionProps {
  onOpenPortalTab?: (tab: 'member' | 'visitor' | 'admin') => void;
}

interface MembershipRecord {
  dossierId: string;
  nom: string;
  postNom: string;
  prenom: string;
  birthDate: string;
  birthPlace: string;
  sexe: string;
  etatCivil: string;
  nationalite: string;
  profession: string;
  adresseComplete: string;
  telephone: string;
  email: string;
  urgenceContact: string;
  categorie: string;
  domaine: string;
  motif: string;
  faitA: string;
  signedDate: string;
  paymentTicket: MembershipPaymentTicket | null;
}

export function FondationMembershipSection({
  onOpenPortalTab,
}: FondationMembershipSectionProps) {
  const { currentMember, addMembershipRecord, cms } = usePmbStore();
  const fondationBranch = PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;
  const [activeCategoryId, setActiveCategoryId] = useState(
    PMB_FONDATION_CHARTER.categories[0].id
  );

  // 1. Informations personnelles (Fiche mise à jour)
  const [nom, setNom] = useState('');
  const [postNom, setPostNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthContinent, setBirthContinent] = useState('Afrique');
  const [birthCountry, setBirthCountry] = useState('République Démocratique du Congo');
  const [birthCity, setBirthCity] = useState('Kinshasa');
  const [birthCommune, setBirthCommune] = useState('');
  const [birthQuartier, setBirthQuartier] = useState('');
  const [sexe, setSexe] = useState('Féminin');
  const [etatCivil, setEtatCivil] = useState('Célibataire');
  const [nationalite, setNationalite] = useState('Congolaise (RDC)');
  const [profession, setProfession] = useState('');
  const [resCommune, setResCommune] = useState('');
  const [resQuartier, setResQuartier] = useState('');
  const [resAvenue, setResAvenue] = useState('');
  const [resNumber, setResNumber] = useState('');
  const [phoneIso, setPhoneIso] = useState('CD');
  const [phoneCode, setPhoneCode] = useState('+243');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [urgenceContact, setUrgenceContact] = useState('');

  // 2. Informations relatives à l'adhésion
  const [categorie, setCategorie] = useState(PMB_FONDATION_CHARTER.formCategories[0]);
  const [domaine, setDomaine] = useState(PMB_FONDATION_CHARTER.involvementDomains[0]);
  const [motif, setMotif] = useState('');

  // 3. Engagement
  const [faitA, setFaitA] = useState('Kinshasa');
  const [acceptedCharter, setAcceptedCharter] = useState(false);

  const continents = Object.keys(geographyData);
  const countries = useMemo(() => {
    return geographyData[birthContinent]
      ? Object.keys(geographyData[birthContinent])
      : Object.values(geographyData).flatMap((c) => Object.keys(c));
  }, [birthContinent]);
  const cities = useMemo(() => {
    const continentObj = geographyData[birthContinent];
    if (continentObj && continentObj[birthCountry]) {
      return continentObj[birthCountry];
    }
    return ['Kinshasa', 'Lubumbashi', 'Goma', 'Cape Town', 'Paris', 'Bruxelles'];
  }, [birthContinent, birthCountry]);
  const communesList = Object.keys(kinshasaCommunes);
  const birthQuartiersList = useMemo(
    () => kinshasaCommunes[birthCommune] || [],
    [birthCommune]
  );
  const resQuartiersList = useMemo(
    () => kinshasaCommunes[resCommune] || [],
    [resCommune]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fondationPaymentTicket, setFondationPaymentTicket] =
    useState<MembershipPaymentTicket | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<MembershipRecord | null>(null);
  const [showFondationPreview, setShowFondationPreview] = useState(true);
  const [fondationActionNotice, setFondationActionNotice] = useState<string | null>(null);

  const nameGenderWarning = useMemo(
    () => checkNameGenderCoherence(`${nom} ${postNom} ${prenom}`, sexe),
    [nom, postNom, prenom, sexe]
  );

  const fondationExportPayload = useMemo<MembershipExportPayload | null>(() => {
    if (!submittedRecord) return null;
    return {
      reference: submittedRecord.dossierId,
      createdAtLabel: submittedRecord.signedDate,
      title: PMB_FONDATION_CHARTER.documentTitle,
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      branchLogo: fondationBranch.logoImage,
      accentColor: '#0284c7',
      fullName: `${submittedRecord.nom} ${submittedRecord.postNom !== '—' ? submittedRecord.postNom + ' ' : ''}${submittedRecord.prenom}`.trim(),
      gender: submittedRecord.sexe,
      birthDate: submittedRecord.birthDate,
      birthPlace: submittedRecord.birthPlace,
      address: submittedRecord.adresseComplete,
      phone: submittedRecord.telephone,
      category: submittedRecord.categorie,
      paymentTicket: submittedRecord.paymentTicket,
      commitmentText: `${PMB_FONDATION_CHARTER.commitmentStatement} Fait à ${submittedRecord.faitA}, le ${submittedRecord.signedDate}.`,
      extraRows: [
        { label: 'État civil', value: submittedRecord.etatCivil },
        { label: 'Nationalité', value: submittedRecord.nationalite },
        { label: 'Profession', value: submittedRecord.profession },
        { label: 'E-mail', value: submittedRecord.email },
        { label: "Contact d'urgence", value: submittedRecord.urgenceContact },
        { label: 'Domaine / Commission', value: submittedRecord.domaine },
        { label: "Motif d'adhésion", value: submittedRecord.motif },
      ],
    };
  }, [fondationBranch.logoImage, submittedRecord]);

  const activeCategory =
    PMB_FONDATION_CHARTER.categories.find((c) => c.id === activeCategoryId) ??
    PMB_FONDATION_CHARTER.categories[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (nom.trim().length < 2) {
      nextErrors.nom = 'Veuillez saisir votre nom.';
    }
    if (prenom.trim().length < 2) {
      nextErrors.prenom = 'Veuillez saisir votre prénom.';
    }
    if (!birthDate) {
      nextErrors.birthDate = 'Veuillez sélectionner votre date de naissance.';
    }
    if (!birthCountry.trim() || !birthCity.trim()) {
      nextErrors.birthPlace = 'Précisez au minimum le pays et la ville de naissance.';
    }
    if (resCommune.trim().length < 2 || resAvenue.trim().length < 2 || !resNumber.trim()) {
      nextErrors.adresse = 'Veuillez renseigner la commune, l’avenue/rue et le numéro.';
    }
    if (!/^\d{9}$/.test(telephone.replace(/\D/g, ''))) {
      nextErrors.telephone =
        `Le numéro après l'indicatif ${phoneCode} doit contenir exactement 9 chiffres.`;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Format d’adresse e-mail invalide.';
    }
    if (urgenceContact.trim().length < 5) {
      nextErrors.urgenceContact = 'Indiquez un contact en cas d’urgence (nom et téléphone).';
    }
    if (motif.trim().length < 10) {
      nextErrors.motif = 'Précisez votre motif d’adhésion (minimum 10 caractères).';
    }
    if (!acceptedCharter) {
      nextErrors.acceptedCharter =
        'Vous devez certifier l’exactitude des renseignements et accepter les statuts.';
    }
    if (categorie === 'Membre effectif' && !currentMember) {
      nextErrors.memberAccount =
        'Un compte Membre connecté est obligatoire pour la catégorie « Membre effectif ». Connectez-vous ou créez un compte ci-dessous.';
    }
    if (categorie === 'Membre effectif' && !fondationPaymentTicket) {
      nextErrors.paymentTicket =
        'Paiement obligatoire requis pour « Membre effectif ». Validez le paiement et générez votre ticket avant de soumettre.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const now = new Date();
    const dossierId = `PMB-FOND-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(now.getDate()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

    const birthPlaceParts = [
      birthQuartier.trim() ? `Q. ${birthQuartier.trim()}` : '',
      birthCommune.trim() ? `C. ${birthCommune.trim()}` : '',
      birthCity.trim(),
      birthCountry.trim(),
      birthContinent.trim(),
    ].filter(Boolean);

    const record: MembershipRecord = {
      dossierId,
      nom: nom.trim(),
      postNom: postNom.trim() || '—',
      prenom: prenom.trim(),
      birthDate,
      birthPlace: birthPlaceParts.join(', '),
      sexe,
      etatCivil,
      nationalite: nationalite.trim() || 'Congolaise (RDC)',
      profession: profession.trim() || 'Non renseignée',
      adresseComplete: [
        resCommune.trim() ? `C. ${resCommune.trim()}` : '',
        resQuartier.trim() ? `Q. ${resQuartier.trim()}` : '',
        resAvenue.trim(),
        resNumber.trim(),
      ]
        .filter(Boolean)
        .join(', '),
      telephone: `${phoneCode} ${telephone.trim()}`,
      email: email.trim() || currentMember?.email || 'Non renseigné',
      urgenceContact: urgenceContact.trim(),
      categorie,
      domaine,
      motif: motif.trim(),
      faitA: faitA.trim() || 'Kinshasa',
      signedDate: now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      paymentTicket: fondationPaymentTicket
        ? {
            ...fondationPaymentTicket,
            candidateName: `${nom.trim()} ${postNom.trim()} ${prenom.trim()}`
              .replace(/\s+/g, ' ')
              .trim(),
            category: categorie,
          }
        : null,
    };

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);

    addMembershipRecord({
      dossierId: record.dossierId,
      kind: 'member',
      accountEmail: currentMember?.email || email.trim() || undefined,
      branchId: 'pmb-fondation',
      branchName: 'PMB Fondation',
      fullName: `${record.nom} ${record.postNom !== '—' ? record.postNom + ' ' : ''}${record.prenom}`.trim(),
      gender: record.sexe,
      birthDate: record.birthDate,
      birthPlace: record.birthPlace,
      address: record.adresseComplete,
      phone: record.telephone,
      email: record.email,
      category: record.categorie,
      subscriptionStatus: 'En attente de validation',
      expiresAtIso: expDate.toISOString(),
      expiresAtLabel: expDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      paymentTicket: record.paymentTicket,
      createdAtLabel: record.signedDate,
      commitmentText: `${PMB_FONDATION_CHARTER.commitmentStatement} Fait à ${record.faitA}, le ${record.signedDate}.`,
      extraRows: [
        { label: 'État civil', value: record.etatCivil },
        { label: 'Nationalité', value: record.nationalite },
        { label: 'Profession', value: record.profession },
        { label: 'E-mail', value: record.email },
        { label: "Contact d'urgence", value: record.urgenceContact },
        { label: 'Domaine / Commission', value: record.domaine },
        { label: "Motif d'adhésion", value: record.motif },
      ],
    });

    setSubmittedRecord(record);
  };

  return (
    <section
      id="fondation"
      className="py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[#F59E0B] mb-2">
              06. PMB Fondation · « {PMB_FONDATION_CHARTER.motto} »
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Conditions Générales & Fiche d’Adhésion Officielle
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Consultez les statuts de membres définis par PMB Fondation, remplissez la fiche A4
              officielle ou soutenez nos actions ponctuellement en tant que Visiteur.
            </p>
          </div>

          {onOpenPortalTab && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onOpenPortalTab('visitor')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#262626] hover:bg-zinc-700 border border-white/15 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <HeartHandshake className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                <span>Visiteur — Aider une seule fois</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenPortalTab('member')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Mon Espace Membre</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne gauche : Conditions Générales d'Adhésion & Téléchargements */}
          <div className="no-print lg:col-span-5 space-y-6">
            <div className="rounded-xl bg-[#1c1c1e] border border-white/10 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Catégories de Membres & Rôles
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Sélectionnez une catégorie pour consulter ses responsabilités et conditions.
                </p>

                {/* Sélecteur interactif des 5 catégories */}
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

                {/* Détail de la catégorie sélectionnée */}
                <div className="mt-4 rounded-xl bg-[#121212] border border-white/[0.08] p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                    <span className="font-semibold text-white text-sm">
                      {activeCategory.number}. {activeCategory.title}
                    </span>
                    <span>Cotisation : {activeCategory.cotisation}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {activeCategory.summary}
                  </p>

                  <div className="grid grid-cols-1 gap-3 pt-2 border-t border-white/[0.08] text-xs">
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
                      <p className="font-semibold text-zinc-200 mb-1">
                        Conditions d’adhésion :
                      </p>
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

              {/* 6. Tableau Récapitulatif */}
              <div className="border-t border-white/[0.08] pt-5">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Tableau récapitulatif des catégories
                </h4>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#262626] text-zinc-200">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Catégorie</th>
                        <th className="px-3 py-2 font-semibold">Contribution</th>
                        <th className="px-3 py-2 font-semibold">Cotisation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                      {PMB_FONDATION_CHARTER.categories.map((cat) => (
                        <tr key={cat.id} className="bg-[#121212]/60">
                          <td className="px-3 py-2 font-medium text-white">{cat.title}</td>
                          <td className="px-3 py-2">{cat.contributionPrincipal}</td>
                          <td className="px-3 py-2 text-zinc-400">{cat.cotisation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. Conditions générales applicables à tous les membres & 8. Disposition */}
              <div className="border-t border-white/[0.08] pt-5 space-y-3 text-xs text-zinc-300">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                    <span>Règles communes & Disposition importante</span>
                  </h4>
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

                <p className="text-zinc-400 leading-relaxed pt-2 border-t border-white/[0.06]">
                  {PMB_FONDATION_CHARTER.importantDisposition}
                </p>
              </div>

              {/* Projets actifs PMB Fondation (pilotés en direct depuis le CMS Admin) */}
              {cms.fondationProjects.length > 0 && (
                <div className="border-t border-white/[0.08] pt-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white">
                    Projets Sociaux Actifs ({cms.fondationProjects.length})
                  </h4>
                  <div className="space-y-2.5">
                    {cms.fondationProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-lg bg-[#121212] border border-white/10 p-3.5 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-white">{proj.title}</span>
                          <span className="font-mono-tabular text-[#F59E0B] shrink-0">
                            {proj.dateLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {proj.location} · {proj.status}
                        </p>
                        <p className="text-xs text-zinc-300 leading-snug">{proj.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liens de téléchargement vers les 2 nouveaux PDF officiels */}
              <div className="border-t border-white/[0.08] pt-5 flex flex-col gap-2.5">
                <a
                  href={PMB_FONDATION_CHARTER.fichePdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#121212] bg-[#F59E0B] hover:bg-[#d98a06] rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Télécharger la Fiche d’Adhésion mise à jour (PDF)</span>
                </a>
                <a
                  href={PMB_FONDATION_CHARTER.conditionsPdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#262626] hover:bg-[#323232] border border-white/10 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Télécharger les Conditions Générales (PDF)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Colonne droite : Formulaire Officiel d'Adhésion (mis à jour) & Certificat A4 */}
          <div className="lg:col-span-7">
            {submittedRecord ? (
              <div className="print-certificate rounded-xl bg-[#1c1c1e] border border-[#0284c7]/45 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={fondationBranch.logoImage}
                      alt="Logo officiel PMB FONDATION"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-white/20 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-[#38BDF8] mb-0.5">
                        <CheckCircle2 className="w-4 h-4 no-print" aria-hidden="true" />
                        <span>PMB FONDATION — FICHE D’ADHÉSION OFFICIELLE</span>
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Dossier · {submittedRecord.dossierId}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        {PMB_COMPANY.fullHeadquartersAddress}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 italic">
                        {PMB_FONDATION_CHARTER.motto}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono-tabular text-zinc-300">
                    Fait à {submittedRecord.faitA}, le {submittedRecord.signedDate}
                  </span>
                </div>

                {showFondationPreview && (
                  <div className="space-y-6">
                    {/* 1. Informations personnelles */}
                    <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    1. Informations Personnelles
                  </h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-zinc-400">Nom</dt>
                      <dd className="font-semibold text-white mt-0.5">{submittedRecord.nom}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Post-nom</dt>
                      <dd className="font-semibold text-white mt-0.5">
                        {submittedRecord.postNom}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Prénom</dt>
                      <dd className="font-semibold text-white mt-0.5">
                        {submittedRecord.prenom}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Date de naissance</dt>
                      <dd className="text-zinc-200 font-mono-tabular mt-0.5">
                        {formatFrenchDate(submittedRecord.birthDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Lieu de naissance</dt>
                      <dd className="text-zinc-200 mt-0.5">{submittedRecord.birthPlace}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Sexe & État civil</dt>
                      <dd className="text-zinc-200 mt-0.5">
                        {submittedRecord.sexe} · {submittedRecord.etatCivil}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Nationalité</dt>
                      <dd className="text-zinc-200 mt-0.5">{submittedRecord.nationalite}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-zinc-400">Profession</dt>
                      <dd className="text-zinc-200 mt-0.5">{submittedRecord.profession}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-zinc-400">Adresse complète</dt>
                      <dd className="text-zinc-200 mt-0.5">{submittedRecord.adresseComplete}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Téléphone</dt>
                      <dd className="text-zinc-100 font-mono-tabular mt-0.5">
                        {submittedRecord.telephone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Adresse e-mail</dt>
                      <dd className="text-zinc-200 mt-0.5">{submittedRecord.email}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-zinc-400">
                        Personne à contacter en cas d’urgence
                      </dt>
                      <dd className="text-zinc-200 mt-0.5">{submittedRecord.urgenceContact}</dd>
                    </div>
                  </dl>
                </div>

                {/* 2. Informations relatives à l'adhésion */}
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    2. Informations Relatives à l’Adhésion
                  </h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-zinc-400">Catégorie souhaitée</dt>
                      <dd className="font-semibold text-[#F59E0B] mt-0.5">
                        {submittedRecord.categorie}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400">Domaine / Commission d’intérêt</dt>
                      <dd className="text-white font-medium mt-0.5">{submittedRecord.domaine}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-zinc-400">Motif de l’adhésion</dt>
                      <dd className="text-zinc-200 mt-0.5 leading-relaxed">
                        {submittedRecord.motif}
                      </dd>
                    </div>
                  </dl>
                </div>

                {submittedRecord.paymentTicket && (
                  <div className="border-t border-white/10 pt-4">
                    <PaymentProofTicketCard
                      ticket={submittedRecord.paymentTicket}
                      candidateNameOverride={`${submittedRecord.nom} ${submittedRecord.prenom}`.trim()}
                      variant="dark"
                    />
                  </div>
                )}

                {/* 3. Engagement du Membre */}
                <div className="border-t border-white/10 pt-4 text-xs text-zinc-300 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    3. Engagement & Signatures Manuscrites Officielles
                  </h4>
                  <p className="leading-relaxed">{PMB_FONDATION_CHARTER.commitmentStatement}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                    <div>
                      <p className="font-semibold text-zinc-200">
                        Signature du / de la secrétaire :
                      </p>
                      <p className="text-zinc-400 mt-1">Nom et signature manuscrite :</p>
                      <div className="mt-10 border-b border-zinc-400/70" />
                      <p className="text-[11px] font-mono-tabular text-zinc-500 mt-1">
                        ____________________________________
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">
                        Signature du candidat / membre d’adhésion :
                      </p>
                      <p className="text-zinc-400 mt-1">
                        {submittedRecord.nom} {submittedRecord.postNom}{' '}
                        {submittedRecord.prenom} :
                      </p>
                      <div className="mt-10 border-b border-zinc-400/70" />
                      <p className="text-[11px] font-mono-tabular text-zinc-500 mt-1">
                        ____________________________________
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Réservé à l'administration */}
                <div className="border-t border-white/10 pt-4 text-xs text-zinc-400 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    4. Réservé à l’Administration
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <p>N° d’enregistrement : {submittedRecord.dossierId}</p>
                    <p>Date de réception : ____/____/____</p>
                    <p>Décision : ☐ Acceptée ☐ En attente ☐ Refusée</p>
                    <p>Cotisation / frais : ____________</p>
                  </div>
                  <p className="pt-2 italic">{PMB_FONDATION_CHARTER.privacyNotice}</p>
                  <p className="font-mono-tabular pt-1">
                    PMB FONDATION · Bandal Synkin, Croisement Av. Kisangani &amp; Sundi N°1,
                    Kinshasa · {PMB_COMPANY.rccm} · {PMB_COMPANY.idNat}
                  </p>
                </div>
                  </div>
                )}

                {/* Boutons d'action complets après enregistrement */}
                {fondationExportPayload && (
                  <div className="no-print space-y-3 pt-3 border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowFondationPreview((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#229ED9]/20 border border-[#229ED9]/60 hover:bg-[#229ED9]/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {showFondationPreview ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Masquer l’aperçu</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Prévisualiser</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!showFondationPreview) setShowFondationPreview(true);
                          setTimeout(() => triggerCleanPrint('fondation'), 80);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#121212] bg-[#F59E0B] hover:bg-[#d98a06] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Printer className="w-4 h-4" aria-hidden="true" />
                        <span>Imprimer (Format A4)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          downloadHtmlSheet(fondationExportPayload);
                          setFondationActionNotice('Fiche A4 téléchargée sur votre appareil.');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#229ED9] hover:bg-[#1b86b9] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Télécharger / Enregistrer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          downloadJsonArchive(fondationExportPayload);
                          setFondationActionNotice('Dossier exporté vers votre ordinateur (.json).');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#262626] border border-white/15 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Laptop className="w-3.5 h-3.5 text-[#229ED9]" aria-hidden="true" />
                        <span>Exporter vers l’ordinateur</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void saveOnPhoneOrShare(fondationExportPayload).then((res) =>
                            setFondationActionNotice(
                              res === 'shared'
                                ? 'Fiche partagée / enregistrée sur votre téléphone.'
                                : 'Fiche enregistrée sur votre appareil.'
                            )
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#262626] border border-white/15 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                        <span>Enregistrer sur le téléphone</span>
                      </button>

                      <a
                        href={buildWhatsAppShareUrl(fondationExportPayload)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition-colors whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Envoyer sur WhatsApp</span>
                      </a>

                      <a
                        href={buildMailtoUrl(fondationExportPayload)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#262626] border border-white/15 hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Envoyer par e-mail</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSubmittedRecord(null);
                          setFondationActionNotice(null);
                        }}
                        className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-[#262626] border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Modifier / Nouvelle fiche
                      </button>
                    </div>

                    {fondationActionNotice && (
                      <p role="status" className="text-xs text-emerald-400">
                        {fondationActionNotice}
                      </p>
                    )}

                    {!showFondationPreview && (
                      <p className="text-xs text-zinc-400">
                        Aperçu détaillé masqué — cliquez sur « Prévisualiser » pour réafficher
                        les informations complètes.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="no-print rounded-xl bg-[#1c1c1e] border border-white/10 p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={fondationBranch.logoImage}
                      alt="Logo PMB Fondation"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-md object-contain bg-white p-1 border border-white/15 shrink-0"
                    />
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Formulaire Officiel d’Adhésion · PMB Fondation
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-400">Fiche A4 dédiée</span>
                </div>

                {/* 1. INFORMATIONS PERSONNELLES */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[#F59E0B]">
                    1. Informations Personnelles
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="f-nom" className="block text-xs font-medium text-zinc-200 mb-1.5">
                        Nom *
                      </label>
                      <input
                        id="f-nom"
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Nom de famille"
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                      {errors.nom && <p className="mt-1 text-xs text-red-400">{errors.nom}</p>}
                    </div>

                    <div>
                      <label
                        htmlFor="f-postnom"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Post-nom
                      </label>
                      <input
                        id="f-postnom"
                        type="text"
                        value={postNom}
                        onChange={(e) => setPostNom(e.target.value)}
                        placeholder="Post-nom"
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="f-prenom"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Prénom *
                      </label>
                      <input
                        id="f-prenom"
                        type="text"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        placeholder="Prénom"
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                      {errors.prenom && (
                        <p className="mt-1 text-xs text-red-400">{errors.prenom}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="f-birthdate"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Date de naissance *
                      </label>
                      <input
                        id="f-birthdate"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white font-mono-tabular border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                      {errors.birthDate && (
                        <p className="mt-1 text-xs text-red-400">{errors.birthDate}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="f-sexe"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Sexe *
                      </label>
                      <select
                        id="f-sexe"
                        value={sexe}
                        onChange={(e) => setSexe(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      >
                        <option value="Féminin">Féminin</option>
                        <option value="Masculin">Masculin</option>
                      </select>
                    </div>
                  </div>

                  {nameGenderWarning && (
                    <div
                      role="status"
                      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-amber-200"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{nameGenderWarning}</span>
                    </div>
                  )}

                  {/* Lieu de naissance en cascade (Continent -> Pays -> Ville -> Commune -> Quartier) */}
                  <div className="rounded-lg bg-[#121212]/70 border border-white/[0.08] p-4 space-y-3">
                    <p className="text-xs font-medium text-zinc-300">
                      Lieu de naissance (choisir dans la liste ou saisir librement) *
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <HybridSelectInput
                        label="Continent"
                        value={birthContinent}
                        onChange={(val) => {
                          setBirthContinent(val);
                          setBirthCountry('');
                          setBirthCity('');
                        }}
                        options={continents}
                      />
                      <HybridSelectInput
                        label="Pays"
                        value={birthCountry}
                        onChange={(val) => {
                          setBirthCountry(val);
                          setBirthCity('');
                        }}
                        options={countries}
                        required
                      />
                      <HybridSelectInput
                        label="Ville"
                        value={birthCity}
                        onChange={setBirthCity}
                        options={cities}
                        required
                      />
                      <HybridSelectInput
                        label="Commune"
                        value={birthCommune}
                        onChange={(val) => {
                          setBirthCommune(val);
                          setBirthQuartier('');
                        }}
                        options={communesList}
                        placeholder="Ex. : Bandalungwa..."
                      />
                      <HybridSelectInput
                        label="Quartier"
                        value={birthQuartier}
                        onChange={setBirthQuartier}
                        options={birthQuartiersList}
                        placeholder="Ex. : Synkin..."
                      />
                    </div>
                    {errors.birthPlace && (
                      <p className="text-xs text-red-400">{errors.birthPlace}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="f-etatcivil"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        État civil
                      </label>
                      <select
                        id="f-etatcivil"
                        value={etatCivil}
                        onChange={(e) => setEtatCivil(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      >
                        <option value="Célibataire">Célibataire</option>
                        <option value="Marié(e)">Marié(e)</option>
                        <option value="Divorcé(e)">Divorcé(e)</option>
                        <option value="Veuf(ve)">Veuf(ve)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="f-nat"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Nationalité
                      </label>
                      <input
                        id="f-nat"
                        type="text"
                        value={nationalite}
                        onChange={(e) => setNationalite(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="f-prof"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Profession
                      </label>
                      <input
                        id="f-prof"
                        type="text"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="Ex. : Enseignant, Juriste..."
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>

                  {/* Adresse séparée avec Commune, Quartier, Avenue/Rue et Numéro */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <HybridSelectInput
                      label="Commune"
                      value={resCommune}
                      onChange={(val) => {
                        setResCommune(val);
                        setResQuartier('');
                      }}
                      options={communesList}
                      placeholder="Ex. : Bandalungwa..."
                      required
                    />
                    <HybridSelectInput
                      label="Quartier"
                      value={resQuartier}
                      onChange={setResQuartier}
                      options={resQuartiersList}
                      placeholder="Ex. : Synkin..."
                    />
                    <div>
                      <label
                        htmlFor="f-avenue"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Avenue / Rue (Street) <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        id="f-avenue"
                        type="text"
                        value={resAvenue}
                        onChange={(e) => setResAvenue(e.target.value)}
                        placeholder="Ex. : Av. Kisangani"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="f-num"
                        className="block text-xs font-medium text-zinc-300 mb-1.5"
                      >
                        Numéro <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        id="f-num"
                        type="text"
                        value={resNumber}
                        onChange={(e) => setResNumber(e.target.value)}
                        placeholder="Ex. : N° 1"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>
                  {errors.adresse && <p className="text-xs text-red-400">{errors.adresse}</p>}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="f-tel"
                        className="block text-xs font-medium text-zinc-200"
                      >
                        Téléphone international (9 chiffres) *
                      </label>
                      <span className="text-xs font-mono-tabular text-zinc-400">
                        {telephone.replace(/\D/g, '').length}/9 chiffres
                      </span>
                    </div>
                    <div className="flex">
                      <select
                        aria-label="Indicatif téléphonique international"
                        value={phoneIso}
                        onChange={(e) => {
                          const iso = e.target.value;
                          setPhoneIso(iso);
                          const found = countryDialCodes.find((c) => c.iso === iso);
                          if (found) setPhoneCode(found.code);
                        }}
                        className="max-w-[54%] rounded-l-lg border border-r-0 border-white/15 bg-[#262626] px-2.5 py-2 text-xs sm:text-sm text-white font-mono-tabular focus:outline-none focus:border-[#F59E0B] truncate"
                      >
                        {countryDialCodes.map((item) => (
                          <option key={item.iso} value={item.iso}>
                            {item.flag} {item.code} ({item.country})
                          </option>
                        ))}
                      </select>
                      <input
                        id="f-tel"
                        type="tel"
                        inputMode="numeric"
                        value={telephone}
                        onChange={(e) =>
                          setTelephone(e.target.value.replace(/\D/g, '').slice(0, 9))
                        }
                        placeholder="896660558"
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 font-mono-tabular border border-white/15 rounded-r-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                    {errors.telephone && (
                      <p className="mt-1 text-xs text-red-400">{errors.telephone}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="f-email"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Adresse e-mail
                      </label>
                      <input
                        id="f-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="f-urgence"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Personne à contacter en cas d’urgence *
                      </label>
                      <input
                        id="f-urgence"
                        type="text"
                        value={urgenceContact}
                        onChange={(e) => setUrgenceContact(e.target.value)}
                        placeholder="Nom complet & +243 ..."
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      />
                      {errors.urgenceContact && (
                        <p className="mt-1 text-xs text-red-400">{errors.urgenceContact}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. INFORMATIONS RELATIVES À L'ADHÉSION */}
                <div className="border-t border-white/[0.08] pt-5 space-y-4">
                  <h4 className="text-sm font-semibold text-[#F59E0B]">
                    2. Informations Relatives à l’Adhésion
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="f-cat"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Catégorie souhaitée *
                      </label>
                      <select
                        id="f-cat"
                        value={categorie}
                        onChange={(e) => {
                          const nextCat = e.target.value;
                          setCategorie(nextCat);
                          setFondationPaymentTicket((prev) =>
                            prev ? { ...prev, category: nextCat } : null
                          );
                          setErrors((prev) => {
                            if (!prev.paymentTicket) return prev;
                            const next = { ...prev };
                            delete next.paymentTicket;
                            return next;
                          });
                        }}
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      >
                        {PMB_FONDATION_CHARTER.formCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-zinc-400">
                        {categorie === 'Membre effectif'
                          ? 'Paiement obligatoire (≥ 20 $ USD) avant validation.'
                          : 'Paiement facultatif (contribution volontaire ≥ 20 $ USD proposée).'}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="f-dom"
                        className="block text-xs font-medium text-zinc-200 mb-1.5"
                      >
                        Domaine / Commission d’intérêt
                      </label>
                      <select
                        id="f-dom"
                        value={domaine}
                        onChange={(e) => setDomaine(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#121212] text-white border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                      >
                        {PMB_FONDATION_CHARTER.involvementDomains.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {categorie === 'Membre effectif' && (
                      <>
                        <MembreEffectifInfoCard />
                        <MemberAccountGate compact />
                        {errors.memberAccount && (
                          <p role="alert" className="text-xs text-red-400">
                            {errors.memberAccount}
                          </p>
                        )}
                      </>
                    )}
                    <EffectiveMemberPaymentBox
                      category={categorie}
                      candidateName={`${nom} ${postNom} ${prenom}`.trim()}
                      ticket={fondationPaymentTicket}
                      onTicketChange={(next) => {
                        setFondationPaymentTicket(next);
                        setErrors((prev) => {
                          if (!prev.paymentTicket) return prev;
                          const updated = { ...prev };
                          delete updated.paymentTicket;
                          return updated;
                        });
                      }}
                      paymentGateError={errors.paymentTicket}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="f-motif"
                      className="block text-xs font-medium text-zinc-200 mb-1.5"
                    >
                      Motif de l’adhésion *
                    </label>
                    <textarea
                      id="f-motif"
                      rows={3}
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      placeholder="Expliquez les raisons de votre souhait d’adhérer à PMB Fondation..."
                      className="w-full px-3 py-2 text-sm bg-[#121212] text-white placeholder:text-zinc-500 border border-white/15 rounded-lg focus:outline-none focus:border-[#F59E0B]"
                    />
                    {errors.motif && <p className="mt-1 text-xs text-red-400">{errors.motif}</p>}
                  </div>
                </div>

                {/* 3. ENGAGEMENT DU MEMBRE */}
                <div className="border-t border-white/[0.08] pt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-[#F59E0B]">
                      3. Engagement du Membre
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <label htmlFor="f-faita" className="text-zinc-400">
                        Fait à :
                      </label>
                      <input
                        id="f-faita"
                        type="text"
                        value={faitA}
                        onChange={(e) => setFaitA(e.target.value)}
                        className="w-36 px-2.5 py-1 bg-[#121212] text-white border border-white/15 rounded focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedCharter}
                      onChange={(e) => setAcceptedCharter(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-white/20 accent-[#F59E0B]"
                    />
                    <span>{PMB_FONDATION_CHARTER.commitmentStatement}</span>
                  </label>
                  {errors.acceptedCharter && (
                    <p className="text-xs text-red-400">{errors.acceptedCharter}</p>
                  )}
                </div>

                {Object.keys(errors).length > 0 && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 space-y-1"
                  >
                    <p className="font-semibold">
                      Veuillez corriger les points suivants avant de valider :
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/[0.08]">
                  <p className="text-xs text-zinc-400">{PMB_FONDATION_CHARTER.privacyNotice}</p>
                  <button
                    type="submit"
                    className="px-5 py-3 text-sm font-semibold text-[#121212] bg-[#F59E0B] hover:bg-[#d98a06] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Valider et générer la Fiche d’Adhésion
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
