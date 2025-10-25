import React from "react";

interface TikTokPlayerProps {
  url: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
}

export default function TikTokPlayer({
  url,
  width = 325,
  height = 580,
  autoplay = false,
  controls = false,
  loop = true,
}: TikTokPlayerProps) {
  // Extraire l’ID de la vidéo depuis le lien
  const videoId = url.match(/\/video\/(\d+)/)?.[1];

  if (!videoId) {
    return <p>URL TikTok invalide.</p>;
  }

  // Construire l’URL officielle du lecteur TikTok
  const playerUrl = new URL(`https://www.tiktok.com/player/v1/${videoId}`);
  playerUrl.searchParams.set("autoplay", autoplay ? "1" : "0");
  playerUrl.searchParams.set("loop", loop ? "1" : "0");
  playerUrl.searchParams.set("controls", controls ? "1" : "0");
  playerUrl.searchParams.set("muted", "0"); // tu peux mettre "1" si tu veux le mute par défaut

  return (
    <div
      className="flex justify-center"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
        borderRadius: "12px",
      }}
    >
      <iframe
        src={playerUrl.toString()}
        width={width}
        height={height}
        allow="autoplay; fullscreen"
        allowFullScreen
        title="TikTok Video Player"
        style={{
          border: "none",
        }}
      />
    </div>
  );
}
