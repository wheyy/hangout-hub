"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"
import { useUserStore } from "@/hooks/user-store"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const initializeUser = useUserStore((s) => s.initializeUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await authService.signIn(email, password)
      await initializeUser()
      router.push("/meetups")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setResendLoading(true)
    setInfo("")
    try {
      await authService.resendVerification(email, password)
      setError("")
      setInfo("Verification email sent. Please check your inbox.")
      setResendCooldown(60)
    } catch (e) {
      setInfo("")
      const msg = e instanceof Error ? e.message : "Failed to resend verification email."
      setError(msg)
      if (msg.toLowerCase().includes("too many attempts")) {
        setResendCooldown(60)
      }
    } finally {
      setResendLoading(false)
    }
  }

  // Cooldown tick
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  return (
    <AuthGuard requireAuth={false}>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Hangout Hub</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="space-y-2">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                  {error.toLowerCase().includes("verify your email") && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Didn't get the email?</span>
                      <Button type="button" variant="outline" size="sm" onClick={handleResend} disabled={resendLoading || !email || !password || resendCooldown > 0}>
                        {resendLoading
                          ? "Sending..."
                          : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend verification"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {info && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{info}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-1">
                <span />
                <Link href="/auth/reset" className="text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}
