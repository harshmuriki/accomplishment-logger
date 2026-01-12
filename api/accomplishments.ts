import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-app-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Initialize Firebase (singleton pattern for serverless)
let db: any = null;
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

function getFirestoreInstance() {
  if (!db && isFirebaseConfigured) {
    try {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } catch (e) {
      console.error("Firebase init error:", e);
    }
  }
  return db;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, rating, timestamp } = req.body;

    // Validation
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (
      rating === undefined ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 10
    ) {
      return res
        .status(400)
        .json({ error: "Rating must be a number between 1 and 10" });
    }

    // Use provided timestamp or current time
    const entryTimestamp = timestamp ? new Date(timestamp) : new Date();

    const newEntry = {
      text: text.trim(),
      rating,
      timestamp: entryTimestamp,
    };

    const firestore = getFirestoreInstance();

    if (firestore) {
      // Save to Firestore
      try {
        const docRef = await addDoc(collection(firestore, "accomplishments"), {
          ...newEntry,
          timestamp: Timestamp.fromDate(newEntry.timestamp),
        });
        return res.status(201).json({
          id: docRef.id,
          ...newEntry,
        });
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        return res.status(500).json({ error: "Failed to save to database" });
      }
    } else {
      // Firebase not configured
      return res.status(503).json({
        error: "Firebase not configured",
        message: "Please configure Firebase environment variables in Vercel",
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
