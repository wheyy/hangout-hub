"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Send, Check } from "lucide-react"
import { useUserStore } from "@/hooks/user-store"
import { findUserByEmail, sendInvitation } from "@/lib/invitation-utils"
import { Meetup } from "@/lib/data/meetup"

interface SendInviteModalProps {
  isOpen: boolean
  onClose: () => void
  meetup: Meetup
}

export function SendInviteModal({ isOpen, onClose, meetup }: SendInviteModalProps) {
  const [emailInput, setEmailInput] = useState("")
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const CURRENT_USER = useUserStore((s) => s.user)

  // Helper to get destination as string or object
  const getDestinationData = () => {
    if (typeof meetup.destination === 'string') {
      return meetup.destination
    }
    // If it's an object, pass the whole object (it has name, address, etc.)
    return meetup.destination.getName()
  }

  const handleSendByEmail = async () => {
    setError("")
    if (!emailInput.trim()) {
      setError("Please enter an email.")
      return
    }

    setIsSending(true)
    try {
      // Find recipient
      const found = await findUserByEmail(emailInput.trim().toLowerCase())
      if (!found) {
        setError("User not found. Try again.")
        setIsSending(false)
        return
      }

      // Guard: cannot invite self
      if (found.id === CURRENT_USER!.id) {
        setError("You cannot invite yourself.")
        setIsSending(false)
        return
      }

      // Send invitation
      await sendInvitation({
        meetupId: meetup.id,
        meetupTitle: meetup.title,
        destination: getDestinationData(), // ✅ Use helper to handle both formats
        dateTime: meetup.dateTime,
        senderId: CURRENT_USER!.id,
        senderName: CURRENT_USER!.name,
        senderEmail: CURRENT_USER!.email,
        recipientEmail: emailInput.trim().toLowerCase(),
      })

      // Success UI
      setEmailInput("")
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to send invite")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Invite via Email
          </DialogTitle>
          <DialogDescription>
            Invite someone to <strong>{meetup.title}</strong> by entering their email address.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Sent!</h3>
            <p className="text-gray-600">Your invitation was sent successfully.</p>
          </div>
        ) : (
          <>
            <Input
              placeholder="Enter recipient email..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="mb-2"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSendByEmail}
                disabled={isSending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Send Invite
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}