import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAx5yt-mKoLU38QCZSlogILBlPcB5yovjM",
  authDomain: "stockku-3c747.firebaseapp.com",
  projectId: "stockku-3c747",
  storageBucket: "stockku-3c747.firebasestorage.app",
  messagingSenderId: "403574520400",
  appId: "1:403574520400:web:8cbf900b25fbde4b686f55"
};

let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, firebaseConfig };