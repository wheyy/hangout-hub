//THIS file is for temporary fake data / methods that simulate other member's potential backend

import { User } from "@/lib/models/user"
import { create } from "zustand"
import { authService } from "@/lib/auth/auth-service"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/config/firebase"

// interface UserStore {
//   user: User | null;
//   initializeUser: () => Promise<void>;
//   isLoading: boolean;
// }

// export const useUserStore = create<UserStore>((set, get) => {
  
//   return {
//     user: null,
//     isLoading: true,
    
//     initializeUser: async () => {
//       try {
//         const user = await authService.getCurrentUserFull();
        
//         // Set up notifyUpdate to trigger re-renders
//         user.notifyUpdate = async () => {
//           console.log("User notifyUpdate called");
//           const user = await authService.getCurrentUserFull();
//           set({ user }); // Force new reference
//         };
        
//         set({ user, isLoading: false });

//         console.log("User initialized:", user);
//       } catch (error) {
//         console.error("Failed to initialize user:", error);
//         set({ user: null, isLoading: false });
//       }
//     },
//   };
    
// });


interface UserStore {
  user: User | null
  isLoading: boolean
  initializeUser: () => Promise<void>
  cleanup: () => void // ✅ Add cleanup method
}

export const useUserStore = create<UserStore>((set, get) => {
  let unsubscribe: (() => void) | null = null
  let meetupUnsubscribers: (() => void)[] = [] // ✅ Track meetup listeners
  let reloadTimeout: NodeJS.Timeout | null = null // ✅ Debounce timer
  
  return {
    user: null,
    isLoading: true,
    
    initializeUser: async () => {
      try {
        const user = await authService.getCurrentUserFull();
        var require_update = false;
        
        // Clean up existing listeners
        if (unsubscribe) unsubscribe();
        meetupUnsubscribers.forEach(unsub => {if (unsub) unsub()});
        meetupUnsubscribers = [];

        // Listen to user document
        unsubscribe = onSnapshot(
          doc(db, "users", user.id),
          (doc) => {
            console.log("🔄 User document changed");
            require_update = true;
          }
        );
        
        // Listen to each meetup
        user.getMeetups().forEach((meetup) => {
          const meetupUnsub = onSnapshot(
            doc(db, "meetups", meetup.id),
            async () => {
              console.log(`🔄 Meetup ${meetup.id} changed`);
              require_update = true;
            }
          );
          meetupUnsubscribers.push(meetupUnsub);
        });
        
        if(require_update) {
          const updatedUser = await authService.getCurrentUserFull();
          set({ user: updatedUser });
          require_update = false;
        }
        set({ user, isLoading: false });
      } catch (error) {
        console.error("Failed to initialize user:", error);
        set({ user: null, isLoading: false });
      }
    },
    
    cleanup: () => {
      if (unsubscribe) unsubscribe();
      meetupUnsubscribers.forEach(unsub => unsub());
      meetupUnsubscribers = [];
      if (reloadTimeout) clearTimeout(reloadTimeout);
    },
  };
});

// Initialize user on app start
useUserStore.getState().initializeUser();

// ✅ Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useUserStore.getState().cleanup();
  });
}
