# DesignCraft - Screenshot Editing Tool

A professional screenshot editing and branding tool built with Next.js.

## Project Structure

This is a monorepo containing two applications:

### 📱 apps/web (ACTIVE)
The main Next.js web application for screenshot editing.
- **Framework:** Next.js 15.5.6
- **Status:** ✅ Active and deployed
- **Deployment:** Vercel
- **URL:** [Your Vercel URL]

### 📱 apps/mobile (INACTIVE)
React Native/Expo mobile application (currently not in use).
- **Framework:** Expo v53
- **Status:** ⚠️ Inactive - Scaffolded but not implemented
- **Note:** Ignored during Vercel deployments

## Deployment

### Web App (apps/web)
The web application is configured for Vercel deployment:
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: `build/client`

### Mobile App
The mobile app is currently **INACTIVE** and excluded from deployments via `.vercelignore`.

## Development

### Running the Web App
```bash
cd apps/web
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables
Required environment variables for the web app (`.env.local`):
- `AUTH_SECRET` - Authentication secret key
- `NEXTAUTH_URL` - NextAuth URL
- `DATABASE_URL` - PostgreSQL database connection string
- `RESEND_API_KEY` - Resend API key for emails
- `FEEDBACK_EMAIL` - Email address for feedback submissions

## Features

- 🎨 Screenshot editing with background customization
- 🖼️ Image transformations (crop, rotate, scale)
- 🎭 Brand elements (logo and text)
- 🌈 Gradient and solid color backgrounds
- ✨ Shadow and noise effects
- 📤 High-quality PNG export
- 💬 Feedback system
- 🔐 User authentication

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **Authentication:** NextAuth.js
- **Email:** Resend
- **Deployment:** Vercel

## Notes

- The mobile app folder is kept for future development but is currently inactive
- All active development is focused on the web application
- The `.vercelignore` file ensures the mobile app doesn't interfere with web deployments

---

**Last Updated:** December 2024
