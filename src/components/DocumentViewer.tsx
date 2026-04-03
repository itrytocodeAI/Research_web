import { useState } from 'react'
import { X, Download, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Document as ResearchDocument } from '../types'

interface DocumentViewerProps {
  researchDocument: ResearchDocument
  onClose: () => void
}

export function DocumentViewer({ researchDocument, onClose }: DocumentViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(researchDocument.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([researchDocument.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = researchDocument.name
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{researchDocument.name}</h2>
            <p className="text-sm text-muted-foreground">
              {researchDocument.type === 'markdown' ? 'Markdown Document' : 'Word Document'}
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
        <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-900">
          {researchDocument.type === 'markdown' ? (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-li:text-gray-800 dark:prose-li:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-gray-900 dark:prose-code:text-gray-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {researchDocument.content}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100">
              {researchDocument.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
