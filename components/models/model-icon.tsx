import { cn } from "@/lib/utils"
import { ModelProvider } from "@/types"
import { BrainCog } from "lucide-react"
import { FC, HTMLAttributes } from "react"

interface ModelIconProps extends HTMLAttributes<HTMLDivElement> {
  provider: ModelProvider
  height: number
  width: number
}

export const ModelIcon: FC<ModelIconProps> = ({
  provider,
  height,
  width,
  ...props
}) => {
  return (
    <BrainCog
      className={cn("text-primary", props.className)}
      width={width}
      height={height}
    />
  )
}
