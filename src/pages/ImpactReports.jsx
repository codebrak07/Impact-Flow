import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Filter, Search, 
  ChevronRight, ArrowLeft, BarChart3, 
  Calendar, Globe, Shield, Zap 
} from 'lucide-react';

const reportsData = [
  {
    id: 1,
    title: '2024 Annual Impact Report',
    category: 'Annual',
    date: 'March 2024',
    size: '15.8 MB',
    type: 'PDF',
    description: 'A comprehensive review of global humanitarian efforts, resource efficiency metrics, and platform growth.',
    stats: { lives: '1.2M', efficiency: '+42%', missions: '2,400' }
  },
  {
    id: 2,
    title: 'East Valley Earthquake Post-Mortem',
    category: 'Crisis',
    date: 'Feb 2024',
    size: '4.2 MB',
    type: 'PDF',
    description: 'Detailed operational analysis of the infrastructure restoration and water supply logistics in Sector 7.',
    stats: { response: '18h', teams: '14', budget: '$40k' }
  },
  {
    id: 3,
    title: 'AI Ethics in Crisis Management',
    category: 'Whitepaper',
    date: 'Jan 2024',
    size: '2.1 MB',
    type: 'PDF',
    description: 'Establishing frameworks for algorithmic fairness and data privacy in high-stakes emergency environments.',
    stats: { citations: '120+', pages: '45', accuracy: '99.9%' }
  },
  {
    id: 4,
    title: 'Typhoon Zoe Drone Logistics Study',
    category: 'Technical',
    date: 'Dec 2023',
    size: '8.5 MB',
    type: 'Report',
    description: 'Analysis of predictive flight pathing and battery optimization for medical supply chain nodes.',
    stats: { sorties: '42', success: '100%', savings: '65%' }
  },
  {
    id: 5,
    title: 'Volunteer Skill-Match Efficiency v2',
    category: 'Technical',
    date: 'Nov 2023',
    size: '1.8 MB',
    type: 'Docs',
    description: 'Benchmarking the latency of the new semantic skill-matching engine vs legacy databases.',
    stats: { latency: '-80%', matching: '+25%', retention: '92%' }
  },
  {
    id: 6,
    title: 'Global NGO Collaboration Framework',
    category: 'Strategic',
    date: 'Oct 2023',
    size: '3.3 MB',
    type: 'PDF',
    description: 'A blueprint for cross-organizational data sharing and inventory synchronization.',
    stats: { partners: '850', sync_rate: '2ms', security: 'Level 4' }
  }
];

const ImpactReports = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  const categories = ['All', 'Annual', 'Crisis', 'Technical', 'Strategic', 'Whitepaper'];

  const filteredReports = reportsData.filter(report => {
    const matchesFilter = filter === 'All' || report.category === filter;
    const matchesSearch = report.title.toLowerCase().includes(search.toLowerCase()) || 
                         report.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownload = (id) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert("Download simulation complete. File saved to downloads.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter pb-24">
      {/* Header Section */}
      <header className="bg-slate-900 pt-32 pb-48 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/#case-studies')}
            className="flex items-center gap-2 text-white/50 hover:text-white font-black text-sm uppercase tracking-widest mb-12 transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Back to ImpactFlow
          </button>
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">
              Operational <span className="text-primary">Intelligence</span> & Impact Reports
            </h1>
            <p className="text-xl text-white/50 font-medium leading-relaxed">
              Access the full repository of our field research, annual metrics, and technical post-mortems. 
              Transparency in data drives efficiency in crisis.
            </p>
          </div>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
      </header>

      {/* Control Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-center border border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search reports, titles, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === cat 
                  ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredReports.map((report, i) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-primary/10 transition-all flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <FileText size={32} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.category}</div>
                    <div className="text-sm font-bold text-slate-900">{report.date}</div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                
                <p className="text-slate-500 font-medium leading-relaxed mb-10 flex-grow">
                  {report.description}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                  {Object.entries(report.stats).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-xs font-black text-slate-900">{value}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{key.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="text-[10px] font-black uppercase tracking-widest">{report.type}</div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <div className="text-[10px] font-black uppercase tracking-widest">{report.size}</div>
                  </div>
                  <button 
                    onClick={() => handleDownload(report.id)}
                    disabled={downloadingId === report.id}
                    className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {downloadingId === report.id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Zap size={20} />
                      </motion.div>
                    ) : (
                      <Download size={20} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredReports.length === 0 && (
          <div className="py-40 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
              <Search size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">No matching reports found</h2>
            <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="bg-primary rounded-[4rem] p-12 lg:p-20 text-white text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black mb-8 tracking-tighter">Stay updated on our field reports</h2>
            <p className="text-xl text-white/70 font-medium mb-12">
              Get notified the moment new operational data and crisis post-mortems are released.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
              <input 
                type="email" 
                placeholder="Enter your organization email"
                className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 placeholder:text-white/40 font-bold"
              />
              <button className="px-10 py-4 bg-white text-primary rounded-[1.5rem] font-black hover:scale-105 active:scale-95 transition-all">
                Subscribe Now
              </button>
            </form>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </section>
    </div>
  );
};

export default ImpactReports;
