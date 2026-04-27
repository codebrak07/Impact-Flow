import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getVolunteerRecommendations } from '../utils/groq';
import { 
  Sparkles, MapPin, Calendar, Clock, ShieldCheck, 
  ChevronRight, Users, Star, Check, Award,
  Zap, Info, Brain, Activity
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const VolunteerMatching = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const needId = searchParams.get('needId');

  const [need, setNeed] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingStatus, setMatchingStatus] = useState('Fetching data...');
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    if (!needId) return;

    const fetchData = async () => {
      try {
        setMatchingStatus('Loading community need...');
        const needDoc = await getDoc(doc(db, 'needs', needId));
        if (!needDoc.exists()) {
          alert("Need not found");
          return;
        }
        const needData = { id: needDoc.id, ...needDoc.data() };
        setNeed(needData);

        setMatchingStatus('Analyzing volunteer pool...');
        const volunteersSnapshot = await getDocs(collection(db, 'volunteers'));
        const volunteers = volunteersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMatchingStatus('AI Matching in progress...');
        const aiResults = await getVolunteerRecommendations(needData, volunteers);
        setRecommendations(aiResults);
      } catch (error) {
        console.error("Error in matching flow:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [needId]);

  const handleAssign = async (volunteerId, volunteerName) => {
    setAssigning(volunteerId);
    try {
      // 1. Update Need Status
      await updateDoc(doc(db, 'needs', needId), {
        status: 'assigned',
        assignedTo: volunteerId,
        assignedAt: serverTimestamp()
      });

      // 2. Create Assignment Log
      await addDoc(collection(db, 'activity_logs'), {
        activityType: 'volunteer_assigned',
        message: `${volunteerName} was assigned to ${need.communityName}`,
        relatedNeedId: needId,
        relatedVolunteerId: volunteerId,
        createdAt: serverTimestamp()
      });

      // 3. Success Notification and Redirect
      alert(`Successfully assigned ${volunteerName} to ${need.communityName}`);
      navigate('/coordinator');
    } catch (error) {
      console.error("Assignment error:", error);
      alert("Failed to assign volunteer");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-primary/10 p-8 rounded-full mb-8"
        >
          <Brain size={64} className="text-primary" />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Neural Matching Active</h2>
        <p className="text-slate-500 font-medium animate-pulse">{matchingStatus}</p>
        
        {/* Shimmer placeholders */}
        <div className="mt-12 w-full max-w-4xl space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} /> AI Assisted Matching
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900">Volunteer Matching Engine</h1>
            <p className="text-slate-500 font-medium mt-2">Optimizing human capital for maximum humanitarian impact.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all">Export Report</button>
            <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">New Mission</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Need Details */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={need.uploadedSurveyImage || "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop"} 
                  className="w-full h-full object-cover"
                  alt="Target Community"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 ${need.urgencyLevel === 'critical' ? 'bg-red-600' : 'bg-orange-500'}`}>
                    <Activity size={12} /> {need.urgencyLevel} Urgency
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-slate-900">{need.communityName}</h3>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">{need.needCategory}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={18} className="text-primary" />
                    <span className="text-sm font-medium">{need.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Calendar size={18} className="text-primary" />
                    <span className="text-sm font-medium">Reported: {need.createdAt?.toDate?.().toLocaleDateString() || "Today"}</span>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {need.needCategory === 'Medical' && (
                        <>
                          <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">Triage</span>
                          <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">First Aid</span>
                        </>
                      )}
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">Crisis Mgmt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-primary p-8 rounded-3xl text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={24} />
                  <h4 className="text-lg font-black tracking-tight">Matching Intelligence</h4>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
                  <p className="text-sm font-medium leading-relaxed italic opacity-90">
                    "{recommendations[0]?.explanation || "Analyzing the best candidates based on proximity, expertise, and verified historical impact data."}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Confidence</p>
                    <p className="text-2xl font-black">{recommendations[0]?.score || "98"}%</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Match Speed</p>
                    <p className="text-2xl font-black">1.2s</p>
                  </div>
                </div>
              </div>
              <Brain className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
            </div>
          </div>

          {/* Right Column: Recommendations */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Recommended Volunteers</h2>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Showing Top {recommendations.length} Matches</span>
            </div>

            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={rec.volunteerId}
                  className={`bg-white p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden ${index === 0 ? 'border-primary shadow-2xl shadow-primary/10' : 'border-slate-100 shadow-xl'}`}
                >
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-bl-2xl shadow-lg z-10 flex items-center gap-2">
                      <Star size={12} fill="currentColor" /> AI Choice
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative z-10">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rec.fullName}`} 
                          className="w-full h-full object-cover bg-slate-50"
                          alt={rec.fullName}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white z-20 shadow-lg">
                        <Check size={16} strokeWidth={4} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-xl font-black text-slate-900">{rec.fullName}</h4>
                          <p className="text-primary font-bold text-sm tracking-tight">Verified Specialist • {rec.skills[0]}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-primary tracking-tight">{rec.score}%</div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                          <Zap size={16} className="text-slate-400 mx-auto mb-1" />
                          <p className="text-[10px] font-black text-slate-800">Proximity</p>
                          <p className="text-xs font-bold text-slate-500">{rec.travelRadius}km</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                          <Award size={16} className="text-slate-400 mx-auto mb-1" />
                          <p className="text-[10px] font-black text-slate-800">Exp.</p>
                          <p className="text-xs font-bold text-slate-500">42 Missions</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                          <ShieldCheck size={16} className="text-slate-400 mx-auto mb-1" />
                          <p className="text-[10px] font-black text-slate-800">Verified</p>
                          <p className="text-xs font-bold text-slate-500">Level 5</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                          <Clock size={16} className="text-slate-400 mx-auto mb-1" />
                          <p className="text-[10px] font-black text-slate-800">Status</p>
                          <p className="text-xs font-bold text-green-600">Available</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-xl text-primary"><Info size={16}/></div>
                          <p className="text-xs font-bold text-slate-500 max-w-xs">{rec.reasoning}</p>
                        </div>
                        <button 
                          onClick={() => handleAssign(rec.volunteerId, rec.fullName)}
                          disabled={assigning === rec.volunteerId}
                          className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {assigning === rec.volunteerId ? 'Assigning...' : 'Quick Assign'}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VolunteerMatching;
