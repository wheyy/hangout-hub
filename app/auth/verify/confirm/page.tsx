"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { AuthGuard } from "@/components/layout/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/config/firebase"
import { applyActionCode } from "firebase/auth"

export default function VerifyConfirmPage() {
  const params = useSearchParams()
  const router = useRouter()
  const oobCode = params.get("oobCode") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  useEffect(() => {
    let mounted = true
    async function run() {
      // Guard against React Strict Mode double-invoking effects in dev
      const guardKey = `verify_ran_${oobCode}`
      try {
        if (typeof window !== "undefined" && sessionStorage.getItem(guardKey)) {
          // Already processed this code in this session; show success hint and redirect
          setInfo("Your email has been verified. You can now sign in.")
          setLoading(false)
          setTimeout(() => router.replace("/auth/login"), 900)
          return
        }
        if (typeof window !== "undefined") sessionStorage.setItem(guardKey, "1")
      } catch {}
      setLoading(true)
      setError("")
      setInfo("")
      if (!oobCode) {
        setError("Verification link is missing a code.")
        setLoading(false)
        return
      }
      try {
        await applyActionCode(auth, oobCode)
        if (!mounted) return
        setInfo("Your email has been verified. You can now sign in.")
        setTimeout(() => router.replace("/auth/login"), 900)
      } catch (e: any) {
        if (!mounted) return
        const code = e?.code || ""
        if (code === "auth/expired-action-code") {
          setError("This verification link has expired. Please sign in and request a new one.")
        } else if (code === "auth/invalid-action-code") {
          // In React Strict Mode (dev), effects can run twice; the first call may have already succeeded,
          // making the second call report invalid-action-code. Suggest trying to sign in.
          setError("This verification link is invalid or already used. Please try signing in or request a new link.")
        } else {
          setError("Failed to verify your email. Please try again.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [oobCode, router])

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Hangout Hub</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirming your email…</h1>
            <p className="text-gray-600">We’re validating your verification link.</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle>Email verification</CardTitle>
              <CardDescription>We’ll redirect you once it’s done</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600">Please wait…</p>
              ) : error ? (
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                  <div className="flex items-center justify-center gap-3">
                    <Link href="/auth/login">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to sign in</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {info && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-700">{info}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    <Link href="/auth/login">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to sign in</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
