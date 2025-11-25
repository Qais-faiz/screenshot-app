# Implementation Plan

- [x] 1. Set up email service and environment configuration


  - Create Resend account and obtain API key
  - Add RESEND_API_KEY and FEEDBACK_EMAIL to .env file
  - Install resend package: `npm install resend`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Create feedback API route


  - [x] 2.1 Create API route file at `apps/web/src/app/api/feedback/route.ts`


    - Implement POST handler to receive feedback data
    - Validate incoming data (email format, message length)
    - Add rate limiting logic (5 submissions per hour per IP)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.2 Implement email sending functionality

    - Initialize Resend client with API key
    - Create HTML email template with feedback data
    - Create plain text fallback
    - Send email to qaisfaiz80@gmail.com
    - Handle email service errors gracefully
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.3 Add error handling and response formatting

    - Return success response with appropriate status code
    - Return error responses with descriptive messages
    - Log errors for monitoring
    - Implement 30-second timeout
    - _Requirements: 3.4, 3.5_

- [x] 3. Create FeedbackButton component


  - [x] 3.1 Create component file at `apps/web/src/components/Feedback/FeedbackButton.jsx`


    - Implement fixed-position button with MessageCircle icon
    - Add state management for modal visibility
    - Style with Tailwind CSS (gradient background, rounded-full, shadow)
    - Add hover effects (scale, shadow increase)
    - Position at bottom-6 right-6 with z-50
    - _Requirements: 1.1, 2.1, 2.2, 4.1_

  - [x] 3.2 Add accessibility attributes

    - Add aria-label for screen readers
    - Ensure keyboard focusable
    - Add proper button semantics
    - _Requirements: 1.1, 2.1_

- [x] 4. Create FeedbackModal component


  - [x] 4.1 Create modal component file at `apps/web/src/components/Feedback/FeedbackModal.jsx`

    - Implement modal dialog with backdrop overlay
    - Add state for email, message, isSubmitting, submitStatus
    - Style with dark theme (bg-[#252525], border-[#3A3A3A])
    - Add fade-in/scale animation
    - Center modal on screen with max-w-md
    - _Requirements: 1.2, 1.3, 2.3, 4.2_

  - [x] 4.2 Implement modal close functionality

    - Add close button (X icon) in top-right corner
    - Implement click-outside-to-close
    - Implement ESC key to close
    - Add smooth close animation
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 4.3 Create email input field

    - Add email input with type="email"
    - Add placeholder "your@email.com"
    - Implement HTML5 validation
    - Add custom validation for email format
    - Style with dark theme and focus ring
    - Show validation error messages
    - _Requirements: 1.3, 3.1, 3.2_

  - [x] 4.4 Create message textarea field

    - Add textarea with 6 rows
    - Add placeholder text
    - Implement min length (10 chars) and max length (1000 chars) validation
    - Add character counter
    - Style with dark theme and focus ring
    - Show validation error messages
    - _Requirements: 1.3, 3.3_

  - [x] 4.5 Create submit button

    - Add submit button with "Send Feedback" text
    - Disable when form is invalid or submitting
    - Show loading spinner and "Sending..." text during submission
    - Style with gradient matching app theme
    - _Requirements: 1.4, 3.5_

  - [x] 4.6 Implement form submission logic

    - Validate form data before submission
    - Make POST request to /api/feedback
    - Handle loading state during submission
    - Handle success response (show message, close modal after 2 seconds)
    - Handle error response (show error message, keep modal open)
    - Include pageSource in submission data
    - Add timestamp to submission data
    - _Requirements: 1.4, 1.5, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4_

  - [x] 4.7 Add accessibility features

    - Add role="dialog" and aria-modal="true"
    - Add aria-labelledby for modal title
    - Implement focus trap within modal
    - Add proper label associations for form fields
    - Announce form errors to screen readers
    - _Requirements: 1.2, 1.3, 4.2, 4.3, 4.4_

- [x] 5. Integrate FeedbackButton into landing page


  - [x] 5.1 Import FeedbackButton component in `apps/web/src/app/page.jsx`


    - Add import statement at top of file
    - Add FeedbackButton component before closing div of main container
    - Pass pageSource="landing" prop
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.2 Verify button positioning and visibility

    - Check button appears in bottom-right corner
    - Verify button doesn't overlap with other content
    - Test button on different screen sizes
    - _Requirements: 1.1, 2.1, 2.2_

- [x] 6. Integrate FeedbackButton into workspace page


  - [x] 6.1 Import FeedbackButton component in `apps/web/src/app/workspace/page.jsx`


    - Add import statement at top of file
    - Add FeedbackButton component before closing div of main container
    - Pass pageSource="workspace" prop
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 6.2 Verify button positioning and visibility

    - Check button appears in bottom-right corner
    - Verify button doesn't interfere with workspace controls
    - Test button remains visible during workspace interactions
    - Test button on different screen sizes
    - _Requirements: 2.1, 2.2_

- [x] 7. Test complete feedback flow




  - [x] 7.1 Test feedback submission from landing page

    - Open landing page and click feedback button
    - Fill out form with valid data
    - Submit and verify success message
    - Check email received at qaisfaiz80@gmail.com
    - Verify email contains correct data and formatting
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 7.2 Test feedback submission from workspace page

    - Open workspace page and click feedback button
    - Fill out form with valid data
    - Submit and verify success message
    - Check email received at qaisfaiz80@gmail.com
    - Verify email indicates workspace as source
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.4_

  - [x] 7.3 Test form validation

    - Test empty email field shows error
    - Test invalid email format shows error
    - Test empty message field shows error
    - Test message too short shows error
    - Test submit button is disabled when form is invalid
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 7.4 Test modal interactions

    - Test close button closes modal
    - Test clicking outside modal closes it
    - Test ESC key closes modal
    - Test modal closes automatically after successful submission
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 7.5 Test error handling

    - Test network error shows appropriate message
    - Test API error shows appropriate message
    - Test form data is preserved after error
    - Test user can retry after error
    - _Requirements: 3.4, 3.5_

  - [x] 7.6 Test accessibility

    - Test keyboard navigation through form
    - Test screen reader announces modal opening
    - Test screen reader announces form errors
    - Test focus trap works within modal
    - _Requirements: 1.2, 1.3, 4.2, 4.3, 4.4_

  - [x] 7.7 Test responsive design

    - Test on mobile devices (iOS and Android)
    - Test on tablets
    - Test on different desktop screen sizes
    - Verify button and modal are properly positioned on all devices
    - _Requirements: 1.1, 2.1, 2.2_
