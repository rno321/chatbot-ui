import { FC, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { IconX } from "@tabler/icons-react"
import { useToast } from "@/components/ui/use-toast"

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const FeedbackDialog: FC<FeedbackDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast()
  const [feedback, setFeedback] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return

    try {
      setIsSending(true)
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ feedback })
      })

      if (!response.ok) {
        throw new Error("Failed to send feedback")
      }

      // Clear the feedback and close the dialog first
      setFeedback("")
      onClose()

      // Show success toast after dialog is closed
      toast({
        description: "Thank you for your feedback!",
        duration: 3000
      })
    } catch (error) {
      console.error("Error sending feedback:", error)
      toast({
        description: "Failed to send feedback. Please try again.",
        duration: 3000,
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              We&apos;d love your feedback
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <IconX size={20} />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 ">
          <Textarea
            placeholder="Any suggestions?"
            className="min-h-[120px] resize-none"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />

          <Button
            className="w-full bg-gray-500 hover:bg-gray-600"
            onClick={handleSendFeedback}
            disabled={isSending || !feedback.trim()}
          >
            {isSending ? "Sending..." : "Send feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
