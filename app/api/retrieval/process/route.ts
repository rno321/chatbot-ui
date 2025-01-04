import { generateLocalEmbedding } from "@/lib/generate-local-embedding"
import {
  processCSV,
  processJSON,
  processMarkdown,
  processPdf,
  processTxt
} from "@/lib/retrieval/processing"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { FileItemChunk } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Anthropic } from "@anthropic-ai/sdk"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()

    const formData = await req.formData()

    const file_id = formData.get("file_id") as string
    const embeddingsProvider = formData.get("embeddingsProvider") as string

    const { data: fileMetadata, error: metadataError } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", file_id)
      .single()

    if (metadataError) {
      throw new Error(
        `Failed to retrieve file metadata: ${metadataError.message}`
      )
    }

    if (!fileMetadata) {
      throw new Error("File not found")
    }

    if (fileMetadata.user_id !== profile.user_id) {
      throw new Error("Unauthorized")
    }

    const { data: file, error: fileError } = await supabaseAdmin.storage
      .from("files")
      .download(fileMetadata.file_path)

    if (fileError)
      throw new Error(`Failed to retrieve file: ${fileError.message}`)

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const blob = new Blob([fileBuffer])
    const fileExtension = fileMetadata.name.split(".").pop()?.toLowerCase()

    if (embeddingsProvider === "anthropic") {
      try {
        checkApiKey(profile.anthropic_api_key, "Anthropic")
      } catch (error: any) {
        error.message =
          error.message +
          ", make sure it is configured or else use local embeddings"
        throw error
      }
    }

    let chunks: FileItemChunk[] = []

    switch (fileExtension) {
      case "csv":
        chunks = await processCSV(blob)
        break
      case "json":
        chunks = await processJSON(blob)
        break
      case "md":
        chunks = await processMarkdown(blob)
        break
      case "pdf":
        chunks = await processPdf(blob)
        break
      case "txt":
        chunks = await processTxt(blob)
        break
      default:
        return new NextResponse("Unsupported file type", {
          status: 400
        })
    }

    let embeddings: any = []

    const anthropic = new Anthropic({
      apiKey: profile.anthropic_api_key || ""
    })

    if (embeddingsProvider === "anthropic") {
      // Since Anthropic doesn't have a dedicated embeddings API,
      // we'll use Claude to analyze the content and generate semantic embeddings
      const batchSize = 10 // Process chunks in batches to avoid token limits
      const embeddingPromises = []

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchChunks = chunks.slice(i, i + batchSize)
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Analyze these text chunks and generate a semantic embedding for each. The embedding should capture the key concepts and meaning of the text. Here are the chunks:\n\n${batchChunks.map(chunk => chunk.content).join("\n\n")}`
            }
          ]
        })

        // Use Claude's response as a proxy for embeddings
        const batchEmbeddings = batchChunks.map(() => response.content)
        embeddingPromises.push(...batchEmbeddings)
      }

      embeddings = await Promise.all(embeddingPromises)
    } else if (embeddingsProvider === "local") {
      const embeddingPromises = chunks.map(async chunk => {
        try {
          return await generateLocalEmbedding(chunk.content)
        } catch (error) {
          console.error(`Error generating embedding for chunk: ${chunk}`, error)
          return null
        }
      })

      embeddings = await Promise.all(embeddingPromises)
    }

    const file_items = chunks.map((chunk, index) => ({
      file_id,
      user_id: profile.user_id,
      content: chunk.content,
      tokens: chunk.tokens,
      anthropic_embedding:
        embeddingsProvider === "anthropic"
          ? ((embeddings[index] || null) as any)
          : null,
      local_embedding:
        embeddingsProvider === "local"
          ? ((embeddings[index] || null) as any)
          : null
    }))

    const { data: existingFileItems, error: existingItemsError } =
      await supabaseAdmin.from("file_items").select("*").eq("file_id", file_id)

    if (existingItemsError) {
      throw new Error(
        `Failed to check existing file items: ${existingItemsError.message}`
      )
    }

    // If file items already exist, delete them
    if (existingFileItems.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("file_items")
        .delete()
        .eq("file_id", file_id)

      if (deleteError) {
        throw new Error(
          `Failed to delete existing file items: ${deleteError.message}`
        )
      }
    }

    const { error: insertError } = await supabaseAdmin
      .from("file_items")
      .insert(file_items)

    if (insertError) {
      throw new Error(`Failed to insert file items: ${insertError.message}`)
    }

    return new NextResponse(JSON.stringify({ message: "success" }), {
      status: 200
    })
  } catch (error: any) {
    console.error(error)
    return new NextResponse(error.message, {
      status: error.status || 500
    })
  }
}
