import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Hangout Hub - Discover & Coordinate Meetups",
  description: "Find the perfect hangout spots and coordinate group meetups with live location sharing in Singapore",
  generator: "v0.app",
  keywords: ["hangout", "meetup", "singapore", "location sharing", "social"],
  authors: [{ name: "Hangout Hub Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#3B82F6",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
