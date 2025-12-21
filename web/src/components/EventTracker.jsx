import React, { useState, useEffect, useRef } from 'react';
import { initialEvents } from '../data/eventData';
import { MapPin, Clock, ChevronRight, ChevronLeft, Activity, Search, X, Calendar } from 'lucide-react';
import WidgetScrollScale from './WidgetScrollScale';
import EventMap from './EventMap';

// --- HELPER: The Event Card Component (Reused for both views) ---
export const EventCard = ({ event, isLive }) => {
    const progress = (event.collected / event.goal) * 100;

    return (
        <div className={`relative p-6 rounded-2xl border  transition-all duration-300 w-full
           
            ${isLive
                ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.15)]'
                : 'bg-white/5 border-white/10 hover:border-white/30'
            }
        `}>

            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2
                    ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-gray-400'}
                `}>
                    {isLive && <Activity size={12} />}
                    {event.status}
                </span>
                <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                    <Clock size={12} /> {event.time}
                </span>
            </div>

            {/* Title & Location */}
            <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <MapPin size={14} className="text-red-400" />
                {event.location}
            </div>

            {/* Progress Bar (Crowd Simulation) */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">COLLECTED</span>
                    <span className={isLive ? 'text-red-400' : 'text-gray-500'}>
                        {event.collected} / {event.goal} Units
                    </span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isLive ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gray-600'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Donors Stat */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3,].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-black"></div>
                        ))}
                    </div>
                    <span className="text-xs text-gray-300 font-bold">+{event.donorsJoined} Joined</span>
                </div>
            </div>
        </div>
    );
};

const EventTracker = () => {
    const [events, setEvents] = useState(initialEvents);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const carouselRef = useRef(null);

    // --- 1. CROWD SIMULATION ENGINE (The Heartbeat) ---
    // This updates the main 'events' state, so numbers update everywhere (Timeline AND Search)
    useEffect(() => {
        const interval = setInterval(() => {
            setEvents(currentEvents => {
                return currentEvents.map(event => {
                    if (event.status === "Live Now") {
                        // Randomly increase donors and units
                        const addDonor = Math.random() > 0.6;
                        const addUnit = Math.random() > 0.7;

                        return {
                            ...event,
                            donorsJoined: addDonor ? event.donorsJoined + 1 : event.donorsJoined,
                            collected: addUnit ? Math.min(event.collected + 1, event.goal) : event.collected
                        };
                    }
                    return event;
                });
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // --- 2. FILTER LOGIC (Letter-Reactive) ---
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- 3. CAROUSEL CONTROLS ---
    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-black/15 py-24 px-4 overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-red-900/20 rounded-full blur-[128px] pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10">

                {/* HEADER & SEARCH BAR */}
                <div className="flex flex-col items-center mb-20 space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                            CAMPAIGN <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500">TRACKER</span>
                        </h2>
                        <p className="text-gray-400">Join ongoing drives and track their real-time impact.</p>
                    </div>

                    {/* The Glass Search Bar */}
                    <div className="relative w-full max-w-md group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search event by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- VIEW SWITCHER LOGIC --- */}

                {/* VIEW 1: EMPTY STATE (Search returns nothing) */}
                {searchQuery && filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Calendar size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No campaigns found</h3>
                        <p className="text-gray-400 max-w-md">
                            Sorry, there are no announcements matching "<span className="text-red-400">{searchQuery}</span>".
                            Please check the spelling or clear the search to see all events.
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-8 px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white transition-colors text-sm font-bold uppercase"
                        >
                            Clear Search
                        </button>
                    </div>
                )}

                {/* VIEW 2: SEARCH RESULTS CAROUSEL (Horizontal Slider) */}
                {searchQuery && filteredEvents.length > 0 && (
                    <div className="relative w-full animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <p className="text-gray-400 text-sm">Found <span className="text-white font-bold">{filteredEvents.length}</span> matching campaigns</p>

                            {/* Navigation Buttons */}
                            <div className="flex gap-2">
                                <button onClick={scrollLeft} className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors border border-white/10">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={scrollRight} className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors border border-white/10">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* The Carousel Container */}
                        <div
                            ref={carouselRef}
                            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
                        >
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="min-w-[100%] md:min-w-[400px] snap-center">
                                    {/* Note: No ScrollScale here, we want instant visibility for search results */}

                                    <div onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                                        <EventCard event={event} isLive={event.status === "Live Now"} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW 3: DEFAULT VERTICAL TIMELINE (No Search) */}
                {!searchQuery && (
                    <div className="relative">
                        {/* The Central Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-purple-500 to-transparent opacity-30"></div>

                        <div className="space-y-12">
                            {filteredEvents.map((event, index) => {
                                const isLeft = index % 2 === 0;
                                const isLive = event.status === "Live Now";

                                return (
                                    <div key={event.id} className={`relative flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row-reverse' : ''}`}>

                                        {/* 1. THE DOT (Timeline Node) */}
                                        {/* Absolute positioned in the dead center */}
                                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-black bg-gray-800 z-20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            {isLive && <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>}
                                            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                        </div>

                                        {/* 2. THE SPACER (Empty Half) */}
                                        {/* ADDED 'shrink-0': This prevents the card from crushing the spacer */}
                                        <div className="w-full md:w-1/2 shrink-0"></div>

                                        {/* 3. THE CARD (Content Half) */}
                                        {/* Logic:
                                    - If Left Card: Add 'md:pr-12' (Push away from line to the left)
                                    - If Right Card: Add 'md:pl-12' (Push away from line to the right)
                                    - 'pl-12' is default for mobile to push away from the left-side line
                                */}
                                        <div className={`w-full md:w-1/2 pl-12 ${isLeft ? 'md:pl-0 md:pr-12' : 'md:pl-12 md:pr-0'}`}>
                                            <WidgetScrollScale>
                                                <div onClick={() => setSelectedEvent(event)} className="cursor-pointer" >
                                                    <EventCard event={event} isLive={isLive} />
                                                </div>
                                            </WidgetScrollScale>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
            {/* --- MAP MODAL LAYER --- */}
            <EventMap
                isOpen={!!selectedEvent}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
};

export default EventTracker;