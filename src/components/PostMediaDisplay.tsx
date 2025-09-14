import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Youtube, RotateCcw, RotateCw } from "lucide-react";

interface PostMedia {
  id: string;
  media_url: string;
  media_type: string;
  youtube_video_id?: string;
}

interface PostMediaDisplayProps {
  media: PostMedia[];
  className?: string;
  maxHeight?: string;
  showControls?: boolean;
}

const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default function PostMediaDisplay({
  media,
  className,
  maxHeight = "max-h-96",
  showControls = true
}: PostMediaDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [videoThumbnails, setVideoThumbnails] = useState<{[key: string]: string}>({});
  const [mutedState, setMutedState] = useState<{[key: string]: boolean}>({});
  const [playingState, setPlayingState] = useState<{[key: string]: boolean}>({});
  const [showBigControls, setShowBigControls] = useState<{[key: string]: boolean}>({});
  const [currentTime, setCurrentTime] = useState<{[key: string]: number}>({});
  const [duration, setDuration] = useState<{[key: string]: number}>({});
  const [progress, setProgress] = useState<{[key: string]: number}>({});
  const [showControlsState, setShowControlsState] = useState<{[key: string]: boolean}>({});
  const [controlsTimeout, setControlsTimeout] = useState<{[key: string]: NodeJS.Timeout}>({});

  if (!media || media.length === 0) return null;
  const currentMedia = media[currentIndex];

  // Formater le temps en mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour montrer les contrôles temporairement
  const showControlsTemporary = (mediaId: string) => {
    // Afficher les contrôles
    setShowControlsState(prev => ({ ...prev, [mediaId]: true }));
    
    // Annuler le timeout précédent s'il existe
    if (controlsTimeout[mediaId]) {
      clearTimeout(controlsTimeout[mediaId]);
    }
    
    // Programmer la disparition après 3 secondes
    const timeout = setTimeout(() => {
      setShowControlsState(prev => ({ ...prev, [mediaId]: false }));
    }, 3000);
    
    setControlsTimeout(prev => ({ ...prev, [mediaId]: timeout }));
  };

  // Fonction pour masquer les contrôles immédiatement
  const hideControls = (mediaId: string) => {
    setShowControlsState(prev => ({ ...prev, [mediaId]: false }));
    if (controlsTimeout[mediaId]) {
      clearTimeout(controlsTimeout[mediaId]);
    }
  };

  const extractVideoFrame = (videoUrl: string, mediaId: string) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.currentTime = 1;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      setVideoThumbnails(prev => ({ ...prev, [mediaId]: thumbnail }));
    };
  };

  // Mise à jour du temps et de la progression
  const updateVideoProgress = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video) return;

    setCurrentTime(prev => ({ ...prev, [mediaId]: video.currentTime }));
    setDuration(prev => ({ ...prev, [mediaId]: video.duration }));
    
    if (video.duration) {
      const progressPercent = (video.currentTime / video.duration) * 100;
      setProgress(prev => ({ ...prev, [mediaId]: progressPercent }));
    }
  };

  // Gérer le clic sur la barre de progression
  const handleProgressClick = (event: React.MouseEvent, mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video || !video.duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressPercent = (clickX / rect.width) * 100;
    const newTime = (progressPercent / 100) * video.duration;
    
    video.currentTime = newTime;
    setProgress(prev => ({ ...prev, [mediaId]: progressPercent }));
  };

  useEffect(() => {
    media.forEach(item => {
      if (item.media_type === 'video' && !videoThumbnails[item.id]) {
        extractVideoFrame(item.media_url, item.id);
      }
    });
  }, [media]);

  // Ajouter les event listeners pour la progression
  useEffect(() => {
    const intervals: { [key: string]: NodeJS.Timeout } = {};

    media.forEach(item => {
      if (item.media_type === 'video') {
        const video = videoRefs.current[item.id];
        if (video) {
          // Listener pour la durée
          const handleLoadedMetadata = () => {
            setDuration(prev => ({ ...prev, [item.id]: video.duration }));
          };

          video.addEventListener('loadedmetadata', handleLoadedMetadata);

          // Interval pour mettre à jour le temps
          intervals[item.id] = setInterval(() => {
            if (playingState[item.id]) {
              updateVideoProgress(item.id);
            }
          }, 100);
        }
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [media, playingState]);

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleVideoClick = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayingState(prev => ({ ...prev, [mediaId]: true }));
      video.muted = false;
      setMutedState(prev => ({ ...prev, [mediaId]: false }));
      setShowBigControls(prev => ({ ...prev, [mediaId]: false }));
      // Afficher les contrôles pendant 3 secondes au début de la lecture
      showControlsTemporary(mediaId);
    } else {
      video.pause();
      setPlayingState(prev => ({ ...prev, [mediaId]: false }));
      // Afficher les contrôles immédiatement quand on met en pause
      setShowControlsState(prev => ({ ...prev, [mediaId]: true }));
      // Annuler le timeout auto-hide
      if (controlsTimeout[mediaId]) {
        clearTimeout(controlsTimeout[mediaId]);
      }
    }
  };

  // Fonction pour gérer le clic/mouvement sur la vidéo (afficher les contrôles)
  const handleVideoInteraction = (mediaId: string) => {
    const isPlaying = playingState[mediaId];
    if (isPlaying) {
      showControlsTemporary(mediaId);
    }
  };

  const toggleMute = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video) return;
    video.muted = !video.muted;
    setMutedState(prev => ({ ...prev, [mediaId]: video.muted }));
  };

  // Fonction pour reculer de 10 secondes
  const skipBackward = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
    updateVideoProgress(mediaId);
  };

  // Fonction pour avancer de 10 secondes
  const skipForward = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    updateVideoProgress(mediaId);
  };

  const renderMedia = (mediaItem: PostMedia) => {
    const { media_type, media_url, youtube_video_id, id } = mediaItem;

    switch (media_type) {
      case "image":
      case "gif":
        return (
          <img
            src={media_url}
            className={cn("rounded-lg w-full object-contain bg-black", maxHeight, className)}
            alt="media"
          />
        );

      case "youtube":
        const videoId = youtube_video_id || extractYouTubeId(media_url);
        if (!videoId) return <div>Vidéo YouTube invalide</div>;
        const youtubeThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        return (
          <div className="relative">
            <img
              src={youtubeThumbnail}
              className={cn("rounded-lg w-full object-cover bg-black", maxHeight, className)}
              alt="YouTube thumbnail"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          </div>
        );

      case "video":
        const showBig = showBigControls[id] !== false;
        const thumbnail = videoThumbnails[id];
        const isMuted = mutedState[id] ?? true;
        const isPlaying = playingState[id] ?? false;
        const videoCurrentTime = currentTime[id] || 0;
        const videoDuration = duration[id] || 0;
        const videoProgress = progress[id] || 0;

        return (
          <div className="relative w-full" style={{ minHeight: '300px' }}>
            {/* Preview + gros bouton initial */}
            {thumbnail && showBig && (
              <div className="absolute inset-0 z-10 transition-opacity duration-300">
                <img
                  src={thumbnail}
                  className={cn("rounded-lg w-full h-full object-cover", className)}
                  alt="Video preview"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleVideoClick(id); }}
                    className="w-20 h-20 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Vidéo réelle */}
            <video
              ref={(el) => videoRefs.current[id] = el}
              src={media_url}
              className={cn("rounded-lg w-full object-contain bg-black transition-opacity duration-300", maxHeight, className)}
              playsInline
              loop
              preload="metadata"
              onClick={() => handleVideoClick(id)}
              onMouseMove={() => handleVideoInteraction(id)}
              onTouchStart={() => handleVideoInteraction(id)}
              muted={isMuted}
              poster={thumbnail}
            />

            {/* Icône play au centre quand en pause */}
            {!isPlaying && !showBig && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Contrôles avec système temporaire comme YouTube */}
            {!showBig && showControls && (showControlsState[id] || !isPlaying) && (
              <>
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <button 
                    onClick={() => skipBackward(id)} 
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    title="Reculer 10s"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => handleVideoClick(id)} 
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                  </button>
                  <button 
                    onClick={() => skipForward(id)} 
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    title="Avancer 10s"
                  >
                    <RotateCw className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => toggleMute(id)} 
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                </div>

                {/* Temps et barre de progression */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                    {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="absolute bottom-12 left-2 right-2">
                  <div 
                    className="w-full h-3 md:h-1 bg-white/20 rounded-full cursor-pointer md:hover:h-2 transition-all duration-200 flex items-center"
                    onClick={(e) => handleProgressClick(e, id)}
                    onMouseMove={() => showControlsTemporary(id)}
                  >
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-100 relative"
                      style={{ width: `${videoProgress}%` }}
                    >
                      {/* Indicateur circulaire pour mobile */}
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-2 md:h-2 bg-white rounded-full shadow-lg md:opacity-0 md:hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return <div>Media non supporté</div>;
    }
  };

  const renderThumbnail = (item: PostMedia) => {
    if (item.media_type === 'image' || item.media_type === 'gif') {
      return (
        <img 
          src={item.media_url} 
          className="w-full h-full object-cover rounded-md" 
          alt="" 
        />
      );
    } else if (item.media_type === 'youtube') {
      const videoId = item.youtube_video_id || extractYouTubeId(item.media_url);
      const youtubeThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : '';
      return (
        <div className="relative w-full h-full">
          <img src={youtubeThumbnail} className="w-full h-full object-cover rounded-md" alt="" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Youtube className="w-4 h-4 text-red-500" />
          </div>
        </div>
      );
    } else if (item.media_type === 'video') {
      const thumbnail = videoThumbnails[item.id];
      if (thumbnail) {
        return (
          <div className="relative w-full h-full">
            <img src={thumbnail} className="w-full h-full object-cover rounded-md" alt="" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-3 h-3 text-white bg-black/50 rounded-full p-0.5" />
            </div>
          </div>
        );
      } else {
        return (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center rounded-md">
            <Play className="w-4 h-4 text-white" />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="w-full mb-4">
      {renderMedia(currentMedia)}

      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-16 rounded-lg border-2 relative overflow-hidden",
                index === currentIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              )}
            >
              {renderThumbnail(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}