import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- HELPER: CUSTOM ICON GENERATOR ---
const createPulseIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker', // We will style this below to remove default box
    html: `<div class="relative flex items-center justify-center w-6 h-6">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75"></span>
             <span class="relative inline-flex rounded-full h-3 w-3 ${color}"></span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const TacticalMap = ({ banks, userLocation, selectedBank }) => {
  const mapContainerRef = useRef(null); // Ref for the HTML Div
  const mapInstanceRef = useRef(null);  // Ref for the Leaflet Map Object
  const markersLayerRef = useRef(null); // Ref for the LayerGroup (to clear markers easily)
  const polylineRef = useRef(null);     // Ref for the connection line
  const userMarkerRef = useRef(null);   // Ref specifically for user

  // --- 1. INITIALIZE MAP (Run once) ---
  useEffect(() => {
    if (mapInstanceRef.current) return; // Prevent double initialization in React 19 Strict Mode

    // Default Center (Punjab)
    const initialCenter = userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : [31.3260, 75.5762];

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false, // We hide default UI for cinematic look
      attributionControl: false,
      scrollWheelZoom: true
    });

    // Add Dark Matter Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    // Create a LayerGroup for bank markers so we can clear them later
    const markersLayer = L.layerGroup().addTo(map);
    
    // Save instances to refs
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Empty dependency array = runs once on mount


  // --- 2. HANDLE USER MARKER ---
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const icon = createPulseIcon('bg-blue-500');
    const { lat, lng } = userLocation;

    // If marker exists, move it. If not, create it.
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      userMarkerRef.current = L.marker([lat, lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<div class="text-xs font-bold text-gray-800">YOUR LOCATION</div>');
    }
  }, [userLocation]);


  // --- 3. RENDER BLOOD BANK MARKERS ---
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    // Clear existing bank markers to avoid duplicates during updates
    markersLayerRef.current.clearLayers();

    banks.forEach((bank) => {
      const [lng, lat] = bank.coordinates.coordinates;
      const isSelected = selectedBank?._id === bank._id;
      
      const icon = isSelected 
        ? createPulseIcon('bg-emerald-500 shadow-[0_0_20px_#10b981]') // Glowing Green for Selected
        : createPulseIcon('bg-red-500');

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`<div class="text-xs font-bold text-gray-400">${bank.name}</div>`);

      // Add to the layer group
      markersLayerRef.current.addLayer(marker);
      
      // If this is the selected bank, open its popup automatically
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [banks, selectedBank]);


  // --- 4. HANDLE SELECTION & ANIMATION (FlyTo + Line) ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // A. Remove existing line
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (selectedBank && selectedBank.coordinates) {
      const [targetLng, targetLat] = selectedBank.coordinates.coordinates;

      // 1. FLY ANIMATION
      map.flyTo([targetLat, targetLng], 15, {
        animate: true,
        duration: 2.0, // Cinematic slow zoom
        easeLinearity: 0.25
      });

      // 2. DRAW CONNECTION LINE (User -> Target)
      if (userLocation) {
        const linePath = [
          [userLocation.lat, userLocation.lng],
          [targetLat, targetLng]
        ];

        const polyline = L.polyline(linePath, {
          color: '#10b981', // Emerald Color
          weight: 3,
          dashArray: '10, 10', // Dashed Effect
          opacity: 0.7,
          lineCap: 'round'
        }).addTo(map);

        polylineRef.current = polyline;
      }
    } 
    else if (userLocation) {
      // If selection cleared, go back to user
      map.flyTo([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 1.5
      });
    }

  }, [selectedBank, userLocation]);


  return (
    <div className="w-full h-full relative z-0">
      
      {/* 1. THE MAP CONTAINER (Pure DOM Element) */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full bg-black"
        style={{ zIndex: 1 }}
      />

      {/* 2. OVERLAY: GRID TEXTURE (The "Tactical" Overlay) */}
      <div className="absolute inset-0 pointer-events-none z-[1000] opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* 3. Global CSS Injection for Clean Markers */}
      <style>{`
        /* Removes the white square background from Leaflet DivIcons */
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        /* Custom Dark Popup Styling */
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.8);
        }
        .leaflet-container {
          background: #000;
        }
      `}</style>
    </div>
  );
};

export default TacticalMap;