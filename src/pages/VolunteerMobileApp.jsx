import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, User, MapPin, CheckCircle2, Navigation, 
  Clock, Package, ClipboardCheck, History, 
  ChevronRight, AlertCircle, Sparkles, LogOut, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VolunteerMobileApp = () => {
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [nearbyTasks, setNearbyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    if (!currentUser) return;

    // Fetch volunteer data for name fallback
    const unsubVolunteer = onSnapshot(doc(db, 'volunteers', currentUser.uid), (doc) => {
      if (doc.exists()) {
        setVolunteerData(doc.data());
      }
    });

    // 1. Listen for assigned tasks
    const qAssigned = query(
      collection(db, 'needs'), 
      where('assignedTo', '==', currentUser.uid),
      where('status', 'in', ['assigned', 'checked-in'])
    );
    
    const unsubAssigned = onSnapshot(qAssigned, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignedTasks(tasks);
      
      // Set the first "checked-in" task as active, or the first assigned task
      const current = tasks.find(t => t.status === 'checked-in') || tasks[0];
      setActiveTask(current);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching assigned tasks:", error);
      setLoading(false);
    });

    // 2. Listen for open nearby tasks
    const qNearby = query(
      collection(db, 'needs'),
      where('status', '==', 'open')
    );

    const unsubNearby = onSnapshot(qNearby, (snapshot) => {
      setNearbyTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching nearby tasks:", error);
    });

    return () => {
      unsubVolunteer();
      unsubAssigned();
      unsubNearby();
    };
  }, [currentUser]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'needs', taskId), {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });

      await addDoc(collection(db, 'activity_logs'), {
        activityType: `task_${newStatus}`,
        message: `Volunteer ${currentUser.displayName || volunteerData?.fullName || 'Volunteer'} marked task as ${newStatus}`,
        relatedNeedId: taskId,
        relatedVolunteerId: currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleClaimTask = async (taskId) => {
    try {
      await updateDoc(doc(db, 'needs', taskId), {
        assignedTo: currentUser.uid,
        status: 'assigned',
        lastUpdated: serverTimestamp()
      });

      await addDoc(collection(db, 'activity_logs'), {
        activityType: 'task_claimed',
        message: `${currentUser.displayName || volunteerData?.fullName || 'Volunteer'} claimed a new task`,
        relatedNeedId: taskId,
        relatedVolunteerId: currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error claiming task:", error);
      alert("Failed to claim task. It might have been taken.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center font-black text-primary p-6 text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-xl tracking-tighter">SYNCING IMPACT ASSETS...</p>
      <p className="text-slate-400 text-sm mt-2 font-medium">Connecting to secure field nodes</p>
    </div>
  );

  const displayName = currentUser?.displayName || userData?.fullName || volunteerData?.fullName || (loading ? 'Loading...' : 'Volunteer');

  const ProfileView = () => (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl">
          {userData?.fullName?.[0] || 'V'}
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{userData?.fullName || 'Volunteer'}</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{userData?.role || 'Field Agent'}</p>
        
        <div className="grid grid-cols-2 gap-4 w-full mt-8">
          <div className="bg-slate-50 p-4 rounded-3xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Missions</p>
            <p className="text-xl font-black text-slate-900">12</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact pts</p>
            <p className="text-xl font-black text-slate-900">2.4k</p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-4">Account Dossier</h3>
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <LogOut size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
              <p className="text-sm font-black text-slate-800">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <MapPin size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Current Deployment Base</p>
              <p className="text-sm font-black text-slate-800">{userData?.location || 'Not Set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Users size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Specialized Skills</p>
              <p className="text-sm font-black text-slate-800">{userData?.skills || 'General Support'}</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-50 text-red-600 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-3"
      >
        <LogOut size={18} /> Termination of Session (Sign Out)
      </button>
    </div>
  );

  return (
    <div className="bg-surface min-h-screen pb-32 font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sparkles size={16} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">ImpactFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all"><Bell size={20} /></button>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-primary/20 transition-all"
          >
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} alt="Profile" />
          </button>
        </div>
      </header>

      <main className="px-6 pt-8 max-w-5xl mx-auto">
        {activeTab === 'tasks' ? (
          <>
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">Hello, {displayName.split(' ')[0]}!</h1>
              <p className="text-slate-500 font-medium text-lg">Ready to make an impact today? Your expertise is currently matched with several field missions.</p>
            </div>

        {/* Active Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Duty Status</p>
              <p className="text-sm font-bold text-slate-900">Active & Ready</p>
            </div>
          </div>
          <button onClick={() => logout()} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>

        {/* Current Active Task (If any) */}
        {activeTask ? (
          <section className="mb-10">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Active Assignment
            </h2>
            <motion.div 
              layoutId="active-task"
              className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black leading-tight mb-1">{activeTask.communityName}</h3>
                    <p className="text-white/70 text-sm font-medium">{activeTask.location}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                    <Package size={24} />
                  </div>
                </div>
                
                <div className="bg-black/10 rounded-2xl p-4 mb-6">
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Instructions</p>
                  <p className="text-sm font-medium opacity-90 leading-relaxed">
                    {activeTask.description || "Report to the coordinate and verify the status of current supplies."}
                  </p>
                </div>

                <div className="flex gap-3">
                  {activeTask.status === 'assigned' ? (
                    <button 
                      onClick={() => handleStatusUpdate(activeTask.id, 'checked-in')}
                      className="flex-1 py-4 bg-white text-primary rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} /> Check-in
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusUpdate(activeTask.id, 'completed')}
                      className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Complete Task
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/map?focus=${activeTask.id}`)}
                    className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/30 hover:scale-105 active:scale-90 transition-all"
                  >
                    <Navigation size={20} />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </motion.div>
          </section>
        ) : (
          <div className="mb-10 p-10 bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
            <ClipboardCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-900 font-black">No Active Assignment</p>
            <p className="text-slate-500 text-sm font-medium mt-1">Claim an opportunity below to get started.</p>
          </div>
        )}

        {/* Upcoming / Nearby Tasks */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">Nearby Opportunities</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">{nearbyTasks.length} Available</span>
               <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sorted by proximity</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nearbyTasks.map(task => (
              <motion.div 
                key={task.id}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 flex items-center gap-4 group transition-all"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900 truncate">{task.title || task.communityName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.needCategory} • {task.location}</p>
                </div>
                <button 
                  onClick={() => handleClaimTask(task.id)}
                  className="px-4 py-2 bg-slate-100 hover:bg-primary hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Claim
                </button>
              </motion.div>
            ))}

            {nearbyTasks.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <ClipboardCheck size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm font-bold text-slate-400">All clear in your area!</p>
                <p className="text-xs text-slate-400 mt-1">Check back soon for new needs.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Impact Feed */}
        <section>
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <History size={18} className="text-primary" /> Your Recent Impact
          </h2>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black">{volunteerData?.livesTouched || '0'}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Lives Touched</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-white/80">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Verified Agent since {volunteerData?.createdAt ? new Date(volunteerData.createdAt.seconds * 1000).toLocaleDateString() : '2024'}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-white/80">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Status: {volunteerData?.status || 'Active'}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </section>
          </>
        ) : (
          <ProfileView />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 h-20 px-8 flex items-center justify-around z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'tasks' ? 'text-primary scale-110' : 'text-slate-300'}`}
        >
          <div className={`w-12 h-8 rounded-xl flex items-center justify-center mb-1 ${activeTab === 'tasks' ? 'bg-primary/10' : ''}`}>
            <Package size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Tasks</span>
        </button>
        <button 
          onClick={() => navigate('/map')}
          className="text-slate-300 flex flex-col items-center gap-1 hover:text-primary hover:scale-110 transition-all"
        >
          <div className="w-12 h-8 flex items-center justify-center mb-1">
            <MapPin size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-primary scale-110' : 'text-slate-300'}`}
        >
          <div className={`w-12 h-8 rounded-xl flex items-center justify-center mb-1 ${activeTab === 'profile' ? 'bg-primary/10' : ''}`}>
            <User size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default VolunteerMobileApp;
