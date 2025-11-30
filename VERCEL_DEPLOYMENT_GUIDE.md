# Vercel Deployment Guide - DesignCraft

## ✅ Pre-Deployment Checklist

Your app is ready for deployment! Here's what's been prepared:

- ✅ Code pushed to GitHub
- ✅ Old React Router code removed
- ✅ Mobile app isolated (won't interfere)
- ✅ Clean dependencies
- ✅ `.vercelignore` configured
- ✅ Next.js 15 optimized
- ✅ All features working
- ✅ Vercel CLI installed

---

## 🚀 Deployment Steps

### Step 1: Login to Vercel

Open your terminal and run:

```bash
vercel login
```

This will open your browser to authenticate. Choose your preferred method:
- GitHub
- GitLab
- Bitbucket
- Email

### Step 2: Navigate to Web App Directory

```bash
cd apps/web
```

### Step 3: Deploy to Vercel

For the first deployment, run:

```bash
vercel
```

You'll be asked several questions:

**Q: Set up and deploy?**
- Answer: `Y` (Yes)

**Q: Which scope?**
- Select your Vercel account/team

**Q: Link to existing project?**
- Answer: `N` (No) - for first deployment
- Or `Y` if you already have a project

**Q: What's your project's name?**
- Suggested: `designcraft` or `screenshot-app`

**Q: In which directory is your code located?**
- Answer: `./` (current directory)

**Q: Want to override the settings?**
- Answer: `N` (No) - Vercel will auto-detect Next.js

### Step 4: Set Environment Variables

After deployment, you need to add environment variables:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
# Authentication
AUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.hrlqhnvgtmlblzlznpwv:Screenshot12309@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

# Email (Resend)
RESEND_API_KEY=re_KDdAsDyP_KfuvVnvg6sfZ3KuQtqjTqssw
FEEDBACK_EMAIL=qaisfaiz80@gmail.com
```

**Important:** 
- Replace `your-domain.vercel.app` with your actual Vercel domain
- Generate a new `AUTH_SECRET` for production (use: `openssl rand -base64 32`)

### Step 5: Redeploy with Environment Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

This will deploy to production with your environment variables.

---

## 🔧 Project Configuration

Vercel will automatically detect these settings from your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

**Build Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 20.x (auto-detected)

---

## 📁 What Gets Deployed

**Included:**
- ✅ `apps/web/` - Your Next.js app
- ✅ `app/` - Pages and API routes
- ✅ `src/` - Components, hooks, utils
- ✅ `public/` - Static assets

**Excluded (via `.vercelignore`):**
- ❌ `apps/mobile/` - Mobile app
- ❌ `.react-router/` - Old React Router files
- ❌ `api/` - Old API handlers
- ❌ `plugins/` - Old plugins
- ❌ `.git/`, `.vscode/`, `.kiro/`
- ❌ `*.log`, `*.md` files

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain:

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `designcraft.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

### Recommended Domains:
- `designcraft.app`
- `designcraft.io`
- `screenshot.design`
- `brandedscreenshots.com`

---

## 🔍 Post-Deployment Checklist

After deployment, verify:

### 1. Homepage
- [ ] Visit your Vercel URL
- [ ] Check landing page loads
- [ ] Test "Start Creating Free" button
- [ ] Verify dark mode works

### 2. Authentication
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Check email verification (if enabled)
- [ ] Test logout

### 3. Workspace
- [ ] Upload images
- [ ] Test crop functionality
- [ ] Test background selection
- [ ] Add brand elements
- [ ] Test export/download
- [ ] Verify all effects work

### 4. Feedback System
- [ ] Click feedback button
- [ ] Submit test feedback
- [ ] Check email received

### 5. Performance
- [ ] Run Lighthouse audit
- [ ] Check page load speed
- [ ] Test on mobile device
- [ ] Verify images load properly

---

## 🐛 Troubleshooting

### Build Fails

**Error: Module not found**
- Check all imports use correct paths
- Verify all dependencies in `package.json`
- Run `npm install` locally first

**Error: Environment variables missing**
- Add all required env vars in Vercel dashboard
- Redeploy after adding variables

### Runtime Errors

**Database Connection Failed**
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooler is active
- Ensure database tables exist

**Authentication Not Working**
- Verify `NEXTAUTH_URL` matches your domain
- Check `AUTH_SECRET` is set
- Ensure it's a secure random string

### Performance Issues

**Slow Page Load**
- Enable Vercel Analytics
- Check image optimization
- Review bundle size
- Consider edge functions

---

## 📊 Monitoring & Analytics

### Enable Vercel Analytics:

1. Go to **Analytics** tab
2. Click **Enable Analytics**
3. Monitor:
   - Page views
   - Unique visitors
   - Performance metrics
   - Error rates

### Enable Vercel Speed Insights:

1. Install package:
```bash
npm install @vercel/speed-insights
```

2. Add to layout:
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

**Main Branch (Production):**
```bash
git push origin main
```
→ Deploys to production URL

**Other Branches (Preview):**
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
```
→ Creates preview deployment

---

## 💡 Pro Tips

1. **Use Preview Deployments**
   - Test changes before production
   - Share preview URLs with team
   - Automatic for every PR

2. **Set Up Notifications**
   - Slack integration
   - Email notifications
   - Discord webhooks

3. **Enable Protection**
   - Password protect preview deployments
   - Restrict production deployments
   - Set up deployment protection rules

4. **Optimize Performance**
   - Enable Edge Functions
   - Use Image Optimization
   - Enable compression
   - Set up caching headers

5. **Monitor Costs**
   - Check bandwidth usage
   - Monitor function executions
   - Review build minutes
   - Upgrade plan if needed

---

## 📞 Support

**Vercel Documentation:**
- https://vercel.com/docs

**Next.js Documentation:**
- https://nextjs.org/docs

**Your Project:**
- GitHub: [Your Repository URL]
- Vercel: [Your Vercel Dashboard]

---

## ✅ Deployment Complete!

Once deployed, your app will be live at:
- **Production:** `https://your-project.vercel.app`
- **Custom Domain:** `https://your-domain.com` (if configured)

**Next Steps:**
1. Share your app with users
2. Monitor analytics
3. Gather feedback
4. Iterate and improve

---

**Deployed:** December 2024
**Framework:** Next.js 15.5.6
**Platform:** Vercel
**Status:** 🚀 Ready for Production
