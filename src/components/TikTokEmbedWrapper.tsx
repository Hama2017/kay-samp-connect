import { useEffect, useRef, useState } from 'react';
import { Music } from 'lucide-react';

interface TikTokEmbedWrapperProps {
  url: string;
  width?: number;
}

export default function TikTokEmbedWrapper({ url, width = 325 }: TikTokEmbedWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadTikTokEmbed = async () => {
      try {
        // Vérifier si le script TikTok est déjà chargé
        if (!(window as any).tiktokEmbed) {
          // Charger le script TikTok
          const script = document.createElement('script');
          script.src = 'https://www.tiktok.com/embed.js';
          script.async = true;
          script.onload = () => {
            setIsLoading(false);
          };
          script.onerror = () => {
            setError(true);
            setIsLoading(false);
          };
          document.body.appendChild(script);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading TikTok embed:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    loadTikTokEmbed();
  }, []);

  if (error) {
    return (
      <div className="flex justify-center w-full">
        <div className="relative w-full aspect-[9/16] max-w-[325px]">
          <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#00f2ea] via-[#ff0050] to-[#000000] p-[2px]">
            <div className="bg-background rounded-lg h-full flex flex-col items-center justify-center gap-4 p-8">
              <Music className="h-16 w-16" />
              <div className="text-center space-y-2">
                <p className="font-medium">Vidéo TikTok</p>
                <p className="text-muted-foreground text-sm">Erreur de chargement</p>
              </div>
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium transition-colors"
              >
                Voir sur TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        <div className="relative w-full aspect-[9/16] max-w-[325px] bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  // Extraire l'ID de la vidéo TikTok
  const videoId = url.match(/\/video\/(\d+)/)?.[1];

  return (
    <div ref={containerRef} className="flex justify-center w-full">
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={videoId}
        style={{ maxWidth: `${width}px`, minWidth: `${width}px` }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={url}
          >
            Voir sur TikTok
          </a>
        </section>
      </blockquote>
    </div>
  );
}
