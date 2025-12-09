import React, { useRef, useCallback, memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Comment } from "@/hooks/useComments";

interface VirtualizedCommentsListProps {
  comments: Comment[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onVoteComment: (commentId: string, voteType: 'up' | 'down') => void;
  onReplyClick: (commentId: string, username: string) => void;
  getCommentVotes: (comment: Comment) => { votes_up: number; votes_down: number; current_user_vote: 'up' | 'down' | null };
  formatDate: (date: string) => string;
  expandedReplies: Set<string>;
  toggleReplies: (commentId: string) => void;
  onImageClick: (url: string) => void;
  isSubmitting: boolean;
}

// Memoized comment item for better performance
const CommentItem = memo(({
  comment,
  onVoteComment,
  onReplyClick,
  getCommentVotes,
  formatDate,
  expandedReplies,
  toggleReplies,
  onImageClick,
  isSubmitting,
}: {
  comment: Comment;
  onVoteComment: (commentId: string, voteType: 'up' | 'down') => void;
  onReplyClick: (commentId: string, username: string) => void;
  getCommentVotes: (comment: Comment) => { votes_up: number; votes_down: number; current_user_vote: 'up' | 'down' | null };
  formatDate: (date: string) => string;
  expandedReplies: Set<string>;
  toggleReplies: (commentId: string) => void;
  onImageClick: (url: string) => void;
  isSubmitting: boolean;
}) => {
  const votes = getCommentVotes(comment);

  return (
    <div className="py-4 px-4 border-b border-border">
      {/* Commentaire principal */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.profiles?.profile_picture_url || ""} />
          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
            {comment.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Username et temps */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-base text-foreground">
              {comment.profiles?.username || "Unknown"}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          
          {/* Full name */}
          {comment.profiles?.full_name && (
            <p className="text-xs font-medium text-foreground/80 mb-1">
              {comment.profiles.full_name}
            </p>
          )}
          
          {/* Contenu */}
          {comment.content && (
            <p className="text-base text-foreground mb-2 leading-normal break-all">
              {comment.content}
            </p>
          )}
          
          {/* Médias */}
          {comment.comment_media && comment.comment_media.length > 0 && (
            <div className="mb-3">
              {comment.comment_media.map((media) => (
                <img
                  key={media.id}
                  src={media.media_url}
                  alt="Comment media"
                  className="max-w-full h-auto rounded-lg max-h-40 border border-border cursor-pointer hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onClick={() => onImageClick(media.media_url)}
                />
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-6 mt-2">
            <button 
              onClick={() => onVoteComment(comment.id, 'up')}
              className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors"
              disabled={isSubmitting}
            >
              <ChevronUp className={`h-4 w-4 ${votes.current_user_vote === 'up' ? 'text-green-500' : ''}`} />
              <span className="text-sm font-medium">{votes.votes_up}</span>
            </button>
            
            <button 
              onClick={() => onVoteComment(comment.id, 'down')}
              className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
              disabled={isSubmitting}
            >
              <ChevronDown className={`h-4 w-4 ${votes.current_user_vote === 'down' ? 'text-red-500' : ''}`} />
              <span className="text-sm font-medium">{votes.votes_down}</span>
            </button>
            
            <button 
              onClick={() => onReplyClick(comment.id, comment.profiles?.username || "Unknown")}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              Répondre
            </button>
          </div>
          
          {/* Bouton pour afficher les réponses */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="flex items-center gap-2 mt-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-sm font-medium">
                {expandedReplies.has(comment.id) ? (
                  `Masquer les ${comment.replies.length} réponses`
                ) : (
                  `Afficher les ${comment.replies.length} réponses`
                )}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                expandedReplies.has(comment.id) ? 'rotate-180' : ''
              }`} />
            </button>
          )}
        </div>
      </div>
      
      {/* Réponses */}
      {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => {
            const replyVotes = getCommentVotes(reply as Comment);
            return (
              <div key={reply.id} className="flex items-start gap-3 ml-8 border-l-2 border-border pl-4">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={reply.profiles?.profile_picture_url || ""} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {reply.profiles?.username?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {reply.profiles?.username || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-base text-foreground mb-2 leading-normal break-all">
                    {reply.content}
                  </p>

                  {/* Médias des réponses */}
                  {reply.comment_media && reply.comment_media.length > 0 && (
                    <div className="mb-3">
                      {reply.comment_media.map((media) => (
                        <img
                          key={media.id}
                          src={media.media_url}
                          alt="Comment media"
                          className="max-w-full h-auto rounded-lg max-h-40 border border-border cursor-pointer hover:opacity-90 transition-opacity"
                          loading="lazy"
                          onClick={() => onImageClick(media.media_url)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      onClick={() => onVoteComment(reply.id, 'up')}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors"
                      disabled={isSubmitting}
                    >
                      <ChevronUp className={`h-3 w-3 ${replyVotes.current_user_vote === 'up' ? 'text-green-500' : ''}`} />
                      <span className="text-xs">{replyVotes.votes_up}</span>
                    </button>
                    
                    <button 
                      onClick={() => onVoteComment(reply.id, 'down')}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                      disabled={isSubmitting}
                    >
                      <ChevronDown className={`h-3 w-3 ${replyVotes.current_user_vote === 'down' ? 'text-red-500' : ''}`} />
                      <span className="text-xs">{replyVotes.votes_down}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

export function VirtualizedCommentsList({
  comments,
  hasMore,
  isLoading,
  onLoadMore,
  onVoteComment,
  onReplyClick,
  getCommentVotes,
  formatDate,
  expandedReplies,
  toggleReplies,
  onImageClick,
  isSubmitting,
}: VirtualizedCommentsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Estimate size based on whether replies are expanded
  const estimateSize = useCallback((index: number) => {
    if (index >= comments.length) return 60; // Loader height
    const comment = comments[index];
    const hasMedia = comment.comment_media && comment.comment_media.length > 0;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const repliesExpanded = expandedReplies.has(comment.id);
    
    let baseHeight = 140; // Base comment height
    if (hasMedia) baseHeight += 180;
    if (hasReplies && repliesExpanded) {
      baseHeight += comment.replies!.length * 120; // Each reply
    }
    return baseHeight;
  }, [comments, expandedReplies]);

  const virtualizer = useVirtualizer({
    count: comments.length + (hasMore ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 3,
  });

  // Load more when near bottom
  React.useEffect(() => {
    const items = virtualizer.getVirtualItems();
    const lastItem = items[items.length - 1];
    
    if (lastItem && lastItem.index >= comments.length - 2 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [virtualizer.getVirtualItems(), comments.length, hasMore, isLoading, onLoadMore]);

  const virtualItems = virtualizer.getVirtualItems();

  if (isLoading && comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-3"></div>
        <p className="text-muted-foreground text-sm">Chargement des commentaires...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground font-medium mb-1">Aucun commentaire</p>
        <p className="text-sm text-muted-foreground">Soyez le premier à commenter !</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const index = virtualRow.index;

          // Loader item
          if (index >= comments.length) {
            return (
              <div
                key="loader"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
                {!isLoading && hasMore && (
                  <div className="text-center py-4">
                    <Button variant="ghost" onClick={onLoadMore} size="sm">
                      Charger plus
                    </Button>
                  </div>
                )}
              </div>
            );
          }

          const comment = comments[index];

          return (
            <div
              key={comment.id}
              data-index={index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <CommentItem
                comment={comment}
                onVoteComment={onVoteComment}
                onReplyClick={onReplyClick}
                getCommentVotes={getCommentVotes}
                formatDate={formatDate}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
                onImageClick={onImageClick}
                isSubmitting={isSubmitting}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
