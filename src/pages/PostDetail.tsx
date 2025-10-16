import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Share, Flag, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePostDetail } from '@/hooks/usePostDetail';
import { usePageTracking } from '@/hooks/usePageTracking';
import { PostActions } from '@/components/PostActions';
import PostMediaDisplay from '@/components/PostMediaDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PostCommentsModal } from '@/components/PostCommentsModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRealBookmarks } from '@/hooks/useRealBookmarks';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post, isLoading, error, votePost } = usePostDetail(id || '');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const { isBookmarked, toggleBookmark } = useRealBookmarks();

  usePageTracking();

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

  const handleBookmarkToggle = () => {
    if (!post) return;
    toggleBookmark({
      item_type: "post",
      item_id: post.id,
      title: post.title || post.content.slice(0, 100),
      description: post.content,
      metadata: {
        author: post.profiles.username,
        likes: post.votes_up,
        comments: post.comments_count,
        category: "post",
      },
    });
  };

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

  const bookmarked = isBookmarked(post.id, "post");

  return (
    <div className="w-full mx-auto px-4 py-4 sm:py-6 max-w-4xl overflow-hidden animate-fade-in-up">
      {/* Header avec bouton retour */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Button>
      </div>

      {/* Post avec le même style que InfinitePostsList */}
      <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in-up max-w-full overflow-hidden border-0">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Avatar 
                className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 ring-2 ring-[#1f9463]/10 hover:ring-[#1f9463]/20"
                onClick={(e) => {
                  e.stopPropagation();
                  if (user?.profile?.username === post.profiles.username) {
                    navigate('/profile');
                  } else {
                    navigate(`/user/${post.profiles.username}`);
                  }
                }}
              >
                <AvatarImage src={post.profiles.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-[#1f9463] to-[#43ca92] text-white font-semibold text-xs sm:text-sm">
                  {post.profiles.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span 
                    className="font-semibold text-xs sm:text-sm cursor-pointer hover:text-[#1f9463] transition-colors truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user?.profile?.username === post.profiles.username) {
                        navigate('/profile');
                      } else {
                        navigate(`/user/${post.profiles.username}`);
                      }
                    }}
                  >
                    @{post.profiles.username} 
                  </span>
                  {post.profiles.is_verified && (
                    <>
                      <BadgeCheck size={20} color="#329056ff" />
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {post.spaces?.name ? `dans ${post.spaces.name}` : "dans Général"} • {formatDate(post.created_at)}
                </p>
              </div>
            </div>

            {/* Bouton favoris avec vos couleurs */}
            <Button
              variant={bookmarked ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleBookmarkToggle();
              }}
              className={`text-xs px-3 py-1.5 h-8 font-medium rounded-full transition-colors ${
                bookmarked
                  ? "bg-[#1f9463] hover:bg-[#43ca92] text-white border border-[#1f9463]"
                  : "hover:bg-[#1f9463]/10 hover:text-[#1f9463] border border-[#1f9463]/30 hover:border-[#1f9463]"
              }`}
            >
              {bookmarked ? "Sampna" : "DemaySamp"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
          {/* Titre si présent */}
          {post.title && (
            <div className="text-lg font-bold text-foreground break-words mb-3">
              {post.title}
            </div>
          )}
          
          {/* Contenu */}
          <div 
            className="text-foreground mb-3 leading-relaxed break-all max-w-full overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/#(\w+)/g, '<span style="color: #1f9463; font-weight: 600;">#$1</span>')
            }}
          />
          
          {/* Médias */}
          <PostMediaDisplay 
            media={post.post_media || []} 
            maxHeight="max-h-[70vh]"
          />
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="text-xs text-[#1f9463] hover:text-[#43ca92] cursor-pointer transition-colors">
                  {tag}
                </span>
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