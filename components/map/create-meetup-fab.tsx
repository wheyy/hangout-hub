"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { CreateMeetupModal } from "@/components/meetup/create-meetup-modal"
import { useRouter } from "next/navigation"

export function CreateMeetupFAB() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  // const handleSessionCreated = (sessionId: string) => {
  //   setShowModal(false)
  //   router.push(`/session/${sessionId}`)
  // }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={`fixed z-30 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg ${
          isMobile ? "bottom-20 right-4" : "bottom-6 right-6"
        }`}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {showModal && <CreateMeetupModal isOpen={showModal} onClose={() => setShowModal(false)} 
      // onSessionCreated={handleSessionCreated} 
      />}
    </>
  )
}
