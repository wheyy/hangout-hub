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
import { User, Eye, EyeOff, Check, X } from "lucide-react"
import { useEffect, useState } from "react"
import { authController } from "@/lib/auth/auth-service"
import { AuthGuard } from "@/components/layout/auth-guard"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")

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
  authController.getCurrentUser().then((u) => {
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
  await authController.changeDisplayName(updatedName)
        setUserData((prev) => ({ ...prev, name: updatedName }))
      }
      if (formData.newPassword) {
  await authController.changePassword(formData.currentPassword, formData.newPassword)
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

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setMessage("")
    setMessageType("")
    try {
  await authController.deleteAccount()
      // Redirect after deletion
      router.push("/auth/login")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete account"
      setMessage(msg)
      setMessageType("error")
    } finally {
      setDeleting(false)
      setDeleteConfirm("")
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
      <AppHeader currentPage="profile" isAuthenticated={true} />

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
                <>
                  <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and associated data. This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                          <Input
                            id="deleteConfirm"
                            placeholder="DELETE"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                          />
                          {deleteConfirm && deleteConfirm !== "DELETE" && (
                            <p className="text-sm text-red-600">Confirmation must exactly match DELETE</p>
                          )}
                        </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting} onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting || deleteConfirm !== "DELETE"}>
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  )
}

