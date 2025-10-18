import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export function useNativeShare() {
  const { toast } = useToast();

  const share = async (data: {
    title: string;
    text: string;
    url: string;
  }) => {
    try {
      // Check if we're on a native platform
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: data.title,
          text: data.text,
          url: data.url,
          dialogTitle: 'Partager',
        });
      } 
      // Try Web Share API
      else if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
      } 
      // Fallback to clipboard
      else {
        const shareText = `${data.text}\n\n${data.url}`;
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Lien copié !",
          description: "Le lien a été copié dans le presse-papier",
        });
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error?.message && !error.message.includes('cancel')) {
        toast({
          title: "Erreur",
          description: "Impossible de partager le contenu",
          variant: "destructive",
        });
      }
    }
  };

  return { share };
}
