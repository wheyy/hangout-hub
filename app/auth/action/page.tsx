"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function AuthActionRouter() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const mode = (params.get("mode") || "").toLowerCase()
    const qs = params.toString()

    // Map Firebase action modes to our in-app handlers
    const target = (() => {
      switch (mode) {
        case "verifyemail":
          return "/auth/verify/confirm"
        case "resetpassword":
          return "/auth/reset/confirm"
        // You can expand these as needed:
        // case "recoveremail": return "/auth/recover/confirm"
        // case "signIn": return "/auth/email-link"
        default:
          return "/auth/login"
      }
    })()

    router.replace(qs ? `${target}?${qs}` : target)
  }, [params, router])

  return null
}
