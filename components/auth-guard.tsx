"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

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
        const user = await authService.getCurrentUser()
        setIsAuthenticated(!!user)

        if (requireAuth && !user) {
          router.push("/auth/login")
          return
        }

        if (!requireAuth && user) {
          router.push("/search")
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
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-5 h-5 bg-white rounded"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
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
