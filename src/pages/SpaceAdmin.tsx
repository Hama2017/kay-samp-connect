import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Edit3, Upload, Plus, Trash2, Settings, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSpaces, Space } from "@/hooks/useSpaces";
import { useSpaceAdmin } from "@/hooks/useSpaceAdmin";
import { useCategories } from "@/hooks/useCategories";
import { useSpaceInvitations } from "@/hooks/useSpaceInvitations";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BackgroundImageUpload } from "@/components/BackgroundImageUpload";
import { UserSearchCombobox } from "@/components/UserSearchCombobox";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function SpaceAdmin() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateSpace, deleteSpace, getSpaceById } = useSpaces();
  const { subscribers, fetchSubscribers, isLoading: subscribersLoading } = useSpaceAdmin();
  const { categories } = useCategories();
  const { sendInvitation } = useSpaceInvitations();
  
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoadingSpace, setIsLoadingSpace] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    background_image_url: "",
    whoCanPublish: "subscribers" as string
  });
  const [newCategory, setNewCategory] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<Array<{ id: string; username: string; profile_picture_url?: string; invitation_id?: string }>>([]);
  const [selectedNewUsers, setSelectedNewUsers] = useState<Array<{ id: string; username: string; profile_picture_url?: string }>>([]);

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
          background_image_url: spaceData.background_image_url || "",
          whoCanPublish: spaceData.who_can_publish?.[0] || 'subscribers'
        });
        await fetchSubscribers(spaceId);
        
        // Toujours charger les invitations pour afficher la liste
        await loadInvitations();
      } catch (error) {
        console.error('Error loading space:', error);
        navigate('/');
      } finally {
        setIsLoadingSpace(false);
      }
    };

    loadSpace();
  }, [spaceId, getSpaceById, fetchSubscribers, navigate]);

  // Charger les invitations existantes
  const loadInvitations = async () => {
    if (!spaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('space_invitations')
        .select(`
          id,
          invited_user_id,
          status,
          invited_profile:profiles!space_invitations_invited_user_id_fkey (
            id,
            username,
            profile_picture_url
          )
        `)
        .eq('space_id', spaceId)
        .eq('status', 'accepted');
      
      if (error) throw error;
      
      const users = data?.map(inv => ({
        id: inv.invited_user_id,
        username: inv.invited_profile?.username || '',
        profile_picture_url: inv.invited_profile?.profile_picture_url,
        invitation_id: inv.id
      })) || [];
      
      setInvitedUsers(users);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  // Redirect if user is not the creator
  useEffect(() => {
    if (space && user && space.creator_id !== user.id) {
      navigate(`/space/${spaceId}`);
      toast.error("Accès non autorisé");
    }
  }, [space, user, spaceId, navigate]);

  const handleUpdate = async () => {
    if (!spaceId) return;

    // Validation du nom
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast.error("Le nom de la SAMP Zone ne peut pas être vide");
      return;
    }

    setIsUpdating(true);
    try {
      await updateSpace(spaceId, {
        name: trimmedName,
        description: formData.description,
        categories: formData.categories,
        background_image_url: formData.background_image_url,
        who_can_publish: formData.whoCanPublish === 'invitation' ? ['invited'] : [formData.whoCanPublish]
      });
      
      // Envoyer les nouvelles invitations si on est en mode invitation
      if (formData.whoCanPublish === 'invitation' && selectedNewUsers.length > 0) {
        for (const user of selectedNewUsers) {
          try {
            await sendInvitation(spaceId, user.id, `Vous êtes invité à rejoindre la SAMP Zone "${formData.name}"`);
          } catch (error) {
            console.error('Error sending invitation to:', user.username, error);
          }
        }
        setSelectedNewUsers([]);
        loadInvitations();
      }
      
      setIsEditing(false);
      toast.success("SAMP Zone mise à jour avec succès");
    } catch (error) {
      console.error("Error updating space:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveInvitation = async (invitationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('space_invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
      
      // Recharger la liste des invitations après suppression
      await loadInvitations();
      toast.success("Membre retiré avec succès");
    } catch (error) {
      console.error('Error removing invitation:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRemoveSubscriber = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('space_subscriptions')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Recharger la liste des SAMPNA après suppression
      await fetchSubscribers(spaceId!);
      toast.success(`@${username} a été retiré de la SAMP Zone`);
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast.error("Erreur lors de la suppression du SAMPNA");
    }
  };

  const handleDelete = async () => {
    if (!spaceId) return;

    setIsDeleting(true);
    try {
      await deleteSpace(spaceId);
      navigate("/");
      toast.success("SAMP Zone supprimée avec succès");
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
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b sm:border-0">
          <Button 
            variant="ghost" 
            size="icon"
            className="shrink-0"
            onClick={() => navigate(`/space/${spaceId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold truncate">Administration</h1>
          </div>
        </div>

        {/* Space Info Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="space-y-0 pb-3 sm:pb-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-lg sm:text-xl">Informations</span>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? "Annuler" : "Modifier"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Nom de la SAMP Zone</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom de la SAMP Zone"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la SAMP Zone"
                    rows={4}
                    className="w-full resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Catégories</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 min-h-[2rem]">
                    {formData.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/90 transition-colors text-xs sm:text-sm"
                        onClick={() => removeCategory(category)}
                      >
                        {category} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[2.5rem]"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories
                        .filter(cat => !formData.categories.includes(cat.name))
                        .map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <Button 
                      onClick={addCategory} 
                      disabled={!newCategory}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Ajouter</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium block">
                    Qui peut publier ? <span className="text-destructive">*</span>
                  </Label>
                  
                  <RadioGroup 
                    value={formData.whoCanPublish} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, whoCanPublish: value }))}
                    className="gap-2 sm:gap-3"
                  >
                    <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="creator_only" id="edit-creator-only" />
                      <Label htmlFor="edit-creator-only" className="text-sm cursor-pointer flex-1">
                        Moi seulement
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="subscribers" id="edit-all-subscribers" />
                      <Label htmlFor="edit-all-subscribers" className="text-sm cursor-pointer flex-1">
                        Tous les SAMPNA
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="verified_only" id="edit-verified-users" />
                      <Label htmlFor="edit-verified-users" className="text-sm cursor-pointer flex-1">
                        Utilisateurs vérifiés seulement
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="invitation" id="edit-invitation-only" />
                      <Label htmlFor="edit-invitation-only" className="text-sm cursor-pointer flex-1">
                        Par invitation seulement
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Afficher la gestion des invitations si mode invitation sélectionné */}
                {formData.whoCanPublish === 'invitation' && (
                  <div className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-4">
                    <Label className="text-sm font-medium block">
                      Utilisateurs invités ({invitedUsers.length})
                    </Label>
                    
                    {/* Liste des utilisateurs déjà invités */}
                    {invitedUsers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Invitations acceptées:</p>
                        <div className="space-y-1.5">
                          {invitedUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between py-2 px-3 bg-background rounded border hover:border-primary/50 transition-colors">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarImage src={user.profile_picture_url} />
                                  <AvatarFallback className="text-xs">
                                    {user.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate">@{user.username}</span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => user.invitation_id && handleRemoveInvitation(user.invitation_id, user.id)}
                                className="text-destructive hover:text-destructive h-8 shrink-0 ml-2"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Ajouter de nouvelles invitations */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium block">Inviter de nouveaux utilisateurs</Label>
                      <UserSearchCombobox
                        selectedUsers={selectedNewUsers}
                        onUsersChange={setSelectedNewUsers}
                        placeholder="Rechercher un utilisateur..."
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium block">Image de fond</label>
                  <BackgroundImageUpload
                    currentImageUrl={formData.background_image_url}
                    onImageUploaded={(url) => setFormData({ ...formData, background_image_url: url })}
                    onImageRemoved={() => setFormData({ ...formData, background_image_url: "" })}
                  />
                </div>
                
                <Button 
                  onClick={handleUpdate} 
                  disabled={isUpdating} 
                  className="w-full sm:text-base h-11"
                >
                  {isUpdating ? "Mise à jour..." : "Sauvegarder les modifications"}
                </Button>
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
                <div>
                  <p className="text-sm font-medium mb-2">Qui peut publier:</p>
                  <Badge variant="outline">
                    {space.who_can_publish?.[0] === 'creator_only' && 'Moi seulement'}
                    {space.who_can_publish?.[0] === 'subscribers' && 'Tous les SAMPNA'}
                    {space.who_can_publish?.[0] === 'verified_only' && 'Utilisateurs vérifiés'}
                    {space.who_can_publish?.[0] === 'invited' && 'Par invitation'}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{space.subscribers_count || 0} SAMPNA</span>
                  <span>{space.posts_count || 0} publications</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Invited Users Card - Only show if space uses invitation system */}
        {space.who_can_publish?.[0] === 'invited' && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 shrink-0" />
                <span>Membres invités ({invitedUsers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invitedUsers.length > 0 ? (
                <div className="grid gap-2 sm:gap-3">
                  {invitedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                        <AvatarImage src={user.profile_picture_url} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {user.username?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">@{user.username}</p>
                        <p className="text-xs text-muted-foreground">Membre contributeur</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0 h-9 w-9 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Retirer l'invitation ?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Voulez-vous vraiment retirer l'invitation de @{user.username} ? Cette personne ne pourra plus publier dans cette SAMP Zone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="m-0 w-full sm:w-auto">Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => user.invitation_id && handleRemoveInvitation(user.invitation_id, user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0 w-full sm:w-auto"
                            >
                              Retirer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">Aucun membre invité pour le moment</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subscribers Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5 shrink-0" />
              <span>SAMPNA ({subscribers.filter(s => s.id !== space.creator_id).length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscribersLoading ? (
              <div className="py-8">
                <LoadingSpinner />
              </div>
            ) : subscribers.filter(s => s.id !== space.creator_id).length > 0 ? (
              <div className="grid gap-2 sm:gap-3">
                {subscribers.filter(s => s.id !== space.creator_id).map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Link to={`/user/${subscriber.username}`} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                        <AvatarImage src={subscriber.profile_picture_url} />
                        <AvatarFallback className="text-xs sm:text-sm bg-primary text-primary-foreground font-semibold">
                          {subscriber.username?.slice(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm sm:text-base truncate hover:underline">@{subscriber.username}</p>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive shrink-0 h-9 w-9 p-0"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Retirer ce SAMPNA ?</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Voulez-vous vraiment retirer @{subscriber.username} de cette SAMP Zone ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="m-0 w-full sm:w-auto">Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveSubscriber(subscriber.id, subscriber.username)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0 w-full sm:w-auto"
                          >
                            Retirer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">Aucun SAMPNA pour le moment</p>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-destructive text-lg sm:text-xl">Zone de danger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              La suppression de la SAMP Zone est irréversible. Tous les posts associés seront également supprimés.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={isDeleting}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Suppression..." : "Supprimer la SAMP Zone"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <p className="text-sm">
                      Cette action supprimera définitivement la SAMP Zone "{space?.name}" et tous les posts associés. 
                      Cette action est irréversible.
                    </p>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        Pour confirmer, tapez <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">SUPPRIMER DÉFINITIVEMENT</span>
                      </label>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Tapez SUPPRIMER DÉFINITIVEMENT"
                        className="font-mono text-sm"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel 
                    onClick={() => setDeleteConfirmText("")}
                    className="m-0 w-full sm:w-auto"
                  >
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0 w-full sm:w-auto"
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