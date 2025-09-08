import { useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { X, Image, Video, Play, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useSpaces } from "@/hooks/useSpaces";
import { useAuth } from "@/contexts/AuthContext";
import GifSelector from "@/components/GifSelector";

export default function CreatePost() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createPost, isLoading } = usePosts();
  const { getSpaceById } = useSpaces();
  
  // Déterminer si on est dans un espace spécifique
  const isInSpace = Boolean(spaceId);
  const spaceName = location.state?.spaceName || "";

  const [formData, setFormData] = useState({
    content: "",
    selectedFiles: [] as File[],
  });
  
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatHashtags = (text: string) => {
    return text.replace(/#(\w+)/g, '<span style="color: hsl(var(--primary)); font-weight: 600;">#$1</span>');
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files);
      setFormData(prev => ({ ...prev, selectedFiles: filesArray }));
      
      // Create preview URLs
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
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

  const handleGifSelect = async (gifUrl: string) => {
    try {
      // Télécharger le GIF et le convertir en File
      const response = await fetch(gifUrl);
      const blob = await response.blob();
      const file = new File([blob], `gif-${Date.now()}.gif`, { type: 'image/gif' });
      
      setFormData(prev => ({ 
        ...prev, 
        selectedFiles: [...prev.selectedFiles, file] 
      }));
      
      setPreviewUrls(prev => [...prev, gifUrl]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du GIF:', error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire quelque chose",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour publier",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract hashtags from content
      const hashtags = formData.content.match(/#\w+/g) || [];
      
      await createPost({
        content: formData.content,
        space_id: spaceId,
        hashtags,
        media_files: formData.selectedFiles.length > 0 ? formData.selectedFiles : undefined
      });

      // Rediriger vers l'espace ou l'accueil
      if (isInSpace) {
        navigate(`/space/${spaceId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header épuré */}
      <div className="sticky top-0 z-50 bg-background border-b">
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
            disabled={!formData.content.trim() || isLoading}
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
                  className="min-h-[150px] text-lg border-none shadow-none resize-none focus-visible:ring-0 p-3 bg-transparent relative z-10"
                  style={{
                    lineHeight: "1.5"
                  }}
                />
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

          {/* Media Toolbar */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t">
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
          </div>
        </div>
      </div>

      <GifSelector
        isOpen={isGifSelectorOpen}
        onClose={() => setIsGifSelectorOpen(false)}
        onSelectGif={handleGifSelect}
      />
    </div>
  );
}