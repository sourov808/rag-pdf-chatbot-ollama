"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileUploadIcon, File01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  className?: string
}

export function FileUpload({
  onFilesSelected,
  accept = ".pdf,.txt,.doc,.docx",
  multiple = true,
  className,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
     setSelectedFiles(filesArray)
      if (onFilesSelected) {
        onFilesSelected(filesArray)
      }
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files)
      // Filter files by accept string if provided
      const filteredFiles = accept 
        ? filesArray.filter(file => {
            const ext = "." + file.name.split(".").pop()?.toLowerCase()
            return accept.toLowerCase().includes(ext)
          })
        : filesArray
      
      const filesToSet = multiple ? filteredFiles : filteredFiles.slice(0, 1)
      setSelectedFiles(filesToSet)
      if (onFilesSelected) {
        onFilesSelected(filesToSet)
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full max-w-md", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-10 transition-colors hover:border-primary cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/50"
        onClick={onButtonClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-4">
          <HugeiconsIcon icon={FileUploadIcon} className="size-8 text-zinc-500" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-zinc-500 mt-2 text-center">
          {accept.replace(/\./g, "").toUpperCase()}
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid gap-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Selected Files ({selectedFiles.length})
          </p>
          <ul className="grid gap-2">
            {selectedFiles.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-xs"
              >
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                  <HugeiconsIcon icon={File01Icon} className="size-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
