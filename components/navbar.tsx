"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HiOutlineUserCircle } from "react-icons/hi2";
import { cn } from "@/lib/utils/helpers"
import { MapPin, Users, Menu } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // Close the mobile menu whenever the path changes
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Brand (match original: hidden on mobile) */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 ml-6 flex items-center space-x-2">
            {/* <MapPin className="h-6 w-6 text-primary" /> */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block">Hangout Hub</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center space-x-6">
              {/* Keep spacer from original on mobile */}
              <div className="flex-1 md:hidden" />

              {/* Desktop links (unchanged markup/classes) */}
              <div className="hidden md:flex md:items-center md:space-x-6">
                <Link
                  href="/"
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80",
                    pathname === "/" ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </Link>
                <Link
                  href="/meetups"
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80",
                    pathname === "/meetups" ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  <Users className="h-4 w-4" />
                  <span>Meetups</span>
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname === "/profile" ? "text-foreground" : "text-foreground/60"
                  )}
                >
                <HiOutlineUserCircle className="h-4 w-4" /> {/* Can be updated to user icon in the future */}
                </Link>
              </div>

              {/* Mobile menu button (new, minimal addition) */}
              <button
                type="button"
                className="md:hidden inline-flex items-center rounded-xl border border-border bg-background/70 px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label="Toggle menu"
                onClick={() => setOpen((v) => !v)}
              >
                <Menu className="mr-2 h-4 w-4" />
                Menu
              </button>

              <div className="flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown panel (keeps overall structure; only visible on < md) */}
      <div
        id="mobile-nav"
        className={cn(
          "md:hidden border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "container max-w-screen-2xl grid overflow-hidden transition-[grid-template-rows,opacity] duration-200",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0">
            <div className="flex flex-col gap-1 py-3">
              <Link
                href="/"
                className={cn(
                  "flex items-center space-x-2 rounded-xl px-3 py-2 text-sm font-medium",
                  pathname === "/"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <MapPin className="h-4 w-4" />
                <span>Map</span>
              </Link>

              <Link
                href="/meetups"
                className={cn(
                  "flex items-center space-x-2 rounded-xl px-3 py-2 text-sm font-medium",
                  pathname === "/meetups"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Users className="h-4 w-4" />
                <span>Meetups</span>
              </Link>

              <Link
                  href="/profile"
                  className={cn(
                  "flex items-center space-x-2 rounded-xl px-3 py-2 text-sm font-medium",
                  pathname === "/profile" 
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <HiOutlineUserCircle className="h-4 w-4" /> {/* Can be updated to user icon in the future */}
                  <span>Profile</span>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
