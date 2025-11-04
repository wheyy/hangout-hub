import { auth } from "@/lib/config/firebase"
import { User as AppUser } from "@/lib/models/user"
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
  deleteUser as fbDeleteUser,
  sendPasswordResetEmail,
  sendEmailVerification as fbSendEmailVerification,
} from "firebase/auth"
// Note: Do NOT import user store here to avoid circular dependency.

// Deprecated local view-models removed; controller now returns domain User

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

export const authController = {
  async signUp(email: string, password: string, name: string): Promise<AppUser> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Set display name
      await updateProfile(cred.user, { displayName: name })
      // Create user document using our model
      const u = await AppUser.createInFirestore({
        id: cred.user.uid,
        name,
        email: cred.user.email ?? email,
        currentLocation: null,
      })
      // Send email verification and sign out to enforce verification gate
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        const actionCodeSettings = appUrl
          ? { url: `${appUrl.replace(/\/$/, "")}/auth/verify/confirm`, handleCodeInApp: true }
          : undefined
        await fbSendEmailVerification(cred.user, actionCodeSettings as any)
      } catch {
        // ignore failures to send verification email
      }
      await fbSignOut(auth)
      // Return domain user (note: user will be signed out after this)
      return u
    } catch (e: any) {
      throw new Error(mapFirebaseError(e?.code || ""))
    }
  },

  async signIn(email: string, password: string): Promise<AppUser> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      // Block unverified emails
      if (!cred.user.emailVerified) {
        await fbSignOut(auth)
        throw new Error("Please verify your email before signing in.")
      }
      // Load user document; if missing, raise an error
      const u = await AppUser.loadFromFirestoreFull(cred.user.uid)
      if (!u) throw new Error("User profile not found.")
      return u
    } catch (e: any) {
      // Preserve explicit error messages (e.g., verification required)
      if (e && typeof e === "object" && "code" in e && e.code) {
        return Promise.reject(new Error(mapFirebaseError((e as any).code)))
      }
      if (e instanceof Error && e.message) {
        return Promise.reject(e)
      }
      return Promise.reject(new Error("Something went wrong. Please try again."))
    }
  },

  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth)
    } catch (e: any) {
      throw new Error("Failed to sign out. Please try again.")
    }
  },

  async getCurrentUser(): Promise<AppUser | null> {
    // If already available, try to enrich from user doc
    const cur = auth.currentUser
    if (cur) {
      try {
        const u = await AppUser.loadFromFirestore(cur.uid)
        if (!u) return null
        return u
      } catch {
        return null
      }
    }

    // Await one-time auth state, then load user doc
    return new Promise<AppUser | null>((resolve) => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        unsub()
        if (!user) return resolve(null)
        try {
          const u = await AppUser.loadFromFirestore(user.uid)
          if (!u) return resolve(null)
          resolve(u)
        } catch {
          resolve(null)
        }
      })
    })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const fbUser = auth.currentUser
    if (!fbUser || !fbUser.email) throw new Error("Not authenticated.")
    try {
      const credential = EmailAuthProvider.credential(fbUser.email, currentPassword)
      await reauthenticateWithCredential(fbUser, credential)
      await fbUpdatePassword(fbUser, newPassword)
    } catch (e: any) {
      const code = e?.code || ""
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        throw new Error("Current password is incorrect.")
      }
      throw new Error(mapFirebaseError(code))
    }
  },

  async changeDisplayName(newName: string): Promise<void> {
    const fbUser = auth.currentUser
    if (!fbUser) throw new Error("Not authenticated.")
    const name = newName?.trim()
    if (!name) throw new Error("Name cannot be empty.")
    await updateProfile(fbUser, { displayName: name })
    const u = await AppUser.loadFromFirestore(fbUser.uid)
    if (!u) throw new Error("User profile not found.")
    await u.updateName(name)
  },

    async deleteAccount(): Promise<void> {
      const fbUser = auth.currentUser
      if (!fbUser) throw new Error("Not authenticated.")
      const u = await AppUser.loadFromFirestore(fbUser.uid)
      if (!u) throw new Error("User profile not found.")
      // Remove user doc via User (DB layer encapsulated) then delete auth user
      try {
        await u.removeAccount()
      } catch {
        // ignore Firestore deletion issues and still attempt to delete auth user
      }
      try {
        await fbDeleteUser(fbUser)
      } catch (e: any) {
        const code = e?.code || ""
        if (code === "auth/requires-recent-login") {
          throw new Error("Please sign in again to delete your account.")
        }
        throw new Error("Failed to delete account. Please try again.")
      }
    },

  async sendPasswordReset(email: string): Promise<void> {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      const actionCodeSettings = appUrl
        ? { url: `${appUrl.replace(/\/$/, "")}/auth/reset/confirm`, handleCodeInApp: true }
        : undefined
      await sendPasswordResetEmail(auth, email, actionCodeSettings as any)
      // For privacy, do not reveal whether the email exists. Treat as success.
    } catch (e: any) {
      const code = e?.code || ""
      if (code === "auth/invalid-email") {
        throw new Error("Invalid email address.")
      }
      // Swallow other errors to avoid user enumeration
    }
  },

  async resendVerification(email: string, password: string): Promise<void> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        const actionCodeSettings = appUrl
          ? { url: `${appUrl.replace(/\/$/, "")}/auth/verify/confirm`, handleCodeInApp: true }
          : undefined
        await fbSendEmailVerification(cred.user, actionCodeSettings as any)
      } finally {
        await fbSignOut(auth)
      }
    } catch (e: any) {
      const code = e?.code || ""
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        throw new Error("Invalid email or password.")
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
