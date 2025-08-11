-- Create user preferences table to store trip preferences and AI interactions
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  trip_data JSONB,
  ai_interactions JSONB DEFAULT '[]',
  preferences_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (public for now since no auth implemented)
CREATE POLICY "Everyone can view preferences" 
ON public.user_preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can create preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can update preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (true);

-- Create activities database for Mauritius
CREATE TABLE public.mauritius_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates DOUBLE PRECISION[2] NOT NULL,
  estimated_duration_hours INTEGER,
  cost_estimate_usd INTEGER,
  best_time_of_day TEXT,
  recommended_group_size TEXT,
  difficulty_level TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample Mauritius activities
INSERT INTO public.mauritius_activities (title, description, category, location, coordinates, estimated_duration_hours, cost_estimate_usd, best_time_of_day, recommended_group_size, difficulty_level, tags) VALUES
('Le Morne Brabant Hike', 'UNESCO World Heritage site with spectacular views and historical significance', 'adventure', 'Le Morne Peninsula', ARRAY[-20.4561, 57.3116], 4, 25, 'morning', 'any', 'challenging', ARRAY['hiking', 'unesco', 'views', 'history']),
('Ile aux Cerfs Island Trip', 'Pristine island with white sand beaches and crystal clear waters', 'beach', 'Trou d''Eau Douce', ARRAY[-20.2789, 57.7928], 6, 45, 'all_day', 'any', 'easy', ARRAY['beach', 'island', 'snorkeling', 'boat']),
('Black River Gorges National Park', 'Largest national park with endemic flora and fauna', 'nature', 'Black River District', ARRAY[-20.4108, 57.4692], 3, 15, 'morning', 'any', 'moderate', ARRAY['nature', 'hiking', 'wildlife', 'endemic']),
('Port Louis Central Market', 'Vibrant local market for authentic Mauritian experience', 'cultural', 'Port Louis', ARRAY[-20.1609, 57.5012], 2, 20, 'morning', 'any', 'easy', ARRAY['culture', 'shopping', 'food', 'local']),
('Casela World of Adventures', 'Adventure park with zip-lining and wildlife encounters', 'adventure', 'Cascavelle', ARRAY[-20.3167, 57.4167], 5, 60, 'all_day', 'family', 'moderate', ARRAY['adventure', 'wildlife', 'zipline', 'family']),
('Grand Bassin (Ganga Talao)', 'Sacred Hindu lake and pilgrimage site', 'cultural', 'Savanne District', ARRAY[-20.4214, 57.4947], 2, 0, 'morning', 'any', 'easy', ARRAY['culture', 'hindu', 'spiritual', 'free']),
('Chamarel Seven Coloured Earth', 'Natural phenomenon with multicolored sand dunes', 'nature', 'Chamarel', ARRAY[-20.4281, 57.3736], 2, 30, 'afternoon', 'any', 'easy', ARRAY['nature', 'geology', 'photography', 'unique']),
('Tea Route Experience', 'Tea plantation tour with tasting and scenic views', 'cultural', 'Bois Cheri', ARRAY[-20.5167, 57.4833], 3, 35, 'afternoon', 'any', 'easy', ARRAY['culture', 'tea', 'plantation', 'scenic']),
('Dolphin Swimming', 'Swim with wild dolphins in Tamarin Bay', 'adventure', 'Tamarin Bay', ARRAY[-20.3255, 57.3708], 4, 80, 'morning', 'small', 'moderate', ARRAY['marine', 'dolphins', 'swimming', 'boat']),
('Pamplemousses Botanical Garden', 'Historic botanical garden with giant water lilies', 'nature', 'Pamplemousses', ARRAY[-20.1065, 57.5803], 2, 10, 'morning', 'any', 'easy', ARRAY['nature', 'botanical', 'history', 'photography']);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();