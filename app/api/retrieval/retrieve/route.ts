import { generateLocalEmbedding } from "@/lib/generate-local-embedding"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { Anthropic } from "@anthropic-ai/sdk"

export async function POST(request: Request) {
  const json = await request.json()
  const { userInput, fileIds, embeddingsProvider, sourceCount } = json as {
    userInput: string
    fileIds: string[]
    embeddingsProvider: "anthropic" | "local"
    sourceCount: number
  }

  const uniqueFileIds = [...new Set(fileIds)]

  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()

    if (embeddingsProvider === "anthropic") {
      checkApiKey(profile.anthropic_api_key, "Anthropic")
    }

    let chunks: any[] = []

    const anthropic = new Anthropic({
      apiKey: profile.anthropic_api_key || ""
    })

    if (embeddingsProvider === "anthropic") {
      const { data: fileItems } = await supabaseAdmin
        .from("file_items")
        .select("*")
        .in("file_id", uniqueFileIds)
        .order("created_at", { ascending: true })

      if (!fileItems) {
        return new Response("No file items found", { status: 404 })
      }

      const query = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Given the user's query: "${userInput}", analyze these file items and return the ${sourceCount} most relevant ones that best answer the query. Return them in order of relevance. Here are the file items:\n\n${fileItems.map(item => item.content).join("\n\n")}`
          }
        ]
      })

      const relevantItems = fileItems.slice(0, sourceCount)

      return new Response(JSON.stringify({ results: relevantItems }))
    } else if (embeddingsProvider === "local") {
      const queryEmbedding = await generateLocalEmbedding(userInput)

      const { data: fileItems } = await supabaseAdmin.rpc(
        "match_file_items_local",
        {
          query_embedding: queryEmbedding,
          match_count: sourceCount,
          file_ids: uniqueFileIds
        }
      )

      if (!fileItems) {
        return new Response("No file items found", { status: 404 })
      }

      return new Response(JSON.stringify({ results: fileItems }))
    }

    return new Response("Invalid embeddings provider", { status: 400 })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
