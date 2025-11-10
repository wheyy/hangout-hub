"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Users,
  UserPlus,
  Calendar,
  Clock,
  Navigation,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { CreateMeetupModal } from "@/components/meetup/create-meetup-modal"
import { InvitationCard } from "@/components/meetup/invitation-card"
import { useUserStore } from "@/hooks/user-store"
import { fetchInvitations } from "@/lib/services/invitations"
import { Invitation } from "@/lib/models/invitation"
import { AuthGuard } from "@/components/layout/auth-guard"
import { AppHeader } from "@/components/layout/app-header"
import { useSearchParams, useRouter } from "next/navigation"

export default function MeetupsPage() {
// MeetupsController
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const CURRENT_USER = useUserStore((s) => s.user)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  console.log("MeetupsPage render, CURRENT_USER:", CURRENT_USER)

  // Get meetups directly from CURRENT_USER object
  const meetups = CURRENT_USER?.getMeetups?.() ?? []

  // Filter meetups
  const activeMeetups = useMemo(
    () => meetups.filter((meetup) => meetup.getStatus() === "active"),
    [meetups]
  )
  
  // Recalculate pastMeetup
  const pastMeetups = useMemo(
    () => meetups.filter((meetup) => meetup.getStatus() === "past"),
    [meetups]
  )

  // Load invitations from Firestore
  useEffect(() => {
    async function loadData() {
      if (!CURRENT_USER?.id) return
      
      try {
        const invites = await fetchInvitations(CURRENT_USER.id)
        setInvitations(invites)
      } catch (err) {
        console.error("Error fetching invitations:", err)
      }
    }

    loadData()
  }, [CURRENT_USER])

  // ✅ Filter invitations for current user
  const receivedInvitations = invitations.filter(
    (inv) => inv.recipientId === CURRENT_USER?.id
  )
  const sentInvitations = invitations.filter(
    (inv) => inv.senderId === CURRENT_USER?.id
  )
  const pendingReceived = receivedInvitations.filter(
    (inv) => inv.status === "pending"
  )

  // ✅ Handle deletion from child
  const handleInvitationDeleted = (id: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id))
  }

  // ✅ Helper to safely get destination name (handles both string and object)
  const getDestinationName = (destination: any) => {
    if (typeof destination === 'string') return destination
    return destination?.name || 'Unknown location'
  }

  // MeetupsView
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AppHeader currentPage="meetups" isAuthenticated={true} />

        <div className="max-w-6xl mx-auto p-6 max-[650px]:p-4">
          {/* Page Header */}
          <div className="mb-8 max-[650px]:mb-6">
            <h1 className="text-2xl max-[650px]:text-xl font-bold text-gray-900 mb-2">Meetups</h1>
            <p className="text-gray-600 max-[650px]:text-sm mb-4">
              Manage your meetup invitations and coordinate with friends.
            </p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white max-[650px]:text-sm"
            >
              <Users className="w-4 h-4 max-[650px]:w-3 max-[650px]:h-3 mr-2" />
              Create Meet-Up
            </Button>
          </div>

          {/* Active & Past Meetups - Side by Side on Desktop */}
          <div className="grid grid-cols-1 min-[651px]:grid-cols-2 gap-6 mb-6">
            {/* Active Meetups Section */}
            <Card>
              <CardHeader className="max-[650px]:p-4">
                <CardTitle className="flex items-center gap-2 text-lg max-[650px]:text-base">
                  <Navigation className="w-5 h-5 max-[650px]:w-4 max-[650px]:h-4" />
                  Active Meetups ({activeMeetups.length})
                </CardTitle>
                <p className="text-sm max-[650px]:text-xs text-gray-600">
                  Your current and ongoing meetup sessions.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeMeetups.length > 0 ? (
                    activeMeetups.map((meetup) => (
                      <Link key={meetup.id} href={`/meetup/${meetup.id}`} className="block">
                        <div className="flex flex-col gap-2 p-4 max-[650px]:p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 max-[650px]:w-8 max-[650px]:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="w-5 h-5 max-[650px]:w-4 max-[650px]:h-4 text-white" />
                            </div>
                            <h3 className="font-medium text-gray-900 max-[650px]:text-sm">{meetup.title}</h3>
                          </div>
                          <div className="flex flex-col gap-0.5 text-sm max-[650px]:text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{getDestinationName(meetup.destination)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span>{meetup.getDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{meetup.getTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span>{meetup.getMemberCount()}/10 members</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 max-[650px]:py-8">
                      <div className="w-16 h-16 max-[650px]:w-12 max-[650px]:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation className="w-8 h-8 max-[650px]:w-6 max-[650px]:h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 max-[650px]:text-sm">
                        No active meetups. Create or join a meetup to get started.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Past Meetups Section */}
            <Card>
              <CardHeader className="max-[650px]:p-4">
                <CardTitle className="flex items-center gap-2 text-lg max-[650px]:text-base">
                  <Clock className="w-5 h-5 max-[650px]:w-4 max-[650px]:h-4" />
                  Past Meetups ({pastMeetups.length})
                </CardTitle>
                <p className="text-sm max-[650px]:text-xs text-gray-600">
                  Your completed meetup sessions.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastMeetups.length > 0 ? (
                    pastMeetups.map((meetup) => (
                      <Link key={meetup.id} href={`/meetup/${meetup.id}`} className="block">
                        <div className="flex flex-col gap-2 p-4 max-[650px]:p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 max-[650px]:w-8 max-[650px]:h-8 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="w-5 h-5 max-[650px]:w-4 max-[650px]:h-4 text-white" />
                            </div>
                            <h3 className="font-medium text-gray-900 max-[650px]:text-sm">{meetup.title}</h3>
                          </div>
                          <div className="flex flex-col gap-0.5 text-sm max-[650px]:text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{getDestinationName(meetup.destination)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span>{meetup.getDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{meetup.getTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span>{meetup.getMemberCount()}/10 members</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 max-[650px]:py-8">
                      <div className="w-16 h-16 max-[650px]:w-12 max-[650px]:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 max-[650px]:w-6 max-[650px]:h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 max-[650px]:text-sm">No past meetups yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invitations Section */}
          <Card>
            <CardHeader className="max-[650px]:p-4">
              <CardTitle className="flex items-center gap-2 text-lg max-[650px]:text-base">
                <Mail className="w-5 h-5 max-[650px]:w-4 max-[650px]:h-4" />
                Invitations
              </CardTitle>
              <p className="text-sm max-[650px]:text-xs text-gray-600">
                Manage your meetup invitations.
              </p>
            </CardHeader>
            <CardContent className="max-[650px]:p-4">
              <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="received" className="relative max-[650px]:text-xs">
                    Received
                    {pendingReceived.length > 0 && (
                      <Badge className="ml-2 max-[650px]:ml-1 bg-red-600 text-white text-xs max-[650px]:text-[10px] px-1.5 py-0">
                        {pendingReceived.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="max-[650px]:text-xs">Sent</TabsTrigger>
                </TabsList>

                {/* Received Invitations */}
                <TabsContent value="received" className="mt-4">
                  {receivedInvitations.length === 0 ? (
                    <div className="text-center py-12 max-[650px]:py-8">
                      <div className="w-16 h-16 max-[650px]:w-12 max-[650px]:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 max-[650px]:w-6 max-[650px]:h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 max-[650px]:text-sm">
                        No invitations received yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {receivedInvitations.map((invitation) => (
                        <InvitationCard
                          key={invitation.id}
                          invitation={invitation}
                          type="received"
                          onDeleted={handleInvitationDeleted}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Sent Invitations */}
                <TabsContent value="sent" className="mt-4">
                  {sentInvitations.length === 0 ? (
                    <div className="text-center py-12 max-[650px]:py-8">
                      <div className="w-16 h-16 max-[650px]:w-12 max-[650px]:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 max-[650px]:w-6 max-[650px]:h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 max-[650px]:text-sm">
                        No invitations sent yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sentInvitations.map((invitation) => (
                        <InvitationCard
                          key={invitation.id}
                          invitation={invitation}
                          type="sent"
                          onDeleted={handleInvitationDeleted}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Create Meetup Modal */}
        <CreateMeetupModal 
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setIsCreateModalOpen(false)
            router.replace('/meetups', { scroll: false })
          }}
        />
      </div>
    </AuthGuard>
  )
}