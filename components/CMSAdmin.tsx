import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Filter, 
  Lock, 
  Unlock, 
  LogOut, 
  Clock, 
  Layers, 
  TrendingUp, 
  ChevronRight,
  ExternalLink,
  Save,
  X,
  Loader2,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  Calendar,
  Check,
  Copy,
  Key,
  EyeOff,
  Star, Settings, Image } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../services/ToastContext';
import { 
  subscribeBlogPosts, 
  saveBlogPost, 
  deleteBlogPost, 
  toggleBlogPostStatus,
  subscribeQuoteRequests, 
  updateQuoteStatus, 
  deleteQuoteRequest,
  subscribeUsers,
  updateUserRole,
  assignUserAccessKey,
  inviteUserOrSetRole,
  deleteUserRecord,
  PRIMARY_ADMIN_EMAIL,
  subscribeEmailSubscribers,
  subscribeAppReviews,
  submitAppReview,
  updateAppReviewStatus,
  deleteAppReview,
  subscribeSiteSettings,
  saveSiteSettings,
  resendWelcomeEmail,
  deleteEmailSubscriber,
  subscribeCMSCredentials,
  createCMSCredential,
  updateCMSCredentialStatus,
  deleteCMSCredential,
  subscribeCMSAuditLogs
} from '../services/firebase';
import { BlogPost, BlogPostStatus, QuoteRequest, QuoteStatus, AppUser, UserRole, EmailSubscriber, AppReview, SiteSettings, CMSCredential, CMSAuditLog } from '../types';
import { PRICING_BUNDLES, STANDARDIZED_PRODUCTS } from '../constants';

type CMSTab = 'posts' | 'quotes' | 'emails' | 'reviews' | 'settings' | 'roles';

const SOLAR_PRESET_IMAGES = [
  { label: 'Kenyan C&I Rooftop', url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800' },
  { label: 'Agri-Solar & Water Pump', url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fab35?q=80&w=800' },
  { label: 'EPC Utility Installation', url: 'https://images.unsplash.com/photo-1466611653911-95282fc365d5?q=80&w=800' },
  { label: 'Battery Storage & Grid', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800' },
  { label: 'Clean Energy Landscape', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800' }
];

const BLOG_TAGS = ['RESEARCH', 'STRATEGY', 'MARKET DATA', 'FINANCE', 'TECHNOLOGY', 'CASE STUDY', 'POLICY'];

const CMSAdmin: React.FC = () => {
  const { 
    currentUser, 
    role, 
    isAdmin, 
    isEditor, 
    loading: authLoading, 
    requiresPasswordChange,
    signInWithEmail, 
    signUpWithEmail, 
    quickDemoLogin, 
    signOutUser,
    switchRole,
    changeMasterPassword
  } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<CMSTab>('posts');

  // Auth Form State for unauthorized users
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authAccessCode, setAuthAccessCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Secure Access Credentials and Audit Logs
  const [cmsCredentials, setCmsCredentials] = useState<CMSCredential[]>([]);
  const [cmsAuditLogs, setCmsAuditLogs] = useState<CMSAuditLog[]>([]);
  
  // Create credential form fields
  const [credFullName, setCredFullName] = useState('');
  const [credTitle, setCredTitle] = useState('');
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credRole, setCredRole] = useState<UserRole>('viewer');
  const [credAccessCode, setCredAccessCode] = useState('');
  const [isGeneratingCred, setIsGeneratingCred] = useState(false);

  // Master Credentials Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Blog Posts State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchPost, setSearchPost] = useState('');
  const [filterTag, setFilterTag] = useState('ALL');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [postFeedback, setPostFeedback] = useState('');

  // Quote Requests State
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [searchQuote, setSearchQuote] = useState('');
  const [filterQuoteStatus, setFilterQuoteStatus] = useState<string>('ALL');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [updatingQuote, setUpdatingQuote] = useState(false);

  // Email Subscribers & Inquiries State
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);
  const [searchSubscriber, setSearchSubscriber] = useState('');
  const [filterSubscriberSource, setFilterSubscriberSource] = useState<string>('ALL');
  const [viewingSubscriberLetter, setViewingSubscriberLetter] = useState<EmailSubscriber | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);


  // Reviews State
  const [reviewsList, setReviewsList] = useState<AppReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewCompany, setNewReviewCompany] = useState('');
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [addingReviewLoading, setAddingReviewLoading] = useState(false);

  // Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [editingSettings, setEditingSettings] = useState<Partial<SiteSettings>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [tempPlatform, setTempPlatform] = useState('');
  const [tempPlatformUrl, setTempPlatformUrl] = useState('');

  // Users State for RBAC tab
  const [usersList, setUsersList] = useState<AppUser[]>([]);

  // User Invitation State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('viewer');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      showWarning('Email Required', 'Please provide an email address for the new team member.');
      return;
    }
    setIsAddingUser(true);
    try {
      const generatedKey = await inviteUserOrSetRole(newUserEmail.trim(), newUserName.trim(), newUserRole);
      showSuccess(
        'User Pre-Registered', 
        `Successfully pre-registered "${newUserEmail.trim()}" with role "${newUserRole.toUpperCase()}". CMS Access Key auto-generated: "${generatedKey}". Please share this key with the operator so they can sign in!`
      );
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('viewer');
    } catch (err: any) {
      showError('Action Failed', `Could not invite user: ${err.message}`);
    } finally {
      setIsAddingUser(false);
    }
  };

  const [showPasswordIds, setShowPasswordIds] = useState<Record<string, boolean>>({});

  const handleCopyAccessKey = (key: string, label: string) => {
    try {
      navigator.clipboard.writeText(key);
      showSuccess('Access Key Copied', `Copied key access code "${key}" for ${label} to clipboard.`);
    } catch (e) {
      showSuccess('Access Key Code', `Key code: ${key}`);
    }
  };

  const handleCopyPassword = (pass: string, label: string) => {
    try {
      navigator.clipboard.writeText(pass);
      showSuccess('Password Copied', `Copied login password for ${label} to clipboard.`);
    } catch (e) {
      showSuccess('Login Password', `Password: ${pass}`);
    }
  };

  const handleAssignUserKey = async (user: AppUser, customKey?: string) => {
    try {
      const assigned = await assignUserAccessKey(user.uid, customKey);
      showSuccess('Access Key Code Assigned', `Assigned key access code "${assigned}" to ${user.displayName || user.email}.`);
    } catch (err: any) {
      showError('Assignment Failed', `Could not assign access key code: ${err.message}`);
    }
  };

  // Unified Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemType: 'post' | 'quote' | 'subscriber' | 'review' | 'credential' | 'user';
    itemId: string;
    itemName: string;
    extraData?: any;
  }>({
    isOpen: false,
    title: '',
    message: '',
    itemType: 'post',
    itemId: '',
    itemName: ''
  });
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const confirmExecuteDelete = async () => {
    if (!deleteModalState.itemId) return;
    setIsDeletingItem(true);
    const { itemType, itemId, itemName, extraData } = deleteModalState;
    try {
      if (itemType === 'user') {
        await deleteUserRecord(itemId);
        showSuccess('User Removed', `Team profile for ${itemName} removed successfully.`);
      } else if (itemType === 'credential') {
        await deleteCMSCredential(currentUser?.email || 'admin@example.com', itemId, extraData?.email || '');
        showSuccess('Access Revoked', `Successfully removed credentials for ${itemName}.`);
      } else if (itemType === 'subscriber') {
        await deleteEmailSubscriber(itemId);
        showSuccess('Subscriber Removed', `Successfully deleted ${itemName} from subscriber records.`);
        if (viewingSubscriberLetter?.id === itemId) {
          setViewingSubscriberLetter(null);
        }
      } else if (itemType === 'review') {
        await deleteAppReview(itemId);
        showSuccess('Review Deleted', 'Review removed from system.');
      } else if (itemType === 'post') {
        await deleteBlogPost(itemId);
        showSuccess('Article Deleted', 'Research briefing permanently removed.');
      } else if (itemType === 'quote') {
        await deleteQuoteRequest(itemId);
        setSelectedQuote(null);
        showSuccess('Inquiry Deleted', 'Quote record permanently removed.');
      }
    } catch (err: any) {
      showError('Delete Failed', `Could not delete record: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeletingItem(false);
      setDeleteModalState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteUser = (user: AppUser) => {
    if (user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      showError('Action Prevented', 'You cannot delete the primary admin account.');
      return;
    }
    setDeleteModalState({
      isOpen: true,
      title: 'Revoke Team Profile',
      message: `Are you sure you want to permanently revoke privileges and remove the team profile for ${user.displayName || user.email}?`,
      itemType: 'user',
      itemId: user.uid,
      itemName: user.displayName || user.email
    });
  };

  // Secure Administrative Credential Handlers
  const [isCreatingCred, setIsCreatingCred] = useState(false);
  const [subRolesTab, setSubRolesTab] = useState<'create' | 'list' | 'legacy' | 'audit'>('create');

  const handleAutoGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'NURU-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCredAccessCode(code);
    showInfo('Code Auto-Generated', `Generated unique key: ${code}`);
  };

  const handleCreateCMSCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credFullName.trim() || !credTitle.trim() || !credEmail.trim() || !credPassword.trim() || !credAccessCode.trim()) {
      showError('Form Invalid', 'Please enter all required fields.');
      return;
    }
    
    setIsCreatingCred(true);
    try {
      await createCMSCredential(currentUser?.email || 'admin@example.com', {
        fullName: credFullName.trim(),
        title: credTitle.trim(),
        email: credEmail.trim().toLowerCase(),
        role: credRole,
        accessKey: credAccessCode.trim(),
        status: 'Active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiration
        createdAt: new Date().toISOString(),
        passwordPlain: credPassword.trim()
      });
      
      showSuccess('Credentials Generated', `Access privileges successfully generated for ${credFullName}.`);
      
      // Clear form and switch to list view
      setCredFullName('');
      setCredTitle('');
      setCredEmail('');
      setCredPassword('');
      setCredAccessCode('');
      setCredRole('viewer');
      setSubRolesTab('list');
    } catch (err: any) {
      showError('Generation Failed', err.message || 'Error occurred while saving credentials.');
    } finally {
      setIsCreatingCred(false);
    }
  };

  const handleDeleteCMSCredential = (cred: CMSCredential) => {
    if (cred.email.toLowerCase() === 'admin@example.com') {
      showError('Action Denied', 'You are forbidden from deleting the default root administrator credential.');
      return;
    }
    setDeleteModalState({
      isOpen: true,
      title: 'Revoke Administrative Credential',
      message: `Are you sure you want to permanently delete and revoke CMS access for ${cred.fullName}?`,
      itemType: 'credential',
      itemId: cred.id,
      itemName: cred.fullName,
      extraData: { email: cred.email }
    });
  };

  const handleToggleCMSCredentialStatus = async (cred: CMSCredential) => {
    if (cred.email.toLowerCase() === 'admin@example.com') {
      showError('Action Denied', 'You cannot disable the default root administrator credential.');
      return;
    }
    const nextStatus = cred.status === 'Active' ? 'Disabled' : 'Active';
    try {
      await updateCMSCredentialStatus(currentUser?.email || 'admin@example.com', cred.id, cred.email, nextStatus);
      showSuccess('Status Changed', `Credentials for ${cred.fullName} set to ${nextStatus}.`);
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  // Real-time Firestore subscriptions
  useEffect(() => {
    const unsubPosts = subscribeBlogPosts((fetched) => {
      setPosts(fetched);
      setPostsLoading(false);
    });

    const unsubQuotes = subscribeQuoteRequests((fetched) => {
      setQuotes(fetched);
    });

    const unsubSubscribers = subscribeEmailSubscribers((fetched) => {
      setSubscribers(fetched);
      setSubscribersLoading(false);
    });


    const unsubReviews = subscribeAppReviews((fetched) => {
      setReviewsList(fetched);
      setReviewsLoading(false);
    }, false); // Get all, not just approved

    const unsubSettings = subscribeSiteSettings((fetched) => {
      setSiteSettings(fetched);
      if (fetched) setEditingSettings(fetched);
    });

    const unsubUsers = subscribeUsers((fetched) => {
      setUsersList(fetched);
    });

    const unsubCMSCreds = subscribeCMSCredentials((fetched) => {
      setCmsCredentials(fetched);
    });

    const unsubCMSAudit = subscribeCMSAuditLogs((fetched) => {
      setCmsAuditLogs(fetched);
    });

    return () => {
      unsubPosts();
      unsubQuotes();
      unsubSubscribers();
      unsubUsers();
      unsubReviews();
      unsubSettings();
      unsubCMSCreds();
      unsubCMSAudit();
    };
  }, []);

  // Sync admin notes input when selecting quote
  useEffect(() => {
    if (selectedQuote) {
      setAdminNoteInput(selectedQuote.adminNotes || '');
    }
  }, [selectedQuote]);

  // Auth Submission handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      if (authMode === 'signin') {
        await signInWithEmail(authEmail, authPass, authAccessCode);
        showSuccess('Authenticated Successfully', `Welcome back to the NuruGrowth CMS Portal.`);
      } else {
        await signUpWithEmail(authEmail, authPass, authName || 'Solar Editor', 'editor');
        showSuccess('Team Account Registered', `Welcome on board! You now have editorial access.`);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setAuthError(msg);
      showError('Authentication Notice', msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Resend Polite Welcome Email to Subscriber
  const handleResendWelcomeEmail = async (sub: EmailSubscriber) => {
    setResendingEmailId(sub.id);
    try {
      await resendWelcomeEmail(sub);
      showSuccess(
        'Polite Welcome Letter Dispatched',
        `An official acknowledgement and welcome letter has been re-sent to ${sub.email}.`
      );
    } catch (err: any) {
      console.error('Error re-sending welcome email:', err);
      showError('Email Dispatch Notice', `Could not dispatch to ${sub.email}: ${err.message || 'Network delay'}`);
    } finally {
      setResendingEmailId(null);
    }
  };

  // Delete Email Subscriber
  const handleDeleteSubscriber = (id: string, email: string) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Remove Subscriber',
      message: `Are you sure you want to remove ${email} from the subscriber list?`,
      itemType: 'subscriber',
      itemId: id,
      itemName: email
    });
  };

  // Export Subscribers to CSV
  const exportSubscribersToCSV = () => {
    if (subscribers.length === 0) {
      showWarning('No Data to Export', 'There are no subscriber records currently available to export.');
      return;
    }
    const headers = ['ID', 'Date', 'Email', 'Name', 'Company', 'Country', 'Source Type', 'Source Label', 'Welcome Email Dispatched'];
    const rows = subscribers.map(s => [
      s.id,
      new Date(s.createdAt).toLocaleString(),
      s.email,
      `"${s.name || ''}"`,
      `"${s.companyName || ''}"`,
      `"${s.country || 'Kenya'}"`,
      `"${s.source}"`,
      `"${s.sourceLabel || ''}"`,
      s.welcomeEmailSent ? 'Yes' : 'No'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NuruGrowth_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Export Completed', `Exported ${subscribers.length} subscriber records to CSV.`);
  };


  // Reviews Handlers
  const handleReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateAppReviewStatus(id, status);
      showSuccess('Review Updated', `Review status set to ${status}`);
    } catch (err: any) {
      showError('Update Failed', err.message);
    }
  };

  const handleReviewDelete = (id: string, authorName?: string) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Delete App Review',
      message: `Are you sure you want to permanently delete this review${authorName ? ` by ${authorName}` : ''}?`,
      itemType: 'review',
      itemId: id,
      itemName: authorName || 'Review'
    });
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewContent || !newReviewCompany || !newReviewRole) {
      showError('Form Incomplete', 'Please fill in all required fields.');
      return;
    }
    setAddingReviewLoading(true);
    try {
      const reviewId = await submitAppReview({
        authorName: newReviewAuthor,
        authorRole: newReviewRole,
        companyName: newReviewCompany,
        rating: newReviewRating,
        content: newReviewContent,
        verifiedInteraction: true
      });
      // Auto approve since added from CMS by Admin
      await updateAppReviewStatus(reviewId, 'approved');
      showSuccess('Social Proof Added', `Testimonial from ${newReviewAuthor} has been published and is live!`);
      // Reset state
      setNewReviewAuthor('');
      setNewReviewRole('');
      setNewReviewCompany('');
      setNewReviewContent('');
      setNewReviewRating(5);
      setIsAddingReview(false);
    } catch (err: any) {
      showError('Action Failed', `Could not add testimonial: ${err.message}`);
    } finally {
      setAddingReviewLoading(false);
    }
  };

  // Settings Handlers
  const handleAddCustomSocial = () => {
    if (!tempPlatform.trim() || !tempPlatformUrl.trim()) {
      showWarning('Fields Required', 'Please enter both platform name and URL.');
      return;
    }
    const current = editingSettings.customSocialLinks || [];
    setEditingSettings({
      ...editingSettings,
      customSocialLinks: [...current, { platformName: tempPlatform.trim(), url: tempPlatformUrl.trim() }]
    });
    setTempPlatform('');
    setTempPlatformUrl('');
    showSuccess('Platform Added', `Added temporary custom platform "${tempPlatform.trim()}". Save configuration to persist changes.`);
  };

  const handleRemoveCustomSocial = (index: number) => {
    const current = editingSettings.customSocialLinks || [];
    const updated = current.filter((_, i) => i !== index);
    setEditingSettings({
      ...editingSettings,
      customSocialLinks: updated
    });
    showSuccess('Platform Removed', 'Temporary custom platform removed. Save configuration to persist changes.');
  };

  const handleHeroChange = (field: string, value: string) => {
    const currentHero = editingSettings.hero || {
      eyebrow: 'Institutional Digital Growth',
      title: 'Strategic Marketing for {Clean Energy Pioneers}',
      subtext: 'We engineer high-performance customer acquisition pipelines and custom brand authority assets for the world’s leading clean-tech, solar EPC, and climate venture brands.',
      primaryBtnText: 'Calibrate Growth Potential',
      primaryBtnUrl: '#products',
      secondaryBtnText: 'Review Methodology',
      secondaryBtnUrl: '#solutions'
    };
    setEditingSettings({
      ...editingSettings,
      hero: {
        ...currentHero,
        [field]: value
      }
    });
  };

  const handlePricingBundleChange = (index: number, field: string, value: any) => {
    const currentBundles = [...(editingSettings.pricingBundles && editingSettings.pricingBundles.length > 0 ? editingSettings.pricingBundles : PRICING_BUNDLES)];
    currentBundles[index] = {
      ...currentBundles[index],
      [field]: value
    };
    setEditingSettings({
      ...editingSettings,
      pricingBundles: currentBundles
    });
  };

  const handleProductizedOfferChange = (index: number, field: string, value: any) => {
    const currentOffers = [...(editingSettings.productizedOffers && editingSettings.productizedOffers.length > 0 ? editingSettings.productizedOffers : STANDARDIZED_PRODUCTS)];
    currentOffers[index] = {
      ...currentOffers[index],
      [field]: value
    };
    setEditingSettings({
      ...editingSettings,
      productizedOffers: currentOffers
    });
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await saveSiteSettings(editingSettings as any);
      showSuccess('Settings Saved', 'Global site settings updated.');
    } catch (err: any) {
      showError('Save Failed', err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Open Editor for new post

  const handleBlogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('File Too Large', 'Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingPost) {
        // Simple base64 for now, could compress via canvas if needed
        setEditingPost({ ...editingPost, img: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewPost = () => {
    setEditingPost({
      id: '',
      title: '',
      slug: '',
      tag: 'RESEARCH',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
      readTime: '4 min read',
      author: currentUser?.displayName || 'Moses Mutuma',
      authorRole: 'Founder & Principal Strategist, NuruGrowth',
      summary: '',
      img: SOLAR_PRESET_IMAGES[0].url,
      fullContent: [''],
      status: 'published',
      featured: false,
      views: 0
    });
    setIsEditorOpen(true);
  };

  // Open Editor for existing post

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('File Too Large', 'Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingPost) {
        const updated = [...(editingPost.fullContent || [])];
        updated[index] = event.target.result as string;
        setEditingPost({ ...editingPost, fullContent: updated });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost({
      ...post,
      fullContent: post.fullContent && post.fullContent.length > 0 ? post.fullContent : [post.summary || '']
    });
    setIsEditorOpen(true);
  };

  // Save Blog Post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!editingPost.title.trim()) {
      showWarning('Headline Required', 'Please provide an article headline before saving.');
      setPostFeedback('Please provide an article headline.');
      return;
    }

    setSaveLoading(true);
    setPostFeedback('');

    try {
      // Auto-generate slug if empty
      const slug = editingPost.slug || editingPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cleanedContent = (editingPost.fullContent || []).filter(p => p.trim().length > 0);

      await saveBlogPost({
        ...editingPost,
        slug,
        fullContent: cleanedContent.length > 0 ? cleanedContent : [editingPost.summary || '']
      });

      setIsEditorOpen(false);
      setEditingPost(null);
      const msg = `Article "${editingPost.title}" was saved successfully.`;
      setPostFeedback(msg);
      showSuccess('Article Saved', msg);
      setTimeout(() => setPostFeedback(''), 4000);
    } catch (err: any) {
      const errTxt = `Error saving article: ${err.message}`;
      setPostFeedback(errTxt);
      showError('Save Failed', errTxt);
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Blog Post
  const handleDeletePost = (id: string, title?: string) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Delete Research Briefing',
      message: `Are you sure you want to permanently delete "${title || 'this research briefing'}"?`,
      itemType: 'post',
      itemId: id,
      itemName: title || 'Briefing'
    });
  };

  // Toggle Blog Post Status
  const handleToggleStatus = async (post: BlogPost) => {
    try {
      await toggleBlogPostStatus(post.id, post.status || 'published');
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      showSuccess('Status Updated', `Briefing status changed to ${newStatus.toUpperCase()}.`);
    } catch (err: any) {
      showError('Status Update Notice', `Could not update status: ${err.message}`);
    }
  };

  // Update Quote Status & Notes
  const handleSaveQuoteChanges = async () => {
    if (!selectedQuote) return;
    setUpdatingQuote(true);
    try {
      await updateQuoteStatus(selectedQuote.id, selectedQuote.status, adminNoteInput);
      setSelectedQuote(prev => prev ? { ...prev, adminNotes: adminNoteInput } : null);
      showSuccess('Inquiry Updated', `Status and notes saved for ${selectedQuote.companyName}.`);
    } catch (err: any) {
      showError('Update Failed', `Could not update quote: ${err.message}`);
    } finally {
      setUpdatingQuote(false);
    }
  };

  // Delete Quote
  const handleDeleteQuote = (id: string, companyName?: string) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Delete Quote Request',
      message: `Are you sure you want to permanently delete the inquiry record${companyName ? ` for ${companyName}` : ''}?`,
      itemType: 'quote',
      itemId: id,
      itemName: companyName || 'Quote'
    });
  };

  // Export Quotes to CSV
  const exportQuotesToCSV = () => {
    if (quotes.length === 0) {
      showWarning('No Data to Export', 'There are no quote requests available to export.');
      return;
    }
    const headers = ['ID', 'Date', 'Company', 'Contact', 'Email', 'Phone', 'Country', 'Segment', 'Product', 'Budget', 'Status'];
    const rows = quotes.map(q => [
      q.id,
      new Date(q.createdAt).toLocaleDateString(),
      `"${q.companyName}"`,
      `"${q.contactName}"`,
      q.email,
      q.phone,
      `"${q.country}"`,
      `"${q.targetSegment}"`,
      `"${q.productPackage || ''}"`,
      `"${q.currentAdSpend || ''}"`,
      q.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NuruGrowth_Client_Quotes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Export Completed', `Exported ${quotes.length} quote request records to CSV.`);
  };

  // Filtered Blog Posts
  const filteredPosts = posts.filter((p) => {
    const matchesTag = filterTag === 'ALL' || p.tag.toUpperCase() === filterTag;
    const matchesSearch = p.title.toLowerCase().includes(searchPost.toLowerCase()) || 
                          (p.summary && p.summary.toLowerCase().includes(searchPost.toLowerCase())) ||
                          (p.author && p.author.toLowerCase().includes(searchPost.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  // Filtered Quotes
  const filteredQuotes = quotes.filter((q) => {
    const matchesStatus = filterQuoteStatus === 'ALL' || q.status === filterQuoteStatus;
    const matchesSearch = q.companyName.toLowerCase().includes(searchQuote.toLowerCase()) ||
                          q.contactName.toLowerCase().includes(searchQuote.toLowerCase()) ||
                          q.email.toLowerCase().includes(searchQuote.toLowerCase()) ||
                          q.targetSegment.toLowerCase().includes(searchQuote.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Subscribers
  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSource = filterSubscriberSource === 'ALL' || s.source === filterSubscriberSource;
    const matchesSearch = s.email.toLowerCase().includes(searchSubscriber.toLowerCase()) ||
                          (s.name && s.name.toLowerCase().includes(searchSubscriber.toLowerCase())) ||
                          (s.companyName && s.companyName.toLowerCase().includes(searchSubscriber.toLowerCase())) ||
                          (s.country && s.country.toLowerCase().includes(searchSubscriber.toLowerCase())) ||
                          (s.sourceLabel && s.sourceLabel.toLowerCase().includes(searchSubscriber.toLowerCase()));
    return matchesSource && matchesSearch;
  });

  // ==========================================
  // UNAUTHORIZED / RBAC LOGIN BARRIER
  // ==========================================
  if (!isEditor) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 border border-slate-200/80 shadow-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center border border-blue-100 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[9px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Role-Based Access Control (RBAC)
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              NuruGrowth CMS Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Access to publishing research briefings, client onboarding CRM, and editorial matrices requires an authorized <span className="font-bold text-slate-800">Admin</span> or <span className="font-bold text-slate-800">Editor</span> credential.
            </p>
          </div>

          {/* Quick Sandbox / Demo Instant Login */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant Sandbox Access (Preview)</span>
              </div>
              <span className="text-[9px] font-mono text-blue-600 font-bold">1-Click Test</span>
            </div>
            <p className="text-[11px] text-blue-800/80 font-medium">
              Click below to immediately evaluate the CMS dashboard with full Administrator privileges:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => quickDemoLogin('admin')}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Login as Admin</span>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('editor')}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Login as Editor</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Or Official Credentials</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Auth Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                authMode === 'signin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                authMode === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register Team Account
            </button>
          </div>

           {/* Auth Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'signin' && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl space-y-1 text-xs text-emerald-950 leading-relaxed shadow-inner">
                <div className="font-black flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Production Environment Hardened</span>
                </div>
                <p className="text-[11px] font-medium text-emerald-800">
                  Sign in with your registered admin credentials. All authentication requests are encrypted with SHA-256 and monitored by Firestore security rules.
                </p>
              </div>
            )}

            {authMode === 'signup' && (
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  onInvalid={(e) => {
                    setAuthName('');
                    e.currentTarget.value = '';
                    e.currentTarget.placeholder = '';
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                onInvalid={(e) => {
                  setAuthEmail('');
                  e.currentTarget.value = '';
                  e.currentTarget.placeholder = '';
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                onInvalid={(e) => {
                  setAuthPass('');
                  e.currentTarget.value = '';
                  e.currentTarget.placeholder = '';
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {authMode === 'signin' && (
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Access Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NURU-ADMIN-2026"
                  value={authAccessCode}
                  onChange={(e) => setAuthAccessCode(e.target.value)}
                  onInvalid={(e) => {
                    setAuthAccessCode('');
                    e.currentTarget.value = '';
                    e.currentTarget.placeholder = '';
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {authSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <span>{authMode === 'signin' ? 'Authenticate CMS Session' : 'Create Account & Enter'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // MASTER CREDENTIALS PASSWORD CHANGE BARRIER
  // ==========================================
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long for production security.');
      return;
    }
    if (newPassword === 'NuruGrowth2026!') {
      setPasswordError('You cannot reuse the default master password. Please choose a custom secure password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify the characters.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await changeMasterPassword(newPassword);
      showSuccess(
        'Credentials Secured',
        'Your custom master password has been saved. The default master password is now deactivated.'
      );
    } catch (err: any) {
      console.error('Password change failed:', err);
      setPasswordError(err.message || 'Failed to update credentials. Please try again.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (requiresPasswordChange) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 border border-slate-200/80 shadow-2xl space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center border border-red-100 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-800 rounded-full text-[9px] font-black uppercase tracking-widest">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              Credentials Update Required
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Secure Master Account
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              You have logged in with the default master credentials. To prevent security breaches, you <span className="font-bold text-red-600">MUST</span> update your password to a strong, custom value before accessing the CMS dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-5">
            {passwordError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-600 font-bold leading-relaxed animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">New Master Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {passwordSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-200" />
                  <span>Update Password & Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Out Fallback */}
          <div className="text-center pt-2">
            <button
              onClick={() => signOutUser()}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-all underline decoration-slate-200 underline-offset-4"
            >
              Cancel & Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHORIZED CMS DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50/60 py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top CMS Header & RBAC Status Bar */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    NuruGrowth Intelligence CMS
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {role} Role Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Logged in as <span className="font-bold text-slate-800">{currentUser?.displayName || currentUser?.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Role Tester Switcher & Logout */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-wider">
              <span className="px-2 text-slate-400">RBAC Simulator:</span>
              <button
                onClick={() => switchRole('admin')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  role === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchRole('editor')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  role === 'editor' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => switchRole('viewer')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  role === 'viewer' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Viewer
              </button>
            </div>

            <a
              href="#blog"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Public Blog</span>
            </a>

            <button
              onClick={signOutUser}
              title="Sign Out"
              className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Message Bar */}
        {postFeedback && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{postFeedback}</span>
            </div>
            <button onClick={() => setPostFeedback('')} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('posts')}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'posts'
                ? 'bg-white border-t border-x border-slate-200 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Research Briefings & Articles ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'bg-white border-t border-x border-slate-200 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Onboarding & Quotes ({quotes.length})</span>
            {quotes.filter(q => q.status === 'new').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'emails'
                ? 'bg-white border-t border-x border-slate-200 text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Subscribers & Inquiries ({subscribers.length})</span>
            {subscribers.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black font-mono">
                LIVE
              </span>
            )}
          </button>


          <button
            onClick={() => setActiveTab('reviews')}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-white border-t border-x border-slate-200 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Social Proof ({reviewsList.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white border-t border-x border-slate-200 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site Settings</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-t-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'bg-white border-t border-x border-slate-200 text-purple-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>RBAC Team Roles</span>
            </button>
          )}
        </div>

        {/* ========================================== */}
        {/* TAB 1: BLOG ARTICLES & RESEARCH BRIEFS     */}
        {/* ========================================== */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search articles by title, author, or keyword..."
                    value={searchPost}
                    onChange={(e) => setSearchPost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                {/* Tag Filter */}
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Categories</option>
                  {BLOG_TAGS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Create Post Button */}
              <button
                type="button"
                onClick={handleNewPost}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Briefing</span>
              </button>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="py-4 px-6">Briefing / Title</th>
                      <th className="py-4 px-4">Tag</th>
                      <th className="py-4 px-4">Author</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          No research briefings found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Image & Title */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={post.img}
                                alt={post.title}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                                <div className="text-[10px] text-slate-400 line-clamp-1">{post.summary}</div>
                              </div>
                            </div>
                          </td>

                          {/* Tag */}
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-[9px] font-bold tracking-wider">
                              {post.tag}
                            </span>
                          </td>

                          {/* Author */}
                          <td className="py-4 px-4 font-medium text-slate-600 whitespace-nowrap">
                            {post.author || 'Moses Mutuma'}
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                            {post.date}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleStatus(post)}
                              title="Click to toggle status"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                (post.status || 'published') === 'published'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                (post.status || 'published') === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} />
                              <span>{post.status || 'published'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="p-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                title="Edit Article"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: CLIENT ONBOARDING & QUOTES CRM     */}
        {/* ========================================== */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search leads by company, contact, or sector..."
                    value={searchQuote}
                    onChange={(e) => setSearchQuote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <select
                  value={filterQuoteStatus}
                  onChange={(e) => setFilterQuoteStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="new">New Inquiries</option>
                  <option value="in_review">In Review</option>
                  <option value="contacted">Contacted</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="won">Closed Won</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <button
                type="button"
                onClick={exportQuotesToCSV}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV Dossier</span>
              </button>
            </div>

            {/* CRM Quotes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leads List */}
              <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 space-y-3 max-h-[700px] overflow-y-auto">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1">
                  Inbound Scopes ({filteredQuotes.length})
                </div>

                {filteredQuotes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    No quote submissions found.
                  </div>
                ) : (
                  filteredQuotes.map((q) => {
                    const isSelected = selectedQuote?.id === q.id;
                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuote(q)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected 
                            ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-1 ring-blue-400' 
                            : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="font-black text-sm text-slate-900 line-clamp-1">{q.companyName}</div>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            q.status === 'new' ? 'bg-blue-600 text-white' :
                            q.status === 'won' ? 'bg-emerald-600 text-white' :
                            q.status === 'proposal_sent' ? 'bg-purple-600 text-white' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {q.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 font-medium line-clamp-1">
                          {q.contactName} • {q.targetSegment}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/40">
                          <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                          <span>{q.country}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Lead Detailed Dossier View */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8">
                {selectedQuote ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                      <div>
                        <div className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                          Reference Code: {selectedQuote.id}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          {selectedQuote.companyName}
                        </h2>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {selectedQuote.targetSegment} • {selectedQuote.country}
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedQuote.status}
                          onChange={(e) => setSelectedQuote({ ...selectedQuote, status: e.target.value as QuoteStatus })}
                          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-800 outline-none focus:border-blue-600"
                        >
                          <option value="new">New</option>
                          <option value="in_review">In Review</option>
                          <option value="contacted">Contacted</option>
                          <option value="proposal_sent">Proposal Sent</option>
                          <option value="won">Closed Won</option>
                          <option value="archived">Archived</option>
                        </select>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteQuote(selectedQuote.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Decision Maker</div>
                        <div className="font-bold text-slate-900 text-sm">{selectedQuote.contactName} ({selectedQuote.contactRole || 'Lead'})</div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                          <Mail className="w-3 h-3 text-blue-600" />
                          <a href={`mailto:${selectedQuote.email}`} className="hover:underline">{selectedQuote.email}</a>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <a href={`https://wa.me/${selectedQuote.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="hover:underline">{selectedQuote.phone}</a>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scope Parameters</div>
                        <div className="text-xs font-bold text-slate-800">Package: <span className="text-blue-600">{selectedQuote.productPackage || 'Standard Audit'}</span></div>
                        <div className="text-xs text-slate-600">Capacity Scale: {selectedQuote.systemCapacityKWp || 'N/A'}</div>
                        <div className="text-xs text-slate-600">Monthly Spend Tier: {selectedQuote.currentAdSpend || 'N/A'}</div>
                        <div className="text-xs text-slate-600">Preferred Time: {selectedQuote.preferredSchedule || 'Standard'}</div>
                      </div>
                    </div>

                    {/* Pain Points */}
                    {selectedQuote.painPoints && selectedQuote.painPoints.length > 0 && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Identified Bottlenecks</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedQuote.painPoints.map((p, idx) => (
                            <span key={idx} className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium rounded-lg">
                              • {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Client Notes */}
                    {selectedQuote.customNotes && (
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-800">Client Brief Notes</div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedQuote.customNotes}</p>
                      </div>
                    )}

                    {/* Admin Internal Notes & Save */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Internal Team Notes & Strategy Next Steps
                        </label>
                      </div>
                      
                      <textarea
                        rows={3}
                        placeholder="Add internal notes, strategy, or next steps..."
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"
                      />
                      
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleSaveQuoteChanges()}
                          className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Assessment & Status</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Select a Quote Request</h3>
                    <p className="text-slate-500 text-sm">Choose a lead from the list to view their complete dossier.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: EMAIL SUBSCRIBERS & INQUIRIES       */}
        {/* ========================================== */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={searchSubscriber}
                    onChange={(e) => setSearchSubscriber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <select
                  value={filterSubscriberSource}
                  onChange={(e) => setFilterSubscriberSource(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Sources</option>
                  <option value="newsletter_footer">Footer Newsletter</option>
                  <option value="growth_lab">Growth Lab Tool</option>
                  <option value="quote_onboarding">Quote Onboarding</option>
                  <option value="contact_direct">Direct Inquiries</option>
                </select>
              </div>

              <button
                type="button"
                onClick={exportSubscribersToCSV}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV Dossier</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="py-4 px-6">Subscriber</th>
                      <th className="py-4 px-4">Contact</th>
                      <th className="py-4 px-4">Origin / Campaign</th>
                      <th className="py-4 px-4">Acknowledged</th>
                      <th className="py-4 px-4">Registered Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          No subscribers or inquiries found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900">{sub.name || 'Anonymous Visitor'}</div>
                            <div className="text-[10px] text-slate-400">{sub.companyName || 'No Company'}</div>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-600 font-medium">
                            {sub.email}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-mono text-[9px] font-bold tracking-wider">
                              {sub.sourceLabel || sub.source}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              sub.welcomeEmailSent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {sub.welcomeEmailSent ? 'Dispatched' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setViewingSubscriberLetter(sub)}
                                className="p-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                title="View Automated Welcome Letter"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleResendWelcomeEmail(sub)}
                                disabled={resendingEmailId === sub.id}
                                className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                title="Re-dispatch Institutional Letter"
                              >
                                {resendingEmailId === sub.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                  className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                  title="Remove Subscriber"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: SOCIAL PROOF & TESTIMONIALS         */}
        {/* ========================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="text-sm font-bold text-slate-800">
                  Manage Client Testimonials & Social Proof Records
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingReview(!isAddingReview)}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Testimonial</span>
              </button>
            </div>

            {/* Add Testimonial Panel */}
            <AnimatePresence>
              {isAddingReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-md space-y-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-900">Add New Institutional Testimonial</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingReview(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Author Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jane Doe"
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Author Role</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CEO & Founder"
                          value={newReviewRole}
                          onChange={(e) => setNewReviewRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Company Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. M-KOPA Solar"
                          value={newReviewCompany}
                          onChange={(e) => setNewReviewCompany(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Testimonial Content</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="What did the client say about NuruGrowth's optimization deliverables?"
                          value={newReviewContent}
                          onChange={(e) => setNewReviewContent(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Rating Stars</label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-600"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                          <option value={3}>⭐⭐⭐ (3 Stars)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingReview(false)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingReviewLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {addingReviewLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Publish Testimonial</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Testimonials List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsList.length === 0 ? (
                <div className="md:col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs font-medium">
                  No testimonials or social proof records found.
                </div>
              ) : (
                reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 relative animate-fade-in">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          rev.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          rev.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {rev.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{rev.content}"
                      </p>
                    </div>

                    <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{rev.authorName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{rev.authorRole}, {rev.companyName}</div>
                      </div>

                      <div className="inline-flex items-center gap-1.5">
                        {rev.status !== 'approved' && (
                          <button
                            onClick={() => handleReviewStatus(rev.id, 'approved')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                            title="Approve & Show on Site"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {rev.status !== 'rejected' && (
                          <button
                            onClick={() => handleReviewStatus(rev.id, 'rejected')}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                            title="Reject Review"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleReviewDelete(rev.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: SITE SETTINGS CONFIGURATION         */}
        {/* ========================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">Global Website Configuration</h3>
                <p className="text-xs text-slate-500 font-medium">Configure institutional contact nodes, operations headquarters, social channels, and footer disclaimers.</p>
              </div>

              <div className="space-y-6">
                {/* Contact Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Inquiries Mailbox</label>
                    <input
                      type="email"
                      value={editingSettings.inquiriesEmail || ''}
                      onChange={e => setEditingSettings({...editingSettings, inquiriesEmail: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Operational Base</label>
                    <input
                      type="text"
                      value={editingSettings.operationalBase || ''}
                      onChange={e => setEditingSettings({...editingSettings, operationalBase: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Social Channels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">WhatsApp URL</label>
                    <input
                      type="text"
                      value={editingSettings.whatsappUrl || ''}
                      onChange={e => setEditingSettings({...editingSettings, whatsappUrl: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={editingSettings.linkedinUrl || ''}
                      onChange={e => setEditingSettings({...editingSettings, linkedinUrl: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Instagram Channel</label>
                    <input
                      type="text"
                      value={editingSettings.instagramUrl || ''}
                      onChange={e => setEditingSettings({...editingSettings, instagramUrl: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">X / Twitter URL</label>
                    <input
                      type="text"
                      value={editingSettings.xUrl || ''}
                      onChange={e => setEditingSettings({...editingSettings, xUrl: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Facebook Page URL</label>
                    <input
                      type="text"
                      value={editingSettings.facebookUrl || ''}
                      onChange={e => setEditingSettings({...editingSettings, facebookUrl: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Footer Disclaimer */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Footer Disclaimer / Institutional Text</label>
                  <textarea
                    rows={3}
                    value={editingSettings.footerText || ''}
                    onChange={e => setEditingSettings({...editingSettings, footerText: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner resize-none leading-relaxed"
                  />
                </div>

                {/* Hero Header Customization */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Hero Section Customization</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Instantly edit headings, value propositions, and action anchors on the home page.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Hero Eyebrow Text</label>
                      <input
                        type="text"
                        value={editingSettings.hero?.eyebrow || 'Institutional Digital Growth'}
                        onChange={e => handleHeroChange('eyebrow', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Hero Title (Use {"{ }"} around highlighted words)</label>
                      <input
                        type="text"
                        value={editingSettings.hero?.title || 'Strategic Marketing for {Clean Energy Pioneers}'}
                        onChange={e => handleHeroChange('title', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Hero Body Copy / Subtext</label>
                    <textarea
                      rows={3}
                      value={editingSettings.hero?.subtext || ''}
                      onChange={e => handleHeroChange('subtext', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Primary Button Text</label>
                      <input
                        type="text"
                        value={editingSettings.hero?.primaryBtnText || 'Calibrate Growth Potential'}
                        onChange={e => handleHeroChange('primaryBtnText', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Primary Button Link / Anchor</label>
                      <input
                        type="text"
                        value={editingSettings.hero?.primaryBtnUrl || '#products'}
                        onChange={e => handleHeroChange('primaryBtnUrl', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Secondary Button Text</label>
                      <input
                        type="text"
                        value={editingSettings.hero?.secondaryBtnText || 'Review Methodology'}
                        onChange={e => handleHeroChange('secondaryBtnText', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Secondary Button Link / Anchor</label>
                      <input
                        type="text"
                        value={editingSettings.hero?.secondaryBtnUrl || '#solutions'}
                        onChange={e => handleHeroChange('secondaryBtnUrl', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Social Channels */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Additional Custom Social Channels</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Add alternative custom platform coordinates (e.g. YouTube, Medium, GitHub) that render in the website footer.</p>
                  </div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Platform Name</label>
                      <input
                        type="text"
                        placeholder="E.g., YouTube"
                        value={tempPlatform}
                        onChange={e => setTempPlatform(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Profile URL</label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/c/yourchannel"
                        value={tempPlatformUrl}
                        onChange={e => setTempPlatformUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSocial}
                      className="px-5 py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Add Platform
                    </button>
                  </div>

                  {editingSettings.customSocialLinks && editingSettings.customSocialLinks.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 divide-y divide-slate-100">
                      {editingSettings.customSocialLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider">{link.platformName}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{link.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSocial(idx)}
                            className="text-rose-600 hover:text-white hover:bg-rose-600 p-1 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Investment Structures / Pricing Packages */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Solutions: Investment Packages (Pricing Bundles)</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Fine-tune features, pricing levels, and structural definitions for the standard 3 bundles.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(editingSettings.pricingBundles && editingSettings.pricingBundles.length > 0 ? editingSettings.pricingBundles : PRICING_BUNDLES).map((bundle, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Package {idx + 1}</span>
                          <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase">
                            <input
                              type="checkbox"
                              checked={bundle.featured || false}
                              onChange={e => handlePricingBundleChange(idx, 'featured', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Featured Choice</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Package Name</label>
                          <input
                            type="text"
                            value={bundle.title || ''}
                            onChange={e => handlePricingBundleChange(idx, 'title', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Price</label>
                            <input
                              type="text"
                              value={bundle.price || ''}
                              onChange={e => handlePricingBundleChange(idx, 'price', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Timeline</label>
                            <input
                              type="text"
                              value={bundle.timeline || ''}
                              onChange={e => handlePricingBundleChange(idx, 'timeline', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Description / Thesis</label>
                          <textarea
                            rows={2}
                            value={bundle.description || ''}
                            onChange={e => handlePricingBundleChange(idx, 'description', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium resize-none leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Included Deliverables (One per line)</label>
                          <textarea
                            rows={4}
                            value={bundle.features ? bundle.features.join('\n') : ''}
                            onChange={e => handlePricingBundleChange(idx, 'features', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] font-mono leading-relaxed"
                            placeholder="Deliverable feature..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High-Impact Standardized Offers */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Solutions: Standardized Productized Offers</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Configure fixed-price product architectures, turnaround speeds, and deliverables.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(editingSettings.productizedOffers && editingSettings.productizedOffers.length > 0 ? editingSettings.productizedOffers : STANDARDIZED_PRODUCTS).map((offer, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Offer Product {idx + 1}</span>
                          <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase">
                            <input
                              type="checkbox"
                              checked={offer.isPopular || false}
                              onChange={e => handleProductizedOfferChange(idx, 'isPopular', e.target.checked)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Most Popular Tag</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Product Title</label>
                            <input
                              type="text"
                              value={offer.title || ''}
                              onChange={e => handleProductizedOfferChange(idx, 'title', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Subtitle Node</label>
                            <input
                              type="text"
                              value={offer.subtitle || ''}
                              onChange={e => handleProductizedOfferChange(idx, 'subtitle', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Currency</label>
                            <input
                              type="text"
                              value={offer.currency || 'USD'}
                              onChange={e => handleProductizedOfferChange(idx, 'currency', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Price</label>
                            <input
                              type="text"
                              value={offer.price || ''}
                              onChange={e => handleProductizedOfferChange(idx, 'price', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Turnaround</label>
                            <input
                              type="text"
                              value={offer.timeToDelivery || ''}
                              onChange={e => handleProductizedOfferChange(idx, 'timeToDelivery', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Core Deliverable Label</label>
                            <input
                              type="text"
                              value={offer.deliverable || ''}
                              onChange={e => handleProductizedOfferChange(idx, 'deliverable', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Product ID</label>
                            <input
                              type="text"
                              disabled
                              value={offer.id || ''}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Short Description</label>
                          <textarea
                            rows={2}
                            value={offer.description || ''}
                            onChange={e => handleProductizedOfferChange(idx, 'description', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium resize-none leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Included Workflows (One per line)</label>
                          <textarea
                            rows={4}
                            value={offer.features ? offer.features.join('\n') : ''}
                            onChange={e => handleProductizedOfferChange(idx, 'features', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] font-mono leading-relaxed"
                            placeholder="Workflow step..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-blue-400" />
                  )}
                  <span>Save Configuration Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 6: RBAC TEAM ROLES                      */}
        {/* ========================================== */}
        {activeTab === 'roles' && isAdmin && (
          <div className="space-y-6">
            {/* Sub navigation for Access Credentials */}
            <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
              <button
                type="button"
                onClick={() => setSubRolesTab('create')}
                className={`px-5 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  subRolesTab === 'create'
                    ? 'bg-white border-t border-x border-slate-200 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                <span>Generate New Credentials</span>
              </button>

              <button
                type="button"
                onClick={() => setSubRolesTab('list')}
                className={`px-5 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  subRolesTab === 'list'
                    ? 'bg-white border-t border-x border-slate-200 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                <span>Authorized Access Keys ({cmsCredentials.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSubRolesTab('legacy')}
                className={`px-5 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  subRolesTab === 'legacy'
                    ? 'bg-white border-t border-x border-slate-200 text-purple-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5 inline mr-1.5" />
                <span>Pre-assigned Operators ({usersList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSubRolesTab('audit')}
                className={`px-5 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  subRolesTab === 'audit'
                    ? 'bg-white border-t border-x border-slate-200 text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                <span>CMS Security Audit Trail ({cmsAuditLogs.length})</span>
              </button>
            </div>

            {/* Sub-tab 1: Generate New Credentials Form */}
            {subRolesTab === 'create' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 animate-fade-in space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Generate New CMS Admin Credentials</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Instantly provision secure operational privileges, set strong initial passwords, assign roles, and auto-generate or manually specify unique administrative access codes.
                  </p>
                </div>

                <form onSubmit={handleCreateCMSCredentialSubmit} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., John Doe"
                        value={credFullName}
                        onChange={e => setCredFullName(e.target.value)}
                        onInvalid={(e) => {
                          setCredFullName('');
                          e.currentTarget.value = '';
                          e.currentTarget.placeholder = '';
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Administrative Title / Job Role</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Lead Analyst / Solar Analyst"
                        value={credTitle}
                        onChange={e => setCredTitle(e.target.value)}
                        onInvalid={(e) => {
                          setCredTitle('');
                          e.currentTarget.value = '';
                          e.currentTarget.placeholder = '';
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="operator@example.com"
                        value={credEmail}
                        onChange={e => setCredEmail(e.target.value)}
                        onInvalid={(e) => {
                          setCredEmail('');
                          e.currentTarget.value = '';
                          e.currentTarget.placeholder = '';
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Initial Account Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={credPassword}
                        onChange={e => setCredPassword(e.target.value)}
                        onInvalid={(e) => {
                          setCredPassword('');
                          e.currentTarget.value = '';
                          e.currentTarget.placeholder = '';
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">RBAC Access Privilege Role</label>
                      <select
                        value={credRole}
                        onChange={e => setCredRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      >
                        <option value="viewer">Viewer (Read-Only CRM)</option>
                        <option value="editor">Editor (Write Blog, Review Social Proof)</option>
                        <option value="admin">Admin (Full System Privilege)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">CMS Access Code / Key</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="E.g., NURU-XXXX-XXXX"
                          value={credAccessCode}
                          onChange={e => setCredAccessCode(e.target.value.toUpperCase())}
                          onInvalid={(e) => {
                            setCredAccessCode('');
                            e.currentTarget.value = '';
                            e.currentTarget.placeholder = '';
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={handleAutoGenerateCode}
                          className="px-4 py-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          <span>Auto Generate</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isCreatingCred}
                      className="px-6 py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingCred ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>Create & Provision Credentials</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sub-tab 2: Authorized Access Keys Table */}
            {subRolesTab === 'list' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in space-y-4">
                <div className="p-6 md:p-8 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">CMS Admin — Active Access Credentials</h3>
                  <p className="text-xs text-slate-500 font-medium border-b border-slate-100 pb-2">
                    Authorized operators with active access keys can bypass registration steps to immediately authenticate and sign in to the CMS administrative portal.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="py-4 px-6">Name / Title</th>
                        <th className="py-4 px-4">Email Address</th>
                        <th className="py-4 px-4">Password</th>
                        <th className="py-4 px-4">CMS Access Key</th>
                        <th className="py-4 px-4">Assigned Privilege</th>
                        <th className="py-4 px-4">Expires At</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {cmsCredentials.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            No custom secure credentials found. Use the "Generate New Credentials" tab to create one.
                          </td>
                        </tr>
                      ) : (
                        cmsCredentials.map((cred) => (
                          <tr key={cred.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{cred.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{cred.title}</div>
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-600 font-medium">
                              {cred.email}
                            </td>
                            <td className="py-4 px-4 font-mono text-[11px]">
                              {(() => {
                                const passVal = cred.passwordPlain || 'NuruGrowth2026!';
                                const isVisible = showPasswordIds[cred.id] || false;
                                return (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg font-mono font-bold text-[11px] flex items-center gap-1 shadow-xs">
                                      <Lock className="w-3 h-3 text-blue-600" />
                                      <span>{isVisible ? passVal : '••••••••••••'}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setShowPasswordIds(prev => ({ ...prev, [cred.id]: !prev[cred.id] }))}
                                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                      title={isVisible ? 'Hide Password' : 'Show Password'}
                                    >
                                      {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPassword(passVal, cred.fullName)}
                                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                      title="Copy Password"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="py-4 px-4 font-mono text-[11px]">
                              {cred.email.toLowerCase() === 'admin@example.com' || cred.accessKeyPlain ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg font-mono font-bold text-[11px] flex items-center gap-1">
                                    <Key className="w-3 h-3 text-amber-600" />
                                    <span>{cred.accessKeyPlain || 'NURU-ADMIN-2026'}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyAccessKey(cred.accessKeyPlain || 'NURU-ADMIN-2026', cred.fullName)}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                    title="Copy Access Code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-mono font-bold text-[11px] flex items-center gap-1">
                                    <Key className="w-3 h-3 text-slate-500" />
                                    <span>Protected Code</span>
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-full font-bold text-[10px] uppercase tracking-wider">
                                {cred.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-500 font-mono text-[10px]">
                              {new Date(cred.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-4 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleCMSCredentialStatus(cred)}
                                className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                                  cred.status === 'Active'
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {cred.status}
                              </button>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {cred.email.toLowerCase() !== 'admin@example.com' ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCMSCredential(cred)}
                                  className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                                  title="Revoke and Delete Credentials"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Default Root</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Legacy Pre-assigned Operators */}
            {subRolesTab === 'legacy' && (
              <div className="space-y-4">
                {/* Form to Invite / Pre-register Team Members */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 animate-fade-in space-y-4">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Add Pre-assigned Operator</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Pre-allocate permission roles and access keys for standard operator accounts before they undergo the sign-up process.
                    </p>
                  </div>

                  <form onSubmit={handleInviteUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                        onInvalid={(e) => {
                          setNewUserEmail('');
                          e.currentTarget.value = '';
                          e.currentTarget.placeholder = '';
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Operator Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="E.g., John Doe"
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                        onInvalid={(e) => {
                          setNewUserName('');
                          e.currentTarget.value = '';
                          e.currentTarget.placeholder = '';
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Access Privilege Role</label>
                      <select
                        value={newUserRole}
                        onChange={e => setNewUserRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                      >
                        <option value="viewer">Viewer (Read-Only CRM)</option>
                        <option value="editor">Editor (Write Blog, Review Social Proof)</option>
                        <option value="admin">Admin (Full System Privilege)</option>
                      </select>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={isAddingUser}
                        className="w-full py-3 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isAddingUser ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                        <span>Pre-assign Role</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-6 md:p-8 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900">Registered Team Profiles & Members</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Standard operator accounts registered through invitation codes. Manage permissions, roles, and revoke capabilities.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <th className="py-4 px-6">Team Member</th>
                          <th className="py-4 px-4">Email Node</th>
                          <th className="py-4 px-4">Login Password</th>
                          <th className="py-4 px-4">CMS Access Key</th>
                          <th className="py-4 px-4">Authorized Access Role</th>
                          <th className="py-4 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {usersList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                              No pre-registered operators found.
                            </td>
                          </tr>
                        ) : (
                          usersList.map((user) => (
                            <tr key={user.uid} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-6">
                                <div className="font-bold text-slate-900">{user.displayName || 'Unnamed Operator'}</div>
                              </td>
                              <td className="py-4 px-4 font-mono text-slate-600 font-medium">
                                {user.email}
                              </td>
                              <td className="py-4 px-4 font-mono text-[11px]">
                                {(() => {
                                  const isOwner = user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
                                  const passVal = 'NuruGrowth2026!';
                                  const isVisible = showPasswordIds[user.uid] || false;
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-2.5 py-1 border rounded-lg font-mono font-bold text-[11px] flex items-center gap-1 shadow-xs ${
                                        isOwner 
                                          ? 'bg-purple-50 border-purple-200 text-purple-900' 
                                          : 'bg-blue-50 border-blue-200 text-blue-900'
                                      }`}>
                                        <Lock className={`w-3 h-3 ${isOwner ? 'text-purple-600' : 'text-blue-600'}`} />
                                        <span>{isVisible ? passVal : '••••••••••••'}</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setShowPasswordIds(prev => ({ ...prev, [user.uid]: !prev[user.uid] }))}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title={isVisible ? 'Hide Password' : 'Show Password'}
                                      >
                                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPassword(passVal, user.displayName || user.email)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Copy Password"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-4 font-mono text-[11px]">
                                {(() => {
                                  const isOwner = user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
                                  const key = user.accessKey || (isOwner ? 'NURU-OWNR-2026' : '');
                                  if (key) {
                                    return (
                                      <div className="flex items-center gap-1.5">
                                        <span className={`px-2.5 py-1 border rounded-lg font-mono font-bold text-[11px] flex items-center gap-1 shadow-xs ${
                                          isOwner 
                                            ? 'bg-purple-50 border-purple-200 text-purple-900' 
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                        }`}>
                                          <Key className={`w-3 h-3 ${isOwner ? 'text-purple-600' : 'text-emerald-600'}`} />
                                          <span>{key}</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleCopyAccessKey(key, user.displayName || user.email)}
                                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                          title="Copy Key Access Code"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleAssignUserKey(user)}
                                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                          title="Regenerate/Assign Key Access Code"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => handleAssignUserKey(user)}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                      >
                                        <Key className="w-3 h-3" />
                                        <span>Assign Key Code</span>
                                      </button>
                                    );
                                  }
                                })()}
                              </td>
                              <td className="py-4 px-4">
                                <select
                                  value={user.role}
                                  onChange={async (e) => {
                                    const newRole = e.target.value as UserRole;
                                    try {
                                      await updateUserRole(user.uid, newRole);
                                      showSuccess('Role Updated', `Privileges for ${user.displayName || user.email} updated to ${newRole}.`);
                                    } catch (err: any) {
                                      showError('Action Failed', `Could not change user privileges: ${err.message}`);
                                    }
                                  }}
                                  disabled={user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 disabled:opacity-50"
                                >
                                  <option value="viewer">Viewer (Read-Only CRM)</option>
                                  <option value="editor">Editor (Write Blog, Review Social Proof)</option>
                                  <option value="admin">Admin (Full System Privilege)</option>
                                </select>
                              </td>
                              <td className="py-4 px-4 text-center">
                                {user.email.toLowerCase() !== PRIMARY_ADMIN_EMAIL.toLowerCase() ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(user)}
                                    className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                                    title="Revoke and Delete Access"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Owner Account</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: CMS Security Audit Trail */}
            {subRolesTab === 'audit' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in space-y-4">
                <div className="p-6 md:p-8 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">CMS Security Audit Trail & Access Logs</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review real-time security events, administrator creation records, successful sign-ins, and failed login lockouts.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-4">Security Action</th>
                        <th className="py-4 px-4">Operator Email</th>
                        <th className="py-4 px-4">Target Email</th>
                        <th className="py-4 px-4">Detailed Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {cmsAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No security audit records logged yet.
                          </td>
                        </tr>
                      ) : (
                        cmsAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black font-mono uppercase tracking-wider ${
                                log.action === 'LOGIN_SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.action === 'LOGIN_FAILED'
                                  ? 'bg-rose-100 text-rose-800 animate-pulse'
                                  : log.action === 'CREATE_CREDENTIAL'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-700 font-bold">{log.operatorEmail}</td>
                            <td className="py-4 px-4 text-slate-500">{log.targetEmail}</td>
                            <td className="py-4 px-4 text-slate-600 font-normal leading-relaxed">{log.details}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      


{/* ========================================== */}
        {/* MODAL: BLOG EDITOR                        */}
        {/* ========================================== */}
        <AnimatePresence>
          {isEditorOpen && editingPost && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                onClick={() => setIsEditorOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-3xl h-full bg-white shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900">
                    {editingPost.id ? 'Edit Research Article' : 'Draft New Article'}
                  </h3>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePost} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                  {postFeedback && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-sm text-emerald-800 font-medium leading-relaxed">{postFeedback}</p>
                    </div>
                  )}

                  {/* Core Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Headline</label>
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Executive Summary</label>
                      <textarea
                        rows={2}
                        value={editingPost.summary}
                        onChange={e => setEditingPost({...editingPost, summary: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category Tag</label>
                        <input
                          type="text"
                          value={editingPost.tag}
                          onChange={e => setEditingPost({...editingPost, tag: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cover Image URL</label>
                        <input
                          type="text"
                          value={editingPost.img}
                          onChange={e => setEditingPost({...editingPost, img: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <div className="flex items-center gap-4 mt-2">
                          <div className="relative">
                            <input type="file" accept="image/*" onChange={handleBlogImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Upload Image" />
                            <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                              <Image className="w-4 h-4" />
                              <span>Upload Image</span>
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400">Or paste URL above. Uploads convert to base64.</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Blog Format / Layout</label>
                        <select
                          value={editingPost.format || 'standard'}
                          onChange={e => setEditingPost({...editingPost, format: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                          <option value="standard">Standard Article Layout</option>
                          <option value="case-study">Case Study Highlight</option>
                          <option value="brief">Executive Briefing</option>
                          <option value="technical">Technical Report</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule Publication (Optional)</label>
                        <input
                          type="datetime-local"
                          value={editingPost.scheduledFor ? editingPost.scheduledFor.substring(0, 16) : ''}
                          onChange={e => setEditingPost({...editingPost, scheduledFor: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <span className="text-[9px] text-slate-400 mt-1 block">Leave empty to publish immediately.</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Content Blocks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytical Content Blocks</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingPost({
                            ...editingPost,
                            fullContent: [...(editingPost.fullContent || []), '']
                          })}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Text Block</span>
                        </button>
                        
                        <label className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 cursor-pointer">
                          <Image className="w-3.5 h-3.5" />
                          <span>Add Image Block</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const newIndex = (editingPost.fullContent || []).length;
                              setEditingPost({
                                ...editingPost,
                                fullContent: [...(editingPost.fullContent || []), '']
                              });
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setEditingPost(prev => {
                                      if (!prev) return prev;
                                      const updated = [...(prev.fullContent || [])];
                                      updated[newIndex] = event.target.result as string;
                                      return { ...prev, fullContent: updated };
                                    });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {(editingPost.fullContent || []).map((paragraph, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-2">
                          {index + 1}
                        </div>
                        
                        {paragraph.startsWith('data:image/') ? (
                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center relative">
                            <img src={paragraph} alt="Inline Content" className="max-h-32 object-contain rounded-lg border border-slate-200" />
                          </div>
                        ) : (
                          <textarea
                            rows={3}
                            placeholder={`Paragraph ${index + 1} content or analytical insight...`}
                            value={paragraph}
                            onChange={(e) => {
                              const updated = [...(editingPost.fullContent || [])];
                              updated[index] = e.target.value;
                              setEditingPost({ ...editingPost, fullContent: updated });
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"
                          />
                        )}
                        {(editingPost.fullContent || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingPost.fullContent || []).filter((_, i) => i !== index);
                            setEditingPost({ ...editingPost, fullContent: updated });
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors mt-2 cursor-pointer"
                          title="Remove block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Publication Status & Featured Controls */}
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/60">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="radio"
                        name="status"
                        checked={editingPost.status === 'published'}
                        onChange={() => setEditingPost({ ...editingPost, status: 'published' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Published (Live)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="radio"
                        name="status"
                        checked={editingPost.status === 'draft'}
                        onChange={() => setEditingPost({ ...editingPost, status: 'draft' })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Draft Only</span>
                    </label>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={!!editingPost.featured}
                      onChange={(e) => setEditingPost({ ...editingPost, featured: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Highlight as Featured Article</span>
                  </label>
                </div>

                {/* Submit Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{editingPost.status === 'published' ? 'Publish to Live Blog' : 'Save as Draft'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* POLITE WELCOME LETTER VIEWER MODAL          */}
      {/* ========================================== */}
      <AnimatePresence>
        {viewingSubscriberLetter && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingSubscriberLetter(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden my-8 z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-6 md:p-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">
                      Dispatched Institutional Letter
                    </div>
                    <h3 className="text-lg md:text-xl font-black tracking-tight">
                      Automated Welcome & Confirmation Dispatch
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setViewingSubscriberLetter(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Letter Envelope Summary */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">To:</span>
                  <span className="font-bold font-mono text-slate-900">{viewingSubscriberLetter.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subject:</span>
                  <span className="font-bold text-slate-900">Acknowledging Your Clean Energy Initiative — Welcome to NuruGrowth</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Registered:</span>
                  <span className="text-slate-700 font-mono text-[11px]">
                    {new Date(viewingSubscriberLetter.createdAt).toLocaleString()} ({viewingSubscriberLetter.sourceLabel || viewingSubscriberLetter.source})
                  </span>
                </div>
              </div>

              {/* Formatted Letter Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-serif bg-slate-50/30">
                <div className="border border-slate-200/90 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-black text-blue-600 tracking-wider uppercase text-xs">NuruGrowth Strategic Advisory</span>
                    <span className="text-[10px] font-mono text-slate-400">Nairobi, Kenya</span>
                  </div>

                  <p className="font-bold text-slate-900">
                    Dear {viewingSubscriberLetter.name || 'Clean Energy Executive'},
                  </p>

                  <p className="text-slate-600">
                    On behalf of the leadership and research desk at <strong>NuruGrowth</strong>, thank you for sharing your contact information and connecting with our platform. We are delighted to welcome you to our strategic ecosystem.
                  </p>

                  <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1 text-xs">
                    <div className="text-[10px] font-black uppercase tracking-wider text-blue-900">Action Acknowledged</div>
                    <p className="text-blue-950 font-medium">
                      Your recent engagement regarding <strong>{viewingSubscriberLetter.sourceLabel || 'NuruGrowth Solar Intelligence'}</strong> has been registered under record reference <code>{viewingSubscriberLetter.id}</code>.
                    </p>
                  </div>

                  <p className="text-slate-600">
                    Our team is deeply committed to engineering commercial dignity and scalable growth for clean energy innovators across East Africa. Whether you are scaling commercial rooftop installations, mini-grids, or agricultural solar assets, our regional benchmarks and analytical frameworks are designed to support your strategic trajectory.
                  </p>

                  <p className="text-slate-600">
                    Should you require immediate technical consultation, customized CAC modeling, or strategic partner introduction, our founder and advisory principals remain at your service at <a href="mailto:hello@nurugrowth.com" className="text-blue-600 font-bold underline">hello@nurugrowth.com</a>.
                  </p>

                  <div className="pt-4 border-t border-slate-100 space-y-1">
                    <p className="font-bold text-slate-900 text-xs">With our warmest regards and highest esteem,</p>
                    <p className="font-black text-slate-900 text-sm">Moses Mutuma</p>
                    <p className="text-[11px] text-slate-500">Founder & Principal Strategist, NuruGrowth</p>
                    <p className="text-[10px] text-slate-400 font-mono">Nairobi, Kenya • <a href="https://nurugrowth.com" className="hover:underline text-blue-600">nurugrowth.com</a></p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="text-[10px] text-slate-400 font-mono">
                  Status: <span className="text-emerald-600 font-bold">Successfully Dispatched & Acknowledged</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleResendWelcomeEmail(viewingSubscriberLetter);
                    }}
                    disabled={resendingEmailId === viewingSubscriberLetter.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {resendingEmailId === viewingSubscriberLetter.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Re-send Welcome Letter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingSubscriberLetter(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {deleteModalState.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {deleteModalState.message}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4 text-xs text-red-800 font-medium leading-relaxed">
                <strong>Warning:</strong> This action is permanent. The record will be permanently deleted from Firestore.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
                  disabled={isDeletingItem}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmExecuteDelete}
                  disabled={isDeletingItem}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingItem ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
};

export default CMSAdmin;
