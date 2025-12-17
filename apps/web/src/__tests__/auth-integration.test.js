import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SignInClient from '../app/account/signin/signin-client';
import SignUpClient from '../app/account/signup/signup-client';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }) => children,
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
    toString: vi.fn(() => ''),
  })),
}));

// Mock useAuth hook
vi.mock('../src/utils/useAuth', () => ({
  default: () => ({
    signInWithCredentials: vi.fn(),
    signUpWithCredentials: vi.fn(),
  }),
}));

describe('Authentication Integration Tests', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Sign In Flow', () => {
    it('should preserve form state during validation errors', async () => {
      render(
        <SessionProvider session={null}>
          <SignInClient />
        </SessionProvider>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in email but leave password empty
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      });

      // Email should still be preserved
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('');
    });

    it('should preserve form state during authentication errors', async () => {
      const mockSignIn = vi.fn().mockRejectedValue({
        message: 'Invalid email or password. Please try again.',
        type: 'CredentialsSignin'
      });

      // Mock the useAuth hook for this test
      vi.doMock('../src/utils/useAuth', () => ({
        default: () => ({
          signInWithCredentials: mockSignIn,
          signUpWithCredentials: vi.fn(),
        }),
      }));

      render(
        <SessionProvider session={null}>
          <SignInClient />
        </SessionProvider>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      // Should show authentication error
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
      });

      // Email should be preserved, password should be cleared for security
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('');
    });

    it('should show loading state during authentication', async () => {
      const mockSignIn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      vi.doMock('../src/utils/useAuth', () => ({
        default: () => ({
          signInWithCredentials: mockSignIn,
          signUpWithCredentials: vi.fn(),
        }),
      }));

      render(
        <SessionProvider session={null}>
          <SignInClient />
        </SessionProvider>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Sign Up Flow', () => {
    it('should preserve form state during validation errors', async () => {
      render(
        <SessionProvider session={null}>
          <SignUpClient />
        </SessionProvider>
      );

      const nameInput = screen.getByPlaceholderText('Enter your name');
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText(/Create a password/);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Fill in name and email but leave password empty
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });

      // Name and email should be preserved
      expect(nameInput.value).toBe('Test User');
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('');
    });

    it('should validate password length', async () => {
      render(
        <SessionProvider session={null}>
          <SignUpClient />
        </SessionProvider>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText(/Create a password/);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Fill in form with short password
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      // Should show password length error
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
      });

      // Form state should be preserved
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('123');
    });

    it('should handle existing email errors', async () => {
      const mockSignUp = vi.fn().mockRejectedValue({
        message: 'This email is already registered or invalid. Please try a different email or sign in instead.',
        type: 'EmailCreateAccount'
      });

      vi.doMock('../src/utils/useAuth', () => ({
        default: () => ({
          signInWithCredentials: vi.fn(),
          signUpWithCredentials: mockSignUp,
        }),
      }));

      render(
        <SessionProvider session={null}>
          <SignUpClient />
        </SessionProvider>
      );

      const nameInput = screen.getByPlaceholderText('Enter your name');
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText(/Create a password/);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Fill in form
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Should show existing email error
      await waitFor(() => {
        expect(screen.getByText(/This email is already registered/)).toBeInTheDocument();
      });

      // Name and email should be preserved, password cleared for security
      expect(nameInput.value).toBe('Test User');
      expect(emailInput.value).toBe('existing@example.com');
      expect(passwordInput.value).toBe('');
    });
  });

  describe('Form Interaction', () => {
    it('should clear errors when user starts typing', async () => {
      render(
        <SessionProvider session={null}>
          <SignInClient />
        </SessionProvider>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Trigger validation error
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      });

      // Start typing in email field
      fireEvent.change(emailInput, { target: { value: 't' } });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Please fill in all fields')).not.toBeInTheDocument();
      });
    });

    it('should disable submit button during loading', async () => {
      const mockSignIn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      vi.doMock('../src/utils/useAuth', () => ({
        default: () => ({
          signInWithCredentials: mockSignIn,
          signUpWithCredentials: vi.fn(),
        }),
      }));

      render(
        <SessionProvider session={null}>
          <SignInClient />
        </SessionProvider>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();
      
      // Input fields should also be disabled
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });
});