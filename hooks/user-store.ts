import { User } from "@/lib/models/user"
import { create } from "zustand"
import { authController } from "@/lib/auth/auth-service"

interface UserStore {
  user: User | null;
  initializeUser: () => Promise<void>;
  isLoading: boolean;
}

export const useUserStore = create<UserStore>((set, get) => {
  
  return {
    user: null,
    isLoading: true,
    
    initializeUser: async () => {
      try {
        const user = await authController.getCurrentUserFull();
        
        // Set up notifyUpdate to trigger re-renders
        user.notifyUpdate = async () => {
          console.log("User notifyUpdate called");
          const user = await authController.getCurrentUserFull();
          set({ user }); // Force new reference
        };
        
        set({ user, isLoading: false });

        console.log("User initialized:", user);
      } catch (error) {
        console.error("Failed to initialize user:", error);
        set({ user: null, isLoading: false });
      }
    },
  };
    
});

useUserStore.getState().initializeUser()