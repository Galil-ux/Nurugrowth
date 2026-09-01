import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut as fbSignOut,
  User as FirebaseUser,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, syncUserProfile, PRIMARY_ADMIN_EMAIL, updateUserRole, markUserPasswordChanged, ensureDefaultCMSCredentials, validateCMSCredential } from './firebase';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  isAdmin: boolean;
  isEditor: boolean;
  loading: boolean;
  requiresPasswordChange: boolean;
  signInWithEmail: (email: string, pass: string, accessCode?: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  changeMasterPassword: (newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  useEffect(() => {
    // 1. Setup default admin access credentials securely in the database
    ensureDefaultCMSCredentials();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setCurrentUser(profile);
        } catch (err) {
          console.warn('Sync user profile notice:', err);
          // Fallback user object
          const isPrimary = user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
          setCurrentUser({
            uid: user.uid,
            email: user.email || 'operator@nurugrowth.lab',
            displayName: user.displayName || (isPrimary ? 'Moses Mutuma (Admin)' : 'Solar Operator'),
            role: isPrimary ? 'admin' : 'viewer',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, passOrKey: string, accessCode?: string) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassOrKey = passOrKey.trim();
    try {
      // 1. Try to authenticate using CMS Secure Credentials (Access Code validation)
      if (accessCode) {
        const validated = await validateCMSCredential(cleanEmail, cleanPassOrKey, accessCode.trim());
        
        let fUser = auth.currentUser;
        if (!fUser) {
          const res = await signInAnonymously(auth);
          fUser = res.user;
        }
        
        await updateProfile(fUser, { displayName: validated.fullName });
        const profile = await syncUserProfile(fUser, validated.role);
        
        // Ensure accessKey and correct role is set on the user profile
        const userRef = doc(db, 'users', fUser.uid);
        const updatedProfile = {
          ...profile,
          email: cleanEmail,
          displayName: validated.fullName,
          role: validated.role,
          lastLogin: new Date().toISOString()
        };
        await setDoc(userRef, updatedProfile, { merge: true });
        
        setCurrentUser(updatedProfile);
        setRequiresPasswordChange(false);
        return;
      }

      // 2. Try to authenticate using legacy Access Key
      let matchedUserDoc: AppUser | null = null;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', cleanEmail), where('accessKey', '==', cleanPassOrKey));
        const snap = await getDocs(q);
        if (!snap.empty) {
          matchedUserDoc = snap.docs[0].data() as AppUser;
        } else {
          // Check specifically for pre_assigned doc ID
          const preAssignedDocId = `pre_assigned_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
          const docRef = doc(db, 'users', preAssignedDocId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as AppUser;
            if (data.accessKey === cleanPassOrKey) {
              matchedUserDoc = data;
            }
          }
        }
      } catch (queryErr) {
        console.warn('Access key verification query note:', queryErr);
      }

      if (matchedUserDoc) {
        let fUser = auth.currentUser;
        if (!fUser) {
          const res = await signInAnonymously(auth);
          fUser = res.user;
        }
        
        await updateProfile(fUser, { displayName: matchedUserDoc.displayName });
        const profile = await syncUserProfile(fUser, matchedUserDoc.role);
        
        // Ensure accessKey and correct role is set on the new user profile
        const userRef = doc(db, 'users', fUser.uid);
        const updatedProfile = {
          ...profile,
          email: cleanEmail,
          displayName: matchedUserDoc.displayName,
          role: matchedUserDoc.role,
          accessKey: cleanPassOrKey,
          lastLogin: new Date().toISOString()
        };
        await setDoc(userRef, updatedProfile, { merge: true });
        
        setCurrentUser(updatedProfile);
        setRequiresPasswordChange(false);
        return;
      }

      // 3. Standard Email/Password Sign-In
      let res;
      try {
        res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassOrKey);
      } catch (err: any) {
        // If the admin user attempts to log in with the master credential but has no account yet,
        // we automatically register them under this email and default password.
        if (cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() && cleanPassOrKey === 'NuruGrowth2026!') {
          res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassOrKey);
          await updateProfile(res.user, { displayName: 'Moses Mutuma (Admin)' });
        } else {
          throw err;
        }
      }
      
      const profile = await syncUserProfile(res.user);
      setCurrentUser(profile);

      // Require password change if the user is logging in with the default master password
      if (cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() && cleanPassOrKey === 'NuruGrowth2026!') {
        setRequiresPasswordChange(true);
      } else {
        setRequiresPasswordChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'editor') => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      const profile = await syncUserProfile(res.user, role);
      setCurrentUser(profile);
      setRequiresPasswordChange(false);
    } finally {
      setLoading(false);
    }
  };

  const changeMasterPassword = async (newPass: string) => {
    if (!auth.currentUser) throw new Error('No authenticated session exists.');
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPass);
      await markUserPasswordChanged(auth.currentUser.uid);
      setCurrentUser(prev => prev ? { ...prev, passwordChanged: true } : null);
      setRequiresPasswordChange(false);
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (targetRole: UserRole) => {
    setLoading(true);
    try {
      let user = auth.currentUser;
      if (!user) {
        const res = await signInAnonymously(auth);
        user = res.user;
      }
      const displayName = targetRole === 'admin' ? 'Moses Mutuma (Admin)' : targetRole === 'editor' ? 'Solar Content Lead' : 'Solar Operator (Viewer)';
      await updateProfile(user, { displayName });
      const profile = await syncUserProfile(user, targetRole);
      // Ensure target role is set
      await updateUserRole(user.uid, targetRole);
      setCurrentUser({ ...profile, role: targetRole, displayName });
      setRequiresPasswordChange(false);
    } catch (err) {
      console.warn('Demo login fallback:', err);
      // Local fallback in state
      setCurrentUser({
        uid: 'demo-user-' + targetRole,
        email: `${targetRole}@nurugrowth.lab`,
        displayName: targetRole === 'admin' ? 'Moses Mutuma (Admin)' : targetRole === 'editor' ? 'Content Editor' : 'Viewer Guest',
        role: targetRole,
        createdAt: new Date().toISOString()
      });
      setRequiresPasswordChange(false);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!currentUser) return;
    if (firebaseUser) {
      try {
        await updateUserRole(firebaseUser.uid, newRole);
      } catch (err) {
        console.warn('Role switch online update note:', err);
      }
    }
    setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
  };

  const signOutUser = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
    setFirebaseUser(null);
    setRequiresPasswordChange(false);
  };

  const role = currentUser?.role || 'viewer';
  const isAdmin = role === 'admin';
  const isEditor = role === 'admin' || role === 'editor';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        isAdmin,
        isEditor,
        loading,
        requiresPasswordChange,
        signInWithEmail,
        signUpWithEmail,
        quickDemoLogin,
        signOutUser,
        switchRole,
        changeMasterPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
