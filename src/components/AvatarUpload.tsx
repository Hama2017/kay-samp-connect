import { useRef } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  fallbackText: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  fallbackText, 
  size = 'xl',
  className = ''
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, removeAvatar, isUploading } = useAvatarUpload();

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16', 
    lg: 'h-20 w-20',
    xl: 'h-24 w-24'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
    // Reset input pour permettre de sélectionner le même fichier à nouveau
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveClick = () => {
    removeAvatar();
  };

  return (
    <div className={`relative group ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative cursor-pointer">
            <Avatar className={`${sizeClasses[size]} border-4 border-background shadow-lg transition-all duration-200 hover:opacity-80`}>
              <AvatarImage src={currentAvatarUrl} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-semibold">
                {fallbackText}
              </AvatarFallback>
            </Avatar>
            
            {/* Overlay avec icône camera */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              {isUploading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
            
            {/* Badge de modification */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Camera className="h-3 w-3" />
            </div>
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="cursor-pointer"
          >
            <Camera className="h-4 w-4 mr-2" />
            {currentAvatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </DropdownMenuItem>
          
          {currentAvatarUrl && (
            <DropdownMenuItem 
              onClick={handleRemoveClick}
              disabled={isUploading}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer la photo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}