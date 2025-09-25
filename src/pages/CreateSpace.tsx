import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    categories: [] as string[],
    badge: "" as "kaaysamp" | "factcheck" | "evenement" | "none" | "",
    whoCanPublish: "subscribers" as string,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.categories.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et choisir au moins une catégorie",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createSpace({
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        badge: formData.badge === "none" ? undefined : formData.badge || undefined,
        who_can_publish: [formData.whoCanPublish],
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
                             error.message?.toLowerCase().includes('idx_spaces_name_category_unique');
      
      if (isDuplicateName) {
        toast({
          title: "Nom déjà utilisé",
          description: `Un espace "${formData.name}" existe déjà. Veuillez choisir un autre nom.`,
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

            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Catégories <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground block mt-1">
                  Choisissez au moins une catégorie (plusieurs possibles)
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className={`
                      flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all
                      ${formData.categories.includes(category) 
                        ? 'border-primary bg-primary/5 text-primary' 
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
                    <div className={`
                      w-4 h-4 border-2 rounded flex items-center justify-center
                      ${formData.categories.includes(category) 
                        ? 'border-primary bg-primary' 
                        : 'border-input'
                      }
                    `}>
                      {formData.categories.includes(category) && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
                      )}
                    </div>
                    <span className="text-sm font-medium select-none">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Badge spécial (optionnel)
              </Label>
               <Select 
                value={formData.badge} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  badge: value as "kaaysamp" | "factcheck" | "evenement" | "none" | ""
                }))}
              >
                <SelectTrigger className="border-primary/20 focus:border-primary/40">
                  <SelectValue placeholder="Choisir un badge (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun badge</SelectItem>
                  <SelectItem value="kaaysamp">🏆 KaaySamp</SelectItem>
                  <SelectItem value="factcheck">✅ Fact Check</SelectItem>
                  <SelectItem value="evenement">📅 Événement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Publishing permissions */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Qui peut publier ? <span className="text-destructive">*</span>
              </Label>
              
              <RadioGroup 
                value={formData.whoCanPublish} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, whoCanPublish: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creator_only" id="creator-only" />
                  <Label htmlFor="creator-only" className="text-sm">
                    Moi seulement
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subscribers" id="all-subscribers" />
                  <Label htmlFor="all-subscribers" className="text-sm">
                    Tous les abonnés
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="verified_only" id="verified-users" />
                  <Label htmlFor="verified-users" className="text-sm">
                    Utilisateurs vérifiés seulement
                  </Label>
                </div>
              </RadioGroup>
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