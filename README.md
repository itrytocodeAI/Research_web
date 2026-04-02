# DeepResearch AI Toolkit

An intelligent web platform that conducts in-depth analysis on any topic, identifies research gaps, formulates hypotheses and implementation plans, generates Word docs saved to Google Drive, and creates clean Markdown files outlining data search, methodology, architecture, evaluation metrics, and explainable AI plots.

## Features

- **AI-Powered Research**: Conduct comprehensive deep research analysis using advanced AI
- **Research Gap Identification**: Automatically identify gaps in current research
- **Hypothesis Formulation**: Generate testable hypotheses based on analysis
- **Implementation Planning**: Create detailed implementation roadmaps
- **Document Generation**: 
  - Word documents (.docx)
  - Markdown files for:
    - Dataset search methodology
    - System architecture documentation
    - Evaluation metrics and methodology
    - XAI implementation plans
- **Google Drive Integration**: Save all generated documents directly to your Google Drive
- **Interactive Interface**: Beautiful, responsive UI with real-time progress tracking

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Blink SDK (AI-powered research)
- **Documents**: docx library for Word generation
- **Markdown**: react-markdown for rendering

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun
- Google account (for Drive integration)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Make sure your `.env.local` file contains:

```
VITE_BLINK_PROJECT_ID=your_project_id
VITE_BLINK_PUBLISHABLE_KEY=your_publishable_key
```

## Usage

1. **Enter Research Topic**: Input your research topic in the search box
2. **AI Analysis**: Watch as AI conducts comprehensive research analysis
3. **Review Results**: Examine identified research gaps and hypotheses
4. **Generate Documents**: 
   - Download Word document report
   - Upload all documents to Google Drive
5. **View Details**: Click on any generated document to view its contents

## Generated Documents

### Word Document
Complete research report including:
- Executive summary
- Research gaps analysis
- Hypotheses
- Implementation plan
- Evaluation metrics
- XAI strategy

### Markdown Documents

1. **dataset-search-methodology.md**: Comprehensive guide for finding and acquiring datasets
2. **system-architecture.md**: Technical architecture documentation
3. **evaluation-metrics.md**: Detailed evaluation framework and metrics specification
4. **xai-implementation-plan.md**: Explainable AI implementation strategy and visualizations

## Architecture

```
src/
├── components/          # React UI components
│   ├── TopicInput.tsx   # Research topic input form
│   ├── ResearchProgress.tsx # Progress tracking
│   ├── ResearchResults.tsx   # Results display
│   └── DocumentViewer.tsx    # Document preview
├── lib/
│   ├── blink.ts        # Blink SDK configuration
│   ├── researchService.ts    # AI research logic
│   └── documentService.ts    # Document generation
└── types/
    └── index.ts        # TypeScript interfaces
```

## Key Features Explained

### Research Gap Analysis
The AI analyzes existing literature and research to identify:
- Underexplored areas
- Contradictory findings
- Methodological limitations
- Coverage gaps

### Hypothesis Formulation
Based on gap analysis, the system generates:
- Testable hypotheses
- Variable specifications (independent, dependent, controlled)
- Suggested methodologies

### XAI Planning
Comprehensive explainable AI strategy including:
- SHAP analysis
- LIME explanations
- Attention visualization
- Counterfactual reasoning
- User studies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For support, email support@blink.new or join our Discord channel.

## Acknowledgments

- Built with [Blink](https://blink.new)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
