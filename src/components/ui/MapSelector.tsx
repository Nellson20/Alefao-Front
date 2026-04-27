import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Check, Search } from 'lucide-react';
import Button from './Button';

// Fix for default marker icon in Leaflet + React/Vite
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  title?: string;
}

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const ChangeView = ({ center }: { center: L.LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  initialLat = -18.8792, // Antananarivo, Madagascar
  initialLng = 47.5079,
  title = "Select Location"
}) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  useEffect(() => {
    if (isOpen && initialLat && initialLng) {
      setPosition(L.latLng(initialLat, initialLng));
    }
  }, [isOpen, initialLat, initialLng]);
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleConfirm = () => {
    if (position) {
      onSelect(position.lat, position.lng, address);
      onClose();
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      setAddress(data.display_name || "");
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  const searchAddress = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newPos = L.latLng(parseFloat(first.lat), parseFloat(first.lon));
        setPosition(newPos);
        setAddress(first.display_name);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (position) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [position]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-slate-800 border border-white/10 rounded-[32px] w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-xs text-slate-500">Click on the map to select a point</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Search Bar Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
            <div className="bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl p-1 flex items-center shadow-2xl">
              <input 
                type="text"
                placeholder="Search address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
                className="bg-transparent border-none outline-none flex-1 px-4 py-2 text-sm"
              />
              <button 
                onClick={searchAddress}
                className="p-2 bg-primary-500 hover:bg-primary-600 rounded-xl transition-all disabled:opacity-50"
                disabled={isSearching}
              >
                {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={18} />}
              </button>
            </div>
          </div>

          <MapContainer 
            center={position || [initialLat, initialLng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            {position && <ChangeView center={position} />}
          </MapContainer>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-slate-800/50 border-t border-white/5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0 mt-1">
              <MapPin size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Selected Address</p>
              <p className="text-sm font-medium text-slate-200 truncate">{address || "No location selected"}</p>
              {position && (
                <p className="text-[10px] text-slate-500 mt-1">
                  {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button 
              className="flex-1" 
              icon={Check} 
              disabled={!position}
              onClick={handleConfirm}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
