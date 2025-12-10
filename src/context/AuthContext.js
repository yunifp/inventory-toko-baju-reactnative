import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { View, ActivityIndicator } from 'react-native';
import { auth, db, firebaseConfig } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const registerStaff = async (email, password, name) => {
    let secondaryApp = null;
    try {
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        email: email,
        name: name,
        role: 'staff',
        createdAt: new Date()
      });

      await signOut(secondaryAuth);
      return true;
    } catch (error) {
      throw error;
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
    }
  };

  if (loading) return <View><ActivityIndicator /></View>;

  return (
    <AuthContext.Provider value={{ user, role, login, logout, registerStaff }}>
      {children}
    </AuthContext.Provider>
  );
};