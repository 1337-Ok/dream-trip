import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Compass, ArrowRight, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    budget: "",
    travelStyle: "",
    groupSize: "",
    preferences: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.budget || !formData.travelStyle) {
      toast({
        title: "Please fill in all required fields",
        description: "We need your travel dates, budget, and style to create your perfect itinerary.",
        variant: "destructive"
      });
      return;
    }

    // Store form data in localStorage for other components to access
    localStorage.setItem('tripData', JSON.stringify(formData));
    
    toast({
      title: "Trip details saved! 🌴",
      description: "Let's start planning your dream Mauritius adventure!",
    });
    
    navigate('/itinerary');
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-30 animate-float">
        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
      </div>
      <div className="absolute top-40 right-20 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-12 h-12 bg-white/20 rounded-full"></div>
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-25 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="animate-float mb-6">
            <MapPin className="h-16 w-16 text-white mx-auto mb-4 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Dream-Trip
            <span className="block text-sunset font-script text-4xl md:text-6xl">Mauritius</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Your AI-powered travel companion for the perfect Mauritius getaway. 
            Plan, budget, and explore paradise with personalized recommendations.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Heart className="h-4 w-4 mr-2" />
              <span className="text-sm">Personalized Itineraries</span>
            </div>
            <div className="flex items-center text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm">Smart Budget Tracking</span>
            </div>
            <div className="flex items-center text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Compass className="h-4 w-4 mr-2" />
              <span className="text-sm">Local Insights</span>
            </div>
          </div>
        </div>

        {/* Onboarding Form */}
        <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-tropical border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-ocean-deep">Plan Your Perfect Trip</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tell us about your dream vacation and we'll create a personalized itinerary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="border-ocean-light focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="border-ocean-light focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Budget (USD) *
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g. 2500"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="border-ocean-light focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelStyle" className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  Travel Style *
                </Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, travelStyle: value }))}>
                  <SelectTrigger className="border-ocean-light focus:border-primary">
                    <SelectValue placeholder="Choose your travel style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury">🏖️ Luxury & Relaxation</SelectItem>
                    <SelectItem value="adventure">🚀 Adventure & Exploration</SelectItem>
                    <SelectItem value="cultural">🎭 Cultural & Heritage</SelectItem>
                    <SelectItem value="romantic">💕 Romantic Getaway</SelectItem>
                    <SelectItem value="family">👨‍👩‍👧‍👦 Family Fun</SelectItem>
                    <SelectItem value="budget">💰 Budget-Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupSize">Group Size</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, groupSize: value }))}>
                  <SelectTrigger className="border-ocean-light focus:border-primary">
                    <SelectValue placeholder="How many travelers?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo traveler</SelectItem>
                    <SelectItem value="couple">Couple (2 people)</SelectItem>
                    <SelectItem value="small-group">Small group (3-5 people)</SelectItem>
                    <SelectItem value="large-group">Large group (6+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferences">Special Preferences</Label>
                <Textarea
                  id="preferences"
                  placeholder="Tell us about your interests: beaches, hiking, food, photography, etc."
                  value={formData.preferences}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
                  className="border-ocean-light focus:border-primary min-h-[100px]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-tropical hover:shadow-glow transition-all duration-300 text-white text-lg py-6"
              >
                Start Planning My Dream Trip
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-soft hover:shadow-tropical transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ocean-deep mb-2">Smart Itinerary</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered day-by-day planning with interactive maps and flexible scheduling
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-soft hover:shadow-tropical transition-all duration-300">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ocean-deep mb-2">Budget Control</h3>
              <p className="text-muted-foreground text-sm">
                Track expenses, set limits, and get cost-saving recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-soft hover:shadow-tropical transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Compass className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ocean-deep mb-2">Local Insights</h3>
              <p className="text-muted-foreground text-sm">
                Essential phrases, cultural tips, and hidden gems from locals
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}