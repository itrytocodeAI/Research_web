import type { ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Layers3,
  Lightbulb,
  ListChecks,
  Microscope,
  ShieldCheck,
} from 'lucide-react'
import type { ResearchOutput, Document as ResearchDocument } from '../types'

interface ResearchResultsProps {
  research: ResearchOutput
  documents: ResearchDocument[]
  onViewDocument: (doc: ResearchDocument) => void
  onDownloadWord: () => void
  onNewSearch?: () => void
}

export function ResearchResults({
  research,
  documents,
  onViewDocument,
  onDownloadWord,
  onNewSearch,
}: ResearchResultsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white shadow-lg"
      >
        <h2 className="text-3xl font-bold mb-2 text-white">Research Complete</h2>
        <p className="text-white text-lg font-medium">{research.topic}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Section icon={FileText} title="Executive Summary" delay={0.05}>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {research.executiveSummary}
            </p>
          </Section>

          <Section icon={Lightbulb} title="Research Gaps" delay={0.1}>
            <div className="space-y-4">
              {research.researchGaps.map((gap, idx) => (
                <div key={`${gap.title}-${idx}`} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between gap-4 mb-2">
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
                  {gap.references && gap.references.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      References: {gap.references.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Microscope} title="Research Problems" delay={0.15}>
            <div className="space-y-4">
              {research.researchProblems.map((problem) => (
                <div key={problem.id} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {problem.id}
                    </div>
                    <p className="font-medium">{problem.statement}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{problem.significance}</p>
                  {problem.relatedGaps.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Related gaps: {problem.relatedGaps.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section icon={FlaskConical} title="Proposed Hypotheses" delay={0.2}>
            <div className="space-y-4">
              {research.hypotheses.map((hypothesis) => (
                <div key={hypothesis.id} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {hypothesis.id}
                    </div>
                    <div className="space-y-3 flex-1">
                      <p className="font-medium">{hypothesis.hypothesis}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <DetailGroup label="Independent" values={hypothesis.variables.independent} />
                        <DetailGroup label="Dependent" values={hypothesis.variables.dependent} />
                        <DetailGroup label="Controlled" values={hypothesis.variables.controlled} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Methodology:</span>{' '}
                        {hypothesis.methodology}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={ListChecks} title="Implementation Plan" delay={0.25}>
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Phase:</span>{' '}
                {research.implementationPlan.phase}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Timeline:</span>{' '}
                {research.implementationPlan.timeline}
              </p>

              <div>
                <h4 className="font-semibold mb-2">Tasks</h4>
                <ul className="space-y-2">
                  {research.implementationPlan.tasks.map((task, index) => (
                    <li key={`${task}-${index}`} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Resources</h4>
                  <ul className="space-y-2">
                    {research.implementationPlan.resources.map((resource, index) => (
                      <li key={`${resource}-${index}`} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Milestones</h4>
                  <ul className="space-y-2">
                    {research.implementationPlan.milestones.map((milestone, index) => (
                      <li key={`${milestone}-${index}`} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          <Section icon={Layers3} title="Methodology" delay={0.3}>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {research.methodology}
            </p>
          </Section>

          <Section icon={BarChart3} title="Evaluation Metrics" delay={0.35}>
            <div className="space-y-4">
              {research.evaluationMetrics.map((category) => (
                <div key={category.category} className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold mb-1">{category.category}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <div className="space-y-2">
                    {category.metrics.map((metric) => (
                      <div
                        key={`${category.category}-${metric.name}`}
                        className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Target: {metric.target} • View: {metric.visualization}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={ShieldCheck} title="XAI Plan" delay={0.4}>
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold mb-2">Techniques</h4>
                <div className="space-y-3">
                  {research.xaiPlan.techniques.map((technique) => (
                    <div key={technique.name} className="p-4 rounded-lg bg-secondary/50">
                      <p className="font-medium">{technique.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{technique.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Library: {technique.library} • Use case: {technique.useCase}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Implementation Strategy</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {research.xaiPlan.implementation}
                </p>
              </div>

              {research.xaiPlan.expectedOutputs.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Expected Outputs</h4>
                  <ul className="space-y-2">
                    {research.xaiPlan.expectedOutputs.map((output, index) => (
                      <li key={`${output}-${index}`} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{output}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {research.xaiPlan.visualizations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Planned Visualizations</h4>
                  <div className="space-y-3">
                    {research.xaiPlan.visualizations.map((plot) => (
                      <div key={plot.title} className="p-4 rounded-lg bg-secondary/50">
                        <p className="font-medium">{plot.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{plot.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Type: {plot.type} • Interpretation: {plot.interpretation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Export & Actions</h3>
            <div className="space-y-3">
              <button
                onClick={onDownloadWord}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                <span>Download Word Doc</span>
              </button>
              <p className="text-xs text-muted-foreground">
                Download a complete research report in Word format.
              </p>
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
            {onNewSearch && (
              <button
                onClick={onNewSearch}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <span>← New Search</span>
              </button>
            )}
          </div>

          {research.sources.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-bold mb-4">Sources</h3>
              <div className="space-y-3">
                {research.sources.map((source, index) => (
                  <a
                    key={`${source.url}-${index}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/40 transition-colors"
                  >
                    <p className="text-sm font-medium">{source.title}</p>
                    <p className="text-xs text-muted-foreground break-all">{source.url}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function Section({
  children,
  delay,
  icon: Icon,
  title,
}: {
  children: ReactNode
  delay: number
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Icon className="text-primary" size={20} />
        {title}
      </h3>
      {children}
    </motion.section>
  )
}

function DetailGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <span className="font-semibold text-primary">{label}:</span>
      <div className="text-muted-foreground">{values.length > 0 ? values.join(', ') : 'Not specified'}</div>
    </div>
  )
}
