# Vercel Serverless Migration Guide

## What Changed

Your React Router + Hono server has been converted from a long-running server to Vercel serverless functions.

### Key Changes in `__create/index.ts`

1. **Removed**: `createHonoServer()` - This creates a long-running Node.js server incompatible with Vercel
2. **Added**: Serverless function exports using `hono/vercel` adapter:
   ```typescript
   export const GET = handle(app);
   export const POST = handle(app);
   export const PUT = handle(app);
   export const PATCH = handle(app);
   export const DELETE = handle(app);
   export const OPTIONS = handle(app);
   export default handle(app);
   ```

### How It Works

- Each HTTP method is exported as a separate serverless function
- Vercel automatically routes requests to the appropriate handler
- The `handle()` function from `hono/vercel` wraps your Hono app for serverless compatibility
- React Router SSR continues to work through the Hono middleware chain

### Vercel Configuration

Created `vercel.json` with:
- Build command pointing to your React Router build
- Output directory set to `build/client` for static assets
- Rewrites to route all requests through the serverless function

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd apps/web
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `CORS_ORIGINS` (if needed)
   - `NEXT_PUBLIC_CREATE_BASE_URL`
   - `NEXT_PUBLIC_CREATE_HOST`
   - `NEXT_PUBLIC_PROJECT_GROUP_ID`

## Benefits

- ✅ No cold start issues with long-running servers
- ✅ Automatic scaling per request
- ✅ Pay only for actual usage
- ✅ React Router SSR fully functional
- ✅ All Hono middleware preserved (auth, CORS, error handling)

## Testing Locally

Your local dev server still works normally:
```bash
npm run dev
```

The serverless exports only activate when deployed to Vercel.
