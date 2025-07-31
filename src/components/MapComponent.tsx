import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ItineraryItem {
  id: string;
  title: string;
  description: string;
  time: string;
  location: string;
  coordinates: [number, number];
  category: 'activity' | 'meal' | 'transport' | 'accommodation';
}

interface MapComponentProps {
  items: ItineraryItem[];
}

export default function MapComponent({ items }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-20.348404, 57.552152], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each item
    const markers: L.Marker[] = [];
    items.forEach((item, index) => {
      const categoryColors = {
        activity: '#1e40af',
        meal: '#ea580c',
        transport: '#059669',
        accommodation: '#7c3aed'
      };

      const categoryIcons = {
        activity: '🏃‍♂️',
        meal: '🍽️',
        transport: '🚗',
        accommodation: '🏨'
      };

      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${categoryColors[item.category]};
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${index + 1}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker(item.coordinates, { icon: customIcon })
        .bindPopup(`
          <div style="min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 16px;">${categoryIcons[item.category]}</span>
              <strong style="color: ${categoryColors[item.category]};">${item.time}</strong>
            </div>
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold;">${item.title}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${item.description}</p>
            <div style="display: flex; align-items: center; gap: 4px; color: #888; font-size: 12px;">
              📍 ${item.location}
            </div>
          </div>
        `)
        .addTo(map);

      markers.push(marker);
    });

    // Fit map to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [items]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}