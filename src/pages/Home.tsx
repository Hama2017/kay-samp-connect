import { useState } from "react";
import { MessageCircle, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Mock data for posts
const mockPosts = [
  {
    id: "1",
    author: {
      username: "AmadouD",
      profilePicture: "",
      isVerified: false,
    },
    space: {
      name: "Lions du Sénégal 🦁",
      id: "space_001",
    },
    content: "Les Lions vont affronter le Nigeria demain ! Qui pensez-vous sera dans le onze de départ ? 🇸🇳⚽",
    publicationDate: "2024-03-15T08:30:00Z",
    votesUp: 23,
    votesDown: 2,
    commentsCount: 8,
    viewsCount: 145,
    category: "Sport",
    hashtags: ["#Lions", "#Nigeria", "#CAN2024"],
  },
  {
    id: "2",
    author: {
      username: "FatimaK",
      profilePicture: "",
      isVerified: true,
    },
    space: {
      name: "Cuisine Sénégalaise",
      id: "space_002",
    },
    content: "Nouvelle recette de thiébou dieune avec des légumes de saison ! Qui veut la recette complète ? 🍽️",
    publicationDate: "2024-03-15T07:15:00Z",
    votesUp: 45,
    votesDown: 1,
    commentsCount: 12,
    viewsCount: 203,
    category: "Cuisine",
    hashtags: ["#Cuisine", "#Thiébou", "#Recette"],
  },
];

const categories = ["Tous", "Sport", "Culture", "Cuisine", "Technologie", "Religion"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Welcome section */}
      <div className="text-center mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Bienvenue sur KaaySamp
        </h1>
        <p className="text-muted-foreground">
          Viens t'asseoir et découvre ta communauté sénégalaise
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "senegal" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Posts feed */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.profilePicture} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {post.author.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">@{post.author.username}</span>
                      {post.author.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      dans {post.space.name}
                    </p>
                  </div>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-foreground mb-4 leading-relaxed">
                {post.content}
              </p>
              
              {/* Hashtags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                      <ArrowUp className="h-4 w-4" />
                      <span className="text-xs ml-1">{post.votesUp}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <ArrowDown className="h-4 w-4" />
                      <span className="text-xs ml-1">{post.votesDown}</span>
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs ml-1">{post.commentsCount}</span>
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span className="text-xs">{post.viewsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}