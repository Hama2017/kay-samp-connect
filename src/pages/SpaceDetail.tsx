import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Hash, Plus, MessageCircle, ChevronUp, ChevronDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Mock data for space details
const mockSpaceDetails = {
  "space_001": {
    id: "space_001",
    name: "Lions du Sénégal 🦁",
    description: "Tout sur l'équipe nationale de football du Sénégal. Discussions, analyses, actualités et passion partagée pour nos Lions !",
    category: "Sport",
    subscribersCount: 1247,
    isVerified: true,
    coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isSubscribed: true,
    rules: [
      "Respecter tous les membres",
      "Pas de spam ou de contenu inapproprié",
      "Rester dans le sujet du football sénégalais",
      "Partager des sources fiables"
    ]
  }
};

// Mock posts for this space
const mockSpacePosts = [
  {
    id: "post_space_1",
    author: {
      username: "FootballFan221",
      profilePicture: "",
      isVerified: false,
    },
    space: {
      name: "Lions du Sénégal 🦁",
      id: "space_001",
    },
    content: "Quelle formation préférez-vous pour le prochain match des Lions ? 🦁⚽",
    publicationDate: "2024-03-15T10:30:00Z",
    votesUp: 24,
    votesDown: 2,
    commentsCount: 8,
    viewsCount: 156,
    category: "Sport",
    hashtags: ["#Lions", "#Formation", "#Football"],
  },
  {
    id: "post_space_2",
    author: {
      username: "SenegalPride",
      profilePicture: "",
      isVerified: true,
    },
    space: {
      name: "Lions du Sénégal 🦁",
      id: "space_001",
    },
    content: "Les statistiques du dernier match sont impressionnantes ! Nos Lions ont montré une belle performance collective.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    publicationDate: "2024-03-15T09:15:00Z",
    votesUp: 45,
    votesDown: 1,
    commentsCount: 12,
    viewsCount: 289,
    category: "Sport",
    hashtags: ["#Lions", "#Performance", "#Statistiques"],
  }
];

export default function SpaceDetail() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const space = mockSpaceDetails[spaceId as keyof typeof mockSpaceDetails];

  if (!space) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Espace introuvable</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `il y a ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `il y a ${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Espace</h1>
      </div>

      {/* Space header */}
      <Card className="mb-6">
        {space.coverImage && (
          <div className="h-32 bg-gradient-primary rounded-t-lg relative overflow-hidden">
            <img 
              src={space.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{space.name}</h2>
                {space.isVerified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    ✓ Certifié
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <Badge variant="outline">{space.category}</Badge>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{space.subscribersCount} membres</span>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {space.description}
              </p>
            </div>
          </div>
          
          <Button
            variant={isSubscribed ? "outline" : "default"}
            className="w-full"
            onClick={() => setIsSubscribed(!isSubscribed)}
          >
            {isSubscribed ? (
              "Abonné"
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                S'abonner
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Rules section */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">Règles de l'espace</h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {space.rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-semibold">{index + 1}.</span>
                <span className="text-muted-foreground">{rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Posts section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Publications récentes</h3>
        
        {mockSpacePosts.map((post) => (
          <Card key={post.id} className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.profilePicture} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {post.author.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">@{post.author.username}</span>
                    {post.author.isVerified && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        ✓
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.publicationDate)}
                    </span>
                  </div>
                  
                  <p className="text-foreground leading-relaxed mb-3">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="mb-3">
                      <img 
                        src={post.image} 
                        alt="Post image" 
                        className="rounded-lg max-w-full h-auto"
                      />
                    </div>
                  )}

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.map((tag) => (
                        <span key={tag} className="text-sm text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-green-600">
                        <ChevronUp className="h-4 w-4" />
                        {post.votesUp}
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        <ChevronDown className="h-4 w-4" />
                        {post.votesDown}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post.commentsCount}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {post.viewsCount}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}