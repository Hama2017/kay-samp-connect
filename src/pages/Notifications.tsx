import { useState } from "react";
import { Bell, MessageCircle, UserPlus, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "new_post",
    user: {
      username: "AmadouD",
      profilePicture: "",
      isVerified: true,
    },
    space: "Lions du Sénégal 🦁",
    content: "a publié un nouveau post dans",
    message: "Match important demain contre le Nigeria !",
    time: "il y a 2min",
    isRead: false,
  },
  {
    id: "2", 
    type: "comment",
    user: {
      username: "AminaK",
      profilePicture: "",
      isVerified: false,
    },
    content: "a commenté votre post:",
    message: "Excellente analyse ! J'espère qu'on va gagner",
    time: "il y a 15min",
    isRead: false,
  },
  {
    id: "3",
    type: "follow",
    user: {
      username: "MoussaK",
      profilePicture: "",
      isVerified: false,
    },
    content: "s'est abonné à votre compte",
    time: "il y a 1h",
    isRead: true,
  },
  {
    id: "4",
    type: "like",
    user: {
      username: "FatimaS",
      profilePicture: "",
      isVerified: true,
    },
    content: "a aimé votre post:",
    message: "Recette de thiébou dieune traditionnelle",
    time: "il y a 2h",
    isRead: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_post":
      return <TrendingUp className="h-4 w-4 text-primary" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;
  
  const filteredNotifications = mockNotifications.filter(notification => {
    if (filter === "unread") return !notification.isRead;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="relative">
            <Bell className="h-6 w-6 text-primary" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Notifications
          </h1>
        </div>
        <p className="text-muted-foreground">
          Reste informé de toute l'activité
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all">
            Toutes ({mockNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {filter === "unread" ? "Aucune nouvelle notification" : "Aucune notification"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "unread" 
                  ? "Toutes vos notifications sont à jour !" 
                  : "Vous recevrez des notifications ici quand il y aura de l'activité"
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-300 hover:shadow-md cursor-pointer ${
                  !notification.isRead ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.user.profilePicture} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-sm">
                          {notification.user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">@{notification.user.username}</span>
                        {notification.user.isVerified && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            ✓
                          </Badge>
                        )}
                        {!notification.isRead && (
                          <Badge className="h-2 w-2 rounded-full p-0 bg-primary"></Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">
                        {notification.content}
                        {notification.space && (
                          <span className="text-primary font-medium"> {notification.space}</span>
                        )}
                      </p>
                      
                      {notification.message && (
                        <p className="text-sm text-foreground bg-muted/50 p-2 rounded-md mb-2">
                          "{notification.message}"
                        </p>
                      )}
                      
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {unreadCount > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline" size="sm">
            Marquer tout comme lu
          </Button>
        </div>
      )}
    </div>
  );
}