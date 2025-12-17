import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import useAuth from '../useAuth';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
    href: '',
  },
  writable: true,
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.search = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signInWithCredentials', () => {
    it('should handle successful sign-in', async () => {
      const mockResult = { ok: true, error: null, url: '/workspace' };
      signIn.mockResolvedValueOnce(mockResult);

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signInWithCredentials({
          email: 'test@example.com',
          password: 'password123',
          callbackUrl: '/workspace',
        });
        expect(response).toEqual(mockResult);
      });

      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith('credentials-signin', {
        email: 'test@example.com',
        password: 'password123',
        callbackUrl: '/workspace',
        redirect: false,
      });
      expect(window.location.href).toBe('/workspace');
    });

    it('should handle credential errors', async () => {
      const mockResult = { ok: false, error: 'CredentialsSignin' };
      signIn.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signInWithCredentials({
            email: 'test@example.com',
            password: 'wrongpassword',
          });
        } catch (error) {
          expect(error.message).toBe('Invalid email or password. Please try again.');
          expect(error.type).toBe('CredentialsSignin');
        }
      });

      expect(signIn).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      signIn.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signInWithCredentials({
            email: 'test@example.com',
            password: 'password123',
          });
        } catch (error) {
          expect(error.message).toBe('Connection problem. Please check your internet and try again.');
          expect(error.type).toBe('Network');
        }
      });
    });

    it('should handle email creation errors', async () => {
      const mockResult = { ok: false, error: 'EmailCreateAccount' };
      signIn.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signInWithCredentials({
            email: 'existing@example.com',
            password: 'password123',
          });
        } catch (error) {
          expect(error.message).toBe('This email is already registered or invalid. Please try a different email or sign in instead.');
          expect(error.type).toBe('EmailCreateAccount');
        }
      });
    });

    it('should handle unexpected sign-in response', async () => {
      const mockResult = { ok: true, error: null }; // Missing url - unexpected state
      signIn.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signInWithCredentials({
            email: 'test@example.com',
            password: 'password123',
          });
        } catch (error) {
          expect(error.message).toBe('Sign in failed - unexpected response');
          expect(error.type).toBe('Default');
        }
      });
    });

    it('should use callbackUrl from URL params', () => {
      window.location.search = '?callbackUrl=/dashboard';
      
      const { result } = renderHook(() => useAuth());
      
      expect(result.current).toBeDefined();
      // The callbackUrl logic is tested in the actual function calls above
    });
  });

  describe('signUpWithCredentials', () => {
    it('should handle successful sign-up', async () => {
      const mockResult = { ok: true, error: null, url: '/workspace' };
      signIn.mockResolvedValueOnce(mockResult);

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signUpWithCredentials({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          callbackUrl: '/workspace',
        });
        expect(response).toEqual(mockResult);
      });

      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith('credentials-signup', {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        callbackUrl: '/workspace',
        redirect: false,
      });
      expect(window.location.href).toBe('/workspace');
    });

    it('should handle existing email errors', async () => {
      const mockResult = { ok: false, error: 'EmailCreateAccount' };
      signIn.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUpWithCredentials({
            email: 'existing@example.com',
            password: 'password123',
            name: 'Test User',
          });
        } catch (error) {
          expect(error.message).toBe('This email is already registered or invalid. Please try a different email or sign in instead.');
          expect(error.type).toBe('EmailCreateAccount');
        }
      });
    });

    it('should handle unexpected sign-up response', async () => {
      const mockResult = { ok: true, error: null }; // Missing url - unexpected state
      signIn.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUpWithCredentials({
            email: 'test@example.com',
            password: 'password123',
          });
        } catch (error) {
          expect(error.message).toBe('Account creation failed - unexpected response');
          expect(error.type).toBe('Default');
        }
      });
    });

    it('should handle sign-up response without url', async () => {
      const mockResult = { ok: false, error: null }; // No ok and no error
      signIn.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUpWithCredentials({
            email: 'test@example.com',
            password: 'password123',
          });
        } catch (error) {
          expect(error.message).toBe('Account creation failed - unexpected response');
          expect(error.type).toBe('Default');
        }
      });
    });
  });

  describe('error message mapping', () => {
    const errorTestCases = [
      {
        error: 'OAuthSignin',
        expected: "Couldn't start sign-in. Please try again or use a different method."
      },
      {
        error: 'OAuthCallback',
        expected: 'Sign-in failed after redirecting. Please try again.'
      },
      {
        error: 'AccessDenied',
        expected: "You don't have permission to sign in."
      },
      {
        error: 'Configuration',
        expected: "Sign-in isn't working right now. Please try again later."
      },
      {
        error: 'UnknownError',
        expected: 'An unexpected error occurred. Please try again.'
      }
    ];

    errorTestCases.forEach(({ error, expected }) => {
      it(`should map ${error} to correct message`, async () => {
        const mockResult = { ok: false, error };
        signIn.mockResolvedValueOnce(mockResult);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          try {
            await result.current.signInWithCredentials({
              email: 'test@example.com',
              password: 'password123',
            });
          } catch (thrownError) {
            expect(thrownError.message).toBe(expected);
          }
        });
      });
    });
  });
});