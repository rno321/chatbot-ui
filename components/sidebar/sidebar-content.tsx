import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC } from "react"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./sidebar-data-list"
import { SidebarLogo } from "./sidebar-logo"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
}

export const SidebarContent: FC<SidebarContentProps> = ({
  contentType,
  data,
  folders
}) => {
  return (
    <div className="flex max-h-[calc(100%-50px)] grow flex-col">
      <SidebarLogo />
      <SidebarCreateButtons
        contentType={contentType}
        hasData={data.length > 0}
      />

      <SidebarDataList
        contentType={contentType}
        data={data}
        folders={folders}
      />
    </div>
  )
}
