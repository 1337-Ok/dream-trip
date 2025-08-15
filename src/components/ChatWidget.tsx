import { useState, useEffect } from "react";
import { X, Send, MessageCircle, Sparkles, Minus, Maximize2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  contextData?: {
    weatherIncluded?: boolean;
    searchResultsCount?: number;
    activitiesCount?: number;
  };
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI travel assistant for Mauritius. I can help you with personalized recommendations based on your trip preferences, current weather, and local activities. What would you like to explore?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Load user preferences from localStorage on mount
  useEffect(() => {
    const storedTripData = localStorage.getItem('tripData');
    if (storedTripData) {
      const tripData = JSON.parse(storedTripData);
      setUserPreferences(tripData);
    }
  }, []);

  // Generate dynamic quick suggestions based on user preferences
  const generateQuickSuggestions = () => {
    const baseSuggestions = [
      "What's the weather like today?",
      "Suggest activities for today",
      "Find nearby restaurants"
    ];

    if (userPreferences) {
      const preferenceSuggestions = [];
      
      if (userPreferences.interests?.includes('hiking')) {
        preferenceSuggestions.push("Show me hiking trails");
      }
      if (userPreferences.interests?.includes('beaches')) {
        preferenceSuggestions.push("Best beaches for today");
      }
      if (userPreferences.interests?.includes('culture')) {
        preferenceSuggestions.push("Cultural sites to visit");
      }
      if (userPreferences.interests?.includes('food')) {
        preferenceSuggestions.push("Local food recommendations");
      }
      if (userPreferences.travelStyle === 'adventure') {
        preferenceSuggestions.push("Adventure activities nearby");
      }
      
      return preferenceSuggestions.length > 0 
        ? [...preferenceSuggestions.slice(0, 2), baseSuggestions[0]]
        : baseSuggestions;
    }
    
    return baseSuggestions;
  };

  const quickSuggestions = generateQuickSuggestions();

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    // Add loading message with typing indicator
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "🤔 Analyzing your request and gathering the latest information...",
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Get context data
      const storedItinerary = localStorage.getItem('itinerary');
      const storedTripData = localStorage.getItem('tripData');
      const storedSelectedDay = localStorage.getItem('selectedDay');
      
      const itinerary = storedItinerary ? JSON.parse(storedItinerary) : null;
      const tripData = storedTripData ? JSON.parse(storedTripData) : null;
      const selectedDay = storedSelectedDay ? parseInt(storedSelectedDay) : null;

      // Call our enhanced travel assistant API
      const { data, error } = await supabase.functions.invoke('travel-assistant', {
        body: {
          message: currentInput,
          itinerary,
          tripData,
          selectedDay,
          userLocation: null // TODO: Add geolocation if needed
        }
      });

      if (error) {
        throw error;
      }

      // Replace loading message with AI response
      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: data.response || "I apologize, but I'm having trouble processing your request right now. Could you try rephrasing your question?",
        sender: 'ai',
        timestamp: new Date(),
        contextData: data.contextData
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? aiResponse : msg
      ));

    } catch (error) {
      console.error('AI Assistant Error:', error);
      
      // Generate dynamic error response based on error type
      let errorText = "I'm having some connectivity issues, but I'm still here to help!";
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorText = "I'm having trouble reaching my servers. Let me try again, or feel free to ask about Mauritius activities, restaurants, or planning tips!";
      } else if (error.message?.includes('auth')) {
        errorText = "There's an authentication issue on my end. I can still help with general Mauritius travel advice though!";
      } else if (error.message?.includes('OpenAI')) {
        errorText = "My AI brain is taking a quick break. Try asking about specific locations like 'Grand Baie activities' or 'Chamarel attractions'!";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? errorMessage : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    setInputText(suggestion);
    // Auto-send the suggestion
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  if (!isOpen) {
    return null;
  }

  // Minimized state - floating button
  if (isMinimized) {
    return (
      <Button
        onClick={handleMaximize}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-tropical shadow-tropical hover:shadow-lg transition-all duration-300"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6 text-white" />
          {messages.length > 1 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center bg-red-500 text-white">
              {messages.length - 1}
            </Badge>
          )}
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white/95 backdrop-blur-sm shadow-tropical border-0 transition-all duration-300">
      <CardHeader className="bg-gradient-tropical text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            AI Travel Assistant
            {userPreferences && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                {userPreferences.travelStyle || 'Personalized'}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-0 w-fit">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
            Online • Ready to help
          </Badge>
          {userPreferences && (
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
              {userPreferences.groupSize} travelers
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(600px-140px)]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg transition-all duration-200 ${
                    message.sender === 'user'
                      ? 'bg-gradient-tropical text-white shadow-md'
                      : 'bg-muted text-foreground shadow-sm hover:shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {message.contextData && message.sender === 'ai' && (
                      <div className="flex gap-1">
                        {message.contextData.weatherIncluded && (
                          <Badge variant="outline" className="text-xs h-5">☀️ Weather</Badge>
                        )}
                        {message.contextData.searchResultsCount > 0 && (
                          <Badge variant="outline" className="text-xs h-5">🌐 Live Data</Badge>
                        )}
                        {message.contextData.activitiesCount > 0 && (
                          <Badge variant="outline" className="text-xs h-5">🏃‍♀️ Activities</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground mb-2">
            {userPreferences ? 'Personalized suggestions:' : 'Quick suggestions:'}
          </div>
          <div className="flex flex-wrap gap-1">
            {quickSuggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="text-xs h-6 px-2 border-primary/20 hover:bg-primary/10 transition-colors"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={userPreferences ? "Ask about your personalized trip..." : "Ask about your trip..."}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-gradient-tropical px-3 hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {userPreferences && (
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Personalized for {userPreferences.travelStyle} travelers
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}