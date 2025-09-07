import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BookmarkedItem {
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
  bookmarkedAt: Date;
  metadata?: Record<string, any>;
}

// Mock data pour les favoris
const mockBookmarks: BookmarkedItem[] = [
  {
    id: 'post-1',
    type: 'post',
    title: 'Comment réussir son thiébou dieune traditionnel',
    description: 'Recette authentique transmise de génération en génération...',
    author: {
      id: 'user-1',
      name: 'Aminata Diop',
      avatar: '/placeholder.svg?height=40&width=40'
    },
    thumbnail: '/placeholder.svg?height=200&width=300',
    createdAt: new Date('2024-03-15'),
    bookmarkedAt: new Date('2024-03-16'),
    metadata: {
      likes: 89,
      comments: 34,
      category: 'Cuisine'
    }
  },
  {
    id: 'space-1', 
    type: 'space',
    title: 'Tech Dakar',
    description: 'Communauté des développeurs et entrepreneurs tech de Dakar',
    thumbnail: '/placeholder.svg?height=200&width=300',
    createdAt: new Date('2024-02-01'),
    bookmarkedAt: new Date('2024-03-10'),
    metadata: {
      members: 1247,
      posts: 156,
      category: 'Technologie'
    }
  },
  {
    id: 'post-2',
    type: 'post', 
    title: 'Retour sur le Sommet Digital Africa à Dakar',
    description: 'Mes impressions et takeaways du plus grand événement tech...',
    author: {
      id: 'user-2',
      name: 'Ousmane Kane',
      avatar: '/placeholder.svg?height=40&width=40'
    },
    createdAt: new Date('2024-03-12'),
    bookmarkedAt: new Date('2024-03-13'),
    metadata: {
      likes: 156,
      comments: 42,
      category: 'Technologie'
    }
  },
  {
    id: 'user-1',
    type: 'user',
    title: 'Fatou Seck',
    description: 'Entrepreneure sociale | Défenseuse des droits des femmes',
    thumbnail: '/placeholder.svg?height=200&width=200',
    createdAt: new Date('2024-01-15'),
    bookmarkedAt: new Date('2024-03-05'),
    metadata: {
      followers: 2341,
      posts: 67,
      verified: true
    }
  },
  {
    id: 'post-3',
    type: 'post',
    title: 'Les startups sénégalaises qui changent l\'Afrique',
    description: 'Découvrez ces pépites technologiques made in Sénégal...',
    author: {
      id: 'user-3',
      name: 'Mamadou Dieng',
      avatar: '/placeholder.svg?height=40&width=40'
    },
    createdAt: new Date('2024-03-08'),
    bookmarkedAt: new Date('2024-03-09'),
    metadata: {
      likes: 203,
      comments: 58,
      category: 'Business'
    }
  }
];

export function useBookmarks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les favoris depuis le localStorage (simulation API)
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Simuler un appel API
      setTimeout(() => {
        const saved = localStorage.getItem(`bookmarks_${user.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setBookmarks(parsed.map((b: any) => ({
              ...b,
              createdAt: new Date(b.createdAt),
              bookmarkedAt: new Date(b.bookmarkedAt)
            })));
          } catch {
            setBookmarks(mockBookmarks);
          }
        } else {
          setBookmarks(mockBookmarks);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [user]);

  // Sauvegarder dans le localStorage
  const saveBookmarks = useCallback((newBookmarks: BookmarkedItem[]) => {
    if (user) {
      localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(newBookmarks));
    }
  }, [user]);

  const addBookmark = useCallback((item: Omit<BookmarkedItem, 'bookmarkedAt'>) => {
    const newBookmark: BookmarkedItem = {
      ...item,
      bookmarkedAt: new Date()
    };

    setBookmarks(prev => {
      const updated = [newBookmark, ...prev.filter(b => b.id !== item.id)];
      saveBookmarks(updated);
      return updated;
    });

    toast({
      title: '⭐ Ajouté aux favoris',
      description: `"${item.title}" a été ajouté à vos favoris`,
      duration: 3000,
    });
  }, [saveBookmarks, toast]);

  const removeBookmark = useCallback((itemId: string) => {
    const itemToRemove = bookmarks.find(b => b.id === itemId);
    
    setBookmarks(prev => {
      const updated = prev.filter(b => b.id !== itemId);
      saveBookmarks(updated);
      return updated;
    });

    if (itemToRemove) {
      toast({
        title: '🗑️ Retiré des favoris',
        description: `"${itemToRemove.title}" a été retiré de vos favoris`,
        duration: 3000,
      });
    }
  }, [bookmarks, saveBookmarks, toast]);

  const toggleBookmark = useCallback((item: Omit<BookmarkedItem, 'bookmarkedAt'>) => {
    const isBookmarked = bookmarks.some(b => b.id === item.id);
    
    if (isBookmarked) {
      removeBookmark(item.id);
    } else {
      addBookmark(item);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  const isBookmarked = useCallback((itemId: string) => {
    return bookmarks.some(b => b.id === itemId);
  }, [bookmarks]);

  const getBookmarksByType = useCallback((type: BookmarkedItem['type']) => {
    return bookmarks.filter(b => b.type === type);
  }, [bookmarks]);

  const getBookmarksByCategory = useCallback((category: string) => {
    return bookmarks.filter(b => b.metadata?.category === category);
  }, [bookmarks]);

  const searchBookmarks = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(lowercaseQuery) ||
      b.description?.toLowerCase().includes(lowercaseQuery) ||
      b.author?.name.toLowerCase().includes(lowercaseQuery)
    );
  }, [bookmarks]);

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
    saveBookmarks([]);
    toast({
      title: '🧹 Favoris supprimés',
      description: 'Tous vos favoris ont été supprimés',
      duration: 3000,
    });
  }, [saveBookmarks, toast]);

  const exportBookmarks = useCallback(() => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kaaysamp-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: '📥 Export réussi',
      description: 'Vos favoris ont été exportés avec succès',
      duration: 3000,
    });
  }, [bookmarks, toast]);

  const getStats = useCallback(() => {
    const postCount = bookmarks.filter(b => b.type === 'post').length;
    const spaceCount = bookmarks.filter(b => b.type === 'space').length;
    const userCount = bookmarks.filter(b => b.type === 'user').length;
    
    const categories = bookmarks.reduce((acc, bookmark) => {
      const category = bookmark.metadata?.category || 'Autre';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentCount = bookmarks.filter(b => {
      const daysDiff = (Date.now() - b.bookmarkedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return {
      total: bookmarks.length,
      posts: postCount,
      spaces: spaceCount,
      users: userCount,
      categories,
      recentCount
    };
  }, [bookmarks]);

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmarksByType,
    getBookmarksByCategory,
    searchBookmarks,
    clearAllBookmarks,
    exportBookmarks,
    getStats
  };
}