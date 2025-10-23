import imageCompression from 'browser-image-compression';

/**
 * Options de compression d'images
 */
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Taille max après compression: 1MB
  maxWidthOrHeight: 1920, // Résolution max: 1920px
  useWebWorker: true,
  fileType: 'image/webp' as const, // Conversion en WebP
  initialQuality: 0.8, // Qualité initiale
};

/**
 * Options de compression pour les avatars (plus petits)
 */
const AVATAR_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.3, // 300KB max
  maxWidthOrHeight: 512, // 512px max
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.85,
};

/**
 * Limites de taille strictes AVANT compression
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB max pour images
  video: 50 * 1024 * 1024, // 50MB max pour vidéos
  avatar: 5 * 1024 * 1024,  // 5MB max pour avatars
};

/**
 * Compresse une image et la convertit en WebP
 * @param file Fichier image original
 * @param options Options de compression (optionnel)
 * @returns Fichier compressé en WebP
 */
export async function compressImage(
  file: File,
  options = IMAGE_COMPRESSION_OPTIONS
): Promise<File> {
  try {
    console.log('🖼️ Compression image:', {
      name: file.name,
      sizeBefore: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });

    // Compresser et convertir en WebP
    const compressedFile = await imageCompression(file, options);

    // Renommer avec extension .webp
    const newFileName = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
    const webpFile = new File([compressedFile], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    console.log('✅ Compression terminée:', {
      name: webpFile.name,
      sizeAfter: `${(webpFile.size / 1024 / 1024).toFixed(2)} MB`,
      reduction: `${(((file.size - webpFile.size) / file.size) * 100).toFixed(1)}%`
    });

    return webpFile;
  } catch (error) {
    console.error('❌ Erreur compression image:', error);
    throw new Error('Impossible de compresser l\'image');
  }
}

/**
 * Compresse un avatar (optimisé pour petites tailles)
 * @param file Fichier image avatar
 * @returns Fichier compressé en WebP
 */
export async function compressAvatar(file: File): Promise<File> {
  return compressImage(file, AVATAR_COMPRESSION_OPTIONS);
}

/**
 * Valide la taille d'un fichier selon son type
 * @param file Fichier à valider
 * @param fileType Type de fichier ('image', 'video', 'avatar')
 * @returns true si valide, sinon lance une erreur
 */
export function validateFileSize(
  file: File,
  fileType: 'image' | 'video' | 'avatar'
): boolean {
  const limit = FILE_SIZE_LIMITS[fileType];
  const sizeMB = file.size / 1024 / 1024;
  const limitMB = limit / 1024 / 1024;

  if (file.size > limit) {
    throw new Error(
      `Fichier trop volumineux. Taille: ${sizeMB.toFixed(1)}MB. Limite: ${limitMB}MB`
    );
  }

  return true;
}

/**
 * Valide et compresse une image
 * @param file Fichier image
 * @param isAvatar Si c'est un avatar
 * @returns Fichier validé et compressé
 */
export async function processImage(
  file: File,
  isAvatar = false
): Promise<File> {
  // Valider le type
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // Valider la taille AVANT compression
  validateFileSize(file, isAvatar ? 'avatar' : 'image');

  // Compresser
  return isAvatar ? compressAvatar(file) : compressImage(file);
}

/**
 * Valide une vidéo
 * @param file Fichier vidéo
 */
export function validateVideo(file: File): boolean {
  // Valider le type
  if (!file.type.startsWith('video/')) {
    throw new Error('Le fichier doit être une vidéo');
  }

  // Valider la taille
  validateFileSize(file, 'video');

  return true;
}
