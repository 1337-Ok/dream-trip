import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Calendar, MapPin, Clock, Lock, Unlock, Share2, MessageCircle, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import MapComponent from "@/components/MapComponent";
import ChatWidget from "@/components/ChatWidget";

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

const initialItinerary: ItineraryItem[] = [
  {
    id: '1',
    day: 1,
    title: 'Arrival & Check-in',
    description: 'Airport pickup and hotel check-in at Le Morne',
    time: '14:00',
    location: 'Le Morne Brabant',
    coordinates: [-20.4569, 57.3108],
    isLocked: false,
    category: 'accommodation'
  },
  {
    id: '2',
    day: 1,
    title: 'Sunset Beach Walk',
    description: 'Romantic walk along Le Morne beach with stunning sunset views',
    time: '18:00',
    location: 'Le Morne Beach',
    coordinates: [-20.4569, 57.3108],
    isLocked: false,
    category: 'activity'
  },
  {
    id: '3',
    day: 2,
    title: 'Underwater Sea Walk',
    description: 'Explore marine life without diving skills at Blue Bay',
    time: '09:00',
    location: 'Blue Bay Marine Park',
    coordinates: [-20.4667, 57.7167],
    isLocked: false,
    category: 'activity'
  },
  {
    id: '4',
    day: 2,
    title: 'Creole Lunch',
    description: 'Authentic Mauritian cuisine at local restaurant',
    time: '13:00',
    location: 'Mahebourg',
    coordinates: [-20.4082, 57.7000],
    isLocked: false,
    category: 'meal'
  },
  {
    id: '5',
    day: 3,
    title: 'Chamarel Seven Colored Earth',
    description: 'Visit the famous geological formation and Chamarel Waterfall',
    time: '10:00',
    location: 'Chamarel',
    coordinates: [-20.4225, 57.3756],
    isLocked: false,
    category: 'activity'
  }
];

export default function Itinerary() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(initialItinerary);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  const days = Array.from(new Set(itinerary.map(item => item.day))).sort();
  const filteredItinerary = itinerary.filter(item => item.day === selectedDay);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredItinerary);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the full itinerary with the reordered items for the selected day
    const newItinerary = itinerary.map(item => {
      if (item.day === selectedDay) {
        const index = items.findIndex(reorderedItem => reorderedItem.id === item.id);
        return index !== -1 ? items[index] : item;
      }
      return item;
    });

    setItinerary(newItinerary);
    toast({
      title: "Itinerary updated! ✨",
      description: "Your day plan has been reordered successfully.",
    });
  };

  const toggleLock = (id: string) => {
    setItinerary(prev => prev.map(item => 
      item.id === id ? { ...item, isLocked: !item.isLocked } : item
    ));
  };

  const generateShareLink = () => {
    const url = `${window.location.origin}/shared-itinerary/${Date.now()}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url);
    toast({
      title: "Share link copied! 🔗",
      description: "Your itinerary link has been copied to clipboard.",
    });
  };

  const planRescue = () => {
    toast({
      title: "Plan-Rescue activated! 🚨",
      description: "AI is analyzing your itinerary for optimizations...",
    });
    // Here you would integrate with AI to suggest improvements
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'activity': return 'bg-primary';
      case 'meal': return 'bg-sunset';
      case 'transport': return 'bg-ocean-deep';
      case 'accommodation': return 'bg-palm';
      default: return 'bg-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'activity': return '🏃‍♂️';
      case 'meal': return '🍽️';
      case 'transport': return '🚗';
      case 'accommodation': return '🏨';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light to-sand p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ocean-deep mb-2">Your Mauritius Itinerary</h1>
            <p className="text-muted-foreground">Drag to reorder, click to edit, lock to protect</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={planRescue} variant="outline" className="bg-white/80">
              <RefreshCw className="h-4 w-4 mr-2" />
              Plan-Rescue
            </Button>
            <Button onClick={generateShareLink} variant="outline" className="bg-white/80">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={() => setIsChatOpen(true)} className="bg-gradient-tropical">
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex flex-wrap gap-2">
          {days.map(day => (
            <Button
              key={day}
              variant={selectedDay === day ? "default" : "outline"}
              onClick={() => setSelectedDay(day)}
              className={selectedDay === day ? "bg-gradient-tropical" : "bg-white/80"}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Day {day}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Day {selectedDay} Timeline
              </CardTitle>
              <CardDescription>
                Drag items to reorder your day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="timeline">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {filteredItinerary.map((item, index) => (
                        <Draggable 
                          key={item.id} 
                          draggableId={item.id} 
                          index={index}
                          isDragDisabled={item.isLocked}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-lg bg-white shadow-sm transition-all duration-200 ${
                                snapshot.isDragging ? 'shadow-tropical scale-105' : 'hover:shadow-md'
                              } ${item.isLocked ? 'opacity-75' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className={`${getCategoryColor(item.category)} text-white`}>
                                      {getCategoryIcon(item.category)} {item.category}
                                    </Badge>
                                    <span className="text-sm font-medium text-primary">{item.time}</span>
                                  </div>
                                  <h3 className="font-semibold text-ocean-deep mb-1">{item.title}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {item.location}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleLock(item.id)}
                                  className="text-muted-foreground hover:text-ocean-deep"
                                >
                                  {item.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 border-dashed">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Activity</DialogTitle>
                    <DialogDescription>
                      Add a new activity to Day {selectedDay}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Activity title" />
                    <Textarea placeholder="Description" />
                    <Input type="time" />
                    <Input placeholder="Location" />
                    <Button className="w-full bg-gradient-tropical">Add Activity</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Day {selectedDay} Map
              </CardTitle>
              <CardDescription>
                Explore your destinations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] rounded-b-lg overflow-hidden">
                <MapComponent items={filteredItinerary} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share URL Display */}
        {shareUrl && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-primary" />
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}