import { useState, useMemo } from 'react';

// Mock users for search
const mockUsers = [
  {
    id: "1",
    username: "AmadouD",
    isVerified: false,
    followersCount: 156,
    followingCount: 89,
    joinDate: "2024-01-15",
    bio: "Passionné de football sénégalais 🦁⚽"
  },
  {
    id: "2", 
    username: "FatimaK",
    isVerified: true,
    followersCount: 342,
    followingCount: 127,
    joinDate: "2023-11-20",
    bio: "Chef cuisinière - Spécialiste de la cuisine traditionnelle sénégalaise"
  },
  {
    id: "3",
    username: "OmarB",
    isVerified: false,
    followersCount: 98,
    followingCount: 67,
    joinDate: "2024-02-08",
    bio: "Développeur Tech à Dakar 💻"
  }
];

// Données mockées pour les posts (centralisées)
export const mockPosts = [
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
    content: "Qui connaît la recette authentique du thieboudienne de grand-mère ? Je cherche les vraies techniques traditionnelles.",
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
    content: "Le nouveau quartier tech de Diamniadio va révolutionner l'écosystème numérique sénégalais ! 💻🚀",
    publicationDate: "2024-03-15T06:45:00Z",
    votesUp: 34,
    votesDown: 3,
    commentsCount: 15,
    viewsCount: 189,
    category: "Technologie",
    hashtags: ["#TechDakar", "#Innovation", "#Diamniadio"],
  }
];

// Données mockées pour les espaces (centralisées)
export const mockSpaces = [
  {
    id: "space_001",
    name: "Lions du Sénégal 🦁",
    description: "Tout sur l'équipe nationale de football",
    category: "Sport",
    subscribersCount: 1247,
    isVerified: true,
    lastActivity: "2024-03-15T09:15:00Z",
    isSubscribed: true,
  },
  {
    id: "space_002",
    name: "Cuisine Sénégalaise",
    description: "Recettes et traditions culinaires du Sénégal",
    category: "Cuisine",
    subscribersCount: 892,
    isVerified: false,
    lastActivity: "2024-03-15T08:30:00Z",
    isSubscribed: false,
  },
  {
    id: "space_003",
    name: "Tech Dakar",
    description: "Innovation et technologie au Sénégal",
    category: "Technologie",
    subscribersCount: 567,
    isVerified: true,
    lastActivity: "2024-03-15T07:45:00Z",
    isSubscribed: true,
  },
  {
    id: "space_004",
    name: "Culture Sénégalaise",
    description: "Arts, musique et traditions du Sénégal",
    category: "Culture",
    subscribersCount: 1034,
    isVerified: false,
    lastActivity: "2024-03-14T20:30:00Z",
    isSubscribed: false,
  },
];

export interface SearchFilters {
  type: 'all' | 'posts' | 'spaces' | 'users';
  category: string;
  sortBy: 'relevance' | 'recent' | 'popular';
}

export interface SearchResult {
  posts: typeof mockPosts;
  spaces: typeof mockSpaces;
  users: typeof mockUsers;
  totalResults: number;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    category: 'Tous',
    sortBy: 'relevance'
  });

  const searchResults = useMemo((): SearchResult => {
    if (!query.trim()) {
      return {
        posts: [],
        spaces: [],
        users: [],
        totalResults: 0
      };
    }

    const searchTerm = query.toLowerCase();

    // Recherche dans les posts
    let filteredPosts = mockPosts.filter(post => 
      post.content.toLowerCase().includes(searchTerm) ||
      post.author.username.toLowerCase().includes(searchTerm) ||
      post.space.name.toLowerCase().includes(searchTerm) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.category.toLowerCase().includes(searchTerm)
    );

    // Recherche dans les espaces
    let filteredSpaces = mockSpaces.filter(space =>
      space.name.toLowerCase().includes(searchTerm) ||
      space.description.toLowerCase().includes(searchTerm) ||
      space.category.toLowerCase().includes(searchTerm)
    );

    // Recherche dans les utilisateurs
    let filteredUsers = mockUsers.filter(user =>
      user.username.toLowerCase().includes(searchTerm) ||
      (user.bio && user.bio.toLowerCase().includes(searchTerm))
    );

    // Filtrage par catégorie
    if (filters.category !== 'Tous') {
      filteredPosts = filteredPosts.filter(post => post.category === filters.category);
      filteredSpaces = filteredSpaces.filter(space => space.category === filters.category);
    }

    // Filtrage par type
    if (filters.type !== 'all') {
      if (filters.type !== 'posts') filteredPosts = [];
      if (filters.type !== 'spaces') filteredSpaces = [];
      if (filters.type !== 'users') filteredUsers = [];
    }

    // Tri
    switch (filters.sortBy) {
      case 'recent':
        filteredPosts.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
        filteredSpaces.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        break;
      case 'popular':
        filteredPosts.sort((a, b) => b.votesUp - a.votesUp);
        filteredSpaces.sort((a, b) => b.subscribersCount - a.subscribersCount);
        break;
      case 'relevance':
      default:
        // Score de pertinence basique
        filteredPosts.sort((a, b) => {
          const scoreA = (a.content.toLowerCase().includes(searchTerm) ? 2 : 0) + 
                        (a.author.username.toLowerCase().includes(searchTerm) ? 1 : 0);
          const scoreB = (b.content.toLowerCase().includes(searchTerm) ? 2 : 0) + 
                        (b.author.username.toLowerCase().includes(searchTerm) ? 1 : 0);
          return scoreB - scoreA;
        });
        break;
    }

    const totalResults = filteredPosts.length + filteredSpaces.length + filteredUsers.length;

    return {
      posts: filteredPosts,
      spaces: filteredSpaces,
      users: filteredUsers,
      totalResults
    };
  }, [query, filters]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    searchResults,
    isSearching: query.trim().length > 0
  };
}