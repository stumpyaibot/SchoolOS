// SchoolOS Email Ingestion Edge Function
// Receives forwarded emails and creates feed items
// Deploy: supabase functions deploy ingest-email

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncomingEmail {
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  date: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const email: IncomingEmail = await req.json();

    // Extract plain text from the body
    const plainBody = email.body || '';

    // Determine which class/student this is for based on the "to" address
    // e.g., class-4b@ingest.schoolos.app → Class 4B
    const toAddr = email.to.toLowerCase();
    let targetClassIds: string[] = [];

    if (toAddr.includes('class-4b') || toAddr.includes('grade-4')) {
      targetClassIds = ['a0000000-0000-0000-0000-000000000001'];
    } else if (toAddr.includes('class-1a') || toAddr.includes('grade-1')) {
      targetClassIds = ['a0000000-0000-0000-0000-000000000002'];
    }

    // Create a feed item with ingestion_status = 'pending_review'
    const { data, error } = await supabase
      .from('feed_items')
      .insert({
        type: 'ingested_email',
        title: email.subject || 'Email Update',
        content: plainBody.substring(0, 2000), // Cap at 2000 chars
        priority: 'normal',
        ingestion_status: 'pending_review',
        original_source: `email:${email.from}`,
        target_class_ids: targetClassIds,
        school_wide: targetClassIds.length === 0, // If no class detected, make school-wide
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, feedItemId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
