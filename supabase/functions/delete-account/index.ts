import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create client with user token to verify authentication
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user from the auth token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      throw new Error('User not authenticated');
    }

    console.log('Starting account deletion for user:', user.id);

    // Delete in the correct order to respect foreign key constraints
    
    // 1. Delete comment votes
    const { error: commentVotesError } = await supabaseAdmin
      .from('comment_votes')
      .delete()
      .eq('user_id', user.id);
    if (commentVotesError) console.error('Error deleting comment votes:', commentVotesError);

    // 2. Delete post votes
    const { error: postVotesError } = await supabaseAdmin
      .from('post_votes')
      .delete()
      .eq('user_id', user.id);
    if (postVotesError) console.error('Error deleting post votes:', postVotesError);

    // 3. Delete bookmarks
    const { error: bookmarksError } = await supabaseAdmin
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id);
    if (bookmarksError) console.error('Error deleting bookmarks:', bookmarksError);

    // 4. Delete notifications
    const { error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .or(`user_id.eq.${user.id},actor_id.eq.${user.id}`);
    if (notificationsError) console.error('Error deleting notifications:', notificationsError);

    // 5. Delete user follows
    const { error: followsError } = await supabaseAdmin
      .from('user_follows')
      .delete()
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
    if (followsError) console.error('Error deleting follows:', followsError);

    // 6. Delete space invitations
    const { error: invitationsError } = await supabaseAdmin
      .from('space_invitations')
      .delete()
      .or(`invited_user_id.eq.${user.id},inviter_id.eq.${user.id}`);
    if (invitationsError) console.error('Error deleting invitations:', invitationsError);

    // 7. Delete space subscriptions
    const { error: subscriptionsError } = await supabaseAdmin
      .from('space_subscriptions')
      .delete()
      .eq('user_id', user.id);
    if (subscriptionsError) console.error('Error deleting subscriptions:', subscriptionsError);

    // 8. Delete space moderators
    const { error: moderatorsError } = await supabaseAdmin
      .from('space_moderators')
      .delete()
      .eq('user_id', user.id);
    if (moderatorsError) console.error('Error deleting moderators:', moderatorsError);

    // 9. Delete comment media for user's comments
    const { data: userComments } = await supabaseAdmin
      .from('comments')
      .select('id')
      .eq('author_id', user.id);
    
    if (userComments && userComments.length > 0) {
      const commentIds = userComments.map(c => c.id);
      const { error: commentMediaError } = await supabaseAdmin
        .from('comment_media')
        .delete()
        .in('comment_id', commentIds);
      if (commentMediaError) console.error('Error deleting comment media:', commentMediaError);
    }

    // 10. Delete comments
    const { error: commentsError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('author_id', user.id);
    if (commentsError) console.error('Error deleting comments:', commentsError);

    // 11. Delete post media for user's posts
    const { data: userPosts } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('author_id', user.id);
    
    if (userPosts && userPosts.length > 0) {
      const postIds = userPosts.map(p => p.id);
      const { error: postMediaError } = await supabaseAdmin
        .from('post_media')
        .delete()
        .in('post_id', postIds);
      if (postMediaError) console.error('Error deleting post media:', postMediaError);
    }

    // 12. Delete posts
    const { error: postsError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('author_id', user.id);
    if (postsError) console.error('Error deleting posts:', postsError);

    // 13. Get spaces created by user to delete related data
    const { data: userSpaces } = await supabaseAdmin
      .from('spaces')
      .select('id')
      .eq('creator_id', user.id);

    if (userSpaces && userSpaces.length > 0) {
      const spaceIds = userSpaces.map(s => s.id);

      // Delete space-related data
      await supabaseAdmin.from('space_invitations').delete().in('space_id', spaceIds);
      await supabaseAdmin.from('space_subscriptions').delete().in('space_id', spaceIds);
      await supabaseAdmin.from('space_moderators').delete().in('space_id', spaceIds);
      
      // Get and delete posts in these spaces
      const { data: spacePosts } = await supabaseAdmin
        .from('posts')
        .select('id')
        .in('space_id', spaceIds);
      
      if (spacePosts && spacePosts.length > 0) {
        const spacePostIds = spacePosts.map(p => p.id);
        await supabaseAdmin.from('post_media').delete().in('post_id', spacePostIds);
        await supabaseAdmin.from('post_votes').delete().in('post_id', spacePostIds);
        
        // Get comments on these posts
        const { data: postsComments } = await supabaseAdmin
          .from('comments')
          .select('id')
          .in('post_id', spacePostIds);
        
        if (postsComments && postsComments.length > 0) {
          const commentIds = postsComments.map(c => c.id);
          await supabaseAdmin.from('comment_media').delete().in('comment_id', commentIds);
          await supabaseAdmin.from('comment_votes').delete().in('comment_id', commentIds);
          await supabaseAdmin.from('comments').delete().in('post_id', spacePostIds);
        }
        
        await supabaseAdmin.from('posts').delete().in('space_id', spaceIds);
      }
    }

    // 14. Delete spaces created by user
    const { error: spacesError } = await supabaseAdmin
      .from('spaces')
      .delete()
      .eq('creator_id', user.id);
    if (spacesError) console.error('Error deleting spaces:', spacesError);

    // 15. Delete user stats
    const { error: statsError } = await supabaseAdmin
      .from('user_stats')
      .delete()
      .eq('user_id', user.id);
    if (statsError) console.error('Error deleting user stats:', statsError);

    // 16. Delete analytics events
    const { error: analyticsError } = await supabaseAdmin
      .from('analytics_events')
      .delete()
      .eq('user_id', user.id);
    if (analyticsError) console.error('Error deleting analytics:', analyticsError);

    // 17. Delete profile (CRITICAL - must succeed)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    if (profileError) {
      console.error('CRITICAL ERROR deleting profile:', profileError);
      throw new Error(`Failed to delete profile: ${profileError.message}`);
    }

    // 18. Finally, delete the auth user (CRITICAL - must succeed)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteUserError) {
      console.error('CRITICAL ERROR deleting auth user:', deleteUserError);
      throw new Error(`Failed to delete auth user: ${deleteUserError.message}`);
    }

    console.log('Account deletion completed successfully for user:', user.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to delete account'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
