import { FC } from "react"
import { BrainCog } from "lucide-react"

interface SidebarLogoProps {}

export const SidebarLogo: FC<SidebarLogoProps> = ({}) => {
  return (
    <div className="flex items-center gap-2 p-2">
      <BrainCog className="text-primary size-8" />
      <span className="text-xl font-bold">AgentX</span>
    </div>
  )
}
