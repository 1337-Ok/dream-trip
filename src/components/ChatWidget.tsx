import { useState } from "react";
import { X, Send, MessageCircle, Sparkles } from "lucide-react";
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
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI travel assistant for Mauritius. I can help you optimize your itinerary, suggest alternatives, or answer questions about your trip. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickSuggestions = [
    "Suggest nearby restaurants",
    "Find cheaper alternatives",
    "Add beach activities",
    "Optimize travel time",
    "Weather recommendations"
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Let me analyze your itinerary and find the best recommendations...",
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

      // Call our travel assistant API
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
        text: data.response || "I couldn't process your request right now. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? aiResponse : msg
      ));

    } catch (error) {
      console.error('AI Assistant Error:', error);
      
      // Replace loading message with error response
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "I'm having trouble connecting right now. Please try asking something like 'What should I do today?' or 'Suggest nearby restaurants'.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? errorMessage : msg
      ));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    // Auto-send the suggestion
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) {
    return null; // Chat button should be handled by parent component
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white/95 backdrop-blur-sm shadow-tropical border-0">
      <CardHeader className="bg-gradient-tropical text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            AI Travel Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-0 w-fit">
          Online • Ready to help
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(500px-120px)]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-tropical text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground mb-2">Quick suggestions:</div>
          <div className="flex flex-wrap gap-1">
            {quickSuggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs h-6 px-2 border-primary/20 hover:bg-primary/10"
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
              placeholder="Ask about your trip..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-gradient-tropical px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}