import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModerationTools } from '@/components/moderation/ModerationTools';
import { useAdminStats } from '@/hooks/useAdminStats';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Shield, 
  Users, 
  FileText, 
  MessageCircle, 
  Flag,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading } = useAdminStats();
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has admin role
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      // For now, allow verified users access
      // TODO: Implement proper role checking with user_roles table
      if (user.profile?.is_verified) {
        setHasAdminAccess(true);
      } else {
        setHasAdminAccess(false);
        navigate('/');
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  if (hasAdminAccess === null || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!hasAdminAccess) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">Gérez la plateforme et la modération</p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total_users}</p>
                <p className="text-xs text-muted-foreground">Total inscrits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Publications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total_posts}</p>
                <p className="text-xs text-muted-foreground">Total de posts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                  Commentaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total_comments}</p>
                <p className="text-xs text-muted-foreground">Total de commentaires</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4 text-red-600" />
                  Signalements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.pending_reports}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="moderation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="moderation" className="gap-2">
              <Shield className="h-4 w-4" />
              Modération
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation">
            <ModerationTools />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Gérez les utilisateurs, bannissements et vérifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fonctionnalité en développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Statistiques détaillées
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble de l'activité de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">SAMP Zones</p>
                        <p className="text-2xl font-bold">{stats.total_spaces}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Signalements total</p>
                        <p className="text-2xl font-bold">{stats.total_reports}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
