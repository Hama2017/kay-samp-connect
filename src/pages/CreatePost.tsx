import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { X, Image, Video, Play, FileImage, Youtube, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { usePosts } from "@/hooks/usePosts";
import { useSpaces } from "@/hooks/useSpaces";
import { useAuth } from "@/contexts/AuthContext";
import GifSelector from "@/components/GifSelector";

export default function CreatePost() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { createPost, isLoading } = usePosts();
  const { getSpaceById } = useSpaces();
  
  // Déterminer si on est dans un espace spécifique
  const isInSpace = Boolean(spaceId);
  const spaceName = location.state?.spaceName || "";

  const [formData, setFormData] = useState({
    content: "",
    selectedFiles: [] as any[],
    categories: [] as string[],
  });
  
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [showTiktokInput, setShowTiktokInput] = useState(false);
  
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentSpace, setCurrentSpace] = useState<any>(null);
  const [isGifSelectorOpen, setIsGifSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load space details if in a space
  useState(() => {
    if (spaceId) {
      getSpaceById(spaceId).then(space => {
        setCurrentSpace(space);
      }).catch(console.error);
    }
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [formData.content]);

  const handleInputChange = (field: string, value: string) => {
    // Limiter le contenu à 15000 caractères
    if (field === 'content' && value.length > 15000) {
      toast.error("Le contenu ne peut pas dépasser 15 000 caractères");
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatHashtags = (text: string) => {
    return text.replace(/#(\w+)/g, '<span style="color: hsl(var(--primary)); font-weight: 600;">#$1</span>');
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const filesArray = Array.from(files);
    
    // Accepter tous les fichiers
    setFormData(prev => ({ ...prev, selectedFiles: filesArray }));
    
    // Create preview URLs
    const urls = filesArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]); // Clean up memory
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleGifSelect = (gifUrl: string) => {
    console.log('GIF sélectionné:', gifUrl);
    
    // Créer un objet fichier simple pour le GIF
    const gifFile = {
      name: `gif-${Date.now()}.gif`,
      type: 'image/gif',
      size: 0,
      url: gifUrl,
      isGifUrl: true
    };
    
    console.log('Ajout du GIF:', gifFile);
    
    setFormData(prev => ({ 
      ...prev, 
      selectedFiles: [...prev.selectedFiles, gifFile as any] 
    }));
    
    setPreviewUrls(prev => [...prev, gifUrl]);
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYouTubeAdd = () => {
    if (!youtubeUrl.trim()) return;
    
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      toast.error("Lien YouTube invalide");
      return;
    }

    const youtubeFile = {
      name: `youtube-${Date.now()}`,
      type: 'youtube',
      size: 0,
      url: youtubeUrl,
      videoId: videoId,
      isYouTubeUrl: true
    };

    setFormData(prev => ({ 
      ...prev, 
      selectedFiles: [...prev.selectedFiles, youtubeFile as any] 
    }));
    
    setPreviewUrls(prev => [...prev, `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`]);
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  };

  const extractTikTokId = (url: string) => {
    // Formats possibles:
    // https://www.tiktok.com/@username/video/1234567890
    // https://vm.tiktok.com/ZSxxxxx/
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : url;
  };

  const handleTikTokAdd = () => {
    if (!tiktokUrl.trim()) return;
    
    if (!tiktokUrl.includes('tiktok.com')) {
      toast.error("Lien TikTok invalide");
      return;
    }

    const videoId = extractTikTokId(tiktokUrl);

    const tiktokFile = {
      name: `tiktok-${Date.now()}`,
      type: 'tiktok',
      size: 0,
      url: tiktokUrl,
      videoId: videoId,
      isTikTokUrl: true
    };

    setFormData(prev => ({ 
      ...prev, 
      selectedFiles: [...prev.selectedFiles, tiktokFile as any] 
    }));
    
    // Utiliser une icône TikTok comme preview
    setPreviewUrls(prev => [...prev, 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png']);
    setTiktokUrl("");
    setShowTiktokInput(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error("Veuillez écrire quelque chose");
      return;
    }

    if (!user) {
      toast.error("Vous devez être connecté pour publier");
      return;
    }

    try {
      // Extract hashtags from content
      const hashtags = formData.content.match(/#\w+/g) || [];
      
      const newPost = await createPost({
        content: formData.content,
        space_id: spaceId,
        hashtags,
        categories: formData.categories.length > 0 ? formData.categories : undefined,
        media_files: formData.selectedFiles.length > 0 ? formData.selectedFiles : undefined
      });

      // Rediriger selon le contexte
      if (newPost?.id) {
        toast.success("Publication créée avec succès");
        
        if (spaceId) {
          // Rediriger vers la SAMP Zone
          navigate(`/space/${spaceId}`);
        } else {
          // Rediriger vers le profil de l'utilisateur
          navigate(`/user/${user.profile?.username}`);
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Wrapper with scroll */}
      <div className="flex-1 overflow-y-auto">
      {/* Header épuré */}
      <div className="sticky top-0 z-50 bg-background border-b safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            Annuler
          </Button>
          
          {isInSpace && currentSpace && (
            <div className="text-sm text-muted-foreground">
              Publication dans <span className="font-medium text-foreground">{currentSpace.name}</span>
            </div>
          )}
          
          <Button 
            onClick={() => handleSubmit()}
            className="px-6 font-medium"
            disabled={
              !formData.content.trim() || 
              isLoading ||
              (isInSpace && currentSpace && currentSpace.categories && currentSpace.categories.length > 1 && formData.categories.length === 0)
            }
          >
            {isLoading ? "Publication..." : "Publier"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="p-4">
          {/* User Avatar and Input */}
          <div className="flex gap-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user?.profile?.profile_picture_url} />
              <AvatarFallback>
                {user?.profile?.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Quoi de neuf ?"
                  className="min-h-[150px] text-lg border-none shadow-none resize-none focus-visible:ring-0 p-3 bg-transparent relative z-10 overflow-hidden"
                  style={{
                    lineHeight: "1.5",
                    height: 'auto'
                  }}
                />
                {/* Compteur de caractères */}
                <div className={`text-xs text-right px-3 mt-1 ${formData.content.length > 14000 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                  {formData.content.length.toLocaleString()} / 15 000 caractères
                </div>
                {/* Visual indicator for hashtags */}
                {formData.content.includes('#') && (
                  <div className="text-xs text-muted-foreground mt-2 px-3">
                    Les hashtags apparaîtront en{" "}
                    <span className="text-primary font-semibold">vert</span> dans votre post
                  </div>
                )}
              </div>
              
              {/* File Upload Area with Preview */}
              {formData.selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {formData.selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-xl overflow-hidden relative">
                       {file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.gif') ? (
                          <img 
                            src={previewUrls[index]} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : file.type === 'youtube' ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={previewUrls[index]} 
                              alt="YouTube video thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Youtube className="h-8 w-8 text-red-500" />
                            </div>
                          </div>
                        ) : file.type === 'tiktok' ? (
                          <div className="relative w-full h-full bg-black">
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                              <Music className="h-10 w-10 text-white" />
                              <span className="text-xs text-white/80">Vidéo TikTok</span>
                            </div>
                          </div>
                        ) : file.type.startsWith('video/') ? (
                          <div className="relative w-full h-full">
                            <video 
                              src={previewUrls[index]} 
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Remove button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Selection for multi-category spaces */}
          {isInSpace && currentSpace && currentSpace.categories && currentSpace.categories.length > 1 && (
            <div className="px-4 py-3 border-t border-border">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Catégories <span className="text-destructive">*</span>
                  <span className="text-xs text-muted-foreground block mt-1">
                    Choisissez au moins une catégorie pour ce post
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {currentSpace.categories.map((category) => (
                    <label
                      key={category}
                      className={`
                        flex items-center space-x-2 px-3 py-2 text-sm rounded-full border cursor-pointer transition-all
                        ${formData.categories.includes(category) 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-input hover:border-primary/50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              categories: [...prev.categories, category] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              categories: prev.categories.filter(c => c !== category) 
                            }));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="select-none">{category}</span>
                    </label>
                  ))}
                </div>
                {formData.categories.length === 0 && (
                  <p className="text-xs text-destructive">
                    Veuillez sélectionner au moins une catégorie
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Media Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t">
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*,video/*,.gif"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="gap-3 hover:bg-primary/10 hover:text-primary border-2 border-dashed border-primary/30 hover:border-primary/60 px-6 py-3"
                asChild
              >
                <span>
                  <Image className="h-5 w-5" />
                  Photo
                </span>
              </Button>
            </label>
            
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="gap-3 hover:bg-primary/10 hover:text-primary border-2 border-dashed border-primary/30 hover:border-primary/60 px-6 py-3"
                asChild
              >
                <span>
                  <Video className="h-5 w-5" />
                  Vidéo
                </span>
              </Button>
            </label>
            
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setIsGifSelectorOpen(true)}
              className="gap-3 hover:bg-primary/10 hover:text-primary border-2 border-dashed border-primary/30 hover:border-primary/60 px-6 py-3"
            >
              <FileImage className="h-5 w-5" />
              GIF
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setShowYoutubeInput(true)}
              className="gap-3 hover:bg-red-50 hover:text-red-600 border-2 border-dashed border-red-200 hover:border-red-400 px-6 py-3"
            >
              <Youtube className="h-5 w-5" />
              YouTube
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setShowTiktokInput(true)}
              className="gap-3 hover:bg-black/5 hover:text-foreground border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 px-6 py-3"
            >
              <Music className="h-5 w-5" />
              TikTok
            </Button>
          </div>

          {/* YouTube URL Input */}
          {showYoutubeInput && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Youtube className="h-5 w-5 text-red-600" />
                <span className="font-medium">Ajouter une vidéo YouTube</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                />
                <Button onClick={handleYouTubeAdd} disabled={!youtubeUrl.trim()}>
                  Ajouter
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowYoutubeInput(false);
                    setYoutubeUrl("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* TikTok URL Input */}
          {showTiktokInput && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Music className="h-5 w-5" />
                <span className="font-medium">Ajouter une vidéo TikTok</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.tiktok.com/@username/video/..."
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                />
                <Button onClick={handleTikTokAdd} disabled={!tiktokUrl.trim()}>
                  Ajouter
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowTiktokInput(false);
                    setTiktokUrl("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GifSelector
        isOpen={isGifSelectorOpen}
        onClose={() => setIsGifSelectorOpen(false)}
        onSelectGif={handleGifSelect}
      />
      </div>
    </div>
  );
}