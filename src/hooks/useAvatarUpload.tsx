import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { processImage } from '@/utils/imageCompression';

export function useAvatarUpload() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<boolean> => {
    if (!user?.id || !file) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté ou fichier manquant",
        variant: "destructive",
      });
      return false;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive",
      });
      return false;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image doit faire moins de 5MB",
        variant: "destructive",
      });
      return false;
    }

    setIsUploading(true);

    try {
      // Valider, compresser et convertir en WebP
      const processedFile = await processImage(file, true);
      
      // Créer un nom de fichier unique (toujours .webp maintenant)
      const fileName = `${user.id}/avatar-${Date.now()}.webp`;

      // Supprimer l'ancien avatar s'il existe
      if (user.profile?.profile_picture_url) {
        try {
          const oldPath = user.profile.profile_picture_url.split('/').pop();
          if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([`${user.id}/${oldPath}`]);
          }
        } catch (error) {
          console.warn('Could not delete old avatar:', error);
        }
      }

      // Upload du fichier compressé
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Mettre à jour le profil utilisateur
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mettre à jour le contexte utilisateur
      await updateUserProfile();

      toast({
        title: "Succès !",
        description: "Photo de profil mise à jour avec succès",
      });

      return true;

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      
      // Messages d'erreur personnalisés
      let errorMessage = error.message || "Erreur lors de l'upload de la photo";
      if (error.message?.includes('trop volumineux')) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async (): Promise<boolean> => {
    if (!user?.id) return false;

    setIsUploading(true);

    try {
      // Supprimer de Supabase Storage
      if (user.profile?.profile_picture_url) {
        const oldPath = user.profile.profile_picture_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mettre à jour le contexte utilisateur
      await updateUserProfile();

      toast({
        title: "Succès !",
        description: "Photo de profil supprimée",
      });

      return true;

    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    removeAvatar,
    isUploading
  };
}