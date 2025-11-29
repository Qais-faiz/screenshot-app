# Design Document: React Router to Next.js Migration

## Overview

This design outlines the migration strategy from React Router v7 + Vite to Next.js 15 (App Router). The migration will be executed in a systematic, incremental approach to minimize risk and ensure feature parity. The key principle is to maintain 100% functionality while adapting to Next.js conventions.

### Migration Strategy

The migration will follow a **parallel structure approach** where we:
1. Keep the existing React Router structure temporarily
2. Create Next.js equivalents alongside
3. Migrate incrementally, testing each component
4. Remove React Router dependencies once migration is complete

## Architecture

### Current Architecture (React Router v7)
```
apps/web/
├── src/
│   ├── app/
│   │   ├── root.tsx (Root layout with SessionProvider)
│   │   ├── layout.jsx (QueryClientProvider wrapper)
│   │   ├── routes.ts (Dynamic route generation)
│   │   ├── page.jsx (Home page)
│   │   ├── workspace/page.jsx
│   │   ├── account/signin/page.jsx
│   │   ├── api/
│   │   │   ├── feedback/route.js
│   │   │   ├── auth/[...]/route.js
│   │   │   └── projects/route.js
│   ├── components/
│   ├── hooks/
│   └── utils/
├── vite.config.ts
└── react-router.config.ts
```

### Target Architecture (Next.js 15)
```
apps/web/
├── app/
│   ├── layout.tsx (Root layout with providers)
│   ├── page.tsx (Home page)
│   ├── workspace/
│   │   └── page.tsx
│   ├── account/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── api/
│   │   ├── feedback/route.ts
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── projects/route.ts
├── components/
├── hooks/
├── utils/
├── lib/
├── next.config.js
└── package.json
```

## Components and Interfaces

### 1. Root Layout Migration

**Current (React Router):**
- `root.tsx`: Contains HTML structure, error boundaries, SessionProvider
- `layout.jsx`: Contains QueryClientProvider
- Custom error handling with SharedErrorBoundary
- HMR connection monitoring
- Parent window communication (sandbox mode)

**Target (Next.js):**
```typescript
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta tags, fonts */}
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Key Changes:**
- Merge `root.tsx` and `layout.jsx` into single `app/layout.tsx`
- Move SessionProvider and QueryClientProvider to `app/providers.tsx` (client component)
- Remove React Router specific imports (Links, Meta, Outlet, Scripts)
- Remove HMR/sandbox-specific code (dev-only features)
- Adapt error boundaries to Next.js error.tsx convention

### 2. Routing System Migration

**Current:**
- Dynamic route generation from file system in `routes.ts`
- Supports `[param]` and `[...catchAll]` syntax
- Manual route configuration

**Target:**
- Next.js App Router file-based routing (automatic)
- Same `[param]` and `[...catchAll]` syntax
- No manual configuration needed

**Migration Steps:**
1. Map all existing routes to Next.js conventions
2. Convert `page.jsx` files to `page.tsx` (with proper typing)
3. Ensure dynamic routes use correct bracket syntax
4. Remove `routes.ts` file

### 3. API Routes Migration

**Current Structure:**
```
src/app/api/
├── feedback/route.js
├── auth/[...]/route.js
├── projects/route.js
└── project-images/route.js
```

**Target Structure:**
```
app/api/
├── feedback/route.ts
├── auth/[...nextauth]/route.ts
├── projects/route.ts
└── project-images/route.ts
```

**API Route Handler Pattern:**

**Current (React Router):**
```javascript
export async function loader({ request }) {
  // GET handler
}

export async function action({ request }) {
  // POST/PUT/DELETE handler
}
```

**Target (Next.js):**
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // GET handler
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  // POST handler
  return NextResponse.json({ data })
}
```

### 4. Client/Server Component Strategy

**Principles:**
- Server Components by default (Next.js convention)
- Mark client components with `'use client'` directive
- Client components needed for:
  - State management (useState, useReducer, Zustand)
  - Effects (useEffect, useLayoutEffect)
  - Event handlers
  - Browser APIs (canvas, localStorage)
  - Third-party libraries requiring browser context

**Component Classification:**

**Server Components:**
- Page layouts without interactivity
- Static content pages
- Data fetching wrappers

**Client Components:**
- All workspace components (BrandEditor, WorkspaceCanvas, etc.)
- All hooks (useProjectManagement, useWorkspaceCanvas, etc.)
- Modal components (FeedbackModal, BrandProfileModal, etc.)
- Interactive controls (BackgroundControls, EditControls, etc.)
- Form components with react-hook-form

### 5. State Management

**Zustand Stores:**
- Keep all existing Zustand stores unchanged
- Ensure stores are imported only in client components
- No changes needed to store logic

**React Query:**
- Migrate to Next.js 15 compatible setup
- Use QueryClientProvider in client-side providers
- Maintain all existing queries and mutations

### 6. Authentication Migration

**Current:**
- Custom Auth.js integration via `@hono/auth-js`
- SessionProvider in root
- API routes for auth

**Target:**
- NextAuth.js (Auth.js for Next.js)
- SessionProvider in client providers
- API route at `app/api/auth/[...nextauth]/route.ts`

**Configuration:**
```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
// Import existing auth config
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Existing auth configuration
})
```

### 7. Environment Variables

**Current:**
- `NEXT_PUBLIC_*` prefix for client-side vars
- Custom Vite plugin for env handling

**Target:**
- Same `NEXT_PUBLIC_*` prefix (Next.js native)
- No plugin needed
- `.env.local` for local development

### 8. Styling Migration

**Tailwind CSS:**
- Keep existing `tailwind.config.js`
- Update content paths to new structure
- No changes to utility classes

**Chakra UI:**
- Keep existing Chakra UI setup
- Ensure ChakraProvider is in client providers
- No changes to components

**Custom CSS:**
- Move `global.css` to `app/globals.css`
- Keep all component-specific CSS files
- Update import paths

## Data Models

### Database Integration

**Current:**
- Neon PostgreSQL via `@neondatabase/serverless`
- Direct queries in API routes
- No ORM

**Target:**
- Same database connection
- Consider moving DB logic to `lib/db.ts`
- No changes to queries

### Type Definitions

**Current:**
- TypeScript types scattered across files
- Some types in component files

**Target:**
- Centralize types in `types/` directory
- Create shared type definitions
- Improve type safety

## Error Handling

### Error Boundaries

**Current:**
- Custom SharedErrorBoundary component
- InternalErrorBoundary for route errors
- ErrorBoundaryWrapper class component

**Target:**
```typescript
// app/error.tsx (Client Component)
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}

// app/global-error.tsx (Root Error)
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

### API Error Handling

**Pattern:**
```typescript
try {
  // API logic
  return NextResponse.json({ data })
} catch (error) {
  console.error(error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Testing Strategy

### Migration Testing Approach

1. **Component-by-Component Testing:**
   - Test each migrated page in isolation
   - Verify visual consistency
   - Test all interactions

2. **API Route Testing:**
   - Test each API endpoint
   - Verify request/response format
   - Test authentication flows

3. **Integration Testing:**
   - Test complete user flows
   - Verify state management
   - Test navigation

4. **Visual Regression Testing:**
   - Compare screenshots before/after
   - Verify styling consistency
   - Check responsive behavior

### Testing Checklist

**Pages:**
- [ ] Home page renders correctly
- [ ] Workspace page with all canvas features
- [ ] Account pages (signin, signup, logout)
- [ ] Feedback page

**Features:**
- [ ] Image upload and processing
- [ ] Canvas manipulation (resize, crop, drag)
- [ ] Brand editor functionality
- [ ] Background controls
- [ ] Project management
- [ ] Authentication flows
- [ ] Feedback submission

**API Routes:**
- [ ] Feedback API
- [ ] Auth API
- [ ] Projects API
- [ ] Project images API

## Build and Deployment Configuration

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add image domains if needed
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    // Custom webpack config if needed
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
```

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

## Migration Phases

### Phase 1: Setup and Configuration
1. Install Next.js dependencies
2. Create Next.js configuration files
3. Set up new directory structure
4. Configure TypeScript for Next.js

### Phase 2: Core Layout Migration
1. Migrate root layout
2. Create providers component
3. Migrate global styles
4. Set up error boundaries

### Phase 3: Page Migration
1. Migrate home page
2. Migrate workspace page
3. Migrate account pages
4. Migrate feedback page

### Phase 4: API Routes Migration
1. Migrate feedback API
2. Migrate auth API
3. Migrate projects API
4. Migrate project images API

### Phase 5: Component Migration
1. Ensure all components work with Next.js
2. Add 'use client' directives where needed
3. Update imports and paths
4. Test all interactions

### Phase 6: Testing and Validation
1. Test all pages
2. Test all API routes
3. Test all features
4. Visual regression testing

### Phase 7: Cleanup and Optimization
1. Remove React Router dependencies
2. Remove Vite configuration
3. Optimize bundle size
4. Final testing

### Phase 8: Deployment
1. Deploy to Vercel
2. Test production build
3. Monitor for errors
4. Performance optimization

## Risk Mitigation

### Potential Issues and Solutions

**Issue 1: Client/Server Component Confusion**
- **Risk:** Components not working due to incorrect client/server designation
- **Solution:** Systematic review of all components, clear documentation of which need 'use client'

**Issue 2: API Route Breaking Changes**
- **Risk:** API routes not working due to different handler patterns
- **Solution:** Thorough testing of each endpoint, maintain request/response contracts

**Issue 3: State Management Issues**
- **Risk:** Zustand stores not working in server components
- **Solution:** Ensure stores only used in client components, test state persistence

**Issue 4: Authentication Flow Breaks**
- **Risk:** Auth.js integration issues with Next.js
- **Solution:** Follow NextAuth.js documentation, test all auth flows

**Issue 5: Build Errors**
- **Risk:** Dependencies not compatible with Next.js
- **Solution:** Review all dependencies, update or replace incompatible ones

**Issue 6: Performance Regression**
- **Risk:** Slower page loads or interactions
- **Solution:** Use Next.js performance tools, optimize images and bundles

## Success Criteria

The migration is successful when:
1. All pages render identically to the current version
2. All features work without errors
3. All API routes respond correctly
4. Authentication flows work seamlessly
5. Build completes without errors
6. Deployment to Vercel succeeds
7. No console errors in production
8. Performance is equal or better than current version
