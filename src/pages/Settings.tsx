import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ModerationTools } from "@/components/moderation/ModerationTools";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { ArrowLeft, Camera, LogOut, Shield, Eye, Settings as SettingsIcon, Users, Palette } from "lucide-react";

export default function Settings() {
  const { user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    bio: user?.profile?.bio || ""
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: user?.profile?.profile_visible ?? true,
    showEmail: user?.profile?.show_email ?? false,
    showFollowers: user?.profile?.show_followers ?? true
  });

  // Update privacy state when user profile changes
  useEffect(() => {
    if (user?.profile) {
      setPrivacy({
        profileVisible: user.profile.profile_visible ?? true,
        showEmail: user.profile.show_email ?? false,
        showFollowers: user.profile.show_followers ?? true
      });
    }
  }, [user?.profile]);

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    }
  };

  const handlePrivacyUpdate = async (field: keyof typeof privacy, value: boolean) => {
    const updatedPrivacy = { ...privacy, [field]: value };
    setPrivacy(updatedPrivacy);
    
    try {
      const privacyData: any = {};
      
      if (field === 'profileVisible') {
        privacyData.profile_visible = value;
      } else if (field === 'showEmail') {
        privacyData.show_email = value;
      } else if (field === 'showFollowers') {
        privacyData.show_followers = value;
      }
      
      await updateProfile(privacyData);
      
      toast({
        title: "Paramètres mis à jour",
        description: "Vos préférences de confidentialité ont été sauvegardées"
      });
    } catch (error) {
      // Revert local state on error
      setPrivacy(privacy);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    signOut();
    toast({
      title: "Déconnexion",
      description: "À bientôt sur KaaySamp !"
    });
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Paramètres</h1>
              <p className="text-sm text-muted-foreground">@{user?.profile?.username || "Utilisateur"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="appearance">Thème</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations du profil
                </CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profile?.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                    {user?.profile?.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">@{user?.profile?.username || "Utilisateur"}</h3>
                      {user?.profile?.is_verified && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          ✓ Certifié
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Changer la photo
                    </Button>
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      placeholder="Parlez-nous de vous..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleProfileUpdate} className="w-fit">
                    Sauvegarder les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apparence et thème
                </CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de KaaySamp selon vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sélecteur de thème</Label>
                      <div className="text-sm text-muted-foreground">
                        Basculez rapidement entre les thèmes
                      </div>
                    </div>
                    <ThemeToggle />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base">Aperçu des thèmes</Label>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div 
                        className="cursor-pointer rounded-md border-2 p-2 hover:border-primary transition-colors"
                        style={{ borderColor: theme === 'light' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                        onClick={() => setTheme('light')}
                      >
                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                          <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center text-sm font-medium">
                          Clair {theme === 'light' && '✓'}
                        </span>
                      </div>

                      <div 
                        className="cursor-pointer rounded-md border-2 p-2 hover:border-primary transition-colors"
                        style={{ borderColor: theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                        onClick={() => setTheme('dark')}
                      >
                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                          <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center text-sm font-medium text-white">
                          Sombre {theme === 'dark' && '✓'}
                        </span>
                      </div>

                      <div 
                        className="cursor-pointer rounded-md border-2 p-2 hover:border-primary transition-colors"
                        style={{ borderColor: theme === 'system' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                        onClick={() => setTheme('system')}
                      >
                        <div className="space-y-2 rounded-sm bg-gradient-to-r from-slate-50 to-slate-950 p-2">
                          <div className="space-y-2 rounded-md bg-white/50 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-300" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-300" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white/50 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-300" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-300" />
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center text-sm font-medium">
                          Système {theme === 'system' && '✓'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Confidentialité et sécurité
                </CardTitle>
                <CardDescription>
                  Contrôlez qui peut voir vos informations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profil visible</p>
                      <p className="text-sm text-muted-foreground">
                        Votre profil est visible par tous
                      </p>
                    </div>
                    <Switch
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) => 
                        handlePrivacyUpdate('profileVisible', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Afficher l'email</p>
                      <p className="text-sm text-muted-foreground">
                        Votre email est visible sur votre profil
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => 
                        handlePrivacyUpdate('showEmail', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Afficher les abonnés</p>
                      <p className="text-sm text-muted-foreground">
                        La liste de vos abonnés est visible
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showFollowers}
                      onCheckedChange={(checked) => 
                        handlePrivacyUpdate('showFollowers', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du compte</CardTitle>
                <CardDescription>
                  Actions sur votre compte et outils de modération
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Moderation Tools for Moderators */}
                {user?.profile?.is_verified && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Outils de modération</h3>
                    </div>
                    <ModerationTools />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium text-destructive mb-2">Zone de danger</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ces actions sont irréversibles. Assurez-vous de bien comprendre les conséquences.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{user?.profile?.followers_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Abonnés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{user?.profile?.following_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Abonnements</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}