"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authController } from "@/lib/auth/auth-service"
import { MapPin } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
  const user = await authController.getCurrentUser()
        setIsAuthenticated(!!user)

        if (requireAuth && !user) {
          router.replace("/auth/login")
          return
        }

        if (!requireAuth && user) {
          router.replace("/")
          return
        }
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        if (requireAuth) {
          router.push("/auth/login")
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hangout Hub</h1>
          </div>
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}
