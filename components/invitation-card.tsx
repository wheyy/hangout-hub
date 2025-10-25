"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Check, X, User, Trash2 } from "lucide-react"
import { Invitation } from "@/lib/data/invitation"
import {
  isInvitationExpired,
  acceptInvitation,
  rejectInvitation,
  deleteInvitation,
} from "@/lib/invitation-utils"
import { useUserStore } from "@/hooks/user-store"
import { useState } from "react"

interface InvitationCardProps {
  invitation: Invitation
  type: "received" | "sent"
  onDeleted?: (id: string) => void // allow parent to update local state
}

export function InvitationCard({ invitation, type, onDeleted }: InvitationCardProps) {
  const CURRENT_USER = useUserStore((s) => s.user)
  const [status, setStatus] = useState(invitation.status)
  const [isProcessing, setIsProcessing] = useState(false)
  const expired = isInvitationExpired(invitation)
  const isPending = status === "pending"

  const handleAccept = async () => {
    if (!CURRENT_USER) return
    setIsProcessing(true)
    try {
      await acceptInvitation({ recipientId: CURRENT_USER.id, invitationId: invitation.id })
      setStatus("accepted")
    } catch (err) {
      console.error(err)
      alert("Failed to accept invitation.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!CURRENT_USER) return
    setIsProcessing(true)
    try {
      await rejectInvitation({ recipientId: CURRENT_USER.id, invitationId: invitation.id })
      setStatus("rejected")
    } catch (err) {
      console.error(err)
      alert("Failed to reject invitation.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!CURRENT_USER) return
    const confirmDelete = confirm("Are you sure you want to delete this invitation?")
    if (!confirmDelete) return
    setIsProcessing(true)
    try {
      await deleteInvitation({ userId: CURRENT_USER.id, invitationId: invitation.id })
      onDeleted?.(invitation.id) // notify parent to remove from UI
    } catch (err) {
      console.error(err)
      alert("Failed to delete invitation.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper to safely render destination (handles both string and object)
  const getDestinationName = (destination: any) => {
    if (typeof destination === 'string') return destination
    return destination?.name || 'Unknown location'
  }

  return (
    <Card className={`${expired ? "opacity-60" : ""}`}>
      <CardContent className="p-4 max-[650px]:p-3">
        <div className="flex max-[650px]:flex-col items-start justify-between mb-3 max-[650px]:gap-2">
          <div className="flex-1 max-[650px]:w-full">
            <h3 className="font-semibold text-gray-900 mb-1 max-[650px]:text-sm">{invitation.meetupTitle}</h3>
            <div className="flex items-center gap-2 text-sm max-[650px]:text-xs text-gray-600 mb-2">
              <User className="w-3 h-3 flex-shrink-0" />
              <span>
                {type === "received"
                  ? `From: ${invitation.senderName}`
                  : `To: ${invitation.recipientName}`}
              </span>
            </div>
          </div>
          <Badge
            className={
              status === "accepted"
                ? "bg-green-100 text-green-800"
                : status === "rejected"
                ? "bg-red-100 text-red-800"
                : expired
                ? "bg-gray-100 text-gray-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {expired && isPending ? "Expired" : status}
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-sm max-[650px]:text-xs text-gray-600">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{getDestinationName(invitation.destination)}</span>
          </div>
          <div className="flex max-[650px]:flex-col items-center max-[650px]:items-start gap-4 max-[650px]:gap-1 text-sm max-[650px]:text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{invitation.dateTime?.split("T")[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(invitation.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        {type === "received" && isPending && !expired && (
          <div className="flex gap-2 pt-3 border-t">
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 max-[650px]:text-xs max-[650px]:px-2"
            >
              <X className="w-4 h-4 max-[650px]:w-3 max-[650px]:h-3 max-[650px]:mr-0.5 mr-1" />
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white max-[650px]:text-xs max-[650px]:px-2"
            >
              <Check className="w-4 h-4 max-[650px]:w-3 max-[650px]:h-3 max-[650px]:mr-0.5 mr-1" />
              Accept
            </Button>
          </div>
        )}

        {/* Status message */}
        {type === "received" && status !== "pending" && (
          <p className="text-xs text-gray-500 pt-3 border-t">
            {status === "accepted"
              ? "You accepted this invitation"
              : "You rejected this invitation"}
            {invitation.respondedAt &&
              ` on ${new Date(invitation.respondedAt).toLocaleDateString()}`}
          </p>
        )}

        {/* --- Delete Button (for both types) --- */}
        <div className="pt-3 border-t mt-3 flex justify-end">
          <Button
            onClick={handleDelete}
            disabled={isProcessing}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}