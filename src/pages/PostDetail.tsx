import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Share, Flag, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePostDetail } from '@/hooks/usePostDetail';
import { usePageTracking } from '@/hooks/usePageTracking';
import { PostActions } from '@/components/PostActions';
import PostMediaDisplay from '@/components/PostMediaDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PostCommentsModal } from '@/components/PostCommentsModal';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { post, isLoading, error, votePost } = usePostDetail(id || '');
  const [selectedPost, setSelectedPost] = useState<any>(null);

  usePageTracking();

  if (isLoading) {
    return (
      <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Chargement du post..." />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl overflow-hidden">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Post introuvable</h2>
            <p className="text-muted-foreground mb-4">
              Ce post n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl overflow-hidden animate-fade-in-up">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Partager</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Signaler</span>
          </Button>
        </div>
      </div>

      {/* Post principal */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar 
                className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/user/${post.profiles.username}`)}
              >
                <AvatarImage src={post.profiles.profile_picture_url} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {post.profiles.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="font-semibold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/user/${post.profiles.username}`)}
                  >
                    @{post.profiles.username}
                  </span>
                  {post.profiles.is_verified && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      ✓
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  {post.spaces && (
                    <>
                      <span 
                        className="hover:text-primary cursor-pointer"
                        onClick={() => navigate(`/space/${post.spaces?.id}`)}
                      >
                        dans {post.spaces.name}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.views_count}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {post.spaces && (
              <Badge variant="outline" className="text-xs flex-shrink-0 hidden sm:block">
                {post.spaces.category}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Titre si présent */}
          {post.title && (
            <h1 className="text-2xl font-bold text-foreground break-words">
              {post.title}
            </h1>
          )}
          
          {/* Contenu */}
          <div 
            className="text-foreground leading-relaxed break-all whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/#(\w+)/g, '<span style="color: hsl(var(--primary)); font-weight: 600;">#$1</span>')
            }}
          />
          
          {/* Médias */}
          <PostMediaDisplay 
            media={post.post_media} 
            showControls={true}
          />
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <PostActions 
            post={{
              id: post.id,
              title: post.title,
              content: post.content,
              votes_up: post.votes_up,
              votes_down: post.votes_down,
              comments_count: post.comments_count,
              views_count: post.views_count,
              current_user_vote: post.current_user_vote,
              profiles: {
                username: post.profiles.username
              }
            }}
            onVote={votePost}
            onOpenComments={() => setSelectedPost(post)}
          />
        </CardContent>
      </Card>

      {/* Modal des commentaires */}
      <PostCommentsModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onVote={votePost}
      />
    </div>
  );
}