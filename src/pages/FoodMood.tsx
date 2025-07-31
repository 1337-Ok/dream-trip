import { useState } from "react";
import { Search, Sparkles, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FoodRecommendation {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  priceRange: string;
  cookingTime: string;
  mood: string[];
  ingredients: string[];
  type: 'local' | 'restaurant' | 'street-food';
}

const emojiMoods = [
  { emoji: "😋", mood: "craving", label: "Craving Something" },
  { emoji: "🌶️", mood: "spicy", label: "Spicy Mood" },
  { emoji: "🥗", mood: "healthy", label: "Healthy Choice" },
  { emoji: "🍖", mood: "hearty", label: "Hearty & Filling" },
  { emoji: "🐟", mood: "seafood", label: "Fresh Seafood" },
  { emoji: "🥥", mood: "tropical", label: "Tropical Vibes" },
  { emoji: "🍯", mood: "sweet", label: "Sweet Tooth" },
  { emoji: "🌿", mood: "fresh", label: "Light & Fresh" },
  { emoji: "🔥", mood: "comfort", label: "Comfort Food" },
  { emoji: "🎉", mood: "festive", label: "Celebration Food" },
];

const foodRecommendations: FoodRecommendation[] = [
  {
    id: '1',
    name: 'Dholl Puri',
    description: 'Mauritius\' most famous street food - thin flatbread filled with split peas, served with curry, chutney, and pickles.',
    image: '🫓',
    location: 'Street vendors across Port Louis',
    priceRange: '$2-5',
    cookingTime: '15-20 mins',
    mood: ['comfort', 'craving', 'local'],
    ingredients: ['Split peas', 'Flour', 'Curry', 'Chutney'],
    type: 'street-food'
  },
  {
    id: '2', 
    name: 'Fish Vindaye',
    description: 'Traditional Mauritian fish curry with mustard seeds, turmeric, and vinegar. A perfect blend of Indian and Creole flavors.',
    image: '🐟',
    location: 'Local restaurants in Grand Baie',
    priceRange: '$8-15',
    cookingTime: '30-45 mins',
    mood: ['seafood', 'spicy', 'hearty'],
    ingredients: ['Fresh fish', 'Mustard seeds', 'Turmeric', 'Vinegar'],
    type: 'local'
  },
  {
    id: '3',
    name: 'Tropical Fruit Salad',
    description: 'Fresh mix of tropical fruits including lychee, mango, papaya, and passion fruit with a hint of lime.',
    image: '🥭',
    location: 'Beach cafes in Flic en Flac',
    priceRange: '$5-8',
    cookingTime: '10 mins',
    mood: ['tropical', 'fresh', 'healthy', 'sweet'],
    ingredients: ['Mango', 'Lychee', 'Papaya', 'Passion fruit'],
    type: 'restaurant'
  },
  {
    id: '4',
    name: 'Octopus Curry',
    description: 'Tender octopus cooked in aromatic spices with coconut milk. A beloved seafood dish among locals.',
    image: '🐙',
    location: 'Mahebourg waterfront restaurants',
    priceRange: '$12-20',
    cookingTime: '1 hour',
    mood: ['seafood', 'spicy', 'festive'],
    ingredients: ['Octopus', 'Coconut milk', 'Curry spices', 'Onions'],
    type: 'restaurant'
  },
  {
    id: '5',
    name: 'Alouda',
    description: 'Refreshing drink made with milk, basil seeds, agar-agar jelly, and flavored syrup. Perfect for hot days.',
    image: '🥤',
    location: 'Street vendors in Port Louis',
    priceRange: '$1-3',
    cookingTime: '5 mins',
    mood: ['sweet', 'fresh', 'tropical'],
    ingredients: ['Milk', 'Basil seeds', 'Agar jelly', 'Syrup'],
    type: 'street-food'
  },
  {
    id: '6',
    name: 'Rougaille Saucisse',
    description: 'Mauritian sausage stew with tomatoes, onions, and thyme. A hearty comfort food perfect for dinner.',
    image: '🌭',
    location: 'Home-style restaurants in Curepipe',
    priceRange: '$6-12',
    cookingTime: '45 mins',
    mood: ['comfort', 'hearty', 'festive'],
    ingredients: ['Sausages', 'Tomatoes', 'Onions', 'Thyme'],
    type: 'local'
  }
];

export default function FoodMood() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleMoodSelect = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const findFoodMatches = () => {
    if (selectedMoods.length === 0 && !searchQuery.trim()) {
      toast({
        title: "Select your mood! 😋",
        description: "Choose at least one emoji or enter what you're craving",
        variant: "destructive"
      });
      return;
    }

    let matches = foodRecommendations.filter(food => {
      const moodMatch = selectedMoods.length === 0 || selectedMoods.some(mood => food.mood.includes(mood));
      const searchMatch = !searchQuery.trim() || 
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return moodMatch && searchMatch;
    });

    // If no exact matches, show popular dishes
    if (matches.length === 0) {
      matches = foodRecommendations.slice(0, 3);
      toast({
        title: "No exact matches found 🤔",
        description: "Here are some popular Mauritian dishes you might enjoy!",
      });
    } else {
      toast({
        title: `Found ${matches.length} delicious matches! 🍽️`,
        description: "Based on your mood and preferences",
      });
    }

    setRecommendations(matches);
    setHasSearched(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'local': return 'bg-primary';
      case 'restaurant': return 'bg-sunset';
      case 'street-food': return 'bg-palm';
      default: return 'bg-muted';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'local': return 'Local Cuisine';
      case 'restaurant': return 'Restaurant';
      case 'street-food': return 'Street Food';
      default: return 'Food';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light to-sand p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ocean-deep mb-2">Food Mood Finder</h1>
          <p className="text-muted-foreground">Discover Mauritian cuisine based on your current mood</p>
        </div>

        {/* Mood Selector */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              What's Your Food Mood?
            </CardTitle>
            <CardDescription>
              Select emojis that match how you're feeling about food right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {emojiMoods.map((item) => (
                <Button
                  key={item.mood}
                  variant={selectedMoods.includes(item.mood) ? "default" : "outline"}
                  onClick={() => handleMoodSelect(item.mood)}
                  className={`h-20 flex flex-col gap-2 ${
                    selectedMoods.includes(item.mood) 
                      ? 'bg-gradient-tropical shadow-glow' 
                      : 'bg-white hover:bg-muted/50'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs text-center leading-tight">{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Or describe what you're craving... (e.g., spicy curry, fresh seafood)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && findFoodMatches()}
                />
                <Button onClick={findFoodMatches} className="bg-gradient-tropical">
                  <Search className="h-4 w-4 mr-2" />
                  Find Food
                </Button>
              </div>

              {selectedMoods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Selected moods:</span>
                  {selectedMoods.map((mood) => {
                    const moodItem = emojiMoods.find(item => item.mood === mood);
                    return (
                      <Badge key={mood} variant="secondary" className="bg-primary text-white">
                        {moodItem?.emoji} {moodItem?.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-ocean-deep">Perfect Matches for You</h2>
              <Badge variant="secondary">{recommendations.length} dishes</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((food) => (
                <Card key={food.id} className="bg-white/90 backdrop-blur-sm shadow-soft hover:shadow-tropical transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{food.image}</div>
                        <div>
                          <CardTitle className="text-lg">{food.name}</CardTitle>
                          <Badge className={`${getTypeColor(food.type)} text-white mt-1`}>
                            {getTypeLabel(food.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{food.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{food.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-sunset" />
                          <span>{food.priceRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-palm" />
                          <span>{food.cookingTime}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-ocean-deep mb-2">Key Ingredients:</div>
                        <div className="flex flex-wrap gap-1">
                          {food.ingredients.map((ingredient, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-ocean-deep mb-2">Perfect for:</div>
                        <div className="flex flex-wrap gap-1">
                          {food.mood.map((mood, index) => {
                            const moodItem = emojiMoods.find(item => item.mood === mood);
                            return (
                              <Badge key={index} variant="secondary" className="text-xs bg-muted">
                                {moodItem?.emoji} {moodItem?.label || mood}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-gradient-tropical group-hover:shadow-glow transition-all duration-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Nearby
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No search yet */}
        {!hasSearched && (
          <Card className="bg-gradient-tropical text-white shadow-tropical">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">Ready to Discover Amazing Food?</h3>
              <p className="text-white/90">
                Select your mood or describe what you're craving to get personalized Mauritian food recommendations!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}