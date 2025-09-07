import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useBookmarks, BookmarkedItem } from '@/hooks/useBookmarks';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, 
  FileText, 
  Users, 
  Hash, 
  Trash2, 
  Download, 
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface BookmarkItemCardProps {
  bookmark: BookmarkedItem;
  onRemove: (id: string) => void;
}

function BookmarkItemCard({ bookmark, onRemove }: BookmarkItemCardProps) {
  const getIcon = () => {
    switch (bookmark.type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'space':
        return <Hash className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
    }
  };

  const getMetadata = () => {
    switch (bookmark.type) {
      case 'post':
        return (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {bookmark.metadata?.likes && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {bookmark.metadata.likes}
              </span>
            )}
            {bookmark.metadata?.comments && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {bookmark.metadata.comments}
              </span>
            )}
          </div>
        );
      case 'space':
        return (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {bookmark.metadata?.members && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {bookmark.metadata.members} membres
              </span>
            )}
            {bookmark.metadata?.posts && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {bookmark.metadata.posts} posts
              </span>
            )}
          </div>
        );
      case 'user':
        return (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {bookmark.metadata?.followers && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {bookmark.metadata.followers} abonnés
              </span>
            )}
            {bookmark.metadata?.verified && (
              <Badge variant="secondary" className="h-5">Vérifié</Badge>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Thumbnail/Avatar */}
          {bookmark.type === 'user' ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={bookmark.thumbnail} alt={bookmark.title} />
              <AvatarFallback>
                {bookmark.title.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : bookmark.thumbnail ? (
            <div 
              className="w-12 h-12 bg-muted rounded-lg bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url(${bookmark.thumbnail})` }}
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              {getIcon()}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">{bookmark.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getIcon()}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRemove(bookmark.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {bookmark.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {bookmark.description}
              </p>
            )}

            {bookmark.author && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={bookmark.author.avatar} />
                  <AvatarFallback className="text-xs">
                    {bookmark.author.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {bookmark.author.name}
                </span>
              </div>
            )}

            {getMetadata()}

            <div className="flex items-center justify-between mt-3">
              {bookmark.metadata?.category && (
                <Badge variant="outline" className="text-xs">
                  {bookmark.metadata.category}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Ajouté {formatDistanceToNow(bookmark.bookmarkedAt, { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookmarksList() {
  const {
    bookmarks,
    isLoading,
    removeBookmark,
    getBookmarksByType,
    searchBookmarks,
    clearAllBookmarks,
    exportBookmarks,
    getStats
  } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const stats = getStats();
  
  const filteredBookmarks = searchQuery 
    ? searchBookmarks(searchQuery)
    : selectedCategory === 'all' 
    ? bookmarks 
    : getBookmarksByType(selectedCategory as BookmarkedItem['type']);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Chargement de vos favoris..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.posts}</div>
            <p className="text-sm text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.spaces}</div>
            <p className="text-sm text-muted-foreground">Espaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.recentCount}</div>
            <p className="text-sm text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans vos favoris..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportBookmarks}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Tout supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer tous les favoris ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Tous vos favoris seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllBookmarks}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Bookmarks List */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Tous ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="post">
            Posts ({stats.posts})
          </TabsTrigger>
          <TabsTrigger value="space">
            Espaces ({stats.spaces})
          </TabsTrigger>
          <TabsTrigger value="user">
            Utilisateurs ({stats.users})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredBookmarks.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title={searchQuery ? "Aucun résultat" : "Aucun favori"}
              description={
                searchQuery 
                  ? `Aucun favori ne correspond à "${searchQuery}"`
                  : "Vous n'avez pas encore de favoris. Commencez à marquer du contenu qui vous intéresse !"
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkItemCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onRemove={removeBookmark}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}