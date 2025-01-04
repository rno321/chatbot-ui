"use client"

import { FC } from "react"
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
    <div className="flex flex-col justify-between">
      <TabsList className="bg-background grid h-[440px] grid-rows-7"></TabsList>
    </div>
  )
}
