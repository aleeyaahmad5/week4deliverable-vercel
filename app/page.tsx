"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ParticleBackground } from "@/components/particle-background"
import { FoodChat } from "@/components/food-chat"

export default function Home() {
  const [messageCount, setMessageCount] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [triggerNewChat, setTriggerNewChat] = useState(false)

  const handleClearChat = () => {
    // Toggle to trigger new chat in FoodChat component
    setTriggerNewChat(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative flex flex-col">
      <ParticleBackground />
      
      <Header onClearChat={handleClearChat} messageCount={messageCount} showHistory={showHistory} onHistoryToggle={setShowHistory} />

      <main className="flex-1 relative z-10">
        <FoodChat 
          onMessageCountChange={setMessageCount} 
          showHistory={showHistory} 
          onHistoryChange={setShowHistory}
          triggerNewChat={triggerNewChat}
        />
      </main>

      <Footer />
    </div>
  )
}
