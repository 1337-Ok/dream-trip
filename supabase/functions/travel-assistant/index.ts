import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItineraryItem {
  id: string;
  day: number;
  title: string;
  description: string;
  time: string;
  location: string;
  coordinates: [number, number];
  isLocked: boolean;
  category: 'activity' | 'meal' | 'transport' | 'accommodation';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = "https://ypzuaazojbnliaacscpw.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwenVhYXpvamJubGlhYWNzY3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzkzMjksImV4cCI6MjA2OTkxNTMyOX0.l1SnanchlW6tDf56YJAGpFCqs6unlRmmj1ZaUCwzNJM";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      message, 
      itinerary, 
      tripData, 
      selectedDay, 
      userLocation 
    } = await req.json();

    console.log('Travel Assistant Request:', {
      message,
      itineraryCount: itinerary?.length || 0,
      tripData: tripData ? 'Present' : 'Missing',
      selectedDay,
      userLocation: userLocation ? 'Present' : 'Missing'
    });

    // Get relevant activities from database for context
    const { data: activities, error: activitiesError } = await supabase
      .from('mauritius_activities')
      .select('*')
      .limit(50);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Build context-rich system prompt
    const systemPrompt = `You are an expert AI travel assistant specializing in Mauritius. You help travelers optimize their itineraries, suggest activities, and provide personalized recommendations.

CURRENT CONTEXT:
- User's Trip: ${tripData ? `Budget: ${tripData.budget}, Style: ${tripData.travelStyle}, Group: ${tripData.groupSize} people` : 'Not available'}
- Current Day Focus: Day ${selectedDay || 'Not specified'}
- Itinerary Items: ${itinerary ? itinerary.length : 0} planned activities
- User Location: ${userLocation ? 'Available' : 'Not available'}

CURRENT ITINERARY OVERVIEW:
${itinerary ? itinerary.map((item: ItineraryItem) => 
  `Day ${item.day}: ${item.title} at ${item.time} (${item.location})`
).join('\n') : 'No itinerary provided'}

AVAILABLE MAURITIUS ACTIVITIES DATABASE:
${activities ? activities.slice(0, 10).map((activity: any) => 
  `- ${activity.title} (${activity.category}, ${activity.location}) - ${activity.cost_estimate_usd ? `$${activity.cost_estimate_usd}` : 'Price varies'}`
).join('\n') : 'Activities database not available'}

INSTRUCTIONS:
- Provide specific, actionable travel advice for Mauritius
- Reference the user's current itinerary when relevant
- Suggest specific activities from the database when appropriate
- Consider budget, travel style, and group size
- Be concise but helpful
- If suggesting restaurants/activities, mention specific locations and rough costs
- Help optimize travel routes and timing`;

    const userPrompt = `${message}

Context: I'm currently ${selectedDay ? `planning Day ${selectedDay}` : 'reviewing my itinerary'} of my Mauritius trip.`;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI Response Success');

    const aiResponse = data.choices[0].message.content;

    // Store conversation in user preferences if user is authenticated
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        
        if (user) {
          // Get current preferences
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('ai_interactions')
            .eq('user_id', user.id)
            .single();

          const currentInteractions = preferences?.ai_interactions || [];
          const newInteraction = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            user_message: message,
            ai_response: aiResponse,
            context: {
              selected_day: selectedDay,
              itinerary_count: itinerary?.length || 0
            }
          };

          // Update or insert preferences
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              ai_interactions: [...currentInteractions, newInteraction],
              updated_at: new Date().toISOString()
            });

          console.log('Conversation saved to database');
        }
      } catch (error) {
        console.error('Error saving conversation:', error);
        // Continue without saving if there's an error
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Travel Assistant Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I'm having trouble processing your request right now. Please try asking something simpler, like 'What should I do today?' or 'Suggest nearby restaurants'.",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});