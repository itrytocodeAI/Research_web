import { motion } from 'framer-motion'
import { FileText, Download, Eye, CheckCircle, Clock } from 'lucide-react'
import type { ResearchOutput, Document as ResearchDocument } from '../types'

interface ResearchResultsProps {
  research: ResearchOutput
  documents: ResearchDocument[]
  onViewDocument: (doc: ResearchDocument) => void
  onDownloadWord: () => void
  onUploadToDrive: () => void
  isUploading?: boolean
}

export function ResearchResults({
  research,
  documents,
  onViewDocument,
  onDownloadWord,
  onUploadToDrive,
  isUploading,
}: ResearchResultsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-accent p-8 rounded-2xl text-white"
      >
        <h2 className="text-3xl font-bold mb-2">Research Complete!</h2>
        <p className="text-white/90">{research.topic}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              Executive Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {research.executiveSummary}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h3 className="text-xl font-bold mb-4">Research Gaps</h3>
            <div className="space-y-4">
              {research.researchGaps.map((gap, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{gap.title}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        gap.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : gap.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {gap.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{gap.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h3 className="text-xl font-bold mb-4">Proposed Hypotheses</h3>
            <div className="space-y-4">
              {research.hypotheses.map((hypothesis, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {hypothesis.id}
                    </div>
                    <p className="font-medium">{hypothesis.hypothesis}</p>
                  </div>
                  <div className="ml-11 mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-primary">Independent:</span>
                      <div className="text-muted-foreground">
                        {hypothesis.variables.independent.join(', ')}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-primary">Dependent:</span>
                      <div className="text-muted-foreground">
                        {hypothesis.variables.dependent.join(', ')}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-primary">Controlled:</span>
                      <div className="text-muted-foreground">
                        {hypothesis.variables.controlled.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Export & Actions</h3>
            <div className="space-y-3">
              <button
                onClick={onDownloadWord}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download size={18} />
                <span>Download Word Doc</span>
              </button>
              <button
                onClick={onUploadToDrive}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>Save to Google Drive</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Generated Documents</h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <span className="font-medium text-sm">{doc.name}</span>
                    </div>
                    {doc.uploadedToDrive ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Clock size={16} className="text-muted-foreground" />
                    )}
                  </div>
                  <button
                    onClick={() => onViewDocument(doc)}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm border border-border rounded hover:bg-secondary/50 transition-colors"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
