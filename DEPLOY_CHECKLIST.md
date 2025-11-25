# Quick Deployment Checklist ✅

## Before Deploying

- [x] Build script added to package.json
- [x] Resend API key obtained
- [x] Environment variables documented
- [ ] Code committed to Git
- [ ] Git repository pushed to GitHub/GitLab

## Deploy Steps

### Quick Deploy (5 minutes)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd apps/web
   vercel
   ```

4. **Add Environment Variables** (one by one)
   ```bash
   vercel env add AUTH_SECRET
   vercel env add DATABASE_URL
   vercel env add RESEND_API_KEY
   vercel env add FEEDBACK_EMAIL
   ```
   
   Values:
   - AUTH_SECRET: `your-super-secret-key-change-this-in-production-min-32-chars`
   - DATABASE_URL: `postgresql://postgres.hrlqhnvgtmlblzlznpwv:Screenshot12309@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`
   - RESEND_API_KEY: `re_KDdAsDyP_KfuvVnvg6sfZ3KuQtqjTqssw`
   - FEEDBACK_EMAIL: `qaisfaiz80@gmail.com`

5. **Get deployment URL** (from Vercel output)

6. **Add AUTH_URL**
   ```bash
   vercel env add AUTH_URL
   ```
   Value: `https://your-deployment-url.vercel.app/api/auth`

7. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## After Deployment

- [ ] Visit your production URL
- [ ] Test feedback button
- [ ] Submit test feedback
- [ ] Check email at qaisfaiz80@gmail.com
- [ ] Test image upload
- [ ] Test workspace features
- [ ] Test authentication

## Expected Result

✅ Feedback system should work in production!
✅ Email should be sent to qaisfaiz80@gmail.com
✅ All features should work normally

## If Feedback Still Doesn't Work

The issue might be deeper. In that case, we can:
1. Use a third-party form service (Formspree/Web3Forms)
2. Debug the API routing system
3. Try a different deployment platform

## Quick Commands Reference

```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

Good luck! 🚀
