# Authentication Flow Testing Checklist

This checklist verifies that all authentication flows work correctly after the fixes have been implemented.

## ✅ Sign-In Flow Testing

### Happy Path
- [ ] **Valid Credentials**: Enter valid email and password → Should redirect to `/workspace`
- [ ] **Callback URL**: Sign in with `?callbackUrl=/dashboard` → Should redirect to `/dashboard`
- [ ] **Session Persistence**: After successful sign-in, refresh page → Should remain logged in

### Error Scenarios
- [ ] **Invalid Credentials**: Enter wrong password → Should show "Invalid email or password" error
- [ ] **Missing Email**: Leave email empty → Should show "Please fill in all fields" error
- [ ] **Missing Password**: Leave password empty → Should show "Please fill in all fields" error
- [ ] **Invalid Email Format**: Enter "notanemail" → Should show "Please enter a valid email address" error

### Form State Preservation
- [ ] **Validation Error**: Trigger validation error → Email field should retain value
- [ ] **Auth Error**: Trigger auth error → Email should be preserved, password cleared
- [ ] **Network Error**: Simulate network issue → Form fields should be preserved
- [ ] **Error Clearing**: Start typing after error → Error message should disappear

### Loading States
- [ ] **Submit Button**: Click sign in → Button should show "Signing In..." and be disabled
- [ ] **Form Fields**: During loading → All inputs should be disabled
- [ ] **Multiple Clicks**: Click submit multiple times → Should prevent multiple submissions

## ✅ Sign-Up Flow Testing

### Happy Path
- [ ] **New Account**: Create account with new email → Should redirect to `/workspace`
- [ ] **Optional Name**: Create account without name → Should work correctly
- [ ] **With Name**: Create account with name → Name should be saved

### Error Scenarios
- [ ] **Existing Email**: Use existing email → Should show "This email is already registered" error
- [ ] **Short Password**: Use password < 6 chars → Should show "Password must be at least 6 characters" error
- [ ] **Missing Email**: Leave email empty → Should show "Please fill in all required fields" error
- [ ] **Missing Password**: Leave password empty → Should show "Please fill in all required fields" error
- [ ] **Invalid Email**: Enter invalid email → Should show "Please enter a valid email address" error

### Form State Preservation
- [ ] **Validation Error**: Trigger validation error → Name and email should be preserved
- [ ] **Existing Email Error**: Use existing email → Name and email preserved, password cleared
- [ ] **Network Error**: Simulate network issue → All fields should be preserved

### Loading States
- [ ] **Submit Button**: Click create account → Button should show "Creating Account..." and be disabled
- [ ] **Form Fields**: During loading → All inputs should be disabled

## ✅ Session Management Testing

### Session Verification
- [ ] **Valid Session**: With active session → `SessionManager.verifySession()` returns `isValid: true`
- [ ] **Invalid Session**: Without session → `SessionManager.verifySession()` returns `isValid: false`
- [ ] **Session Data**: With session → Should include user id, email, name

### Session Persistence
- [ ] **Page Refresh**: After sign-in, refresh page → Should remain authenticated
- [ ] **New Tab**: After sign-in, open new tab → Should be authenticated
- [ ] **Browser Restart**: After sign-in, restart browser → Should remain authenticated (if "Remember me")

### Session Guard
- [ ] **Protected Route**: Access `/workspace` without auth → Should redirect to sign-in
- [ ] **With Session**: Access `/workspace` with auth → Should show workspace
- [ ] **Session Expiry**: With expired session → Should redirect to sign-in

## ✅ Error Handling Testing

### Network Errors
- [ ] **Offline**: Disconnect internet, try sign-in → Should show "Connection problem" error
- [ ] **Server Error**: Simulate 500 error → Should show appropriate error message
- [ ] **Timeout**: Simulate slow connection → Should handle gracefully

### Error Message Mapping
- [ ] **CredentialsSignin**: Wrong password → "Invalid email or password. Please try again."
- [ ] **EmailCreateAccount**: Existing email → "This email is already registered or invalid..."
- [ ] **Network Error**: Connection issue → "Connection problem. Please check your internet..."
- [ ] **Unknown Error**: Unexpected error → "An unexpected error occurred. Please try again."

### Error Recovery
- [ ] **Retry After Error**: After network error, fix connection and retry → Should work
- [ ] **Form Reset**: After error, clear form and re-enter → Should work normally
- [ ] **Navigation**: After error, navigate away and back → Form should be clean

## ✅ Integration Testing

### Complete Flows
- [ ] **Sign-Up → Workspace**: Create account → Should land on workspace with user data
- [ ] **Sign-In → Workspace**: Sign in → Should land on workspace with session
- [ ] **Sign-Out → Sign-In**: Sign out, then sign in again → Should work correctly
- [ ] **Multiple Sessions**: Sign in on different browsers → Should work independently

### Cross-Component Integration
- [ ] **useAuth Hook**: Components using useAuth → Should get correct auth functions
- [ ] **useUser Hook**: Components using useUser → Should get current user data
- [ ] **SessionGuard**: Protected components → Should enforce authentication
- [ ] **Workspace Integration**: Workspace page → Should verify session on mount

## ✅ Performance Testing

### Response Times
- [ ] **Sign-In Speed**: Measure sign-in time → Should complete within 2-3 seconds
- [ ] **Sign-Up Speed**: Measure sign-up time → Should complete within 2-3 seconds
- [ ] **Session Check**: Measure session verification → Should complete within 1 second

### Resource Usage
- [ ] **Memory Leaks**: Multiple sign-ins/outs → Should not increase memory usage
- [ ] **Network Requests**: Authentication flow → Should minimize unnecessary requests
- [ ] **Caching**: Session data → Should cache appropriately

## 🔧 Manual Testing Instructions

### Setup
1. Start the development server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open browser dev tools for network/console monitoring

### Test Data
- **Valid User**: Use existing test account or create one
- **Invalid Email**: `nonexistent@example.com`
- **Invalid Password**: `wrongpassword`
- **Existing Email**: Use email from existing account

### Testing Environment
- [ ] **Chrome**: Test in Chrome browser
- [ ] **Firefox**: Test in Firefox browser
- [ ] **Safari**: Test in Safari browser (if available)
- [ ] **Mobile**: Test on mobile device/emulator
- [ ] **Slow Network**: Test with throttled connection

## 📊 Test Results

### Summary
- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Skipped**: ___

### Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Overall Status
- [ ] ✅ All critical flows working
- [ ] ⚠️ Minor issues found (list above)
- [ ] ❌ Major issues found (requires fixes)

### Sign-Off
- **Tester**: ________________
- **Date**: ________________
- **Status**: ________________