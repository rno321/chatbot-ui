import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { IconMessagePlus } from "@tabler/icons-react"
import { FC, useContext } from "react"

interface ChatSecondaryButtonsProps {}

export const ChatSecondaryButtons: FC<ChatSecondaryButtonsProps> = ({}) => {
  const { selectedChat } = useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()

  return (
    <>
      {selectedChat && (
        <button
          className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={handleNewChat}
        >
          <IconMessagePlus size={20} />
        </button>
      )}
    </>
  )
}
