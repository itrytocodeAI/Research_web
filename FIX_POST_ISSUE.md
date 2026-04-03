# Quick Fix Script for POST→GET Issue

## Step 1: Delete Debug Files
```bash
rm api/test.js api/research2.js
```

## Step 2: Add this to your `.gitignore` (if not already there)
```
api/test.js
api/research2.js
```

## Step 3: Commit and Push
```bash
git add .
git commit -m "Remove debug endpoints and fix Vercel function config"
git push
```

## Step 4: Clear Vercel Cache
After pushing, go to:
1. Vercel Dashboard → Your Project → Settings
2. Scroll to "Build & Development Settings"
3. Click "Clear Build Cache"
4. Redeploy: Deployments → Latest → ⋯ Menu → Redeploy

## Step 5: Test with Hard Refresh
1. Clear browser cache or use Incognito mode
2. Hard refresh: `Ctrl + Shift + R`
3. Try a research

## If Still Broken: Nuclear Option

The POST→GET issue suggests Vercel thinks `/api/research` is a static route. Try renaming:

```bash
# Rename the API file
mv api/research.js api/research-generate.js
```

Then update `src/lib/researchService.ts` line 20:
```typescript
const response = await fetch(getApiUrl('/api/research-generate'), {
```

This forces Vercel to treat it as a fresh serverless function.

## Debug: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click on the latest deployment
3. Go to "Functions" tab
4. Check if `/api/research` shows up as a function
5. If it doesn't appear, the build didn't detect it

## Alternative: Use Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy directly
vercel --prod
```

This bypasses git and deploys directly from your local machine.
