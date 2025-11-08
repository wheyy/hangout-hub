
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MapPin, Users, Navigation, Shield, Clock, AlertCircle, CheckCircle, Mail, UserX, Edit, Save, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { User } from "@/lib/models/user"
import { Meetup } from "@/lib/models/meetup"
import { useUserStore } from "@/hooks/user-store"
import { useRouter } from "next/navigation"


interface GroupManagementProps {
  cur_meetup: Meetup
  isCreator: boolean
  canInvite: boolean
  onInvite: () => void
  onDelete: () => void
}

export function GroupManagement({
  cur_meetup,
  isCreator,
  canInvite,
  onInvite,
  onDelete,
}: GroupManagementProps) {
  // GroupManagementController
  const [meetup, setMeetup] = useState<Meetup>(cur_meetup)
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)
  const groupMembers = meetup.getMembers()
  const CURRENT_USER = useUserStore((s) => s.user)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: "",
    destination: "",
    date: "",
    time: "",
  })
  const router = useRouter()


  const onEdit = () => {
    setEditData({
      title: meetup.title,
      destination: meetup.destination.name,
      date: meetup.dateTime.toISOString().split("T")[0], // "YYYY-MM-DD"
      time: meetup.dateTime.toTimeString().split(" ")[0].slice(0, 5), // "HH:mm"
    })
    setIsEditing(true)
  }

  const onSaveEdit = () => {
    const [year, month, day] = editData.date.split("-").map(Number)
    const [hour, minute] = editData.time.split(":").map(Number)

    const oldStatus = meetup.getStatus()
    // Note: Destination editing disabled for now - would need autocomplete implementation
    meetup.updateTitle(editData.title)
    meetup.updateDateTime(new Date(year, month - 1, day, hour, minute))
    meetup.save()
    setMeetup(meetup)
    setIsEditing(false)
    console.log("new status", meetup.getStatus())
    const newStatus = meetup.getStatus()
    if (oldStatus !== newStatus) {
      router.push("/meetups")
    }
  }

  const onCancelEdit = () => {
    setIsEditing(false)
    setEditData({ title: "", destination: "", date: "", time: "" })
  }

  const handleKickUser = (member: User) => {
    console.log(`Kicking user ${member.getUsername()} (${member.getId}) from meetup`)
    meetup.removeMember(member).then(() => {
      console.log(`User ${member.getUsername()} has been kicked from the meetup.`)
    })
    router.refresh()
  }

  const handleLeave = () => {
    if (!CURRENT_USER) return
    console.log(`User ${CURRENT_USER.getUsername()} is leaving meetup ${meetup.title}`)
    meetup.removeMember(CURRENT_USER).then(() => {
      console.log(`User ${CURRENT_USER.getUsername()} has left the meetup.`)
      router.push("/meetups")
    })
  }

  // GroupManagementView
  return (
    <div className="space-y-4">
      {/* Meetup Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Meetup Details
            </div>
            {isCreator && !isEditing && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {isCreator && isEditing && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={onSaveEdit} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing && editData && setEditData ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Meetup Name</label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  placeholder="Enter meetup name"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                <Input
                  value={editData.destination}
                  onChange={(e) => setEditData({ ...editData, destination: e.target.value })}
                  placeholder="Enter destination"
                  className="text-sm"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Destination editing is currently disabled</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <Input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                <p className="text-sm text-gray-900 font-medium">{meetup.title}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{meetup.destination.name}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date & Time</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{meetup.getDateString()} at {meetup.getTimeString()}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Members</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{meetup.getMemberCount()} / 10 members</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Arrived</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{meetup.getArrivedMemberCount()} members arrived</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Invite Section - Only for creator if can invite */}
      {isCreator && canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5" />
              Invite Members
            </CardTitle>
            <p className="text-sm text-gray-600">Add more friends to this meetup</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onInvite}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Group Members Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Members ({groupMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {groupMembers.map((member: User) => (
              <div
                key={member.id}
                className="relative flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <div className="flex items-center gap-2">
                      {/* <Badge
                        variant={member.status === "online" ? "default" : "secondary"}
                        className={`text-xs ${
                          member.status === "online"
                            ? "bg-green-100 text-green-800"
                            : member.status === "arrived"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.status === "online" ? "Online" : member.status === "arrived" ? "Arrived" : "Offline"}
                      </Badge> */}
                      {/* {member.isSharing && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>Sharing location</span>
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* {member.location && (
                    <div className="text-xs text-gray-500">
                      <div>Updated {Math.floor((Date.now() - member.location.timestamp) / 1000)}s ago</div>
                    </div>
                  )} */}

                  {(hoveredMember != meetup.creator.getId()) && (isCreator) && (hoveredMember === member.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleKickUser(member)}
                      className="ml-2 h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      <UserX className="w-4 h-4" />
                      <span className="ml-1 text-xs">Kick</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* End/Leave Meetup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meetup Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isCreator ? (
            <Button
              onClick={onDelete}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              End Meetup
            </Button>
          ) : (
            <Button
              onClick={handleLeave}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <UserX className="w-4 h-4 mr-2" />
              Leave Meetup
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

