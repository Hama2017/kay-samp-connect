import { useState } from "react";
import { User, Settings, Camera, Phone, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const mockUser = {
  fullName: "Amadou Diallo",
  username: "AmadouD",
  phoneNumber: "+221771234567",
  bio: "Passionné de football et de politique sénégalaise",
  profilePicture: "",
  isVerified: false,
  reputationLevel: "Actif",
  points: 156,
  registrationDate: "2024-01-15T10:30:00Z",
};

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: mockUser.fullName,
    bio: mockUser.bio,
    phoneNumber: mockUser.phoneNumber,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été mises à jour avec succès",
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Mon Profil
          </h1>
        </div>
        <p className="text-muted-foreground">
          Gère tes informations personnelles
        </p>
      </div>

      {/* Profile overview */}
      <Card className="mb-6 animate-fade-in-up">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mockUser.profilePicture} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-xl">
                  {mockUser.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="senegal"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">
                  @{mockUser.username}
                </h2>
                {mockUser.isVerified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-2">{mockUser.fullName}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-semibold">{mockUser.points}</span>
                  <span className="text-muted-foreground">points</span>
                </div>
              </div>
            </div>
          </div>
          
          {mockUser.bio && (
            <p className="text-muted-foreground text-sm leading-relaxed bg-muted/50 p-3 rounded-lg">
              {mockUser.bio}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres du profil
            </CardTitle>
            <Button
              variant={isEditing ? "outline" : "senegal"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Annuler" : "Modifier"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={!isEditing}
                className="border-primary/20 focus:border-primary/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                placeholder="Parle-nous de toi..."
                className="border-primary/20 focus:border-primary/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Numéro de téléphone
              </Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={!isEditing}
                className="border-primary/20 focus:border-primary/40"
              />
            </div>
          </div>

          {/* Password change */}
          {isEditing && (
            <div className="space-y-4 pt-4 border-t">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4" />
                Changer le mot de passe
              </Label>
              
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Mot de passe actuel"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="border-primary/20 focus:border-primary/40"
                />
                <Input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="border-primary/20 focus:border-primary/40"
                />
                <Input
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="border-primary/20 focus:border-primary/40"
                />
              </div>
            </div>
          )}

          {/* Save button */}
          {isEditing && (
            <Button
              variant="senegal"
              className="w-full"
              onClick={handleSave}
            >
              Sauvegarder les modifications
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}