import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Search, Bell, Settings, Globe, LayoutDashboard, 
  Map as MapIcon, AlertTriangle, Search as SearchIcon, BarChart3, 
  HelpCircle, LogOut, Plus, Minus, Locate, Layers,
  AlertCircle, Clock, Users, ChevronRight, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveNeedsMap = () => {
  const navigate = useNavigate();
  const [needs, setNeeds] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);

  const ZoomHandler = () => {
    const map = useMap();
    useEffect(() => {
      setMapInstance(map);
    }, [map]);
    return null;
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
    });

    return () => unsubscribe();
  }, []);

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return '#ba1a1a';
      case 'medium': return '#7e3000';
      case 'stable': return '#3525cd';
      default: return '#565e74';
    }
  };

  const getUrgencyBg = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'stable': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredNeeds = needs.filter(need => {
    if (filter === 'all') return true;
    return need.urgencyLevel?.toLowerCase() === filter;
  });

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-[1000]">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black text-primary tracking-tighter">ImpactFlow</h1>
          <nav className="hidden lg:flex items-center gap-6">
            <button onClick={() => navigate('/coordinator')} className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Dashboard</button>
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-1">Live Map</button>
            <button onClick={() => navigate('/coordinator/impact')} className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Impact</button>
          </nav>
        </div>

        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Search active coordinates..."
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><Bell size={20} /></button>
          <button onClick={() => navigate('/coordinator/add-need')} className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Add Need
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50 hidden lg:flex flex-col p-4 gap-2 z-40">
          <div className="mb-6 px-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">Global Relief</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">NGO Partner</p>
            </div>
          </div>

          <div className="space-y-1">
            <button onClick={() => navigate('/coordinator')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200/50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <LayoutDashboard size={18} /> Overview
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white text-primary shadow-sm rounded-xl hover:scale-105 active:scale-95 transition-all font-bold text-sm">
              <MapIcon size={18} /> Live Map
            </button>
            <button onClick={() => navigate('/coordinator/add-need')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200/50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <AlertTriangle size={18} /> Resource Needs
            </button>
          </div>

          <div className="mt-8 px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Map Filters</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Urgency Level</label>
                <div className="flex flex-col gap-2">
                  {['all', 'critical', 'medium', 'stable'].map(u => (
                    <button 
                      key={u}
                      onClick={() => setFilter(u)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold capitalize text-left transition-all ${filter === u ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-200 pt-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200/50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <HelpCircle size={18} /> Help Center
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative z-10">
          <MapContainer 
            center={[20, 0]} 
            zoom={3} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <ZoomHandler />

            {filteredNeeds.map((need) => (
              <Marker 
                key={need.id} 
                position={[need.gpsLocation?._lat || 0, need.gpsLocation?._long || 0]}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="relative group">
                          <div class="absolute -inset-2 rounded-full animate-ping opacity-20" style="background-color: ${getUrgencyColor(need.urgencyLevel)}"></div>
                          <div class="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-125" style="border-color: ${getUrgencyColor(need.urgencyLevel)}">
                            <span class="text-lg" style="color: ${getUrgencyColor(need.urgencyLevel)}">📍</span>
                          </div>
                        </div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                })}
              >
                <Popup className="custom-popup" maxWidth={320}>
                  <div className="p-0 overflow-hidden rounded-xl bg-white min-w-[280px]">
                    <div className={`${getUrgencyBg(need.urgencyLevel)} p-4`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">{need.urgencyLevel} Urgency</span>
                        <span className="text-[10px] font-bold opacity-70">#{need.id.slice(-6)}</span>
                      </div>
                      <h4 className="font-black text-slate-900 leading-snug">{need.communityName}</h4>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-slate-500 line-clamp-2">{need.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 p-1.5 rounded-lg"><Users size={14} className="text-slate-500"/></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Impact</p>
                            <p className="text-xs font-black text-slate-800">{need.peopleAffected} souls</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 p-1.5 rounded-lg"><Clock size={14} className="text-slate-500"/></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                            <p className="text-xs font-black text-slate-800 capitalize">{need.status || 'Active'}</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate(`/coordinator/matching/${need.id}`)}
                        className="w-full bg-primary text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        AI Matching <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-[1000]">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-1 flex flex-col">
              <button 
                onClick={() => mapInstance?.zoomIn()}
                className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 hover:scale-110 active:scale-90 rounded-xl transition-all"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={() => mapInstance?.zoomOut()}
                className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 hover:scale-110 active:scale-90 rounded-xl transition-all border-t border-slate-100"
              >
                <Minus size={20} />
              </button>
            </div>
            <button 
              onClick={() => mapInstance?.setView([20, 0], 3)}
              className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all"
            >
              <Locate size={20} />
            </button>
            <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all"><Layers size={20} /></button>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white/50 w-72 z-[1000]">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Live Impact Monitor</h5>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-700">Critical Needs</span>
                </div>
                <span className="text-sm font-black text-slate-900">{needs.filter(n => n.urgencyLevel?.toLowerCase() === 'critical').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                  <span className="text-xs font-bold text-slate-700">Medium Priority</span>
                </div>
                <span className="text-sm font-black text-slate-900">{needs.filter(n => n.urgencyLevel?.toLowerCase() === 'medium').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(53,37,205,0.5)]"></div>
                  <span className="text-xs font-bold text-slate-700">Active Missions</span>
                </div>
                <span className="text-sm font-black text-slate-900">{needs.length}</span>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 font-medium italic">Streaming live from field units...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveNeedsMap;
