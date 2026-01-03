"use server"

import { Index } from "@upstash/vector"
import Groq from "groq-sdk"

const upstashIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
  timeout: 60000, // 60 second timeout for 70B model
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

export async function ragQuery(question: string, model: string = "llama-3.1-8b-instant"): Promise<RAGResponse> {
  const startTime = performance.now()
  
  // Validate model selection
  const validModels = ["llama-3.1-8b-instant", "llama-3.1-70b-versatile"]
  const selectedModel = validModels.includes(model) ? model : "llama-3.1-8b-instant"
  
  // Adjust max tokens based on model - 70B can handle more
  const maxTokens = selectedModel.includes("70b") ? 800 : 500
  
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

    // Generate AI response using Groq with retry for 70B model
    const llmStart = performance.now()
    
    let completion;
    let retries = selectedModel.includes("70b") ? 2 : 1;
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        completion = await groq.chat.completions.create({
          model: selectedModel,
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
          max_tokens: maxTokens,
        })
        break; // Success, exit retry loop
      } catch (err) {
        lastError = err;
        console.error(`[v0] Groq API attempt ${i + 1} failed:`, err);
        if (i < retries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    if (!completion) {
      throw lastError || new Error("Failed to get response from AI model");
    }
    
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    throw new Error(`Failed to process your question: ${errorMessage}. Please try again or use the faster 8B model.`)
  }
}
