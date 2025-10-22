// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { User, Mail, MapPin, Calendar, Users, Edit3, Save, X } from "lucide-react"
// import { Navbar } from "@/components/navbar"

// export default function ProfilePage() {
//   const [isEditing, setIsEditing] = useState(false)
//   const [profile, setProfile] = useState({
//     name: "Alex Johnson",
//     email: "alex.johnson@email.com",
//     // bio: "Coffee enthusiast and meetup organizer. Love connecting with new people and exploring the city!",
//     // location: "Marina Bay, Singapore",
//     joinDate: "2024-01-15",
//     totalMeetups: 12,
//     hostedMeetups: 3,
//     // interests: ["Coffee", "Networking", "Tech", "Photography"],
//   })

//   const [editedProfile, setEditedProfile] = useState(profile)

//   const handleSave = () => {
//     setProfile(editedProfile)
//     setIsEditing(false)
//   }

//   const handleCancel = () => {
//     setEditedProfile(profile)
//     setIsEditing(false)
//   }

// //   const handleInterestRemove = (interest: string) => {
// //     setEditedProfile((prev) => ({
// //       ...prev,
// //       interests: prev.interests.filter((i) => i !== interest),
// //     }))
// //   }

// //   const handleInterestAdd = (interest: string) => {
// //     if (interest.trim() && !editedProfile.interests.includes(interest.trim())) {
// //       setEditedProfile((prev) => ({
// //         ...prev,
// //         interests: [...prev.interests, interest.trim()],
// //       }))
// //     }
// //   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <div className="container max-w-4xl mx-auto py-8 px-4">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Profile</h1>
//             <p className="text-muted-foreground mt-1">Manage your account information and preferences.</p>
//           </div>

//           {!isEditing ? (
//             <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
//               <Edit3 className="w-4 h-4 mr-2" />
//               Edit Profile
//             </Button>
//           ) : (
//             <div className="flex gap-2">
//               <Button onClick={handleCancel} variant="outline">
//                 <X className="w-4 h-4 mr-2" />
//                 Cancel
//               </Button>
//               <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
//                 <Save className="w-4 h-4 mr-2" />
//                 Save Changes
//               </Button>
//             </div>
//           )}
//         </div>

//         <div className="grid gap-6 md:grid-cols-3">
//           {/* Profile Overview Card */}
//           <Card className="md:col-span-1">
//             <CardHeader className="text-center">
//               <div className="flex justify-center mb-4">
//                 <Avatar className="w-24 h-24">
//                   <AvatarImage src="/professional-headshot.png" />
//                   <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
//                     {profile.name
//                       .split(" ")
//                       .map((n) => n[0])
//                       .join("")}
//                   </AvatarFallback>
//                 </Avatar>
//               </div>
//               <CardTitle className="text-xl">{profile.name}</CardTitle>
//               {/* <CardDescription className="flex items-center justify-center gap-1">
//                 <MapPin className="w-4 h-4" />
//                 {profile.location}
//               </CardDescription> */}
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <Calendar className="w-4 h-4" />
//                 <span>
//                   Joined {new Date(profile.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-4 pt-4 border-t">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">{profile.totalMeetups}</div>
//                   <div className="text-xs text-muted-foreground">Meetups Attended</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">{profile.hostedMeetups}</div>
//                   <div className="text-xs text-muted-foreground">Meetups Hosted</div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Profile Details Card */}
//           <Card className="md:col-span-2">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <User className="w-5 h-5" />
//                 Personal Information
//               </CardTitle>
//               <CardDescription>Your basic profile information.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//             <div className="space-y-2">
//                   <Label htmlFor="name">Name</Label>
//                   {isEditing ? (
//                     <Input
//                       id="name"
//                       value={editedProfile.name}
//                       onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
//                     />
//                   ) : (
//                     <div className="px-3 py-2 bg-muted rounded-md">{profile.name}</div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email Address</Label>
//                   {isEditing ? (
//                     <Input
//                       id="email"
//                       type="email"
//                       value={editedProfile.email}
//                       onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
//                     />
//                   ) : (
//                     <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
//                       <Mail className="w-4 h-4" />
//                       {profile.email}
//                     </div>
//                   )}
//                 </div>
//               {/* <div className="grid gap-4 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">Name</Label>
//                   {isEditing ? (
//                     <Input
//                       id="name"
//                       value={editedProfile.name}
//                       onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
//                     />
//                   ) : (
//                     <div className="px-3 py-2 bg-muted rounded-md">{profile.name}</div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email Address</Label>
//                   {isEditing ? (
//                     <Input
//                       id="email"
//                       type="email"
//                       value={editedProfile.email}
//                       onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
//                     />
//                   ) : (
//                     <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
//                       <Mail className="w-4 h-4" />
//                       {profile.email}
//                     </div>
//                   )}
//                 </div>

//               </div> */}

//               {/* <div className="space-y-2">
//                 <Label htmlFor="location">Location</Label>
//                 {isEditing ? (
//                   <Input
//                     id="location"
//                     value={editedProfile.location}
//                     onChange={(e) => setEditedProfile((prev) => ({ ...prev, location: e.target.value }))}
//                   />
//                 ) : (
//                   <div className="px-3 py-2 bg-muted rounded-md flex items-center gap-2">
//                     <MapPin className="w-4 h-4" />
//                     {profile.location}
//                   </div>
//                 )}
//               </div> */}

//               {/* <div className="space-y-2">
//                 <Label htmlFor="bio">Bio</Label>
//                 {isEditing ? (
//                   <Textarea
//                     id="bio"
//                     rows={3}
//                     value={editedProfile.bio}
//                     onChange={(e) => setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))}
//                     placeholder="Tell us about yourself..."
//                   />
//                 ) : (
//                   <div className="px-3 py-2 bg-muted rounded-md min-h-[80px]">{profile.bio}</div>
//                 )}
//               </div> */}
//             </CardContent>
//           </Card>

//           {/* Interests Card */}
//           {/* <Card className="md:col-span-3">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Users className="w-5 h-5" />
//                 Interests
//               </CardTitle>
//               <CardDescription>Your interests help others find you for relevant meetups.</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-wrap gap-2">
//                 {(isEditing ? editedProfile.interests : profile.interests).map((interest, index) => (
//                   <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
//                     {interest}
//                     {isEditing && (
//                       <button onClick={() => handleInterestRemove(interest)} className="ml-2 hover:text-red-600">
//                         <X className="w-3 h-3" />
//                       </button>
//                     )}
//                   </Badge>
//                 ))}

//                 {isEditing && (
//                   <div className="flex items-center gap-2">
//                     <Input
//                       placeholder="Add interest..."
//                       className="w-32"
//                       onKeyPress={(e) => {
//                         if (e.key === "Enter") {
//                           handleInterestAdd(e.currentTarget.value)
//                           e.currentTarget.value = ""
//                         }
//                       }}
//                     />
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card> */}
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, User, Eye, EyeOff, Check, X } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { authService } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [deleting, setDeleting] = useState(false)

  // Current user data
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "********",
  })

  // Form data for editing
  const [formData, setFormData] = useState({
    newName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    newName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Live password requirement checks (same rules as Sign Up)
  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.newPassword.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.newPassword) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.newPassword) },
    { text: "Contains number", met: /\d/.test(formData.newPassword) },
  ]
  const newPwEntered = formData.newPassword !== ""
  const isNewPasswordValid = !newPwEntered || passwordRequirements.every((req) => req.met)
  const passwordsMatch =
    newPwEntered && formData.confirmPassword !== "" && formData.newPassword === formData.confirmPassword

  useEffect(() => {
    let mounted = true
    authService.getCurrentUser().then((u) => {
      if (!mounted) return
      if (u) {
        setUserData({ name: u.name, email: u.email, password: "********" })
        setFormData((prev) => ({ ...prev, newName: u.name }))
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const validateForm = () => {
    const newErrors = {
      newName: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }

    // Name validation (only if changed)
    if (formData.newName !== undefined && formData.newName.trim() === "") {
      newErrors.newName = "Name cannot be empty"
    }

    // Password validation (only if changing password)
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password"
      }
      // Enforce same rules as Sign Up
      if (!passwordRequirements.every((r) => r.met)) {
        newErrors.newPassword = "Please ensure your password meets all requirements."
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your new password"
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((error) => error === "")
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage("")
    setMessageType("")
    // Ensure the edit input reflects the latest displayed name
    setFormData((prev) => ({ ...prev, newName: userData.name }))
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({ newName: userData.name, currentPassword: "", newPassword: "", confirmPassword: "" })
    setErrors({ newName: "", currentPassword: "", newPassword: "", confirmPassword: "" })
    setMessage("")
    setMessageType("")
  }

  const handleConfirm = async () => {
    setMessage("")
    setMessageType("")
    if (!validateForm()) return
    try {
      let updatedName = userData.name
      // Update name if changed
      if (formData.newName && formData.newName.trim() && formData.newName.trim() !== userData.name) {
        updatedName = formData.newName.trim()
        await authService.updateName(updatedName)
        setUserData((prev) => ({ ...prev, name: updatedName }))
      }
      if (formData.newPassword) {
        await authService.updatePassword(formData.currentPassword, formData.newPassword)
        setUserData((prev) => ({ ...prev, password: "********" }))
      }
      setMessage("Profile updated successfully")
      setMessageType("success")
      setIsEditing(false)
      // Reset form using the latest applied value to avoid flashing the old name on next edit
      setFormData({ newName: updatedName, currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update profile")
      setMessageType("error")
    }
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      router.push("/auth/login")
    } catch (e) {
      setMessage("Failed to sign out. Please try again.")
      setMessageType("error")
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setMessage("")
    setMessageType("")
    try {
      await authService.deleteAccount()
      // Redirect after deletion
      router.push("/auth/login")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete account"
      setMessage(msg)
      setMessageType("error")
    } finally {
      setDeleting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">Hangout Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <MapPin className="w-4 h-4 mr-1" />
              Map
            </Button>
          </Link>
          <Link href="/meetups">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Users className="w-4 h-4 mr-1" />
              Meetups
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
            <User className="w-4 h-4 mr-1" />
            Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>Manage your account information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success/Error Message */}
            {message && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {messageType === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {message}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <div>
                  <Input
                    id="name"
                    value={formData.newName}
                    onChange={(e) => handleInputChange("newName", e.target.value)}
                    className={errors.newName ? "border-red-500" : ""}
                    placeholder="Enter full name"
                  />
                  {errors.newName && <p className="text-sm text-red-600 mt-1">{errors.newName}</p>}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-gray-900">{userData.name}</div>
              )}
            </div>

            {/* Email Field (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="p-3 bg-gray-50 rounded-md text-gray-900">{userData.email}</div>
            </div>

            {/* Password Fields */}
            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      className={errors.currentPassword ? "border-red-500" : ""}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.currentPassword && <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      className={errors.newPassword ? "border-red-500" : ""}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
                  {/* Password Requirements (live) */}
                  {formData.newPassword && (
                    <div className="space-y-1 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className={`w-3 h-3 ${req.met ? "text-green-600" : "text-gray-400"}`} />
                          <span className={req.met ? "text-green-600" : "text-gray-500"}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Check className={`w-3 h-3 ${passwordsMatch ? "text-green-600" : "text-gray-400"}`} />
                      <span className={passwordsMatch ? "text-green-600" : "text-gray-500"}>Passwords match</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleConfirm}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={
                      formData.newPassword !== "" && (!isNewPasswordValid || !passwordsMatch || !formData.currentPassword)
                    }
                  >
                    Confirm
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                  Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  )
}

