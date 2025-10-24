import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const { id: postId } = await req.json();

    if (!postId) {
      return new Response(
        JSON.stringify({ error: "Post ID is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Récupérer le post complet avec toutes ses relations
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select(`
        *,
        profiles(
          username,
          profile_picture_url,
          is_verified,
          bio,
          full_name
        ),
        spaces(
          id,
          name,
          categories
        ),
        post_media(
          id,
          media_type,
          media_url,
          thumbnail_url,
          youtube_video_id,
          media_order
        ),
        post_votes(
          vote_type,
          user_id
        )
      `)
      .eq('id', postId)
      .maybeSingle();

    if (postError) {
      console.error('Error fetching post:', postError);
      return new Response(
        JSON.stringify({ error: postError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!post) {
      return new Response(
        JSON.stringify({ error: "Post not found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    // Vérifier que le post a un profil valide
    if (!post.profiles) {
      console.error('Post without valid profile found:', postId);
      return new Response(
        JSON.stringify({ error: "Post data is incomplete" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    // Récupérer les commentaires avec leurs auteurs et médias
    const { data: comments, error: commentsError } = await supabaseClient
      .from('comments')
      .select(`
        *,
        profiles(
          username,
          profile_picture_url,
          is_verified
        ),
        comment_media(
          id,
          media_type,
          media_url,
          media_order
        ),
        comment_votes(
          vote_type,
          user_id
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }

    // Obtenir l'utilisateur actuel pour vérifier les votes
    const { data: { user } } = await supabaseClient.auth.getUser();

    // Calculer les votes du post
    const upVotes = post.post_votes?.filter(vote => vote.vote_type === 'up').length || 0;
    const downVotes = post.post_votes?.filter(vote => vote.vote_type === 'down').length || 0;
    const currentUserVote = user ? post.post_votes?.find(vote => vote.user_id === user.id)?.vote_type : null;

    // Calculer les votes des commentaires et filtrer ceux sans profil
    const commentsWithVotes = (comments || [])
      .filter(comment => comment.profiles !== null)
      .map(comment => {
        const commentUpVotes = comment.comment_votes?.filter(vote => vote.vote_type === 'up').length || 0;
        const commentDownVotes = comment.comment_votes?.filter(vote => vote.vote_type === 'down').length || 0;
        const currentUserCommentVote = user ? comment.comment_votes?.find(vote => vote.user_id === user.id)?.vote_type : null;

        return {
          ...comment,
          votes_up: commentUpVotes,
          votes_down: commentDownVotes,
          current_user_vote: currentUserCommentVote,
          comment_media: comment.comment_media || []
        };
      });

    const result = {
      ...post,
      votes_up: upVotes,
      votes_down: downVotes,
      current_user_vote: currentUserVote,
      post_media: post.post_media?.sort((a, b) => a.media_order - b.media_order) || [],
      comments: commentsWithVotes
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Get post error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});