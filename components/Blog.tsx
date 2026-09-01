
import React, { useState, useEffect } from 'react';
import { useInteractions } from '../services/useInteractions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Lightbulb, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Clock, 
  User, 
  Sparkles, 
  Search, 
  Filter,
  RefreshCw,
  Loader2,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { BLOG_POSTS, INITIAL_BLOG_COMMENTS } from '../constants';
import { BlogPost, BlogComment, CommentCategory } from '../types';
import { BlogComments } from './BlogComments';
import { BlogGridSkeleton } from './skeletons/BlogSkeleton';
import { subscribeBlogPosts, subscribeBlogComments } from '../services/firebase';
import { useAuth } from '../services/AuthContext';

const LOCAL_STORAGE_KEY = 'nurugrowth_blog_comments_v1';

const Blog: React.FC = () => {
  const { isEditor } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  // Skeleton loading state on mount or refresh
  const [isLoadingBlog, setIsLoadingBlog] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Local state for comments with localStorage persistence fallback
  const [comments, setComments] = useState<BlogComment[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load comments from localStorage', e);
    }
    return INITIAL_BLOG_COMMENTS;
  });

  // Keep track of which post's comment section is expanded
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'grid-reliability': true,
  });

  // Keep track of which post's full content is expanded
  const [expandedBriefing, setExpandedBriefing] = useState<Record<string, boolean>>({});

  // Search/Filter for posts
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // Real-time Firestore Blog Posts subscription
  useEffect(() => {
    const unsub = subscribeBlogPosts((fetched) => {
      // Show only published posts on the public blog, and filter out future-scheduled posts
      const published = fetched.filter(p => {
        const isPub = !p.status || p.status === 'published';
        const isFutureScheduled = p.scheduledFor && new Date(p.scheduledFor) > new Date();
        return isPub && !isFutureScheduled;
      });
      setPosts(published.length > 0 ? published : BLOG_POSTS);
      setIsLoadingBlog(false);
      setIsRefreshing(false);
    });

    return () => unsub();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Persist to localStorage whenever comments change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {
      console.warn('Could not save comments to localStorage', e);
    }
  }, [comments]);

  const handleToggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleToggleBriefing = (postId: string) => {
    setExpandedBriefing((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = (newCommentData: {
    postId: string;
    authorName: string;
    authorRole?: string;
    content: string;
    category: CommentCategory;
  }) => {
    const newComment: BlogComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postId: newCommentData.postId,
      authorName: newCommentData.authorName,
      authorRole: newCommentData.authorRole,
      content: newCommentData.content,
      category: newCommentData.category,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => [newComment, ...prev]);

    // Ensure the comment section is open when user posts
    setExpandedComments((prev) => ({
      ...prev,
      [newCommentData.postId]: true,
    }));
  };

  const handleToggleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // Filter blog posts by search and tag
  const allTags = ['ALL', ...Array.from(new Set(posts.map((p) => p.tag)))];

  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag === 'ALL' || post.tag === selectedTag;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const getPostCommentStats = (postId: string) => {
    const postComments = comments.filter((c) => c.postId === postId);
    const thoughts = postComments.filter((c) => c.category === 'thought').length;
    const questions = postComments.filter((c) => c.category === 'question').length;
    return {
      total: postComments.length,
      thoughts,
      questions,
    };
  };

  return (
    <div className="bg-white min-h-screen" id="blog">
      {/* Blog Header */}
      <section className="pt-20 md:pt-24 pb-12 md:pb-20 px-4 md:px-6 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-100/20 blur-[60px] md:blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 md:mb-4">
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-blue-600 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Journal & Community Dialogue
            </motion.div>

            {isEditor && (
              <a
                href="#cms"
                className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>CMS Editorial Studio</span>
              </a>
            )}
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-3xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 md:mb-6 max-w-4xl leading-tight md:leading-none"
          >
            Market <span className="text-blue-600">Intelligence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }} 
            className="text-slate-600 text-sm md:text-xl font-medium max-w-3xl leading-relaxed"
          >
            Localized solar research for East Africa. Explore field briefings, submit your thoughts, and ask questions to local energy practitioners.
          </motion.p>

          {/* Search & Tag Filter Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search briefings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoadingBlog}
                title="Refresh Research Briefings"
                className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Feed */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {isLoadingBlog || isRefreshing ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading latest solar research briefings...</span>
              </div>
              <BlogGridSkeleton count={4} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-start">
              {filteredPosts.map((post, i) => {
              const postComments = comments.filter((c) => c.postId === post.id);
              const stats = getPostCommentStats(post.id);
              const isCommentsOpen = !!expandedComments[post.id];
              const isBriefingOpen = !!expandedBriefing[post.id];

              return (
                <motion.article 
                  key={post.id} 
                  initial={{ opacity: 0, y: 15 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.08 }} 
                  className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Tag Badge */}
                    <div className="relative aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden mb-6 bg-slate-100 shadow-sm">
                      <img 
                        src={post.img} 
                        alt={post.title} 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                          {post.tag}
                        </span>
                      </div>
                      {post.readTime && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 backdrop-blur rounded-lg text-[10px] font-medium text-white shadow-sm">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{post.readTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Header */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                      <span>{post.date}</span>
                      {post.author && (
                        <span className="text-slate-500 lowercase first-letter:uppercase text-[11px] font-medium truncate max-w-[200px]">
                          By {post.author.split(',')[0]}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-3 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-slate-600 text-sm md:text-base font-normal leading-relaxed mb-4">
                      {post.summary}
                    </p>

                    {/* Collapsible Full Briefing Key Insights */}
                    <AnimatePresence>
                      {isBriefingOpen && post.fullContent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-6"
                        >
                          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 space-y-2.5">
                            <div className="text-[11px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1.5 mb-2">
                              <BookOpen className="w-3.5 h-3.5" />
                              Key Research Takeaways
                            </div>
{post.fullContent.map((paragraph, pIdx) => {
                              if (paragraph.startsWith('data:image/')) {
                                return (
                                  <div key={pIdx} className="my-4 overflow-hidden rounded-xl border border-slate-200">
                                    <img src={paragraph} alt="Analysis Insight" className="w-full object-contain bg-white" />
                                  </div>
                                );
                              }
                              return (
                                <p key={pIdx} className="text-xs text-slate-700 leading-relaxed font-normal flex items-start gap-2">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>{paragraph}</span>
                                </p>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions & Comments Toggle Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {/* Briefing Read Toggle */}
                      {post.fullContent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBriefing(post.id);
                          }}
                          className="inline-flex items-center gap-1.5 text-slate-800 hover:text-blue-600 text-xs font-bold transition-colors cursor-pointer py-1"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isBriefingOpen ? 'Hide Key Insights' : 'Read Key Insights'}</span>
                          {isBriefingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Comment Discussion Section Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComments(post.id);
                        }}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCommentsOpen 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {stats.total === 0 ? 'Start Discussion' : `${stats.total} ${stats.total === 1 ? 'Comment' : 'Comments'}`}
                        </span>

                        {stats.total > 0 && (
                          <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-current/20 text-[10px] opacity-90">
                            {stats.thoughts > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Lightbulb className="w-2.5 h-2.5" />
                                {stats.thoughts}
                              </span>
                            )}
                            {stats.questions > 0 && (
                              <span className="flex items-center gap-0.5 ml-1">
                                <HelpCircle className="w-2.5 h-2.5" />
                                {stats.questions}
                              </span>
                            )}
                          </div>
                        )}

                        {isCommentsOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    </div>

                    {/* Integrated Comment Section */}
                    <AnimatePresence>
                      {isCommentsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <BlogComments
                            postId={post.id}
                            postTitle={post.title}
                            comments={postComments}
                            onAddComment={handleAddComment}
                            onToggleLike={handleToggleLike}
                            onDeleteComment={handleDeleteComment}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {!isLoadingBlog && !isRefreshing && filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No briefings found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your keyword search or tag filters.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedTag('ALL'); }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

          {/* Newsletter / Intelligence Stack CTA */}
          <div className="mt-16 md:mt-24 p-8 md:p-16 glass-card rounded-[2rem] md:rounded-[3rem] bg-blue-50/50 border border-blue-100 text-center space-y-6 md:space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 blur-[80px]"></div>
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4">
                East Africa Solar Intelligence.
              </h3>
              <p className="text-slate-600 text-xs md:text-base font-medium mb-6 md:mb-8 max-w-xl mx-auto">
                Bi-weekly EPC performance reports, regulatory updates, and field marketing data sent directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="name@yourcompany.com" 
                  className="flex-grow bg-white border border-slate-200 rounded-xl px-5 py-3.5 outline-none font-bold text-sm text-slate-900 focus:border-blue-600" 
                />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Thank you for subscribing to NuruGrowth Market Intelligence.');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-colors cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
