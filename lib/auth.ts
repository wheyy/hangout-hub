import { auth, db } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null
  return {
    id: user.uid,
    email: user.email || "",
    name: user.displayName || user.email?.split("@")[0] || "",
    avatar_url: user.photoURL || undefined,
  }
}

function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email is already in use."
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/weak-password":
      return "Password is too weak."
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password."
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later."
    case "auth/weak-password":
      return "Password is too weak."
    case "auth/requires-recent-login":
      return "Please sign in again to complete this action."
    default:
      return "Something went wrong. Please try again."
  }
}

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<AuthUser> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Set display name
      await updateProfile(cred.user, { displayName: name })
      // Create user document for future features
      const userRef = doc(db, "users", cred.user.uid)
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        name,
        createdAt: serverTimestamp(),
      })
      return toAuthUser(auth.currentUser) as AuthUser
    } catch (e: any) {
      throw new Error(mapFirebaseError(e?.code || ""))
    }
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return toAuthUser(cred.user) as AuthUser
    } catch (e: any) {
      throw new Error(mapFirebaseError(e?.code || ""))
    }
  },

  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth)
    } catch (e: any) {
      throw new Error("Failed to sign out. Please try again.")
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // If already available, return immediately
    const existing = toAuthUser(auth.currentUser)
    if (existing) return existing

    // Await one-time auth state
    return new Promise<AuthUser | null>((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub()
        resolve(toAuthUser(user))
      })
    })
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("Not authenticated.")
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await fbUpdatePassword(user, newPassword)
    } catch (e: any) {
      const code = e?.code || ""
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        throw new Error("Current password is incorrect.")
      }
      throw new Error(mapFirebaseError(code))
    }
  },
}
