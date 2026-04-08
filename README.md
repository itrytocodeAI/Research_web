# DeepResearch AI Toolkit

A research workspace for generating structured AI-assisted analysis, hypotheses, implementation plans, evaluation criteria, and exportable documents from a single topic prompt. Designed for systematic literature reviews (SLR) and academic research planning.

## Features

### Research Generation
- **Domain-Specific AI Research**: Gemini-backed analysis with specialized guidance for NLP, Computer Vision, Healthcare, Time-Series, Robotics, and more
- **Concrete Model Recommendations**: Specific architecture suggestions (BERT, ViT, YOLO, Transformers, etc.) based on your topic
- **Comprehensive Citations**: Automatic generation of 20-30 academic sources in IEEE and BibTeX formats
- **Actionable Output**: 3-5 page Word documents detailed enough to feed to AI chatbots for implementation

### Research Components
- **Proposed Architecture**: Primary model recommendation, technical details, alternatives, implementation framework, expected performance
- **Research Gaps**: 4-6 gaps with severity levels and academic references
- **Research Problems**: 3-5 specific, measurable problems with significance analysis
- **Hypotheses**: 3-5 testable hypotheses with detailed variables and methodology
- **Implementation Plan**: Phased tasks, timeline, resources, and milestones
- **Evaluation Metrics**: Category-based metrics with targets and visualization suggestions
- **XAI Plan**: Explainability techniques, implementation strategy, and visualizations

### User Experience
- **77 Random Topic Suggestions**: Fresh suggestions on every visit from 9 domains (AI/ML, Climate, Blockchain, Robotics, Cybersecurity, IoT, Education, Finance, Quantum)
- **Progress Tracking**: Real-time feedback during research generation
- **Multiple Export Formats**: Word document + 5 Markdown files (citations, methodology, architecture, metrics, XAI)
- **Citation Management**: IEEE numbered format and BibTeX for LaTeX integration

### Security & Quota
- **Clerk Authentication**: Secure private research sessions
- **Server-Side Quota Enforcement**: Hard stop at free-tier limit (500 requests/day)
- **Supabase Storage**: Private cloud export with signed URLs
- **Fail-Closed Design**: Blocks research requests if quota guard misconfigured

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 3.3
- **Auth**: Clerk (frontend + server-side verification)
- **AI**: Gemini API (gemini-2.5-flash-lite) with Google Search grounding
- **Storage**: Supabase (quota table + private storage bucket)
- **Quota Guard**: Supabase Postgres + Vercel API routes
- **Hosting**: Vercel
- **Document Generation**: `docx` for Word, Markdown for citations/methodology
- **UI Components**: React Markdown, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Clerk application
- A Supabase project with a private storage bucket
- A Gemini API key

### Installation

```bash
npm install
npm run dev
```

### Environment Variables

Create `.env.local` with:

```bash
VITE_API_BASE_URL=
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_AUTHORIZED_PARTIES=https://your-app-domain.vercel.app
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=research-exports
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
```

You can also copy from [`.env.example`](d:/Projects/Research_web/.env.example).

## Deploying To Vercel

1. Import the repository into Vercel.
2. Keep the detected framework as `Vite`.
3. Add these environment variables in Vercel:
   - `VITE_API_BASE_URL` (optional; leave empty for same-origin API routes)
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_AUTHORIZED_PARTIES`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional; defaults to `gemini-2.5-flash-lite`)
4. Run the SQL in [`supabase/daily_ai_quota_usage.sql`](d:/Projects/Research_web/supabase/daily_ai_quota_usage.sql).
5. Create a private Supabase storage bucket matching `SUPABASE_STORAGE_BUCKET`.
6. Deploy.

The repo includes [`vercel.json`](d:/Projects/Research_web/vercel.json) with:

- Build command: `npm run build`
- Output directory: `dist`

For production, `VITE_API_BASE_URL` can stay empty when the frontend and Vercel API routes are served from the same deployment. If you move the API elsewhere later, point `VITE_API_BASE_URL` at that origin instead of hardcoding localhost URLs in the app.

## Security Model

### Authenticated API Routes

The routes [`api/research.js`](d:/Projects/Research_web/api/research.js), [`api/quota.js`](d:/Projects/Research_web/api/quota.js), and [`api/export.js`](d:/Projects/Research_web/api/export.js) require a valid Clerk session token. The server verifies the token before servicing the request.

The frontend uses only the publishable key. Server routes use `CLERK_SECRET_KEY` plus a server-side publishable key value and never expose the secret key to React.

### Ownership Enforcement

Cloud exports are uploaded server-side under a per-user path prefix based on the authenticated Clerk `userId`. The client never gets direct write access to Supabase Storage, and signed URLs are generated only after the server verifies the caller.

### Quota Table Protection

The quota table schema in [`supabase/daily_ai_quota_usage.sql`](d:/Projects/Research_web/supabase/daily_ai_quota_usage.sql) now enables Row Level Security and installs a deny-all client policy. The table is intended for service-role access only through the server quota helpers in [`api/_lib/geminiQuota.js`](d:/Projects/Research_web/api/_lib/geminiQuota.js).

## Gemini Free-Tier Safety Guard

The app is configured around Google's documented free-tier grounded-search limit of 500 requests per day, resetting at midnight Pacific time.

There are now two layers of protection:

1. The UI shows the current quota, remaining requests, and reset time.
2. The server checks a Supabase-backed daily quota counter before every Gemini request and blocks the call when the free-tier cap is reached.

If the server-side quota guard is not configured correctly, the app blocks research requests instead of attempting Gemini calls. That fail-closed behavior is intentional to avoid accidental paid usage from this app.

## Important Caveat

This app now prevents paid spillover from its own request path by enforcing the free-tier daily cap server-side. It cannot control charges created outside this app, such as direct Gemini usage from another project, another API key, or billing configuration changes made in your Google account.

## Current Migration Status

- Blink AI has been replaced with Gemini + Google Search grounding.
- Blink auth has been replaced with Clerk in the client app.
- Export bundle uploads go through a server-authenticated route to Supabase Storage.
- Gemini daily usage is enforced server-side through Supabase.

## Usage

1. **Sign in** with Clerk authentication
2. **Review quota**: Check remaining requests in the quota card
3. **Choose a topic**: Enter your own or select from 4 random suggestions
4. **Generate research**: Wait for AI-powered analysis with 20-30 citations
5. **Review output**: Examine research gaps, hypotheses, proposed architecture
6. **Export**: Download comprehensive Word document (3-5 pages)
7. **Citations**: Access IEEE and BibTeX formatted references in `citations.md`
8. **Supplementary docs**: Review methodology, architecture, metrics, XAI implementation plans

### Generated Documents

Each research session produces:
1. **Word Document**: Comprehensive research report with all sections
2. **citations.md**: IEEE and BibTeX formatted references (20-30 sources)
3. **dataset-search-methodology.md**: Data collection strategies
4. **system-architecture.md**: Technical architecture overview
5. **evaluation-metrics.md**: Performance metrics and targets
6. **xai-implementation-plan.md**: Explainability techniques and visualizations

## Project Structure

```text
src/
  components/
    TopicInput.tsx         77-topic pool with random selection
    ResearchProgress.tsx   Real-time progress indicator
    ResearchResults.tsx    Comprehensive results display
    DocumentViewer.tsx     Markdown preview with syntax highlighting
  lib/
    researchService.ts     Gemini API calls + JSON parsing
    documentService.ts     Word + Markdown generation (6 files)
    geminiQuota.ts         Client-side quota tracking
    supabase.ts            Storage client
  types/
    index.ts               TypeScript interfaces (ResearchOutput, ProposedArchitecture, etc.)
api/
  _lib/
    auth.js                Clerk server-side verification
    geminiQuota.js         Server-side quota enforcement
  research.js              Gemini research endpoint (domain-specific prompts)
  quota.js                 Quota status endpoint
  export.js                Authenticated Supabase upload
supabase/
  daily_ai_quota_usage.sql   Quota table schema with RLS
Research_web_vault/          Obsidian knowledge vault (local only)
  Implementation/            Changelog, decisions (ADRs)
  Sessions/                  Development session notes
  SLR/                       Systematic literature review materials
```

## Key Features in Detail

### Domain-Specific AI Guidance

The system provides specialized recommendations based on your topic:
- **NLP**: BERT, GPT, T5, BART, RoBERTa, fine-tuning strategies
- **Computer Vision**: ViT, YOLO, ResNet, CNNs, Diffusion models, SAM
- **Time-Series**: LSTMs, Transformers, Temporal CNNs, Prophet
- **Healthcare**: Domain-adapted models, privacy-preserving techniques
- **Reinforcement Learning**: PPO, DQN, A3C, RLHF
- **Generative AI**: GANs, VAEs, Diffusion models, LLMs

### Citation System

- **Target**: 20-30 academic sources per research topic
- **Formats**: IEEE numbered citations + BibTeX entries
- **Metadata**: Authors, year, publication type (conference, journal, preprint, repository)
- **Source Types**: Automatically inferred from URLs (arXiv, IEEE, ACM, Springer, etc.)
- **Usage**: Copy IEEE citations to Word, import BibTeX to LaTeX projects

### Research Output Structure

```typescript
ResearchOutput {
  topic: string
  executiveSummary: string
  researchGaps: [{title, description, severity, references}]
  researchProblems: [{id, statement, significance, relatedGaps}]
  hypotheses: [{id, hypothesis, variables, methodology}]
  proposedArchitecture: {
    primaryModel: string           // e.g., "BERT-base-uncased"
    rationale: string              // Why this model
    architectureDetails: string    // Technical specifics
    alternatives: string[]         // Other viable options
    implementationFramework: string // PyTorch/TensorFlow/JAX
    expectedPerformance: string    // Benchmark expectations
  }
  implementationPlan: {phase, tasks, timeline, resources, milestones}
  methodology: string
  evaluationMetrics: [{category, metrics, description}]
  xaiPlan: {techniques, implementation, expectedOutputs, visualizations}
  sources: [{title, url, authors, year, publicationType}]
}
```

## Recent Enhancements

### 2026-04-06: Citation System
- Added automatic IEEE and BibTeX citation generation
- Target 20-30 sources per research topic
- Metadata extraction from URLs (authors, year, publication type)

### 2026-04-04: Research Quality Enhancement
- Added ProposedArchitecture field with specific model recommendations
- Expanded topic suggestions from 4 to 77 across 9 domains
- Enhanced Word documents from 1-2 pages to 3-5 pages
- Domain-specific prompts for personalized research
- Merged architecture into methodology section for better flow

### 2026-04-04: UI Improvements
- Randomized topic suggestions (4 shown from 77-topic pool)
- Simplified export to Word-only (removed PDF/cloud upload)
- Improved markdown viewer contrast
- Cleaner, more focused user interface

## Architecture Decisions

Key ADRs documented in `Research_web_vault/Implementation/Decisions.md`:
- **ADR-014**: IEEE Citation System - Automatic citation generation with metadata extraction
- **ADR-013**: Merged Methodology Section - Cohesive architecture + methodology flow
- **ADR-012**: ProposedArchitecture Field - Structured model recommendations
- **ADR-011**: Randomized Topic Suggestions - 77-topic pool with 4-random display
- **ADR-010**: Single Export Path - Word-only export for simplicity

## Notes

- **Configuration Required**: Clerk, Supabase, and Gemini must be configured before runtime
- **Quota Tracking**: UI quota card reflects server-authoritative state
- **Security**: Client never gets direct Supabase write access (IDOR protection)
- **Token Usage**: Enhanced prompts use ~15-20% more tokens than baseline
- **Citation Quality**: Metadata may be inferred from URLs; verify before publication
- **Free Tier**: 500 grounded requests/day, resets at midnight Pacific time

## Knowledge Vault

The project includes a local Obsidian vault (`Research_web_vault/`) for:
- **Implementation notes**: Changelog, architecture decisions (ADRs)
- **Development sessions**: Detailed session notes with context
- **SLR materials**: Systematic literature review protocol and strategies
- **Assistant guides**: `CLAUDE.md` and `CODEX.md` for AI assistant context

**Note**: The vault is `.gitignore`d - it's a local working memory system.
