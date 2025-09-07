import { useState, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  initialItems: T[];
  fetchMoreItems: (page: number) => Promise<T[]>;
  itemsPerPage?: number;
}

export function useInfiniteScroll<T>({
  initialItems,
  fetchMoreItems,
  itemsPerPage = 10
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await fetchMoreItems(page + 1);
      
      if (newItems.length === 0 || newItems.length < itemsPerPage) {
        setHasMore(false);
      }

      setItems(prevItems => [...prevItems, ...newItems]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [fetchMoreItems, page, isLoading, hasMore, itemsPerPage]);

  const reset = useCallback(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(true);
    setIsLoading(false);
    setError(null);
  }, [initialItems]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset
  };
}