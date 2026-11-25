import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  SkipForward,
  UserPlus,
} from 'lucide-react';
import {
  PMB_BRANCHES,
  countryDialCodes,
  geographyData,
  kinshasaCommunes,
  userCategories,
} from '../data/pmbData';
import {
  MembershipExportPayload,
  checkNameGenderCoherence,
} from '../lib/membershipExport';
import { MembershipPaymentTicket } from '../lib/membershipPayment';
import { usePmbStore } from '../lib/pmbStore';
import {
  MediaFileValue,
  MemberGender,
  PhotoCaptureMode,
  fileToCompactDataUrl,
  formatNineDigitsDisplay,
  normalizeNineDigitPhone,
  revokePreviewUrl,
  validateNineDigitPhone,
} from '../lib/registrationMedia';
import { monitoredFetch } from '../lib/selfHealingMonitor';
import { HybridSelectInput } from './HybridSelectInput';
import { MemberAccountGate } from './portal/MemberAccountGate';
import { EffectiveMemberPaymentBox } from './registration/EffectiveMemberPaymentBox';
import { MembershipSheetPreview } from './registration/MembershipSheetPreview';
import { MembreEffectifInfoCard } from './registration/MembreEffectifInfoCard';
import { ProfilePhotoSelector } from './registration/ProfilePhotoSelector';

export interface MemberFormData {
  fullName: string;
  gender: MemberGender | '';
  birthDate: string;
  birthContinent: string;
  birthCountry: string;
  birthCity: string;
  birthCommune: string;
  birthQuartier: string;
  resCommune: string;
  resQuartier: string;
  resAvenue: string;
  resNumber: string;
  phoneCountryIso: string;
  phoneCode: string;
  phoneNumber: string;
  category: string;
}

interface RegistrationFormProps {
  lockedBranchId?: string;
  embedded?: boolean;
  externalPaymentTicket?: MembershipPaymentTicket | null;
  onExternalPaymentTicketChange?: (ticket: MembershipPaymentTicket | null) => void;
}

export function RegistrationForm({
  lockedBranchId,
  embedded = false,
  externalPaymentTicket,
  onExternalPaymentTicketChange,
}: RegistrationFormProps = {}) {
  const { currentMember, addMembershipRecord } = usePmbStore();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    lockedBranchId || 'pmb-fondation'
  );
  const selectedBranch =
    PMB_BRANCHES.find((b) => b.id === (lockedBranchId || selectedBranchId)) ??
    PMB_BRANCHES.find((b) => b.id === 'pmb-fondation')!;

  const [formData, setFormData] = useState<MemberFormData>({
    fullName: currentMember?.fullName || '',
    gender: '',
    birthDate: '',
    birthContinent: 'Afrique',
    birthCountry: 'République Démocratique du Congo',
    birthCity: 'Kinshasa',
    birthCommune: '',
    birthQuartier: '',
    resCommune: '',
    resQuartier: '',
    resAvenue: '',
    resNumber: '',
    phoneCountryIso: 'CD',
    phoneCode: '+243',
    phoneNumber: '',
    category: userCategories[0],
  });

  const [photoMode, setPhotoMode] = useState<PhotoCaptureMode>('upload');
  const [profilePhoto, setProfilePhoto] = useState<MediaFileValue | null>(null);
  const [internalPaymentTicket, setInternalPaymentTicket] =
    useState<MembershipPaymentTicket | null>(null);
  const paymentTicket =
    externalPaymentTicket !== undefined ? externalPaymentTicket : internalPaymentTicket;
  const setPaymentTicket = (
    updater:
      | MembershipPaymentTicket
      | null
      | ((prev: MembershipPaymentTicket | null) => MembershipPaymentTicket | null)
  ) => {
    const nextVal = typeof updater === 'function' ? updater(paymentTicket) : updater;
    if (onExternalPaymentTicketChange) {
      onExternalPaymentTicketChange(nextVal);
    } else {
      setInternalPaymentTicket(nextVal);
    }
  };

  const [phoneLiveNotice, setPhoneLiveNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passableWarnings, setPassableWarnings] = useState<string[]>([]);
  const [showPassablePrompt, setShowPassablePrompt] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedSheet, setSavedSheet] = useState<MembershipExportPayload | null>(null);

  // Libération propre de la blob URL de la photo au démontage
  const photoUrlRef = useRef<string | null | undefined>(null);
  photoUrlRef.current = profilePhoto?.previewUrl;

  useEffect(() => {
    return () => {
      revokePreviewUrl(photoUrlRef.current);
    };
  }, []);

  const continents = Object.keys(geographyData);

  const countries = useMemo(() => {
    return geographyData[formData.birthContinent]
      ? Object.keys(geographyData[formData.birthContinent])
      : Object.values(geographyData).flatMap((c) => Object.keys(c));
  }, [formData.birthContinent]);

  const cities = useMemo(() => {
    const continentObj = geographyData[formData.birthContinent];
    if (continentObj && continentObj[formData.birthCountry]) {
      return continentObj[formData.birthCountry];
    }
    return ['Kinshasa', 'Lubumbashi', 'Goma', 'Cape Town', 'Paris', 'Bruxelles'];
  }, [formData.birthContinent, formData.birthCountry]);

  const communesList = Object.keys(kinshasaCommunes);

  const birthQuartiersList = useMemo(() => {
    return kinshasaCommunes[formData.birthCommune] || [];
  }, [formData.birthCommune]);

  const resQuartiersList = useMemo(() => {
    return kinshasaCommunes[formData.resCommune] || [];
  }, [formData.resCommune]);

  const selectedDialCountry = useMemo(() => {
    return (
      countryDialCodes.find((c) => c.iso === formData.phoneCountryIso) ?? countryDialCodes[0]
    );
  }, [formData.phoneCountryIso]);

  const updateField = <K extends keyof MemberFormData>(
    key: K,
    value: MemberFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
    setShowPassablePrompt(false);
  };

  const handleCountryIsoChange = (iso: string) => {
    const country = countryDialCodes.find((c) => c.iso === iso);
    if (!country) return;
    setFormData((prev) => ({
      ...prev,
      phoneCountryIso: country.iso,
      phoneCode: country.code,
    }));
    setPhoneLiveNotice(null);
    setFieldErrors((prev) => {
      if (!prev.phoneNumber) return prev;
      const next = { ...prev };
      delete next.phoneNumber;
      return next;
    });
  };

  const handlePhoneInputChange = (rawInput: string) => {
    const { digits, hadNonDigits, hadOverflow } = normalizeNineDigitPhone(rawInput);

    if (hadNonDigits) {
      setPhoneLiveNotice(
        'Erreur de saisie : seuls les chiffres (0–9) sont autorisés après l’indicatif.'
      );
    } else if (hadOverflow) {
      setPhoneLiveNotice(
        `Limite atteinte : le numéro après ${formData.phoneCode} doit comporter exactement 9 chiffres.`
      );
    } else {
      setPhoneLiveNotice(null);
    }

    updateField('phoneNumber', digits);
  };

  const todayIso = new Date().toISOString().split('T')[0];

  const collectValidation = () => {
    const blocking: Record<string, string> = {};
    const passable: string[] = [];

    if (formData.fullName.trim().length < 2) {
      blocking.fullName = 'Le nom complet doit contenir au moins 2 caractères.';
    }
    if (formData.gender !== 'Femme' && formData.gender !== 'Homme') {
      blocking.gender = 'Veuillez sélectionner le sexe / genre du membre (Femme ou Homme).';
    }
    if (!formData.birthDate) {
      blocking.birthDate = 'Veuillez sélectionner la date de naissance.';
    } else if (formData.birthDate > todayIso) {
      blocking.birthDate = 'La date de naissance ne peut pas être postérieure à aujourd’hui.';
    }
    if (!formData.birthContinent.trim()) {
      blocking.birthContinent = 'Veuillez préciser le continent de naissance.';
    }
    if (!formData.birthCountry.trim()) {
      blocking.birthCountry = 'Veuillez préciser le pays de naissance.';
    }
    if (!formData.birthCity.trim()) {
      blocking.birthCity = 'Veuillez préciser la ville de naissance.';
    }
    if (formData.resCommune.trim().length < 2) {
      blocking.resCommune = 'Veuillez indiquer la commune de résidence actuelle.';
    }
    if (formData.resAvenue.trim().length < 2) {
      blocking.resAvenue = 'Veuillez indiquer l’avenue ou la rue.';
    }
    if (!formData.resNumber.trim()) {
      blocking.resNumber = 'Veuillez indiquer le numéro de parcelle / immeuble.';
    }

    const phoneErr = validateNineDigitPhone(formData.phoneNumber, formData.phoneCode);
    if (phoneErr) {
      blocking.phoneNumber = phoneErr;
    }

    if (formData.category === 'Membre effectif' && !currentMember) {
      blocking.memberAccount =
        'Un compte Membre connecté est obligatoire pour la catégorie « Membre effectif ». Connectez-vous ou créez votre compte ci-dessous.';
    }
    if (formData.category === 'Membre effectif' && !paymentTicket) {
      blocking.paymentTicket =
        'Paiement obligatoire requis pour « Membre effectif ». Validez le paiement et générez le ticket ci-dessus avant de finaliser l’adhésion.';
    }

    // Champs passables (optionnels mais signalés à l'utilisateur avec option d'ignorer)
    if (photoMode !== 'skip' && !profilePhoto) {
      passable.push(
        'Photo de profil non ajoutée (vous pouvez l’importer, faire un selfie ou ignorer)'
      );
    }
    if (!formData.resQuartier.trim()) {
      passable.push('Quartier de résidence actuelle non précisé');
    }

    return { blocking, passable };
  };

  const submitToServer = async () => {
    setServerError(null);
    setSubmitting(true);

    try {
      const effectiveTicket = paymentTicket
        ? {
            ...paymentTicket,
            candidateName: formData.fullName.trim() || paymentTicket.candidateName,
            category: formData.category,
          }
        : null;

      const payload = {
        ...formData,
        photoMode,
        photoFileName: profilePhoto ? profilePhoto.fileName : null,
        photoSizeBytes: profilePhoto ? profilePhoto.sizeBytes : null,
        signaturesMode: 'manuscript_blank' as const,
        paymentTicket: effectiveTicket,
      };

      const res = await monitoredFetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        registration?: { reference: string; createdAt: string };
      };
      if (!res.ok || !data.registration) {
        throw new Error(data.error || 'Échec lors de l’enregistrement du dossier.');
      }

      const photoDataUrl =
        profilePhoto?.file ? await fileToCompactDataUrl(profilePhoto.file) : null;

      const birthPlaceParts = [
        formData.birthQuartier.trim() ? `Q. ${formData.birthQuartier.trim()}` : '',
        formData.birthCommune.trim() ? `C. ${formData.birthCommune.trim()}` : '',
        formData.birthCity.trim(),
        formData.birthCountry.trim(),
        formData.birthContinent.trim(),
      ].filter(Boolean);

      const addressParts = [
        formData.resCommune.trim() ? `C. ${formData.resCommune.trim()}` : '',
        formData.resQuartier.trim() ? `Q. ${formData.resQuartier.trim()}` : '',
        formData.resAvenue.trim(),
        formData.resNumber.trim(),
      ].filter(Boolean);

      const createdAtLabel = new Date(data.registration.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const birthPlaceStr = birthPlaceParts.join(', ');
      const addressStr = addressParts.join(', ');
      const phoneStr = `${formData.phoneCode} ${formatNineDigitsDisplay(formData.phoneNumber)}`;

      const nextPayload: MembershipExportPayload = {
        reference: data.registration.reference,
        createdAtLabel,
        title: `FICHE D'ADHÉSION OFFICIELLE — ${selectedBranch.name.toUpperCase()}`,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        branchLogo: selectedBranch.logoImage,
        accentColor:
          selectedBranch.id === 'pmb-fondation' ? '#0284c7' : selectedBranch.accentColor,
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthPlace: birthPlaceStr,
        address: addressStr,
        phone: phoneStr,
        category: formData.category,
        photoDataUrl,
        paymentTicket: effectiveTicket,
      };

      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);

      addMembershipRecord({
        dossierId: data.registration.reference,
        kind: 'member',
        accountEmail: currentMember?.email,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        fullName: nextPayload.fullName,
        gender: nextPayload.gender,
        birthDate: nextPayload.birthDate,
        birthPlace: nextPayload.birthPlace,
        address: nextPayload.address,
        phone: nextPayload.phone,
        email: currentMember?.email || 'Non renseigné',
        category: nextPayload.category,
        subscriptionStatus: 'En attente de validation',
        expiresAtIso: expDate.toISOString(),
        expiresAtLabel: expDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        paymentTicket: effectiveTicket,
        createdAtLabel,
        photoDataUrl,
      });

      setSavedSheet(nextPayload);
      setShowPassablePrompt(false);
      setPassableWarnings([]);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur lors de la soumission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const { blocking, passable } = collectValidation();
    setFieldErrors(blocking);

    if (Object.keys(blocking).length > 0) {
      setShowPassablePrompt(false);
      setPassableWarnings([]);
      return;
    }

    if (passable.length > 0) {
      setPassableWarnings(passable);
      setShowPassablePrompt(true);
      return;
    }

    await submitToServer();
  };

  const blockingErrorList = Object.values(fieldErrors);

  const formContent = (
    <>
      {!embedded && (
        <div className="no-print max-w-2xl mb-10">
          <p className="text-sm font-medium text-[#F59E0B] mb-2">
            Adhésion & Fiche Officielle
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Formulaire d’adhésion {selectedBranch.name}
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Renseignez votre identité, votre catégorie d’adhésion, votre adresse complète à
            Kinshasa et votre numéro international à 9 chiffres. Une fois enregistré, vous pourrez
            prévisualiser, imprimer, télécharger ou partager votre fiche avec les deux lignes de
            signature manuscrite.
          </p>
        </div>
      )}

      {savedSheet ? (
        <MembershipSheetPreview
          data={savedSheet}
          onEditForm={() => setSavedSheet(null)}
          printScope="registration"
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="no-print rounded-xl bg-[#1c1c1e]/92 border border-white/10 p-6 sm:p-8 space-y-8"
        >
          {/* EN-TÊTE DE BRANCHE DÉDIÉE */}
          <div className="rounded-xl bg-[#121212] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedBranch.logoImage}
                alt={`Logo ${selectedBranch.name}`}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-white/15 shrink-0"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#229ED9]">
                  {lockedBranchId ? 'Organisme d’adhésion officiel' : 'Branche d’adhésion sélectionnée'}
                </p>
                <p className="text-sm font-bold text-white">{selectedBranch.name}</p>
              </div>
            </div>

            {!lockedBranchId && (
              <div className="sm:w-64">
                <label htmlFor="reg-branch" className="sr-only">
                  Branche concernée
                </label>
                <select
                  id="reg-branch"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#1c1c1e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#229ED9] focus:outline-none"
                >
                  {PMB_BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

            {/* SECTION 1 : IDENTITÉ, SEXE / GENRE & DATE DE NAISSANCE */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="reg-fullname"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Nom complet <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Ex. : Beni Matondo"
                    className={`w-full rounded-lg border bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none ${
                      fieldErrors.fullName
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-white/15 focus:border-[#229ED9]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reg-birthdate"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Date de naissance <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    id="reg-birthdate"
                    type="date"
                    required
                    max={todayIso}
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    className={`w-full rounded-lg border bg-[#121212] px-3.5 py-2.5 text-sm text-white font-mono-tabular focus:outline-none ${
                      fieldErrors.birthDate
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-white/15 focus:border-[#229ED9]'
                    }`}
                  />
                  {fieldErrors.birthDate && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.birthDate}</p>
                  )}
                </div>
              </div>

              {/* Sexe / Genre du membre d'adhésion */}
              <div>
                <span className="block text-xs font-medium text-zinc-300 mb-2">
                  Sexe / Genre du membre d’adhésion <span className="text-[#F59E0B]">*</span>
                </span>
                <div
                  role="radiogroup"
                  aria-label="Sexe ou genre du membre d’adhésion"
                  className="grid grid-cols-2 gap-3 max-w-md"
                >
                  {(['Femme', 'Homme'] as const).map((option) => {
                    const selected = formData.gender === option;
                    return (
                      <label
                        key={option}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#229ED9] bg-[#229ED9]/15 text-white'
                            : fieldErrors.gender
                              ? 'border-red-500/60 bg-[#121212] text-zinc-300 hover:border-white/30'
                              : 'border-white/15 bg-[#121212] text-zinc-300 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="member-gender"
                          value={option}
                          checked={selected}
                          onChange={() => updateField('gender', option)}
                          className="sr-only"
                        />
                        <span>{option}</span>
                        <span
                          aria-hidden="true"
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selected
                              ? 'border-[#229ED9] bg-[#229ED9]'
                              : 'border-zinc-500 bg-transparent'
                          }`}
                        >
                          {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.gender && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldErrors.gender}</p>
                )}

                {(() => {
                  const coherenceMsg = checkNameGenderCoherence(
                    formData.fullName,
                    formData.gender
                  );
                  if (!coherenceMsg) return null;
                  return (
                    <div
                      role="status"
                      className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-amber-200"
                    >
                      <AlertTriangle
                        className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{coherenceMsg}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* SECTION 2 : PHOTO DE PROFIL (IMPORTER / SELFIE / IGNORER) */}
            <div className="pt-6 border-t border-white/[0.08]">
              <ProfilePhotoSelector
                mode={photoMode}
                value={profilePhoto}
                onModeChange={(nextMode) => {
                  setPhotoMode(nextMode);
                  setShowPassablePrompt(false);
                }}
                onChange={(nextPhoto) => {
                  setProfilePhoto(nextPhoto);
                  setShowPassablePrompt(false);
                }}
              />
            </div>

            {/* SECTION 3 : LIEU DE NAISSANCE SÉPARÉ (CHOISIR OU ÉCRIRE) */}
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-white">Lieu de naissance</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Sélectionnez dans la liste déroulante ou saisissez directement votre localité.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <HybridSelectInput
                  label="Continent"
                  value={formData.birthContinent}
                  onChange={(val) => {
                    updateField('birthContinent', val);
                    updateField('birthCountry', '');
                    updateField('birthCity', '');
                  }}
                  options={continents}
                  placeholder="Choisir ou écrire..."
                  required
                />

                <HybridSelectInput
                  label="Pays"
                  value={formData.birthCountry}
                  onChange={(val) => {
                    updateField('birthCountry', val);
                    updateField('birthCity', '');
                  }}
                  options={countries}
                  placeholder="Choisir ou écrire..."
                  required
                />

                <HybridSelectInput
                  label="Ville"
                  value={formData.birthCity}
                  onChange={(val) => updateField('birthCity', val)}
                  options={cities}
                  placeholder="Choisir ou écrire..."
                  required
                />

                <HybridSelectInput
                  label="Commune"
                  value={formData.birthCommune}
                  onChange={(val) => {
                    updateField('birthCommune', val);
                    updateField('birthQuartier', '');
                  }}
                  options={communesList}
                  placeholder="Ex. : Bandalungwa..."
                />

                <HybridSelectInput
                  label="Quartier"
                  value={formData.birthQuartier}
                  onChange={(val) => updateField('birthQuartier', val)}
                  options={birthQuartiersList}
                  placeholder="Ex. : Synkin..."
                />
              </div>
              {(fieldErrors.birthContinent ||
                fieldErrors.birthCountry ||
                fieldErrors.birthCity) && (
                <p className="mt-2 text-xs text-red-400">
                  {fieldErrors.birthContinent ||
                    fieldErrors.birthCountry ||
                    fieldErrors.birthCity}
                </p>
              )}
            </div>

            {/* SECTION 4 : ADRESSE RÉSIDENTIELLE SÉPARÉE */}
            <div className="pt-6 border-t border-white/[0.08]">
              <h3 className="text-base font-semibold text-white mb-4">Adresse actuelle</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <HybridSelectInput
                  label="Commune"
                  value={formData.resCommune}
                  onChange={(val) => {
                    updateField('resCommune', val);
                    updateField('resQuartier', '');
                  }}
                  options={communesList}
                  placeholder="Ex. : Gombe, Limete..."
                  required
                />

                <HybridSelectInput
                  label="Quartier"
                  value={formData.resQuartier}
                  onChange={(val) => updateField('resQuartier', val)}
                  options={resQuartiersList}
                  placeholder="Ex. : Synkin, Joli Parc..."
                />

                <div>
                  <label
                    htmlFor="reg-avenue"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Avenue / Rue (Street) <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    id="reg-avenue"
                    type="text"
                    required
                    value={formData.resAvenue}
                    onChange={(e) => updateField('resAvenue', e.target.value)}
                    placeholder="Ex. : Av. Kisangani"
                    className={`w-full rounded-lg border bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none ${
                      fieldErrors.resAvenue
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-white/15 focus:border-[#229ED9]'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-number"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Numéro <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    id="reg-number"
                    type="text"
                    required
                    value={formData.resNumber}
                    onChange={(e) => updateField('resNumber', e.target.value)}
                    placeholder="Ex. : N° 14 Bis"
                    className={`w-full rounded-lg border bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none ${
                      fieldErrors.resNumber
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-white/15 focus:border-[#229ED9]'
                    }`}
                  />
                </div>
              </div>
              {(fieldErrors.resCommune || fieldErrors.resAvenue || fieldErrors.resNumber) && (
                <p className="mt-2 text-xs text-red-400">
                  {fieldErrors.resCommune || fieldErrors.resAvenue || fieldErrors.resNumber}
                </p>
              )}
            </div>

            {/* SECTION 5 : TÉLÉPHONE MONDIAL (9 CHIFFRES STRICTS) & CATÉGORIE */}
            <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="reg-phone"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Téléphone international (9 chiffres requis){' '}
                    <span className="text-[#F59E0B]">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono-tabular ${
                      formData.phoneNumber.length === 9
                        ? 'text-emerald-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    {formData.phoneNumber.length}/9 chiffres
                  </span>
                </div>

                <div className="flex">
                  <select
                    aria-label="Indicatif téléphonique mondial"
                    value={formData.phoneCountryIso}
                    onChange={(e) => handleCountryIsoChange(e.target.value)}
                    className="max-w-[54%] rounded-l-lg border border-r-0 border-white/15 bg-[#262626] px-2.5 py-2.5 text-xs sm:text-sm text-white font-mono-tabular focus:border-[#229ED9] focus:outline-none truncate"
                  >
                    {countryDialCodes.map((item) => (
                      <option key={item.iso} value={item.iso}>
                        {item.flag} {item.code} ({item.country})
                      </option>
                    ))}
                  </select>
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    value={formatNineDigitsDisplay(formData.phoneNumber)}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    placeholder="896 660 558"
                    className={`w-full rounded-r-lg border bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 font-mono-tabular focus:outline-none ${
                      fieldErrors.phoneNumber || phoneLiveNotice
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-white/15 focus:border-[#229ED9]'
                    }`}
                  />
                </div>

                <p className="mt-1.5 text-xs text-zinc-400 font-mono-tabular">
                  Indicatif actif : {selectedDialCountry.flag} {selectedDialCountry.country} (
                  {selectedDialCountry.code}) · Saisissez exactement 9 chiffres.
                </p>

                {(phoneLiveNotice || fieldErrors.phoneNumber) && (
                  <p role="alert" className="mt-1 text-xs text-red-400">
                    {phoneLiveNotice || fieldErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-category"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  Catégorie d’adhésion souhaitée <span className="text-[#F59E0B]">*</span>
                </label>
                <select
                  id="reg-category"
                  value={formData.category}
                  onChange={(e) => {
                    const nextCat = e.target.value;
                    updateField('category', nextCat);
                    setPaymentTicket((prev) => (prev ? { ...prev, category: nextCat } : null));
                    setFieldErrors((prev) => {
                      if (!prev.paymentTicket) return prev;
                      const next = { ...prev };
                      delete next.paymentTicket;
                      return next;
                    });
                  }}
                  required
                  className="w-full rounded-lg border border-white/15 bg-[#121212] px-3.5 py-2.5 text-sm text-white focus:border-[#229ED9] focus:outline-none"
                >
                  {userCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-zinc-400">
                  {formData.category === 'Membre effectif'
                    ? 'Paiement obligatoire (à partir de 20 $ USD) requis avant la validation finale.'
                    : 'Paiement facultatif (contribution volontaire à partir de 20 $ USD proposée).'}
                </p>
              </div>
            </div>

            {/* RÈGLES « MEMBRE EFFECTIF » & PAIEMENT (OBLIGATOIRE EFFECTIF / VOLONTAIRE AUTRES) */}
            <div className="space-y-5">
              {formData.category === 'Membre effectif' && (
                <>
                  <MembreEffectifInfoCard />
                  <MemberAccountGate compact />
                  {fieldErrors.memberAccount && (
                    <p role="alert" className="text-xs text-red-400">
                      {fieldErrors.memberAccount}
                    </p>
                  )}
                </>
              )}
              <EffectiveMemberPaymentBox
                category={formData.category}
                candidateName={formData.fullName}
                ticket={paymentTicket}
                onTicketChange={(next) => {
                  setPaymentTicket(next);
                  setFieldErrors((prev) => {
                    if (!prev.paymentTicket) return prev;
                    const updated = { ...prev };
                    delete updated.paymentTicket;
                    return updated;
                  });
                }}
                paymentGateError={fieldErrors.paymentTicket}
              />
            </div>

            {/* SECTION 6 : SIGNATURES MANUSCRITES VIERGES SUR LA FICHE */}
            <div className="pt-6 border-t border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Signatures manuscrites officielles
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Les deux emplacements ci-dessous restent vierges pour signature manuscrite lors
                  de la prévisualisation, de l’impression et du téléchargement de la fiche.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/10 bg-[#121212] p-5 space-y-2">
                  <p className="text-sm font-semibold text-white">
                    Signature du / de la secrétaire
                  </p>
                  <p className="text-xs text-zinc-400">
                    Espace vierge réservé au visa du secrétariat :
                  </p>
                  <div className="pt-10 border-b border-zinc-400/70" />
                  <p className="text-xs font-mono-tabular text-zinc-500">
                    ____________________________________
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#121212] p-5 space-y-2">
                  <p className="text-sm font-semibold text-white">
                    Signature du candidat / membre d’adhésion
                  </p>
                  <p className="text-xs text-zinc-400">
                    Espace vierge réservé à la signature du membre :
                  </p>
                  <div className="pt-10 border-b border-zinc-400/70" />
                  <p className="text-xs font-mono-tabular text-zinc-500">
                    ____________________________________
                  </p>
                </div>
              </div>
            </div>

            {/* SIGNALEMENT D'ERREURS BLOQUANTES */}
            {blockingErrorList.length > 0 && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 space-y-2"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    Veuillez corriger {blockingErrorList.length} erreur
                    {blockingErrorList.length > 1 ? 's' : ''} avant de continuer :
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-red-200">
                  {blockingErrorList.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SIGNALEMENT DES ÉLÉMENTS PASSABLES AVEC CHOIX D'IGNORER */}
            {showPassablePrompt && passableWarnings.length > 0 && (
              <div
                role="status"
                className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-white">
                      Éléments passables non renseignés détectés
                    </p>
                    <p className="text-xs text-zinc-300">
                      Vous pouvez compléter ces éléments maintenant ou choisir de les ignorer pour
                      enregistrer et prévisualiser votre fiche :
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-amber-200">
                      {passableWarnings.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassablePrompt(false)}
                    className="px-3.5 py-2 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Compléter les éléments
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitToServer()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] disabled:opacity-60 text-xs font-semibold text-[#121212] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {submitting
                        ? 'Enregistrement...'
                        : 'Ignorer les passables et enregistrer'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {serverError && (
              <p role="alert" className="text-xs sm:text-sm text-red-400">
                {serverError}
              </p>
            )}

            {/* BOUTON DE SOUMISSION */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                <span>{submitting ? 'Enregistrement...' : 'Enregistrer et prévisualiser'}</span>
              </button>

              <p className="text-xs text-zinc-400">
                Après validation : aperçu A4, impression, export ordinateur/téléphone, WhatsApp et
                e-mail.
              </p>
            </div>
          </form>
      )}
    </>
  );

  if (embedded) {
    return <div>{formContent}</div>;
  }

  return (
    <section
      id="inscription"
      className="py-16 lg:py-24 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">{formContent}</div>
    </section>
  );
}
