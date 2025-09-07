import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, Image, Video, MapPin, Smile, Hash, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const categories = ["Sport", "Culture", "Cuisine", "Technologie", "Religion"];

export default function CreatePost() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  // Déterminer si on est dans un espace spécifique
  const isInSpace = Boolean(spaceId);
  const spaceName = location.state?.spaceName || "";

  const [formData, setFormData] = useState({
    content: "",
    category: "",
    location: "",
    tags: "",
    selectedFiles: [] as File[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({ ...prev, selectedFiles: Array.from(files) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire quelque chose",
        variant: "destructive",
      });
      return;
    }

    if (!isInSpace && !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Post créé !",
      description: `Votre post a été publié ${isInSpace ? `dans l'espace ${spaceName}` : `dans la catégorie ${formData.category}`}`,
    });

    // Rediriger vers l'espace ou l'accueil
    if (isInSpace) {
      navigate(`/space/${spaceId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {isInSpace ? `Poster dans ${spaceName}` : "Créer un post"}
            </h1>
          </div>
          <Button 
            onClick={handleSubmit}
            className="px-6"
            disabled={!formData.content.trim()}
          >
            Publier
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* User Avatar and Input */}
          <div className="flex gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Quoi de neuf ?"
                className="min-h-[120px] text-lg border-none shadow-none resize-none focus-visible:ring-0 p-0"
              />
              
              {/* Category Selection (only if not in space) */}
              {!isInSpace && (
                <div className="mt-4">
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* File Upload Area */}
              {formData.selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {formData.selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <Video className="h-8 w-8 text-muted-foreground" />
                        )}
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

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary/10"
                  asChild
                >
                  <span>
                    <Image className="h-5 w-5" />
                  </span>
                </Button>
              </label>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10"
              >
                <Video className="h-5 w-5" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10"
                onClick={() => {
                  const currentLocation = navigator.geolocation ? "Localisation actuelle" : "";
                  handleInputChange("location", currentLocation);
                }}
              >
                <MapPin className="h-5 w-5" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10"
              >
                <Smile className="h-5 w-5" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10"
              >
                <Hash className="h-5 w-5" />
              </Button>
            </div>

            {formData.content.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Tout le monde peut répondre</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}