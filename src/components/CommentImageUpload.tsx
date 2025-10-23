import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNSFWDetection } from '@/hooks/useNSFWDetection';

interface CommentImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  selectedImage: string | null;
  onRemoveImage: () => void;
}

export function CommentImageUpload({ onImageUploaded, selectedImage, onRemoveImage }: CommentImageUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { analyzeImage, isAnalyzing } = useNSFWDetection();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur", 
        description: "L'image est trop volumineuse (max 5MB)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Analyser l'image avec NSFW detection
      const nsfwResult = await analyzeImage(file);
      
      if (nsfwResult.isNSFW) {
        toast({
          title: "Contenu inapproprié",
          description: nsfwResult.message,
          variant: "destructive",
        });
        return;
      }
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `comment_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      
      toast({
        title: "Image uploadée !",
        description: "Votre image a été ajoutée au commentaire",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

/*   if (selectedImage) {
    return (
      <div className="relative inline-block">
        <img 
          src={selectedImage} 
          alt="Image sélectionnée" 
          className="max-w-full h-auto rounded-md max-h-32 border"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-1 right-1 h-6 w-6 p-0"
          onClick={onRemoveImage}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  } */

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleButtonClick}
        disabled={isUploading || isAnalyzing}
        className="flex items-center gap-1 h-8 px-2"
      >
        {(isUploading || isAnalyzing) ? (
          <Upload className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
        <span className="text-xs">Image</span>
      </Button>
    </>
  );
}