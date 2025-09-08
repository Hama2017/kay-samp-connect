import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostMedia {
  id: string;
  media_url: string;
  media_type: string;
  thumbnail_url?: string;
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

  // Si plusieurs médias, on affiche juste le premier pour l'instant
  const firstMedia = media[0];

  const renderMedia = (mediaItem: PostMedia) => {
    const { media_url, media_type } = mediaItem;

    switch (media_type) {
      case 'image':
        return (
          <img 
            src={media_url}
            alt="Post media" 
            className={cn("rounded-lg w-full object-cover", maxHeight, className)}
          />
        );
      
      case 'gif':
        return (
          <img 
            src={media_url}
            alt="Post GIF" 
            className={cn("rounded-lg w-full object-cover", maxHeight, className)}
          />
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