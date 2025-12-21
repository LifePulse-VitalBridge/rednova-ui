import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // <--- IMPORT THIS
import L from 'leaflet';
import NavigateButton from './NavigateButton';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Activity, Target } from 'lucide-react';

const EventMap = ({ isOpen, onClose, event }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    // --- 1. INITIALIZE MAP ---
    useEffect(() => {
        // Only initialize if we have the DOM element (mapRef.current)
        if (isOpen && event && mapRef.current && !mapInstance.current) {

            const map = L.map(mapRef.current, {
                center: event.coordinates,
                zoom: 13,
                zoomControl: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);

            const beaconIcon = L.divIcon({
                className: 'custom-beacon',
                html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white shadow-[0_0_20px_rgba(220,38,38,0.8)]"></span>
          </div>
        `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            L.marker(event.coordinates, { icon: beaconIcon })
                .addTo(map)
                .bindPopup(`
          <div class="text-center p-1 font-sans">
            <b style="color:black">${event.title}</b><br/>
            <span style="color:gray; font-size: 10px">${event.location}</span>
          </div>
        `)
                .openPopup();

            mapInstance.current = map;
        }

        // Cleanup
        return () => {
            if (!isOpen && mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [isOpen, event]);

    // --- 2. FLY TO ANIMATION ---
    useEffect(() => {
        if (mapInstance.current && event) {
            mapInstance.current.flyTo(event.coordinates, 15, {
                duration: 2.5,
                easeLinearity: 0.25
            });
        }
    }, [event]);

    if (!isOpen || !event) return null;

    // --- 3. THE PORTAL (The Magic Fix) ---
    // This takes the JSX below and renders it attached to document.body
    // ignoring all parent transforms/overflows.
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">

            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
                onClick={onClose}
            ></div>

            {/* MODAL CONTAINER */}
            <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-red-500/30 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)] animate-scale-up">

                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl z-20 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Target size={18} className="text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold tracking-widest uppercase text-sm">Target Locked</h3>
                            <p className="text-red-400 text-xs font-mono">UPLINK ESTABLISHED // {event.coordinates[0].toFixed(4)}, {event.coordinates[1].toFixed(4)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="cursor-pointer p-2 rounded-full hover:bg-red-500 hover:rotate-35 transition-all duration-600 text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* MAP CONTAINER */}
                <div className="relative h-[60vh] w-full bg-gray-900">
                    <div ref={mapRef} className="w-full h-full bg-[#0a0a0a]" />
                    <div className="absolute bottom-4 left-4 z-[400] bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 pointer-events-none">
                        <span className="text-[10px] font-mono text-green-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            LIVE SATELLITE FEED
                        </span>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-gradient-to-t from-red-900/10 to-transparent border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">{event.title}</h2>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin size={16} className="text-red-500" />
                                {event.location}
                            </div>
                        </div>

                        {/* --- NEW BUTTON COMPONENT --- */}
                        <NavigateButton coordinates={event.coordinates} />

                    </div>

                </div>

            </div>
        </div>,
        document.body // <--- TARGET DESTINATION
    );
};

export default EventMap;