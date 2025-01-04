import { BrainCog, User2Icon } from "lucide-react"

interface SidebarLogoProps {}

export const SidebarLogo: FC<SidebarLogoProps> = () => {
  return (
    <div className="flex items-center justify-between px-2 py-3">
      <div className="flex items-center space-x-2">
        <BrainCog className="size-7" />
        <div className="text-xl font-bold">AgentX</div>
      </div>
      <div>
        <User2Icon className="size-7" />
      </div>
    </div>
  )
}
