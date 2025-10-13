import { User, Invitation, Meetup } from "@/types/invitation"

// Mock current user (the logged-in user)
export const CURRENT_USER: User = {
  id: "user-1",
  name: "Alex Chen",
  email: "alex.chen@example.com",
}

// Mock list of all users in the system
export const MOCK_USERS: User[] = [
  { id: "user-1", name: "Alex Chen", email: "alex.chen@example.com" },
  { id: "user-2", name: "Sarah Johnson", email: "sarah.j@example.com" },
  { id: "user-3", name: "Michael Lee", email: "michael.lee@example.com" },
  { id: "user-4", name: "Emma Wilson", email: "emma.w@example.com" },
  { id: "user-5", name: "David Brown", email: "david.brown@example.com" },
  { id: "user-6", name: "Lisa Martinez", email: "lisa.m@example.com" },
  { id: "user-7", name: "James Taylor", email: "james.t@example.com" },
  { id: "user-8", name: "Olivia Davis", email: "olivia.d@example.com" },
  { id: "user-9", name: "Ryan Anderson", email: "ryan.a@example.com" },
  { id: "user-10", name: "Sophie Chen", email: "sophie.c@example.com" },
]