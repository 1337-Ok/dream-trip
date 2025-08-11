import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Calendar, MapPin, Clock, Lock, Unlock, Share2, MessageCircle, RefreshCw, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const [pickingOnMap, setPickingOnMap] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newLocation, setNewLocation] = useState("");
  const [newCoords, setNewCoords] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateDays, setGenerateDays] = useState<number>(3);

  const [editItem, setEditItem] = useState<ItineraryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTime, setEditTime] = useState("10:00");
  const [editLocation, setEditLocation] = useState("");
  const [editCoords, setEditCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  // Sync days from Home tripData (start/end dates)
  useEffect(() => {
    const td = localStorage.getItem('tripData');
    if (!td) return;
    try {
      const data = JSON.parse(td);
      const { startDate, endDate } = data || {};
      if (!startDate || !endDate) return;
      const sd = new Date(startDate);
      const ed = new Date(endDate);
      if (isNaN(sd.getTime()) || isNaN(ed.getTime()) || ed < sd) return;
      const MS_PER_DAY = 86400000;
      const daysCount = Math.floor((ed.getTime() - sd.getTime()) / MS_PER_DAY) + 1;
      setItinerary((prev) => {
        const trimmed = prev.filter((it) => it.day <= daysCount);
        const haveDays = new Set(trimmed.map((it) => it.day));
        const additions: ItineraryItem[] = [];
        for (let d = 1; d <= daysCount; d++) {
          if (!haveDays.has(d)) {
            additions.push({
              id: `${Date.now()}-${d}-placeholder`,
              day: d,
              title: `Free time - Day ${d}`,
              description: 'Add activities you love or let AI suggest them',
              time: '10:00',
              location: 'Mauritius',
              coordinates: [-20.348404, 57.552152],
              isLocked: false,
              category: 'activity'
            });
          }
        }
        return [...trimmed, ...additions];
      });
      setSelectedDay(1);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleMapSelect = (coords: [number, number]) => {
    if (editItem) {
      setEditCoords(coords);
    } else {
      setNewCoords(coords);
    }
    setPickingOnMap(false);
    toast({
      title: "Location selected",
      description: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`
    });
  };

  const addActivity = () => {
    const id = Date.now().toString();
    const coords = newCoords ?? [-20.348404, 57.552152];
    const item: ItineraryItem = {
      id,
      day: selectedDay,
      title: newTitle || 'New Activity',
      description: newDescription || '',
      time: newTime || '10:00',
      location: newLocation || 'Custom location',
      coordinates: coords,
      isLocked: false,
      category: 'activity'
    };
    setItinerary((prev) => [...prev, item]);
    setNewTitle("");
    setNewDescription("");
    setNewTime("10:00");
    setNewLocation("");
    setNewCoords(null);
    toast({ title: "Activity added", description: `Added to day ${selectedDay}` });
  };

  const handleGeneratePlan = () => {
    const daysNum = Math.max(1, Math.min(30, Number(generateDays) || 1));
    const generated: ItineraryItem[] = [];
    for (let d = 1; d <= daysNum; d++) {
      generated.push({
        id: `${Date.now()}-${d}-1`,
        day: d,
        title: `Morning exploration Day ${d}`,
        description: 'Auto-generated activity',
        time: '09:00',
        location: 'Mauritius',
        coordinates: [-20.348404, 57.552152],
        isLocked: false,
        category: 'activity'
      });
      generated.push({
        id: `${Date.now()}-${d}-2`,
        day: d,
        title: `Local lunch Day ${d}`,
        description: 'Taste Mauritian cuisine',
        time: '13:00',
        location: 'Local Restaurant',
        coordinates: [-20.348404, 57.552152],
        isLocked: false,
        category: 'meal'
      });
    }
    setItinerary(generated);
    setSelectedDay(1);
    setIsGenerateOpen(false);
    toast({ title: 'Plan generated', description: `${daysNum} days added.` });
  };

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
            <Button onClick={() => setIsGenerateOpen(true)} variant="outline" className="bg-white/80">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Plan
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

        {/* Generate Plan Dialog */}
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Trip Plan</DialogTitle>
              <DialogDescription>Choose how many days to generate. Existing itinerary will be replaced.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ocean-deep">Number of days</label>
                <Input type="number" min={1} max={30} value={generateDays}
                  onChange={(e) => setGenerateDays(Number(e.target.value))} />
              </div>
              <Button className="bg-gradient-tropical w-full" onClick={handleGeneratePlan}>Generate</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Day Selector */}
        {days.length > 6 ? (
          <div className="w-full max-w-xs">
            <Select value={String(selectedDay)} onValueChange={(v) => setSelectedDay(Number(v))}>
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day} value={String(day)}>Day {day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
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
        )}


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
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditItem(item);
                                      setEditTitle(item.title);
                                      setEditDescription(item.description);
                                      setEditTime(item.time);
                                      setEditLocation(item.location);
                                      setEditCoords(item.coordinates);
                                    }}
                                    className="text-muted-foreground hover:text-ocean-deep"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
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
                    <Input placeholder="Activity title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    <Textarea placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                    <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    <Input placeholder="Location (name/address)" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                    <div className="text-sm text-muted-foreground">
                      Coordinates: {newCoords ? `${newCoords[0].toFixed(5)}, ${newCoords[1].toFixed(5)}` : 'Not set'}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setPickingOnMap(true)}>Pick on Map</Button>
                      <Button className="bg-gradient-tropical flex-1" onClick={addActivity}>Add Activity</Button>
                    </div>
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
                <MapComponent 
                  items={filteredItinerary}
                  showDirections={true}
                  userLocation={userLocation ?? undefined}
                  onSelectLocation={pickingOnMap ? handleMapSelect : undefined}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share URL Display */}
        {shareUrl && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-primary" />
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view your itinerary in read-only mode. To let others edit, share your screen or copy the plan into their app.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}