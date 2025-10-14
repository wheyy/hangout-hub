import { Invitation } from "@/lib/data/invitation"
import { User } from "@/lib/data/user"

// ✅ Mock current user (the logged-in user)
export const CURRENT_USER: User = new User(
  "u001",
  "Alice Johnson",
  "alice.johnson@example.com",
  [-122.4194, 37.7749] // San Francisco, CA
)

// ✅ Mock list of all users in the system
export const MOCK_USERS: User[] = [
  CURRENT_USER,
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