"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, MapPin, Calendar, Users, Edit3, Save, X } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    // bio: "Coffee enthusiast and meetup organizer. Love connecting with new people and exploring the city!",
    // location: "Marina Bay, Singapore",
    joinDate: "2024-01-15",
    totalMeetups: 12,
    hostedMeetups: 3,
    // interests: ["Coffee", "Networking", "Tech", "Photography"],
  })

  const [editedProfile, setEditedProfile] = useState(profile)

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

//   const handleInterestRemove = (interest: string) => {
//     setEditedProfile((prev) => ({
//       ...prev,
//       interests: prev.interests.filter((i) => i !== interest),
//     }))
//   }

//   const handleInterestAdd = (interest: string) => {
//     if (interest.trim() && !editedProfile.interests.includes(interest.trim())) {
//       setEditedProfile((prev) => ({
//         ...prev,
//         interests: [...prev.interests, interest.trim()],
//       }))
//     }
//   }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account information and preferences.</p>
          </div>

          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/professional-headshot.png" />
                  <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              {/* <CardDescription className="flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined {new Date(profile.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.totalMeetups}</div>
                  <div className="text-xs text-muted-foreground">Meetups Attended</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.hostedMeetups}</div>
                  <div className="text-xs text-muted-foreground">Meetups Hosted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <div className="px-3 py-2 bg-muted rounded-md">{profile.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </div>
                  )}
                </div>
              {/* <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <div className="px-3 py-2 bg-muted rounded-md">{profile.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </div>
                  )}
                </div>

              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile((prev) => ({ ...prev, location: e.target.value }))}
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    rows={3}
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-md min-h-[80px]">{profile.bio}</div>
                )}
              </div> */}
            </CardContent>
          </Card>

          {/* Interests Card */}
          {/* <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Interests
              </CardTitle>
              <CardDescription>Your interests help others find you for relevant meetups.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editedProfile.interests : profile.interests).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {interest}
                    {isEditing && (
                      <button onClick={() => handleInterestRemove(interest)} className="ml-2 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}

                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add interest..."
                      className="w-32"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleInterestAdd(e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}
