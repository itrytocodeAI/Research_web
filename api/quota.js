import { getGeminiQuotaSnapshot, getQuotaResetPolicy } from './_lib/geminiQuota.js'
import { requireAuthenticatedUser } from './_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = await requireAuthenticatedUser(req)
    const snapshot = await getGeminiQuotaSnapshot(userId)
    return res.status(200).json({
      ...snapshot,
      quotaResetPolicy: getQuotaResetPolicy(),
    })
  } catch (error) {
    console.error('[quota] Auth or quota error:', error)
    return res.status(error.status || 500).json({
      error: error instanceof Error ? error.message : 'Failed to load Gemini quota.',
      quotaResetPolicy: getQuotaResetPolicy(),
      debug: {
        hasSecretKey: Boolean(process.env.CLERK_SECRET_KEY),
        hasPublishableKey: Boolean(process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY),
        hasAuthorizedParties: Boolean(process.env.CLERK_AUTHORIZED_PARTIES),
        authorizedParties: process.env.CLERK_AUTHORIZED_PARTIES,
        host: req.headers.host,
      },
    })
  }
}
