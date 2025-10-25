"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Users, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { useState } from "react"
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

interface AppHeaderProps {
  currentPage: "map" | "meetups" | "profile"
  isAuthenticated: boolean
}

export function AppHeader({ currentPage, isAuthenticated }: AppHeaderProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await authService.signOut()
      router.push("/auth/login")
    } catch (e) {
      console.error("Failed to sign out:", e)
      setSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl max-[600px]:text-sm font-semibold text-gray-900">Hangout Hub</span>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className={
              currentPage === "map"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            <MapPin className="w-4 h-4 max-[600px]:mr-0 mr-1" />
            <span className="max-[600px]:hidden">Map</span>
          </Button>
        </Link>
        <Link href={isAuthenticated ? "/meetups" : "/auth/login"}>
          <Button
            variant="ghost"
            size="sm"
            className={
              currentPage === "meetups"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            <Users className="w-4 h-4 max-[600px]:mr-0 mr-1" />
            <span className="max-[600px]:hidden">Meetups</span>
          </Button>
        </Link>
        {isAuthenticated ? (
          <>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className={
                  currentPage === "profile"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                <User className="w-4 h-4 max-[600px]:mr-0 mr-1" />
                <span className="max-[600px]:hidden">Profile</span>
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={signingOut}>
                  {signingOut ? "Signing out..." : "Sign out"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You'll need to log in again to access your meetups and profile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Sign up
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
