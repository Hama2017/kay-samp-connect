import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, username } = await req.json();
    
    if (!phone || !otp) {
      throw new Error('Phone number and OTP are required');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('phone_otp')
      .select('*')
      .eq('phone', phone)
      .eq('otp_code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      throw new Error('Code OTP invalide ou expiré');
    }

    // Mark OTP as used
    await supabase
      .from('phone_otp')
      .update({ used: true })
      .eq('id', otpData.id);

    // Check if user exists with this phone number
    let { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    let userId;
    
    if (existingProfile) {
      // User exists, sign them in
      userId = existingProfile.id;
    } else {
      // Create new user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        phone: phone,
        phone_confirmed: true,
        user_metadata: {
          username: username || `user_${phone.slice(-4)}`
        }
      });

      if (userError) {
        console.error('User creation error:', userError);
        throw new Error('Erreur lors de la création du compte');
      }

      userId = userData.user.id;
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      phone: phone,
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Erreur lors de la création de la session');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Connexion réussie',
        session: sessionData
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});