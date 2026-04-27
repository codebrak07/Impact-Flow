import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { User, Mail, Lock, MapPin, History, ChevronRight, CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const VolunteerRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    skills: [],
    languages: '',
    availability: [],
    travelRadius: 50,
    previousExperience: '',
    vehicleAccess: false
  });

  const [currentSkill, setCurrentSkill] = useState('');

  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkillAdd = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleAvailabilityChange = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let user = currentUser;

      // 1. Signup or use existing session
      if (!user) {
        const res = await signup(formData.email, formData.password, 'volunteer', {
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location
        });
        user = res.user;
      } else {
        // If already logged in (e.g. from Landing page signup), update the existing doc
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'volunteer',
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await updateProfile(user, { displayName: formData.fullName });

      // 2. Create Volunteer Profile Doc
      await setDoc(doc(db, 'volunteers', user.uid), {
        volunteerId: user.uid,
        ...formData,
        password: '', // Don't store password in Firestore
        status: 'available',
        livesTouched: 0,
        createdAt: serverTimestamp()
      });

      // 3. Activity Log
      await addDoc(collection(db, 'activity_logs'), {
        activityType: 'volunteer_registered',
        message: `${formData.fullName} joined as a new volunteer`,
        relatedVolunteerId: user.uid,
        createdAt: serverTimestamp()
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Error registering volunteer:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      
      <main className="max-w-[800px] mx-auto px-6 py-12">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">Join the Mission</h1>
              <p className="text-slate-500 font-medium">Your contribution makes an immediate impact.</p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">STEP 0{step} OF 02</span>
              <div className="text-xl font-bold text-primary">{step === 1 ? 'Identity' : 'Skills & Experience'}</div>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              className="bg-primary h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-10">
            {step === 1 ? (
              <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary">
                    <User size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="John Doe" 
                        type="text" 
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="john@example.com" 
                        type="email" 
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="••••••••" 
                        type="password" 
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="+1 (555) 000-0000" 
                      type="tel" 
                      required
                    />
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary">
                    <Sparkles size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Skills & Expertise</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.skills.map(skill => (
                        <span key={skill} className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold">
                          {skill} <X size={14} className="cursor-pointer hover:scale-110" onClick={() => removeSkill(skill)} />
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="Add a skill (e.g. Medical, Driver, Translator)" 
                        type="text" 
                      />
                      <button 
                        type="button" 
                        onClick={handleSkillAdd}
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">General Availability</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Weekdays', 'Weekends', 'Evenings', 'On-Call'].map(option => (
                          <label key={option} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.availability.includes(option) ? 'bg-primary/5 border-primary text-primary' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={formData.availability.includes(option)}
                              onChange={() => handleAvailabilityChange(option)}
                            />
                            <CheckCircle2 size={18} className={formData.availability.includes(option) ? 'opacity-100' : 'opacity-20'} />
                            <span className="text-sm font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Home Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                            placeholder="City, Country" 
                            type="text" 
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Travel Radius</label>
                          <span className="text-sm font-black text-primary">{formData.travelRadius} km</span>
                        </div>
                        <input 
                          name="travelRadius"
                          value={formData.travelRadius}
                          onChange={handleChange}
                          className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary" 
                          max="200" min="0" step="10" type="range" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Previous Experience</label>
                    <textarea 
                      name="previousExperience"
                      value={formData.previousExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" 
                      placeholder="Briefly describe your past humanitarian or volunteer work..." 
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </motion.section>
            )}

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-100">
              {step === 2 && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="order-2 sm:order-1 text-slate-400 font-bold text-sm hover:text-slate-600 hover:scale-105 active:scale-95 transition-all"
                >
                  Back to Identity
                </button>
              )}
              <button 
                disabled={loading}
                className="order-1 sm:order-2 w-full sm:w-auto px-12 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3"
                type="submit"
              >
                {loading ? 'Processing...' : step === 1 ? 'Next Step' : 'Complete Registration'}
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Data Encrypted & Institutional Verification Active</span>
        </div>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] max-w-md w-full p-12 text-center shadow-2xl"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black mb-4 text-slate-900">Welcome, Hero!</h2>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                Your profile is active. You will now be matched with urgent community needs based on your expertise.
              </p>
              <button 
                onClick={() => navigate('/volunteer')}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Go to My Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VolunteerRegistration;
