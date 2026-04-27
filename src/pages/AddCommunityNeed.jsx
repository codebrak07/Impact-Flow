import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, MapPin, Sparkles, Upload, CheckCircle2, Lightbulb, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const AddCommunityNeed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    communityName: '',
    location: '',
    gpsLocation: { lat: 0, lng: 0 },
    needCategory: '',
    urgencyLevel: '',
    description: '',
    peopleAffected: 0,
    notes: '',
    contactPerson: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      simulateAIExtraction();
    }
  };

  const simulateAIExtraction = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiResult({
        communityName: 'Riverside Settlement',
        needCategory: 'Medical',
        peopleAffected: 450,
        urgencyLevel: 'High'
      });
      setAiAnalyzing(false);
    }, 2000);
  };

  const applyAISuggestions = () => {
    if (aiResult) {
      setFormData(prev => ({
        ...prev,
        communityName: aiResult.communityName,
        needCategory: aiResult.needCategory,
        peopleAffected: aiResult.peopleAffected,
        urgencyLevel: aiResult.urgencyLevel
      }));
      setAiResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `needs/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const needData = {
        ...formData,
        uploadedSurveyImage: imageUrl,
        status: 'open',
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'needs'), needData);
      
      // Add activity log
      await addDoc(collection(db, 'activity_logs'), {
        activityType: 'need_created',
        message: `New ${formData.needCategory} need identified in ${formData.communityName}`,
        relatedNeedId: docRef.id,
        createdAt: serverTimestamp()
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Error adding need:", error);
      alert("Failed to publish need. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      
      <main className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 hover:scale-110 active:scale-90 rounded-full transition-all">
            <X size={24} className="text-slate-500" />
          </button>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Identify New Community Need</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-1">General Information</h2>
                <p className="text-sm text-slate-500">Provide the foundational details of the community crisis or resource gap.</p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Community Name</label>
                  <input 
                    name="communityName"
                    value={formData.communityName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    placeholder="e.g. Riverside District, Zone 4" 
                    type="text"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Area / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="Search address or enter GPS coordinates" 
                      type="text"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Need Category</label>
                    <select 
                      name="needCategory"
                      value={formData.needCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Medical">Medical</option>
                      <option value="Food">Food</option>
                      <option value="Shelter">Shelter</option>
                      <option value="Water & Sanitation">Water & Sanitation</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Urgency Level</label>
                    <select 
                      name="urgencyLevel"
                      value={formData.urgencyLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                      required
                    >
                      <option value="">Select Urgency</option>
                      <option value="Critical" className="text-red-600">Critical (Immediate)</option>
                      <option value="High" className="text-amber-600">High (24-48 Hours)</option>
                      <option value="Medium" className="text-blue-600">Medium (Planned)</option>
                      <option value="Low" className="text-slate-600">Low (Monitoring)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated People Affected</label>
                  <div className="flex items-center gap-4">
                    <input 
                      name="peopleAffected"
                      value={formData.peopleAffected}
                      onChange={handleChange}
                      className="w-32 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="0" 
                      type="number"
                      required
                    />
                    <span className="text-sm text-slate-500">Individuals (approx.)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description & Notes</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" 
                    placeholder="Describe the situation and specific requirements..."
                  ></textarea>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between pt-4">
              <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-xl border border-slate-200 font-bold text-sm hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all">Discard Draft</button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-10 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Publishing...' : 'Publish Need'}
              </button>
            </div>
          </div>

          {/* Right Column: AI Vision Assist */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-primary/5 rounded-2xl border border-primary/10 p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Sparkles size={20} fill="currentColor" />
                </div>
                <h3 className="text-xl font-bold text-primary">AI Vision Assist</h3>
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload handwritten survey forms or field photos. Our AI will extract data points and pre-fill the form for you.
              </p>

              {/* Upload Zone */}
              <label className="border-2 border-dashed border-primary/20 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-white/50 hover:bg-white hover:border-primary transition-all cursor-pointer group">
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-40 object-cover rounded-xl border border-slate-100 shadow-sm" alt="Preview" />
                ) : (
                  <>
                    <Upload className="text-primary group-hover:scale-110 transition-transform" size={40} />
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary uppercase tracking-wider">Drop survey image here</p>
                      <p className="text-xs text-slate-400">or click to browse local files</p>
                    </div>
                  </>
                )}
              </label>

              {/* Extraction Preview */}
              <AnimatePresence>
                {(aiAnalyzing || aiResult) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-white rounded-xl border border-primary/10 shadow-sm p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Extraction Preview</span>
                      <span className={`flex items-center gap-1.5 px-3 py-1 ${aiAnalyzing ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-700'} rounded-full text-[10px] font-black`}>
                        <span className={`w-1.5 h-1.5 ${aiAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'} rounded-full`}></span>
                        {aiAnalyzing ? 'ANALYZING' : 'READY'}
                      </span>
                    </div>

                    {aiResult && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 flex items-center gap-2"><Info size={14} /> Community: "{aiResult.communityName}"</span>
                          <span className="text-green-600 font-black">98%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 flex items-center gap-2"><Info size={14} /> Category: {aiResult.needCategory}</span>
                          <span className="text-green-600 font-black">94%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 flex items-center gap-2"><Info size={14} /> Affected: ~{aiResult.peopleAffected}</span>
                          <span className="text-amber-600 font-black">82%</span>
                        </div>
                        <button 
                          type="button"
                          onClick={applyAISuggestions}
                          className="w-full py-2.5 bg-primary/10 text-primary font-bold text-xs rounded-lg hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-2"
                        >
                          Apply All Suggested Fields
                        </button>
                      </div>
                    )}

                    {aiAnalyzing && (
                      <div className="space-y-2 py-2">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="h-full w-1/3 bg-primary"
                          />
                        </div>
                        <p className="text-[10px] text-center text-slate-400">Processing handwriting and patterns...</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Lightbulb className="text-amber-500" size={20} />
                <h4 className="text-xs font-bold uppercase tracking-widest">Institutional Tips</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Be specific about the population to help calculate supply logistics.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Critical urgency requires attaching a photo for verification.</span>
                </li>
              </ul>
            </section>
          </div>
        </form>
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
              className="bg-white rounded-[2rem] max-w-md w-full p-10 text-center shadow-2xl"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-900">Need Published</h2>
              <p className="text-slate-500 mb-10 leading-relaxed">
                The need has been broadcasted to verified volunteers and institutional partners.
              </p>
              <button 
                onClick={() => navigate('/coordinator/map')}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                View Live Map
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddCommunityNeed;
