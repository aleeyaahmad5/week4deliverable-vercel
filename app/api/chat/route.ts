import { Index } from "@upstash/vector"
import { createGroq } from "@ai-sdk/groq"
import { streamText } from "ai"

// Lazy initialization to avoid build-time errors
let upstashIndex: Index | null = null
let groq: ReturnType<typeof createGroq> | null = null

function getUpstashIndex() {
  if (!upstashIndex) {
    upstashIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    })
  }
  return upstashIndex
}

function getGroq() {
  if (!groq) {
    groq = createGroq({
      apiKey: process.env.GROQ_API_KEY!,
    })
  }
  return groq
}

interface SearchResult {
  id: string
  score: number
  metadata: {
    text: string
    category: string
    origin: string
  }
}

export async function POST(req: Request) {
  const startTime = performance.now()

  try {
    const { question } = await req.json()

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const index = getUpstashIndex()
    const groqClient = getGroq()

    // Vector search using Upstash
    const vectorSearchStart = performance.now()
    const results = await index.query({
      data: question,
      topK: 3,
      includeMetadata: true,
    })
    const vectorSearchTime = performance.now() - vectorSearchStart

    // Format sources
    const sources: SearchResult[] = results.map((result) => ({
      id: String(result.id),
      score: result.score,
      metadata: result.metadata as SearchResult["metadata"],
    }))

    // Build context from search results
    const context = sources
      .map((source, index) => `[${index + 1}] ${source.metadata.text}`)
      .join("\n\n")

    // Generate AI response using Groq with streaming
    const llmStart = performance.now()
    
    const result = streamText({
      model: groqClient("llama-3.1-8b-instant"),
      system:
        "You are a helpful food knowledge assistant. Answer questions based on the provided context. Be concise and informative.",
      prompt: `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer based on the context above:`,
      temperature: 0.7,
      maxOutputTokens: 500,
      onFinish: async ({ usage }) => {
        const llmProcessingTime = performance.now() - llmStart
        const totalResponseTime = performance.now() - startTime
        
        // Log metrics for debugging
        console.log("[Performance Metrics]", {
          vectorSearchTime: Math.round(vectorSearchTime),
          llmProcessingTime: Math.round(llmProcessingTime),
          totalResponseTime: Math.round(totalResponseTime),
          tokensUsed: usage?.totalTokens,
        })
      },
    })

    // Create a custom response that includes sources in headers
    const response = result.toTextStreamResponse({
      headers: {
        "X-Sources": encodeURIComponent(JSON.stringify(sources)),
        "X-Vector-Search-Time": Math.round(vectorSearchTime).toString(),
        "X-LLM-Start-Time": llmStart.toString(),
        "X-Start-Time": startTime.toString(),
      },
    })

    return response
  } catch (error) {
    console.error("[v0] Streaming RAG Query Error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process your question. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
