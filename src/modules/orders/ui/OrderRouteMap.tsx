import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icons in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface OrderRouteMapProps {
  pickup: { lat: number; lng: number; address: string };
  delivery: { lat: number; lng: number; address: string };
  className?: string;
}

const RecenterMap = ({ pickup, delivery }: { pickup: [number, number], delivery: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([pickup, delivery]);
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [pickup, delivery, map]);
  return null;
};

const OrderRouteMap: React.FC<OrderRouteMapProps> = ({ pickup, delivery, className }) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/bicycle/${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRoute(coords);
          setDuration(Math.round(data.routes[0].duration / 60)); // seconds to minutes
          setDistance(Number((data.routes[0].distance / 1000).toFixed(1))); // meters to km
        }
      } catch (error) {
        console.error('Failed to fetch route:', error);
        // Fallback to straight line if API fails
        setRoute([[pickup.lat, pickup.lng], [delivery.lat, delivery.lng]]);
      }
    };

    fetchRoute();
  }, [pickup, delivery]);

  const pickupIcon = L.divIcon({
    html: renderToString(<div className="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg"><MapPin size={16} color="white" /></div>),
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const deliveryIcon = L.divIcon({
    html: renderToString(<div className="bg-rose-500 p-2 rounded-full border-2 border-white shadow-lg"><MapPin size={16} color="white" /></div>),
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-900 ${className}`}>
      <MapContainer 
        center={[pickup.lat, pickup.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="#10b981" 
            weight={4} 
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
          <Popup>{pickup.address}</Popup>
        </Marker>

        <Marker position={[delivery.lat, delivery.lng]} icon={deliveryIcon}>
          <Popup>{delivery.address}</Popup>
        </Marker>

        <RecenterMap pickup={[pickup.lat, pickup.lng]} delivery={[delivery.lat, delivery.lng]} />
      </MapContainer>

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        {duration !== null && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl">
            <Bike size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-white">{duration} min</span>
          </div>
        )}
        {distance !== null && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl">
            <MapPin size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-white">{distance} km</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderRouteMap;
