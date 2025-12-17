/**
 * Comprehensive Authentication Flow Testing Script
 * 
 * This script tests the complete authentication flows including:
 * - Sign-up flow from registration to workspace access
 * - Sign-in flow from form submission to workspace redirect
 * - Session persistence across page refreshes
 * - Error handling for various scenarios
 */

import { chromium } from 'playwright';
import { expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpassword123';
const TEST_NAME = 'Test User';

async function runAuthFlowTests() {
  console.log('🚀 Starting Authentication Flow Tests...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Sign-up Flow
    console.log('📝 Test 1: Sign-up Flow');
    await testSignUpFlow(page);
    
    // Test 2: Sign-out and Sign-in Flow
    console.log('\n🔐 Test 2: Sign-in Flow');
    await testSignInFlow(page);
    
    // Test 3: Session Persistence
    console.log('\n🔄 Test 3: Session Persistence');
    await testSessionPersistence(page);
    
    // Test 4: Error Handling
    console.log('\n❌ Test 4: Error Handling');
    await testErrorHandling(page);
    
    console.log('\n✅ All authentication flow tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

async function testSignUpFlow(page) {
  console.log('  → Navigating to sign-up page...');
  await page.goto(`${BASE_URL}/account/signup`);
  
  console.log('  → Filling sign-up form...');
  await page.fill('input[name="name"]', TEST_NAME);
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  
  console.log('  → Submitting sign-up form...');
  await page.click('button[type="submit"]');
  
  console.log('  → Waiting for redirect to workspace...');
  await page.waitForURL(`${BASE_URL}/workspace`, { timeout: 10000 });
  
  console.log('  → Verifying workspace page loaded...');
  await expect(page.locator('text=Loading workspace')).not.toBeVisible({ timeout: 5000 });
  
  // Verify user is authenticated by checking for workspace elements
  await expect(page.locator('[data-testid="workspace-canvas"], canvas, .workspace')).toBeVisible({ timeout: 5000 });
  
  console.log('  ✅ Sign-up flow completed successfully');
}

async function testSignInFlow(page) {
  console.log('  → Signing out first...');
  // Look for sign out button or user menu
  try {
    await page.click('button:has-text("Sign Out"), [data-testid="user-menu"]', { timeout: 3000 });
  } catch {
    // If no sign out button, navigate directly to sign in
    console.log('  → No sign out button found, navigating to sign in...');
  }
  
  console.log('  → Navigating to sign-in page...');
  await page.goto(`${BASE_URL}/account/signin`);
  
  console.log('  → Filling sign-in form...');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  
  console.log('  → Submitting sign-in form...');
  await page.click('button[type="submit"]');
  
  console.log('  → Waiting for redirect to workspace...');
  await page.waitForURL(`${BASE_URL}/workspace`, { timeout: 10000 });
  
  console.log('  → Verifying workspace page loaded...');
  await expect(page.locator('text=Loading workspace')).not.toBeVisible({ timeout: 5000 });
  
  console.log('  ✅ Sign-in flow completed successfully');
}

async function testSessionPersistence(page) {
  console.log('  → Refreshing page to test session persistence...');
  await page.reload();
  
  console.log('  → Verifying user remains authenticated...');
  await expect(page.locator('text=Loading workspace')).not.toBeVisible({ timeout: 5000 });
  
  // Should still be on workspace page, not redirected to sign-in
  expect(page.url()).toContain('/workspace');
  
  console.log('  → Opening new tab to test session across tabs...');
  const newPage = await page.context().newPage();
  await newPage.goto(`${BASE_URL}/workspace`);
  
  console.log('  → Verifying session works in new tab...');
  await expect(newPage.locator('text=Loading workspace')).not.toBeVisible({ timeout: 5000 });
  expect(newPage.url()).toContain('/workspace');
  
  await newPage.close();
  console.log('  ✅ Session persistence verified');
}

async function testErrorHandling(page) {
  console.log('  → Testing invalid credentials...');
  await page.goto(`${BASE_URL}/account/signin`);
  
  await page.fill('input[name="email"]', 'invalid@example.com');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  
  console.log('  → Verifying error message appears...');
  await expect(page.locator('text=Invalid email or password, text=Incorrect email or password')).toBeVisible({ timeout: 5000 });
  
  console.log('  → Verifying form fields are preserved...');
  const emailValue = await page.inputValue('input[name="email"]');
  expect(emailValue).toBe('invalid@example.com');
  
  console.log('  → Testing existing email sign-up...');
  await page.goto(`${BASE_URL}/account/signup`);
  
  await page.fill('input[name="name"]', 'Another User');
  await page.fill('input[name="email"]', TEST_EMAIL); // Use existing email
  await page.fill('input[name="password"]', 'newpassword123');
  await page.click('button[type="submit"]');
  
  console.log('  → Verifying existing email error...');
  await expect(page.locator('text=already registered, text=already exists')).toBeVisible({ timeout: 5000 });
  
  console.log('  ✅ Error handling verified');
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthFlowTests().catch(console.error);
}

export { runAuthFlowTests };