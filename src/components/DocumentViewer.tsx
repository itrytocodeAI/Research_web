import { useState } from 'react'
import { X, Download, Copy, Check } from 'lucide-react'
import type { Document as ResearchDocument } from '../types'

interface DocumentViewerProps {
  document: ResearchDocument
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([document.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = document.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{document.name}</h2>
            <p className="text-sm text-muted-foreground">
              {document.type === 'markdown' ? 'Markdown Document' : 'Word Document'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {document.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
