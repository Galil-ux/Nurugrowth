import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../services/ToastContext';
import { submitAppReview, subscribeAppReviews } from '../services/firebase';
import { useInteractions } from '../services/useInteractions';
import { AppReview } from '../types';
import { Star, MessageSquareQuote, CheckCircle2, AlertCircle, Camera, Video, Loader2, Lock } from 'lucide-react';

const Discovery: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const { interactions, hasInteractedWithAll } = useInteractions();
  
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only subscribe to approved reviews for public view
    const unsub = subscribeAppReviews((fetched) => {
      setReviews(fetched);
      setLoading(false);
    }, true);
    return () => unsub();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('File Too Large', 'Please select an image or video under 2MB.');
      return;
    }

    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasInteractedWithAll) {
      showWarning('Interaction Required', 'You must explore all platform features before leaving a review.');
      return;
    }
    
    if (!content.trim() || !authorName.trim() || !companyName.trim()) {
      showWarning('Missing Fields', 'Please complete all required fields.');
      return;
    }

    // Rate Limiting: Check if they already submitted recently (using localStorage for simplicity)
    const lastSubmit = localStorage.getItem('last_review_submit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 1000 * 60 * 60 * 24) {
      showError('Rate Limited', 'You can only submit one review per day.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAppReview({
        authorName,
        authorRole,
        companyName,
        rating,
        content,
        mediaUrl,
        mediaType,
        verifiedInteraction: true,
      });

      localStorage.setItem('last_review_submit', Date.now().toString());
      showSuccess('Review Submitted', 'Your review is pending moderation. Thank you for your feedback!');
      setShowForm(false);
      
      // Reset form
      setAuthorName('');
      setAuthorRole('');
      setCompanyName('');
      setContent('');
      setMediaUrl('');
      setRating(5);
    } catch (err: any) {
      showError('Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Social Proof & Discovery</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
            Community Insights
          </h1>
          <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
            See how solar executives and innovators are leveraging NuruGrowth to scale their operations across East Africa.
          </p>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Testimonials...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <MessageSquareQuote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">No Testimonials Yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Be the first to share your experience with NuruGrowth.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm flex flex-col h-full hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  
                  <p className="text-slate-700 font-medium leading-relaxed mb-8 flex-grow">
                    "{review.content}"
                  </p>

                  {review.mediaUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      {review.mediaType === 'video' ? (
                        <video src={review.mediaUrl} controls className="w-full h-48 object-cover" />
                      ) : (
                        <img src={review.mediaUrl} alt="Review Media" className="w-full h-48 object-cover" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100 shrink-0">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">{review.authorName}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {review.authorRole} at <span className="text-blue-600">{review.companyName}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Call to Action & Form */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden mt-24">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            {!showForm ? (
              <>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                  Share Your NuruGrowth Experience
                </h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                  We value authentic feedback. To ensure high-quality insights, leaving a review requires interacting with the core features of the platform.
                </p>
                
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-center items-center mt-8 backdrop-blur-sm max-w-xl mx-auto">
                  <div className="flex flex-col gap-3 text-left w-full md:w-auto">
                    <InteractionCheck label="Explore ROI Lab" completed={interactions.hasUsedGrowthLab} />
                    <InteractionCheck label="Explore Quote Onboarding" completed={interactions.hasUsedQuoteTool} />
                    <InteractionCheck label="Read Research Blog" completed={interactions.hasReadBlog} />
                  </div>
                  
                  <div className="w-px h-16 bg-slate-700 hidden md:block"></div>
                  
                  <div className="w-full md:w-auto">
                    {hasInteractedWithAll ? (
                      <button
                        onClick={() => setShowForm(true)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg"
                      >
                        Write a Review
                      </button>
                    ) : (
                      <div className="bg-slate-800 border border-slate-700 text-slate-400 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Unlock Reviews</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 text-left space-y-6 shadow-2xl relative">
                <button type="button" onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900">Submit Your Review</h3>
                  <p className="text-xs text-slate-500 mt-1">Share your thoughts with the clean energy community.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input required type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="E.g., Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                    <input required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="E.g., SolarTech East Africa" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Role</label>
                  <input required type="text" value={authorRole} onChange={e => setAuthorRole(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="E.g., Operations Director" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${num <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Review</label>
                  <textarea required value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none" placeholder="How has NuruGrowth impacted your operations?"></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attach Media (Optional)</label>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                      <Camera className="w-4 h-4" />
                      <span>Upload Image/Video</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                    {mediaUrl && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Media Attached
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Review</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

const InteractionCheck: React.FC<{ label: string; completed: boolean }> = ({ label, completed }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}>
      {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />}
    </div>
    <span className={`text-xs font-bold ${completed ? 'text-white' : 'text-slate-400'}`}>{label}</span>
  </div>
);

export default Discovery;
