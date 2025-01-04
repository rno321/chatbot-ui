"use client"

import { IconMessage } from "@tabler/icons-react"
import { FC } from "react"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { TabsList } from "@/components/ui/tabs"
import { ContentType } from "@/types"

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SIDEBAR_ICON_SIZE = 28

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  return (
    <div className="flex flex-col justify-between border-r-2 pb-5">
      <TabsList className="bg-background grid h-[440px] grid-rows-7">
        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />
      </TabsList>
    </div>
  )
}
