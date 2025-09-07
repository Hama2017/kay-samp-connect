import { useState } from "react";
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
import { ArrowLeft, Camera, LogOut, Shield, Bell, Eye } from "lucide-react";

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || ""
  });

  const [notifications, setNotifications] = useState({
    newPosts: true,
    comments: true,
    follows: true,
    mentions: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showFollowers: true
  });

  const handleProfileUpdate = () => {
    updateProfile(profileData);
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées"
    });
  };

  const handleLogout = () => {
    logout();
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
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
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
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">@{user.username}</h3>
                      {user.isVerified && (
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
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

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

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Préférences de notifications
                </CardTitle>
                <CardDescription>
                  Choisissez quand vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux posts</p>
                      <p className="text-sm text-muted-foreground">
                        Des espaces auxquels vous êtes abonné
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newPosts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, newPosts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Commentaires</p>
                      <p className="text-sm text-muted-foreground">
                        Quand quelqu'un commente vos posts
                      </p>
                    </div>
                    <Switch
                      checked={notifications.comments}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, comments: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux abonnés</p>
                      <p className="text-sm text-muted-foreground">
                        Quand quelqu'un vous suit
                      </p>
                    </div>
                    <Switch
                      checked={notifications.follows}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, follows: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mentions</p>
                      <p className="text-sm text-muted-foreground">
                        Quand quelqu'un vous mentionne
                      </p>
                    </div>
                    <Switch
                      checked={notifications.mentions}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, mentions: checked }))
                      }
                    />
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
                        setPrivacy(prev => ({ ...prev, profileVisible: checked }))
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
                        setPrivacy(prev => ({ ...prev, showEmail: checked }))
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
                        setPrivacy(prev => ({ ...prev, showFollowers: checked }))
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
                  Actions sur votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    <p className="text-2xl font-bold">{user.followersCount}</p>
                    <p className="text-sm text-muted-foreground">Abonnés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{user.followingCount}</p>
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