"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Users, Calendar, Clock, Settings, ArrowLeft, Save, X, Mail } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { GroupManagement } from "@/components/group-management"
import { LiveMapView } from "@/components/live-map-view"
import { SendInviteModal } from "@/components/send-invite-modal"
import { Meetup } from "@/lib/data/meetup"
import { useUserStore } from "@/hooks/user-store"
import { useRouter } from "next/navigation"
import { DeleteMeetupModal } from "@/components/meetup/delete-meetup-modal"
import { Toaster } from "@/components/ui/toaster"

interface MeetupPageProps {
  params: { id: string }
}

export default function MeetupPage({ params }: MeetupPageProps) {
  const [activeTab, setActiveTab] = useState<"map" | "tracking">("map")
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false) // <-- NEW
  const [editData, setEditData] = useState({
    title: "",
    destination: "",
    date: "",
    time: "",
  })
  const CURRENT_USER = useUserStore((s) => s.user)
  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const router = useRouter()

  // Load meetup from store
  useEffect(() => {
    if (!CURRENT_USER) {
      router.push("/auth/login")
      return
    }

    const meetups = CURRENT_USER.getMeetups()
    const foundMeetup = meetups.find((m) => m.id === params.id)
    if (foundMeetup) {
      setMeetup(foundMeetup)
    } else {
      router.push("/meetups")
    }
  }, [params.id, CURRENT_USER, router])

  if (!meetup || !CURRENT_USER) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading meetup...</p>
        </div>
      </div>
    )
  }

  const isCreator = meetup.creator.getId() === CURRENT_USER.getId()
  const canInvite = isCreator && meetup.getMemberCount() < 5

  const handleSettingsClick = () => {
    setEditData({
      title: meetup.title,
      destination: meetup.destination.name,
      date: meetup.dateTime.toISOString().split("T")[0], // "YYYY-MM-DD"
      time: meetup.dateTime.toTimeString().split(" ")[0].slice(0, 5), // "HH:mm"
    })
    setIsEditing(true)
  }

  const handleSaveChanges = () => {
    const [year, month, day] = editData.date.split("-").map(Number)
    const [hour, minute] = editData.time.split(":").map(Number)

    // Note: Destination editing disabled for now - would need autocomplete implementation
    meetup.updateTitle(editData.title)
    meetup.updateDateTime(new Date(year, month - 1, day, hour, minute))
    meetup.save()
    setMeetup(meetup)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({ title: "", destination: "", date: "", time: "" })
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/meetups">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{meetup.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{meetup.destination.name}</span>
                {meetup.getStatus() === "active" ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 text-xs">Completed</Badge>
                )}
                {isCreator && <Badge className="bg-purple-100 text-purple-800 text-xs">Creator</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isCreator && canInvite && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-white"
              >
                <Mail className="w-4 h-4 mr-1" />
                Invite Members
              </Button>
            )}
            {isCreator && !isEditing ? (
              <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
                <Settings className="w-4 h-4" />
              </Button>
            ) : isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleSaveChanges} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Edit Meetup Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Meetup Name</label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter meetup name"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                <Input
                  value={editData.destination}
                  onChange={(e) => setEditData((prev) => ({ ...prev, destination: e.target.value }))}
                  placeholder="Enter destination"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData((prev) => ({ ...prev, date: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <Input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData((prev) => ({ ...prev, time: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3">
          <Button
            variant={activeTab === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("map")}
            className={activeTab === "map" ? "bg-blue-600 text-white" : ""}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Live Map
          </Button>
          <Button
            variant={activeTab === "tracking" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tracking")}
            className={activeTab === "tracking" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-1" />
            Group Management
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "map" ? (
          <LiveMapView
            meetup={meetup}
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <GroupManagement
              meetupId={meetup.id}
              meetup={meetup}
              isActive={meetup.getStatus() === "active"}
              onLocationShare={setIsLocationSharing}
              isCreator={isCreator}
              canInvite={canInvite}
              onInvite={() => setIsInviteModalOpen(true)}
              onDelete={() => setIsDeleteModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Send Invite Modal */}
      <SendInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        meetup={meetup}
      />

      {/* Delete Meetup Modal (NEW) */}
      <DeleteMeetupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        meetup={meetup}
      />

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}
