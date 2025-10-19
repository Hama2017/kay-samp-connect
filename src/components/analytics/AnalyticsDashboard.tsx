import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SimpleBarChart, SimplePieChart, SimpleLineChart } from './SimpleChart';
import {
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  Clock,
  Target,
  Award,
  Activity
} from 'lucide-react';

export function AnalyticsDashboard() {
  const {
    userStats,
    engagementData,
    isLoading,
    getTopContent,
    getRecentActivity,
    getInsights
  } = useAnalytics();

  const insights = getInsights();
  const topContent = getTopContent();
  const recentActivity = getRecentActivity();

  const statsCards = [
    {
      title: 'Posts totaux',
      value: userStats.totalPosts,
      icon: Activity,
      color: 'text-blue-600',
      trend: '+12%'
    },
    {
      title: 'Likes reçus',
      value: userStats.totalLikes,
      icon: Heart,
      color: 'text-red-500',
      trend: '+8%'
    },
    {
      title: 'SAMPNA',
      value: userStats.totalFollowers,
      icon: Users,
      color: 'text-green-600',
      trend: '+15%'
    },
    {
      title: 'Vues profil',
      value: userStats.profileViews,
      icon: Eye,
      color: 'text-purple-600',
      trend: '+22%'
    }
  ];

  const engagementChartData = engagementData.slice(-7).map(day => ({
    name: new Date(day.date).toLocaleDateString('fr-FR', { 
      weekday: 'short'
    }),
    value: day.likes + day.comments + day.shares
  }));

  const pieData = [
    { name: 'Likes', value: userStats.totalLikes, color: '#ef4444' },
    { name: 'Commentaires', value: userStats.totalComments, color: '#3b82f6' },
    { name: 'Partages', value: userStats.totalShares, color: '#22c55e' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 w-20 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-2" />
                <div className="h-3 w-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.trend}</span> ce mois
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Insights de la semaine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm font-medium">Croissance d'engagement</p>
              <p className="text-2xl font-bold text-primary">
                {insights.weeklyGrowth > 0 ? '+' : ''}{insights.weeklyGrowth}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Engagement quotidien moyen</p>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(insights.averageDailyEngagement / 2, 100)} className="flex-1" />
                <span className="text-sm font-medium">{insights.averageDailyEngagement}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Série active</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{userStats.dailyActiveStreak} jours</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{insights.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Engagement des 30 derniers jours</CardTitle>
            <CardDescription>
              Évolution de vos interactions (likes, commentaires, partages)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={engagementChartData} height={300} />
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition de l'engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={pieData} size={200} />
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Contenu performant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topContent.map((content, index) => (
              <div key={content.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{content.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {content.views || content.members}
                    </span>
                    {content.likes && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {content.likes}
                      </span>
                    )}
                    <span className="text-primary font-medium">
                      {content.engagement}% engagement
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: fr })}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {activity.impact}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Session actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Temps passé</span>
                <span className="text-sm font-medium">
                  {Math.round(userStats.avgSessionDuration)} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sessions totales</span>
                <span className="text-sm font-medium">{userStats.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Membre depuis</span>
                <span className="text-sm font-medium">
                  {formatDistanceToNow(userStats.joinDate, { locale: fr })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}