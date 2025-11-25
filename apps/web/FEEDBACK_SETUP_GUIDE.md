# Feedback System Setup Guide

## 🎉 Implementation Complete!

Your feedback system is fully implemented and ready to use. Users can now submit feedback from both the landing page and workspace.

## 📋 Quick Setup (Required)

### 1. Get Resend API Key

1. Go to https://resend.com
2. Sign up for a free account (includes 100 emails/day, 3,000/month)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Update Environment Variables

Open `apps/web/.env` and replace the placeholder:

```env
RESEND_API_KEY=your-resend-api-key-here  # Replace with your actual key
FEEDBACK_EMAIL=qaisfaiz80@gmail.com      # Already set to your email
```

### 3. Verify Domain (Optional but Recommended)

For production, verify your domain in Resend:
- Go to Resend Dashboard → Domains
- Add your domain
- Follow DNS verification steps
- Update the "from" address in `apps/web/src/app/api/feedback/route.js`:

```javascript
from: "DesignCraft Feedback <feedback@yourdomain.com>",  // Change this
```

## 🚀 Testing

### Start Development Server

```bash
cd apps/web
npm run dev
```

### Test Landing Page Feedback

1. Visit http://localhost:4000
2. Look for the feedback button (bottom-right corner with message icon)
3. Click the button
4. Fill out the form:
   - Email: your-test@email.com
   - Message: "Testing feedback from landing page"
5. Click "Send Feedback"
6. Check qaisfaiz80@gmail.com for the email

### Test Workspace Feedback

1. Visit http://localhost:4000/workspace
2. Click the feedback button
3. Submit feedback
4. Verify email indicates "Workspace" as the source

## ✨ Features Implemented

### Feedback Button
- Fixed position (bottom-right)
- Beautiful gradient styling matching your app
- Smooth hover animations
- MessageCircle icon
- Appears on both landing and workspace pages

### Feedback Modal
- Dark theme matching your app design
- Email input with validation
- Message textarea (10-1000 characters)
- Character counter
- Real-time validation
- Loading states
- Success/error messages
- Auto-closes after successful submission
- Close via X button, ESC key, or click outside

### API & Email
- Rate limiting (5 submissions per hour per IP)
- Input validation and sanitization
- Beautiful HTML email template
- Plain text fallback
- Includes submission details:
  - User's email
  - Feedback message
  - Page source (landing/workspace)
  - Timestamp
- Reply-to set to user's email for easy responses

### Security
- XSS protection (input sanitization)
- Rate limiting to prevent spam
- Email format validation
- Message length validation
- Server-side validation

### Accessibility
- ARIA labels and roles
- Keyboard navigation (Tab, ESC)
- Focus management
- Screen reader support
- Proper semantic HTML

## 🎨 Customization

### Change Button Position

Edit `apps/web/src/components/Feedback/FeedbackButton.jsx`:

```jsx
className="fixed bottom-6 right-6 ..."  // Change bottom-6 or right-6
```

### Change Button Style

Modify the gradient colors in the same file:

```jsx
className="... from-[#8B70F6] to-[#9D7DFF] ..."
```

### Change Email Template

Edit `apps/web/src/app/api/feedback/route.js` in the `createEmailHTML` function.

### Adjust Rate Limits

In `apps/web/src/app/api/feedback/route.js`:

```javascript
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 5;          // Max submissions
```

## 📧 Email Preview

Users will receive a beautifully formatted email with:
- Purple gradient header with "📬 New Feedback Received"
- User's email address
- Page source badge (🏠 Landing Page or 🎨 Workspace)
- Formatted timestamp
- Full feedback message
- Professional styling matching your brand

## 🐛 Troubleshooting

### Email Not Sending

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly in `.env`
2. **Check Console**: Look for errors in terminal where dev server is running
3. **Verify Resend Account**: Make sure your Resend account is active
4. **Check Rate Limits**: You might have hit the free tier limit (100/day)

### Button Not Appearing

1. **Check Import**: Ensure FeedbackButton is imported in page files
2. **Check Z-Index**: Button has `z-50`, ensure nothing is covering it
3. **Clear Cache**: Try hard refresh (Ctrl+Shift+R)

### Modal Not Opening

1. **Check Console**: Look for JavaScript errors
2. **Check State**: Ensure modal state is being managed correctly

### Validation Errors

- Email must be valid format
- Message must be 10-1000 characters
- Both fields are required

## 📊 Monitoring

Check your Resend dashboard for:
- Email delivery status
- Bounce rates
- Open rates (if tracking enabled)
- API usage

## 🎯 Next Steps

1. Get your Resend API key
2. Update the `.env` file
3. Test the feedback system
4. (Optional) Verify your domain for production
5. Deploy to production

## 💡 Tips

- Test with different email addresses
- Try submitting invalid data to test validation
- Test on mobile devices
- Check spam folder if emails don't arrive
- Monitor rate limiting by submitting multiple times

---

**Need Help?** Check the Resend documentation at https://resend.com/docs
