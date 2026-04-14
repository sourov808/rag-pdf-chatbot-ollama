"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon, UserIcon, ChatBotIcon, File01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

interface ChatInterfaceProps {
  collectionName?: string
}

export function ChatInterface({ collectionName = "docs" }: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your AI assistant. I'm currently searching in the "${collectionName}" collection. How can I help you today?`,
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: input,
          collectionName: collectionName 
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          sources: data.source,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || "Failed to get answer")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to connect to the AI service."}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
      {/* Dynamic Background Blur for AI feel */}
      <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-blue-50/20 dark:from-blue-900/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-linear-to-tr from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:rotate-3">
            <HugeiconsIcon icon={ChatBotIcon} className="text-white dark:text-black size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Stitch Assistant</h2>
              <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase tracking-tighter">
                {collectionName}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 font-medium">
              <span className="size-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              Powered by Phi-3 Engine
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth z-0"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "size-8 shrink-0 rounded-lg flex items-center justify-center shadow-sm mt-1",
              msg.role === "user" 
                ? "bg-zinc-100 dark:bg-zinc-800" 
                : "bg-black dark:bg-white"
            )}>
              <HugeiconsIcon 
                icon={msg.role === "user" ? UserIcon : ChatBotIcon} 
                className={cn("size-4", msg.role === "user" ? "text-zinc-600 dark:text-zinc-400" : "text-white dark:text-black")} 
              />
            </div>
            <div className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === "user" 
                  ? "bg-black dark:bg-white text-white dark:text-black rounded-tr-none font-medium" 
                  : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-tl-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] font-sans"
              )}>
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.from(new Set(msg.sources)).map((source, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-md text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-default">
                      <HugeiconsIcon icon={File01Icon} className="size-3" />
                      {source.split('/').pop()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%] mr-auto animate-in fade-in duration-300">
            <div className="size-8 rounded-lg bg-black dark:bg-white flex items-center justify-center shadow-lg">
              <HugeiconsIcon icon={ChatBotIcon} className="text-white dark:text-black size-4" />
            </div>
            <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl">
              <div className="flex gap-1.5">
                <span className="size-1.5 bg-blue-500 rounded-full animate-bounce" />
                <span className="size-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Query the "${collectionName}" collection...`}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl disabled:opacity-50 transition-all active:scale-90 hover:shadow-xl hover:-translate-y-[calc(50%+2px)]"
          >
            <HugeiconsIcon icon={SentIcon} className="size-5" />
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
           <span>Model: Phi-3 3.8B</span>
           <span className="size-1 bg-zinc-300 rounded-full" />
           <span>Embedding: Nomic-v2</span>
           <span className="size-1 bg-zinc-300 rounded-full" />
           <span>latency: ~1.2s</span>
        </div>
      </div>
    </div>
  )
}

