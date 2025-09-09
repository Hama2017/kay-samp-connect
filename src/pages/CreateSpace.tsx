import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSpaces } from "@/hooks/useSpaces";

const categories = [
  "Sport",
  "Culture & Musique", 
  "Cuisine",
  "Technologie",
  "Religion",
  "Politique",
  "Éducation",
  "Santé",
  "Business",
  "Divertissement"
];

export default function CreateSpace() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createSpace } = useSpaces();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    whoCanPublish: [] as string[],
  });

  const handlePublishPermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        whoCanPublish: [...prev.whoCanPublish, permission]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        whoCanPublish: prev.whoCanPublish.filter(p => p !== permission)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || formData.whoCanPublish.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createSpace({
        name: formData.name,
        description: formData.description,
        category: formData.category,
      });
      
      toast({
        title: "Espace créé !",
        description: `L'espace "${formData.name}" a été créé avec succès`,
      });
      
      navigate("/discover");
    } catch (error: any) {
      // Check if it's a duplicate name error
      const isDuplicateName = error.code === '23505' || 
                             error.message?.toLowerCase().includes('duplicate') ||
                             error.message?.toLowerCase().includes('idx_spaces_name_unique');
      
      if (isDuplicateName) {
        toast({
          title: "Nom déjà utilisé",
          description: `Un espace avec le nom "${formData.name}" existe déjà. Veuillez choisir un autre nom.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'espace. Réessayez plus tard.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-primary/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Créer un espace
          </h1>
          <p className="text-muted-foreground">
            Crée ta propre communauté thématique
          </p>
        </div>
      </div>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-foreground">Informations de l'espace</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Space name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nom de l'espace <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Tech Dakar, Cuisine Sénégalaise..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="border-primary/20 focus:border-primary/40"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Décris le thème et l'objectif de ton espace..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px] border-primary/20 focus:border-primary/40"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Catégorie principale <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="border-primary/20 focus:border-primary/40">
                  <SelectValue placeholder="Choisis une catégorie" />
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

            {/* Publishing permissions */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Qui peut publier ? <span className="text-destructive">*</span>
              </Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="creator-only"
                    checked={formData.whoCanPublish.includes("creator_only")}
                    onCheckedChange={(checked) => handlePublishPermissionChange("creator_only", checked as boolean)}
                  />
                  <Label htmlFor="creator-only" className="text-sm">
                    Moi seulement
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-subscribers"
                    checked={formData.whoCanPublish.includes("all_subscribers")}
                    onCheckedChange={(checked) => handlePublishPermissionChange("all_subscribers", checked as boolean)}
                  />
                  <Label htmlFor="all-subscribers" className="text-sm">
                    Tous les abonnés
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified-users"
                    checked={formData.whoCanPublish.includes("verified_users")}
                    onCheckedChange={(checked) => handlePublishPermissionChange("verified_users", checked as boolean)}
                  />
                  <Label htmlFor="verified-users" className="text-sm">
                    Utilisateurs vérifiés seulement
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="senegal"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer l'espace"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}