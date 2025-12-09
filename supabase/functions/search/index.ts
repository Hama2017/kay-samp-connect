import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query: string;
  type?: 'all' | 'posts' | 'spaces' | 'users';
  category?: string;
  sortBy?: 'relevance' | 'recent' | 'popular';
  limit?: number;
}

interface PostResult {
  id: string;
  content: string;
  created_at: string;
  hashtags: string[] | null;
  votes_up: number;
  votes_down: number;
  comments_count: number;
  views_count: number;
  profiles: unknown;
  spaces: unknown;
  post_media: unknown[];
}

interface SpaceResult {
  id: string;
  name: string;
  description: string | null;
  categories: string[] | null;
  subscribers_count: number;
  is_verified: boolean;
  updated_at: string;
  is_subscribed: boolean;
  space_subscriptions: { user_id: string }[];
}

interface UserResult {
  id: string;
  username: string;
  bio: string | null;
  profile_picture_url: string | null;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
}

interface SearchResults {
  posts: PostResult[];
  spaces: SpaceResult[];
  users: UserResult[];
  totalResults: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { query, type = 'all', category = 'Tous', sortBy = 'relevance', limit = 50 }: SearchRequest = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ 
          posts: [], 
          spaces: [], 
          users: [], 
          totalResults: 0 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: SearchResults = {
      posts: [],
      spaces: [],
      users: [],
      totalResults: 0
    };

    // Recherche dans les posts
    if (type === 'all' || type === 'posts') {
      let postsQuery = supabaseClient
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          hashtags,
          votes_up,
          votes_down,
          comments_count,
          views_count,
          profiles!inner(username, profile_picture_url, is_verified),
          spaces(id, name, categories),
          post_media(id, media_url, media_type, media_order, youtube_video_id, thumbnail_url)
        `)
        .or(`content.ilike.${searchTerm},hashtags.cs.{${query}}`)
        .limit(limit);

      // Filtre par catégorie via les espaces
      if (category !== 'Tous') {
        postsQuery = postsQuery.contains('spaces.categories', [category]);
      }

      // Tri
      switch (sortBy) {
        case 'recent':
          postsQuery = postsQuery.order('created_at', { ascending: false });
          break;
        case 'popular':
          postsQuery = postsQuery.order('votes_up', { ascending: false });
          break;
        case 'relevance':
        default:
          postsQuery = postsQuery.order('created_at', { ascending: false });
          break;
      }

      const { data: postsData, error: postsError } = await postsQuery;
      
      if (postsError) {
        console.error('Error searching posts:', postsError);
      } else {
        results.posts = (postsData || []) as PostResult[];
      }
    }

    // Recherche dans les espaces
    if (type === 'all' || type === 'spaces') {
      let spacesQuery = supabaseClient
        .from('spaces')
        .select(`
          id,
          name,
          description,
          categories,
          subscribers_count,
          is_verified,
          updated_at,
          space_subscriptions!left(user_id)
        `)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(limit);

      // Filtre par catégorie
      if (category !== 'Tous') {
        spacesQuery = spacesQuery.contains('categories', [category]);
      }

      // Tri
      switch (sortBy) {
        case 'recent':
          spacesQuery = spacesQuery.order('updated_at', { ascending: false });
          break;
        case 'popular':
          spacesQuery = spacesQuery.order('subscribers_count', { ascending: false });
          break;
        case 'relevance':
        default:
          spacesQuery = spacesQuery.order('subscribers_count', { ascending: false });
          break;
      }

      const { data: spacesData, error: spacesError } = await spacesQuery;
      
      if (spacesError) {
        console.error('Error searching spaces:', spacesError);
      } else {
        // Get current user ID to check if subscribed
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        results.spaces = (spacesData || []).map((space: { 
          id: string; 
          name: string; 
          description: string | null;
          categories: string[] | null;
          subscribers_count: number;
          is_verified: boolean;
          updated_at: string;
          space_subscriptions: { user_id: string }[];
        }) => ({
          ...space,
          is_subscribed: user ? space.space_subscriptions.some((sub: { user_id: string }) => sub.user_id === user.id) : false
        })) as SpaceResult[];
      }
    }

    // Recherche dans les utilisateurs (profiles)
    if (type === 'all' || type === 'users') {
      let usersQuery = supabaseClient
        .from('profiles')
        .select(`
          id,
          username,
          bio,
          profile_picture_url,
          is_verified,
          followers_count,
          following_count
        `)
        .or(`username.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .limit(limit);

      // Tri
      switch (sortBy) {
        case 'popular':
          usersQuery = usersQuery.order('is_verified', { ascending: false });
          break;
        case 'recent':
        case 'relevance':
        default:
          usersQuery = usersQuery.order('username', { ascending: true });
          break;
      }

      const { data: usersData, error: usersError } = await usersQuery;
      
      if (usersError) {
        console.error('Error searching users:', usersError);
      } else {
        results.users = (usersData || []).map((user: {
          id: string;
          username: string;
          bio: string | null;
          profile_picture_url: string | null;
          is_verified: boolean;
          followers_count: number | null;
          following_count: number | null;
        }) => ({
          id: user.id,
          username: user.username,
          bio: user.bio,
          profile_picture_url: user.profile_picture_url,
          is_verified: user.is_verified,
          followers_count: user.followers_count || 0,
          following_count: user.following_count || 0
        })) as UserResult[];
      }
    }

    results.totalResults = results.posts.length + results.spaces.length + results.users.length;

    return new Response(
      JSON.stringify(results),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
