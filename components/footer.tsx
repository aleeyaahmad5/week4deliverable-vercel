import { Heart, Zap, Database, ExternalLink, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-4">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-green-500" />
              Upstash Vector
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              Groq LLM
            </span>
            <a 
              href="https://github.com/aleeyaahmad5/food-rag-web-app-aleeyaahmad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
          <p className="flex items-center gap-1.5 flex-wrap justify-center">
            Built by <span className="font-medium text-blue-600 dark:text-blue-400">Aleeya Ahmad</span> 
            <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" /> 
            Next.js + v0.dev
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-700/30 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            AI Week 4 Deliverables • Full-Stack RAG Web Application • 
            <a 
              href="https://v0-week4deliverable-vercel.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              Live Demo <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
