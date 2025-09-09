import { useState } from 'react';
import { Clock, Eye, Share, Flag, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { usePostDetail } from '@/hooks/usePostDetail';
import { PostActions } from '@/components/PostActions';
import PostMediaDisplay from '@/components/PostMediaDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface PostModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ postId, isOpen, onClose }: PostModalProps) {
  const navigate = useNavigate();
  const { post, isLoading, error, votePost, addComment, voteComment } = usePostDetail(postId || '');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  if (!isOpen || !postId) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Chargement du post..." />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !post) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Post introuvable</h2>
            <p className="text-muted-foreground mb-4">
              Ce post n'existe pas ou a été supprimé.
            </p>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header avec actions */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <span className="font-medium">Publication</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Post principal */}
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-4 px-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar 
                        className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${post.profiles.username}`);
                          onClose();
                        }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${post.profiles.username}`);
                              onClose();
                            }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/space/${post.spaces?.id}`);
                                  onClose();
                                }}
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
                
                <CardContent className="space-y-4 px-0">
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
                    onOpenComments={() => {}} // Déjà dans le modal
                    hideCommentButton={true}
                  />
                </CardContent>
              </Card>

              {/* Section des commentaires */}
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                      Commentaires ({post.comments.length})
                    </h2>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 px-0">
                  {/* Formulaire d'ajout de commentaire */}
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <Textarea
                      placeholder="Ajouter un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={!newComment.trim() || isSubmitting}
                        size="sm"
                      >
                        {isSubmitting ? 'Envoi...' : 'Commenter'}
                      </Button>
                    </div>
                  </form>
                  
                  {/* Liste des commentaires */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {post.comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Aucun commentaire pour le moment. Soyez le premier à commenter !
                        </p>
                      </div>
                    ) : (
                      post.comments.map((comment) => (
                        <Card key={comment.id} className="border-l-4 border-l-primary/20">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={comment.profiles.profile_picture_url} />
                                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                  {comment.profiles.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">
                                    @{comment.profiles.username}
                                  </span>
                                  {comment.profiles.is_verified && (
                                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                      ✓
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                                  </span>
                                </div>
                                
                                <p className="text-sm break-words whitespace-pre-wrap">
                                  {comment.content}
                                </p>
                                
                                {/* Actions du commentaire */}
                                <div className="flex items-center gap-4 pt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => voteComment(comment.id, 'up')}
                                    className={`h-8 px-2 ${comment.current_user_vote === 'up' ? 'text-primary' : ''}`}
                                  >
                                    👍 {comment.votes_up > 0 && comment.votes_up}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => voteComment(comment.id, 'down')}
                                    className={`h-8 px-2 ${comment.current_user_vote === 'down' ? 'text-destructive' : ''}`}
                                  >
                                    👎 {comment.votes_down > 0 && comment.votes_down}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}