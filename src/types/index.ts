export interface ResearchTopic {
  id: string
  topic: string
  createdAt: string
  status: 'pending' | 'researching' | 'completed' | 'failed'
}

export interface ResearchGap {
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  references?: string[]
}

export interface ResearchProblem {
  id: string
  statement: string
  significance: string
  relatedGaps: string[]
}

export interface Hypothesis {
  id: string
  hypothesis: string
  variables: {
    independent: string[]
    dependent: string[]
    controlled: string[]
  }
  methodology: string
}

export interface ImplementationPlan {
  phase: string
  tasks: string[]
  timeline: string
  resources: string[]
  milestones: string[]
}

export interface ResearchOutput {
  topic: string
  executiveSummary: string
  researchGaps: ResearchGap[]
  researchProblems: ResearchProblem[]
  hypotheses: Hypothesis[]
  implementationPlan: ImplementationPlan
  methodology: string
  evaluationMetrics: EvaluationMetric[]
  xaiPlan: XAIPlan
  sources: ResearchSource[]
}

export interface ResearchSource {
  title: string
  url: string
}

export interface EvaluationMetric {
  category: string
  metrics: Metric[]
  description: string
}

export interface Metric {
  name: string
  description: string
  target: string
  visualization: 'bar' | 'line' | 'scatter' | 'heatmap' | 'confusion_matrix'
}

export interface XAIPlan {
  techniques: XAITechnique[]
  implementation: string
  expectedOutputs: string[]
  visualizations: XAIPlot[]
}

export interface XAITechnique {
  name: string
  description: string
  library: string
  useCase: string
}

export interface XAIPlot {
  title: string
  type: 'feature_importance' | 'attention' | 'gradient' | 'shap_summary' | 'lime_explanation'
  description: string
  interpretation: string
}

export interface Document {
  id: string
  type: 'word' | 'markdown'
  name: string
  content: string
  createdAt: string
  uploadedToDrive: boolean
  driveLink?: string
}
