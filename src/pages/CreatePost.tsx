import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, Image, Video, Type, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categories = ["Sport", "Culture", "Cuisine", "Technologie", "Religion"];

const contentTypes = [
  { id: "text", label: "Texte", icon: Type },
  { id: "image", label: "Image", icon: Image },
  { id: "video", label: "Vidéo", icon: Video },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  // Déterminer si on est dans un espace spécifique
  const isInSpace = Boolean(spaceId);
  const spaceName = location.state?.spaceName || "";

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    contentType: "text",
    location: "",
    tags: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
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
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Créer un post
          </h1>
          {isInSpace && (
            <p className="text-sm text-muted-foreground">
              Publication dans l'espace: {spaceName}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Nouveau post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type de contenu */}
            <div className="space-y-2">
              <Label htmlFor="contentType">Type de contenu</Label>
              <div className="grid grid-cols-3 gap-2">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      type="button"
                      variant={formData.contentType === type.id ? "default" : "outline"}
                      onClick={() => handleInputChange("contentType", type.id)}
                      className="flex flex-col gap-2 h-auto py-4"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Donnez un titre à votre post..."
                required
              />
            </div>

            {/* Contenu */}
            <div className="space-y-2">
              <Label htmlFor="content">Contenu *</Label>
              {formData.contentType === "text" ? (
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Partagez votre contenu..."
                  className="min-h-[120px]"
                  required
                />
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {formData.contentType === "image" ? "Téléchargez une image" : "Téléchargez une vidéo"}
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Choisir un fichier
                  </Button>
                </div>
              )}
            </div>

            {/* Catégorie (seulement si pas dans un espace) */}
            {!isInSpace && (
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
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

            {/* Localisation */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation (optionnel)
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Ajoutez une localisation..."
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optionnel)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="Ajoutez des tags séparés par des virgules..."
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                Publier
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}