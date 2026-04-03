# Supabase Database Setup

This directory contains SQL files for setting up your Supabase database.

## Initial Setup

Run these SQL scripts in your Supabase Dashboard → SQL Editor:

### 1. Quota Tracking Table
File: `daily_ai_quota_usage.sql`

Creates a table to track daily Gemini API usage per user.

```sql
-- Run this first
```

**Important:** This table has RLS disabled to allow server-side quota tracking via the service role key. Security is enforced at the API level through Clerk authentication.

### 2. Storage Bucket for Research Exports
File: `storage_bucket.sql`

Creates a private storage bucket for uploaded research documents.

```sql
-- Run this second
```

**Important:** RLS is disabled on `storage.objects` to allow the API (using service role) to upload files on behalf of authenticated users. The `/api/export` endpoint verifies user authentication via Clerk before allowing any uploads.

## How to Run SQL Scripts

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **"+ New query"**
5. Copy and paste the entire SQL file content
6. Click **"Run"** (or press Ctrl+Enter)

## Verification

### Quota Table
After running `daily_ai_quota_usage.sql`:
- Go to **Table Editor** → `daily_ai_quota_usage`
- Should see columns: `id`, `user_id`, `quota_date`, `num_requests`, `created_at`, `updated_at`

### Storage Bucket
After running `storage_bucket.sql`:
- Go to **Storage**
- Should see bucket: `research-exports` (Private)
- File size limit: 50 MB
- Allowed types: Word documents, Markdown, Plain text

## Environment Variables Required

Make sure these are set in Vercel (or `.env.local` for local dev):

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_STORAGE_BUCKET=research-exports  # Optional, defaults to this

# Clerk Auth
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
VITE_CLERK_PUBLISHABLE_KEY=pk_...

# Gemini AI
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash-lite  # Optional
```

## Security Notes

### Why is RLS disabled?

**For `daily_ai_quota_usage`:**
- The API needs to track quota using the service role key (bypasses RLS)
- Direct client access is blocked via a restrictive RLS policy targeting only `anon` and `authenticated` roles
- Service role operations are not affected by these policies

**For `storage.objects`:**
- The API uploads files using the service role key on behalf of users
- User identity is verified via Clerk authentication in `/api/export`
- Files are organized by user ID: `{userId}/{topic}/{timestamp}-{filename}`
- Signed URLs expire after 1 hour for security

### Data Isolation

Even though RLS is disabled on the storage table, data isolation is maintained:
1. `/api/export` verifies the user is authenticated via Clerk
2. Files are uploaded to paths like: `user_ABC123/topic-name/...`
3. Only authenticated users can trigger exports
4. Signed URLs are temporary (1 hour expiry)

## Troubleshooting

### Error: "relation storage.buckets does not exist"
**Solution:** Enable Storage in Supabase Dashboard first (Storage → Enable)

### Error: "new row violates row-level security policy"
**Solution:** Make sure you ran the `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` command

### Error: "duplicate key value violates unique constraint"
**Solution:** Bucket already exists - this is fine! The SQL uses `ON CONFLICT DO NOTHING`

### Upload fails with 403 or 404
**Solution:** 
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
2. Check bucket exists in Storage tab
3. Verify bucket name matches `SUPABASE_STORAGE_BUCKET` env var (default: `research-exports`)
