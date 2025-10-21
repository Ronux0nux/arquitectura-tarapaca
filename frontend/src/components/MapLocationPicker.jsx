import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fijar el icono por defecto de Leaflet - Solución sin require
const DefaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  React.useEffect(() => {
    const handleMapClick = (e) => {
      const coords = e.latlng;
      setPosition(coords);
      onLocationSelect({
        lat: coords.lat,
        lng: coords.lng,
        address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationSelect]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        Ubicación seleccionada: <br />
        Lat: {position.lat.toFixed(6)} <br />
        Lng: {position.lng.toFixed(6)}
      </Popup>
    </Marker>
  );
};

const MapLocationPicker = ({ onLocationSelect, defaultLocation = null }) => {
  const [location, setLocation] = useState(defaultLocation || [-19.5917, -65.1104]); // Iquique, Chile por defecto
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const handleSelect = useCallback((selectedLocation) => {
    setLocation([selectedLocation.lat, selectedLocation.lng]);
    onLocationSelect(selectedLocation);
  }, [onLocationSelect]);

  // Buscar ubicación por nombre usando Nominatim (OpenStreetMap) - Aislado del backend
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    try {
      console.log('🔍 Buscando ubicación:', searchQuery);
      
      // Timeout de 15 segundos
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&timeout=10`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Tarapaca-App/1.0' // Nominatim requiere User-Agent
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📡 Respuesta de Nominatim:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Se encontraron ubicaciones:', data.length);
        setSearchResults(data.map(result => ({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        })));
      } else {
        console.log('⚠️ No se encontraron resultados');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Error en búsqueda de ubicación:', error.message);
      if (error.name === 'AbortError') {
        console.warn('⚠️ La búsqueda tardó demasiado (timeout)');
      }
      // No muestra alerta para no interrumpir la experiencia
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleSelectSearchResult = (result) => {
    setLocation([result.lat, result.lng]);
    setSearchQuery('');
    setSearchResults([]);
    handleSelect(result);
  };

  return (
    <div className="w-full">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔍 Buscar por nombre de ubicación
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder="Ej: Iquique, Chile / Calle Principal, Santiago..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={(e) => handleSearch(e)}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '⏳...' : '🔍'}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="mt-3 bg-white border border-gray-200 rounded-md max-h-48 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-3 py-2 hover:bg-blue-100 border-b border-gray-200 last:border-b-0 text-sm"
              >
                <div className="font-medium text-gray-800">{result.address.split(',')[0]}</div>
                <div className="text-xs text-gray-500">{result.address}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">
          📍 O haz click en el mapa para seleccionar una ubicación
        </p>
      </div>
      <MapContainer
        center={location}
        zoom={13}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        className="border border-gray-300"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <LocationMarker onLocationSelect={handleSelect} />
      </MapContainer>
    </div>
  );
};

export default MapLocationPicker;
