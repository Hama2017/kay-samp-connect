import { useEffect, useRef, useCallback } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface InfiniteScrollLoaderProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  children?: React.ReactNode;
  hasAnyItems?: boolean; // New prop to indicate if there were any items loaded
}

export function InfiniteScrollLoader({ 
  hasMore, 
  isLoading, 
  onLoadMore, 
  threshold = 100,
  children,
  hasAnyItems = false
}: InfiniteScrollLoaderProps) {
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    const currentRef = loadingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleIntersection, threshold]);

  // Don't show "you've seen it all" if there were never any items to begin with
  if (!hasMore && !hasAnyItems) {
    return null;
  }

  if (!hasMore) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Vous avez tout vu ! 🎉</p>
        <p className="text-sm mt-1">Revenez plus tard pour de nouveaux contenus</p>
      </div>
    );
  }

  return (
    <>
      {children}
      <div ref={loadingRef} className="py-6">
        {isLoading && (
          <LoadingSpinner 
            size="md" 
            text="Chargement de plus de contenus..." 
          />
        )}
      </div>
    </>
  );
}