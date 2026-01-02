"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { SendHorizontal, Loader2, Sparkles, User, Apple, Flame, Salad, ChefHat, TrendingUp, MapPin, BookOpen, Trash2, Plus, Clock, ChevronDown } from "lucide-react"
import { ragQuery } from "@/app/actions"

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
}

interface Message {
  id: string
  question: string
  answer: string
  sources: SearchResult[]
  isLoading?: boolean
  error?: string
  timestamp?: Date
}

interface FoodChatProps {
  onMessageCountChange?: (count: number) => void
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

export function FoodChat({ onMessageCountChange }: FoodChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFirstLoadRef = useRef(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load conversations from localStorage on mount
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
        
        // Load the most recent conversation
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

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("foodChatConversations", JSON.stringify(conversations))
    }
  }, [conversations])

  // Update message count
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
      setShowHistory(false)
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

  const updateCurrentConversationTitle = (newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, title: newTitle, updatedAt: new Date() }
          : conv
      )
    )
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
    
    // Add loading message
    setMessages((prev) => {
      const updatedMessages = [
        ...prev,
        {
          id: loadingMessageId,
          question: currentQuestion,
          answer: "",
          sources: [],
          isLoading: true,
          timestamp: new Date(),
        },
      ]
      
      // Update conversation with new messages
      setConversations((conversations) =>
        conversations.map((conv) => {
          if (conv.id === currentConversationId) {
            // Update title if it's still "New Chat"
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
      const result = await ragQuery(currentQuestion)
      
      // Replace loading message with actual response
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                answer: result.answer,
                sources: result.sources,
                isLoading: false,
              }
            : msg
        )
        
        // Update conversation with response
        setConversations((conversations) =>
          conversations.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, messages: updatedMessages, updatedAt: new Date() }
              : conv
          )
        )
        
        return updatedMessages
      })
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
        
        // Update conversation with error
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex gap-4">
        {/* Main Chat Area */}
        <div className="flex-1 space-y-6">
          {/* Welcome State */}
          {messages.length === 0 && !loading && (
            <div className="text-center py-12 animate-fade-in">
              <div className="mb-6">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/30 mb-4 animate-bounce-slow">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Ask anything about food
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Get AI-powered answers with relevant sources from our food knowledge base
                </p>
              </div>

              {/* Example Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {exampleQuestions.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example.text)}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group"
                  >
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors`}>
                      <example.icon className={`w-4 h-4 ${example.color}`} />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{example.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className="space-y-4 animate-fade-in">
            {/* User Question */}
            <div className="flex justify-end">
              <div className="flex items-start gap-2 max-w-[85%]">
                <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/80 dark:to-indigo-900/80 border-0 p-4 rounded-2xl rounded-tr-sm shadow-md">
                  <p className="text-slate-900 dark:text-blue-50 text-sm font-medium">{message.question}</p>
                </Card>
                <div className="p-2 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-full flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
              </div>
            </div>

            {/* Loading State */}
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
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Searching knowledge base...
                    </span>
                  </div>
                </Card>
              </div>
            )}

            {/* Error State */}
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

            {/* Response */}
            {message.answer && !message.isLoading && (
              <div className="space-y-4">
                {/* AI Response */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-sm shadow-md">
                      <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                        {message.answer}
                      </p>
                    </Card>
                  </div>
                </div>

                {/* Sources */}
                {message.sources.length > 0 && (
                  <div className="ml-11 space-y-3">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                      Sources ({message.sources.length})
                    </p>
                    <div className="grid gap-2">
                      {message.sources.map((source, i) => {
                        const relevancePercent = Math.round(source.score * 100)
                        return (
                          <Card key={source.id} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200/50 dark:border-slate-600/50 p-3 hover:shadow-md transition-shadow duration-200 rounded-xl">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  <div className="p-1.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                    <BookOpen className="w-3 h-3 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Source {i + 1}</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">{source.metadata.text}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {source.metadata.origin && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 px-2 py-0.5 rounded-md">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {source.metadata.origin}
                                  </span>
                                )}
                                <span className={`text-xs flex items-center gap-1 border px-2 py-0.5 rounded-md ${getRelevanceColor(relevancePercent)}`}>
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
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />

        {/* Input Form */}
        <div className="sticky bottom-4 pt-4">
          <Card className="p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about food..."
                disabled={loading}
                className="flex-1 border-0 bg-slate-100 dark:bg-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
              />
              <Button 
                type="submit" 
                disabled={loading || !question.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:scale-105"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Card>
        </div>
        </div>

        {/* Conversation History Sidebar */}
        <div className="hidden md:flex flex-col w-64 gap-2">
          {/* Toggle Button */}
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </Button>

          {/* New Chat Button */}
          <Button
            onClick={createNewConversation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>

          {/* Conversations List */}
          {showHistory && (
            <div className="flex-1 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conv.id
                        ? "bg-blue-100 dark:bg-blue-900/50"
                        : "hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <button
                      onClick={() => loadConversation(conv.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
