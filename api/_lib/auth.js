import { createClerkClient } from '@clerk/backend'

const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey,
})

export async function requireAuthenticatedUser(req) {
  if (!process.env.CLERK_SECRET_KEY || !publishableKey) {
    const error = new Error('Clerk server authentication is not configured.')
    error.status = 503
    throw error
  }

  const request = toWebRequest(req)
  const authorizedParties = getAuthorizedParties(req)
  const requestState = await clerkClient.authenticateRequest(request, {
    acceptsToken: 'session_token',
    authorizedParties,
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey,
  })

  if (!requestState.isAuthenticated) {
    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }

  const auth = requestState.toAuth()
  if (!auth.userId) {
    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }

  return {
    userId: auth.userId,
    sessionId: auth.sessionId,
  }
}

function getAuthorizedParties(req) {
  const configured = process.env.CLERK_AUTHORIZED_PARTIES
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (configured && configured.length > 0) {
    return configured
  }

  const origin = `${getProtocol(req)}://${req.headers.host}`
  return [origin]
}

function getProtocol(req) {
  const forwarded = req.headers['x-forwarded-proto']
  return Array.isArray(forwarded) ? forwarded[0] : forwarded || 'https'
}

function toWebRequest(req) {
  const origin = `${getProtocol(req)}://${req.headers.host}`
  const url = new URL(req.url || '/', origin)

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item)
      }
    } else if (typeof value === 'string') {
      headers.set(key, value)
    }
  }

  return new Request(url.toString(), {
    method: req.method || 'GET',
    headers,
  })
}
