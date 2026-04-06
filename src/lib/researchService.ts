import type {
  EvaluationMetric,
  Hypothesis,
  ImplementationPlan,
  Metric,
  ProposedArchitecture,
  ResearchGap,
  ResearchOutput,
  ResearchProblem,
  ResearchSource,
  XAIPlan,
  XAIPlot,
  XAITechnique,
} from '../types'
import { getApiUrl } from './api'

type JsonRecord = Record<string, unknown>

export class ResearchService {
  async conductDeepResearch(topic: string, authToken: string): Promise<ResearchOutput> {
    const response = await fetch(getApiUrl('/api/research'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ topic }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = this.getErrorMessage(payload)
      const error = new Error(message) as Error & {
        quotaResetPolicy?: string
        status?: number
      }

      if (payload && this.isRecord(payload) && typeof payload.quotaResetPolicy === 'string') {
        error.quotaResetPolicy = payload.quotaResetPolicy
      }

      error.status = response.status
      throw error
    }

    if (this.isRecord(payload) && this.isRecord(payload.research)) {
      return this.parseResearchObject(
        payload.research,
        topic,
        Array.isArray(payload.sources) ? payload.sources : []
      )
    }

    if (this.isRecord(payload) && typeof payload.text === 'string') {
      return this.parseResearchResponse(
        payload.text,
        topic,
        Array.isArray(payload.sources) ? payload.sources : []
      )
    }

    throw new Error('Research API returned an unexpected payload.')
  }

  private getErrorMessage(payload: unknown): string {
    if (this.isRecord(payload) && typeof payload.error === 'string') {
      return payload.error
    }

    return 'Research request failed.'
  }

  private parseResearchResponse(text: string, topic: string, sources: unknown[] = []): ResearchOutput {
    const parsed = this.tryParseJson(text)

    if (!parsed) {
      return this.buildFallbackOutput(topic, sources)
    }

    return this.parseResearchObject(parsed, topic, sources)
  }

  private parseResearchObject(parsed: JsonRecord, topic: string, sources: unknown[] = []): ResearchOutput {
    return {
      topic,
      executiveSummary: this.readString(parsed.executiveSummary) || this.generateExecutiveSummary(topic),
      researchGaps: this.parseResearchGaps(parsed.researchGaps, topic),
      researchProblems: this.parseResearchProblems(parsed.researchProblems),
      hypotheses: this.parseHypotheses(parsed.hypotheses),
      proposedArchitecture: this.parseProposedArchitecture(parsed.proposedArchitecture),
      implementationPlan: this.parseImplementationPlan(parsed.implementationPlan),
      methodology: this.readString(parsed.methodology) || this.generateMethodology(),
      evaluationMetrics: this.parseEvaluationMetrics(parsed.evaluationMetrics),
      xaiPlan: this.parseXAIPlan(parsed.xaiPlan),
      sources: this.parseSources(sources),
    }
  }

  private tryParseJson(text: string): JsonRecord | null {
    const candidates = [text.trim(), this.extractJsonObject(text)]

    for (const candidate of candidates) {
      if (!candidate) continue

      try {
        const parsed = JSON.parse(this.sanitizeJson(candidate))
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as JsonRecord
        }
      } catch {
        // Try the next candidate.
      }
    }

    return null
  }

  private extractJsonObject(text: string): string | null {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null
    }

    return text.slice(firstBrace, lastBrace + 1)
  }

  private sanitizeJson(text: string): string {
    return text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
  }

  private parseResearchGaps(value: unknown, topic: string): ResearchGap[] {
    if (!Array.isArray(value)) {
      return this.generateSampleGaps(topic)
    }

    const gaps = value
      .map((item) => {
        if (!this.isRecord(item)) return null

        const title = this.readString(item.title)
        const description = this.readString(item.description)

        if (!title || !description) return null

        return {
          title,
          description,
          severity: this.normalizeSeverity(item.severity),
          references: this.readStringArray(item.references),
        } satisfies ResearchGap
      })
      .filter(Boolean) as ResearchGap[]

    return gaps.length > 0 ? gaps : this.generateSampleGaps(topic)
  }

  private parseResearchProblems(value: unknown): ResearchProblem[] {
    if (!Array.isArray(value)) {
      return this.generateSampleProblems()
    }

    const problems = value
      .map((item, index) => {
        if (!this.isRecord(item)) return null

        const statement = this.readString(item.statement)
        const significance = this.readString(item.significance)

        if (!statement || !significance) return null

        return {
          id: this.readString(item.id) || `P${index + 1}`,
          statement,
          significance,
          relatedGaps: this.readStringArray(item.relatedGaps),
        } satisfies ResearchProblem
      })
      .filter((item): item is ResearchProblem => Boolean(item))

    return problems.length > 0 ? problems : this.generateSampleProblems()
  }

  private parseHypotheses(value: unknown): Hypothesis[] {
    if (!Array.isArray(value)) {
      return this.generateSampleHypotheses()
    }

    const hypotheses = value
      .map((item, index) => {
        if (!this.isRecord(item)) return null

        const hypothesis = this.readString(item.hypothesis)
        const methodology = this.readString(item.methodology)
        const variables = this.isRecord(item.variables) ? item.variables : {}

        if (!hypothesis || !methodology) return null

        return {
          id: this.readString(item.id) || `H${index + 1}`,
          hypothesis,
          variables: {
            independent: this.readStringArray(variables.independent),
            dependent: this.readStringArray(variables.dependent),
            controlled: this.readStringArray(variables.controlled),
          },
          methodology,
        } satisfies Hypothesis
      })
      .filter((item): item is Hypothesis => Boolean(item))

    return hypotheses.length > 0 ? hypotheses : this.generateSampleHypotheses()
  }

  private parseImplementationPlan(value: unknown): ImplementationPlan {
    if (!this.isRecord(value)) {
      return this.generateSampleImplementationPlan()
    }

    const tasks = this.readStringArray(value.tasks)
    const resources = this.readStringArray(value.resources)
    const milestones = this.readStringArray(value.milestones)

    if (tasks.length === 0) {
      return this.generateSampleImplementationPlan()
    }

    return {
      phase: this.readString(value.phase) || 'Structured implementation plan',
      tasks,
      timeline: this.readString(value.timeline) || '12-18 months',
      resources: resources.length > 0 ? resources : ['Dataset access', 'Compute resources', 'Research team'],
      milestones: milestones.length > 0 ? milestones : ['Planning complete', 'Implementation complete', 'Validation complete'],
    }
  }

  private parseProposedArchitecture(value: unknown): ProposedArchitecture {
    if (!this.isRecord(value)) {
      return this.generateProposedArchitecture()
    }

    const primaryModel = this.readString(value.primaryModel)
    const rationale = this.readString(value.rationale)
    const architectureDetails = this.readString(value.architectureDetails)
    const alternatives = this.readStringArray(value.alternatives)
    const implementationFramework = this.readString(value.implementationFramework)
    const expectedPerformance = this.readString(value.expectedPerformance)

    if (!primaryModel || !rationale) {
      return this.generateProposedArchitecture()
    }

    return {
      primaryModel,
      rationale,
      architectureDetails: architectureDetails || 'Architecture details to be determined during implementation',
      alternatives: alternatives.length > 0 ? alternatives : ['Alternative approaches to be explored'],
      implementationFramework: implementationFramework || 'PyTorch / TensorFlow',
      expectedPerformance: expectedPerformance || 'Performance benchmarks to be established',
    }
  }

  private parseEvaluationMetrics(value: unknown): EvaluationMetric[] {
    if (!Array.isArray(value)) {
      return this.generateEvaluationMetrics()
    }

    const categories = value
      .map((item) => {
        if (!this.isRecord(item) || !Array.isArray(item.metrics)) return null

        const metrics = item.metrics
          .map((metric) => this.parseMetric(metric))
          .filter((metric): metric is Metric => Boolean(metric))

        if (metrics.length === 0) return null

        return {
          category: this.readString(item.category) || 'Evaluation Metrics',
          description: this.readString(item.description) || 'Model and system evaluation metrics',
          metrics,
        } satisfies EvaluationMetric
      })
      .filter((item): item is EvaluationMetric => Boolean(item))

    return categories.length > 0 ? categories : this.generateEvaluationMetrics()
  }

  private parseMetric(value: unknown): Metric | null {
    if (!this.isRecord(value)) return null

    const name = this.readString(value.name)
    const description = this.readString(value.description)
    const target = this.readString(value.target)

    if (!name || !description || !target) return null

    return {
      name,
      description,
      target,
      visualization: this.normalizeMetricVisualization(value.visualization),
    }
  }

  private parseXAIPlan(value: unknown): XAIPlan {
    if (!this.isRecord(value)) {
      return this.generateXAIPlan()
    }

    const techniques = Array.isArray(value.techniques)
      ? value.techniques
          .map((item) => this.parseXAITechnique(item))
          .filter((item): item is XAITechnique => Boolean(item))
      : []

    const visualizations = Array.isArray(value.visualizations)
      ? value.visualizations
          .map((item) => this.parseXAIPlot(item))
          .filter((item): item is XAIPlot => Boolean(item))
      : []

    if (techniques.length === 0) {
      return this.generateXAIPlan()
    }

    return {
      techniques,
      implementation: this.readString(value.implementation) || 'Integrate explainability methods into training and evaluation workflows.',
      expectedOutputs: this.readStringArray(value.expectedOutputs),
      visualizations,
    }
  }

  private parseXAITechnique(value: unknown): XAITechnique | null {
    if (!this.isRecord(value)) return null

    const name = this.readString(value.name)
    const description = this.readString(value.description)
    const library = this.readString(value.library)
    const useCase = this.readString(value.useCase)

    if (!name || !description || !library || !useCase) return null

    return { name, description, library, useCase }
  }

  private parseXAIPlot(value: unknown): XAIPlot | null {
    if (!this.isRecord(value)) return null

    const title = this.readString(value.title)
    const description = this.readString(value.description)
    const interpretation = this.readString(value.interpretation)

    if (!title || !description || !interpretation) return null

    return {
      title,
      type: this.normalizePlotType(value.type),
      description,
      interpretation,
    }
  }

  private buildFallbackOutput(topic: string, sources: unknown[] = []): ResearchOutput {
    return {
      topic,
      executiveSummary: this.generateExecutiveSummary(topic),
      researchGaps: this.generateSampleGaps(topic),
      researchProblems: this.generateSampleProblems(),
      hypotheses: this.generateSampleHypotheses(),
      proposedArchitecture: this.generateProposedArchitecture(),
      implementationPlan: this.generateSampleImplementationPlan(),
      methodology: this.generateMethodology(),
      evaluationMetrics: this.generateEvaluationMetrics(),
      xaiPlan: this.generateXAIPlan(),
      sources: this.parseSources(sources),
    }
  }

  private parseSources(value: unknown): ResearchSource[] {
    if (!Array.isArray(value)) return []

    return value
      .map((item, index) => {
        if (!this.isRecord(item)) return null

        const url =
          this.readString(item.url) ||
          this.readString(item.link) ||
          this.readString(item.href)
        const title =
          this.readString(item.title) ||
          this.readString(item.name) ||
          this.readString(item.label) ||
          `Source ${index + 1}`

        if (!url) return null

        return {
          title,
          url,
          authors: this.readString(item.authors) || undefined,
          year: typeof item.year === 'number' ? item.year : undefined,
          publicationType: this.normalizePublicationType(item.publicationType),
        } satisfies ResearchSource
      })
      .filter((item): item is ResearchSource => Boolean(item))
  }

  private normalizePublicationType(value: unknown): ResearchSource['publicationType'] {
    const type = this.readString(value).toLowerCase()
    
    if (type === 'conference' || type === 'journal' || type === 'preprint' || type === 'repository' || type === 'web') {
      return type
    }
    
    return undefined
  }

  private isRecord(value: unknown): value is JsonRecord {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
  }

  private readString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []

    return value
      .map((item) => this.readString(item))
      .filter(Boolean)
  }

  private normalizeSeverity(value: unknown): ResearchGap['severity'] {
    const severity = this.readString(value).toLowerCase()

    if (severity === 'high' || severity === 'medium' || severity === 'low') {
      return severity
    }

    return 'medium'
  }

  private normalizeMetricVisualization(value: unknown): Metric['visualization'] {
    const visualization = this.readString(value).toLowerCase()

    if (
      visualization === 'bar' ||
      visualization === 'line' ||
      visualization === 'scatter' ||
      visualization === 'heatmap' ||
      visualization === 'confusion_matrix'
    ) {
      return visualization
    }

    return 'bar'
  }

  private normalizePlotType(value: unknown): XAIPlot['type'] {
    const type = this.readString(value).toLowerCase()

    if (
      type === 'feature_importance' ||
      type === 'attention' ||
      type === 'gradient' ||
      type === 'shap_summary' ||
      type === 'lime_explanation'
    ) {
      return type
    }

    return 'feature_importance'
  }

  private generateExecutiveSummary(topic: string): string {
    return `This research report provides a comprehensive analysis of ${topic}. The field has seen significant advances in recent years, with growing interest in developing innovative solutions. Key challenges remain in understanding fundamental mechanisms and achieving robust performance in real-world scenarios.

This report identifies critical research gaps, formulates testable hypotheses, and proposes a structured implementation plan to advance knowledge in this domain. It is intended to help turn broad research interest into a practical roadmap for experimentation, evaluation, and explainability.`
  }

  private generateSampleGaps(topic: string): ResearchGap[] {
    return [
      {
        title: 'Limited Dataset Availability',
        description: `Insufficient high-quality labeled datasets for comprehensive analysis in the domain of ${topic}.`,
        severity: 'high',
      },
      {
        title: 'Lack of Standardized Evaluation Metrics',
        description: 'No consensus on evaluation metrics makes cross-study comparison difficult.',
        severity: 'medium',
      },
      {
        title: 'Interpretability and Explainability Gaps',
        description: 'Current approaches often lack transparency in decision-making processes.',
        severity: 'high',
      },
    ]
  }

  private generateSampleProblems(): ResearchProblem[] {
    return [
      {
        id: 'P1',
        statement: 'How can we develop robust models that perform consistently across diverse datasets?',
        significance: 'Critical for real-world deployment and generalization.',
        relatedGaps: ['Limited Dataset Availability'],
      },
      {
        id: 'P2',
        statement: 'What methodologies best support interpretable and explainable AI systems?',
        significance: 'Essential for trust, adoption, and regulatory acceptance.',
        relatedGaps: ['Interpretability and Explainability Gaps'],
      },
    ]
  }

  private generateSampleHypotheses(): Hypothesis[] {
    return [
      {
        id: 'H1',
        hypothesis: 'Advanced preprocessing techniques will significantly improve model robustness.',
        variables: {
          independent: ['Preprocessing method', 'Data augmentation strategy'],
          dependent: ['Model accuracy', 'Generalization performance'],
          controlled: ['Model architecture', 'Training duration', 'Hardware environment'],
        },
        methodology: 'Controlled experiments with systematic variation of preprocessing techniques.',
      },
      {
        id: 'H2',
        hypothesis: 'Explainable AI techniques will increase user trust and adoption rates.',
        variables: {
          independent: ['XAI technique applied'],
          dependent: ['User trust score', 'Adoption rate'],
          controlled: ['Domain', 'User background', 'Task complexity'],
        },
        methodology: 'User studies with pre- and post-explanation trust measurements.',
      },
    ]
  }

  private generateSampleImplementationPlan(): ImplementationPlan {
    return {
      phase: 'Three-phase implementation',
      tasks: [
        'Collect and validate relevant datasets.',
        'Develop baseline and advanced model variants.',
        'Integrate explainability tooling into the model workflow.',
        'Run quantitative evaluation and expert review.',
      ],
      timeline: '12-14 months',
      resources: [
        'Dataset access',
        'Compute resources',
        'Research and engineering team',
        'Cloud infrastructure',
      ],
      milestones: [
        'Datasets prepared',
        'Baseline model validated',
        'Explainability workflow integrated',
        'Final evaluation completed',
      ],
    }
  }

  private generateMethodology(): string {
    return `This research uses a mixed-methods approach that combines quantitative experimentation with qualitative validation.

Data collection will combine literature review, public datasets, and controlled experiments. Analysis will include statistical evaluation, model benchmarking, ablation studies, and expert review. Validation will rely on cross-validation, robustness testing, and stakeholder feedback where appropriate.`
  }

  private generateEvaluationMetrics(): EvaluationMetric[] {
    return [
      {
        category: 'Performance Metrics',
        description: 'Core model performance indicators.',
        metrics: [
          {
            name: 'Accuracy',
            description: 'Overall predictive accuracy.',
            target: '>90%',
            visualization: 'bar',
          },
          {
            name: 'F1-Score',
            description: 'Balanced measure of precision and recall.',
            target: '>87%',
            visualization: 'bar',
          },
        ],
      },
      {
        category: 'Efficiency Metrics',
        description: 'Resource utilization and runtime behavior.',
        metrics: [
          {
            name: 'Inference Speed',
            description: 'Average prediction latency.',
            target: '<100ms',
            visualization: 'line',
          },
          {
            name: 'Memory Usage',
            description: 'Peak memory consumption during inference.',
            target: '<16GB',
            visualization: 'bar',
          },
        ],
      },
    ]
  }

  private generateXAIPlan(): XAIPlan {
    return {
      techniques: [
        {
          name: 'SHAP',
          description: 'Game-theoretic feature attribution for global and local explanations.',
          library: 'shap',
          useCase: 'Feature importance analysis and per-prediction explanation.',
        },
        {
          name: 'LIME',
          description: 'Local surrogate explanations for individual predictions.',
          library: 'lime',
          useCase: 'Instance-level explanation for model outputs.',
        },
      ],
      implementation: 'Integrate explanation generation into model evaluation and expose outputs through a researcher-facing review workflow.',
      expectedOutputs: [
        'Global feature importance rankings',
        'Per-instance explanations for representative predictions',
        'Researcher-friendly explanation summaries',
      ],
      visualizations: [
        {
          title: 'SHAP Summary Plot',
          type: 'shap_summary',
          description: 'Overview of feature contribution distributions across predictions.',
          interpretation: 'Higher spread and magnitude indicate stronger impact on model outputs.',
        },
        {
          title: 'LIME Explanation View',
          type: 'lime_explanation',
          description: 'Local explanation showing which features support or oppose a prediction.',
          interpretation: 'Positive and negative contributors help explain individual model decisions.',
        },
      ],
    }
  }

  private generateProposedArchitecture(): ProposedArchitecture {
    return {
      primaryModel: 'Transformer-based architecture',
      rationale: 'Transformer models have demonstrated state-of-the-art performance across multiple domains and provide strong baseline capabilities for further experimentation.',
      architectureDetails: 'Pre-trained encoder-decoder or encoder-only architecture, fine-tuned on domain-specific data. Layer normalization, multi-head attention, and positional encodings will be preserved from the base model.',
      alternatives: [
        'CNN-based architecture for structured data tasks',
        'Hybrid CNN-Transformer for multi-modal inputs',
        'LSTM or GRU for sequential processing with limited computational resources',
      ],
      implementationFramework: 'PyTorch with HuggingFace Transformers library',
      expectedPerformance: 'Baseline performance expected to exceed 85% accuracy on validation set, with potential for improvement through hyperparameter tuning and architecture refinement.',
    }
  }
}

export const researchService = new ResearchService()
