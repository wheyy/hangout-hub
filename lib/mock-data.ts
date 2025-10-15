import { Invitation } from "@/lib/data/invitation"
import { User } from "@/lib/data/user"
import { Meetup } from "@/lib/data/meetup"
import { useState } from "react"
import {create} from "zustand"

// ✅ Mock current user (the logged-in user)
// export const CURRENT_USER: User = new User(
//   "u001",
//   "Alice Johnson",
//   "alice.johnson@example.com",
//   [-122.4194, 37.7749] // San Francisco, CA
// )


function cloneUser(u: User): User {
  return Object.assign(Object.create(Object.getPrototypeOf(u)), u);
}

interface UserStore {
  user: User;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set, get) => {
  const user = new User("1", "Guest", "guest@example.com", null);

  user.notifyUpdate = () => {
    // clone to change identity (preserving methods)
    set({ user: cloneUser(user) });
  };

  return {
    user,
    setUser: (next) => {
      // make sure any new instance can notify
      next.notifyUpdate = () => set({ user: cloneUser(next) });
      set({ user: next });
    },
  };
});


// ✅ Mock list of all users in the system
const currentUser = useUserStore.getState().user;

export const MOCK_USERS: User[] = [
  currentUser,
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