import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useRealNotifications } from "@/hooks/useRealNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  AtSign, 
  FileText, 
  Settings, 
  MoreVertical,
  Check,
  Trash2,
  Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'follow':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'mention':
      return <AtSign className="h-4 w-4 text-purple-500" />;
    case 'post':
      return <FileText className="h-4 w-4 text-primary" />;
    case 'system':
      return <Settings className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 relative ${
        !notification.is_read ? 'bg-primary/5 border-primary/20' : 'bg-background'
      }`}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
      )}

      {/* Icon */}
      <div className="flex-shrink-0 mt-1 ml-4">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Avatar (if user notification) */}
      {notification.actor_profile && (
        <Avatar className="h-10 w-10">
          <AvatarImage src={notification.actor_profile.profile_picture_url} alt={notification.actor_profile.username} />
          <AvatarFallback>
            {notification.actor_profile.username?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
            </p>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.is_read && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Marquer comme lu
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications 
  } = useRealNotifications();

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner size="lg" text="Chargement des notifications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Vous n'avez pas encore de notifications. Elles apparaîtront ici quand vous en recevrez."
            actionLabel="Actualiser"
            onAction={fetchNotifications}
          />
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                Non lues ({unreadCount})
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-2">
                Lues ({readNotifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les notifications</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-1">
                      {notifications.map((notification, index) => (
                        <div key={notification.id}>
                          <NotificationItem
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                          />
                          {index < notifications.length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unread">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications non lues</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">Toutes vos notifications sont lues !</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-1">
                        {unreadNotifications.map((notification, index) => (
                          <div key={notification.id}>
                            <NotificationItem
                              notification={notification}
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                            {index < unreadNotifications.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="read">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications lues</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {readNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucune notification lue</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-1">
                        {readNotifications.map((notification, index) => (
                          <div key={notification.id}>
                            <NotificationItem
                              notification={notification}
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                            {index < readNotifications.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}