"use server"

import { Index } from "@upstash/vector"
import Groq from "groq-sdk"

const upstashIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

interface SearchResult {
  id: string
  score: number
  metadata: {
    text: string
    category: string
    origin: string
  }
}

export interface PerformanceMetrics {
  vectorSearchTime: number
  llmProcessingTime: number
  totalResponseTime: number
  tokensUsed?: number
}

interface RAGResponse {
  sources: SearchResult[]
  answer: string
  metrics: PerformanceMetrics
}

export async function ragQuery(question: string): Promise<RAGResponse> {
  const startTime = performance.now()
  
  try {
    // Vector search using Upstash
    const vectorSearchStart = performance.now()
    const results = await upstashIndex.query({
      data: question,
      topK: 3,
      includeMetadata: true,
    })
    const vectorSearchTime = performance.now() - vectorSearchStart

    // Format sources
    const sources: SearchResult[] = results.map((result) => ({
      id: result.id,
      score: result.score,
      metadata: result.metadata as SearchResult["metadata"],
    }))

    // Build context from search results
    const context = sources.map((source, index) => `[${index + 1}] ${source.metadata.text}`).join("\n\n")

    // Generate AI response using Groq
    const llmStart = performance.now()
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful food knowledge assistant. Answer questions based on the provided context. Be concise and informative.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer based on the context above:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })
    const llmProcessingTime = performance.now() - llmStart

    const answer = completion.choices[0]?.message?.content?.trim() || "No answer generated"
    const totalResponseTime = performance.now() - startTime
    
    // Extract token usage if available
    const tokensUsed = completion.usage?.total_tokens

    const metrics: PerformanceMetrics = {
      vectorSearchTime: Math.round(vectorSearchTime),
      llmProcessingTime: Math.round(llmProcessingTime),
      totalResponseTime: Math.round(totalResponseTime),
      tokensUsed,
    }

    return {
      sources,
      answer,
      metrics,
    }
  } catch (error) {
    console.error("[v0] RAG Query Error:", error)
    throw new Error("Failed to process your question. Please try again.")
  }
}
