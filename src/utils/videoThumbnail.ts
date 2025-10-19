/**
 * Extrait la première frame d'une vidéo et la convertit en Blob
 * @param videoFile Le fichier vidéo
 * @returns Promise<Blob> L'image de thumbnail au format JPEG
 */
export async function extractVideoThumbnail(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Configurer le canvas avec les dimensions de la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Aller à 0.5 secondes pour avoir une meilleure frame
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
      try {
        // Dessiner la frame actuelle sur le canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir le canvas en Blob JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
            
            // Nettoyage
            URL.revokeObjectURL(video.src);
          },
          'image/jpeg',
          0.8 // Qualité JPEG
        );
      } catch (error) {
        reject(error);
      }
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };

    // Charger la vidéo
    video.src = URL.createObjectURL(videoFile);
  });
}
