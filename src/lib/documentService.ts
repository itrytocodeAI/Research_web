import type { ResearchOutput, Document as ResearchDocument, ProposedArchitecture } from '../types'

export class DocumentService {
  async generateWordDocument(research: ResearchOutput): Promise<Blob> {
    const { Document, HeadingLevel, Packer, Paragraph, TextRun, AlignmentType, UnderlineType } = await import('docx')

    const arch: ProposedArchitecture = research.proposedArchitecture

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title Page
            new Paragraph({
              text: 'Deep Research Report',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: research.topic,
                  bold: true,
                  size: 32,
                  underline: {
                    type: UnderlineType.SINGLE,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: `Generated: ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),
            
            // Executive Summary
            new Paragraph({
              text: 'Executive Summary',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            ...research.executiveSummary.split('\n\n').map(para => new Paragraph({
              text: para,
              spacing: { after: 200 },
            })),
            

            
            // Research Gaps
            new Paragraph({
              text: 'Research Gaps',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            ...research.researchGaps.flatMap((gap, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${gap.title}`,
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: ` [Severity: ${gap.severity.toUpperCase()}]`,
                    color: gap.severity === 'high' ? 'FF0000' : gap.severity === 'medium' ? 'FF8800' : '00AA00',
                    bold: true,
                  }),
                ],
                spacing: { before: 300 },
              }),
              new Paragraph({
                text: gap.description,
                indent: { left: 720 },
                spacing: { after: 100 },
              }),
              ...(gap.references && gap.references.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'References: ',
                      bold: true,
                      italics: true,
                    }),
                    new TextRun({
                      text: gap.references.join('; '),
                      italics: true,
                    }),
                  ],
                  indent: { left: 720 },
                  spacing: { after: 200 },
                }),
              ] : []),
            ]),
            
            // Research Problems
            new Paragraph({
              text: 'Research Problems',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            ...research.researchProblems.flatMap((problem) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Problem ${problem.id}: `,
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: problem.statement,
                  }),
                ],
                spacing: { before: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Significance: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: problem.significance,
                  }),
                ],
                indent: { left: 720 },
                spacing: { after: 100 },
              }),
              ...(problem.relatedGaps.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Related Gaps: ',
                      bold: true,
                      italics: true,
                    }),
                    new TextRun({
                      text: problem.relatedGaps.join(', '),
                      italics: true,
                    }),
                  ],
                  indent: { left: 720 },
                  spacing: { after: 200 },
                }),
              ] : []),
            ]),
            
            // Hypotheses
            new Paragraph({
              text: 'Proposed Hypotheses',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            ...research.hypotheses.flatMap((hypothesis) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Hypothesis ${hypothesis.id}: `,
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: hypothesis.hypothesis,
                  }),
                ],
                spacing: { before: 300 },
              }),
              new Paragraph({
                text: 'Variables',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Independent: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: hypothesis.variables.independent.join(', ') || 'Not specified',
                  }),
                ],
                indent: { left: 720 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Dependent: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: hypothesis.variables.dependent.join(', ') || 'Not specified',
                  }),
                ],
                indent: { left: 720 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Controlled: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: hypothesis.variables.controlled.join(', ') || 'Not specified',
                  }),
                ],
                indent: { left: 720 },
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: 'Methodology',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 100 },
              }),
              new Paragraph({
                text: hypothesis.methodology,
                indent: { left: 720 },
                spacing: { after: 200 },
              }),
            ]),
            
            // Methodology (merged with Proposed Architecture)
            new Paragraph({
              text: 'Research Methodology',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            
            new Paragraph({
              text: 'Proposed Model Architecture',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Primary Model: ',
                  bold: true,
                }),
                new TextRun({
                  text: arch.primaryModel,
                }),
              ],
              indent: { left: 720 },
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: arch.rationale,
              indent: { left: 720 },
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              text: 'Architecture Details',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: arch.architectureDetails,
              indent: { left: 720 },
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              text: 'Implementation Framework',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: arch.implementationFramework,
              indent: { left: 720 },
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              text: 'Alternative Approaches',
              heading: HeadingLevel.HEADING_2,
            }),
            ...arch.alternatives.map((alt: string) => new Paragraph({
              text: alt,
              bullet: { level: 0 },
              indent: { left: 720 },
            })),
            
            new Paragraph({
              text: 'Expected Performance',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200 },
            }),
            new Paragraph({
              text: arch.expectedPerformance,
              indent: { left: 720 },
              spacing: { after: 300 },
            }),
            
            new Paragraph({
              text: 'Research Approach',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200 },
            }),
            ...research.methodology.split('\n\n').map(para => new Paragraph({
              text: para,
              indent: { left: 720 },
              spacing: { after: 200 },
            })),
            
            // Implementation Plan
            new Paragraph({
              text: 'Implementation Plan',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Phase: ',
                  bold: true,
                }),
                new TextRun({
                  text: research.implementationPlan.phase,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Timeline: ',
                  bold: true,
                }),
                new TextRun({
                  text: research.implementationPlan.timeline,
                }),
              ],
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              text: 'Tasks',
              heading: HeadingLevel.HEADING_2,
            }),
            ...research.implementationPlan.tasks.map((task) => new Paragraph({
              text: task,
              bullet: { level: 0 },
              indent: { left: 720 },
            })),
            
            new Paragraph({
              text: 'Resources Required',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200 },
            }),
            ...research.implementationPlan.resources.map((resource) => new Paragraph({
              text: resource,
              bullet: { level: 0 },
              indent: { left: 720 },
            })),
            
            new Paragraph({
              text: 'Milestones',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200 },
            }),
            ...research.implementationPlan.milestones.map((milestone) => new Paragraph({
              text: milestone,
              bullet: { level: 0 },
              indent: { left: 720 },
            })),
            
            // Evaluation Metrics
            new Paragraph({
              text: 'Evaluation Metrics',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            ...research.evaluationMetrics.flatMap((category) => [
              new Paragraph({
                text: category.category,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200 },
              }),
              new Paragraph({
                text: category.description,
                indent: { left: 720 },
                spacing: { after: 100 },
              }),
              ...category.metrics.map((metric) => new Paragraph({
                children: [
                  new TextRun({
                    text: `${metric.name}: `,
                    bold: true,
                  }),
                  new TextRun({
                    text: `${metric.description} `,
                  }),
                  new TextRun({
                    text: `(Target: ${metric.target}, Visualization: ${metric.visualization})`,
                    italics: true,
                  }),
                ],
                bullet: { level: 0 },
                indent: { left: 1440 },
              })),
            ]),
            
            // XAI Plan
            new Paragraph({
              text: 'Explainability (XAI) Plan',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: 'XAI Techniques',
              heading: HeadingLevel.HEADING_2,
            }),
            ...research.xaiPlan.techniques.map((technique) => new Paragraph({
              children: [
                new TextRun({
                  text: `${technique.name}: `,
                  bold: true,
                }),
                new TextRun({
                  text: `${technique.description} `,
                }),
                new TextRun({
                  text: `(Library: ${technique.library}, Use Case: ${technique.useCase})`,
                  italics: true,
                }),
              ],
              bullet: { level: 0 },
              indent: { left: 720 },
              spacing: { after: 100 },
            })),
            
            new Paragraph({
              text: 'Implementation Strategy',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200 },
            }),
            new Paragraph({
              text: research.xaiPlan.implementation,
              indent: { left: 720 },
              spacing: { after: 200 },
            }),
            
            ...(research.xaiPlan.expectedOutputs.length > 0 ? [
              new Paragraph({
                text: 'Expected Outputs',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200 },
              }),
              ...research.xaiPlan.expectedOutputs.map((output) => new Paragraph({
                text: output,
                bullet: { level: 0 },
                indent: { left: 720 },
              })),
            ] : []),
            
            ...(research.xaiPlan.visualizations.length > 0 ? [
              new Paragraph({
                text: 'Planned Visualizations',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200 },
              }),
              ...research.xaiPlan.visualizations.flatMap((viz) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${viz.title} `,
                      bold: true,
                    }),
                    new TextRun({
                      text: `(Type: ${viz.type})`,
                      italics: true,
                    }),
                  ],
                  bullet: { level: 0 },
                  indent: { left: 720 },
                }),
                new Paragraph({
                  text: viz.description,
                  indent: { left: 1440 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Interpretation: ',
                      bold: true,
                      italics: true,
                    }),
                    new TextRun({
                      text: viz.interpretation,
                      italics: true,
                    }),
                  ],
                  indent: { left: 1440 },
                  spacing: { after: 100 },
                }),
              ]),
            ] : []),
            
            // Footer
            new Paragraph({
              text: '',
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: '--- End of Report ---',
              alignment: AlignmentType.CENTER,
              spacing: { before: 200 },
            }),
          ],
        },
      ],
    })

    return Packer.toBlob(doc)
  }

  generateMarkdownDocuments(research: ResearchOutput): ResearchDocument[] {
    const createdAt = new Date().toISOString()

    return [
      {
        id: 'citations',
        type: 'markdown',
        name: 'citations.md',
        content: this.generateCitationsDocument(research),
        createdAt,
        uploadedToDrive: false,
      },
      {
        id: 'dataset-methodology',
        type: 'markdown',
        name: 'dataset-search-methodology.md',
        content: this.generateDatasetMethodology(research),
        createdAt,
        uploadedToDrive: false,
      },
      {
        id: 'system-architecture',
        type: 'markdown',
        name: 'system-architecture.md',
        content: this.generateArchitectureDocument(research),
        createdAt,
        uploadedToDrive: false,
      },
      {
        id: 'evaluation-metrics',
        type: 'markdown',
        name: 'evaluation-metrics.md',
        content: this.generateEvaluationDocument(research),
        createdAt,
        uploadedToDrive: false,
      },
      {
        id: 'xai-implementation',
        type: 'markdown',
        name: 'xai-implementation-plan.md',
        content: this.generateXAIDocument(research),
        createdAt,
        uploadedToDrive: false,
      },
    ]
  }

  private generateCitationsDocument(research: ResearchOutput): string {
    const sources = research.sources || []
    
    // IEEE Citation Style format
    const ieeeStyle = sources.map((source, index) => {
      const num = index + 1
      let citation = `[${num}] `
      
      // Authors (if available)
      if (source.authors) {
        citation += `${source.authors}, `
      }
      
      // Title
      citation += `"${source.title}"`
      
      // Publication type and details
      if (source.publicationType === 'conference') {
        citation += `, in Proc.`
        if (source.year) {
          citation += `, ${source.year}`
        }
      } else if (source.publicationType === 'journal') {
        citation += `, Journal`
        if (source.year) {
          citation += `, vol. ${source.year}`
        }
      } else if (source.publicationType === 'preprint') {
        citation += `, arXiv preprint`
        if (source.year) {
          citation += `, ${source.year}`
        }
      } else if (source.publicationType === 'repository') {
        citation += `, GitHub Repository`
        if (source.year) {
          citation += `, ${source.year}`
        }
      } else {
        // Web or other
        if (source.year) {
          citation += `, ${source.year}`
        }
      }
      
      // URL
      citation += `. [Online]. Available: ${source.url}`
      
      return citation
    })
    
    // Bibtex style format
    const bibtexStyle = sources.map((source, index) => {
      const key = `ref${index + 1}`
      const type = source.publicationType === 'journal' ? 'article' : 
                   source.publicationType === 'conference' ? 'inproceedings' :
                   source.publicationType === 'preprint' ? 'misc' :
                   'misc'
      
      let bibtex = `@${type}{${key},\n`
      if (source.authors) {
        bibtex += `  author = {${source.authors}},\n`
      }
      bibtex += `  title = {${source.title}},\n`
      if (source.year) {
        bibtex += `  year = {${source.year}},\n`
      }
      bibtex += `  url = {${source.url}}\n`
      bibtex += `}`
      
      return bibtex
    })
    
    return `# References and Citations

## Research Topic
${research.topic}

---

## IEEE Citation Style

The following ${sources.length} sources were used in this research analysis. Citations follow the IEEE reference format.

${ieeeStyle.length > 0 ? ieeeStyle.join('\n\n') : 'No sources available.'}

---

## BibTeX Format

For use with LaTeX and reference management software:

\`\`\`bibtex
${bibtexStyle.join('\n\n')}
\`\`\`

---

## Source Summary

- **Total Sources**: ${sources.length}
- **Conference Papers**: ${sources.filter(s => s.publicationType === 'conference').length}
- **Journal Articles**: ${sources.filter(s => s.publicationType === 'journal').length}
- **Preprints (arXiv)**: ${sources.filter(s => s.publicationType === 'preprint').length}
- **Repositories**: ${sources.filter(s => s.publicationType === 'repository').length}
- **Web Resources**: ${sources.filter(s => s.publicationType === 'web').length}

---

## Quick Links

${sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n')}

---

Generated: ${new Date().toLocaleDateString()}

**Note**: Citations are automatically formatted based on available metadata. Some fields may be inferred from URL patterns and titles. For academic publication, please verify and complete citation details manually.
`
  }

  private generateDatasetMethodology(research: ResearchOutput): string {
    return `# Dataset Search Methodology

## Research Topic
${research.topic}

## Overview
This document outlines a practical methodology for searching, acquiring, and preparing datasets relevant to the research objectives.

## 1. Data Sources Identification

### Primary Sources
- **Academic Databases**: IEEE Xplore, ACM Digital Library, Springer, Elsevier
- **Public Repositories**: Kaggle, UCI Machine Learning Repository, Hugging Face Datasets
- **Government Sources**: Data.gov, EU Open Data Portal, World Bank

### Secondary Sources
- **Literature Review**: Extract dataset references from related papers
- **Expert Consultation**: Contact domain experts for proprietary or institution-specific datasets

## 2. Search Strategy

### Keywords
\`\`\`
${research.topic}
machine learning dataset
domain-specific data
benchmark dataset
\`\`\`

## 3. Dataset Evaluation Criteria

### Quality Indicators
- **Completeness**: Missing values below 10%
- **Accuracy**: Ground truth or annotation validation available
- **Consistency**: Standardized formats and stable schema
- **Timeliness**: Recent publication or maintenance activity

## 4. Download Procedures

### Example Script
\`\`\`python
import kaggle
from datasets import load_dataset

def download_dataset(source, identifier):
    if source == 'kaggle':
        kaggle.api.dataset_download_files(identifier)
    elif source == 'huggingface':
        return load_dataset(identifier)
\`\`\`

## 5. Success Criteria

- Identify at least 5 relevant datasets
- Verify licensing and access constraints
- Prioritize primary datasets with a quality score above 7 out of 10

---
Generated: ${new Date().toLocaleDateString()}
`
  }

  private generateArchitectureDocument(research: ResearchOutput): string {
    return `# System Architecture Document

## Project Overview
${research.topic}

## 1. Architecture Overview

\`\`\`
[User Interface Layer]
        |
[API Gateway / Orchestration]
        |
[Application Services]
        |
[Data and Model Layer]
        |
[Infrastructure Layer]
\`\`\`

## 2. Component Architecture

### Research Service
- Orchestrates research workflows
- Manages research state
- Coordinates with AI services

### Dataset Service
- Handles dataset discovery and acquisition
- Supports preprocessing pipelines
- Tracks dataset versions and provenance

### Model Service
- Runs model training and experimentation
- Tracks model artifacts
- Supports evaluation and inference workflows

## 3. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind |
| API | FastAPI, Python 3.11 |
| Database | PostgreSQL, Redis |
| Storage | S3 or MinIO |
| ML | PyTorch, TensorFlow |
| Container | Docker, Kubernetes |

---
Generated: ${new Date().toLocaleDateString()}
`
  }

  private generateEvaluationDocument(research: ResearchOutput): string {
    return `# Evaluation Metrics and Methodology

## Research Topic
${research.topic}

## Overview
This document outlines the evaluation framework for assessing system performance.

## 1. Metrics Specification

${research.evaluationMetrics.map((category) => `### ${category.category}
${category.description}

${category.metrics.map((metric) => `- **${metric.name}**: ${metric.description} (Target: ${metric.target})`).join('\n')}
`).join('\n')}

## 2. Visualization Specifications

### Bar Charts
Used for comparative metric snapshots such as accuracy and F1-score.

### Line Charts
Used for trend analysis over training time or evaluation iterations.

### Heatmaps
Used for correlation, attribution, or confusion-style summaries.

## 3. Success Criteria

| Metric Category | Minimum Threshold | Target Threshold |
|----------------|-------------------|------------------|
| Accuracy | 85% | 90% |
| F1-Score | 82% | 87% |

---
Generated: ${new Date().toLocaleDateString()}
`
  }

  private generateXAIDocument(research: ResearchOutput): string {
    return `# Explainable AI (XAI) Implementation Plan

## Research Topic
${research.topic}

## 1. Selected XAI Techniques

${research.xaiPlan.techniques.map((technique) => `- **${technique.name}**: ${technique.description} (Library: ${technique.library})`).join('\n')}

## 2. Implementation Strategy

${research.xaiPlan.implementation}

## 3. Expected Outputs

${research.xaiPlan.expectedOutputs.map((output) => `- ${output}`).join('\n')}

## 4. Visualization Plans

${research.xaiPlan.visualizations.map((plot, index) => `### ${index + 1}. ${plot.title}
- **Type**: ${plot.type}
- **Description**: ${plot.description}
- **Interpretation**: ${plot.interpretation}
`).join('\n')}

## 5. Success Criteria

| Metric | Target |
|--------|--------|
| Faithfulness Score | > 0.80 |
| Stability Score | > 0.70 |
| User Comprehension | > 75% |

---
Generated: ${new Date().toLocaleDateString()}
`
  }
}

export const documentService = new DocumentService()
