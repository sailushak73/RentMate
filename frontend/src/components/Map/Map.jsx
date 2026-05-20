import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map bounds
const MapBoundsUpdater = ({ validProperties }) => {
  const map = useMap();

  useEffect(() => {
    if (validProperties.length > 0) {
      const bounds = L.latLngBounds();
      validProperties.forEach(p => {
        bounds.extend([p.coordinates.lat, p.coordinates.lng]);
      });
      // If there's only one property or they are all very close, don't zoom in too much
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, validProperties]);

  return null;
};

const Map = ({ properties }) => {
  // Default center if no properties or properties have no valid coordinates
  const defaultCenter = [12.9716, 77.5946]; // Bangalore coordinates as placeholder
  
  const validProperties = properties.filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng);
  
  const center = validProperties.length > 0 
    ? [validProperties[0].coordinates.lat, validProperties[0].coordinates.lng] 
    : defaultCenter;

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapBoundsUpdater validProperties={validProperties} />
        
        {/* Dark theme Map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {validProperties.map((property) => (
          <Marker 
            key={property._id} 
            position={[property.coordinates.lat, property.coordinates.lng]}
          >
            <Popup>
              <div style={{ color: '#000', padding: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{property.apartmentName}</h4>
                <p style={{ margin: '0 0 0.5rem 0' }}>{property.bhkType} • ₹{property.rent?.toLocaleString('en-IN')}/mo</p>
                <a href={`/property/${property._id}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>View Details</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
