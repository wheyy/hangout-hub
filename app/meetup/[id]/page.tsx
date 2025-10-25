"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, ArrowLeft } from "lucide-react"
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
import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"

interface MeetupPageProps {
  params: { id: string }
}

export default function MeetupPage({ params }: MeetupPageProps) {
  // MeetupController
  const [activeTab, setActiveTab] = useState<"map" | "tracking">("tracking")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const CURRENT_USER = useUserStore((s) => s.user)
  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const router = useRouter()

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

  // MeetupView
  return (
    <AuthGuard>
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader currentPage="meetups" isAuthenticated={true} />

      {/* Meetup Header */}
      <header className="bg-white border-b px-4 py-3">
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
              {meetup.getStatus() === "active" ? <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge> : <Badge className="bg-gray-100 text-gray-800 text-xs">Past</Badge>}
              {isCreator && <Badge className="bg-purple-100 text-purple-800 text-xs">Creator</Badge>}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Only visible on mobile */}
        <div className="flex gap-1 mt-3 max-[650px]:flex min-[651px]:hidden">
          <Button
            variant={activeTab === "tracking" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tracking")}
            className={activeTab === "tracking" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-1" />
            Group Management
          </Button>
          <Button
            variant={activeTab === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("map")}
            className={activeTab === "map" ? "bg-blue-600 text-white" : ""}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Live Map
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile: Tab-based layout */}
        <div className="max-[650px]:block min-[651px]:hidden h-full">
          {activeTab === "map" ? (
            <LiveMapView meetup={meetup} />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <GroupManagement
                cur_meetup={meetup}
                isCreator={isCreator}
                canInvite={canInvite}
                onInvite={() => setIsInviteModalOpen(true)}
                onDelete={() => setIsDeleteModalOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Desktop: 2-column grid layout */}
        <div className="max-[650px]:hidden min-[651px]:grid min-[651px]:grid-cols-2 h-full overflow-hidden">
          <div className="h-full overflow-y-auto p-4 border-r">
            <GroupManagement
              cur_meetup={meetup}
              isCreator={isCreator}
              canInvite={canInvite}
              onInvite={() => setIsInviteModalOpen(true)}
              onDelete={() => setIsDeleteModalOpen(true)}
            />
          </div>
          <div className="h-full overflow-hidden">
            <LiveMapView meetup={meetup} />
          </div>
        </div>
      </div>

      {/* Send Invite Modal */}
      <SendInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        meetup={meetup}
      />

      {/* Delete Meetup Modal */}
      <DeleteMeetupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        meetup={meetup}
      />

      {/* Toaster for notifications */}
      <Toaster />
    </div>
    </AuthGuard>
  )
}
