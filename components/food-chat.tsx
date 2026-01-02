"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { SendHorizontal, Loader2, Sparkles, User, Apple, Flame, Salad, ChefHat, TrendingUp, MapPin, BookOpen, Trash2, Plus, Clock, Zap, Database, Brain, Timer, Radio } from "lucide-react"
import { ragQuery, type PerformanceMetrics } from "@/app/actions"
import { useChat } from "ai/react"

interface SearchResult {
  id: string
  score: number
  metadata: {
    text: string
    category: string
    origin: string
  }
}

interface RAGResponse {
  sources: SearchResult[]
  answer: string
  metrics: PerformanceMetrics
}

interface Message {
  id: string
  question: string
  answer: string
  sources: SearchResult[]
  metrics?: PerformanceMetrics
  isLoading?: boolean
  isStreaming?: boolean
  error?: string
  timestamp?: Date
}

interface FoodChatProps {
  onMessageCountChange?: (count: number) => void
  showHistory?: boolean
  onHistoryChange?: (show: boolean) => void
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

const exampleQuestions = [
  { icon: Apple, text: "What fruits are popular in tropical regions?", color: "text-red-500" },
  { icon: Flame, text: "Tell me about spicy foods and their origins", color: "text-orange-500" },
  { icon: Salad, text: "What are some healthy vegetable options?", color: "text-green-500" },
  { icon: ChefHat, text: "What makes different cuisines unique?", color: "text-purple-500" },
]

export function FoodChat({ onMessageCountChange, showHistory = false, onHistoryChange }: FoodChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [useStreaming, setUseStreaming] = useState(true)
  const [streamingSources, setStreamingSources] = useState<SearchResult[]>([])
  const [streamingMetrics, setStreamingMetrics] = useState<PerformanceMetrics | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFirstLoadRef = useRef(true)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isFirstLoadRef.current) return
    isFirstLoadRef.current = false

    try {
      const savedConversations = localStorage.getItem("foodChatConversations")
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations)
        const hydrated = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          })),
        }))
        setConversations(hydrated)
        
        if (hydrated.length > 0) {
          const mostRecent = hydrated[0]
          setCurrentConversationId(mostRecent.id)
          setMessages(mostRecent.messages)
        } else {
          createNewConversation()
        }
      } else {
        createNewConversation()
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
      createNewConversation()
    }
  }, [])

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("foodChatConversations", JSON.stringify(conversations))
    }
  }, [conversations])

  useEffect(() => {
    onMessageCountChange?.(messages.length)
  }, [messages.length, onMessageCountChange])

  const createNewConversation = () => {
    const newConversationId = Date.now().toString()
    setCurrentConversationId(newConversationId)
    setMessages([])
    setConversations((prev) => [
      {
        id: newConversationId,
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...prev,
    ])
  }

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      setCurrentConversationId(conversationId)
      setMessages(conversation.messages)
      onHistoryChange?.(false)
    }
  }

  const deleteConversation = (conversationId: string) => {
    const newConversations = conversations.filter((c) => c.id !== conversationId)
    setConversations(newConversations)
    
    if (currentConversationId === conversationId) {
      if (newConversations.length > 0) {
        loadConversation(newConversations[0].id)
      } else {
        createNewConversation()
      }
    }
  }

  const generateConversationTitle = (firstQuestion: string) => {
    const maxLength = 50
    return firstQuestion.length > maxLength
      ? firstQuestion.substring(0, maxLength) + "..."
      : firstQuestion
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    const currentQuestion = question.trim()
    setQuestion("")
    setLoading(true)

    const loadingMessageId = Date.now().toString()
    
    setMessages((prev) => {
      const updatedMessages = [
        ...prev,
        {
          id: loadingMessageId,
          question: currentQuestion,
          answer: "",
          sources: [],
          isLoading: true,
          isStreaming: useStreaming,
          timestamp: new Date(),
        },
      ]
      
      setConversations((conversations) =>
        conversations.map((conv) => {
          if (conv.id === currentConversationId) {
            const newTitle =
              conv.title === "New Chat"
                ? generateConversationTitle(currentQuestion)
                : conv.title
            return {
              ...conv,
              messages: updatedMessages,
              title: newTitle,
              updatedAt: new Date(),
            }
          }
          return conv
        })
      )
      
      return updatedMessages
    })

    try {
      if (useStreaming) {
        // Streaming mode using fetch
        const startTime = performance.now()
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: currentQuestion }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response")
        }

        // Get sources from headers
        const sourcesHeader = response.headers.get("X-Sources")
        const vectorSearchTime = response.headers.get("X-Vector-Search-Time")
        const sources: SearchResult[] = sourcesHeader 
          ? JSON.parse(decodeURIComponent(sourcesHeader)) 
          : []

        // Read the stream (text stream format - plain text chunks)
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullText = ""

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            fullText += chunk
            
            // Update the message with partial content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === loadingMessageId
                  ? { ...msg, answer: fullText, sources, isLoading: false, isStreaming: true }
                  : msg
              )
            )
          }
        }

        const totalTime = performance.now() - startTime
        const metrics: PerformanceMetrics = {
          vectorSearchTime: parseInt(vectorSearchTime || "0"),
          llmProcessingTime: Math.round(totalTime - parseInt(vectorSearchTime || "0")),
          totalResponseTime: Math.round(totalTime),
        }

        // Final update with complete message
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg.id === loadingMessageId
              ? { ...msg, answer: fullText, sources, metrics, isLoading: false, isStreaming: false }
              : msg
          )
          
          setConversations((conversations) =>
            conversations.map((conv) =>
              conv.id === currentConversationId
                ? { ...conv, messages: updatedMessages, updatedAt: new Date() }
                : conv
            )
          )
          
          return updatedMessages
        })
      } else {
        // Non-streaming mode using server action
        const result = await ragQuery(currentQuestion)
        
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg.id === loadingMessageId
              ? {
                  ...msg,
                  answer: result.answer,
                  sources: result.sources,
                  metrics: result.metrics,
                  isLoading: false,
                }
              : msg
          )
          
          setConversations((conversations) =>
            conversations.map((conv) =>
              conv.id === currentConversationId
                ? { ...conv, messages: updatedMessages, updatedAt: new Date() }
                : conv
            )
          )
          
          return updatedMessages
        })
      }
    } catch (err) {
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                error: err instanceof Error ? err.message : "An error occurred",
                isLoading: false,
              }
            : msg
        )
        
        setConversations((conversations) =>
          conversations.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, messages: updatedMessages, updatedAt: new Date() }
              : conv
          )
        )
        
        return updatedMessages
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleExampleClick = (text: string) => {
    setQuestion(text)
    inputRef.current?.focus()
  }

  const getRelevanceColor = (percent: number) => {
    if (percent >= 80) return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
    if (percent >= 60) return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
    return "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
  }

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Chat History</h2>
          <Button
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 py-2 font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conv.id
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 shadow-md"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
              >
                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{conv.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => onHistoryChange?.(false)} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 sm:w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col lg:hidden transition-transform duration-300 ${
          showHistory ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button onClick={() => onHistoryChange?.(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
          <Plus className="w-5 h-5 text-slate-600 dark:text-slate-400 rotate-45" />
        </button>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 mt-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Chat History</h2>
          <Button
            onClick={() => {
              createNewConversation()
              onHistoryChange?.(false)
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 py-2 font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  loadConversation(conv.id)
                  onHistoryChange?.(false)
                }}
                className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conv.id
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 shadow-md"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
              >
                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{conv.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="space-y-6 w-full">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12 animate-fade-in">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/30 mb-4 animate-bounce-slow">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Ask about Food
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm lg:text-base">
                    Get AI-powered answers with relevant sources from our knowledge base
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {exampleQuestions.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example.text)}
                      className="flex items-center gap-3 p-3 lg:p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors flex-shrink-0">
                        <example.icon className={`w-4 h-4 ${example.color}`} />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{example.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-4 animate-fade-in w-full">
                <div className="flex justify-end">
                  <div className="flex items-start gap-2 max-w-xs lg:max-w-md">
                    <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/80 dark:to-indigo-900/80 border-0 p-3 lg:p-4 rounded-2xl rounded-tr-sm shadow-md">
                      <p className="text-slate-900 dark:text-blue-50 text-sm font-medium">{message.question}</p>
                    </Card>
                    <div className="p-2 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-full flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>
                </div>

                {message.isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <Card className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Searching knowledge base...</span>
                      </div>
                    </Card>
                  </div>
                )}

                {message.error && !message.isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-red-200 dark:shadow-red-900/30">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <Card className="flex-1 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4 rounded-2xl rounded-tl-sm">
                      <p className="text-sm text-red-700 dark:text-red-300">{message.error}</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-2">Please try again or rephrase your question.</p>
                    </Card>
                  </div>
                )}

                {message.answer && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 ${message.isStreaming ? "animate-pulse" : ""}`}>
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-sm shadow-md">
                          <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.answer}
                            {message.isStreaming && (
                              <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse rounded-sm" />
                            )}
                          </p>
                          {message.isStreaming && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-blue-600 dark:text-blue-400">
                              <Radio className="w-3 h-3 animate-pulse" />
                              <span>Streaming response...</span>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>

                    {message.sources.length > 0 && !message.isStreaming && (
                      <div className="ml-11 space-y-3">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Sources ({message.sources.length})
                        </p>
                        <div className="grid gap-2">
                          {message.sources.map((source, i) => {
                            const relevancePercent = Math.round(source.score * 100)
                            return (
                              <Card key={source.id} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200/50 dark:border-slate-600/50 p-3 hover:shadow-md transition-shadow duration-200 rounded-xl">
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <div className="p-1.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                      <BookOpen className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Source {i + 1}</p>
                                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 break-words">{source.metadata.text}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    {source.metadata.origin && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 px-2 py-0.5 rounded-md whitespace-nowrap">
                                        <MapPin className="w-2.5 h-2.5" />
                                        {source.metadata.origin}
                                      </span>
                                    )}
                                    <span className={`text-xs flex items-center gap-1 border px-2 py-0.5 rounded-md whitespace-nowrap ${getRelevanceColor(relevancePercent)}`}>
                                      <TrendingUp className="w-2.5 h-2.5" />
                                      {relevancePercent}% match
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics Display */}
                    {message.metrics && !message.isStreaming && (
                      <div className="ml-11 mt-3">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4" />
                          Performance Metrics
                        </p>
                        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/50 p-3 rounded-xl">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-sm">
                                <Database className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vector Search</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{message.metrics.vectorSearchTime}ms</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg shadow-sm">
                                <Brain className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">LLM Processing</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{message.metrics.llmProcessingTime}ms</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg shadow-sm">
                                <Timer className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Time</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{message.metrics.totalResponseTime}ms</p>
                              </div>
                            </div>
                            {message.metrics.tokensUsed && (
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg shadow-sm">
                                  <Sparkles className="w-3 h-3 text-white" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tokens Used</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{message.metrics.tokensUsed}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 lg:p-6 bg-gradient-to-b from-transparent to-white dark:to-slate-800">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Streaming Toggle */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUseStreaming(!useStreaming)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  useStreaming
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Radio className={`w-3 h-3 ${useStreaming ? "animate-pulse" : ""}`} />
                {useStreaming ? "Streaming On" : "Streaming Off"}
              </button>
            </div>
            
            <Card className="p-3 lg:p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
              <form onSubmit={handleSubmit} className="flex gap-2 lg:gap-3">
                <Input
                  ref={inputRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about food..."
                  disabled={loading}
                  className="flex-1 border-0 bg-slate-100 dark:bg-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl text-sm lg:text-base"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !question.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-3 lg:px-4 py-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:scale-105 flex-shrink-0"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
