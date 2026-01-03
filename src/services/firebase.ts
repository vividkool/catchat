import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// TODO: Replace with actual Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveMessage = async (text: string, sender: "user" | "cat") => {
  try {
    await addDoc(collection(db, "messages"), {
      text,
      sender,
      timestamp: serverTimestamp(),
    });
    console.log("Message saved to Firestore");
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

import { query, orderBy, limit, getDocs } from "firebase/firestore";

export interface StoredMessage {
  text: string;
  sender: "user" | "cat";
  timestamp: any;
}

export const getRecentMessages = async (
  limitCount: number = 10
): Promise<StoredMessage[]> => {
  try {
    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: StoredMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data() as StoredMessage);
    });

    // Firestore returns descending (newest first), but we want ascending for chat history
    return messages.reverse();
  } catch (error) {
    console.error("Error fetching messages: ", error);
    return [];
  }
};

export { db };
