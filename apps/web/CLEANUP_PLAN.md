# Next.js Migration Cleanup Plan

## Files/Folders to Remove (Old React Router)

### Directories:
- [ ] `.react-router/` - Generated React Router types
- [ ] `api/` - Old React Router API handlers (replaced by Next.js app/api)
- [ ] `plugins/` - React Router plugins (not needed for Next.js)

### Configuration Files:
- [ ] `react-router.config.ts` - React Router configuration
- [ ] `vite.config.ts` - Vite config (Next.js uses its own bundler)
- [ ] `railway.json` - Railway deployment config (using Vercel now)
- [ ] `nixpacks.toml` - Nixpacks config (not needed for Vercel)
- [ ] `server.ts` - Old React Router server (if exists)

### Documentation Files (Migration docs - can be archived):
- [ ] `BRAND_DRAGGING_SUMMARY.md`
- [ ] `CANVAS_STRETCHING_EXPLANATION.md`
- [ ] `DEPLOYMENT_READY.md`
- [ ] `FEEDBACK_SETUP_GUIDE.md`
- [ ] `FEEDBACK_TEST_NOW.md`
- [ ] `IMAGE_QUALITY_FIX.md`
- [ ] `LATEST_FIXES.md`
- [ ] `MIGRATION_COMPLETE.md`
- [ ] `NEXTJS_MIGRATION_STATUS.md`
- [ ] `RESIZE_FIX_EXPLANATION.md`
- [ ] `RESIZE_IMPROVEMENTS.md`
- [ ] `VERCEL_SERVERLESS_COMPLETE.md`
- [ ] `VERCEL_SERVERLESS_MIGRATION.md`

### Dependencies to Remove from package.json:
- `@react-router/fs-routes`
- `@react-router/node`
- `@react-router/serve`
- `@react-router/dev`
- `react-router`
- `react-router-dom`
- `vite`
- `vite-tsconfig-paths`
- `@hono/auth-js` (if not used)
- `@tailwindcss/vite` (Next.js uses PostCSS)

### Scripts to Remove from package.json:
- `dev:old`
- `build:old`
- `start:old`

## Files to Keep:
- ✅ `app/` - Next.js app directory
- ✅ `src/` - Components, hooks, utils
- ✅ `public/` - Static assets
- ✅ `next.config.js` - Next.js configuration
- ✅ `vercel.json` - Vercel deployment config
- ✅ `.env.local` - Environment variables
- ✅ `package.json` - Dependencies (after cleanup)
- ✅ `tsconfig.json` - TypeScript config
- ✅ `tailwind.config.js` - Tailwind CSS config
- ✅ `postcss.config.js` - PostCSS config
- ✅ `vitest.config.ts` - Testing config (if using Vitest)
- ✅ `setup-database.sql` - Database schema

## Status: Ready for cleanup
