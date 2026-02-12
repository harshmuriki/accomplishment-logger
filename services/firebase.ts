import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  Timestamp,
  doc,
  where,
  limit,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  // GoogleAuthProvider,
  // signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { Accomplishment, Insight, TimeframeType } from "../types";

// TODO: User must replace these with their own Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-app-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Initialize Firebase only if config is valid (mock check)
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let db: any;
let auth: any;
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase init error:", e);
    // Fallback to local
    db = null;
    auth = null;
  }
}

const STORAGE_KEY = "accomplishments_local";

// Auth functions
// Google Sign-In (commented out - using email/password instead)
// export const signInWithGoogle = async (): Promise<User | null> => {
//   if (!auth) {
//     console.warn("Firebase not configured");
//     return null;
//   }
//   try {
//     const provider = new GoogleAuthProvider();
//     const result = await signInWithPopup(auth, provider);
//     return result.user;
//   } catch (error) {
//     console.error("Error signing in:", error);
//     throw error;
//   }
// };

// Email/Password Sign-In
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  if (!auth) {
    throw new Error("Firebase not configured");
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Email/Password Sign-Up
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  if (!auth) {
    throw new Error("Firebase not configured");
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  if (!auth) return null;
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const saveAccomplishment = async (
  text: string,
  rating: number,
  userId?: string
): Promise<Accomplishment> => {
  const newEntry = {
    text,
    rating,
    timestamp: new Date(),
  };

  if (db) {
    // Save to Firestore - using subcollection per user: users/{userId}/accomplishments
    try {
      const currentUser = userId || auth?.currentUser?.uid;
      if (!currentUser) {
        throw new Error("User must be logged in to save accomplishments");
      }

      // Create reference to user's accomplishments subcollection
      const userDocRef = doc(db, "users", currentUser);
      const accomplishmentsRef = collection(userDocRef, "accomplishments");

      const docRef = await addDoc(accomplishmentsRef, {
        ...newEntry,
        timestamp: Timestamp.fromDate(newEntry.timestamp),
      });
      return { id: docRef.id, ...newEntry };
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  } else {
    // Fallback: Save to LocalStorage
    console.warn("Firebase not configured. Saving to localStorage.");
    const existingStr = localStorage.getItem(STORAGE_KEY);
    const existing: Accomplishment[] = existingStr
      ? JSON.parse(existingStr)
      : [];

    const localEntry: Accomplishment = {
      ...newEntry,
      id: Date.now().toString(), // Simple ID generation
    };

    const updated = [localEntry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return localEntry;
  }
};

export const getAccomplishments = async (
  userId?: string
): Promise<Accomplishment[]> => {
  if (db) {
    try {
      const currentUser = userId || auth?.currentUser?.uid;

      if (!currentUser) {
        // No user logged in, return empty array
        return [];
      }

      // Query user's accomplishments subcollection: users/{userId}/accomplishments
      const userDocRef = doc(db, "users", currentUser);
      const accomplishmentsRef = collection(userDocRef, "accomplishments");
      const q = query(accomplishmentsRef, orderBy("timestamp", "desc"));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          rating: data.rating,
          timestamp: data.timestamp.toDate(),
        } as Accomplishment;
      });
    } catch (error: any) {
      console.error("Error fetching docs: ", error);
      return [];
    }
  } else {
    // Fallback: Read from LocalStorage
    const existingStr = localStorage.getItem(STORAGE_KEY);
    if (!existingStr) return [];

    const data = JSON.parse(existingStr);
    // Fix date parsing from JSON string
    return data.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  }
};

// Insight-related functions

export const getInsight = async (
  timeframeKey: string,
  timeframeType: TimeframeType,
  userId?: string
): Promise<Insight | null> => {
  if (!db) return null;

  try {
    const currentUser = userId || auth?.currentUser?.uid;
    if (!currentUser) return null;

    const userDocRef = doc(db, "users", currentUser);
    const insightsRef = collection(userDocRef, "insights");
    const q = query(
      insightsRef,
      where("timeframeKey", "==", timeframeKey),
      where("timeframeType", "==", timeframeType),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const docData = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      timeframeType: docData.timeframeType,
      timeframeKey: docData.timeframeKey,
      content: docData.content,
      generatedAt: docData.generatedAt.toDate(),
      accomplishmentCount: docData.accomplishmentCount,
      accomplishmentIds: docData.accomplishmentIds || [],
    };
  } catch (error) {
    console.error("Error fetching insight:", error);
    return null;
  }
};

export const saveInsight = async (
  timeframeKey: string,
  timeframeType: TimeframeType,
  content: string,
  accomplishmentIds: string[],
  userId?: string
): Promise<Insight | null> => {
  if (!db) return null;

  try {
    const currentUser = userId || auth?.currentUser?.uid;
    if (!currentUser) throw new Error("User must be logged in");

    const userDocRef = doc(db, "users", currentUser);
    const insightsRef = collection(userDocRef, "insights");

    // Use deterministic ID: {timeframeType}_{timeframeKey}
    const insightId = `${timeframeType}_${timeframeKey}`;
    const insightDocRef = doc(insightsRef, insightId);

    const insightData = {
      timeframeType,
      timeframeKey,
      content,
      generatedAt: Timestamp.fromDate(new Date()),
      accomplishmentCount: accomplishmentIds.length,
      accomplishmentIds,
    };

    await setDoc(insightDocRef, insightData);

    return {
      id: insightId,
      ...insightData,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error saving insight:", error);
    return null;
  }
};
