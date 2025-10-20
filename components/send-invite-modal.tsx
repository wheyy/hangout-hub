"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, X, Send, Search, Check } from "lucide-react"
import { MOCK_USERS, useUserStore } from "@/hooks/user-store"
import { Meetup } from "@/lib/data/meetup"
import { User } from "@/lib/data/user"
import { Invitation } from "@/lib/data/invitation"
import { getInvitations, saveInvitations } from "@/lib/invitation-utils"

interface SendInviteModalProps {
  isOpen: boolean
  onClose: () => void
  meetup: Meetup
}

export function SendInviteModal({ isOpen, onClose, meetup }: SendInviteModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const CURRENT_USER = useUserStore((s) => s.user);
  
  // Filter users: exclude current user, existing members, and apply search
  const availableUsers = MOCK_USERS.filter((user: User) => {
    if (user.id === CURRENT_USER!.id) return false // Exclude self
    if (meetup.getMembers().some((member) => member.id === user.id)) return false // Exclude existing members
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
    } else {
      // Check if adding this user would exceed the limit
      const totalAfterInvite = meetup.getMemberCount() + selectedUsers.length + 1
      if (totalAfterInvite > 5) {
        alert("Cannot invite more users. Meetup has a maximum of 5 members.")
        return
      }
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const handleSendInvites = () => {
    if (selectedUsers.length === 0) return

    const existingInvitations = getInvitations()
    const newInvitations: Invitation[] = selectedUsers.map((user) => ({
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      meetupId: meetup.id,
      meetupTitle: meetup.title,
      destination: meetup.destination,
      dateTime: meetup.dateTime,
      senderId: CURRENT_USER!.id,
      senderName: CURRENT_USER!.name,
      senderEmail: CURRENT_USER!.email,
      recipientId: user.id,
      recipientEmail: user.email,
      recipientName: user.name,
      status: "pending",
      sentAt: new Date().toISOString(),
    }))

    saveInvitations([...existingInvitations, ...newInvitations])
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setSelectedUsers([])
      setSearchQuery("")
      onClose()
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Members to {meetup.title}
          </DialogTitle>
          <DialogDescription>
            Search and select users to invite. Maximum {5 - meetup.getMemberCount()} more member(s) can join.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitations Sent!</h3>
            <p className="text-gray-600">Your invitations have been sent successfully.</p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected ({selectedUsers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      className="bg-blue-600 text-white pl-3 pr-1 py-1 flex items-center gap-2"
                    >
                      {user.name}
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* User List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {searchQuery ? "No users found matching your search." : "No available users to invite."}
                </p>
              ) : (
                availableUsers.map((user:User) => {
                  const isSelected = selectedUsers.find((u) => u.id === user.id)
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSendInvites}
                disabled={selectedUsers.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send {selectedUsers.length > 0 && `(${selectedUsers.length})`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
