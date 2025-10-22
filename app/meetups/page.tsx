"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, UserPlus, Calendar, Clock, Navigation, Mail, Send } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { CreateMeetupModal } from "@/components/meetup/create-meetup-modal"
import { Navbar } from "@/components/navbar"
import { InvitationCard } from "@/components/invitation-card"
import { useUserStore } from "@/hooks/user-store"
import { getInvitations, saveInvitations, getMeetups } from "@/lib/invitation-utils"
import { Meetup } from "@/lib/data/meetup"
import { Invitation } from "../../lib/data/invitation"
import { ChevronDown, ChevronUp } from "lucide-react"; // Icons for dropdown toggle
import { AuthGuard } from "@/components/auth-guard"


export default function MeetupsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  // const [meetups, setMeetups] = useState<Meetup[]>([])
  const CURRENT_USER = useUserStore((s) => s.user); // Subscribe to changes
  console.log("CURRENT_USER loaded at MeetupsPage():", CURRENT_USER);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility
  console.log("Rendering MeetupsPage, CURRENT_USER:", CURRENT_USER);
  const meetups = CURRENT_USER?.getMeetups() ?? [];

  // ✅ Recalculate activeMeetups whenever meetups changes
  const activeMeetups = useMemo(() => 
    meetups.filter((meetup) => meetup.getStatus() === "active"),
    [meetups]
  );
  
  // ✅ Recalculate pastMeetups whenever meetups changes
  const pastMeetups = useMemo(() => 
    meetups.filter((meetup) => meetup.getStatus() === "completed"),
    [meetups]
  );

  // Load data from localStorage
  useEffect(() => {
    setInvitations(getInvitations())  
    console.log("Fetching meetups for CURRENT_USER...");
    const updatedMeetups = CURRENT_USER?.getMeetups() ?? [];
    console.log("Updated meetups:", updatedMeetups);
    // setMeetups(updatedMeetups);
    console.log("Meetups new state:", meetups);
  }, [CURRENT_USER])


  // Filter invitations for current user
  const receivedInvitations = invitations.filter((inv) => inv.recipientId === CURRENT_USER!.id)
  const sentInvitations = invitations.filter((inv) => inv.senderId === CURRENT_USER!.id)
  const pendingReceived = receivedInvitations.filter((inv) => inv.status === "pending")



  const handleAcceptInvitation = (invitation: Invitation) => {
    // Update invitation status
    const updatedInvitations = invitations.map((inv) =>
      inv.id === invitation.id
        ? { ...inv, status: "accepted" as const, respondedAt: new Date().toISOString() }
        : inv
    )
    saveInvitations(updatedInvitations)
    setInvitations(updatedInvitations)

    // Add user to meetup members
    const updatedMeetups = meetups.map((meetup) => {
      if (meetup.id === invitation.meetupId) {
        return {
          ...meetup,
          // members: [...meetup.getMembers(), CURRENT_USER.id],
          members: [...meetup.getMembers()],
          memberCount: meetup.getMemberCount(),
        }
      }
      return meetup
    })
    // saveMeetups(updatedMeetups)
    // setMeetups(updatedMeetups)

    alert("Invitation accepted! You've joined the meetup.")
  }

  const handleRejectInvitation = (invitation: Invitation) => {
    const updatedInvitations = invitations.map((inv) =>
      inv.id === invitation.id
        ? { ...inv, status: "rejected" as const, respondedAt: new Date().toISOString() }
        : inv
    )
    saveInvitations(updatedInvitations)
    setInvitations(updatedInvitations)
  }

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meetups</h1>
          <p className="text-gray-600">Manage your meetup invitations and coordinate with friends.</p>
        </div>

        {/* Active Meetups Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Navigation className="w-5 h-5" />
                Active Meetups ({activeMeetups.length})
              </CardTitle>
              <p className="text-sm text-gray-600">Your current and ongoing meetup sessions.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
              {activeMeetups.length > 0 ?  
                (activeMeetups.map((meetup) => (
                  <Link key={meetup.id} href={`/meetup/${meetup.id}`}>
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{meetup.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{meetup.destination}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{meetup.getDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{meetup.getTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">{meetup.getMemberCount()}/10</Badge>
                      </div>
                    </div>
                  </Link>
                ))
                ) 
                  : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No active meetups. Create or join a meetup to get started.</p>
                    </div>
                  )
              }

{pastMeetups.length > 0 && (
      <div className="mt-6">
        {/* Dropdown Header */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsDropdownOpen((prev) => !prev)} // Toggle dropdown visibility
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Past Meetups ({pastMeetups.length})
          </h2>
          {isDropdownOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>

        {/* Dropdown Content */}
        {isDropdownOpen && (
          <div className="space-y-3 mt-3">
            {pastMeetups.map((meetup) => (
              <Link key={meetup.id} href={`/meetup/${meetup.id}`}>
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{meetup.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{meetup.destination}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{meetup.getDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{meetup.getTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-200 text-gray-800">
                      {meetup.getMemberCount()}/10
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )}                          
              </div>
            </CardContent>
          </Card>

        {/* Create Meetup Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5" />
              Create Meetup
            </CardTitle>
            <p className="text-sm text-gray-600">Start a new meetup session with your friends.</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full bg-gray-900 hover:bg-gray-700 text-white">
              {/* or bg-blue-600 hover: bg-blue-800 */}
              <Users className="w-4 h-4 mr-2" />
              Create Meet-Up
            </Button>
          </CardContent>
        </Card>

        {/* Invitations Section with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5" />
              Invitations
            </CardTitle>
            <p className="text-sm text-gray-600">Manage your meetup invitations.</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="received" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="received" className="relative">
                  Received
                  {pendingReceived.length > 0 && (
                    <Badge className="ml-2 bg-red-600 text-white text-xs px-1.5 py-0">
                      {pendingReceived.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
              </TabsList>

              <TabsContent value="received" className="mt-4">
                {receivedInvitations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No invitations received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receivedInvitations.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        type="received"
                        onAccept={handleAcceptInvitation}
                        onReject={handleRejectInvitation}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sent" className="mt-4">
                {sentInvitations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No invitations sent yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentInvitations.map((invitation) => (
                      <InvitationCard key={invitation.id} invitation={invitation} type="sent" />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Create Meetup Modal */}
      <CreateMeetupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}/>
    </div>
    </AuthGuard>
  )
}