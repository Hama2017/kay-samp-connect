import { useState } from "react";
import { Play, Youtube, Pause, Volume2, VolumeX } from "lucide-react";
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
  maxHeight = "max-h-96",
  showControls = true
}: PostMediaDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoPreviews, setVideoPreviews] = useState<{[key: string]: string}>({});
  const [showBigControls, setShowBigControls] = useState<{[key: string]: boolean}>({});

  if (!media || media.length === 0) return null;

  console.log('PostMediaDisplay rendering media:', media);

  const currentMedia = media[currentIndex];

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const generateVideoPreview = (videoElement: HTMLVideoElement, mediaId: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    videoElement.currentTime = 1; // Aller à 1 seconde pour éviter le noir
    
    videoElement.onloadeddata = () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);
      
      const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
      setVideoPreviews(prev => ({ ...prev, [mediaId]: previewUrl }));
      videoElement.currentTime = 0; // Remettre au début
    };
  };

  const handleVideoClick = (videoElement: HTMLVideoElement, mediaId: string) => {
    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    } else {
      videoElement.play();
      setIsPlaying(true);
      // Faire disparaître les gros contrôles au premier play
      setShowBigControls(prev => ({ ...prev, [mediaId]: false }));
    }
  };

  const toggleMute = (videoElement: HTMLVideoElement) => {
    videoElement.muted = !videoElement.muted;
    setIsMuted(videoElement.muted);
  };

  const renderMedia = (mediaItem: PostMedia) => {
    const { media_url, media_type, youtube_video_id } = mediaItem;

    switch (media_type) {
      case 'gif':
      case 'image':
        return (
          <div className="w-full">
            <img
              src={media_url}
              alt="Post media"
              className={cn("rounded-lg w-full object-contain bg-black", maxHeight, className)}
              style={{ minHeight: '200px' }}
              loading="lazy"
              onError={(e) => {
                console.error('Media loading error:', media_url);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );

      case 'youtube':
        const videoId = youtube_video_id || extractYouTubeId(media_url);
        if (!videoId) {
          return (
            <div className={cn("rounded-lg w-full bg-muted flex items-center justify-center min-h-64", className)}>
              <div className="text-center">
                <Youtube className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <span className="text-muted-foreground">Vidéo YouTube invalide</span>
              </div>
            </div>
          );
        }
        return (
          <div className={cn("rounded-lg overflow-hidden w-full", className)} style={{ minHeight: '300px' }}>
            <LiteYouTubeEmbed
              id={videoId}
              title="YouTube video"
              wrapperClass="yt-lite rounded-lg"
              playerClass="lty-playbtn"
            />
          </div>
        );

      case 'video':
        const hasPreview = videoPreviews[mediaItem.id];
        const showBig = showBigControls[mediaItem.id] !== false; // Afficher par défaut
        
        return (
          <div className="relative w-full group" style={{ minHeight: '300px' }}>
            <video
              ref={(el) => {
                if (el) {
                  el.onplay = () => setIsPlaying(true);
                  el.onpause = () => setIsPlaying(false);
                  el.onvolumechange = () => setIsMuted(el.muted);
                  
                  // Générer preview si pas encore fait
                  if (!videoPreviews[mediaItem.id]) {
                    generateVideoPreview(el, mediaItem.id);
                  }
                }
              }}
              src={media_url}
              poster={hasPreview ? videoPreviews[mediaItem.id] : undefined}
              className={cn("rounded-lg w-full object-cover", maxHeight, className)}
              style={{ minHeight: '300px' }}
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              onClick={(e) => handleVideoClick(e.currentTarget, mediaItem.id)}
              data-video-id={mediaItem.id}
            />
            
            {/* Gros contrôles initiaux - disparaissent après premier clic */}
            {showBig && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-300 rounded-lg flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = e.currentTarget.closest('.relative');
                      const video = container?.querySelector('video') as HTMLVideoElement;
                      if (video) handleVideoClick(video, mediaItem.id);
                    }}
                    className="flex items-center justify-center w-16 h-16 bg-black/70 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
                  >
                    <Play className="w-6 h-6 text-white ml-1" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = e.currentTarget.closest('.relative');
                      const video = container?.querySelector('video') as HTMLVideoElement;
                      if (video) {
                        toggleMute(video);
                        setShowBigControls(prev => ({ ...prev, [mediaItem.id]: false }));
                      }
                    }}
                    className="flex items-center justify-center w-12 h-12 bg-black/70 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Contrôles discrets en bas - apparaissent après premier clic */}
            {!showBig && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const container = e.currentTarget.closest('.relative');
                        const video = container?.querySelector('video') as HTMLVideoElement;
                        if (video) handleVideoClick(video, mediaItem.id);
                      }}
                      className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const container = e.currentTarget.closest('.relative');
                        const video = container?.querySelector('video') as HTMLVideoElement;
                        if (video) toggleMute(video);
                      }}
                      className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  
                  <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                    Vidéo
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className={cn("rounded-lg w-full bg-muted flex items-center justify-center min-h-64", className)}>
            <span className="text-muted-foreground">Media non supporté</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="w-full">
        {renderMedia(currentMedia)}
      </div>
      
      {/* Navigation pour médias multiples */}
      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
              className={cn(
                "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                index === currentIndex 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-muted'
              )}
            >
              {item.media_type === 'image' || item.media_type === 'gif' ? (
                <img
                  src={item.media_url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}