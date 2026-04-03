import { lazy, Suspense, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/clerk-react'
import { researchService } from './lib/researchService'
import { documentService } from './lib/documentService'
import { getApiUrl } from './lib/api'
import {
  fetchGeminiQuotaSnapshot,
  formatQuotaReset,
  getFallbackQuotaSnapshot,
  getQuotaDescription,
} from './lib/geminiQuota'
import type { ResearchOutput, Document as ResearchDocument } from './types'
import { TopicInput } from './components/TopicInput'
import { ResearchProgress } from './components/ResearchProgress'
import { Shell } from './Shell'
import { Home, FileSearch, Settings, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ResearchResults = lazy(() =>
  import('./components/ResearchResults').then((module) => ({ default: module.ResearchResults }))
)
const DocumentViewer = lazy(() =>
  import('./components/DocumentViewer').then((module) => ({ default: module.DocumentViewer }))
)

interface UploadedExportFile {
  docId: string
  signedUrl: string
}

function App() {
  const { getToken, isLoaded, userId } = useAuth()
  const isAuthenticated = Boolean(userId)
  const authLoading = !isLoaded
  const [research, setResearch] = useState<ResearchOutput | null>(null)
  const [documents, setDocuments] = useState<ResearchDocument[]>([])
  const [isResearching, setIsResearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [viewingDocument, setViewingDocument] = useState<ResearchDocument | null>(null)
  const [quotaSnapshot, setQuotaSnapshot] = useState(getFallbackQuotaSnapshot)
  const [quotaError, setQuotaError] = useState<string | null>(null)

  const refreshQuota = useCallback(async () => {
    const authToken = await getToken()
    if (!authToken) {
      throw new Error('You must be signed in before loading quota data.')
    }

    try {
      const snapshot = await fetchGeminiQuotaSnapshot(authToken)
      setQuotaSnapshot(snapshot)
      setQuotaError(null)
      return snapshot
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load Gemini quota.'
      setQuotaSnapshot(getFallbackQuotaSnapshot())
      setQuotaError(message)
      throw error
    }
  }, [getToken])

  useEffect(() => {
    if (!userId) {
      setQuotaSnapshot(getFallbackQuotaSnapshot())
      setQuotaError(null)
      return
    }

    void refreshQuota()
  }, [refreshQuota, userId])

  const handleTopicSubmit = useCallback(async (inputTopic: string) => {
    let currentQuota = quotaSnapshot

    try {
      currentQuota = await refreshQuota()
    } catch {
      toast.error('Research is blocked until the server quota guard is configured correctly.')
      return
    }

    if (currentQuota.exhausted) {
      toast.error(`Gemini free-tier quota reached. Refreshes ${formatQuotaReset(currentQuota.resetAtIso)}.`)
      return
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to start a research run.')
      return
    }

    const authToken = await getToken()
    if (!authToken) {
      toast.error('Your session could not be verified. Please sign in again.')
      return
    }

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
      const researchResults = await researchService.conductDeepResearch(inputTopic, authToken)
      setResearch(researchResults)
      await refreshQuota()

      // Generate documents
      setCurrentStep(4)
      const docs = documentService.generateMarkdownDocuments(researchResults)
      setDocuments(docs)

      toast.success('Research completed successfully!')
    } catch (error) {
      console.error('Research error:', error)
      const quotaResetPolicy =
        typeof error === 'object' &&
        error !== null &&
        'quotaResetPolicy' in error &&
        typeof error.quotaResetPolicy === 'string'
          ? error.quotaResetPolicy
          : null

      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 429
      ) {
        try {
          currentQuota = await refreshQuota()
        } catch {
          currentQuota = getFallbackQuotaSnapshot()
          setQuotaSnapshot(currentQuota)
        }
        toast.error(
          `Gemini quota reached. Refreshes ${formatQuotaReset(currentQuota.resetAtIso)}. ${
            quotaResetPolicy || ''
          }`.trim()
        )
      } else {
        toast.error('Failed to conduct research. Please try again.')
      }
      setResearch(null)
    } finally {
      setIsResearching(false)
      setCurrentStep(0)
    }
  }, [getToken, isAuthenticated, quotaSnapshot, refreshQuota])

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

  const handleDownloadPDF = useCallback(async () => {
    if (!research) return

    try {
      toast.loading('Generating PDF...', { id: 'pdf-download' })
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const escapeHtml = (str: string) =>
        String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/\'/g, '&#039;')
      const renderList = (items: string[]) => items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')

      const html = `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #111; padding: 20px; max-width: 800px;">
          <h1 style="font-size:28px; margin-bottom:8px;">Deep Research Report</h1>
          <h2 style="font-size:18px; color:#333; margin-top:0;">Topic: ${escapeHtml(research.topic)}</h2>
          <p style="color:#555; font-size:12px;">Generated: ${new Date().toLocaleDateString()}</p>

          <h3 style="border-top:1px solid #eee; padding-top:10px;">Executive Summary</h3>
          <p style="white-space:pre-wrap; color:#222;">${escapeHtml(research.executiveSummary)}</p>

          <h3 style="border-top:1px solid #eee; padding-top:10px;">Research Gaps</h3>
          ${research.researchGaps
            .map(
              (g) => `
                <div style="margin-bottom:8px;">
                  <strong>${escapeHtml(g.title)}</strong> <span style="color:#666;">(${escapeHtml(g.severity)})</span>
                  <p style="margin:4px 0 0 0; color:#222;">${escapeHtml(g.description)}</p>
                </div>
              `
            )
            .join('')}

          <h3 style="border-top:1px solid #eee; padding-top:10px;">Proposed Hypotheses</h3>
          ${research.hypotheses
            .map(
              (h) => `
                <div style="margin-bottom:8px;">
                  <strong>Hypothesis ${escapeHtml(h.id)}:</strong>
                  <p style="margin:4px 0 0 0; color:#222;">${escapeHtml(h.hypothesis)}</p>
                  <p style="margin:4px 0 0 0; font-size:12px; color:#555;"><strong>Methodology:</strong> ${escapeHtml(h.methodology)}</p>
                </div>
              `
            )
            .join('')}

          <h3 style="border-top:1px solid #eee; padding-top:10px;">Implementation Plan</h3>
          <p style="color:#222;"><strong>Phase:</strong> ${escapeHtml(research.implementationPlan.phase)}</p>
          <p style="color:#222;"><strong>Timeline:</strong> ${escapeHtml(research.implementationPlan.timeline)}</p>
          <ul style="color:#222;">${renderList(research.implementationPlan.tasks)}</ul>

          <h3 style="border-top:1px solid #eee; padding-top:10px;">Evaluation Metrics</h3>
          ${research.evaluationMetrics
            .map(
              (c) => `
                <div style="margin-bottom:6px;">
                  <strong>${escapeHtml(c.category)}</strong>
                  <p style="margin:3px 0 0 0; color:#222;">${escapeHtml(c.description)}</p>
                  <ul>${c.metrics.map((m) => `<li><strong>${escapeHtml(m.name)}:</strong> ${escapeHtml(m.description)} (Target: ${escapeHtml(m.target)})</li>`).join('')}</ul>
                </div>
              `
            )
            .join('')}

          <hr style="margin-top:16px;" />
          <p style="font-size:11px; color:#666;">Generated by DeepResearch AI</p>
        </div>
      `

      const wrapper = document.createElement('div')
      wrapper.style.width = '800px'
      wrapper.style.padding = '20px'
      wrapper.style.background = '#ffffff'
      wrapper.innerHTML = html
      document.body.appendChild(wrapper)
n      const canvas = await html2canvas(wrapper, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
n      const pdf = new jsPDF('p', 'pt', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
n      pdf.save(`research-report-${Date.now()}.pdf`)
      document.body.removeChild(wrapper)
n      toast.success('PDF downloaded!', { id: 'pdf-download' })
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to generate PDF', { id: 'pdf-download' })
    }
  }, [research])

  const handleUploadToDrive = useCallback(async () => {
    if (!research) return

    const authToken = await getToken()
    if (!authToken) {
      toast.error('Your session could not be verified. Please sign in again.')
      return
    }

    setIsUploading(true)
    toast.loading('Uploading export bundle...', { id: 'cloud-export' })

    try {
      const wordBlob = await documentService.generateWordDocument(research)
      const wordBytes = new Uint8Array(await wordBlob.arrayBuffer())
      const wordBase64 = bytesToBase64(wordBytes)

      const response = await fetch(getApiUrl('/api/export'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          topic: research.topic,
          documents: documents.map((doc) => ({
            id: doc.id,
            name: doc.name,
            content: doc.content,
          })),
          wordDocument: {
            name: `research-report-${Date.now()}.docx`,
            base64: wordBase64,
          },
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload || !Array.isArray(payload.files)) {
        throw new Error(
          payload && typeof payload.error === 'string'
            ? payload.error
            : 'Export upload failed.'
        )
      }

      const uploadMap = new Map<string, string>(
        payload.files
          .filter((file: unknown): file is UploadedExportFile =>
            Boolean(
              file &&
              typeof file === 'object' &&
              'docId' in file &&
              'signedUrl' in file &&
              typeof file.docId === 'string' &&
              typeof file.signedUrl === 'string'
            )
          )
          .map((file: UploadedExportFile) => [file.docId, file.signedUrl] as const)
      )

      setDocuments((currentDocuments) =>
        currentDocuments.map((doc) => ({
          ...doc,
          uploadedToDrive: uploadMap.has(doc.id),
          driveLink: uploadMap.get(doc.id) || doc.driveLink,
        }))
      )

      toast.success('Export bundle uploaded to Supabase Storage.', { id: 'cloud-export' })
    } catch (error) {
      console.error('Cloud export error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload export bundle.',
        { id: 'cloud-export' }
      )
    } finally {
      setIsUploading(false)
    }
  }, [documents, getToken, research])

  const handleViewDocument = useCallback((doc: ResearchDocument) => {
    setViewingDocument(doc)
  }, [])

  const handleNewSearch = useCallback(() => {
    setResearch(null)
    setDocuments([])
    setCurrentStep(0)
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
          <div className="space-y-6">
            <nav className="space-y-2">
              <SidebarLink 
                icon={<Home size={18} />} 
                label="Home" 
                onClick={handleNewSearch}
                active={!research} 
              />
              <SidebarLink 
                icon={<FileSearch size={18} />} 
                label="Research" 
                onClick={handleNewSearch}
                active={!research}
              />
              <SidebarLink icon={<Settings size={18} />} label="Settings" href="#settings" />
              <SidebarLink icon={<HelpCircle size={18} />} label="Help" href="#help" />
            </nav>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Account
              </p>
              <SignedOut>
                <div className="space-y-2">
                  <SignInButton mode="modal">
                    <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition-opacity">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
                      Create Account
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Signed in and ready to run research.
                    </p>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <div className={`rounded-xl border px-3 py-3 text-sm ${
                    quotaError || quotaSnapshot.exhausted
                      ? 'border-red-200 bg-red-50 text-red-800'
                      : 'border-blue-200 bg-blue-50 text-blue-800'
                  }`}>
                    <p className="font-semibold">Gemini Free Tier Tracker</p>
                    <p>{quotaSnapshot.used} / {quotaSnapshot.limit} grounded research requests used today</p>
                    <p>{quotaSnapshot.remaining} remaining</p>
                    <p>Refresh: {formatQuotaReset(quotaSnapshot.resetAtIso)}</p>
                    {quotaError && <p className="mt-2">{quotaError}</p>}
                    <p className="mt-2 text-xs">{getQuotaDescription()}</p>
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>
        }
        appName="DeepResearch AI"
      >
        <div className="min-h-screen bg-background">
          {!isResearching && !research && (
            <TopicInput
              onSubmit={handleTopicSubmit}
              isLoading={isResearching}
              quotaBanner={{
                limitLabel: `${quotaSnapshot.used} / ${quotaSnapshot.limit} Gemini free-tier grounded requests used today`,
                remainingLabel: quotaError
                  ? isAuthenticated
                    ? 'Research is blocked until the server quota guard is configured correctly.'
                    : 'Sign in to load your quota and start research.'
                  : quotaSnapshot.exhausted
                  ? 'Quota reached. New research runs are blocked until the daily reset.'
                  : `${quotaSnapshot.remaining} requests remaining before the app blocks new runs.`,
                refreshLabel: formatQuotaReset(quotaSnapshot.resetAtIso),
                blocked: (Boolean(quotaError) && isAuthenticated) || quotaSnapshot.exhausted,
              }}
            />
          )}

          {isResearching && (
            <ResearchProgress currentStep={currentStep} totalSteps={5} />
          )}

          {research && !isResearching && (
            <Suspense fallback={<SectionLoader label="Loading research results..." />}>
              <ResearchResults
                research={research}
                documents={documents}
                onViewDocument={handleViewDocument}
                onDownloadWord={handleDownloadWord}
                onDownloadPDF={handleDownloadPDF}
                onUploadToDrive={handleUploadToDrive}
                onNewSearch={handleNewSearch}
                isUploading={isUploading}
                driveUploadAvailable
              />
            </Suspense>
          )}
        </div>
      </Shell>

      {viewingDocument && (
        <Suspense fallback={<SectionLoader label="Opening document..." overlay />}>
          <DocumentViewer
            researchDocument={viewingDocument}
            onClose={() => setViewingDocument(null)}
          />
        </Suspense>
      )}
    </>
  )
}

export default App

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function SidebarLink({
  active = false,
  href,
  onClick,
  icon,
  label,
}: {
  active?: boolean
  href?: string
  onClick?: () => void
  icon: ReactNode
  label: string
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <a
      href={href || '#'}
      onClick={handleClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

function SectionLoader({ label, overlay = false }: { label: string; overlay?: boolean }) {
  const containerClass = overlay
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
    : 'max-w-4xl mx-auto px-4 py-16'

  return (
    <div className={containerClass}>
      <div className="bg-card border border-border rounded-xl px-6 py-5 shadow-sm text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
