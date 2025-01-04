import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { getBase64FromDataURL, getMediaTypeFromDataURL } from "@/lib/utils"
import { ChatSettings } from "@/types"
import Anthropic from "@anthropic-ai/sdk"
import { AnthropicStream, StreamingTextResponse } from "ai"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.anthropic_api_key, "Anthropic")

    // Extract system message (first message) and user/assistant messages
    const systemMessage = messages[0]?.content || ""
    let ANTHROPIC_FORMATTED_MESSAGES: any = messages.slice(1)

    ANTHROPIC_FORMATTED_MESSAGES = ANTHROPIC_FORMATTED_MESSAGES?.map(
      (message: any) => {
        const role = message.role === "assistant" ? "assistant" : "user"
        let messageContent = message.content

        // Handle string content
        if (typeof messageContent === "string") {
          return {
            role,
            content: [{ type: "text", text: messageContent }]
          }
        }

        // Handle array content (for images)
        if (Array.isArray(messageContent)) {
          return {
            role,
            content: messageContent.map((content: any) => {
              if (typeof content === "string") {
                return { type: "text", text: content }
              } else if (
                content?.type === "image_url" &&
                content?.image_url?.url?.length
              ) {
                return {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: getMediaTypeFromDataURL(content.image_url.url),
                    data: getBase64FromDataURL(content.image_url.url)
                  }
                }
              }
              return content
            })
          }
        }

        // Default case
        return {
          role,
          content: [{ type: "text", text: String(messageContent) }]
        }
      }
    )

    console.log("System message:", systemMessage)
    console.log(
      "Formatted messages:",
      JSON.stringify(ANTHROPIC_FORMATTED_MESSAGES, null, 2)
    )

    const anthropic = new Anthropic({
      apiKey: profile.anthropic_api_key || ""
    })

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        messages: ANTHROPIC_FORMATTED_MESSAGES,
        system: systemMessage,
        max_tokens: 4096,
        temperature: 0.7,
        stream: true
      })

      try {
        const stream = AnthropicStream(response)
        return new StreamingTextResponse(stream)
      } catch (error: any) {
        console.error("Error parsing Anthropic API response:", error)
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
        return new NextResponse(
          JSON.stringify({
            message: `Error parsing Anthropic API response: ${error.message}`
          }),
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error("Error calling Anthropic API:", error)
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return new NextResponse(
        JSON.stringify({
          message: `Error calling Anthropic API: ${error.message}`
        }),
        { status: 500 }
      )
    }
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Anthropic API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "Anthropic API Key is incorrect. Please fix it in your profile settings."
    }

    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: { "Content-Type": "application/json" }
    })
  }
}
