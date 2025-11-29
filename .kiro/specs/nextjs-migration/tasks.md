# Implementation Plan: React Router to Next.js Migration

- [x] 1. Setup Next.js project structure and dependencies



  - Install Next.js 15 and required dependencies
  - Create `next.config.js` with webpack configuration for canvas and node modules
  - Update `package.json` scripts for Next.js (dev, build, start)
  - Create `tsconfig.json` updates for Next.js paths and compiler options
  - _Requirements: 1.2, 5.3, 5.4_

- [x] 2. Create root layout and providers infrastructure




  - [x] 2.1 Create `app/layout.tsx` merging root.tsx and layout.jsx functionality




    - Implement HTML structure with meta tags and font loading
    - Set up proper TypeScript types for layout props
    - _Requirements: 1.1, 6.1, 6.3_
  
  - [x] 2.2 Create `app/providers.tsx` client component




    - Implement SessionProvider for authentication
    - Implement QueryClientProvider with existing configuration
    - Add ChakraProvider for Chakra UI
    - Mark as 'use client' directive
    - _Requirements: 3.1, 3.5, 4.5, 6.3_
  
  - [x] 2.3 Create `app/error.tsx` and `app/global-error.tsx`




    - Implement error boundary UI matching current design
    - Add error recovery functionality
    - Mark as 'use client' directive
    - _Requirements: 2.2_

- [x] 3. Migrate global styles and assets




  - [x] 3.1 Move and update global CSS



    - Rename `src/app/global.css` to `app/globals.css`
    - Update Tailwind directives and imports
    - Verify all custom CSS classes are preserved
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 3.2 Update Tailwind configuration




    - Update `tailwind.config.js` content paths for new structure
    - Preserve all existing theme customizations
    - Ensure Chakra UI integration remains intact
    - _Requirements: 6.1, 6.3_
  
  - [x] 3.3 Migrate static assets and fonts



    - Move assets to `public/` directory
    - Update font loading mechanism for Next.js
    - Update asset references in components
    - _Requirements: 6.5_

- [x] 4. Migrate authentication system



  - [x] 4.1 Set up NextAuth.js configuration



    - Create `lib/auth.ts` with NextAuth configuration
    - Port existing Auth.js configuration from `@hono/auth-js`
    - Configure session strategy and callbacks
    - _Requirements: 4.4, 4.5_
  
  - [x] 4.2 Create auth API route


    - Create `app/api/auth/[...nextauth]/route.ts`
    - Implement GET and POST handlers using NextAuth handlers
    - Test authentication flow
    - _Requirements: 1.5, 4.1, 4.2_
  
  - [x] 4.3 Update auth imports across application

    - Replace `@auth/create/react` imports with `next-auth/react`
    - Update SessionProvider usage in providers
    - Update useSession hooks in components
    - _Requirements: 4.5_

- [x] 5. Migrate API routes


  - [x] 5.1 Migrate feedback API route


    - Create `app/api/feedback/route.ts`
    - Convert loader/action pattern to GET/POST handlers
    - Preserve database operations and response format
    - Test endpoint functionality
    - _Requirements: 1.5, 4.1, 4.2, 4.3, 7.2_
  
  - [x] 5.2 Migrate projects API routes

    - Create `app/api/projects/route.ts`
    - Convert all CRUD operations to Next.js route handlers
    - Preserve database queries and business logic
    - Test all endpoints
    - _Requirements: 1.5, 4.1, 4.2, 4.3_
  
  - [x] 5.3 Migrate project-images API routes

    - Create `app/api/project-images/route.ts`
    - Implement image upload and processing handlers
    - Preserve image optimization logic
    - Test upload and retrieval
    - _Requirements: 1.5, 4.1, 4.2, 8.1, 8.2, 8.3_
  
  - [x] 5.4 Add API error handling middleware

    - Create consistent error handling pattern for all API routes
    - Implement try-catch blocks with proper error responses
    - Add logging for debugging
    - _Requirements: 4.2_

- [x] 6. Migrate page components



  - [x] 6.1 Migrate home page



    - Create `app/page.tsx` from `src/app/page.jsx`
    - Ensure all components render correctly
    - Add 'use client' if needed for interactivity
    - Test navigation and links
    - _Requirements: 1.1, 2.1, 2.2_
  
  - [x] 6.2 Migrate workspace page



    - Create `app/workspace/page.tsx` from `src/app/workspace/page.jsx`
    - Mark as 'use client' for canvas interactions
    - Verify all workspace features work (canvas, brand editor, controls)
    - Test image upload and manipulation
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 8.1, 8.2, 8.3, 8.4_
  

  - [x] 6.3 Migrate account pages


    - Create `app/account/signin/page.tsx`
    - Create `app/account/signup/page.tsx`
    - Create `app/account/logout/page.tsx`
    - Mark as 'use client' for form handling
    - Test authentication flows
    - _Requirements: 1.1, 2.1, 2.2, 2.5_
  

  - [x] 6.4 Migrate feedback page

    - Create `app/feedback/page.tsx` from `src/app/feedback/page.tsx`
    - Mark as 'use client' for form interactions
    - Verify feedback submission works
    - _Requirements: 1.1, 2.1, 2.2, 7.1, 7.3_

- [x] 7. Update workspace components for Next.js




  - [x] 7.1 Add 'use client' to interactive components


    - Add directive to BrandEditor.jsx
    - Add directive to WorkspaceCanvas.jsx
    - Add directive to all control components (BackgroundControls, EditControls, etc.)
    - Add directive to all modal components
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 3.3_
  
  - [x] 7.2 Update component imports and paths


    - Update all relative imports for new structure
    - Update asset imports to use Next.js conventions
    - Fix any broken import paths
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.3 Verify canvas functionality


    - Test image resize operations
    - Test crop functionality
    - Test drag and transform operations
    - Test canvas export
    - _Requirements: 2.3, 8.2, 8.3, 8.4_

- [x] 8. Update hooks for Next.js compatibility



  - [x] 8.1 Mark all custom hooks as client-side



    - Add 'use client' to useProjectManagement.js
    - Add 'use client' to useWorkspaceCanvas.js
    - Add 'use client' to useCanvasInteraction.js
    - Add 'use client' to useImageTransforms.js
    - _Requirements: 3.2, 3.3_
  
  - [x] 8.2 Update hook imports across components


    - Verify all hooks work in client components
    - Test state management with Zustand
    - Test React Query hooks
    - _Requirements: 3.1, 3.2, 3.5_

- [x] 9. Migrate utility functions and helpers


  - [x] 9.1 Move utilities to appropriate locations


    - Move `src/utils/` to `utils/` or `lib/`
    - Update imageResize.js for Next.js
    - Update backgroundOptions.js
    - _Requirements: 8.2, 8.3, 8.5_
  

  - [x] 9.2 Update utility imports

    - Update all imports of utility functions
    - Verify utilities work in both client and server contexts
    - _Requirements: 2.1, 2.2_


- [x] 10. Configure environment variables


  - [x] 10.1 Create `.env.local` file




    - Copy all environment variables from `.env`
    - Ensure `NEXT_PUBLIC_*` prefix for client-side vars
    - Add any Next.js specific variables
    - _Requirements: 5.5_
  
  - [x] 10.2 Update environment variable usage


    - Replace `import.meta.env` with `process.env`
    - Verify all env vars are accessible
    - Test in both dev and build modes
    - _Requirements: 5.5_

- [x] 11. Update database and external integrations


  - [x] 11.1 Create database utility module


    - Create `lib/db.ts` for database connections
    - Move Neon PostgreSQL setup to centralized location
    - Export reusable query functions
    - _Requirements: 4.3_
  
  - [x] 11.2 Verify third-party integrations


    - Test Stripe integration
    - Test Resend email integration
    - Test any other external APIs
    - _Requirements: 4.5_

- [x] 12. Build and test the application



  - [x] 12.1 Run development server




    - Execute `npm run dev`
    - Verify hot reload works
    - Check for console errors
    - Test navigation between pages
    - _Requirements: 5.1, 5.2_
  

  - [x] 12.2 Run production build


    - Execute `npm run build`
    - Verify build completes without errors
    - Check build output for warnings
    - _Requirements: 5.2, 5.3_
  
  - [x] 12.3 Test production mode locally

    - Execute `npm run start`
    - Test all pages in production mode
    - Verify API routes work
    - Check for any runtime errors
    - _Requirements: 5.2_

- [x] 13. Comprehensive feature testing

  - [x] 13.1 Test authentication flows

    - Test sign in functionality
    - Test sign up functionality
    - Test logout functionality
    - Test protected routes
    - _Requirements: 2.5, 4.4, 4.5_
  
  - [x] 13.2 Test workspace features

    - Test image upload
    - Test canvas resize operations
    - Test crop functionality
    - Test brand editor
    - Test background controls
    - Test project save/load
    - _Requirements: 2.3, 2.4, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 13.3 Test feedback system

    - Test feedback modal opening
    - Test feedback form submission
    - Verify feedback is stored in database
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 13.4 Test API endpoints

    - Test all GET requests
    - Test all POST requests
    - Test authentication on protected endpoints
    - Verify response formats
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 14. Visual and styling verification

  - [x] 14.1 Compare pages visually

    - Compare home page with original
    - Compare workspace page with original
    - Compare account pages with original
    - Verify responsive design works
    - _Requirements: 2.1, 2.2, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 14.2 Test Chakra UI components

    - Verify all Chakra components render correctly
    - Test theme consistency
    - Test dark mode if applicable
    - _Requirements: 6.3, 6.5_

- [x] 15. Cleanup and optimization

  - [x] 15.1 Remove React Router dependencies

    - Uninstall `react-router`, `react-router-dom`, `@react-router/*` packages
    - Remove `vite.config.ts`
    - Remove `react-router.config.ts`
    - Remove unused plugins from `plugins/` directory
    - _Requirements: 1.1, 1.2_
  
  - [x] 15.2 Remove Vite-specific code

    - Remove Vite plugins
    - Remove HMR-specific code
    - Remove sandbox communication code (if not needed)
    - Clean up unused imports
    - _Requirements: 1.1, 1.2_
  
  - [x] 15.3 Optimize bundle size

    - Analyze bundle with Next.js analyzer
    - Identify and remove unused dependencies
    - Optimize image imports
    - _Requirements: 5.2_

- [x] 16. Prepare for Vercel deployment

  - [x] 16.1 Create Vercel configuration

    - Create or update `vercel.json` if needed
    - Configure build settings
    - Set up environment variables in Vercel dashboard
    - _Requirements: 1.3, 5.5_
  
  - [x] 16.2 Test deployment

    - Deploy to Vercel preview environment
    - Test all functionality in deployed version
    - Check for any production-only issues
    - Verify environment variables work
    - _Requirements: 1.3, 5.2_
  
  - [x] 16.3 Monitor and fix deployment issues

    - Check Vercel logs for errors
    - Fix any deployment-specific issues
    - Verify all API routes work in production
    - Test performance and loading times
    - _Requirements: 1.3_

- [x] 17. Final validation and documentation

  - [x] 17.1 Create migration documentation

    - Document all changes made
    - Create guide for running the Next.js app
    - Document any breaking changes or differences
    - _Requirements: 5.1, 5.2_
  
  - [x] 17.2 Final testing checklist

    - Run through all user flows
    - Verify all requirements are met
    - Check for console errors
    - Verify performance is acceptable
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_
