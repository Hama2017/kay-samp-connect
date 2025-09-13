import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Security constants
const MAX_REQUESTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Phone number validation regex (basic international format)
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

// Rate limiting constants
const MAX_REQUESTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Phone validation regex (basic international format)
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.error('Twilio credentials not configured');
      throw new Error('Service configuration error');
    }

    const { phone } = await req.json();
    
    if (!phone) {
      console.error('Phone number missing from request');
      throw new Error('Phone number is required');
    }

    // Validate phone number format
    if (!PHONE_REGEX.test(phone)) {
      console.error('Invalid phone format:', phone);
      throw new Error('Invalid phone number format');
    }

    console.log('Processing OTP request for phone:', phone.substring(0, 5) + '***');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check rate limiting
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('otp_rate_limits')
      .select('*')
      .eq('phone', phone)
      .gte('window_start', new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString())
      .single();

    if (!rateLimitError && rateLimitData) {
      if (rateLimitData.request_count >= MAX_REQUESTS_PER_HOUR) {
        console.warn('Rate limit exceeded for phone:', phone.substring(0, 5) + '***');
        throw new Error('Trop de tentatives. Réessayez dans une heure.');
      }
      
      // Update existing rate limit record
      await supabase
        .from('otp_rate_limits')
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq('id', rateLimitData.id);
    } else {
      // Create new rate limit record
      await supabase
        .from('otp_rate_limits')
        .insert({
          phone: phone,
          request_count: 1,
          window_start: new Date().toISOString()
        });
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = Array.from(crypto.getRandomValues(new Uint32Array(6)))
      .map(x => x % 10)
      .join('');
    
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    console.log('Generated OTP for phone:', phone.substring(0, 5) + '***');
    
    const { error: dbError } = await supabase
      .from('phone_otp')
      .upsert({
        phone: phone,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (dbError) {
      console.error('Database error storing OTP:', dbError);
      throw new Error('Service temporairement indisponible');
    }

    // Send OTP via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    const formData = new URLSearchParams();
    formData.append('To', sanitizedPhone);
    formData.append('From', '+12345678900'); // You'll need to set your Twilio phone number
    formData.append('Body', `Votre code de vérification KaaySamp: ${otp}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('Twilio error:', error);
      throw new Error('Échec de l\'envoi du SMS');
    }

    console.log(`OTP sent successfully to ${phone.substring(0, 5)}***`);
    
    return new Response(
      JSON.stringify({ success: true, message: 'OTP envoyé avec succès' }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Send-OTP Error:', error);
    
    // Don't expose internal errors to client
    const statusCode = error.message.includes('Trop de tentatives') ? 429 :
                      error.message.includes('Invalid phone') ? 400 : 500;
    
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