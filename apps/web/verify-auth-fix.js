#!/usr/bin/env node

/**
 * Authentication Fix Verification Script
 * 
 * This script performs basic verification that the authentication fixes are working.
 * It checks the code structure and configuration to ensure all fixes are in place.
 */

import fs from 'fs';
import path from 'path';

const CHECKS = {
  'NextAuth Configuration': {
    file: 'lib/auth.ts',
    checks: [
      { pattern: /redirect.*callback/, description: 'Redirect callback implemented' },
      { pattern: /CredentialsSignin.*throw/, description: 'Proper error throwing in signin' },
      { pattern: /EmailCreateAccount.*throw/, description: 'Proper error throwing in signup' },
      { pattern: /session.*callbacks/, description: 'Session callbacks configured' }
    ]
  },
  'useAuth Hook': {
    file: 'src/utils/useAuth.js',
    checks: [
      { pattern: /redirect:\s*false/, description: 'Initial redirect: false for error handling' },
      { pattern: /redirect:\s*true/, description: 'Final redirect: true for success' },
      { pattern: /getErrorMessage/, description: 'Error message mapping function' },
      { pattern: /error\.type/, description: 'Error type handling' }
    ]
  },
  'Sign-in Component': {
    file: 'app/account/signin/signin-client.tsx',
    checks: [
      { pattern: /setError\(null\)/, description: 'Error clearing on new attempts' },
      { pattern: /disabled.*loading/, description: 'Form disabled during loading' },
      { pattern: /onChange.*setError/, description: 'Error clearing on input change' },
      { pattern: /loading.*spinner/, description: 'Loading spinner implementation' }
    ]
  },
  'Sign-up Component': {
    file: 'app/account/signup/signup-client.tsx',
    checks: [
      { pattern: /setError\(null\)/, description: 'Error clearing on new attempts' },
      { pattern: /disabled.*loading/, description: 'Form disabled during loading' },
      { pattern: /password.*length.*6/, description: 'Password validation' },
      { pattern: /email.*includes.*@/, description: 'Email validation' }
    ]
  },
  'Session Management': {
    file: 'src/utils/sessionManager.js',
    checks: [
      { pattern: /verifySession/, description: 'Session verification function' },
      { pattern: /checkSessionPersistence/, description: 'Session persistence checking' },
      { pattern: /localStorage/, description: 'Session status storage' }
    ]
  },
  'Enhanced useUser Hook': {
    file: 'src/utils/useUser.js',
    checks: [
      { pattern: /SessionManager/, description: 'SessionManager integration' },
      { pattern: /sessionVerified/, description: 'Session verification state' },
      { pattern: /verifyAndSetSession/, description: 'Session verification function' }
    ]
  }
};

function checkFile(filePath, checks) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  let allPassed = true;
  
  console.log(`\n📁 Checking ${filePath}:`);
  
  for (const check of checks) {
    const passed = check.pattern.test(content);
    console.log(`  ${passed ? '✅' : '❌'} ${check.description}`);
    if (!passed) allPassed = false;
  }
  
  return allPassed;
}

function runVerification() {
  console.log('🔍 Authentication Fix Verification\n');
  console.log('This script verifies that all authentication fixes are properly implemented.\n');
  
  let overallSuccess = true;
  
  for (const [category, config] of Object.entries(CHECKS)) {
    console.log(`\n🔧 ${category}`);
    console.log('='.repeat(category.length + 4));
    
    const success = checkFile(config.file, config.checks);
    if (!success) overallSuccess = false;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (overallSuccess) {
    console.log('✅ All authentication fixes are properly implemented!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Follow the manual verification checklist in AUTHENTICATION_VERIFICATION.md');
    console.log('3. Test sign-up and sign-in flows');
    console.log('4. Verify session persistence');
  } else {
    console.log('❌ Some authentication fixes are missing or incomplete.');
    console.log('\n🔧 Please review the failed checks above and ensure all fixes are implemented.');
  }
  
  return overallSuccess;
}

// Additional checks for common issues
function checkCommonIssues() {
  console.log('\n🔍 Checking for common issues...\n');
  
  const issues = [];
  
  // Check for manual window.location.href redirects
  const useAuthPath = path.join(process.cwd(), 'src/utils/useAuth.js');
  if (fs.existsSync(useAuthPath)) {
    const content = fs.readFileSync(useAuthPath, 'utf8');
    if (content.includes('window.location.href') && !content.includes('// Legacy fallback')) {
      issues.push('❌ Manual window.location.href redirects found in useAuth.js');
    } else {
      console.log('✅ No manual redirects found in useAuth.js');
    }
  }
  
  // Check for proper error handling
  const authConfigPath = path.join(process.cwd(), 'lib/auth.ts');
  if (fs.existsSync(authConfigPath)) {
    const content = fs.readFileSync(authConfigPath, 'utf8');
    if (content.includes('return null') && !content.includes('throw new Error')) {
      issues.push('❌ Auth providers still returning null instead of throwing errors');
    } else {
      console.log('✅ Auth providers properly throw errors');
    }
  }
  
  // Check for form state preservation
  const signinPath = path.join(process.cwd(), 'app/account/signin/signin-client.tsx');
  if (fs.existsSync(signinPath)) {
    const content = fs.readFileSync(signinPath, 'utf8');
    if (!content.includes('setError(null)') || !content.includes('onChange')) {
      issues.push('❌ Sign-in form may not preserve state properly');
    } else {
      console.log('✅ Sign-in form state management looks good');
    }
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
    return false;
  } else {
    console.log('\n✅ No common issues detected');
    return true;
  }
}

// Run the verification
const mainSuccess = runVerification();
const issuesSuccess = checkCommonIssues();

if (mainSuccess && issuesSuccess) {
  console.log('\n🎉 Authentication fix verification completed successfully!');
  process.exit(0);
} else {
  console.log('\n❌ Verification failed. Please review and fix the issues above.');
  process.exit(1);
}