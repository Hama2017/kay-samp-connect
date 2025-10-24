import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSpaces } from "@/hooks/useSpaces";
import { useCategories } from "@/hooks/useCategories";
import { useSpaceInvitations } from "@/hooks/useSpaceInvitations";
import { UserSearchCombobox } from "@/components/UserSearchCombobox";

export default function CreateSpace() {
  const navigate = useNavigate();
  const { createSpace } = useSpaces();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { sendInvitation } = useSpaceInvitations();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    whoCanPublish: "subscribers" as string,
    invitedUsers: [] as { id: string; username: string; profile_picture_url?: string }[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.categories.length === 0) {
      toast.error("Veuillez remplir tous les champs obligatoires et choisir au moins une catégorie");
      return;
    }

    // Validation des longueurs
    if (formData.name.length > 100) {
      toast.error("Le nom ne peut pas dépasser 100 caractères");
      return;
    }

    if (formData.description.length > 2000) {
      toast.error("La description ne peut pas dépasser 2 000 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const spaceData = await createSpace({
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        who_can_publish: formData.whoCanPublish === 'invitation' ? ['invited'] : [formData.whoCanPublish],
      });
      
      // Envoyer les invitations si le mode invitation est sélectionné
      if (formData.whoCanPublish === 'invitation' && formData.invitedUsers.length > 0 && spaceData) {
        console.log('Sending invitations to:', formData.invitedUsers);
        let successCount = 0;
        let errorCount = 0;
        
        for (const user of formData.invitedUsers) {
          try {
            await sendInvitation(spaceData.id, user.id, `Vous êtes invité à rejoindre la SAMP Zone "${formData.name}"`);
            successCount++;
            console.log('Invitation sent successfully to:', user.username);
          } catch (error) {
            errorCount++;
            console.error('Error sending invitation to:', user.username, error);
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} invitation(s) envoyée(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`);
        }
      }
      
      navigate(`/space/${spaceData.id}`);
    } catch (error: any) {
      // Check if it's a duplicate name error
      const isDuplicateName = error.code === '23505' || 
                             error.message?.toLowerCase().includes('duplicate') ||
                             error.message?.toLowerCase().includes('idx_spaces_name_category_unique');
      
      if (isDuplicateName) {
        toast.error(`Une SAMP Zone "${formData.name}" existe déjà. Veuillez choisir un autre nom.`);
      } else {
        toast.error("Impossible de créer la SAMP Zone. Réessayez plus tard.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Créer une SAMP Zone
        </h1>
        <p className="text-muted-foreground">
          Crée ta propre communauté thématique
        </p>
      </div>

      <Card className="animate-fade-in-up">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Space name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nom de la SAMP Zone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Tech Dakar, Cuisine Sénégalaise..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                maxLength={100}
                className="border-primary/20 focus:border-primary/40"
              />
              <div className={`text-xs text-right ${formData.name.length > 90 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {formData.name.length} / 100 caractères
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décris le thème et l'objectif de ta SAMP Zone..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={2000}
                className="min-h-[100px] border-primary/20 focus:border-primary/40"
              />
              <div className={`text-xs text-right ${formData.description.length > 1900 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {formData.description.length} / 2 000 caractères
              </div>
            </div>
            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Catégories <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground block mt-1">
                  Choisissez au moins une catégorie (plusieurs possibles)
                </span>
              </Label>
              {categoriesLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`
                        flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
                        ${formData.categories.includes(category.name) 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-input hover:border-primary/50 hover:bg-accent/50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              categories: [...prev.categories, category.name] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              categories: prev.categories.filter(c => c !== category.name) 
                            }));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium select-none">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
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
                    Tous les SAMPKAT
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invitation" id="invitation-only" />
                  <Label htmlFor="invitation-only" className="text-sm">
                    Par invitation seulement
                  </Label>
                </div>
              </RadioGroup>

              {/* Invitation section */}
              {formData.whoCanPublish === 'invitation' && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium mb-3 block">
                    Inviter des utilisateurs
                  </Label>
                  <UserSearchCombobox
                    selectedUsers={formData.invitedUsers}
                    onUsersChange={(users) => setFormData(prev => ({ ...prev, invitedUsers: users }))}
                    placeholder="Saisir un nom d'utilisateur..."
                  />
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="senegal"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer la SAMP Zone"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}