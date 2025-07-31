import { useState } from "react";
import { Download, Printer, Share2, Mail, FileText, Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ItineraryItem {
  id: string;
  day: number;
  title: string;
  description: string;
  time: string;
  location: string;
  category: 'activity' | 'meal' | 'transport' | 'accommodation';
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const sampleItinerary: ItineraryItem[] = [
  {
    id: '1',
    day: 1,
    title: 'Arrival & Check-in',
    description: 'Airport pickup and hotel check-in at Le Morne',
    time: '14:00',
    location: 'Le Morne Brabant',
    category: 'accommodation'
  },
  {
    id: '2',
    day: 1,
    title: 'Sunset Beach Walk',
    description: 'Romantic walk along Le Morne beach with stunning sunset views',
    time: '18:00',
    location: 'Le Morne Beach',
    category: 'activity'
  },
  {
    id: '3',
    day: 2,
    title: 'Underwater Sea Walk',
    description: 'Explore marine life without diving skills at Blue Bay',
    time: '09:00',
    location: 'Blue Bay Marine Park',
    category: 'activity'
  },
  {
    id: '4',
    day: 2,
    title: 'Creole Lunch',
    description: 'Authentic Mauritian cuisine at local restaurant',
    time: '13:00',
    location: 'Mahebourg',
    category: 'meal'
  },
  {
    id: '5',
    day: 3,
    title: 'Chamarel Seven Colored Earth',
    description: 'Visit the famous geological formation and Chamarel Waterfall',
    time: '10:00',
    location: 'Chamarel',
    category: 'activity'
  }
];

const sampleExpenses: Expense[] = [
  { id: '1', category: 'accommodation', description: 'Hotel Le Morne - 3 nights', amount: 450, date: '2024-03-15' },
  { id: '2', category: 'food', description: 'Dinner at Beach Restaurant', amount: 85, date: '2024-03-15' },
  { id: '3', category: 'transport', description: 'Airport Transfer', amount: 45, date: '2024-03-15' },
  { id: '4', category: 'activity', description: 'Underwater Sea Walk', amount: 120, date: '2024-03-16' },
];

export default function Export() {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'email' | 'print'>('pdf');
  const { toast } = useToast();

  const days = Array.from(new Set(sampleItinerary.map(item => item.day))).sort();
  const totalBudget = 2500;
  const totalSpent = sampleExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'activity': return '🏃‍♂️';
      case 'meal': return '🍽️';
      case 'transport': return '🚗';
      case 'accommodation': return '🏨';
      default: return '📍';
    }
  };

  const handleExport = (format: 'pdf' | 'email' | 'print') => {
    setSelectedFormat(format);
    
    switch (format) {
      case 'pdf':
        // In a real app, this would generate a PDF
        toast({
          title: "PDF Export Started! 📄",
          description: "Your itinerary is being prepared for download...",
        });
        break;
      case 'email':
        toast({
          title: "Email Sent! 📧",
          description: "Your itinerary has been sent to your email address.",
        });
        break;
      case 'print':
        window.print();
        toast({
          title: "Print Ready! 🖨️",
          description: "Print dialog has been opened.",
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light to-sand p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-ocean-deep mb-2">Export & Share</h1>
            <p className="text-muted-foreground">Download, print, or share your complete itinerary</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleExport('pdf')} className="bg-gradient-tropical">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => handleExport('print')} variant="outline" className="bg-white/80">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => handleExport('email')} variant="outline" className="bg-white/80">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" className="bg-white/80">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>

        {/* Print-ready Itinerary */}
        <div className="print:shadow-none print:bg-white">
          <Card className="bg-white shadow-soft print:shadow-none print:border-none">
            <CardHeader className="text-center border-b print:border-gray-300">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img 
                  src="/lovable-uploads/c83b2fc6-c6a4-4ed0-816b-7656c565f556.png" 
                  alt="Dream-Trip Mauritius" 
                  className="h-12 w-auto"
                />
              </div>
              <CardTitle className="text-2xl text-ocean-deep">Mauritius Dream Trip Itinerary</CardTitle>
              <CardDescription className="text-lg">
                March 15-18, 2024 • 4 Days in Paradise
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 print:p-6">
              {/* Trip Overview */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-ocean-deep mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Trip Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span><strong>Duration:</strong> 4 days, 3 nights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span><strong>Budget:</strong> ${totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span><strong>Style:</strong> Luxury & Relaxation</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Daily Itinerary */}
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-ocean-deep flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Itinerary
                </h2>

                {days.map(day => {
                  const dayItems = sampleItinerary.filter(item => item.day === day);
                  return (
                    <div key={day} className="space-y-4">
                      <h3 className="text-lg font-semibold text-ocean-deep bg-muted/30 p-3 rounded-lg">
                        Day {day} - {new Date(2024, 2, 14 + day).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      
                      <div className="space-y-3 ml-4">
                        {dayItems.map((item, index) => (
                          <div key={item.id} className="flex items-start gap-4 p-3 bg-white rounded-lg border print:border-gray-300">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="text-lg">{getCategoryIcon(item.category)}</div>
                              <Badge variant="outline" className="text-xs">
                                {item.time}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-ocean-deep">{item.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-8" />

              {/* Budget Summary */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ocean-deep flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Summary
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-ocean-deep">${totalBudget.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-ocean-deep">${totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-palm">${(totalBudget - totalSpent).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-ocean-deep">Expense Breakdown:</h3>
                  {sampleExpenses.map(expense => (
                    <div key={expense.id} className="flex justify-between items-center text-sm p-2 bg-white rounded border print:border-gray-300">
                      <span>{expense.description}</span>
                      <span className="font-medium">${expense.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-8" />

              {/* Important Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ocean-deep">Important Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">Emergency Contacts</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Police Emergency: 999</li>
                      <li>Medical Emergency: 114</li>
                      <li>Tourist Hotline: 152</li>
                      <li>Airport Police: 637-3030</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Essential Phrases</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Hello: Bonzour (bon-ZHOOR)</li>
                      <li>Thank you: Mersi (mer-SEE)</li>
                      <li>Please: Silvouple (seel-voo-PLAY)</li>
                      <li>How much?: Konbyen? (kom-bee-AHN)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground">
                <p>This itinerary was created with Dream-Trip Mauritius</p>
                <p>Have an amazing trip! 🌴</p>
                <p className="mt-2">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-soft print:hidden">
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Choose how you'd like to save or share your itinerary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-white hover:bg-muted/50"
                onClick={() => handleExport('pdf')}
              >
                <Download className="h-6 w-6 text-primary" />
                <span className="text-sm">PDF Download</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-white hover:bg-muted/50"
                onClick={() => handleExport('print')}
              >
                <Printer className="h-6 w-6 text-primary" />
                <span className="text-sm">Print Copy</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-white hover:bg-muted/50"
                onClick={() => handleExport('email')}
              >
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-sm">Email to Me</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}