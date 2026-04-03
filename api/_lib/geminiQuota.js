import { createClient } from '@supabase/supabase-js'

const GEMINI_FREE_TIER_DAILY_LIMIT = 500
const PACIFIC_TIME_ZONE = 'America/Los_Angeles'
const PROVIDER_KEY = 'gemini_grounded_search_free'
const TABLE_NAME = 'daily_ai_quota_usage'

export function getGeminiQuotaLimit() {
  return GEMINI_FREE_TIER_DAILY_LIMIT
}

export async function getGeminiQuotaSnapshot() {
export async function getGeminiQuotaSnapshot(userId) {
  const client = getAdminClient()
  if (!userId) {
    const error = new Error('A user identity is required for quota access.')
    error.status = 401
    throw error
  }
  const now = new Date()
  const dateKey = getPacificDateKey(now)
  const resetAt = getNextPacificMidnight(now)
  const used = await readUsage(client, userId, dateKey)

  return {
    limit: getGeminiQuotaLimit(),
    used,
    remaining: Math.max(0, getGeminiQuotaLimit() - used),
    exhausted: used >= getGeminiQuotaLimit(),
    resetAtIso: resetAt.toISOString(),
  }
}

export async function enforceGeminiQuotaOrThrow(userId) {
  const snapshot = await getGeminiQuotaSnapshot(userId)

  if (snapshot.exhausted) {
    const error = new Error('Gemini free-tier quota reached for today.')
    error.status = 429
    error.snapshot = snapshot
    throw error
  }

  return snapshot
}

export async function incrementGeminiQuotaUsage(userId) {
  const client = getAdminClient()
  if (!userId) {
    const error = new Error('A user identity is required for quota access.')
    error.status = 401
    throw error
  }
  const now = new Date()
  const dateKey = getPacificDateKey(now)
  const current = await readUsage(client, userId, dateKey)
  await writeUsage(client, userId, dateKey, current + 1)
  return getGeminiQuotaSnapshot(userId)
}

export async function exhaustGeminiQuota(userId) {
  const client = getAdminClient()
  if (!userId) {
    const error = new Error('A user identity is required for quota access.')
    error.status = 401
    throw error
  }
  const now = new Date()
  const dateKey = getPacificDateKey(now)
  await writeUsage(client, userId, dateKey, getGeminiQuotaLimit())
  return getGeminiQuotaSnapshot(userId)
}

export function getQuotaResetPolicy() {
  return 'Daily grounded-search quotas reset at midnight Pacific time.'
}

function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    const error = new Error('Server-side quota guard is not configured. Add SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL.')
    error.status = 503
    throw error
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

async function readUsage(client, userId, dateKey) {
  const { data, error } = await client
    .from(TABLE_NAME)
    .select('used')
    .eq('provider', PROVIDER_KEY)
    .eq('user_id', userId)
    .eq('date_key', dateKey)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to read Gemini quota usage: ${error.message}`)
  }

  return typeof data?.used === 'number' ? data.used : 0
}

async function writeUsage(client, userId, dateKey, used) {
  const { error } = await client
    .from(TABLE_NAME)
    .upsert(
      {
        provider: PROVIDER_KEY,
        user_id: userId,
        date_key: dateKey,
        used,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'provider,user_id,date_key' }
    )

  if (error) {
    throw new Error(`Failed to persist Gemini quota usage: ${error.message}`)
  }
}

function getPacificDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PACIFIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function getNextPacificMidnight(now) {
  const currentPacific = getPacificDateParts(now)
  const nextDateUtc = Date.UTC(currentPacific.year, currentPacific.month - 1, currentPacific.day + 1, 0, 0, 0)
  const offsetMinutes = getPacificOffsetMinutes(new Date(nextDateUtc))
  return new Date(nextDateUtc - offsetMinutes * 60_000)
}

function getPacificDateParts(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PACIFIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  }
}

function getPacificOffsetMinutes(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PACIFIC_TIME_ZONE,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  })

  const timeZoneName = formatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')
    ?.value

  const match = timeZoneName?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!match) return -480

  const sign = match[1] === '+' ? 1 : -1
  const hours = Number(match[2])
  const minutes = Number(match[3] || '0')

  return sign * (hours * 60 + minutes)
}
