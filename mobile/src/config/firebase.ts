import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-BIy32M2IquzWZ73ArJvuM_tlBPHpnic",
  authDomain: "fresh-c7323.firebaseapp.com",
  projectId: "fresh-c7323",
  storageBucket: "fresh-c7323.firebasestorage.app",
  messagingSenderId: "597482260340",
  appId: "1:597482260340:web:1b0f7f545c8435e0520e21",
  measurementId: "G-Q5EW0KZVV7",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with proper persistence for React Native
export const auth = Platform.OS === "web" 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

// Initialize Analytics (only on web)
export const analytics = Platform.OS === "web" ? getAnalytics(app) : null;

export default app;
