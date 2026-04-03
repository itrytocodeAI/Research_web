import type { ResearchOutput, Document as ResearchDocument } from '../types'

export class DocumentService {
  async generateWordDocument(research: ResearchOutput): Promise<Blob> {
    const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx')

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Deep Research Report',
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Topic: ${research.topic}`,
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              text: `Generated: ${new Date().toLocaleDateString()}`,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: 'Executive Summary',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: research.executiveSummary,
            }),
            new Paragraph({
              text: 'Research Gaps',
              heading: HeadingLevel.HEADING_1,
            }),
            ...research.researchGaps.flatMap((gap, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${gap.title}`,
                    bold: true,
                  }),
                  new TextRun({
                    text: ` (Severity: ${gap.severity.toUpperCase()})`,
                    color: gap.severity === 'high' ? 'FF0000' : '000000',
                  }),
                ],
                spacing: { before: 200 },
              }),
              new Paragraph({
                text: gap.description,
                indent: { left: 720 },
              }),
            ]),
            new Paragraph({
              text: 'Hypotheses',
              heading: HeadingLevel.HEADING_1,
            }),
            ...research.hypotheses.map((hypothesis) => new Paragraph({
              children: [
                new TextRun({
                  text: `Hypothesis ${hypothesis.id}: `,
                  bold: true,
                }),
                new TextRun({
                  text: hypothesis.hypothesis,
                }),
              ],
              spacing: { before: 200 },
            })),
            new Paragraph({
              text: 'Implementation Plan',
              heading: HeadingLevel.HEADING_1,
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
            }),
            ...research.implementationPlan.tasks.map((task) => new Paragraph({
              text: task,
              bullet: { level: 0 },
            })),
            new Paragraph({
              text: 'XAI Implementation Plan',
              heading: HeadingLevel.HEADING_1,
            }),
            ...research.xaiPlan.techniques.map((technique) => new Paragraph({
              children: [
                new TextRun({
                  text: technique.name,
                  bold: true,
                }),
                new TextRun({
                  text: ` - ${technique.description}`,
                }),
              ],
              bullet: { level: 0 },
            })),
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
