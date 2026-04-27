import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Users, Zap, CheckCircle2, BarChart3, Globe } from 'lucide-react';

const caseStudies = {
  'water-restoration': {
    title: 'Water Restoration in East Valley',
    stats: '40% Response Increase',
    img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1000',
    context: 'Post-earthquake infrastructure collapse in a densely populated valley.',
    challenge: '12,000 residents were left without potable water after a 6.8 magnitude earthquake. Previous traditional response methods estimated 5-7 days for initial restoration.',
    intervention: 'ImpactFlow matched 14 local plumbers with immediate volunteer availability and identified 400m of high-density pipe at a nearby NGO warehouse using our live inventory sync.',
    result: 'Water was restored to the primary community node in just 18 hours. Deployment coordination time was reduced by 92%.',
    timeline: [
      { time: '0h', event: 'Earthquake reported. ImpactFlow initializes Valley Node.' },
      { time: '2h', event: 'AI scans local volunteer database for plumbing & engineering skills.' },
      { time: '4h', event: 'Inventory match found: 400m pipe located 12km away.' },
      { time: '12h', event: 'Teams deployed on-site. Real-time coordination begins.' },
      { time: '18h', event: 'Critical water pressure restored to East Valley center.' }
    ],
    impactMetrics: [
      { label: 'Souls Affected', value: '12,000+', icon: <Users /> },
      { label: 'Response Time', value: '18 Hours', icon: <Clock /> },
      { label: 'Efficiency Gain', value: '40%', icon: <Zap /> }
    ]
  },
  'medical-supply': {
    title: 'Typhoon Zoe Medical Supply Chain',
    stats: '1,200 Lives Impacted',
    img: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&q=80&w=1000',
    context: 'Category 5 typhoon landfall causing massive flooding and road blockages.',
    challenge: '8 remote villages were completely isolated. Critical medical supplies, including insulin and dialysis kits, were critically low with zero road access.',
    intervention: 'ImpactFlow integrated with local drone logistics providers. Our predictive analytics determined optimal flight corridors by analyzing real-time wind speed and precipitation data.',
    result: '42 successful drone sorties delivered 180kg of medical supplies. 1,200 residents received emergency care within the critical 24-hour window.',
    timeline: [
      { time: '0h', event: 'Typhoon Zoe makes landfall. All roads to Sector 7 closed.' },
      { time: '6h', event: 'Emergency supply requests received via satellite link.' },
      { time: '8h', event: 'ImpactFlow calculates drone corridors around storm cells.' },
      { time: '14h', event: 'First medical payload delivered to Sector 7 medical tent.' },
      { time: '24h', event: 'All 8 isolated villages supplied with essential meds.' }
    ],
    impactMetrics: [
      { label: 'Sorties Flown', value: '42', icon: <Globe /> },
      { label: 'Lives Saved', value: '1,200', icon: <Users /> },
      { label: 'Data Nodes', value: '14', icon: <Zap /> }
    ]
  },
  'education-bridge': {
    title: 'Education Bridge: Camp Alpha',
    stats: '50+ Verified Teachers',
    img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
    context: 'Large-scale displacement following regional conflict.',
    challenge: '2,000 children in refugee Camp Alpha had zero access to education for over 3 months. High levels of reported developmental stress and psychological trauma.',
    intervention: 'ImpactFlow verified the credentials of 54 teachers within the displaced population and matched them with language-specific student cohorts. We also coordinated the delivery of 200 tablets from a corporate donor.',
    result: 'Full-time school curriculum established for 1,800 students in 48 hours. Trauma-informed teaching programs integrated via the app.',
    timeline: [
      { time: 'Day 1', event: 'Education gap reported in Camp Alpha.' },
      { time: 'Day 1.5', event: 'ImpactFlow verifies 54 displaced teachers.' },
      { time: 'Day 2', event: 'Curriculum matched to student language requirements.' },
      { time: 'Day 3', event: 'First classes begin under the central tree node.' },
      { time: 'Day 5', event: 'Digital learning lab established with matched tablets.' }
    ],
    impactMetrics: [
      { label: 'Students Enrolled', value: '1,800', icon: <Users /> },
      { label: 'Teachers Matched', value: '54', icon: <CheckCircle2 /> },
      { label: 'Days to Start', value: '2', icon: <Clock /> }
    ]
  }
};

const CaseStudyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const study = caseStudies[id];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!study) return <div className="p-20 text-center font-black">Case Study Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header Image */}
      <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        <img src={study.img} alt={study.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
        
        <div className="absolute top-8 left-8">
          <button 
            onClick={() => navigate('/#case-studies')}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={20} /> Back to ImpactFlow
          </button>
        </div>

        <div className="absolute bottom-16 left-8 lg:left-24 right-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-6">
              {study.stats}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4">{study.title}</h1>
            <div className="flex items-center gap-6 text-white/70 font-medium">
              <div className="flex items-center gap-2"><MapPin size={18} /> Global Response</div>
              <div className="flex items-center gap-2"><Clock size={18} /> 2024 Operations</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* Main Story */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-4">
                <div className="w-2 h-8 bg-primary rounded-full"></div> The Context
              </h2>
              <p className="text-xl text-slate-600 font-medium leading-relaxed">
                {study.challenge}
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-4">
                <div className="w-2 h-8 bg-primary rounded-full"></div> ImpactFlow Intervention
              </h2>
              <p className="text-xl text-slate-600 font-medium leading-relaxed bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                {study.intervention}
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4">
                <div className="w-2 h-8 bg-primary rounded-full"></div> Operational Timeline
              </h2>
              <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {study.timeline.map((item, i) => (
                  <div key={i} className="relative pl-12">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-4 border-primary flex items-center justify-center z-10"></div>
                    <div className="text-sm font-black text-primary uppercase tracking-widest mb-1">{item.time}</div>
                    <div className="text-lg font-bold text-slate-800">{item.event}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white sticky top-24">
              <h3 className="text-2xl font-black mb-8">Key Impact Metrics</h3>
              <div className="space-y-8">
                {study.impactMetrics.map((metric, i) => (
                  <div key={i} className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                      {metric.icon}
                    </div>
                    <div>
                      <div className="text-white font-black text-3xl">{metric.value}</div>
                      <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">{metric.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-12 border-t border-white/10">
                <div className="text-white/60 font-medium mb-6 text-sm">
                  "The real-time visibility provided by ImpactFlow changed everything. We weren't just guessing anymore—we were executing with precision."
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-black">JS</div>
                  <div>
                    <div className="font-bold">John Smith</div>
                    <div className="text-[10px] uppercase text-white/40 font-black">Field Coordinator</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer CTA */}
      <section className="bg-primary py-24 px-6 lg:px-12 text-center text-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8">Ready to replicate this impact?</h2>
          <button 
            onClick={() => navigate('/#case-studies')}
            className="px-10 py-5 bg-white text-primary rounded-2xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Join the Network
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      </section>
    </div>
  );
};

export default CaseStudyDetail;
