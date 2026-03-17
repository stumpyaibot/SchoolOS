// SchoolOS AI Assistant Edge Function
// Provides intelligent search and Q&A over school data
// Deploy: supabase functions deploy ai-assistant

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssistantRequest {
  query: string;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, userId }: AssistantRequest = await req.json();
    const q = query.toLowerCase();

    // Get user's children
    const { data: children } = await supabase
      .from('student_parents')
      .select('student_id, students(first_name, class_id)')
      .eq('parent_id', userId);

    const studentIds = children?.map(c => c.student_id) || [];
    const classIds = children?.map(c => (c as any).students?.class_id).filter(Boolean) || [];

    // Search feed items
    const { data: posts } = await supabase
      .from('feed_items')
      .select('*')
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(5);

    // Search calendar events
    const { data: events } = await supabase
      .from('calendar_events')
      .select('*')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    // Check for action item queries
    let actionItems = null;
    if (q.includes('action') || q.includes('todo') || q.includes('need to')) {
      const { data: actions } = await supabase
        .from('feed_items')
        .select('*')
        .not('action_type', 'is', null)
        .order('action_due_date', { ascending: true })
        .limit(5);
      actionItems = actions;
    }

    // Check for child-specific queries
    let childName = null;
    for (const child of children || []) {
      const name = (child as any).students?.first_name?.toLowerCase();
      if (name && q.includes(name)) {
        childName = (child as any).students?.first_name;
        break;
      }
    }

    // Build response
    const response = {
      posts: posts || [],
      events: events || [],
      actionItems: actionItems,
      childName,
      query,
    };

    // If Gemini API key is available, generate a natural language summary
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (geminiKey) {
      const context = JSON.stringify(response);
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `You are a helpful school communication assistant. Based on this data, answer the parent's question: "${query}"\n\nContext:\n${context}\n\nProvide a friendly, concise response. Use emojis. If there are action items, highlight them. If there are events, mention dates.` }]
            }]
          })
        }
      );

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          (response as any).aiSummary = aiText;
        }
      }
    }

    return new Response(
      JSON.stringify(response),
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
