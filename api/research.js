import {
  enforceGeminiQuotaOrThrow,
  exhaustGeminiQuota,
  getQuotaResetPolicy,
  incrementGeminiQuotaUsage,
} from './_lib/geminiQuota.js'
import { requireAuthenticatedUser } from './_lib/auth.js'

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'

const researchSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'executiveSummary',
    'researchGaps',
    'researchProblems',
    'hypotheses',
    'implementationPlan',
    'methodology',
    'evaluationMetrics',
    'xaiPlan',
  ],
  properties: {
    executiveSummary: { type: 'string' },
    researchGaps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'description', 'severity', 'references'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          references: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    researchProblems: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'statement', 'significance', 'relatedGaps'],
        properties: {
          id: { type: 'string' },
          statement: { type: 'string' },
          significance: { type: 'string' },
          relatedGaps: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    hypotheses: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'hypothesis', 'variables', 'methodology'],
        properties: {
          id: { type: 'string' },
          hypothesis: { type: 'string' },
          variables: {
            type: 'object',
            additionalProperties: false,
            required: ['independent', 'dependent', 'controlled'],
            properties: {
              independent: { type: 'array', items: { type: 'string' } },
              dependent: { type: 'array', items: { type: 'string' } },
              controlled: { type: 'array', items: { type: 'string' } },
            },
          },
          methodology: { type: 'string' },
        },
      },
    },
    implementationPlan: {
      type: 'object',
      additionalProperties: false,
      required: ['phase', 'tasks', 'timeline', 'resources', 'milestones'],
      properties: {
        phase: { type: 'string' },
        tasks: { type: 'array', items: { type: 'string' } },
        timeline: { type: 'string' },
        resources: { type: 'array', items: { type: 'string' } },
        milestones: { type: 'array', items: { type: 'string' } },
      },
    },
    methodology: { type: 'string' },
    evaluationMetrics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'description', 'metrics'],
        properties: {
          category: { type: 'string' },
          description: { type: 'string' },
          metrics: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'description', 'target', 'visualization'],
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                target: { type: 'string' },
                visualization: {
                  type: 'string',
                  enum: ['bar', 'line', 'scatter', 'heatmap', 'confusion_matrix'],
                },
              },
            },
          },
        },
      },
    },
    xaiPlan: {
      type: 'object',
      additionalProperties: false,
      required: ['techniques', 'implementation', 'expectedOutputs', 'visualizations'],
      properties: {
        techniques: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'description', 'library', 'useCase'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              library: { type: 'string' },
              useCase: { type: 'string' },
            },
          },
        },
        implementation: { type: 'string' },
        expectedOutputs: { type: 'array', items: { type: 'string' } },
        visualizations: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['title', 'type', 'description', 'interpretation'],
            properties: {
              title: { type: 'string' },
              type: {
                type: 'string',
                enum: ['feature_importance', 'attention', 'gradient', 'shap_summary', 'lime_explanation'],
              },
              description: { type: 'string' },
              interpretation: { type: 'string' },
            },
          },
        },
      },
    },
  },
}

const DEBUG_VERSION = 'v3-full-debug'

export default async function handler(req, res) {
  // Full debug output for every request
  const debug = {
    version: DEBUG_VERSION,
    timestamp: new Date().toISOString(),
    method: req.method,
    methodType: typeof req.method,
    url: req.url,
    path: req.url?.split('?')[0],
    hasBody: Boolean(req.body),
    bodyKeys: req.body ? Object.keys(req.body) : [],
    bodyTopic: req.body?.topic,
    contentType: req.headers['content-type'],
    hasAuth: Boolean(req.headers.authorization),
    authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : null,
    host: req.headers.host,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50),
    allHeaders: Object.keys(req.headers),
    envCheck: {
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasClerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    },
  }

  console.log('[research] Full debug:', JSON.stringify(debug))

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).json({ ok: true, debug })
  }

  // Check method - case insensitive
  const method = (req.method || '').toUpperCase()
  if (method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ 
      error: 'Method not allowed', 
      debug,
    })
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      debug,
    })
  }

  const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : ''

  if (!topic) {
    return res.status(400).json({ error: 'A research topic is required.', debug })
  }

  try {
    const { userId } = await requireAuthenticatedUser(req)
    await enforceGeminiQuotaOrThrow(userId)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`,
      {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: buildSystemPrompt(),
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Research topic: ${topic}`,
              },
            ],
          },
        ],
        tools: [
          {
            google_search: {},
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    }
    )

    const payload = await response.json()

    console.log('[research] Gemini response status:', response.status)

    if (!response.ok) {
      console.error('[research] Gemini error payload:', JSON.stringify(payload))
      const message = payload?.error?.message || 'Gemini request failed.'
      if (response.status === 429) {
        const snapshot = await exhaustGeminiQuota(userId).catch(() => null)
        return res.status(429).json({
          error: message,
          quotaResetPolicy: getQuotaResetPolicy(),
          quota: snapshot,
        })
      }
      return res.status(response.status).json({
        error: message,
      })
    }

    const parsed = extractStructuredOutput(payload)

    if (!parsed) {
      // Debug: show full candidate structure
      const candidate = payload?.candidates?.[0]
      const content = candidate?.content
      const parts = content?.parts
      const rawText = parts?.[0]?.text || null
      
      return res.status(502).json({
        error: 'Gemini did not return a valid structured research payload.',
        debug: {
          hasCandidate: Boolean(candidate),
          candidateKeys: candidate ? Object.keys(candidate) : [],
          hasContent: Boolean(content),
          contentKeys: content ? Object.keys(content) : [],
          hasParts: Boolean(parts),
          partsLength: Array.isArray(parts) ? parts.length : 0,
          firstPartKeys: parts?.[0] ? Object.keys(parts[0]) : [],
          rawTextLength: rawText?.length || 0,
          rawTextPreview: rawText ? rawText.substring(0, 300) : null,
          finishReason: candidate?.finishReason,
        }
      })
    }

    const snapshot = await incrementGeminiQuotaUsage(userId)

    return res.status(200).json({
      research: parsed,
      sources: extractSources(payload),
      model: DEFAULT_MODEL,
      quota: snapshot,
    })
  } catch (error) {
    console.error('Research API error:', error)
    return res.status(error.status || 500).json({
      error: error instanceof Error ? error.message : 'Unexpected server error.',
      quotaResetPolicy: getQuotaResetPolicy(),
      quota: error.snapshot || null,
      debug: {
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        model: DEFAULT_MODEL,
        stack: error instanceof Error ? error.stack : null,
      },
    })
  }
}

function buildSystemPrompt() {
  return `You are an expert research analyst. Produce a practical, current, implementation-aware research brief.

IMPORTANT: Your response MUST be valid JSON matching this exact structure:
{
  "executiveSummary": "2-3 paragraph summary string",
  "researchGaps": [
    {"title": "string", "description": "string", "severity": "high|medium|low", "references": ["string"]}
  ],
  "researchProblems": [
    {"id": "P1", "statement": "string", "significance": "string", "relatedGaps": ["string"]}
  ],
  "hypotheses": [
    {"id": "H1", "hypothesis": "string", "variables": {"independent": ["string"], "dependent": ["string"], "controlled": ["string"]}, "methodology": "string"}
  ],
  "implementationPlan": {
    "phase": "string", "tasks": ["string"], "timeline": "string", "resources": ["string"], "milestones": ["string"]
  },
  "methodology": "string",
  "evaluationMetrics": [
    {"category": "string", "description": "string", "metrics": [{"name": "string", "description": "string", "target": "string", "visualization": "bar|line|scatter|heatmap|confusion_matrix"}]}
  ],
  "xaiPlan": {
    "techniques": [{"name": "string", "description": "string", "library": "string", "useCase": "string"}],
    "implementation": "string",
    "expectedOutputs": ["string"],
    "visualizations": [{"title": "string", "type": "feature_importance|attention|gradient|shap_summary|lime_explanation", "description": "string", "interpretation": "string"}]
  }
}

Provide 3-5 research gaps, 2-4 research problems, and 2-4 hypotheses. Keep every array populated with meaningful values. Favor concise, concrete statements over generic academic filler. Output ONLY the JSON, no markdown code blocks.`
}

function extractStructuredOutput(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) {
    return null
  }

  for (const item of parts) {
    if (typeof item?.text === 'string') {
      try {
        // Strip markdown code blocks
        let cleanText = item.text.trim()
        const originalLength = cleanText.length
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/i, '')
        console.log('[extract] Original length:', originalLength, 'Cleaned length:', cleanText.length)
        console.log('[extract] First 100 chars:', cleanText.substring(0, 100))
        const parsed = JSON.parse(cleanText)
        console.log('[extract] Successfully parsed JSON with keys:', Object.keys(parsed))
        return parsed
      } catch (error) {
        console.error('[extract] JSON parse failed:', error.message)
        console.error('[extract] Text preview:', item.text.substring(0, 200))
        return null
      }
    }
  }

  return null
}

function extractSources(payload) {
  const chunks = payload?.candidates?.[0]?.groundingMetadata?.groundingChunks
  if (!Array.isArray(chunks)) {
    return []
  }

  const seen = new Set()

  return chunks
    .map((chunk, index) => {
      const url = chunk?.web?.uri
      const title = chunk?.web?.title || `Source ${index + 1}`

      if (typeof url !== 'string' || !url || seen.has(url)) {
        return null
      }

      seen.add(url)
      return { title, url }
    })
    .filter(Boolean)
}
