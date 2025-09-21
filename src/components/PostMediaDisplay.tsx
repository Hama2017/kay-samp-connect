import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Youtube, RotateCcw, RotateCw, Maximize, Minimize } from "lucide-react";

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
  const videoContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [videoThumbnails, setVideoThumbnails] = useState<{[key: string]: string}>({});
  const [mutedState, setMutedState] = useState<{[key: string]: boolean}>({});
  const [playingState, setPlayingState] = useState<{[key: string]: boolean}>({});
  const [showBigControls, setShowBigControls] = useState<{[key: string]: boolean}>({});
  const [currentTime, setCurrentTime] = useState<{[key: string]: number}>({});
  const [duration, setDuration] = useState<{[key: string]: number}>({});
  const [progress, setProgress] = useState<{[key: string]: number}>({});
  const [showControlsState, setShowControlsState] = useState<{[key: string]: boolean}>({});
  const [controlsTimeout, setControlsTimeout] = useState<{[key: string]: NodeJS.Timeout}>({});
  const [isFullscreen, setIsFullscreen] = useState<{[key: string]: boolean}>({});
  const [isDragging, setIsDragging] = useState<{[key: string]: boolean}>({});

  if (!media || media.length === 0) return null;
  const currentMedia = media[currentIndex];

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporary = (mediaId: string) => {
    setShowControlsState(prev => ({ ...prev, [mediaId]: true }));
    if (controlsTimeout[mediaId]) {
      clearTimeout(controlsTimeout[mediaId]);
    }
    const timeout = setTimeout(() => {
      setShowControlsState(prev => ({ ...prev, [mediaId]: false }));
    }, 3000);
    setControlsTimeout(prev => ({ ...prev, [mediaId]: timeout }));
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

  const handleProgressClick = (event: React.MouseEvent | React.TouchEvent, mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video || !video.duration) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    let clickX: number;
    
    if ('touches' in event) {
      clickX = event.touches[0].clientX - rect.left;
    } else {
      clickX = event.clientX - rect.left;
    }
    
    const progressPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newTime = (progressPercent / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(prev => ({ ...prev, [mediaId]: progressPercent }));
  };

  const handleProgressStart = (event: React.MouseEvent | React.TouchEvent, mediaId: string) => {
    setIsDragging(prev => ({ ...prev, [mediaId]: true }));
    handleProgressClick(event, mediaId);
  };

  const handleProgressMove = (event: React.MouseEvent | React.TouchEvent, mediaId: string) => {
    if (!isDragging[mediaId]) return;
    event.preventDefault();
    handleProgressClick(event, mediaId);
  };

  const handleProgressEnd = (mediaId: string) => {
    setIsDragging(prev => ({ ...prev, [mediaId]: false }));
  };

  const toggleFullscreen = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    const container = videoContainerRefs.current[mediaId];
    if (!video || !container) return;

    // Pour mobile, utiliser l'API vidéo native
    if (video.requestFullscreen) {
      if (!document.fullscreenElement) {
        video.requestFullscreen().then(() => {
          setIsFullscreen(prev => ({ ...prev, [mediaId]: true }));
        }).catch((err) => {
          console.error(`Erreur fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(prev => ({ ...prev, [mediaId]: false }));
        });
      }
    } 
    // iOS Safari
    else if ((video as any).webkitEnterFullscreen) {
      (video as any).webkitEnterFullscreen();
      setIsFullscreen(prev => ({ ...prev, [mediaId]: true }));
    }
    // Fallback pour autres navigateurs mobiles
    else if ((video as any).webkitRequestFullscreen) {
      (video as any).webkitRequestFullscreen();
      setIsFullscreen(prev => ({ ...prev, [mediaId]: true }));
    }
    else if ((video as any).mozRequestFullScreen) {
      (video as any).mozRequestFullScreen();
      setIsFullscreen(prev => ({ ...prev, [mediaId]: true }));
    }
    else if ((video as any).msRequestFullscreen) {
      (video as any).msRequestFullscreen();
      setIsFullscreen(prev => ({ ...prev, [mediaId]: true }));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      Object.keys(videoContainerRefs.current).forEach(mediaId => {
        if (!document.fullscreenElement) {
          setIsFullscreen(prev => ({ ...prev, [mediaId]: false }));
        }
      });
    };

    // Écouter tous les événements de changement de plein écran
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    media.forEach(item => {
      if (item.media_type === 'video' && !videoThumbnails[item.id]) {
        extractVideoFrame(item.media_url, item.id);
      }
    });
  }, [media]);

  useEffect(() => {
    const intervals: { [key: string]: NodeJS.Timeout } = {};
    media.forEach(item => {
      if (item.media_type === 'video') {
        const video = videoRefs.current[item.id];
        if (video) {
          const handleLoadedMetadata = () => {
            setDuration(prev => ({ ...prev, [item.id]: video.duration }));
          };
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
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
      showControlsTemporary(mediaId);
    } else {
      video.pause();
      setPlayingState(prev => ({ ...prev, [mediaId]: false }));
      setShowControlsState(prev => ({ ...prev, [mediaId]: true }));
      if (controlsTimeout[mediaId]) {
        clearTimeout(controlsTimeout[mediaId]);
      }
    }
  };

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

  const skipBackward = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
    updateVideoProgress(mediaId);
  };

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
        return (
          <div className="relative w-full aspect-video">
            <iframe
              className={cn("rounded-lg w-full h-full", className)}
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
          <div 
            ref={(el) => videoContainerRefs.current[id] = el}
            className="relative w-full" 
            style={{ minHeight: '300px' }}
          >
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
                    className="w-20 h-20 bg-[#1f9463]/80 hover:bg-[#43ca92]/90 rounded-full flex items-center justify-center transition-colors shadow-lg border-2 border-white/20"
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </button>
                </div>
              </div>
            )}

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
              controls={false}
            />

            {!isPlaying && !showBig && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-16 h-16 bg-[#1f9463]/90 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}

            {!showBig && showControls && (showControlsState[id] || !isPlaying) && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-2 left-2 flex gap-2 z-30">
                  <button 
                    onClick={() => skipBackward(id)} 
                    className="w-8 h-8 bg-[#1f9463]/90 hover:bg-[#43ca92] rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-white/20 backdrop-blur-sm"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => handleVideoClick(id)} 
                    className="w-8 h-8 bg-[#1f9463]/90 hover:bg-[#43ca92] rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-white/20 backdrop-blur-sm"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                  </button>
                  <button 
                    onClick={() => skipForward(id)} 
                    className="w-8 h-8 bg-[#1f9463]/90 hover:bg-[#43ca92] rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-white/20 backdrop-blur-sm"
                  >
                    <RotateCw className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => toggleMute(id)} 
                    className="w-8 h-8 bg-[#1f9463]/90 hover:bg-[#43ca92] rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-white/20 backdrop-blur-sm"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                </div>

                <div className="absolute bottom-2 right-2 flex items-center gap-2 z-30">
                  <button 
                    onClick={() => toggleFullscreen(id)} 
                    className="w-8 h-8 bg-[#1f9463]/90 hover:bg-[#43ca92] rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-white/20 backdrop-blur-sm"
                  >
                    {isFullscreen[id] ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
                  </button>
                  <span className="text-white text-xs bg-[#1f9463]/90 px-2 py-1 rounded shadow-lg border border-white/20 backdrop-blur-sm">
                    {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>

                <div className="absolute bottom-12 left-2 right-2 z-30">
                  <div 
                    className="w-full h-3 md:h-1 bg-black/40 border border-white/20 rounded-full cursor-pointer md:hover:h-2 transition-all duration-200 flex items-center shadow-lg backdrop-blur-sm touch-none"
                    onMouseDown={(e) => handleProgressStart(e, id)}
                    onMouseMove={(e) => handleProgressMove(e, id)}
                    onMouseUp={() => handleProgressEnd(id)}
                    onMouseLeave={() => handleProgressEnd(id)}
                    onTouchStart={(e) => handleProgressStart(e, id)}
                    onTouchMove={(e) => handleProgressMove(e, id)}
                    onTouchEnd={() => handleProgressEnd(id)}
                  >
                    <div 
                      className="h-full bg-[#1f9463] hover:bg-[#43ca92] rounded-full transition-all duration-100 relative shadow-sm"
                      style={{ width: `${videoProgress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-2 md:h-2 bg-[#1f9463] border-2 border-white rounded-full shadow-lg transition-opacity" />
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
                index === currentIndex ? 'border-[#1f9463]' : 'border-transparent hover:border-[#43ca92]'
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