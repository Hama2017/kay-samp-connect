import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Edit3, Upload, Plus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSpaces, Space } from "@/hooks/useSpaces";
import { useSpaceAdmin } from "@/hooks/useSpaceAdmin";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BackgroundImageUpload } from "@/components/BackgroundImageUpload";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function SpaceAdmin() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateSpace, deleteSpace, getSpaceById } = useSpaces();
  const { subscribers, fetchSubscribers, isLoading: subscribersLoading } = useSpaceAdmin();
  const { categories } = useCategories();
  
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoadingSpace, setIsLoadingSpace] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    background_image_url: ""
  });
  const [newCategory, setNewCategory] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Load space data
  useEffect(() => {
    const loadSpace = async () => {
      if (!spaceId) return;
      
      try {
        setIsLoadingSpace(true);
        const spaceData = await getSpaceById(spaceId);
        setSpace(spaceData);
        setFormData({
          name: spaceData.name,
          description: spaceData.description || "",
          categories: spaceData.categories || [],
          background_image_url: spaceData.background_image_url || ""
        });
        fetchSubscribers(spaceId);
      } catch (error) {
        console.error('Error loading space:', error);
        navigate('/');
      } finally {
        setIsLoadingSpace(false);
      }
    };

    loadSpace();
  }, [spaceId, getSpaceById, fetchSubscribers, navigate]);

  // Redirect if user is not the creator
  useEffect(() => {
    if (space && user && space.creator_id !== user.id) {
      navigate(`/space/${spaceId}`);
      toast.error("Accès non autorisé");
    }
  }, [space, user, spaceId, navigate]);

  const handleUpdate = async () => {
    if (!spaceId) return;

    setIsUpdating(true);
    try {
      await updateSpace(spaceId, {
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        background_image_url: formData.background_image_url
      });
      setIsEditing(false);
      toast.success("Espace mis à jour avec succès");
    } catch (error) {
      console.error("Error updating space:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!spaceId) return;

    setIsDeleting(true);
    try {
      await deleteSpace(spaceId);
      navigate("/");
      toast.success("Espace supprimé avec succès");
    } catch (error) {
      console.error("Error deleting space:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const addCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory]
      });
      setNewCategory("");
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter(cat => cat !== categoryToRemove)
    });
  };

  if (isLoadingSpace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/space/${spaceId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Administration de l'espace</h1>
          </div>
        </div>

        {/* Space Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informations de l'espace</span>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isUpdating}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? "Annuler" : "Modifier"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium">Nom de l'espace</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom de l'espace"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de l'espace"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Catégories</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeCategory(category)}
                      >
                        {category} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories
                        .filter(cat => !formData.categories.includes(cat.name))
                        .map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <Button onClick={addCategory} disabled={!newCategory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
                  {isUpdating ? "Mise à jour..." : "Sauvegarder les modifications"}
                </Button>
                <div>
                  <label className="text-sm font-medium">Image de fond</label>
                  <BackgroundImageUpload
                    currentImageUrl={formData.background_image_url}
                    onImageUploaded={(url) => setFormData({ ...formData, background_image_url: url })}
                    onImageRemoved={() => setFormData({ ...formData, background_image_url: "" })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold">{space.name}</h3>
                  <p className="text-muted-foreground">{space.description || "Aucune description"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Catégories:</p>
                  <div className="flex flex-wrap gap-2">
                    {space.categories?.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    )) || <span className="text-muted-foreground text-sm">Aucune catégorie</span>}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{space.subscribers_count || 0} abonnés</span>
                  <span>{space.posts_count || 0} publications</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscribers Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Abonnés ({space.subscribers_count || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscribersLoading ? (
              <LoadingSpinner />
            ) : subscribers.length > 0 ? (
              <div className="grid gap-3">
                {subscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={subscriber.profile_picture_url} />
                      <AvatarFallback>
                        {subscriber.username?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {subscriber.user_id === user?.id ? (
                          <span className="text-primary">Moi</span>
                        ) : (
                          <span 
                            className="hover:text-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/profile/${subscriber.user_id}`)}
                          >
                            {subscriber.username}
                          </span>
                        )}
                      </p>
                      {subscriber.full_name && (
                        <p className="text-sm text-muted-foreground">{subscriber.full_name}</p>
                      )}
                    </div>
                    {subscriber.is_verified && (
                      <Badge variant="secondary" className="text-xs">Vérifié</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun abonné pour le moment</p>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression de l'espace est irréversible. Tous les posts associés seront également supprimés.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Suppression..." : "Supprimer l'espace"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement l'espace "{space?.name}" et tous les posts associés. 
                    Cette action est irréversible.
                    
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium">
                        Pour confirmer, tapez <span className="font-mono bg-muted px-1 py-0.5 rounded">SUPPRIMER DÉFINITIVEMENT</span>
                      </label>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Tapez SUPPRIMER DÉFINITIVEMENT"
                        className="font-mono"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteConfirmText !== "SUPPRIMER DÉFINITIVEMENT"}
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}