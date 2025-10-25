import React, { useEffect, useRef, useState } from "react";

interface TikTokPlayerProps {
  url: string;
  width?: number;
  height?: number;
}

export default function TikTokPlayer({
  url,
  width = 325,
  height = 574,
}: TikTokPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoData, setVideoData] = useState<{
    videoId: string;
    fullUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  // Utiliser oEmbed pour résoudre l'URL complète
  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoading(true);
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const response = await fetch(oembedUrl);
        const data = await response.json();
        
        console.log("oEmbed Response:", data);
        
        // Extraire l'URL complète du HTML retourné
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.html, 'text/html');
        const blockquote = doc.querySelector('blockquote');
        const fullUrl = blockquote?.getAttribute('cite') || '';
        const videoId = blockquote?.getAttribute('data-video-id') || '';
        
        console.log("Full URL:", fullUrl);
        console.log("Video ID:", videoId);
        
        if (fullUrl && videoId) {
          setVideoData({ videoId, fullUrl });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données TikTok:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [url]);

  useEffect(() => {
    if (!containerRef.current || !videoData) return;

    // Créer le blockquote avec les données résolues
    containerRef.current.innerHTML = `
      <blockquote 
        class="tiktok-embed"
        cite="${videoData.fullUrl}"
        data-video-id="${videoData.videoId}"
        style="max-width: 320px; border-radius: 12px; overflow: hidden; margin: 0 auto;">
        <section></section>
      </blockquote>
    `;

    // Charger le script d'embed
    let script: HTMLScriptElement | null = null;
    if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
      script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      
      // Détecter quand le script est chargé
      script.onload = () => {
        setTimeout(() => setEmbedLoaded(true), 1000);
      };
    } else {
      // Script déjà présent
      setTimeout(() => setEmbedLoaded(true), 1000);
    }

    return () => {
      if (script) script.remove();
    };
  }, [videoData, width]);

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      {/* Skeleton qui reste jusqu'à ce que TikTok soit chargé */}
      {(!embedLoaded || isLoading) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            backgroundColor: '#0a0a0a',
            borderRadius: '12px',
            zIndex: 10
          }}
        >
          {/* Logo TikTok animé */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #ff0050, #00f2ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 2s linear infinite'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#0a0a0a'
            }} />
          </div>
          
          <p style={{ 
            color: '#ffffff', 
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            margin: 0
          }}>
            Chargement TikTok...
          </p>
          
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {/* Container TikTok */}
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          opacity: embedLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
}