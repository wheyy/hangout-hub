"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Check, X, User } from "lucide-react"
import { Invitation } from "@/lib/data/invitation"
import { isInvitationExpired } from "@/lib/invitation-utils"

interface InvitationCardProps {
  invitation: Invitation
  type: "received" | "sent"
  onAccept?: (invitation: Invitation) => void
  onReject?: (invitation: Invitation) => void
}

export function InvitationCard({ invitation, type, onAccept, onReject }: InvitationCardProps) {
  const expired = isInvitationExpired(invitation)
  const isPending = invitation.status === "pending"

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
            className={`max-[650px]:text-xs max-[650px]:self-end ${
              invitation.status === "accepted"
                ? "bg-green-100 text-green-800"
                : invitation.status === "rejected"
                ? "bg-red-100 text-red-800"
                : expired
                ? "bg-gray-100 text-gray-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {expired && isPending ? "Expired" : invitation.status}
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-sm max-[650px]:text-xs text-gray-600">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{invitation.destination}</span>
          </div>
          <div className="flex max-[650px]:flex-col items-center max-[650px]:items-start gap-4 max-[650px]:gap-1 text-sm max-[650px]:text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{new Date(invitation.dateTime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{new Date(invitation.dateTime).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {type === "received" && isPending && !expired && onAccept && onReject && (
          <div className="flex gap-2 pt-3 border-t">
            <Button
              onClick={() => onReject(invitation)}
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 max-[650px]:text-xs max-[650px]:px-2"
            >
              <X className="w-4 h-4 max-[650px]:w-3 max-[650px]:h-3 max-[650px]:mr-0.5 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => onAccept(invitation)}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white max-[650px]:text-xs max-[650px]:px-2"
            >
              <Check className="w-4 h-4 max-[650px]:w-3 max-[650px]:h-3 max-[650px]:mr-0.5 mr-1" />
              Accept
            </Button>
          </div>
        )}

        {type === "received" && invitation.status !== "pending" && (
          <p className="text-xs max-[650px]:text-[10px] text-gray-500 pt-3 border-t">
            {invitation.status === "accepted" ? "You accepted this invitation" : "You rejected this invitation"}
            {invitation.respondedAt && ` on ${new Date(invitation.respondedAt).toLocaleDateString()}`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
