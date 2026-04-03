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
  
  let requestState
  try {
    requestState = await clerkClient.authenticateRequest(request, {
      authorizedParties,
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey,
    })
  } catch (clerkError) {
    console.error('[auth] Clerk authenticateRequest threw:', clerkError)
    const error = new Error(`Clerk error: ${clerkError.message}`)
    error.status = 401
    error.clerkError = String(clerkError)
    throw error
  }

  console.log('[auth] Request state keys:', Object.keys(requestState || {}))
  console.log('[auth] Request state:', JSON.stringify(requestState, null, 2))

  if (!requestState.isSignedIn) {
    const error = new Error(requestState.message || 'Unauthorized')
    error.status = 401
    error.clerkState = JSON.stringify(requestState)
    throw error
  }

  const auth = requestState.toAuth()
  if (!auth.userId) {
    const error = new Error('Unauthorized - no userId')
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
