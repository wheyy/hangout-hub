import { auth, db } from "./firebase"
import { User as AppUser } from "./data/user"
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
import { useUserStore } from "@/hooks/user-store"

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
      // Create user document using our model
      await AppUser.createInFirestore({
        id: cred.user.uid,
        name,
        email: cred.user.email ?? email,
        currentLocation: null,
      })
      // Return unified shape
      return {
        id: cred.user.uid,
        email: cred.user.email ?? email,
        name,
        avatar_url: cred.user.photoURL || undefined,
      }
    } catch (e: any) {
      throw new Error(mapFirebaseError(e?.code || ""))
    }
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      // Load user document; if missing, raise an error
      const u = await AppUser.loadFromFirestoreFull(cred.user.uid)
      useUserStore.getState().initializeUser()
      if (!u) throw new Error("User profile not found.")
      return {
        id: cred.user.uid,
        email: u.email,
        name: u.name,
        avatar_url: cred.user.photoURL || undefined,
      }
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
    // If already available, try to enrich from user doc
    const cur = auth.currentUser
    if (cur) {
      try {
        const u = await AppUser.loadFromFirestore(cur.uid)
        if (!u) return null
        return { id: cur.uid, email: u.email, name: u.name, avatar_url: cur.photoURL || undefined }
      } catch {
        // Fallback to auth-only mapping
        return toAuthUser(cur)
      }
    }

    // Await one-time auth state, then load user doc
    return new Promise<AuthUser | null>((resolve) => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        unsub()
        if (!user) return resolve(null)
        try {
          const u = await AppUser.loadFromFirestore(user.uid)
          if (!u) return resolve(null)
          resolve({ id: user.uid, email: u.email, name: u.name, avatar_url: user.photoURL || undefined })
        } catch {
          resolve(toAuthUser(user))
        }
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

  // Returns the hydrated domain User (with meetups loaded via user.ts)
  async getCurrentUserFull(): Promise<AppUser> {
    const resolveWithUser = async (fbUser: User): Promise<AppUser> => {
      const u = await AppUser.loadFromFirestoreFull(fbUser.uid)
      if (!u) throw new Error("User profile not found.")
      return u
    }

    const cur = auth.currentUser
    if (cur) {
      return resolveWithUser(cur)
    }

    return new Promise<AppUser>((resolve, reject) => {
      const unsub = onAuthStateChanged(auth, async (u) => {
        unsub()
        if (!u) return reject(new Error("Not authenticated."))
        try {
          const full = await resolveWithUser(u)
          resolve(full)
        } catch (e) {
          reject(e)
        }
      })
    })
  },
}
