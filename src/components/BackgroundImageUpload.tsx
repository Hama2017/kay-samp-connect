import { useState, useCallback } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNSFWDetection } from '@/hooks/useNSFWDetection';

interface BackgroundImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export function BackgroundImageUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved 
}: BackgroundImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const { analyzeImage, isAnalyzing } = useNSFWDetection();

  const uploadImage = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      // Analyser l'image avec NSFW detection
      const nsfwResult = await analyzeImage(file);
      
      if (nsfwResult.isNSFW) {
        throw new Error(nsfwResult.message);
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `space-backgrounds/${fileName}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      
      toast({
        title: "Image téléchargée !",
        description: "L'image de fond a été mise à jour avec succès",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger l'image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onImageUploaded, toast, analyzeImage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    onImageRemoved();
    toast({
      title: "Image supprimée",
      description: "L'image de fond a été supprimée",
    });
  };

  return (
    <div className="space-y-4">
      {currentImageUrl ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative group">
              <img
                src={currentImageUrl}
                alt="Image de fond de la SAMP Zone"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => document.getElementById('background-upload')?.click()}
                    disabled={isUploading || isAnalyzing}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Changer
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('background-upload')?.click()}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {(isUploading || isAnalyzing) ? (isAnalyzing ? 'Analyse en cours...' : 'Téléchargement en cours...') : 'Ajouter une image de fond'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP (max 5MB)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <input
        id="background-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}