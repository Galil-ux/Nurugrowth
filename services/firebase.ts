import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  getDocFromServer
} from 'firebase/firestore';
import { AppUser, BlogPost, BlogComment, BlogPostStatus, QuoteRequest, QuoteStatus, UserRole, EmailSubscriber, EmailSubscriberSource, SiteSettings, AppReview, ReviewStatus, CMSCredential, CMSAuditLog } from '../types';
import { BLOG_POSTS, INITIAL_BLOG_COMMENTS } from '../constants';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with long-polling autodetect to prevent proxy streaming timeouts in sandbox containers
function createFirestoreInstance() {
  const dbId = firebaseConfig.firestoreDatabaseId || undefined;
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    }, dbId);
  } catch (e) {
    // If already initialized, get instance
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = createFirestoreInstance();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Primary project admin email
export const PRIMARY_ADMIN_EMAIL = 'mosemirano6538@gmail.com';

// Standard Firestore Error Handling per Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore running in offline/cache mode until connection completes.");
    }
  }
}
testConnection().catch(() => {});

/**
 * Ensures user profile and role exists in Firestore `users/{uid}`
 */
export async function syncUserProfile(firebaseUser: FirebaseUser, requestedRole?: UserRole): Promise<AppUser> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const isPrimary = firebaseUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data() as AppUser;
      const updates: Partial<AppUser> = { lastLogin: new Date().toISOString() };
      let hasUpdates = false;

      // Enforce admin for primary admin email
      if (isPrimary && existing.role !== 'admin') {
        updates.role = 'admin';
        hasUpdates = true;
      }
      // Enforce access key for owner and team members
      if (!existing.accessKey || existing.accessKey === 'none') {
        updates.accessKey = generateUniqueAccessKey();
        hasUpdates = true;
      }

      if (hasUpdates) {
        await updateDoc(userRef, updates);
        return { ...existing, ...updates };
      }
      return existing;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
  }

  // If the real UID doc does not exist yet, let's see if there is a pre-assigned record for this email!
  let assignedRole: UserRole | undefined = requestedRole;
  let assignedName: string | undefined = firebaseUser.displayName;
  let accessKey: string | undefined = undefined;
  
  if (firebaseUser.email) {
    const preAssignedDocId = `pre_assigned_${firebaseUser.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const preAssignedRef = doc(db, 'users', preAssignedDocId);
    try {
      const preSnap = await getDoc(preAssignedRef);
      if (preSnap.exists()) {
        const preData = preSnap.data() as AppUser;
        assignedRole = preData.role;
        assignedName = preData.displayName || assignedName;
        accessKey = preData.accessKey;
        // Delete the pre-assigned invite doc since we are migrating it to the real UID doc ID
        await deleteDoc(preAssignedRef);
      }
    } catch (err) {
      // Silently catch/ignore pre-assigned read issues
    }
  }

  // Create initial user profile
  const role: UserRole = isPrimary ? 'admin' : (assignedRole || 'viewer');
  const newUser: AppUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || (firebaseUser.isAnonymous ? 'guest.admin@nurugrowth.lab' : 'user@nurugrowth.com'),
    displayName: assignedName || (isPrimary ? 'Moses Mutuma (Admin)' : (firebaseUser.isAnonymous ? 'Demo Admin' : 'Solar Operator')),
    role,
    accessKey: accessKey || generateUniqueAccessKey(),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  try {
    await setDoc(userRef, newUser);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
  }
  return newUser;
}

/**
 * Seed initial blog posts to Firestore if collection is empty
 */
export async function seedInitialBlogDataIfEmpty() {
  try {
    const postsRef = collection(db, 'blog_posts');
    const snap = await getDocs(postsRef);
    if (snap.empty) {
      for (const post of BLOG_POSTS) {
        await setDoc(doc(db, 'blog_posts', post.id), {
          ...post,
          status: 'published',
          featured: post.id === 'epc-benchmarks',
          views: Math.floor(Math.random() * 400) + 120,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      for (const comment of INITIAL_BLOG_COMMENTS) {
        await setDoc(doc(db, 'blog_comments', comment.id), {
          ...comment,
          createdAt: comment.createdAt || new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('Initial seeding note (using memory cache):', err);
  }
}

// Call seed once on module load
seedInitialBlogDataIfEmpty().catch(() => {});

// ==========================================
// BLOG POSTS CRUD
// ==========================================

export function subscribeBlogPosts(callback: (posts: BlogPost[]) => void) {
  const postsRef = collection(db, 'blog_posts');
  return onSnapshot(postsRef, (snapshot) => {
    if (snapshot.empty) {
      // Fallback to constants if DB not populated yet
      callback(BLOG_POSTS.map(p => ({ ...p, status: 'published' })));
    } else {
      const posts: BlogPost[] = [];
      snapshot.forEach((docSnap) => {
        posts.push({ id: docSnap.id, ...(docSnap.data() as Omit<BlogPost, 'id'>) });
      });
      // Sort newest first
      posts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
      });
      callback(posts);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'blog_posts');
    callback(BLOG_POSTS.map(p => ({ ...p, status: 'published' })));
  });
}

export async function saveBlogPost(post: Partial<BlogPost> & { id?: string }): Promise<string> {
  const now = new Date().toISOString();
  
  if (post.id) {
    const postDoc = doc(db, 'blog_posts', post.id);
    try {
      const existingSnap = await getDoc(postDoc);
      if (existingSnap.exists()) {
        await updateDoc(postDoc, {
          ...post,
          updatedAt: now
        });
        return post.id;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `blog_posts/${post.id}`);
    }
  }

  // Generate ID / Slug
  const docId = post.slug || (post.title ? post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `post-${Date.now()}`);
  const postDoc = doc(db, 'blog_posts', docId);
  
  const newPostData = {
    title: post.title || 'Untitled Research Briefing',
    tag: post.tag || 'RESEARCH',
    date: post.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
    readTime: post.readTime || '4 min read',
    author: post.author || 'Moses Mutuma',
    authorRole: post.authorRole || 'Founder & Principal Strategist, NuruGrowth',
    summary: post.summary || '',
    img: post.img || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800',
    fullContent: post.fullContent && post.fullContent.length > 0 ? post.fullContent : [post.summary || ''],
    status: post.status || 'published',
    featured: post.featured || false,
    views: post.views || 0,
    createdAt: post.createdAt || now,
    updatedAt: now
  };

  try {
    await setDoc(postDoc, newPostData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `blog_posts/${docId}`);
  }
  return docId;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const postDoc = doc(db, 'blog_posts', id);
  try {
    await deleteDoc(postDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `blog_posts/${id}`);
  }
}

export async function toggleBlogPostStatus(id: string, currentStatus: BlogPostStatus): Promise<void> {
  const nextStatus: BlogPostStatus = currentStatus === 'published' ? 'draft' : 'published';
  const postDoc = doc(db, 'blog_posts', id);
  try {
    await updateDoc(postDoc, {
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `blog_posts/${id}`);
  }
}

// ==========================================
// CLIENT ONBOARDING & QUOTE REQUESTS CRUD
// ==========================================

export async function submitQuoteRequest(data: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const quotesRef = collection(db, 'quote_requests');
  const now = new Date().toISOString();
  try {
    const quoteDoc = await addDoc(quotesRef, {
      ...data,
      status: 'new',
      adminNotes: '',
      createdAt: now
    });
    return quoteDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'quote_requests');
    return `quote-fallback-${Date.now()}`;
  }
}

export function subscribeQuoteRequests(callback: (quotes: QuoteRequest[]) => void) {
  const quotesRef = collection(db, 'quote_requests');
  return onSnapshot(quotesRef, (snapshot) => {
    const quotes: QuoteRequest[] = [];
    snapshot.forEach((docSnap) => {
      quotes.push({ id: docSnap.id, ...(docSnap.data() as Omit<QuoteRequest, 'id'>) });
    });
    // Sort newest first
    quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(quotes);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'quote_requests');
  });
}

export async function updateQuoteStatus(id: string, status: QuoteStatus, adminNotes?: string): Promise<void> {
  const quoteDoc = doc(db, 'quote_requests', id);
  const updates: Record<string, any> = { status };
  if (adminNotes !== undefined) {
    updates.adminNotes = adminNotes;
  }
  try {
    await updateDoc(quoteDoc, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `quote_requests/${id}`);
  }
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  const quoteDoc = doc(db, 'quote_requests', id);
  try {
    await deleteDoc(quoteDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `quote_requests/${id}`);
  }
}

// ==========================================
// COMMENTS CRUD
// ==========================================

export function subscribeBlogComments(postId: string, callback: (comments: BlogComment[]) => void) {
  const commentsRef = collection(db, 'blog_comments');
  const q = query(commentsRef, where('postId', '==', postId));
  return onSnapshot(q, (snapshot) => {
    const comments: BlogComment[] = [];
    snapshot.forEach((docSnap) => {
      comments.push({ id: docSnap.id, ...(docSnap.data() as Omit<BlogComment, 'id'>) });
    });
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(comments);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `blog_comments?postId=${postId}`);
    // fallback to initial comments in constants matching postId
    callback(INITIAL_BLOG_COMMENTS.filter(c => c.postId === postId));
  });
}

export async function addBlogComment(comment: Omit<BlogComment, 'id' | 'createdAt' | 'likes'>): Promise<string> {
  const commentsRef = collection(db, 'blog_comments');
  const newComment = {
    ...comment,
    likes: 0,
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(commentsRef, newComment);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'blog_comments');
    return `comment-fallback-${Date.now()}`;
  }
}

export async function deleteBlogComment(id: string): Promise<void> {
  const commentDoc = doc(db, 'blog_comments', id);
  try {
    await deleteDoc(commentDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `blog_comments/${id}`);
  }
}

// ==========================================
// USERS & RBAC MANAGEMENT
// ==========================================

export function subscribeUsers(callback: (users: AppUser[]) => void) {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const users: AppUser[] = [];
    snapshot.forEach((docSnap) => {
      users.push(docSnap.data() as AppUser);
    });
    callback(users);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'users');
  });
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const userDoc = doc(db, 'users', uid);
  try {
    await updateDoc(userDoc, { role });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function assignUserAccessKey(uid: string, customKey?: string): Promise<string> {
  const userDoc = doc(db, 'users', uid);
  const keyToAssign = customKey || generateUniqueAccessKey();
  try {
    await updateDoc(userDoc, { accessKey: keyToAssign });
    return keyToAssign;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}

function generateUniqueAccessKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'NURU-';
  for (let i = 0; i < 4; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  key += '-';
  for (let i = 0; i < 4; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export async function inviteUserOrSetRole(email: string, displayName: string, role: UserRole): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  const docId = `pre_assigned_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  
  let accessKey = generateUniqueAccessKey();
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    attempts++;
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('accessKey', '==', accessKey));
      const snap = await getDocs(q);
      if (snap.empty) {
        isUnique = true;
      } else {
        accessKey = generateUniqueAccessKey();
      }
    } catch (e) {
      isUnique = true;
    }
  }

  const userRef = doc(db, 'users', docId);
  const newUser: AppUser = {
    uid: docId,
    email: cleanEmail,
    displayName: displayName.trim() || 'Invited Team Member',
    role,
    accessKey,
    createdAt: new Date().toISOString(),
    lastLogin: ''
  };
  try {
    await setDoc(userRef, newUser);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${docId}`);
  }
  return accessKey;
}

export async function deleteUserRecord(uid: string): Promise<void> {
  const userDoc = doc(db, 'users', uid);
  try {
    await deleteDoc(userDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
  }
}

export async function markUserPasswordChanged(uid: string): Promise<void> {
  const userDoc = doc(db, 'users', uid);
  try {
    await updateDoc(userDoc, { passwordChanged: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

// ==========================================
// EMAIL SUBSCRIBERS & WELCOME DISPATCH
// ==========================================

export async function submitSubscriberEmail(data: {
  email: string;
  name?: string;
  companyName?: string;
  source: EmailSubscriberSource;
  sourceLabel: string;
  country?: string;
}): Promise<{ id: string; emailResult?: any }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const subscribersRef = collection(db, 'email_subscribers');
  const now = new Date().toISOString();

  let welcomeEmailData: any = null;

  // Trigger server welcome email generator
  try {
    const res = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        name: data.name,
        companyName: data.companyName,
        source: data.source,
        sourceLabel: data.sourceLabel
      })
    });
    if (res.ok) {
      welcomeEmailData = await res.json();
    }
  } catch (err) {
    console.warn('Welcome email API notice (local dispatch log recorded):', err);
  }

  const newSubscriber: Omit<EmailSubscriber, 'id'> = {
    email: cleanEmail,
    name: data.name?.trim() || '',
    companyName: data.companyName?.trim() || '',
    source: data.source,
    sourceLabel: data.sourceLabel,
    country: data.country || 'Kenya',
    welcomeEmailSent: true,
    welcomeEmailSentAt: now,
    welcomeEmailSubject: welcomeEmailData?.subject || 'Welcome to NuruGrowth | Confirming Receipt of Your Submission',
    welcomeEmailBody: welcomeEmailData?.body || `Dear ${data.name || 'Valued Partner'},\n\nThank you for reaching out to NuruGrowth. We have safely received your submission and our strategic energy team is reviewing your details.\n\nWarm regards,\nMoses Mutuma\nNuruGrowth Lab`,
    createdAt: now
  };

  try {
    const docRef = await addDoc(subscribersRef, newSubscriber);
    return { id: docRef.id, emailResult: welcomeEmailData };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'email_subscribers');
    return { id: `sub-fallback-${Date.now()}`, emailResult: welcomeEmailData };
  }
}

export function subscribeEmailSubscribers(callback: (subscribers: EmailSubscriber[]) => void) {
  const subscribersRef = collection(db, 'email_subscribers');
  return onSnapshot(subscribersRef, (snapshot) => {
    const subscribers: EmailSubscriber[] = [];
    snapshot.forEach((docSnap) => {
      subscribers.push({ id: docSnap.id, ...(docSnap.data() as Omit<EmailSubscriber, 'id'>) });
    });
    // Sort newest first
    subscribers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(subscribers);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'email_subscribers');
  });
}

export async function resendWelcomeEmail(subscriber: EmailSubscriber): Promise<any> {
  const now = new Date().toISOString();
  try {
    const res = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: subscriber.email,
        name: subscriber.name,
        companyName: subscriber.companyName,
        source: subscriber.source,
        sourceLabel: subscriber.sourceLabel
      })
    });
    const data = await res.json();
    
    // Update subscriber record
    if (subscriber.id && !subscriber.id.startsWith('sub-fallback')) {
      const subDoc = doc(db, 'email_subscribers', subscriber.id);
      await updateDoc(subDoc, {
        welcomeEmailSent: true,
        welcomeEmailSentAt: now,
        welcomeEmailSubject: data.subject || subscriber.welcomeEmailSubject,
        welcomeEmailBody: data.body || subscriber.welcomeEmailBody
      });
    }
    return data;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `email_subscribers/${subscriber.id}`);
    throw err;
  }
}

export async function deleteEmailSubscriber(id: string): Promise<void> {
  const subDoc = doc(db, 'email_subscribers', id);
  try {
    await deleteDoc(subDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `email_subscribers/${id}`);
  }
}

// ==========================================
// SITE SETTINGS
// ==========================================
export function subscribeSiteSettings(callback: (settings: SiteSettings | null) => void) {
  const docRef = doc(db, 'site_settings', 'main');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as SiteSettings);
    } else {
      callback(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'site_settings');
  });
}

export async function saveSiteSettings(settings: Omit<SiteSettings, 'id' | 'updatedAt'>): Promise<void> {
  const docRef = doc(db, 'site_settings', 'main');
  const now = new Date().toISOString();
  try {
    await setDoc(docRef, { ...settings, updatedAt: now }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'site_settings');
    throw err;
  }
}

// ==========================================
// APP REVIEWS (SOCIAL PROOF)
// ==========================================
export function subscribeAppReviews(callback: (reviews: AppReview[]) => void, onlyApproved = false) {
  const reviewsRef = collection(db, 'app_reviews');
  let q = query(reviewsRef);
  if (onlyApproved) {
    q = query(reviewsRef, where('status', '==', 'approved'));
  }
  
  return onSnapshot(q, (snapshot) => {
    const reviews: AppReview[] = [];
    snapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...docSnap.data() } as AppReview);
    });
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(reviews);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'app_reviews');
  });
}

export async function submitAppReview(review: Omit<AppReview, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const reviewsRef = collection(db, 'app_reviews');
  const now = new Date().toISOString();
  try {
    const docRef = await addDoc(reviewsRef, { ...review, status: 'pending', createdAt: now });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'app_reviews');
    throw err;
  }
}

export async function updateAppReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const docRef = doc(db, 'app_reviews', id);
  try {
    await updateDoc(docRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `app_reviews/${id}`);
    throw err;
  }
}

export async function deleteAppReview(id: string): Promise<void> {
  const docRef = doc(db, 'app_reviews', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `app_reviews/${id}`);
    throw err;
  }
}

// ============================================================================
// CMS SECURE ACCESS CREDENTIALS & AUDIT LOGGING
// ============================================================================

export async function secureHash(text: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(text + '_nurugrowth_salt_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (e) {
    console.warn('Crypto subtle not available, using fallback hashing');
  }
  // Fallback deterministic hashing
  let hash = 0;
  const salted = text + '_nurugrowth_salt_2026';
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'FBH-' + Math.abs(hash).toString(16) + '-' + salted.length;
}

export async function addCMSAuditLog(action: string, operatorEmail: string, targetEmail: string, details: string): Promise<void> {
  const logsRef = collection(db, 'cms_audit_logs');
  const now = new Date().toISOString();
  try {
    await addDoc(logsRef, {
      timestamp: now,
      action,
      operatorEmail,
      targetEmail,
      details
    });
  } catch (e) {
    console.warn('Could not record audit log:', e);
  }
}

export async function ensureDefaultCMSCredentials(): Promise<void> {
  try {
    const credsRef = collection(db, 'cms_credentials');
    const q = query(credsRef, where('email', '==', 'admin@example.com'));
    const snap = await getDocs(q);
    if (snap.empty) {
      const passHash = await secureHash('NuruGrowth2026!');
      const keyHash = await secureHash('NURU-ADMIN-2026');
      
      const defaultCred: Omit<CMSCredential, 'id'> = {
        fullName: 'John Doe',
        title: 'Lead Administrator',
        email: 'admin@example.com',
        passwordHash: passHash,
        accessKey: keyHash,
        role: 'admin',
        status: 'Active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        createdAt: new Date().toISOString(),
        failedLogins: 0,
        lockedUntil: null
      };
      
      await addDoc(credsRef, defaultCred);
      await addCMSAuditLog(
        'CREATE_CREDENTIAL',
        'SYSTEM',
        'admin@example.com',
        'Default root CMS Admin credentials provisioned successfully.'
      );
    }
  } catch (err) {
    console.warn('ensureDefaultCMSCredentials note:', err);
  }
}

export async function createCMSCredential(
  operatorEmail: string, 
  cred: Omit<CMSCredential, 'id' | 'passwordHash' | 'failedLogins' | 'lockedUntil'> & { passwordPlain: string }
): Promise<void> {
  const credsRef = collection(db, 'cms_credentials');
  
  // 1. Verify email uniqueness
  const emailQuery = query(credsRef, where('email', '==', cred.email.trim().toLowerCase()));
  const emailSnap = await getDocs(emailQuery);
  if (!emailSnap.empty) {
    throw new Error('A credential record already exists with this Email Address.');
  }
  
  // 2. Hash access code and verify uniqueness
  const keyHash = await secureHash(cred.accessKey.trim());
  const keyQuery = query(credsRef, where('accessKey', '==', keyHash));
  const keySnap = await getDocs(keyQuery);
  if (!keySnap.empty) {
    throw new Error('This Access Code is already in use. Please generate or enter a unique code.');
  }
  
  // 3. Hash password and save doc
  const passHash = await secureHash(cred.passwordPlain.trim());
  const newCred: Omit<CMSCredential, 'id'> = {
    fullName: cred.fullName.trim(),
    title: cred.title.trim(),
    email: cred.email.trim().toLowerCase(),
    passwordHash: passHash,
    accessKey: keyHash,
    role: cred.role,
    status: cred.status,
    expiresAt: cred.expiresAt,
    createdAt: new Date().toISOString(),
    failedLogins: 0,
    lockedUntil: null
  };
  
  await addDoc(credsRef, newCred);
  await addCMSAuditLog(
    'CREATE_CREDENTIAL',
    operatorEmail,
    cred.email.trim().toLowerCase(),
    `Credential created successfully with role "${cred.role.toUpperCase()}" and status "${cred.status}".`
  );
}

export async function validateCMSCredential(
  email: string, 
  passwordPlain: string, 
  accessCodePlain: string
): Promise<Omit<CMSCredential, 'passwordHash' | 'accessKey'>> {
  const cleanEmail = email.trim().toLowerCase();
  const credsRef = collection(db, 'cms_credentials');
  const q = query(credsRef, where('email', '==', cleanEmail));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    await addCMSAuditLog('LOGIN_FAILED', 'UNKNOWN', cleanEmail, 'Authentication failed: Email not found.');
    throw new Error('Invalid email address, password, or access code.');
  }
  
  const docRef = snap.docs[0].ref;
  const data = snap.docs[0].data() as CMSCredential;
  const now = new Date();
  
  // 1. Check failed login lockout
  if (data.lockedUntil) {
    const lockTime = new Date(data.lockedUntil);
    if (lockTime > now) {
      const waitMins = Math.ceil((lockTime.getTime() - now.getTime()) / 60000);
      throw new Error(`This account has been temporarily locked due to consecutive login failures. Please retry in ${waitMins} minute(s).`);
    }
  }
  
  // 2. Check active status
  if (data.status === 'Disabled') {
    await addCMSAuditLog('LOGIN_FAILED', cleanEmail, cleanEmail, 'Attempted sign in of disabled account.');
    throw new Error('This administrator credential is currently disabled. Please contact system owner.');
  }
  
  // 3. Check expiration
  if (new Date(data.expiresAt) < now) {
    await addCMSAuditLog('LOGIN_FAILED', cleanEmail, cleanEmail, 'Attempted sign in of expired credential.');
    throw new Error('This administrative access key has expired. Please request a credential renewal.');
  }
  
  // 4. Validate hashes
  const inputPassHash = await secureHash(passwordPlain.trim());
  const inputCodeHash = await secureHash(accessCodePlain.trim());
  
  if (data.passwordHash !== inputPassHash || data.accessKey !== inputCodeHash) {
    const nextFailedCount = (data.failedLogins || 0) + 1;
    const updateData: Partial<CMSCredential> = { failedLogins: nextFailedCount };
    let details = 'Authentication failed: Incorrect password or access code.';
    
    if (nextFailedCount >= 5) {
      const lockUntilDate = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min lockout
      updateData.lockedUntil = lockUntilDate;
      details += ' Account temporarily locked for 5 minutes.';
    }
    
    await updateDoc(docRef, updateData);
    await addCMSAuditLog('LOGIN_FAILED', cleanEmail, cleanEmail, details);
    throw new Error('Invalid email address, password, or access code.');
  }
  
  // 5. Successful Login
  await updateDoc(docRef, { failedLogins: 0, lockedUntil: null });
  await addCMSAuditLog('LOGIN_SUCCESS', cleanEmail, cleanEmail, `Signed in successfully with role "${data.role.toUpperCase()}".`);
  
  return {
    id: snap.docs[0].id,
    fullName: data.fullName,
    title: data.title,
    email: data.email,
    role: data.role,
    status: data.status,
    expiresAt: data.expiresAt,
    createdAt: data.createdAt,
    failedLogins: 0,
    lockedUntil: null
  };
}

export function subscribeCMSCredentials(callback: (creds: CMSCredential[]) => void): () => void {
  const credsRef = collection(db, 'cms_credentials');
  const q = query(credsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const creds: CMSCredential[] = [];
    snap.forEach((doc) => {
      creds.push({ id: doc.id, ...doc.data() } as CMSCredential);
    });
    callback(creds);
  }, (err) => {
    console.warn('Error fetching CMS credentials:', err);
  });
}

export function subscribeCMSAuditLogs(callback: (logs: CMSAuditLog[]) => void): () => void {
  const logsRef = collection(db, 'cms_audit_logs');
  const q = query(logsRef, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    const logs: CMSAuditLog[] = [];
    snap.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as CMSAuditLog);
    });
    callback(logs);
  }, (err) => {
    console.warn('Error fetching audit logs:', err);
  });
}

export async function updateCMSCredentialStatus(
  operatorEmail: string, 
  id: string, 
  email: string, 
  status: 'Active' | 'Disabled'
): Promise<void> {
  const docRef = doc(db, 'cms_credentials', id);
  await updateDoc(docRef, { status });
  await addCMSAuditLog(
    'UPDATE_CREDENTIAL_STATUS',
    operatorEmail,
    email,
    `Admin changed credential status to "${status}".`
  );
}

export async function deleteCMSCredential(
  operatorEmail: string, 
  id: string, 
  email: string
): Promise<void> {
  const docRef = doc(db, 'cms_credentials', id);
  await deleteDoc(docRef);
  await addCMSAuditLog(
    'DELETE_CREDENTIAL',
    operatorEmail,
    email,
    `Admin deleted and revoked administrative credentials.`
  );
}

