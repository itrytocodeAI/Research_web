import { createClient } from '@supabase/supabase-js'
import { requireAuthenticatedUser } from './_lib/auth.js'

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'research-exports'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = await requireAuthenticatedUser(req)

    const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : ''
    const markdownDocuments = Array.isArray(req.body?.documents) ? req.body.documents : []
    const wordDocument = req.body?.wordDocument

    if (!topic) {
      return res.status(400).json({ error: 'A topic is required for export.' })
    }

    if (!wordDocument || typeof wordDocument.name !== 'string' || typeof wordDocument.base64 !== 'string') {
      return res.status(400).json({ error: 'A Word document payload is required.' })
    }

    const supabase = getAdminClient()
    const timestamp = Date.now()
    const safeTopic = slugifySegment(topic)
    const uploadedFiles = []

    const wordPath = `${userId}/${safeTopic}/${timestamp}-${slugifySegment(stripFileExtension(wordDocument.name))}.docx`
    const wordBuffer = Buffer.from(wordDocument.base64, 'base64')
    await uploadObject(supabase, wordPath, wordBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    uploadedFiles.push(await buildSignedFile(supabase, 'word-report', wordDocument.name, wordPath))

    for (const doc of markdownDocuments) {
      if (!doc || typeof doc.id !== 'string' || typeof doc.name !== 'string' || typeof doc.content !== 'string') {
        continue
      }

      const objectPath = `${userId}/${safeTopic}/${timestamp}-${slugifySegment(stripFileExtension(doc.name))}.md`
      await uploadObject(supabase, objectPath, doc.content, 'text/markdown; charset=utf-8')
      uploadedFiles.push(await buildSignedFile(supabase, doc.id, doc.name, objectPath))
    }

    return res.status(200).json({ files: uploadedFiles })
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error instanceof Error ? error.message : 'Export failed.',
    })
  }
}

function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    const error = new Error('Supabase server export is not configured.')
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

async function uploadObject(client, objectPath, body, contentType) {
  const { error } = await client.storage.from(DEFAULT_BUCKET).upload(objectPath, body, {
    upsert: false,
    cacheControl: '3600',
    contentType,
  })

  if (error) {
    throw new Error(`Upload failed for ${objectPath}: ${error.message}`)
  }
}

async function buildSignedFile(client, docId, name, objectPath) {
  const { data, error } = await client.storage.from(DEFAULT_BUCKET).createSignedUrl(objectPath, 3600)
  if (error) {
    throw new Error(`Signed URL generation failed for ${name}: ${error.message}`)
  }

  return {
    docId,
    name,
    objectPath,
    signedUrl: data.signedUrl,
  }
}

function slugifySegment(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'export'
}

function stripFileExtension(fileName) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.slice(0, -1).join('.') : fileName
}
