import { Phone, MapPin, Globe, Heart, AlertCircle, Book } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const languagePhrases = [
  { english: "Hello", creole: "Bonzour", french: "Bonjour", pronunciation: "bon-ZHOOR" },
  { english: "Thank you", creole: "Mersi", french: "Merci", pronunciation: "mer-SEE" },
  { english: "Please", creole: "Silvouple", french: "S'il vous plaît", pronunciation: "seel-voo-PLAY" },
  { english: "Excuse me", creole: "Eskize mwa", french: "Excusez-moi", pronunciation: "eks-koo-zay-MWAH" },
  { english: "How much?", creole: "Konbyen?", french: "Combien?", pronunciation: "kom-bee-AHN" },
  { english: "Where is...?", creole: "Kot...?", french: "Où est...?", pronunciation: "oo-AY" },
  { english: "I don't understand", creole: "Mo pa konpran", french: "Je ne comprends pas", pronunciation: "zhuh nuh kom-prahn PAH" },
  { english: "Help!", creole: "Ede mwa!", french: "Au secours!", pronunciation: "oh suh-KOOR" },
];

const etiquetteTips = [
  {
    title: "Greetings",
    content: "Mauritians are friendly and welcoming. A handshake is common, and close friends may exchange kisses on both cheeks. Always greet with 'Bonjour' or 'Bonzour' during the day.",
    icon: "👋"
  },
  {
    title: "Dress Code",
    content: "Dress modestly when visiting religious sites. Beachwear is only appropriate at beaches and pools. Smart casual is preferred for restaurants and hotels.",
    icon: "👔"
  },
  {
    title: "Dining Etiquette", 
    content: "Wait to be seated at restaurants. Tipping 10-15% is appreciated but not mandatory. Try to finish your plate as leaving food is considered wasteful.",
    icon: "🍽️"
  },
  {
    title: "Religious Respect",
    content: "Mauritius is multicultural with Hindu, Muslim, Christian, and Buddhist communities. Remove shoes before entering temples and mosques.",
    icon: "🕌"
  },
  {
    title: "Photography",
    content: "Always ask permission before photographing people, especially at religious sites. Some areas may restrict photography.",
    icon: "📸"
  },
  {
    title: "Shopping",
    content: "Bargaining is acceptable at markets but not in shops with fixed prices. Central Market in Port Louis is great for souvenirs and local crafts.",
    icon: "🛍️"
  }
];

const emergencyContacts = [
  {
    service: "Police Emergency",
    number: "999",
    description: "For immediate police assistance"
  },
  {
    service: "Fire Service",
    number: "995",
    description: "Fire emergencies and rescue services"
  },
  {
    service: "Medical Emergency (SAMU)",
    number: "114",
    description: "Medical emergencies and ambulance"
  },
  {
    service: "Tourist Hotline",
    number: "152",
    description: "Tourist assistance and information"
  },
  {
    service: "Traffic Police",
    number: "208-5021",
    description: "Traffic incidents and road assistance"
  },
  {
    service: "Airport Police",
    number: "637-3030",
    description: "Airport security and assistance"
  }
];

const importantLocations = [
  {
    name: "Sir Seewoosagur Ramgoolam International Airport",
    address: "Plaine Magnien",
    phone: "603-6000",
    type: "Airport"
  },
  {
    name: "Victoria Hospital",
    address: "Candos, Quatre Bornes",
    phone: "424-3661",
    type: "Hospital"
  },
  {
    name: "Prime Minister's Office",
    address: "Level 6, New Government Centre, Port Louis",
    phone: "201-1146",
    type: "Government"
  },
  {
    name: "Mauritius Tourism Promotion Authority",
    address: "11th Floor, Air Mauritius Centre, Port Louis",
    phone: "210-1545",
    type: "Tourism"
  }
];

export default function LocalInfo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light to-sand p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ocean-deep mb-2">Local Information</h1>
          <p className="text-muted-foreground">Everything you need to know for a smooth trip</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {/* Language Phrases */}
          <AccordionItem value="language" className="border-0">
            <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-3 text-left">
                    <div className="bg-gradient-tropical p-2 rounded-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    Essential Phrases
                    <Badge variant="secondary" className="ml-auto">
                      3 Languages
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-left">
                    Key phrases in English, French, and Mauritian Creole
                  </CardDescription>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div>English</div>
                      <div>Mauritian Creole</div>
                      <div>French</div>
                      <div>Pronunciation</div>
                    </div>
                    {languagePhrases.map((phrase, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="font-medium text-ocean-deep">{phrase.english}</div>
                        <div className="text-primary font-medium">{phrase.creole}</div>
                        <div className="text-muted-foreground">{phrase.french}</div>
                        <div className="text-sm text-muted-foreground italic">{phrase.pronunciation}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Cultural Etiquette */}
          <AccordionItem value="etiquette" className="border-0">
            <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-3 text-left">
                    <div className="bg-gradient-sunset p-2 rounded-lg">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    Cultural Etiquette
                    <Badge variant="secondary" className="ml-auto">
                      {etiquetteTips.length} Tips
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-left">
                    Respect local customs and traditions
                  </CardDescription>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {etiquetteTips.map((tip, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{tip.icon}</div>
                          <div>
                            <h3 className="font-semibold text-ocean-deep mb-2">{tip.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Emergency Contacts */}
          <AccordionItem value="emergency" className="border-0">
            <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-3 text-left">
                    <div className="bg-destructive p-2 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    Emergency Contacts
                    <Badge variant="destructive" className="ml-auto">
                      Important
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-left">
                    Essential numbers for emergencies and assistance
                  </CardDescription>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-ocean-deep">{contact.service}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            {contact.number}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-destructive mb-1">Important Note</h4>
                        <p className="text-sm text-muted-foreground">
                          Save these numbers in your phone before traveling. In case of emergency, dial the appropriate number above. 
                          For tourists, the Tourist Hotline (152) provides 24/7 assistance in multiple languages.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Important Locations */}
          <AccordionItem value="locations" className="border-0">
            <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-3 text-left">
                    <div className="bg-gradient-ocean p-2 rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    Important Locations
                    <Badge variant="secondary" className="ml-auto">
                      Key Places
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-left">
                    Important addresses and contact information
                  </CardDescription>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {importantLocations.map((location, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-ocean-deep">{location.name}</h3>
                            <Badge variant="outline" className="mt-1">
                              {location.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {location.address}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {location.phone}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        {/* Quick Reference Card */}
        <Card className="bg-gradient-tropical text-white shadow-tropical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-6 w-6" />
              Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">🌡️</div>
                <div className="text-sm opacity-90">Temperature</div>
                <div className="font-semibold">20-30°C</div>
              </div>
              <div>
                <div className="text-2xl mb-1">💱</div>
                <div className="text-sm opacity-90">Currency</div>
                <div className="font-semibold">Mauritian Rupee</div>
              </div>
              <div>
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm opacity-90">Voltage</div>
                <div className="font-semibold">230V</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🚗</div>
                <div className="text-sm opacity-90">Driving</div>
                <div className="font-semibold">Left Side</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}