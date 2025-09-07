import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  item: {
    id: string;
    type: 'post' | 'space' | 'user';
    title: string;
    description?: string;
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
    thumbnail?: string;
    createdAt: Date;
    metadata?: Record<string, any>;
  };
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

export function BookmarkButton({ 
  item, 
  variant = 'ghost', 
  size = 'sm',
  showText = false,
  className 
}: BookmarkButtonProps) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(item.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleBookmark({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      author: item.author,
      thumbnail: item.thumbnail,
      createdAt: item.createdAt,
      metadata: item.metadata
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200",
        bookmarked && "text-primary",
        className
      )}
    >
      {bookmarked ? (
        <BookmarkCheck className={cn(
          "h-4 w-4",
          showText && "mr-2"
        )} />
      ) : (
        <Bookmark className={cn(
          "h-4 w-4", 
          showText && "mr-2"
        )} />
      )}
      {showText && (
        <span>{bookmarked ? 'Retiré' : 'Sauvegarder'}</span>
      )}
    </Button>
  );
}