import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
}

// Initialize Firebase app (singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Auth with local persistence
const auth = getAuth(app)
// Ensure persistence is set; ignore promise here to avoid blocking import
setPersistence(auth, browserLocalPersistence).catch(() => {
  // no-op; fallback to default persistence
})

// Firestore (for user profile documents and future features)
const db = getFirestore(app)

export { app, auth, db }
