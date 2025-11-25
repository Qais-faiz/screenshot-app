# Deployment Guide for Vercel

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git repository pushed to GitHub/GitLab/Bitbucket
3. Environment variables ready

## Step 1: Prepare Environment Variables

You'll need to add these environment variables in Vercel:

```
AUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
AUTH_URL=https://your-domain.vercel.app/api/auth
DATABASE_URL=postgresql://postgres.hrlqhnvgtmlblzlznpwv:Screenshot12309@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
NODE_ENV=production
RESEND_API_KEY=re_KDdAsDyP_KfuvVnvg6sfZ3KuQtqjTqssw
FEEDBACK_EMAIL=qaisfaiz80@gmail.com
```

## Step 2: Add Build Script

First, let's add a build script to your package.json. Run this command:

```bash
cd apps/web
```

Then manually add to `package.json` scripts section:
```json
"build": "react-router build"
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the apps/web directory:
```bash
cd apps/web
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **screenshot-app** (or your preferred name)
   - Directory? **./apps/web** or **./** (if already in apps/web)
   - Override settings? **N**

5. Add environment variables:
```bash
vercel env add AUTH_SECRET
vercel env add AUTH_URL
vercel env add DATABASE_URL
vercel env add NODE_ENV
vercel env add RESEND_API_KEY
vercel env add FEEDBACK_EMAIL
```

6. Deploy to production:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new

2. Import your Git repository

3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build` or `react-router build`
   - **Output Directory**: `build` (React Router default)
   - **Install Command**: `npm install`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add all the variables listed above
   - Make sure to select "Production", "Preview", and "Development"

5. Click "Deploy"

## Step 4: Update AUTH_URL

After deployment, update the AUTH_URL environment variable:

1. Get your deployment URL (e.g., `https://screenshot-app.vercel.app`)
2. Update AUTH_URL to: `https://your-domain.vercel.app/api/auth`
3. Redeploy

## Step 5: Test Feedback System

Once deployed:

1. Visit your production URL
2. Click the feedback button (bottom-right)
3. Submit feedback
4. Check qaisfaiz80@gmail.com for the email

## Troubleshooting

### Build Fails

If the build fails, check:
- All dependencies are in `package.json`
- Build script is correct
- No TypeScript errors: `npm run typecheck`

### Environment Variables Not Working

- Make sure variables are added for "Production" environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Feedback Not Sending

- Verify RESEND_API_KEY is correct
- Check Vercel function logs for errors
- Verify email is being sent from Resend dashboard

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check Supabase connection pooler is accessible from Vercel
- May need to whitelist Vercel IPs in Supabase

## Post-Deployment

1. **Set up custom domain** (optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update AUTH_URL to use custom domain

2. **Monitor**:
   - Check Vercel Analytics
   - Monitor Resend dashboard for email delivery
   - Check Vercel function logs for errors

3. **Test thoroughly**:
   - Test all features
   - Test feedback system
   - Test authentication
   - Test image upload and editing

## Notes

- The feedback system should work in production even if it fails in development
- API routes are built differently in production (no dynamic imports)
- First deployment may take 5-10 minutes
- Subsequent deployments are faster (1-2 minutes)

## Support

If you encounter issues:
- Check Vercel deployment logs
- Check browser console for errors
- Check Vercel function logs
- Contact Vercel support if needed
