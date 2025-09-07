import { useState } from "react";
import { MessageCircle, ChevronUp, ChevronDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostCommentsModal } from "@/components/PostCommentsModal";

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
    content: "Qui connaît la recette authentique du thieboudienne de grand-mère ? Je cherche les vraies techniques traditionnelles qui se transmettent de génération en génération. Ma grand-mère utilisait toujours des ingrédients spéciaux qu'elle achetait au marché de Sandaga, et elle avait une façon particulière de préparer le poisson qui donnait un goût unique au plat. J'aimerais vraiment retrouver ces saveurs d'antan et perpétuer cette tradition culinaire sénégalaise dans ma famille. Les épices qu'elle utilisait avaient des noms que je ne connais même plus aujourd'hui. Et son riz, il avait cette couleur dorée parfaite et cette texture qui fondait dans la bouche. Quelqu'un pourrait-il partager les secrets de leurs aînés ?",
    publicationDate: "2024-03-15T07:15:00Z",
    votesUp: 45,
    votesDown: 1,
    commentsCount: 12,
    viewsCount: 203,
    category: "Cuisine",
    hashtags: ["#Thiébou", "#Recette", "#Tradition"],
  },
  {
    id: "3",
    author: {
      username: "OmarB",
      profilePicture: "",
      isVerified: false,
    },
    space: {
      name: "Tech Dakar",
      id: "space_003",
    },
    content: "Le nouveau hub technologique à Diamniadio va changer la donne pour l'innovation au Sénégal 🚀",
    publicationDate: "2024-03-15T12:45:00Z",
    votesUp: 31,
    votesDown: 3,
    commentsCount: 6,
    viewsCount: 187,
    category: "Technologie",
    hashtags: ["#TechDakar", "#Innovation", "#Diamniadio"],
  },
  {
    id: "4",
    author: {
      username: "AissaN",
      profilePicture: "",
      isVerified: true,
    },
    space: {
      name: "Mode & Style Sénégal",
      id: "space_004",
    },
    content: "Nouveau design de boubou inspiré des motifs traditionnels ! Qu'est-ce que vous en pensez ? ✨",
    image: "https://images.unsplash.com/photo-1594736797933-d0baac66dbdd?w=400&h=300&fit=crop",
    publicationDate: "2024-03-15T14:20:00Z",
    votesUp: 67,
    votesDown: 2,
    commentsCount: 24,
    viewsCount: 312,
    category: "Mode",
    hashtags: ["#Boubou", "#Mode", "#Tradition", "#Design"],
  },
  {
    id: "5",
    author: {
      username: "MoussaK",
      profilePicture: "",
      isVerified: false,
    },
    space: {
      name: "Politique Sénégal",
      id: "space_005",
    },
    content: "L'analyse des dernières réformes économiques au Sénégal révèle des tendances intéressantes qui méritent d'être débattues en profondeur. Les nouvelles politiques fiscales adoptées par le gouvernement visent à stimuler l'investissement privé tout en renforçant les recettes publiques. Cependant, plusieurs économistes s'interrogent sur l'impact réel de ces mesures sur les petites et moyennes entreprises qui constituent l'épine dorsale de notre économie. Il est crucial d'analyser les données macroéconomiques des six derniers mois pour évaluer l'efficacité de ces réformes et leur contribution à la croissance économique durable du pays. Les secteurs de l'agriculture, de la pêche et du tourisme semblent particulièrement affectés par ces changements de politique économique. Une étude approfondie s'impose pour comprendre les enjeux à long terme.",
    publicationDate: "2024-03-15T16:30:00Z",
    votesUp: 89,
    votesDown: 12,
    commentsCount: 45,
    viewsCount: 567,
    category: "Politique",
    hashtags: ["#Économie", "#Réformes", "#Politique", "#Sénégal"],
  },
];

const categories = ["Tous", "Sport", "Culture", "Cuisine", "Technologie", "Religion"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedPost, setSelectedPost] = useState<typeof mockPosts[0] | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const handlePostClick = (post: typeof mockPosts[0]) => {
    setSelectedPost(post);
    setIsCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsOpen(false);
    setSelectedPost(null);
  };

  const toggleExpanded = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const isPostExpanded = (postId: string) => expandedPosts.has(postId);
  
  const shouldShowReadMore = (content: string) => content.length > 200;
  
  const getDisplayContent = (post: any) => {
    if (!shouldShowReadMore(post.content) || isPostExpanded(post.id)) {
      return post.content;
    }
    return post.content.substring(0, 200) + "...";
  };

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
          <Card 
            key={post.id} 
            className="hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
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
              <p className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap">
                {getDisplayContent(post)}
              </p>
              
              {/* Bouton lire la suite */}
              {shouldShowReadMore(post.content) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(post.id);
                  }}
                  className="text-primary text-sm font-medium mb-3 hover:underline"
                >
                  {isPostExpanded(post.id) ? "Lire moins" : "Lire la suite"}
                </button>
              )}
              
              {/* Image si présente */}
              {post.image && (
                <div className="mb-3">
                  <img 
                    src={post.image} 
                    alt="Post image" 
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>
              )}
              
              {/* Hashtags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Actions avec Up/Down */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-green-600">
                      <ChevronUp className="h-4 w-4" />
                      <span className="text-xs ml-1">{post.votesUp}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-red-600">
                      <ChevronDown className="h-4 w-4" />
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

      {/* Comments Modal */}
      <PostCommentsModal 
        post={selectedPost}
        isOpen={isCommentsOpen}
        onClose={handleCloseComments}
      />
    </div>
  );
}