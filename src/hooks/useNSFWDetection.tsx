import { useState, useCallback, useRef } from 'react';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';
import { extractVideoThumbnail } from '@/utils/videoThumbnail';

interface NSFWPrediction {
  className: string;
  probability: number;
}

interface NSFWResult {
  isNSFW: boolean;
  predictions: NSFWPrediction[];
  message: string;
}

export function useNSFWDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const modelRef = useRef<nsfwjs.NSFWJS | null>(null);

  const loadModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    
    try {
      // Charger le modèle (utilise le modèle MobileNet par défaut)
      const model = await nsfwjs.load();
      modelRef.current = model;
      return model;
    } catch (error) {
      console.error('Erreur lors du chargement du modèle NSFW:', error);
      throw new Error('Impossible de charger le modèle de détection');
    }
  }, []);

  const analyzeImage = useCallback(async (file: File): Promise<NSFWResult> => {
    setIsAnalyzing(true);

    try {
      // Charger le modèle
      const model = await loadModel();

      // Créer une image HTML pour l'analyse
      const img = document.createElement('img');
      const imageUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Analyser l'image
      const predictions = await model.classify(img);
      URL.revokeObjectURL(imageUrl);

      // Vérifier si le contenu est inapproprié
      // On considère NSFW si Porn > 0.6 ou Hentai > 0.6 ou Sexy > 0.8
      const porn = predictions.find(p => p.className === 'Porn')?.probability || 0;
      const hentai = predictions.find(p => p.className === 'Hentai')?.probability || 0;
      const sexy = predictions.find(p => p.className === 'Sexy')?.probability || 0;

      const isNSFW = porn > 0.6 || hentai > 0.6 || sexy > 0.8;

      return {
        isNSFW,
        predictions: predictions.map(p => ({
          className: p.className,
          probability: p.probability
        })),
        message: isNSFW 
          ? 'Ce contenu semble inapproprié et ne peut pas être uploadé.'
          : 'Contenu validé'
      };

    } catch (error) {
      console.error('Erreur lors de l\'analyse NSFW:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [loadModel]);

  const analyzeVideo = useCallback(async (file: File): Promise<NSFWResult> => {
    setIsAnalyzing(true);

    try {
      // Extraire une frame de la vidéo
      const thumbnailBlob = await extractVideoThumbnail(file);
      const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });

      // Analyser la frame extraite
      const result = await analyzeImage(thumbnailFile);

      return result;

    } catch (error) {
      console.error('Erreur lors de l\'analyse vidéo NSFW:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeImage]);

  const analyzeFile = useCallback(async (file: File): Promise<NSFWResult> => {
    if (file.type.startsWith('image/')) {
      return analyzeImage(file);
    } else if (file.type.startsWith('video/')) {
      return analyzeVideo(file);
    } else {
      throw new Error('Type de fichier non supporté pour l\'analyse');
    }
  }, [analyzeImage, analyzeVideo]);

  return {
    analyzeFile,
    analyzeImage,
    analyzeVideo,
    isAnalyzing
  };
}
