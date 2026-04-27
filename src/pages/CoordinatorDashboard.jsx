import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Map, ClipboardList, BarChart3, HelpCircle, 
  LogOut, PlusCircle, Search, Bell, Settings, 
  AlertCircle, CheckCircle2, Clock, Users, Activity,
  ArrowRight, Bot, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const CoordinatorDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    active: 0,
    critical: 0,
    volunteers: 0,
    efficiency: 86
  });
  const [recentNeeds, setRecentNeeds] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Real-time listener for needs
    const needsQuery = query(collection(db, 'needs'), orderBy('createdAt', 'desc'));
    const unsubscribeNeeds = onSnapshot(needsQuery, (snapshot) => {
      const needsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentNeeds(needsData.slice(0, 8)); // Show more on desktop
      
      setStats(prev => ({
        ...prev,
        active: needsData.length,
        critical: needsData.filter(n => n.urgency === 'critical').length
      }));
    });

    // Real-time listener for volunteers
    const volunteerQuery = query(collection(db, 'volunteers'));
    const unsubscribeVolunteers = onSnapshot(volunteerQuery, (snapshot) => {
      setStats(prev => ({ ...prev, volunteers: snapshot.size }));
    });

    // Activity Feed
    const logQuery = query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc'), limit(12));
    const unsubscribeLogs = onSnapshot(logQuery, (snapshot) => {
      setActivity(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeNeeds();
      unsubscribeVolunteers();
      unsubscribeLogs();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredNeeds = recentNeeds.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.communityName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen font-inter">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="w-72 border-r border-slate-200 bg-white hidden lg:flex flex-col p-8 gap-8 overflow-y-auto">
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Global Relief</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">HQ - North Division</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Main Menu</p>
            <nav className="space-y-2">
              <Link to="/coordinator" className="w-full flex items-center gap-4 px-4 py-3.5 bg-primary/5 text-primary rounded-2xl transition-all font-bold text-sm border border-primary/10">
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link to="/coordinator/map" className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-2xl transition-all font-bold text-sm">
                <Map size={20} /> Field Map
              </Link>
              <Link to="/coordinator/impact" className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-2xl transition-all font-bold text-sm">
                <BarChart3 size={20} /> Analytics
              </Link>
            </nav>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Resources</p>
            <nav className="space-y-2">
              <Link to="/coordinator/add-need" className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-2xl transition-all font-bold text-sm">
                <PlusCircle size={20} /> Register Need
              </Link>
              <button className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-2xl transition-all font-bold text-sm text-left">
                <Users size={20} /> Volunteers
              </button>
            </nav>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">System Status</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold">All Systems Nominal</span>
                </div>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all">
                  View Logs
                </button>
              </div>
              <Activity className="absolute -right-4 -bottom-4 text-white/5 rotate-12 group-hover:scale-125 transition-transform duration-700" size={120} />
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 mt-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="max-w-[1600px] mx-auto p-8 lg:p-12">
            {/* Top Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Mission <span className="text-primary">Control</span>
                </h1>
                <p className="text-slate-500 font-medium mt-2 text-lg">Centralized oversight for NGO coordination and crisis response.</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search mission needs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3.5 bg-white border-none rounded-2xl w-80 shadow-sm focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  />
                </div>
                <button className="p-3.5 bg-white text-slate-400 rounded-2xl shadow-sm hover:text-primary transition-all relative">
                  <Bell size={22} />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button 
                  onClick={() => navigate('/coordinator/add-need')}
                  className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <PlusCircle size={20} /> New Request
                </button>
              </div>
            </div>

            {/* Stats - Grid adjustments for ultra-wide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                { label: 'Active Missions', val: stats.active, icon: <ClipboardList />, color: 'primary', bg: 'bg-primary/5', text: 'text-primary', trend: '+12%' },
                { label: 'Critical Needs', val: stats.critical, icon: <AlertCircle />, color: 'red', bg: 'bg-red-50', text: 'text-red-600', trend: '-2%' },
                { label: 'Field Volunteers', val: stats.volunteers, icon: <Users />, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', trend: '+5%' },
                { label: 'System Efficiency', val: `${stats.efficiency}%`, icon: <Activity />, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', trend: 'Optimal' },
              ].map((s, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={s.label}
                  className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 group hover:border-primary/20 transition-all relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`p-4 ${s.bg} ${s.text} rounded-2xl group-hover:scale-110 transition-transform`}>
                      {React.cloneElement(s.icon, { size: 28 })}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                      <h3 className="text-4xl font-black text-slate-900">{s.val}</h3>
                      <span className={`text-[10px] font-bold ${s.trend.startsWith('+') ? 'text-emerald-500' : s.trend.startsWith('-') ? 'text-red-500' : 'text-primary'}`}>
                        {s.trend}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden relative z-10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      className={`h-full ${s.text.replace('text-', 'bg-')} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Grid Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Needs Queue - Desktop Focus */}
              <div className="xl:col-span-8 space-y-8">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                  <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <ClipboardList size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">Mission Queue</h2>
                        <p className="text-sm font-bold text-slate-400">Manage and assign verified community needs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden 2xl:flex items-center gap-2 mr-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Sync Active</span>
                      </div>
                      <select className="bg-slate-50 border-none rounded-xl text-xs font-black px-4 py-2.5 shadow-sm ring-1 ring-slate-100 focus:ring-primary/20">
                        <option>Urgency (High to Low)</option>
                        <option>Date (Newest)</option>
                        <option>Proximity</option>
                      </select>
                      <button onClick={() => navigate('/coordinator/map')} className="p-3 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-100 hover:text-primary transition-all active:scale-95">
                        <Map size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-slate-50 max-h-[800px] overflow-y-auto scrollbar-hide">
                    {filteredNeeds.map((need) => (
                      <div key={need.id} className="p-10 hover:bg-slate-50/80 transition-all group flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-slate-100 overflow-hidden flex-shrink-0 relative border-4 border-white shadow-lg">
                          {need.imageUrl ? (
                            <img src={need.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Bot size={40} />
                            </div>
                          )}
                          <div className={`absolute inset-0 bg-${need.urgency === 'critical' ? 'red' : 'amber'}-500/10 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center gap-4 mb-3">
                            <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{need.title}</h4>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${
                              need.urgency === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {need.urgency}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium line-clamp-2 mb-4 text-base max-w-2xl">{need.description}</p>
                          <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-[11px] font-black text-slate-500 uppercase tracking-widest">
                              <Map size={14} className="text-primary" /> {need.location || 'Sector 7'}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                              <Clock size={16} /> {new Date(need.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <Users size={16} /> 0 Applied
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex flex-col gap-3">
                          <button 
                            onClick={() => navigate(`/coordinator/matching/${need.id}`)}
                            className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black shadow-xl hover:bg-primary transition-all active:scale-95 group-hover:translate-x-2"
                          >
                            Find Matches
                          </button>
                          <button className="text-xs font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredNeeds.length === 0 && (
                      <div className="py-32 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                          <Bot size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-300 italic">No mission needs found matching your criteria.</h3>
                      </div>
                    )}
                  </div>
                </div>

                {/* Regional Health Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-indigo-600 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                        <Globe size={24} />
                      </div>
                      <h3 className="text-3xl font-black mb-4">Operational Density</h3>
                      <p className="text-indigo-100 font-medium mb-10 text-lg opacity-80">Volunteer saturation is currently peaking in North Hills. Recommendation: Shift capacity to East Valley.</p>
                      <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all">
                        View Density Map
                      </button>
                    </div>
                    <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
                  </div>
                  
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Regional Fulfillment</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Quarterly Progress</p>
                    <div className="space-y-8">
                      {[
                        { l: 'East Valley', p: 88, c: 'bg-primary' },
                        { l: 'North Hills', p: 42, c: 'bg-red-500' },
                        { l: 'Central Sector', p: 65, c: 'bg-indigo-500' },
                      ].map(r => (
                        <div key={r.l}>
                          <div className="flex justify-between text-sm font-black mb-3">
                            <span className="text-slate-700 uppercase tracking-wider text-xs">{r.l}</span>
                            <span className="text-slate-900">{r.p}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-50 rounded-full border border-slate-100 p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${r.p}%` }}
                              transition={{ duration: 2, ease: 'easeOut' }}
                              className={`h-full ${r.c} rounded-full shadow-lg shadow-black/5`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity & Side Intel */}
              <div className="xl:col-span-4 space-y-8">
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <Activity className="text-primary" /> Live Feed
                    </h3>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
                  </div>
                  
                  <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50">
                    {activity.map((log, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={log.id} 
                        className="relative pl-12 group"
                      >
                        <div className={`absolute left-0 top-0.5 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center transition-all group-hover:scale-110 ${
                          log.activityType === 'volunteer_registered' ? 'bg-indigo-500 text-white' : 
                          log.activityType === 'status_update' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'
                        }`}>
                          {log.activityType === 'volunteer_registered' ? <Users size={16} /> : <Activity size={16} />}
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-900 leading-tight mb-1">{log.message}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </span>
                            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">Verified</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {activity.length === 0 && (
                      <div className="py-20 text-center">
                        <p className="text-slate-300 font-bold italic">Listening for field updates...</p>
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full mt-12 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-xs font-black transition-all uppercase tracking-[0.2em]">
                    View History
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-300">
                  <h3 className="text-2xl font-black mb-8">System Presets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <Settings size={20} />, label: 'Rules' },
                      { icon: <Shield size={20} />, label: 'Auth' },
                      { icon: <Bot size={20} />, label: 'AI Sync' },
                      { icon: <HelpCircle size={20} />, label: 'Help' },
                    ].map(btn => (
                      <button key={btn.label} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl flex flex-col items-center gap-3 transition-all group">
                        <div className="text-white/40 group-hover:text-primary transition-colors">
                          {btn.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
