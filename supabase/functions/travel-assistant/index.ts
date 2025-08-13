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

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  recommendations: string[];
}

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

// Enhanced web search with Tavily AI
async function searchWithTavily(query: string, location: string = "Mauritius"): Promise<SearchResult[]> {
  const tavilyApiKey = Deno.env.get('Tavily AI Search API');
  if (!tavilyApiKey) {
    console.log('Tavily API key not configured, skipping web search');
    return [];
  }

  try {
    const searchQuery = `${query} ${location} travel guide recommendations`;
    console.log('Tavily search query:', searchQuery);

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tavilyApiKey}`
      },
      body: JSON.stringify({
        query: searchQuery,
        search_depth: "advanced",
        include_answer: true,
        include_images: false,
        include_raw_content: false,
        max_results: 5,
        include_domains: ["tripadvisor.com", "lonelyplanet.com", "booking.com", "airbnb.com", "mauritius.travel"]
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Tavily search successful, found', data.results?.length || 0, 'results');

    return data.results?.map((result: any) => ({
      title: result.title || '',
      url: result.url || '',
      content: result.content || '',
      score: result.score || 0
    })) || [];

  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

// Weather integration with OpenWeatherMap
async function getWeatherData(location: string = "Port Louis, Mauritius"): Promise<WeatherData | null> {
  const weatherApiKey = Deno.env.get('OpenWeatherAPI');
  if (!weatherApiKey) {
    console.log('Weather API key not configured, skipping weather data');
    return null;
  }

  try {
    console.log('Fetching weather for:', location);
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${weatherApiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather data fetched successfully');

    const weather = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      recommendations: generateWeatherRecommendations(data)
    };

    return weather;

  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

function generateWeatherRecommendations(weatherData: any): string[] {
  const recommendations = [];
  const temp = weatherData.main.temp;
  const condition = weatherData.weather[0].main.toLowerCase();
  const windSpeed = weatherData.wind.speed * 3.6; // Convert to km/h

  // Temperature-based recommendations
  if (temp > 28) {
    recommendations.push("Perfect for beach activities and water sports");
    recommendations.push("Consider indoor attractions during midday heat");
  } else if (temp < 20) {
    recommendations.push("Great weather for hiking and outdoor exploration");
    recommendations.push("Ideal for visiting botanical gardens and markets");
  }

  // Weather condition recommendations
  if (condition.includes('rain')) {
    recommendations.push("Visit museums, shopping centers, or covered markets");
    recommendations.push("Perfect time for spa treatments or cultural experiences");
  } else if (condition.includes('clear') || condition.includes('sun')) {
    recommendations.push("Excellent for snorkeling, diving, or beach activities");
    recommendations.push("Great for photography and sightseeing");
  }

  // Wind-based recommendations
  if (windSpeed > 20) {
    recommendations.push("Excellent conditions for kite surfing or windsurfing");
  }

  return recommendations;
}

// Analyze user preferences and provide personalized recommendations
function analyzeUserPreferences(interactions: any[], tripData: any): string {
  if (!interactions || interactions.length === 0) {
    return "New user - providing general recommendations";
  }

  const recentInteractions = interactions.slice(-10);
  const interests = new Set<string>();
  const preferences = {
    outdoor: 0,
    cultural: 0,
    food: 0,
    adventure: 0,
    relaxation: 0
  };

  // Analyze previous conversations for patterns
  recentInteractions.forEach((interaction: any) => {
    const message = interaction.user_message.toLowerCase();
    
    if (message.includes('beach') || message.includes('swim') || message.includes('snorkel')) {
      preferences.outdoor++;
      interests.add('water activities');
    }
    if (message.includes('food') || message.includes('restaurant') || message.includes('eat')) {
      preferences.food++;
      interests.add('cuisine');
    }
    if (message.includes('culture') || message.includes('temple') || message.includes('museum')) {
      preferences.cultural++;
      interests.add('culture');
    }
    if (message.includes('adventure') || message.includes('hike') || message.includes('extreme')) {
      preferences.adventure++;
      interests.add('adventure');
    }
    if (message.includes('spa') || message.includes('relax') || message.includes('resort')) {
      preferences.relaxation++;
      interests.add('wellness');
    }
  });

  const topPreference = Object.entries(preferences)
    .sort(([,a], [,b]) => b - a)[0][0];

  return `User shows preference for ${topPreference} activities. Interests: ${Array.from(interests).join(', ')}`;
}

// Emergency assistance function
function checkForEmergencyKeywords(message: string): string | null {
  const emergencyKeywords = [
    'emergency', 'help', 'lost', 'sick', 'injured', 'accident', 'police', 
    'hospital', 'ambulance', 'fire', 'danger', 'urgent', 'emergency contact'
  ];

  const lowerMessage = message.toLowerCase();
  const hasEmergencyKeyword = emergencyKeywords.some(keyword => lowerMessage.includes(keyword));

  if (hasEmergencyKeyword) {
    return `🚨 EMERGENCY ASSISTANCE FOR MAURITIUS:

**Emergency Numbers:**
• Police: 999 or 112
• Medical Emergency: 114
• Fire Brigade: 995
• Tourist Police: +230 210 3894

**Hospitals:**
• Dr Jeetoo Hospital: +230 212 3201
• Wellkin Hospital: +230 401 9500
• Clinique du Nord: +230 247 2532

**Embassies & Consulates:**
• British High Commission: +230 202 9400
• US Embassy: +230 202 4400
• French Embassy: +230 202 0100

**Tourist Assistance:**
• Mauritius Tourism Authority: +230 210 1545
• Tourist Police Hotline: +230 210 3894

Stay calm, call the appropriate emergency number, and provide your exact location if possible.`;
  }

  return null;
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

    console.log('Enhanced Travel Assistant Request:', {
      message,
      itineraryCount: itinerary?.length || 0,
      tripData: tripData ? 'Present' : 'Missing',
      selectedDay,
      userLocation: userLocation ? 'Present' : 'Missing'
    });

    // Check for emergency assistance first
    const emergencyResponse = checkForEmergencyKeywords(message);
    if (emergencyResponse) {
      return new Response(
        JSON.stringify({ 
          response: emergencyResponse,
          success: true,
          isEmergency: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Gather enhanced context data in parallel
    const [activities, weatherData, searchResults, userPreferences] = await Promise.allSettled([
      // Get activities from database
      supabase
        .from('mauritius_activities')
        .select('*')
        .limit(50)
        .then(({ data, error }) => {
          if (error) console.error('Error fetching activities:', error);
          return data || [];
        }),

      // Get current weather
      getWeatherData(userLocation || "Port Louis, Mauritius"),

      // Perform web search for relevant information
      searchWithTavily(message, "Mauritius"),

      // Get user preferences (if authenticated)
      (async () => {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return null;

        try {
          const { data: { user } } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
          );
          
          if (!user) return null;

          const { data } = await supabase
            .from('user_preferences')
            .select('ai_interactions, preferences_analysis')
            .eq('user_id', user.id)
            .single();

          return data;
        } catch (error) {
          console.error('Error fetching user preferences:', error);
          return null;
        }
      })()
    ]);

    const activitiesData = activities.status === 'fulfilled' ? activities.value : [];
    const weather = weatherData.status === 'fulfilled' ? weatherData.value : null;
    const webResults = searchResults.status === 'fulfilled' ? searchResults.value : [];
    const preferences = userPreferences.status === 'fulfilled' ? userPreferences.value : null;

    // Build comprehensive context
    let contextualInfo = '';
    
    // Add weather information
    if (weather) {
      contextualInfo += `\n**CURRENT WEATHER IN MAURITIUS:**
- Temperature: ${weather.temperature}°C
- Condition: ${weather.condition} (${weather.description})
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h
- Weather Recommendations: ${weather.recommendations.join(', ')}`;
    }

    // Add web search results
    if (webResults.length > 0) {
      contextualInfo += `\n**RECENT TRAVEL INFORMATION:**`;
      webResults.slice(0, 3).forEach((result, index) => {
        contextualInfo += `\n${index + 1}. ${result.title}
   ${result.content.substring(0, 200)}...
   Source: ${result.url}`;
      });
    }

    // Add user preferences analysis
    if (preferences?.ai_interactions) {
      const userAnalysis = analyzeUserPreferences(preferences.ai_interactions, tripData);
      contextualInfo += `\n**USER PREFERENCE ANALYSIS:**
${userAnalysis}`;
    }

    // Build enhanced system prompt
    const systemPrompt = `You are an advanced AI travel assistant specializing in Mauritius with real-time capabilities. You have access to current weather data, recent travel information from the web, and user preference analysis.

**CURRENT CONTEXT:**
- User's Trip: ${tripData ? `Budget: ${tripData.budget}, Style: ${tripData.travelStyle}, Group: ${tripData.groupSize} people` : 'Not available'}
- Current Day Focus: Day ${selectedDay || 'Not specified'}
- Itinerary Items: ${itinerary ? itinerary.length : 0} planned activities
- User Location: ${userLocation ? 'Available' : 'Not available'}

**CURRENT ITINERARY OVERVIEW:**
${itinerary ? itinerary.map((item: ItineraryItem) => 
  `Day ${item.day}: ${item.title} at ${item.time} (${item.location})`
).join('\n') : 'No itinerary provided'}

**MAURITIUS ACTIVITIES DATABASE:**
${activitiesData.slice(0, 10).map((activity: any) => 
  `- ${activity.title} (${activity.category}, ${activity.location}) - ${activity.cost_estimate_usd ? `$${activity.cost_estimate_usd}` : 'Price varies'}`
).join('\n')}

${contextualInfo}

**ENHANCED INSTRUCTIONS:**
- Provide specific, actionable travel advice with real-time context
- Use weather data to make activity recommendations
- Reference recent web information when relevant
- Consider user's historical preferences and patterns
- Include practical details: costs, timing, locations, weather suitability
- For restaurant/activity suggestions, provide specific names and locations
- Help optimize routes based on weather and user preferences
- Format responses with clear sections using bullet points and headings
- Always cite sources when using web search information
- Be concise but comprehensive in your recommendations`;

    const userPrompt = `${message}

Context: I'm currently ${selectedDay ? `planning Day ${selectedDay}` : 'reviewing my itinerary'} of my Mauritius trip.`;

    console.log('Calling Enhanced OpenAI API...');

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
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Enhanced AI Response Generated Successfully');

    const aiResponse = data.choices[0].message.content;

    // Enhanced conversation storage with context
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        
        if (user) {
          // Get current preferences
          const { data: currentPrefs } = await supabase
            .from('user_preferences')
            .select('ai_interactions, preferences_analysis')
            .eq('user_id', user.id)
            .single();

          const currentInteractions = currentPrefs?.ai_interactions || [];
          const newInteraction = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            user_message: message,
            ai_response: aiResponse,
            context: {
              selected_day: selectedDay,
              itinerary_count: itinerary?.length || 0,
              weather_condition: weather?.condition,
              search_results_count: webResults.length
            }
          };

          // Keep only last 50 interactions to prevent database bloat
          const updatedInteractions = [...currentInteractions, newInteraction].slice(-50);

          // Update preferences with enhanced analysis
          const preferenceAnalysis = analyzeUserPreferences(updatedInteractions, tripData);

          await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              ai_interactions: updatedInteractions,
              preferences_analysis: preferenceAnalysis,
              updated_at: new Date().toISOString()
            });

          console.log('Enhanced conversation and preferences saved');
        }
      } catch (error) {
        console.error('Error saving enhanced conversation:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        contextData: {
          weatherIncluded: !!weather,
          searchResultsCount: webResults.length,
          activitiesCount: activitiesData.length,
          hasUserPreferences: !!preferences
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Enhanced Travel Assistant Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I'm experiencing technical difficulties. Please try asking something simpler, like 'What's the weather like?' or 'Suggest activities for today'.",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
