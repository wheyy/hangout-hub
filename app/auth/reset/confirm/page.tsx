"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Check, Eye, EyeOff } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth } from "@/lib/firebase"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"

export default function ConfirmResetPage() {
  const params = useSearchParams()
  const router = useRouter()
  const oobCode = params.get("oobCode") || ""

  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [info, setInfo] = useState("")

  const requirements = useMemo(() => [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains number", met: /\d/.test(password) },
  ], [password])

  const isPasswordValid = requirements.every(r => r.met)
  const passwordsMatch = password === confirmPassword && confirmPassword !== ""

  useEffect(() => {
    let mounted = true
    async function init() {
      setLoading(true)
      setError("")
      setInfo("")
      if (!oobCode) {
        setError("Reset link is missing a code.")
        setLoading(false)
        return
      }
      try {
        const mail = await verifyPasswordResetCode(auth, oobCode)
        if (mounted) setEmail(mail)
      } catch (e) {
        if (mounted) setError("This reset link is invalid or expired. Please request a new one.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [oobCode])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setInfo("")
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.")
      setSubmitting(false)
      return
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.")
      setSubmitting(false)
      return
    }
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setInfo("Password updated. You can now sign in.")
      setTimeout(() => router.replace("/auth/login"), 800)
    } catch (e: any) {
      const code = e?.code || ""
      if (code === "auth/expired-action-code") {
        setError("This reset link has expired. Please request a new one.")
      } else if (code === "auth/invalid-action-code") {
        setError("This reset link is invalid. Please request a new one.")
      } else if (code === "auth/weak-password") {
        setError("Password is too weak.")
      } else {
        setError("Failed to reset password. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set a new password</h1>
            <p className="text-gray-600">{email ? `for ${email}` : ""}</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle>Create a strong password</CardTitle>
              <CardDescription>Follow the rules below to secure your account</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600">Validating your reset link...</p>
              ) : error ? (
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                  <div className="text-center">
                    <Link href="/auth/reset" className="text-blue-600 hover:text-blue-700">Request a new link</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  {info && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-700">{info}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
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
                    {password && (
                      <div className="space-y-1 mt-2">
                        {requirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Check className={`w-3 h-3 ${req.met ? "text-green-600" : "text-gray-400"}`} />
                            <span className={req.met ? "text-green-600" : "text-gray-500"}>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Check className={`w-3 h-3 ${passwordsMatch ? "text-green-600" : "text-gray-400"}`} />
                        <span className={passwordsMatch ? "text-green-600" : "text-gray-500"}>Passwords match</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={submitting || !isPasswordValid || !passwordsMatch}
                  >
                    {submitting ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
