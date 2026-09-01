import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Lightbulb, 
  HelpCircle, 
  ThumbsUp, 
  Send, 
  User, 
  Sparkles, 
  Filter,
  CheckCircle2,
  Trash2,
  Loader2
} from 'lucide-react';
import { BlogComment, CommentCategory } from '../types';
import { CommentSkeleton } from './skeletons/BlogSkeleton';

interface BlogCommentsProps {
  postId: string;
  postTitle: string;
  comments: BlogComment[];
  onAddComment: (newComment: {
    postId: string;
    authorName: string;
    authorRole?: string;
    content: string;
    category: CommentCategory;
  }) => void;
  onToggleLike: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const BlogComments: React.FC<BlogCommentsProps> = ({
  postId,
  postTitle,
  comments,
  onAddComment,
  onToggleLike,
  onDeleteComment,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | CommentCategory>('all');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [category, setCategory] = useState<CommentCategory>('thought');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredComments = comments.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.category === activeFilter;
  });

  const thoughtCount = comments.filter((c) => c.category === 'thought').length;
  const questionCount = comments.filter((c) => c.category === 'question').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setErrorMsg('Please enter your name or company handle.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please write your thought or question.');
      return;
    }
    if (content.trim().length < 5) {
      setErrorMsg('Please write a slightly more descriptive comment (at least 5 characters).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    // Simulate short network processing for realistic perceived performance
    await new Promise((res) => setTimeout(res, 450));

    onAddComment({
      postId,
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || undefined,
      content: content.trim(),
      category,
    });

    setIsSubmitting(false);
    setContent('');
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-100 space-y-8" id={`comments-${postId}`}>
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
              Market Discussion & Inquiries
            </h3>
            <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-100">
              {comments.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Exchange local perspectives, queries, and field data on this briefing.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('thought')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'thought'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Thoughts ({thoughtCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('question')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'question'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Questions ({questionCount})
          </button>
        </div>
      </div>

      {/* New Comment Submission Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50/80 rounded-2xl p-5 md:p-6 border border-slate-200/70 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Post a Thought or Question
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Local State Persisted</span>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCategory('thought')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
              category === 'thought'
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${category === 'thought' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>💡 Thought / Insight</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory('question')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
              category === 'question'
                ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${category === 'question' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>❓ Question / Inquiry</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory('general')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
              category === 'general'
                ? 'bg-slate-200 border-slate-400 text-slate-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${category === 'general' ? 'text-slate-700' : 'text-slate-400'}`} />
            <span>💬 General Note</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Your Name / Alias <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Brenda Kariuki"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Role or Company <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              placeholder="e.g. Solar EPC Installer / Energy Lead"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {category === 'thought' ? 'Your Observation / Insight' : category === 'question' ? 'Your Question for the Community' : 'Your Comment'} <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder={
              category === 'thought'
                ? "Share a field observation, market dynamic, or strategy you've observed..."
                : category === 'question'
                ? "Ask about technical benchmarks, financing options, regulatory nuances..."
                : "Add your thoughts or feedback on this briefing..."
            }
            className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium resize-y"
          />
        </div>

        {errorMsg && (
          <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-400">
            {category === 'thought' && '💡 Tagged as Thought'}
            {category === 'question' && '❓ Tagged as Question'}
            {category === 'general' && '💬 Tagged as General'}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer ${
              isSubmitting ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing {category}...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{category === 'thought' ? 'Publish Thought' : category === 'question' ? 'Ask Question' : 'Post Comment'}</span>
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {formSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your {category} has been posted successfully to this post!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isSubmitting && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Posting your {category}...</span>
            </div>
            <CommentSkeleton />
          </div>
        )}

        {filteredComments.length === 0 && !isSubmitting ? (
          <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No {activeFilter === 'all' ? 'comments' : activeFilter === 'thought' ? 'thoughts' : 'questions'} yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Be the first to post a thought or question on this topic above!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredComments.map((comment) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      comment.category === 'thought'
                        ? 'bg-amber-100 text-amber-800'
                        : comment.category === 'question'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {getInitials(comment.authorName)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {comment.authorName}
                        </span>
                        
                        {comment.authorRole && (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {comment.authorRole}
                          </span>
                        )}

                        {/* Category Badge */}
                        {comment.category === 'thought' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Lightbulb className="w-3 h-3 text-amber-600" />
                            Thought
                          </span>
                        )}
                        {comment.category === 'question' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                            <HelpCircle className="w-3 h-3 text-blue-600" />
                            Question
                          </span>
                        )}
                        {comment.category === 'general' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                            <MessageSquare className="w-3 h-3 text-slate-500" />
                            Note
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>

                  {onDeleteComment && (
                    <button
                      type="button"
                      onClick={() => onDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity rounded"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Comment Content */}
                <p className="mt-3 text-sm text-slate-700 font-normal leading-relaxed pl-12 whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Upvote & Interaction Bar */}
                <div className="mt-3.5 pl-12 flex items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => onToggleLike(comment.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      comment.isLiked
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
                    <span>{comment.likes} {comment.likes === 1 ? 'Helpful' : 'Helpful'}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
