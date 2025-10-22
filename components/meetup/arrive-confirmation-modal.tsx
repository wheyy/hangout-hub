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
import { MapPin } from "lucide-react"

interface ArriveConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  destinationName: string
  isArrived: boolean
  isLoading?: boolean
}

export function ArriveConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  destinationName,
  isArrived,
  isLoading = false
}: ArriveConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <AlertDialogTitle>
              {isArrived ? "Mark as Not Arrived?" : "Mark as Arrived?"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {isArrived ? (
              <>
                Are you sure you want to mark yourself as <strong>not arrived</strong> at{" "}
                <strong>{destinationName}</strong>?
                <br /><br />
                Your live location sharing will resume.
              </>
            ) : (
              <>
                Are you sure you have arrived at <strong>{destinationName}</strong>?
                <br /><br />
                Your live location sharing will stop automatically.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={isArrived ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </>
            ) : (
              isArrived ? "Mark as Not Arrived" : "Yes, I've Arrived"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
