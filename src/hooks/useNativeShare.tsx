import { Share } from '@capacitor/share';

interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export function useNativeShare() {
  const share = async (options: ShareOptions) => {
    try {
      if (navigator.share) {
        // Web Share API (texte + URL)
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
      } else {
        // Capacitor Share (texte + URL)
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || 'Partager via',
        });
      }
    } catch (error) {
      console.error('Erreur lors du partage :', error);
    }
  };

  return { share };
}
