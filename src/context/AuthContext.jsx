import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
            setUserData(data);
          } else {
            // Retry once after a short delay in case of race condition during signup
            setTimeout(async () => {
              const retryDoc = await getDoc(doc(db, 'users', user.uid));
              if (retryDoc.exists()) {
                const data = retryDoc.data();
                setUserRole(data.role);
                setUserData(data);
              }
            }, 1500);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, role, additionalData = {}) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { setDoc, doc } = await import('firebase/firestore');
    const res = await createUserWithEmailAndPassword(auth, email, password);
    
    // Explicitly set role in state so UI updates immediately
    setUserRole(role);
    
    await setDoc(doc(db, 'users', res.user.uid), {
      uid: res.user.uid,
      email,
      role,
      ...additionalData,
      createdAt: new Date().toISOString()
    });
    return res;
  };

  const login = async (email, password) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const res = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', res.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserRole(data.role);
      setUserData(data);
      return { ...res, role: data.role };
    }
    return res;
  };

  const logout = () => {
    return auth.signOut();
  };

  const value = {
    currentUser,
    userRole,
    userData,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
