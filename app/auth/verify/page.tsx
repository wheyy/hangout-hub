"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MapPin } from "lucide-react"
import { AuthGuard } from "@/components/layout/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const email = params.get("email")

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
            <p className="text-gray-600">We've sent a verification link to {email ? <span className="font-medium">{email}</span> : "your email"}.</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle>Check your inbox</CardTitle>
              <CardDescription>Click the link in the email to verify your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't get the email? It can take a minute to arrive. Also check your spam folder.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/auth/login">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to sign in</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
