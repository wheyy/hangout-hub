"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { Meetup } from "@/lib/data/meetup"
import { useRouter } from "next/navigation"

interface DeleteMeetupModalProps {
  isOpen: boolean
  onClose: () => void
  meetup: Meetup | null
  /** Called when the user confirms deletion */
//   onDelete: (meetup: Meetup) => void
}

/**
 * A confirmation modal for ending & permanently deleting a meetup.
 * The action is irreversible. Users must type "DELETE" to proceed.
 */
export function DeleteMeetupModal({
  isOpen,
  onClose,
  meetup,
}: DeleteMeetupModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) setConfirmText("")
  }, [isOpen])

  const canDelete = confirmText.trim().toUpperCase() === "DELETE" && !!meetup

  const handleConfirm = async () => {
    if (!meetup) return;
  
    if (meetup.deleteMeetup()) {
      console.log("Meetup ended and deleted.");
  
      // Wait for state updates to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
  
      router.push("/meetups");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            End & Delete Meetup
          </DialogTitle>
          <DialogDescription className="mt-2">
            This will <span className="font-semibold">end</span> and permanently{" "}
            <span className="font-semibold">delete</span> the meetup
            {meetup ? (
              <>
                : <span className="font-medium">&ldquo;{meetup.title}&rdquo;</span>.
              </>
            ) : (
              "."
            )}
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            You’ll remove this meetup and its membership state for all participants.
          </div>

          <div>
            <Label htmlFor="confirm" className="text-sm font-medium">
              Type <span className="font-mono">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canDelete}
            className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Delete Meetup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
