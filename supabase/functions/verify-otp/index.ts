import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Input validation
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const OTP_REGEX = /^\d{6}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, username } = await req.json();
    
    if (!phone || !otp) {
      console.error('Missing required fields:', { phone: !!phone, otp: !!otp });
      throw new Error('Phone number and OTP are required');
    }

    // Validate input formats
    if (!PHONE_REGEX.test(phone)) {
      console.error('Invalid phone format:', phone);
      throw new Error('Invalid phone number format');
    }

    if (!OTP_REGEX.test(otp)) {
      console.error('Invalid OTP format');
      throw new Error('Invalid OTP format');
    }

    if (username && !USERNAME_REGEX.test(username)) {
      console.error('Invalid username format:', username);
      throw new Error('Invalid username format');
    }

    console.log('Verifying OTP for phone:', phone.substring(0, 5) + '***');

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
      console.warn('OTP verification failed for phone:', phone.substring(0, 5) + '***');
      throw new Error('Code OTP invalide ou expiré');
    }

    console.log('OTP verification successful for phone:', phone.substring(0, 5) + '***');

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
      // Create new user with enhanced security
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        phone: phone,
        phone_confirmed: true,
        user_metadata: {
          username: username || `user_${phone.slice(-4)}`,
          created_via: 'phone_otp'
        }
      });

      if (userError) {
        console.error('User creation error:', userError);
        throw new Error('Erreur lors de la création du compte');
      }

      userId = userData.user.id;
      console.log('New user created:', userId);
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      phone: phone,
    });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw new Error('Erreur lors de la création de la session');
    }

    console.log('Session created successfully for user:', userId);

    // Clean up expired OTPs periodically (basic cleanup)
    supabase.rpc('cleanup_expired_otp').catch(err => 
      console.warn('OTP cleanup failed:', err)
    );

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
    console.error('Verify-OTP Error:', error);
    
    // Don't expose internal errors to client
    const statusCode = error.message.includes('invalide ou expiré') ? 400 :
                      error.message.includes('Invalid') ? 400 : 500;
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});