import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useNSFWDetection } from "@/hooks/useNSFWDetection";

interface CoverImageUploadProps {
  currentCoverUrl?: string;
  onUploadComplete?: (url: string) => void;
}

export function CoverImageUpload({ currentCoverUrl, onUploadComplete }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { analyzeImage, isAnalyzing } = useNSFWDetection();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error("L'image doit faire moins de 5MB");
      return;
    }

    // Aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadCoverImage(file);
  };

  const uploadCoverImage = async (file: File) => {
    if (!user?.id) return;

    setIsUploading(true);
    
    try {
      // Analyser l'image avec NSFW detection
      const nsfwResult = await analyzeImage(file);
      
      if (nsfwResult.isNSFW) {
        toast.error(nsfwResult.message);
        return;
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `cover_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Supprimer l'ancienne image si elle existe
      if (currentCoverUrl && currentCoverUrl.includes('supabase')) {
        const oldPath = currentCoverUrl.split('/').pop();
        if (oldPath && oldPath !== fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      toast.success("Photo de couverture mise à jour avec succès");

      onUploadComplete?.(publicUrl);
      
    } catch (error: any) {
      console.error('Error uploading cover image:', error);
      toast.error(error.message || "Impossible d'uploader l'image");
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
    }
  };

  const removeCoverImage = async () => {
    if (!user?.id || !currentCoverUrl) return;

    setIsUploading(true);

    try {
      // Mettre à jour le profil pour supprimer l'URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_image_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Supprimer le fichier du storage si c'est une image uploadée
      if (currentCoverUrl.includes('supabase')) {
        const fileName = currentCoverUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${fileName}`]);
        }
      }

      toast.success("Photo de couverture supprimée");

      onUploadComplete?.('');

    } catch (error: any) {
      console.error('Error removing cover image:', error);
      toast.error(error.message || "Impossible de supprimer l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const currentImageUrl = previewUrl || currentCoverUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop';

  return (
    <div className="relative group">
      <div 
        className="h-48 bg-gradient-hero rounded-t-xl bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${currentImageUrl})` }}
      >
        {/* Overlay avec boutons - Desktop hover */}
        <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isAnalyzing}
          >
            {(isUploading || isAnalyzing) ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Changer
              </>
            )}
          </Button>
          
          {currentCoverUrl && (
            <Button
              variant="destructive"
              size="sm"
              onClick={removeCoverImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Boutons toujours visibles - Mobile */}
        <div className="md:hidden absolute bottom-3 right-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isAnalyzing}
          >
            {(isUploading || isAnalyzing) ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Changer
              </>
            )}
          </Button>
        </div>

        {/* Indicateur de chargement */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <LoadingSpinner size="lg" className="text-white" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}