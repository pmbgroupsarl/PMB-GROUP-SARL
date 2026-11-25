export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 25 Mo

export type MemberGender = 'Femme' | 'Homme';
export type PhotoCaptureMode = 'upload' | 'selfie' | 'skip';

export interface MediaFileValue {
  file: File | null;
  previewUrl: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  isTiff: boolean;
  source: 'upload' | 'selfie';
}

export const PHOTO_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
] as const;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : '';
}

export function isTiffFile(fileName: string, mimeType: string): boolean {
  const ext = getFileExtension(fileName);
  const mime = mimeType.toLowerCase();
  return ext === '.tif' || ext === '.tiff' || mime === 'image/tiff' || mime === 'image/x-tiff';
}

export type ValidationResult =
  | { valid: true; isTiff: boolean }
  | { valid: false; error: string };

export function validatePhotoFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Le fichier « ${file.name} » (${formatFileSize(file.size)}) dépasse la taille maximale autorisée de ${MAX_FILE_SIZE_MB} Mo.`,
    };
  }

  const ext = getFileExtension(file.name);
  const mime = (file.type || '').toLowerCase();
  const hasAllowedExt = (PHOTO_ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
  const hasAllowedMime = mime.startsWith('image/');

  if (!hasAllowedExt && !hasAllowedMime) {
    return {
      valid: false,
      error: `Format de photo non reconnu pour « ${file.name} ». Veuillez sélectionner une image (JPG, PNG, WEBP, TIFF).`,
    };
  }

  return {
    valid: true,
    isTiff: isTiffFile(file.name, mime),
  };
}

export function revokePreviewUrl(url: string | null | undefined): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function fileToCompactDataUrl(file: File): Promise<string | null> {
  if (isTiffFile(file.name, file.type)) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      resolve(result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function normalizeNineDigitPhone(input: string): {
  digits: string;
  hadNonDigits: boolean;
  hadOverflow: boolean;
} {
  const onlyDigits = input.replace(/\D/g, '');
  const hadNonDigits = /[^\d\s]/.test(input);
  const hadOverflow = onlyDigits.length > 9;
  return {
    digits: onlyDigits.slice(0, 9),
    hadNonDigits,
    hadOverflow,
  };
}

export function formatNineDigitsDisplay(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}

export function validateNineDigitPhone(digits: string, dialCode: string): string | null {
  if (digits.length === 0) {
    return `Veuillez saisir votre numéro de téléphone à 9 chiffres après l'indicatif ${dialCode}.`;
  }
  if (!/^\d{9}$/.test(digits)) {
    return `Le numéro après l'indicatif ${dialCode} doit contenir exactement 9 chiffres (${digits.length}/9 saisis).`;
  }
  return null;
}
