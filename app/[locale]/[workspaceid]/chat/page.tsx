"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatUI } from "@/components/chat/chat-ui"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useContext } from "react"

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { selectedWorkspace } = useContext(ChatbotUIContext)
  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  if (!selectedWorkspace) return null

  return <ChatUI />
}
