import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧹 Début du nettoyage des médias orphelins');

    // Récupérer tous les fichiers des buckets
    const { data: avatarsFiles } = await supabase.storage.from('avatars').list();
    const { data: postMediaFiles } = await supabase.storage.from('post-media').list();

    let deletedCount = 0;

    // Nettoyer les médias de posts orphelins
    if (postMediaFiles) {
      for (const file of postMediaFiles) {
        const { data: media } = await supabase
          .from('post_media')
          .select('id')
          .ilike('media_url', `%${file.name}%`)
          .single();

        if (!media) {
          await supabase.storage.from('post-media').remove([file.name]);
          deletedCount++;
          console.log(`🗑️ Supprimé: ${file.name}`);
        }
      }
    }

    console.log(`✅ Nettoyage terminé: ${deletedCount} fichiers supprimés`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        message: `${deletedCount} fichiers orphelins supprimés` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
