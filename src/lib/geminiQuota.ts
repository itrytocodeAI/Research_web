import { getApiUrl } from './api'

export interface GeminiQuotaSnapshot {
  limit: number
  used: number
  remaining: number
  exhausted: boolean
  resetAtIso: string
}

export function formatQuotaReset(resetAtIso: string): string {
  const resetAt = new Date(resetAtIso)
  return `${resetAt.toLocaleString()} (local time)`
}

export function getQuotaDescription(): string {
  return 'Gemini free grounded-search quota: 500 requests per day, reset at midnight Pacific time.'
}

export function getFallbackQuotaSnapshot(): GeminiQuotaSnapshot {
  const resetAt = getNextPacificMidnight(new Date())

  return {
    limit: 500,
    used: 0,
    remaining: 500,
    exhausted: false,
    resetAtIso: resetAt.toISOString(),
  }
}

export async function fetchGeminiQuotaSnapshot(authToken: string): Promise<GeminiQuotaSnapshot> {
  const response = await fetch(getApiUrl('/api/quota'), {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload || typeof payload !== 'object') {
    throw new Error(
      payload && typeof payload.error === 'string'
        ? payload.error
        : 'Failed to load Gemini quota.'
    )
  }

  const snapshot = payload as Partial<GeminiQuotaSnapshot>

  if (
    typeof snapshot.limit !== 'number' ||
    typeof snapshot.used !== 'number' ||
    typeof snapshot.remaining !== 'number' ||
    typeof snapshot.exhausted !== 'boolean' ||
    typeof snapshot.resetAtIso !== 'string'
  ) {
    throw new Error('Gemini quota response was incomplete.')
  }

  return snapshot as GeminiQuotaSnapshot
}

function getNextPacificMidnight(now: Date): Date {
  const pacificFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = pacificFormatter.formatToParts(now)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  const nextDateUtc = Date.UTC(year, month - 1, day + 1, 0, 0, 0)
  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  })

  const timeZoneName = offsetFormatter
    .formatToParts(new Date(nextDateUtc))
    .find((part) => part.type === 'timeZoneName')
    ?.value

  const match = timeZoneName?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  const sign = match?.[1] === '+' ? 1 : -1
  const hours = Number(match?.[2] || '8')
  const minutes = Number(match?.[3] || '0')

  return new Date(nextDateUtc - sign * (hours * 60 + minutes) * 60_000)
}
