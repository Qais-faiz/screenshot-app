# Feedback System Design Document

## Overview

The feedback system will provide users with an easy way to submit feedback from anywhere in the application. The system consists of a fixed-position feedback button, a modal dialog with a form, and email delivery functionality using a serverless email service.

### Key Design Principles

1. **Non-intrusive**: Button is visible but doesn't interfere with main functionality
2. **Consistent**: Same experience across landing page and workspace
3. **Simple**: Minimal fields to reduce friction
4. **Reliable**: Proper validation and error handling
5. **Accessible**: Keyboard navigation and screen reader support

## Architecture

### Component Structure

```
FeedbackButton (Fixed Position Component)
├── FeedbackModal (Dialog Component)
│   ├── FeedbackForm (Form Component)
│   │   ├── EmailInput (Input Field)
│   │   ├── MessageTextarea (Textarea Field)
│   │   └── SubmitButton (Button)
│   └── CloseButton (Button)
```

### Technology Stack

- **Frontend**: React with hooks (useState, useEffect)
- **Styling**: Tailwind CSS (matching existing dark theme)
- **Icons**: lucide-react (MessageCircle icon for button)
- **Email Service**: React Router action with email API
- **Validation**: Client-side validation with HTML5 + custom logic

## Components and Interfaces

### 1. FeedbackButton Component

**Location**: `apps/web/src/components/Feedback/FeedbackButton.jsx`

**Purpose**: Fixed-position button that triggers the feedback modal

**Props**: None (self-contained)

**State**:
- `isModalOpen`: boolean - Controls modal visibility

**Styling**:
- Fixed position: `bottom-6 right-6`
- Z-index: `z-50` (above most content, below modals)
- Background: Gradient `from-[#8B70F6] to-[#9D7DFF]`
- Size: `56px x 56px` (comfortable click target)
- Border radius: `rounded-full`
- Shadow: `shadow-lg` with hover effect
- Icon: MessageCircle from lucide-react

**Behavior**:
- Hover: Scale up slightly (1.05) and increase shadow
- Click: Open modal
- Responsive: Always visible on all screen sizes

### 2. FeedbackModal Component

**Location**: `apps/web/src/components/Feedback/FeedbackModal.jsx`

**Purpose**: Modal dialog containing the feedback form

**Props**:
- `isOpen`: boolean - Controls visibility
- `onClose`: function - Callback to close modal
- `pageSource`: string - "landing" or "workspace" for tracking

**State**:
- `email`: string - User's email address
- `message`: string - Feedback message
- `isSubmitting`: boolean - Loading state during submission
- `submitStatus`: object - { type: 'success' | 'error', message: string }

**Styling**:
- Backdrop: Semi-transparent dark overlay `bg-black/60`
- Modal: Centered, `max-w-md`, dark theme `bg-[#252525]`
- Border: `border border-[#3A3A3A]`
- Border radius: `rounded-2xl`
- Padding: `p-6`
- Animation: Fade in/out with scale effect

**Behavior**:
- Click outside: Close modal
- ESC key: Close modal
- Success: Show success message for 2 seconds, then close
- Error: Show error message, keep modal open

### 3. FeedbackForm Component

**Location**: Integrated within FeedbackModal

**Fields**:

1. **Email Input**
   - Type: email
   - Required: Yes
   - Placeholder: "your@email.com"
   - Validation: HTML5 email validation + custom check
   - Styling: Dark theme input with focus ring

2. **Message Textarea**
   - Type: textarea
   - Required: Yes
   - Placeholder: "Share your thoughts, suggestions, or report issues..."
   - Min length: 10 characters
   - Rows: 6 (expandable)
   - Max length: 1000 characters (with counter)
   - Styling: Dark theme textarea with focus ring

3. **Submit Button**
   - Text: "Send Feedback"
   - Disabled: When submitting or form invalid
   - Loading state: Shows spinner and "Sending..."
   - Styling: Gradient button matching app theme

**Validation Rules**:
- Email: Must be valid email format
- Message: Must be 10-1000 characters
- Both fields: Required

## Data Models

### Feedback Submission Data

```typescript
interface FeedbackData {
  email: string;           // User's email address
  message: string;         // Feedback message
  pageSource: string;      // "landing" or "workspace"
  timestamp: string;       // ISO 8601 timestamp
  userAgent?: string;      // Browser/device info (optional)
}
```

### Email Template Data

```typescript
interface EmailData {
  to: string;              // qaisfaiz80@gmail.com
  subject: string;         // "New Feedback from DesignCraft"
  html: string;            // Formatted HTML email
  text: string;            // Plain text fallback
}
```

## API Integration

### Email Service Options

**Recommended: Resend** (Modern, simple, generous free tier)

**Alternative Options**:
1. SendGrid
2. Mailgun
3. AWS SES
4. Postmark

### API Route

**Location**: `apps/web/src/app/api/feedback/route.ts`

**Method**: POST

**Request Body**:
```json
{
  "email": "user@example.com",
  "message": "Great app! Would love to see...",
  "pageSource": "workspace",
  "timestamp": "2024-11-25T10:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Feedback sent successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Failed to send email",
  "details": "Error message"
}
```

### Email Template

**Subject**: `New Feedback from DesignCraft - [Page Source]`

**HTML Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Instrument Sans', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%); 
              color: white; padding: 20px; border-radius: 8px; }
    .content { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: 600; color: #333; }
    .value { color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Feedback Received</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">From:</div>
        <div class="value">[User Email]</div>
      </div>
      <div class="field">
        <div class="label">Page:</div>
        <div class="value">[Landing Page / Workspace]</div>
      </div>
      <div class="field">
        <div class="label">Submitted:</div>
        <div class="value">[Timestamp]</div>
      </div>
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">[Feedback Message]</div>
      </div>
    </div>
  </div>
</body>
</html>
```

## Integration Points

### Landing Page Integration

**File**: `apps/web/src/app/page.jsx`

**Implementation**:
```jsx
import { FeedbackButton } from '@/components/Feedback/FeedbackButton';

// Add before closing </div> of main container
<FeedbackButton pageSource="landing" />
```

### Workspace Integration

**File**: `apps/web/src/app/workspace/page.jsx`

**Implementation**:
```jsx
import { FeedbackButton } from '@/components/Feedback/FeedbackButton';

// Add before closing </div> of main container
<FeedbackButton pageSource="workspace" />
```

## Error Handling

### Client-Side Errors

1. **Validation Errors**
   - Display inline error messages below fields
   - Prevent form submission
   - Highlight invalid fields with red border

2. **Network Errors**
   - Show error toast/message
   - Keep form data intact
   - Provide retry option

3. **Timeout Errors**
   - 30-second timeout for API calls
   - Show timeout message
   - Allow user to retry

### Server-Side Errors

1. **Email Service Errors**
   - Log error details
   - Return generic error to client
   - Consider fallback email service

2. **Rate Limiting**
   - Implement rate limiting (5 submissions per IP per hour)
   - Return 429 status with retry-after header
   - Show friendly message to user

3. **Invalid Data**
   - Validate on server side
   - Return 400 status with validation errors
   - Sanitize input to prevent XSS

## Security Considerations

### Input Sanitization

- Sanitize email and message on server side
- Prevent XSS attacks
- Validate email format strictly
- Limit message length (1000 chars)

### Rate Limiting

- IP-based rate limiting: 5 submissions per hour
- Email-based rate limiting: 10 submissions per day
- Implement exponential backoff for repeated failures

### Spam Prevention

- Add honeypot field (hidden from users)
- Implement basic bot detection
- Consider adding reCAPTCHA if spam becomes an issue

### Data Privacy

- Don't store feedback in database (send directly via email)
- Don't log sensitive information
- Comply with GDPR (if applicable)

## Testing Strategy

### Unit Tests

1. **FeedbackButton Component**
   - Renders correctly
   - Opens modal on click
   - Applies correct styling

2. **FeedbackModal Component**
   - Opens/closes correctly
   - Validates form inputs
   - Handles submission states
   - Closes on ESC key
   - Closes on outside click

3. **Form Validation**
   - Email validation works
   - Message length validation works
   - Required field validation works

### Integration Tests

1. **Email Sending**
   - API route receives correct data
   - Email service is called with correct parameters
   - Success response is returned
   - Error handling works

2. **End-to-End Flow**
   - User can open modal
   - User can fill form
   - User can submit feedback
   - Success message is shown
   - Modal closes after success

### Manual Testing Checklist

- [ ] Button appears on landing page
- [ ] Button appears on workspace page
- [ ] Button is clickable and opens modal
- [ ] Modal can be closed with X button
- [ ] Modal can be closed by clicking outside
- [ ] Modal can be closed with ESC key
- [ ] Email validation works
- [ ] Message validation works
- [ ] Submit button is disabled when form is invalid
- [ ] Loading state shows during submission
- [ ] Success message appears after submission
- [ ] Error message appears on failure
- [ ] Email is received at qaisfaiz80@gmail.com
- [ ] Email contains all required information
- [ ] Email formatting is correct
- [ ] Works on mobile devices
- [ ] Works on different browsers

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Load modal component only when button is clicked
   - Reduce initial bundle size

2. **Debouncing**
   - Debounce form validation (300ms)
   - Prevent excessive re-renders

3. **Memoization**
   - Memoize modal component
   - Prevent unnecessary re-renders

4. **Code Splitting**
   - Split feedback components into separate chunk
   - Load on demand

## Accessibility

### ARIA Labels

- Button: `aria-label="Open feedback form"`
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="feedback-title"`
- Close button: `aria-label="Close feedback form"`

### Keyboard Navigation

- Tab: Navigate through form fields
- ESC: Close modal
- Enter: Submit form (when in textarea, use Ctrl+Enter)

### Screen Reader Support

- Announce modal opening
- Announce form errors
- Announce submission status
- Proper label associations

## Future Enhancements

### Phase 2 Features (Optional)

1. **Feedback Categories**
   - Bug report
   - Feature request
   - General feedback

2. **Screenshot Attachment**
   - Allow users to attach screenshots
   - Useful for bug reports

3. **Feedback History**
   - Show user their previous feedback
   - Track feedback status

4. **Auto-fill Email**
   - Pre-fill email for authenticated users
   - Reduce friction

5. **Sentiment Analysis**
   - Analyze feedback sentiment
   - Prioritize negative feedback

6. **Integration with Issue Tracker**
   - Automatically create GitHub issues
   - Link feedback to development workflow

## Deployment Checklist

- [ ] Set up email service account (Resend recommended)
- [ ] Add API key to environment variables
- [ ] Create API route for feedback submission
- [ ] Implement FeedbackButton component
- [ ] Implement FeedbackModal component
- [ ] Add FeedbackButton to landing page
- [ ] Add FeedbackButton to workspace page
- [ ] Test email delivery
- [ ] Test error handling
- [ ] Test on mobile devices
- [ ] Test accessibility
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Verify emails are being received

## Environment Variables

```env
# Email Service Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
FEEDBACK_EMAIL=qaisfaiz80@gmail.com

# Rate Limiting (optional)
FEEDBACK_RATE_LIMIT_PER_HOUR=5
FEEDBACK_RATE_LIMIT_PER_DAY=10
```

## Monitoring and Analytics

### Metrics to Track

1. **Usage Metrics**
   - Number of feedback submissions per day
   - Feedback source (landing vs workspace)
   - Average message length

2. **Performance Metrics**
   - API response time
   - Email delivery success rate
   - Error rate

3. **User Behavior**
   - Modal open rate
   - Form abandonment rate
   - Submission success rate

### Error Logging

- Log all API errors
- Log email delivery failures
- Log validation errors (aggregated)
- Set up alerts for high error rates

## Conclusion

This design provides a complete, production-ready feedback system that is:
- Easy to use
- Visually consistent with the app
- Reliable and secure
- Accessible to all users
- Scalable for future enhancements

The implementation will be straightforward using existing technologies and patterns in the codebase, with minimal dependencies and maximum reliability.
