"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Users, CheckCircle } from "lucide-react"

interface AllArrivedModalProps {
  isOpen: boolean
  onClose: () => void
  onEndMeetup: () => void
  memberCount: number
  isLoading?: boolean
}

export function AllArrivedModal({
  isOpen,
  onClose,
  onEndMeetup,
  memberCount,
  isLoading = false
}: AllArrivedModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <AlertDialogTitle>Everyone Has Arrived!</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            All {memberCount} {memberCount === 1 ? "member has" : "members have"} arrived at the destination.
            <br /><br />
            Would you like to end this meetup now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Not Yet</AlertDialogCancel>
          <AlertDialogAction
            onClick={onEndMeetup}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Ending...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                End Meetup
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
