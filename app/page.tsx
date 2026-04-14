"use client"
import * as React from "react"
import { FileUpload } from "@/components/file-upload";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { DatabaseIcon, CloudUploadIcon, GithubIcon } from "@hugeicons/core-free-icons";

export default function Home() {
  const [files, setFiles] = React.useState<File[]>([])
  const [uploading, setUploading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [resetKey, setResetKey] = React.useState(0)

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setFiles([])
        setResetKey(prev => prev + 1) // Reset FileUpload component
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred during upload' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-black/10 dark:selection:bg-white/10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 dark:bg-zinc-800 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-purple-100 dark:bg-zinc-800 rounded-full blur-[100px]" />
      </div>

      {/* Left Panel: Upload & Branding */}
      <aside className="relative w-full lg:w-[450px] flex flex-col p-8 lg:p-12 z-10 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-3xl overflow-y-auto">
        <div className="flex items-center gap-2 mb-12">
          <div className="size-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <HugeiconsIcon icon={DatabaseIcon} className="text-white dark:text-black size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Stitch AI</span>
        </div>

        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Chat with your <br />
            <span className="bg-clip-text text-transparent bg-linear-to-br from-zinc-900 to-zinc-400 dark:from-white dark:to-zinc-600">PDF Documents</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-sm font-medium">
            Upload your technical docs, papers, or logs and get instant answers powered by local AI.
          </p>
        </div>

        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Knowledge Base</h3>
              <div className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                PRO
              </div>
            </div>
            
            <FileUpload 
              key={resetKey}
              onFilesSelected={setFiles}
              accept=".pdf,.txt,.doc"
              multiple={true}
              className="max-w-none"
            />
            
            <div className="space-y-3">
              {files.length > 0 && (
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="w-full py-6 rounded-xl text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-black dark:bg-white text-white dark:text-black"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={CloudUploadIcon} className="size-5" />
                      Index {files.length} {files.length === 1 ? 'Document' : 'Documents'}
                    </div>
                  )}
                </Button>
              )}

              {message && (
                <div className={cn(
                  "p-4 rounded-xl text-xs font-semibold border animate-in slide-in-from-top-2",
                  message.type === 'success' 
                    ? "bg-green-50/50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800" 
                    : "bg-red-50/50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800"
                )}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-12 flex items-center justify-between text-zinc-400 dark:text-zinc-600">
          <p className="text-[10px] font-medium tracking-tight">© 2026 Stitch. Built for DeepMind.</p>
          <HugeiconsIcon icon={GithubIcon} className="size-5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" />
        </div>
      </aside>

      {/* Right Panel: Chat Interface */}
      <main className="flex-1 relative p-4 lg:p-8 flex flex-col h-screen max-h-screen">
        <ChatInterface />
      </main>
    </div>
  );
}
