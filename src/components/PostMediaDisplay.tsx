import { Play, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

interface PostMedia {
  id: string;
  media_url: string;
  media_type: string;
  thumbnail_url?: string;
  youtube_video_id?: string;
}

interface PostMediaDisplayProps {
  media: PostMedia[];
  className?: string;
  maxHeight?: string;
  showControls?: boolean;
}

export default function PostMediaDisplay({ 
  media, 
  className, 
  maxHeight = "h-48", 
  showControls = true 
}: PostMediaDisplayProps) {
  if (!media || media.length === 0) return null;

  console.log('PostMediaDisplay rendering media:', media);
  
  // Si plusieurs médias, on affiche juste le premier pour l'instant
  const firstMedia = media[0];

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderMedia = (mediaItem: PostMedia) => {
    const { media_url, media_type, youtube_video_id } = mediaItem;

    switch (media_type) {
      case 'gif':
      case 'image':
        return (
          <img 
            src={media_url}
            alt="Post media" 
            className={cn("rounded-lg w-full object-cover", maxHeight, className)}
            loading="lazy"
            onError={(e) => {
              console.error('Media loading error:', media_url);
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      
      case 'youtube':
        const videoId = youtube_video_id || extractYouTubeId(media_url);
        if (!videoId) {
          return (
            <div className={cn("rounded-lg w-full bg-muted flex items-center justify-center", maxHeight, className)}>
              <div className="text-center">
                <Youtube className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <span className="text-muted-foreground">Vidéo YouTube invalide</span>
              </div>
            </div>
          );
        }
        return (
          <div className={cn("rounded-lg overflow-hidden", className)}>
            <LiteYouTubeEmbed
              id={videoId}
              title="YouTube video"
              wrapperClass="yt-lite rounded-lg"
              playerClass="lty-playbtn"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="relative">
            <video 
              src={media_url}
              className={cn("rounded-lg w-full object-cover", maxHeight, className)}
              controls={showControls}
              muted
              loop
              playsInline
            />
            {!showControls && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <Play className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className={cn("rounded-lg w-full bg-muted flex items-center justify-center", maxHeight, className)}>
            <span className="text-muted-foreground">Media non supporté</span>
          </div>
        );
    }
  };

  return (
    <div className="mb-3">
      {renderMedia(firstMedia)}
      {media.length > 1 && (
        <div className="text-xs text-muted-foreground mt-2">
          +{media.length - 1} autres médias
        </div>
      )}
    </div>
  );
}