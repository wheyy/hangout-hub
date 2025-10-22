import { Invitation } from "@/lib/data/invitation"
import { Meetup } from "@/lib/data/meetup"

// Check if invitation has expired (after meetup date)
export const isInvitationExpired = (invitation: Invitation): boolean => {
  const meetupDate = new Date(`${invitation.dateTime}`)
  return new Date() > meetupDate
}

// Get invitations from localStorage
export const getInvitations = (): Invitation[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("invitations")
  return stored ? JSON.parse(stored) : []
}

// Save invitations to localStorage
export const saveInvitations = (invitations: Invitation[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("invitations", JSON.stringify(invitations))
  }
}

// Get meetups from localStorage
export const getMeetups = (): Meetup[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("meetups")
  return stored ? JSON.parse(stored) : []
}

// // Save meetups to localStorage
// export const saveMeetups = (meetups: Meetup[]): void => {
//   if (typeof window !== "undefined") {
//     localStorage.setItem("meetups", JSON.stringify(meetups))
//   }
// }