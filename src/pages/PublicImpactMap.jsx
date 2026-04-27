import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Globe, X, ChevronRight, Users, Clock, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PublicImpactMap = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(3);

  const cityCoords = {
    'mumbai': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090],
    'bangalore': [12.9716, 77.5946],
    'hyderabad': [17.3850, 78.4867],
    'chennai': [13.0827, 80.2707],
    'kolkata': [22.5726, 88.3639],
    'pune': [18.5204, 73.8567],
    'east valley': [19.1200, 72.9100], // Mock for seed data
    'downtown': [18.9220, 72.8340],
    'north hills': [19.2500, 72.8500],
    'industrial zone': [19.0000, 73.0000]
  };

  useEffect(() => {
    const q = query(collection(db, 'needs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const needsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNeeds(needsData);
      setLoading(false);

      // Handle URL Parameters
      const params = new URLSearchParams(window.location.search);
      const focusId = params.get('focus');

      if (focusId) {
        const focusedTask = needsData.find(n => n.id === focusId);
        if (focusedTask) {
          const position = focusedTask.gpsLocation 
            ? [focusedTask.gpsLocation._lat, focusedTask.gpsLocation._long]
            : (focusedTask.location && cityCoords[focusedTask.location.toLowerCase().trim()])
              ? cityCoords[focusedTask.location.toLowerCase().trim()]
              : null;
          
          if (position) {
            setMapCenter(position);
            setZoom(15);
            return;
          }
        }
      }

      // Default: Center map on user city if they just clicked "Explore"
      if (userData?.location) {
        const userCity = userData.location.toLowerCase().trim();
        if (cityCoords[userCity]) {
          setMapCenter(cityCoords[userCity]);
          setZoom(12);
        }
      }
    });

    return () => unsubscribe();
  }, [userData]);

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return '#ba1a1a';
      case 'medium': return '#7e3000';
      case 'stable': return '#3525cd';
      default: return '#565e74';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden font-inter">
      {/* Mini Header for Public View */}
      <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-[1000] absolute top-0 w-full">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
            <Globe size={20} className="text-primary" /> Global Impact Monitor
          </h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-2 rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          Join the Mission
        </button>
      </header>

      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        className="w-full h-full z-10"
        zoomControl={false}
        key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render when center changes
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Volunteer Home Marker */}
        {userData?.location && cityCoords[userData.location.toLowerCase().trim()] && (
          <Marker 
            position={cityCoords[userData.location.toLowerCase().trim()]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="relative">
                      <div class="w-8 h-8 rounded-full bg-primary border-4 border-white flex items-center justify-center shadow-2xl">
                        <div class="text-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                      </div>
                      <div class="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md whitespace-nowrap shadow-xl">
                        YOUR BASE: ${userData.location}
                      </div>
                    </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          >
            <Popup>
              <div className="p-2 text-center font-black text-slate-900 uppercase tracking-widest text-[10px]">
                Your Registered Deployment Base
              </div>
            </Popup>
          </Marker>
        )}

        {needs.map((need) => {
          const position = need.gpsLocation 
            ? [need.gpsLocation._lat, need.gpsLocation._long]
            : (need.location && cityCoords[need.location.toLowerCase().trim()])
              ? cityCoords[need.location.toLowerCase().trim()]
              : null;

          if (!position) return null;

          return (
            <Marker 
              key={need.id} 
              position={position}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="relative">
                        <div class="absolute -inset-2 rounded-full animate-ping opacity-20" style="background-color: ${getUrgencyColor(need.urgency || need.urgencyLevel)}"></div>
                        <div class="w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow-lg" style="border-color: ${getUrgencyColor(need.urgency || need.urgencyLevel)}">
                          <div class="w-2 h-2 rounded-full" style="background-color: ${getUrgencyColor(need.urgency || need.urgencyLevel)}"></div>
                        </div>
                      </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
            <Popup className="public-popup">
              <div className="p-4 bg-white min-w-[240px] rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{need.urgencyLevel} Urgency</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getUrgencyColor(need.urgencyLevel) }}></div>
                </div>
                <h4 className="font-black text-slate-900 mb-1">{need.communityName}</h4>
                <p className="text-xs text-slate-500 mb-4">{need.location}</p>
                
                <div className="flex items-center gap-4 py-3 border-y border-slate-100 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Impact</p>
                    <p className="text-xs font-black text-slate-800">{need.peopleAffected} People</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <p className="text-xs font-black text-slate-800 capitalize">{need.status || 'Active'}</p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                >
                  Help this Community <ChevronRight size={12} />
                </button>
              </div>
            </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Stats Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-3xl px-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-wrap justify-around gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{needs.length}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Needs</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/5 pl-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{needs.reduce((acc, curr) => acc + (parseInt(curr.peopleAffected) || 0), 0).toLocaleString()}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Souls Affected</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/5 pl-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{needs.filter(n => n.urgencyLevel === 'critical').length}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Critical Tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicImpactMap;
