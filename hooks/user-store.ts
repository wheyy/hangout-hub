//THIS file is for temporary fake data / methods that simulate other member's potential backend

import { Invitation } from "@/lib/models/invitation"
import { User } from "@/lib/models/user"
import { Meetup } from "@/lib/models/meetup"
import { useState } from "react"
import {create} from "zustand"
import { authService } from "@/lib/auth/auth-service"

// ✅ Mock current user (the logged-in user)
// export const CURRENT_USER: User = new User(
//   "u001",
//   "Alice Johnson",
//   "alice.johnson@example.com",
//   [-122.4194, 37.7749] // San Francisco, CA
// )



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
        const user = await authService.getCurrentUserFull();
        
        // Set up notifyUpdate to trigger re-renders
        user.notifyUpdate = async () => {
          console.log("User notifyUpdate called");
          const user = await authService.getCurrentUserFull();
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

// // Legacy useUserStore( before integrating authService )

// function cloneUser(u: User): User {
//   const cloned = new User(u.id, u.name, u.email, u.currentLocation);
  
//   // Copy over the meetups (creating a NEW array)
//   const meetups = u.getMeetups();
//   meetups.forEach(meetup => {
//     // Directly access the private field to avoid calling addMeetup
//     // which would trigger notifyUpdate again
//     if (meetup.getMemberIds().includes(cloned.id)) {
//       (cloned as any).meetups.push(meetup);
//     }
//   });
  
//   return cloned;
// }

// export const useUserStore = create<UserStore>((set, get) => {
  //   const user = new User("u001", "CURRENT_MOCK_USER", "CURRENT_MOCK_USER@example.com", null);

//   user.notifyUpdate = () => {
//     // clone to change identity (preserving methods)
//     set({ user: cloneUser(user) });
//   };

//   return {
//     user,
//     setUser: (next) => {
//       // make sure any new instance can notify
//       next.notifyUpdate = () => set({ user: cloneUser(next) });
//       set({ user: next });
//     },
//   };
// });
// // FAKE FUNCTION FOR NOW:
// export function loadUser(userId: string): User | null {
//   return new User(
//     "u002",
//     "Bob Smith",
//     "bob.smith@example.com",
//     [-73.935242, 40.73061] // New York, NY
//   );
// }

// ✅ Mock list of all users in the system -- Hi srii u gotta delete this after u fix the changes
export const MOCK_USERS: User[] = [
  new User(
      "u002",
      "Bob Smith",
      "bob.smith@example.com",
      [-73.935242, 40.73061] // New York, NY
  ),
  new User(
      "u003",
      "Charlie Davis",
      "charlie.davis@example.com",
      [-118.2437, 34.0522] // Los Angeles, CA
  ),
  new User(
      "u004",
      "Diana Nguyen",
      "diana.nguyen@example.com",
      [2.3522, 48.8566] // Paris, France
  ),
  new User(
      "u005",
      "Ethan Patel",
      "ethan.patel@example.com",
      [139.6917, 35.6895] // Tokyo, Japan
  )
]