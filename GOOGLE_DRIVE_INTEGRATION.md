# Google Drive Integration Guide

Currently, the app uploads to **Supabase Storage** (your private cloud). This guide shows how to add **Google Drive** upload if needed.

## Current Status

✅ **Working:** Upload to Supabase Storage
- Files stored in your Supabase bucket
- Organized by: `{userId}/{topic}/{timestamp}-{filename}`
- Signed URLs with 1-hour expiry
- Private and secure

❌ **Not Implemented:** Google Drive upload
- Would require Google OAuth
- Users would need to authorize Drive access
- More complex but allows users to access files in their personal Drive

## Should You Add Google Drive?

### Keep Supabase Storage If:
- ✅ You want full control over file storage
- ✅ You don't want users to manage OAuth permissions
- ✅ Supabase storage costs are acceptable ($0.021/GB/month)
- ✅ Signed URLs are sufficient for file access

### Add Google Drive If:
- ✅ Users need files in their personal Drive
- ✅ You want zero storage costs (free Google Drive quota)
- ✅ Users want to organize/share files themselves
- ✅ You're comfortable with OAuth complexity

## How to Add Google Drive (If Needed)

### Step 1: Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable **Google Drive API**:
   - APIs & Services → Library
   - Search "Google Drive API"
   - Click Enable

4. Create OAuth 2.0 Credentials:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://research-web-mmda.vercel.app/api/auth/google/callback`
   - Save Client ID and Client Secret

5. Configure OAuth Consent Screen:
   - Add app name, user support email
   - Scopes: `https://www.googleapis.com/auth/drive.file`
   - Add test users (if in testing mode)

### Step 2: Install Dependencies

```bash
npm install googleapis @google-cloud/storage
```

### Step 3: Add Environment Variables

```env
# Google Drive OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://research-web-mmda.vercel.app/api/auth/google/callback
```

### Step 4: Create OAuth Flow

**api/auth/google.js** - Initiate OAuth
```javascript
export default function handler(req, res) {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.file')}&` +
    `access_type=offline&` +
    `prompt=consent`
  
  res.redirect(authUrl)
}
```

**api/auth/google/callback.js** - Handle OAuth callback
```javascript
import { oauth2Client } from '../../_lib/google.js'

export default async function handler(req, res) {
  const { code } = req.query
  
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    // Store tokens in session/database
    // Redirect back to app
    res.redirect('/?auth=success')
  } catch (error) {
    res.redirect('/?auth=error')
  }
}
```

### Step 5: Create Drive Upload API

**api/export-to-drive.js**
```javascript
import { google } from 'googleapis'
import { requireAuthenticatedUser } from './_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = await requireAuthenticatedUser(req)
  
  // Get user's Google tokens from database
  const userTokens = await getUserGoogleTokens(userId)
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  
  oauth2Client.setCredentials(userTokens)
  
  const drive = google.drive({ version: 'v3', auth: oauth2Client })
  
  const { documents, wordDocument } = req.body
  
  const uploadedFiles = []
  
  // Upload Word document
  const wordBuffer = Buffer.from(wordDocument.base64, 'base64')
  const wordRes = await drive.files.create({
    requestBody: {
      name: wordDocument.name,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: wordBuffer,
    },
  })
  
  uploadedFiles.push({
    id: wordRes.data.id,
    name: wordDocument.name,
    webViewLink: wordRes.data.webViewLink,
  })
  
  // Upload Markdown files
  for (const doc of documents) {
    const mdRes = await drive.files.create({
      requestBody: {
        name: doc.name,
        mimeType: 'text/markdown',
      },
      media: {
        mimeType: 'text/markdown',
        body: doc.content,
      },
    })
    
    uploadedFiles.push({
      id: mdRes.data.id,
      name: doc.name,
      webViewLink: mdRes.data.webViewLink,
    })
  }
  
  return res.status(200).json({ files: uploadedFiles })
}
```

### Step 6: Update Frontend

Add a "Connect Google Drive" button that calls `/api/auth/google` to initiate OAuth.

Store OAuth state in database (e.g., Supabase `user_google_tokens` table).

Update `ResearchResults.tsx` to show both upload options:
- "Upload to Cloud Storage" (Supabase)
- "Upload to Google Drive" (requires authorization)

## Recommendation

**For now, stick with Supabase Storage.** It's:
- Already working
- Simpler to maintain
- No OAuth complexity
- Private and secure

Add Google Drive later if users specifically request it.

## Alternative: Direct Download Only

You could also simplify by **removing cloud upload entirely**:
- Only offer "Download Word Doc"
- Users save to their own Drive/Dropbox manually
- Zero backend storage costs
- Simplest approach

Let me know which direction you prefer!
