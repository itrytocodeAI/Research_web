# DeepResearch AI Toolkit

A research workspace for generating structured AI-assisted analysis, hypotheses, implementation plans, evaluation criteria, and exportable documents from a single topic prompt.

## Features

- AI-assisted deep research generation through a Gemini-backed Vercel API route
- Structured outputs for research gaps, research problems, hypotheses, implementation plans, methodology, evaluation metrics, and XAI strategy
- Clerk-based authentication for private research sessions
- Word document export, Markdown document previews, and server-authenticated cloud export to Supabase Storage
- Visible Gemini free-tier quota tracking with a hard stop when the daily quota is exhausted
- Server-enforced daily quota guard backed by Supabase so this app fails closed before paid spillover
- Responsive React + Vite interface with progress feedback

## Technology Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Auth: Clerk
- AI: Gemini API with Google Search grounding via `/api/research`
- Storage: Supabase Storage via server-side upload route
- Quota guard: Supabase Postgres + Vercel API routes
- Hosting: Vercel
- Documents: `docx`
- Markdown rendering: `react-markdown`

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

1. Sign in with Clerk.
2. Review the Gemini quota card in the UI.
3. Enter a research topic.
4. Wait for the generated research brief.
5. Download the Word report, inspect the Markdown documents, or upload the export bundle to Supabase Storage.

## Project Structure

```text
src/
  components/        React UI components
  lib/               Research, quota, and document services
  types/             Shared TypeScript models
api/
  _lib/              Server-side auth and quota helpers
  export.js          Authenticated export route
  quota.js           Quota status endpoint
  research.js        Gemini-backed research route
supabase/
  daily_ai_quota_usage.sql   Quota table schema
```

## Notes

- The app assumes Clerk, Supabase, and Gemini are configured before runtime.
- The quota card reflects the server-authoritative quota state.
- The current design intentionally avoids client-side direct storage writes to reduce IDOR risk.
