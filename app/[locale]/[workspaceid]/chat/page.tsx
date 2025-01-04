"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatUI } from "@/components/chat/chat-ui"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useContext, useState } from "react"
import { IconMessageCircle2 } from "@tabler/icons-react"
import { FeedbackDialog } from "@/components/utility/feedback-dialog"

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { chatMessages, selectedWorkspace } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const [showFeedback, setShowFeedback] = useState(false)

  if (!selectedWorkspace) return null

  return (
    <>
      <ChatUI />

      <div className="absolute bottom-3 right-4 flex h-[40px] items-center space-x-2 sm:bottom-8">
        <button
          className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={() => setShowFeedback(true)}
        >
          <IconMessageCircle2 size={20} />
        </button>
      </div>

      <FeedbackDialog
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </>
  )
}
