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

// Placeholder auth functions - will be replaced with Supabase auth
export const authService = {
  async signUp(email: string, password: string, name: string) {
    // TODO: Implement Supabase auth
    throw new Error("Auth not implemented yet")
  },

  async signIn(email: string, password: string) {
    // TODO: Implement Supabase auth
    throw new Error("Auth not implemented yet")
  },

  async signOut() {
    // TODO: Implement Supabase auth
    throw new Error("Auth not implemented yet")
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: Implement Supabase auth
    return null
  },
}
