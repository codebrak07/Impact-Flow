import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Users, Globe, CheckCircle2, TrendingUp, Calendar, 
  Download, Search, Bell, Settings, Plus, Activity,
  LayoutDashboard, Map, ClipboardList, BarChart3, HelpCircle, LogOut
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ImpactDashboard = () => {
  const [stats, setStats] = useState({
    volunteers: 0,
    communities: 0,
    resolved: 0,
    activeMissions: 0
  });
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const chartData = [
    { day: 'Mon', actual: 45, projected: 40 },
    { day: 'Tue', actual: 52, projected: 45 },
    { day: 'Wed', actual: 48, projected: 50 },
    { day: 'Thu', actual: 61, projected: 55 },
    { day: 'Fri', actual: 55, projected: 60 },
    { day: 'Sat', actual: 67, projected: 65 },
    { day: 'Sun', actual: 80, projected: 70 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [needsSnap, volunteersSnap] = await Promise.all([
          getDocs(collection(db, 'needs')),
          getDocs(collection(db, 'volunteers'))
        ]);
        
        const needsData = needsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNeeds(needsData);
        
        setStats({
          volunteers: volunteersSnap.size,
          communities: new Set(needsData.map(n => n.location)).size,
          resolved: needsData.filter(n => n.status === 'completed').length,
          activeMissions: needsData.filter(n => n.status === 'assigned' || n.status === 'checked-in').length
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50 min-h-[calc(100vh-64px)] hidden lg:flex flex-col p-6 gap-2">
          <div className="mb-8 px-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">Global Relief</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">HQ Analytics</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button onClick={() => navigate('/coordinator')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200/50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <LayoutDashboard size={18} /> Overview
            </button>
            <button onClick={() => navigate('/coordinator/map')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200/50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <Map size={18} /> Live Map
            </button>
            <button onClick={() => navigate('/coordinator/add-need')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200/50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <ClipboardList size={18} /> Resource Needs
            </button>
            <button onClick={() => navigate('/coordinator/impact')} className="w-full flex items-center gap-3 px-3 py-2.5 bg-white text-primary shadow-sm rounded-xl hover:scale-105 active:scale-95 transition-all font-bold text-sm">
              <BarChart3 size={18} /> Impact Reports
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-200/50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <HelpCircle size={18} /> Help Center
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 hover:scale-105 active:scale-95 rounded-xl transition-all font-bold text-sm">
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 lg:p-12 max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Impact Dashboard</h1>
              <p className="text-slate-500 font-medium mt-2">Measuring social value and operational efficiency in real-time.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all">
                <Calendar size={18} className="text-slate-400" /> Last 30 Days
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Download size={18} /> Export Report
              </button>
            </div>
          </div>

          {/* Metric Cards Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Volunteers Matched', val: stats.volunteers, icon: <Users />, color: 'indigo', trend: '+12.5%' },
              { label: 'Communities Served', val: stats.communities, icon: <Globe />, color: 'sky', trend: '+4.2%' },
              { label: 'Cases Resolved', val: stats.resolved, icon: <CheckCircle2 />, color: 'emerald', trend: '+18.1%' },
              { label: 'Active Missions', val: stats.activeMissions, icon: <Activity />, color: 'amber', trend: 'Live' },
            ].map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={m.label}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 bg-${m.color}-50 text-${m.color}-600 rounded-2xl`}>
                    {React.cloneElement(m.icon, { size: 24 })}
                  </div>
                  <span className={`flex items-center text-emerald-600 text-[10px] font-black bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest`}>
                    <TrendingUp size={12} className="mr-1" /> {m.trend}
                  </span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                <h3 className="text-4xl font-black text-slate-900 mb-2">{m.val}</h3>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className={`h-full bg-${m.color}-500 rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Main Trend Chart */}
            <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Weekly Impact Trends</h3>
                  <p className="text-sm text-slate-500 font-medium">Cross-departmental fulfillment tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(53,37,205,0.4)]"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected</span>
                  </div>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3525cd" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3525cd" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="projected" 
                      stroke="#e2e8f0" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      fill="transparent" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#3525cd" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorActual)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Card */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-black text-slate-900 mb-2">Need Distribution</h3>
              <p className="text-sm text-slate-500 font-medium mb-10">Resource allocation by sector</p>
              
              <div className="space-y-8">
                {[
                  { label: 'Medical Supplies', p: 42, color: 'indigo' },
                  { label: 'Clean Water', p: 28, color: 'sky' },
                  { label: 'Emergency Shelter', p: 18, color: 'emerald' },
                  { label: 'Education Tools', p: 12, color: 'amber' },
                ].map(item => (
                  <div key={item.label} className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-600">{item.label}</span>
                      <span className="font-black text-slate-900">{item.p}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.p}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className={`h-full bg-${item.color}-500 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                  "AI Insights: Medical supply demand is up 14% this week in the East Valley region."
                </p>
              </div>
            </div>
          </div>

          {/* Area Coverage Heatmap (Real Map Integration) */}
          <div className="bg-slate-900 p-1 rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-indigo-900/20 h-[500px]">
            <div className="absolute top-10 left-10 z-20 pointer-events-none">
              <h3 className="text-2xl font-black mb-2 drop-shadow-lg">Global Impact Coverage</h3>
              <p className="text-white/70 text-sm font-medium drop-shadow-md">Live visualization of resource distribution and mission success</p>
            </div>
            
            <MapContainer 
              center={[20, 0]} 
              zoom={2} 
              className="w-full h-full rounded-[2.8rem]"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {needs.map((need) => (
                <CircleMarker
                  key={need.id}
                  center={[need.gpsLocation?._lat || 0, need.gpsLocation?._long || 0]}
                  radius={need.status === 'completed' ? 12 : 8}
                  pathOptions={{
                    fillColor: need.status === 'completed' ? '#10b981' : '#3525cd',
                    color: 'white',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.6
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-black text-slate-900">{need.communityName}</p>
                      <p className="text-xs text-slate-500">{need.location}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${need.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {need.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            
            <div className="absolute bottom-10 right-10 z-20 flex items-center gap-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Resolved Impact</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(53,37,205,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Active Missions</span>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ImpactDashboard;
