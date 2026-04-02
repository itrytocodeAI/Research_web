import { useState, useCallback } from 'react'
import { useBlinkAuth } from '@blinkdotnew/react'
import { blink } from './lib/blink'
import { researchService } from './lib/researchService'
import { documentService } from './lib/documentService'
import type { ResearchOutput, Document as ResearchDocument } from './types'
import { TopicInput } from './components/TopicInput'
import { ResearchProgress } from './components/ResearchProgress'
import { ResearchResults } from './components/ResearchResults'
import { DocumentViewer } from './components/DocumentViewer'
import { Shell } from './Shell'
import { Sidebar, SidebarItem } from '@blinkdotnew/ui'
import { Home, FileSearch, Settings, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function App() {
  const { isAuthenticated, isLoading: authLoading } = useBlinkAuth()
  const [research, setResearch] = useState<ResearchOutput | null>(null)
  const [documents, setDocuments] = useState<ResearchDocument[]>([])
  const [isResearching, setIsResearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [viewingDocument, setViewingDocument] = useState<ResearchDocument | null>(null)
  const [topic, setTopic] = useState('')

  const handleTopicSubmit = useCallback(async (inputTopic: string) => {
    if (!isAuthenticated) {
      blink.auth.login(window.location.href)
      return
    }

    setTopic(inputTopic)
    setIsResearching(true)
    setCurrentStep(0)

    try {
      // Simulate progress through steps
      const steps = 5
      for (let i = 0; i < steps; i++) {
        setCurrentStep(i)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // Conduct research
      const researchResults = await researchService.conductDeepResearch(inputTopic)
      setResearch(researchResults)

      // Generate documents
      setCurrentStep(4)
      const docs = documentService.generateMarkdownDocuments(researchResults)
      setDocuments(docs)

      toast.success('Research completed successfully!')
    } catch (error) {
      console.error('Research error:', error)
      toast.error('Failed to conduct research. Please try again.')
      setResearch(null)
    } finally {
      setIsResearching(false)
      setCurrentStep(0)
    }
  }, [isAuthenticated])

  const handleDownloadWord = useCallback(async () => {
    if (!research) return

    try {
      toast.loading('Generating Word document...', { id: 'download' })
      const blob = await documentService.generateWordDocument(research)
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `research-report-${Date.now()}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Word document downloaded!', { id: 'download' })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to generate Word document', { id: 'download' })
    }
  }, [research])

  const handleUploadToDrive = useCallback(async () => {
    if (!research) return

    setIsUploading(true)
    try {
      toast.loading('Uploading to Google Drive...', { id: 'drive' })

      // First, upload the Word document
      const wordBlob = await documentService.generateWordDocument(research)
      const wordFile = new File(
        [wordBlob],
        `research-report-${Date.now()}.docx`,
        {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
      )

      // Upload to Google Drive using the connector
      await blink.connectors.execute('google_drive', {
        method: '/files',
        http_method: 'POST',
        body: {
          name: `DeepResearch_Report_${topic}_${Date.now()}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      })

      // Upload each markdown document
      for (const doc of documents) {
        const mdBlob = new Blob([doc.content], { type: 'text/markdown' })
        const mdFile = new File([mdBlob], doc.name, { type: 'text/markdown' })

        await blink.connectors.execute('google_drive', {
          method: '/files',
          http_method: 'POST',
          body: {
            name: doc.name,
            mimeType: 'text/markdown',
          },
        })
      }

      // Update document status
      const updatedDocs = documents.map((doc) => ({
        ...doc,
        uploadedToDrive: true,
        driveLink: 'https://drive.google.com',
      }))
      setDocuments(updatedDocs)

      toast.success('All documents uploaded to Google Drive!', { id: 'drive' })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload to Google Drive. Please check your connection.', { id: 'drive' })
    } finally {
      setIsUploading(false)
    }
  }, [research, documents, topic])

  const handleViewDocument = useCallback((doc: ResearchDocument) => {
    setViewingDocument(doc)
  }, [])

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Shell
        sidebar={
          <Sidebar>
            <SidebarItem icon={Home} label="Home" href="#" active />
            <SidebarItem icon={FileSearch} label="Research" href="#research" />
            <SidebarItem icon={Settings} label="Settings" href="#settings" />
            <SidebarItem icon={HelpCircle} label="Help" href="#help" />
          </Sidebar>
        }
        appName="DeepResearch AI"
      >
        <div className="min-h-screen bg-background">
          {!isResearching && !research && (
            <TopicInput onSubmit={handleTopicSubmit} isLoading={isResearching} />
          )}

          {isResearching && (
            <ResearchProgress currentStep={currentStep} totalSteps={5} />
          )}

          {research && !isResearching && (
            <ResearchResults
              research={research}
              documents={documents}
              onViewDocument={handleViewDocument}
              onDownloadWord={handleDownloadWord}
              onUploadToDrive={handleUploadToDrive}
              isUploading={isUploading}
            />
          )}
        </div>
      </Shell>

      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </>
  )
}

export default App
