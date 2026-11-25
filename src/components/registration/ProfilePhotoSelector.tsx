import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileImage,
  RefreshCw,
  SkipForward,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MediaFileValue,
  PhotoCaptureMode,
  formatFileSize,
  revokePreviewUrl,
  validatePhotoFile,
} from '../../lib/registrationMedia';

interface ProfilePhotoSelectorProps {
  mode: PhotoCaptureMode;
  value: MediaFileValue | null;
  onModeChange: (mode: PhotoCaptureMode) => void;
  onChange: (next: MediaFileValue | null) => void;
}

export function ProfilePhotoSelector({
  mode,
  value,
  onModeChange,
  onChange,
}: ProfilePhotoSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Nettoyage automatique du flux caméra au démontage ou lors du changement de mode
  useEffect(() => {
    if (mode !== 'selfie') {
      stopCameraStream();
    }
  }, [mode, stopCameraStream]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Associe le MediaStream dès que la balise <video> est montée
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setUploadError(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraError(
        'Votre navigateur ou appareil ne permet pas l’accès direct à la caméra. Vous pouvez importer une photo depuis votre appareil ou ignorer cette étape.'
      );
      return;
    }

    stopCameraStream();
    setCameraLoading(true);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const domName = err instanceof DOMException ? err.name : '';
      if (domName === 'NotAllowedError' || domName === 'PermissionDeniedError') {
        setCameraError(
          'Accès à la caméra refusé. Autorisez la caméra dans votre navigateur, importez une photo depuis votre appareil ou ignorez cette étape.'
        );
      } else if (domName === 'NotFoundError' || domName === 'DevicesNotFoundError') {
        setCameraError(
          'Aucune caméra détectée sur cet appareil. Veuillez importer une photo depuis votre appareil ou ignorer cette étape.'
        );
      } else {
        setCameraError(
          'Impossible d’activer la caméra actuellement. Vous pouvez importer une photo depuis votre appareil ou ignorer cette étape.'
        );
      }
    } finally {
      setCameraLoading(false);
    }
  }, [stopCameraStream]);

  const handleSelectMode = (nextMode: PhotoCaptureMode) => {
    setUploadError(null);
    setCameraError(null);
    onModeChange(nextMode);

    if (nextMode === 'selfie') {
      if (!value || value.source !== 'selfie') {
        void startCamera();
      }
    } else if (nextMode === 'skip') {
      stopCameraStream();
      revokePreviewUrl(value?.previewUrl);
      onChange(null);
    } else {
      stopCameraStream();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);
    setCameraError(null);
    setPreviewFailed(false);

    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    revokePreviewUrl(value?.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    onModeChange('upload');
    onChange({
      file,
      previewUrl,
      fileName: file.name,
      mimeType: file.type || 'image/*',
      sizeBytes: file.size,
      isTiff: validation.isTiff,
      source: 'upload',
    });
  };

  const handleCaptureSelfie = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError(
        'Le flux vidéo n’est pas encore prêt. Patientez un instant ou importez une photo.'
      );
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError('Impossible de capturer l’image. Veuillez importer une photo.');
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Échec de la capture selfie. Veuillez réessayer ou importer une photo.');
          return;
        }
        if (blob.size > MAX_FILE_SIZE_BYTES) {
          setCameraError(
            `Le selfie capturé (${formatFileSize(blob.size)}) dépasse la limite de ${MAX_FILE_SIZE_MB} Mo.`
          );
          return;
        }

        const fileName = `selfie-pmb-${Date.now()}.jpg`;
        const capturedFile = new File([blob], fileName, { type: 'image/jpeg' });
        revokePreviewUrl(value?.previewUrl);
        const previewUrl = URL.createObjectURL(capturedFile);

        setPreviewFailed(false);
        stopCameraStream();
        onChange({
          file: capturedFile,
          previewUrl,
          fileName,
          mimeType: 'image/jpeg',
          sizeBytes: capturedFile.size,
          isTiff: false,
          source: 'selfie',
        });
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetakeSelfie = () => {
    revokePreviewUrl(value?.previewUrl);
    onChange(null);
    void startCamera();
  };

  const handleClearPhoto = () => {
    revokePreviewUrl(value?.previewUrl);
    onChange(null);
    setUploadError(null);
    setPreviewFailed(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">Photo de profil</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Importez une photo (max. {MAX_FILE_SIZE_MB} Mo), prenez un selfie par caméra ou ignorez
            cette étape.
          </p>
        </div>

        {/* Sélecteur des 3 modes */}
        <div
          className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[#121212] border border-white/10"
          role="group"
          aria-label="Mode d'ajout de photo de profil"
        >
          <button
            type="button"
            onClick={() => handleSelectMode('upload')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'upload'
                ? 'bg-[#229ED9] text-white'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Importer une photo</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('selfie')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'selfie'
                ? 'bg-[#229ED9] text-white'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Prendre un selfie</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('skip')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'skip'
                ? 'bg-[#262626] text-[#F59E0B] border border-[#F59E0B]/40'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ignorer / Passer</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        id="reg-profile-photo-input"
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.tif,.tiff"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Erreur de taille ou format lors de l'import */}
      {uploadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-red-300"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* MODE 1 : IMPORTER UNE PHOTO */}
      {mode === 'upload' && !value && (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#121212] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#262626] border border-white/10 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5 text-[#229ED9]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Sélectionner une photo depuis votre appareil
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Formats image (JPG, PNG, WEBP, TIFF) · Taille maximale : {MAX_FILE_SIZE_MB} Mo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Choisir un fichier</span>
          </button>
        </div>
      )}

      {/* MODE 2 : PRENDRE UN SELFIE */}
      {mode === 'selfie' && !value && (
        <div className="rounded-xl border border-white/15 bg-[#121212] p-5 space-y-4">
          {cameraError ? (
            <div
              role="alert"
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-xs sm:text-sm text-amber-100 space-y-1">
                  <p className="font-semibold text-white">Caméra indisponible</p>
                  <p className="text-zinc-300">{cameraError}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('upload');
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1b86b9] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Importer une photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#262626] hover:bg-zinc-700 border border-white/15 text-zinc-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Réessayer la caméra</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMode('skip')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-transparent hover:bg-white/[0.06] border border-white/15 text-zinc-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ignorer cette étape</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-7 relative aspect-video rounded-lg overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                />
                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-zinc-300 bg-[#121212]/90">
                    <Camera className="w-6 h-6 text-[#229ED9]" aria-hidden="true" />
                    <span>Activation de la caméra en cours...</span>
                  </div>
                )}
                {!cameraLoading && !cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs text-zinc-400">
                    <Camera className="w-6 h-6 text-zinc-500" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="px-4 py-2 rounded-lg bg-[#229ED9] text-white font-medium hover:bg-[#1b86b9] cursor-pointer"
                    >
                      Démarrer la caméra
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-5 space-y-3">
                <p className="text-sm font-medium text-white">Aperçu caméra en direct</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Placez votre visage au centre du cadre puis cliquez sur « Capturer la photo ».
                  Le flux vidéo s’arrête automatiquement après la prise de vue.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={!cameraActive}
                    onClick={handleCaptureSelfie}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#d98a07] disabled:opacity-50 text-[#121212] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4" aria-hidden="true" />
                    <span>Capturer la photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMode('skip')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Ignorer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3 : IGNORÉ / PASSÉ */}
      {mode === 'skip' && (
        <div className="rounded-xl border border-white/10 bg-[#121212] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkipForward className="w-4 h-4 text-[#F59E0B] shrink-0" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-zinc-300">
              Photo de profil ignorée pour le moment. Vous pouvez revenir en arrière à tout instant
              pour importer une photo ou prendre un selfie.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSelectMode('upload')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ajouter une photo</span>
          </button>
        </div>
      )}

      {/* APERÇU PHOTO SÉLECTIONNÉE OU CAPTURÉE */}
      {value && mode !== 'skip' && (
        <div className="rounded-xl border border-emerald-500/30 bg-[#121212] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#262626] border border-white/15 flex items-center justify-center shrink-0">
              {value.previewUrl && !value.isTiff && !previewFailed ? (
                <img
                  src={value.previewUrl}
                  alt="Aperçu de la photo de profil"
                  referrerPolicy="no-referrer"
                  onError={() => setPreviewFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileImage className="w-6 h-6 text-[#229ED9]" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {value.source === 'selfie' ? 'Selfie capturé' : 'Photo importée'}
                </span>
              </div>
              <p className="text-sm font-medium text-white truncate mt-0.5">{value.fileName}</p>
              <p className="text-xs text-zinc-400 font-mono-tabular">
                {formatFileSize(value.sizeBytes)} · Limite max {MAX_FILE_SIZE_MB} Mo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {value.source === 'selfie' ? (
              <button
                type="button"
                onClick={handleRetakeSelfie}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reprendre la photo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-[#262626] hover:bg-zinc-700 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Remplacer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearPhoto}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
