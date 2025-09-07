"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Mail, UserPlus, Calendar, Clock, MapPinIcon, Navigation } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CreateMeetupModal } from "@/components/create-meetup-modal"
import { Navbar } from "@/components/navbar"

export default function MeetupsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  // Mock active meetups
  const activeMeetups = [
    {
      id: "1",
      title: "Coffee at Marina Bay",
      destination: "Marina Bay Sands SkyPark",
      date: "2025-06-09",
      time: "08:21",
      status: "active",
      memberCount: 3,
      isLocationSharing: true,
    },
  ]

  const invitations: { id: string; title: string; status: string }[] = [
    // Empty for now - matches the "No invitations yet" state in screenshot
  ]

  const handleGenerateLink = () => {
    // Generate invite link logic
    console.log("Generating invite link for:", inviteEmail)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meetups</h1>
          <p className="text-gray-600">Manage your meetup invitations and coordinate with friends.</p>
        </div>

        {/* Active Meetups Section */}
        {activeMeetups.length > 0 && (
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
                {activeMeetups.map((meetup) => (
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
                              <span>{meetup.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{meetup.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">{meetup.memberCount} members</Badge>
                        {meetup.isLocationSharing && <Badge className="bg-blue-100 text-blue-800">Live tracking</Badge>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Invite Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5" />
                Send Invite
              </CardTitle>
              <p className="text-sm text-gray-600">Generate a shareable invite link for your meetup.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleGenerateLink} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Generate Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Meetup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5" />
                Create Meetup
              </CardTitle>
              <p className="text-sm text-gray-600">Start a new meetup session with your friends.</p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Meet-Up
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Invitations Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Invitations ({invitations.length})
            </CardTitle>
            <p className="text-sm text-gray-600">Manage sent invitations and their status.</p>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No invitations yet. Generate your first invite above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((invitation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    {/* Invitation details would go here */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Meetup Modal */}
      <CreateMeetupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
