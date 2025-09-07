"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Users, Crown } from "lucide-react"
import { MeetupService } from "@/lib/meetup/meetup-service"
import type { MeetupSession } from "@/lib/meetup/meetup-types"

interface MembersDrawerProps {
  session: MeetupSession
}

export function MembersDrawer({ session }: MembersDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getStatusBadge = (status: string) => {
    const color = MeetupService.getStatusColor(status)
    const label = MeetupService.getStatusLabel(status)

    return (
      <Badge style={{ backgroundColor: color, color: "white" }} className="text-xs">
        {label}
      </Badge>
    )
  }

  const getLastSeen = (member: any) => {
    if (!member.lastUpdated) return null

    const secondsAgo = Math.floor((Date.now() - member.lastUpdated.getTime()) / 1000)
    if (secondsAgo < 60) return `${secondsAgo}s ago`
    const minutesAgo = Math.floor(secondsAgo / 60)
    return `${minutesAgo}m ago`
  }

  return (
    <div
      className={`absolute left-0 top-20 bottom-0 z-10 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-80"
      } bg-background/95 backdrop-blur-sm border-r border-border`}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-6 top-8 w-6 h-8 p-0 bg-background border border-border rounded-r-md z-20"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {!isCollapsed && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold">Members</h2>
            </div>
            <p className="text-sm text-muted-foreground">{session.members.length} people</p>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {session.members.map((member) => (
              <Card key={member.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {member.id === session.hostId && (
                      <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      {member.id === session.hostId && (
                        <Badge variant="outline" className="text-xs">
                          Host
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">{getStatusBadge(member.status)}</div>
                    {member.status === "sharing" && getLastSeen(member) && (
                      <p className="text-xs text-muted-foreground mt-1">Last seen {getLastSeen(member)}</p>
                    )}
                    {member.arrivedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Arrived at {member.arrivedAt.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
