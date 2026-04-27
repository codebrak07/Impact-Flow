import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, Zap, Map, Brain, ClipboardCheck, 
  Users, BarChart3, ArrowRight, CheckCircle2, 
  Search, Bell, Settings, LogOut, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('volunteer'); // Default to volunteer
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const handleDownload = (title) => {
    setDownloading(title);
    setTimeout(() => {
      setDownloading(null);
      alert(`Success! ${title} has been downloaded to your system.`);
    }, 2000);
  };
  
  const { login, signup, currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [window.location.hash]);

  // Automatic redirect for logged-in users
  useEffect(() => {
    if (currentUser && userRole) {
      // Only redirect if they are on the landing page and not looking at a specific hash/section
      if (window.location.pathname === '/' && !window.location.hash) {
        handleDashboardRedirect();
      }
    }
  }, [currentUser, userRole]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, role);
        if (role === 'volunteer') navigate('/register-volunteer');
        else navigate('/coordinator');
      } else {
        const res = await login(email, password);
        if (res.role === 'coordinator') navigate('/coordinator');
        else navigate('/volunteer');
      }
      setIsLoginModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardRedirect = () => {
    if (userRole === 'coordinator') navigate('/coordinator');
    else navigate('/volunteer');
  };

  return (
    <div className="bg-surface selection:bg-primary/20 selection:text-primary min-h-screen font-inter">
      {/* Top Navigation */}
      <nav className="sticky top-0 w-full flex justify-between items-center px-6 lg:px-12 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 transition-all">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2">
            <Globe className="text-primary-container" /> ImpactFlow
          </span>
          <div className="hidden md:flex gap-8">
            <a href="#solutions" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Solutions</a>
            <button onClick={() => navigate('/map')} className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Impact Map</button>
            <a href="#case-studies" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Case Studies</a>
            <a href="#resources" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Resources</a>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDashboardRedirect}
                className="text-sm font-black text-slate-900 px-4 py-2 hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-xl transition-all flex items-center gap-2"
              >
                {userRole === 'coordinator' ? 'NGO Dashboard' : 'Volunteer Portal'}
                <ArrowRight size={14} className="text-primary" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:scale-110 active:scale-90 transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => { setIsSignup(false); setIsLoginModalOpen(true); }}
                className="hidden sm:block text-sm font-black text-slate-900 px-4 py-2 hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-xl transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsSignup(true); setIsLoginModalOpen(true); }}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
              <Zap size={14} fill="currentColor" />
              NEW: AI-POWERED VOLUNTEER MATCHING v2.4
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Helping the Right People at the <span className="text-primary italic">Right Time</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
              The world's most advanced AI coordination platform for NGOs and community response groups. Real-time needs, hyper-local solutions.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => { setRole('coordinator'); setIsSignup(true); setIsLoginModalOpen(true); }}
                className="bg-primary text-white px-10 py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-all active:scale-95 flex items-center gap-3"
              >
                Register as NGO <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => { setRole('volunteer'); setIsSignup(true); setIsLoginModalOpen(true); }}
                className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-50 transition-all active:scale-95"
              >
                Join as Volunteer
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(53,37,205,0.25)] border-[12px] border-white ring-1 ring-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&q=80&w=2000" 
                alt="Dashboard Preview" 
                className="w-full h-auto"
              />
            </div>
            {/* Floating UI Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 max-w-[280px]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Match</p>
                  <p className="text-sm font-bold text-slate-900">Dr. Sarah Mitchell</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Matched to "Medical Supply Delivery" in Zone B based on certification and proximity.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Auth Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-3xl overflow-hidden p-10 lg:p-12"
            >
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:rotate-90 active:scale-90 transition-all"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Globe size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {isSignup ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-slate-500 font-medium mt-2">
                  {isSignup ? `Joining as a ${role === 'coordinator' ? 'NGO Coordinator' : 'Volunteer'}` : 'Access your impact dashboard'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                    placeholder="name@organization.org"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>

                {error && <p className="text-red-500 text-xs font-bold text-center px-2">{error}</p>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-primary font-black hover:underline hover:scale-105 active:scale-95 transition-all inline-block"
                  >
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </button>
</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feature Section */}
      <section id="solutions" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">Efficiency through Intelligence</h2>
          <p className="text-xl text-slate-500 font-medium">Transforming crisis management with cutting-edge data science.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <Map className="text-indigo-600" />, 
              title: 'Live Mapping', 
              desc: 'Real-time geospatial visualization of needs and resources. Identify gaps instantly.',
              color: 'indigo',
              path: '/map'
            },
            { 
              icon: <Brain className="text-primary" />, 
              title: 'AI Matching', 
              desc: 'Proprietary matching algorithm connects the right skills to the most urgent tasks.',
              color: 'primary',
              path: '/coordinator'
            },
            { 
              icon: <Users className="text-emerald-600" />, 
              title: 'Verified Network', 
              desc: 'Blockchain-backed verification for field reports and volunteer credentials.',
              color: 'emerald',
              path: '/coordinator'
            },
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              whileHover={{ y: -10 }}
              onClick={() => navigate(feature.path)}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 group cursor-pointer active:scale-95 transition-all"
            >
              <div className={`w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(feature.icon, { size: 32 })}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="py-32 px-6 lg:px-12 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">Impact in Action</h2>
              <p className="text-xl text-white/60 font-medium leading-relaxed">
                See how our AI-driven coordination platform is transforming crisis response and community development across the globe.
              </p>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
            >
              View All Reports <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'water-restoration',
                title: 'Water Restoration in East Valley',
                stats: '40% Response Increase',
                img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1000',
                desc: 'How automated asset tracking and skill-matching restored water to 12,000 residents in record time.'
              },
              {
                id: 'medical-supply',
                title: 'Typhoon Zoe Medical Supply Chain',
                stats: '1,200 Lives Impacted',
                img: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&q=80&w=1000',
                desc: 'Coordinating drone deliveries and field medical units during peak crisis conditions using real-time GPS nodes.'
              },
              {
                id: 'education-bridge',
                title: 'Education Bridge: Camp Alpha',
                stats: '50+ Verified Teachers',
                img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
                desc: 'Connecting educational professionals to displaced youth, building a sustainable curriculum in 48 hours.'
              }
            ].map((study, i) => (
              <motion.div 
                key={study.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/case-study/${study.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden mb-6 border border-white/10">
                  <img src={study.img} alt={study.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="inline-block px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      {study.stats}
                    </div>
                    <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{study.title}</h3>
                  </div>
                </div>
                <p className="text-white/50 font-medium leading-relaxed px-2 line-clamp-2 group-hover:text-white/80 transition-colors">
                  {study.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-32 px-6 lg:px-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6">Resource Hub</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              Everything you need to launch, manage, and scale your humanitarian efforts using the ImpactFlow ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Deployment Guide', type: 'PDF', size: '2.4 MB', icon: <ClipboardCheck />, color: 'indigo', fullDesc: 'Detailed SOP for field agents.' },
              { title: 'API Documentation', type: 'Docs', size: 'v2.4', icon: <Zap />, color: 'primary', fullDesc: 'Technical specs for integration.' },
              { title: 'Impact Report 2024', type: 'JSON/PDF', size: '15.8 MB', icon: <BarChart3 />, color: 'emerald', fullDesc: 'Global metrics and efficiency data.' },
              { title: 'Volunteer Manual', type: 'Web', size: '12 Chapters', icon: <Users />, color: 'sky', fullDesc: 'Onboarding and training manual.' },
            ].map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedResource(item)}
                className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-${item.color}-600 mb-6 group-hover:bg-primary group-hover:text-white transition-all`}>
                  {React.cloneElement(item.icon, { size: 24 })}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                  <span>{item.type}</span>
                  <span className="text-primary">{item.size}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-primary rounded-[3rem] text-white flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-4 tracking-tight">Ready to start your first mission?</h3>
              <p className="text-white/70 font-medium max-w-xl leading-relaxed text-lg">
                Join over 2,400+ NGOs and community groups already using ImpactFlow to make a difference in real-time.
              </p>
            </div>
            <button 
              onClick={() => { setRole('coordinator'); setIsSignup(true); setIsLoginModalOpen(true); }}
              className="relative z-10 px-10 py-5 bg-white text-primary rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Get Started Now
            </button>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </section>

      {/* Resource Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-12 overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedResource(null)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>

              <div className={`w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-primary mb-8`}>
                {React.cloneElement(selectedResource.icon, { size: 40 })}
              </div>
              
              <h3 className="text-4xl font-black text-slate-900 mb-4">{selectedResource.title}</h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                {selectedResource.fullDesc}
              </p>

              <button 
                onClick={() => handleDownload(selectedResource.title)}
                disabled={downloading === selectedResource.title}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {downloading === selectedResource.title ? 'Downloading...' : 'Download Resource'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="col-span-2 lg:col-span-1">
            <span className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2 mb-6">
              <Globe /> ImpactFlow
            </span>
            <p className="text-slate-500 font-medium leading-relaxed">
              Building the digital infrastructure for a more resilient and compassionate world.
            </p>
          </div>
          {['Product', 'Company', 'NGOs'].map((category) => (
            <div key={category}>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{category}</h4>
              <ul className="space-y-4">
                {['Features', 'Impact', 'Partners'].map((link) => (
                  <li key={link}><a href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest gap-6">
          <p>© 2024 ImpactFlow Inc. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
