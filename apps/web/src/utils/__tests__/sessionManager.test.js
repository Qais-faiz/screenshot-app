import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSession } from 'next-auth/react';
import { SessionManager } from '../sessionManager';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifySession', () => {
    it('should return valid session when session exists with user data', async () => {
      const mockSession = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User'
        }
      };
      getSession.mockResolvedValueOnce(mockSession);

      const result = await SessionManager.verifySession();

      expect(result).toEqual({
        isValid: true,
        session: mockSession,
        error: null
      });
      expect(getSession).toHaveBeenCalledTimes(1);
    });

    it('should return invalid when no session exists', async () => {
      getSession.mockResolvedValueOnce(null);

      const result = await SessionManager.verifySession();

      expect(result).toEqual({
        isValid: false,
        session: null,
        error: 'No session'
      });
    });

    it('should return invalid when session exists but no user data', async () => {
      const mockSession = { user: null };
      getSession.mockResolvedValueOnce(mockSession);

      const result = await SessionManager.verifySession();

      expect(result).toEqual({
        isValid: false,
        session: null,
        error: 'No user data'
      });
    });

    it('should handle getSession errors', async () => {
      const error = new Error('Network error');
      getSession.mockRejectedValueOnce(error);

      const result = await SessionManager.verifySession();

      expect(result).toEqual({
        isValid: false,
        session: null,
        error: 'Network error'
      });
    });
  });

  describe('checkSessionPersistence', () => {
    it('should return persistent when session data is complete', async () => {
      const mockSession = {
        user: {
          id: '123',
          email: 'test@example.com'
        }
      };
      getSession.mockResolvedValueOnce(mockSession);

      const result = await SessionManager.checkSessionPersistence();

      expect(result).toEqual({
        isPersistent: true,
        session: mockSession,
        error: null
      });
    });

    it('should return not persistent when session is missing', async () => {
      getSession.mockResolvedValueOnce(null);

      const result = await SessionManager.checkSessionPersistence();

      expect(result).toEqual({
        isPersistent: false,
        error: 'Session not found after refresh'
      });
    });

    it('should return not persistent when session data is incomplete', async () => {
      const mockSession = {
        user: {
          id: '123'
          // missing email
        }
      };
      getSession.mockResolvedValueOnce(mockSession);

      const result = await SessionManager.checkSessionPersistence();

      expect(result).toEqual({
        isPersistent: false,
        error: 'Incomplete session data'
      });
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh existing session', async () => {
      const mockSession = {
        user: {
          id: '123',
          email: 'test@example.com'
        }
      };
      getSession.mockResolvedValueOnce(mockSession);

      const result = await SessionManager.refreshSession();

      expect(result).toEqual({
        success: true,
        session: mockSession,
        error: null
      });
    });

    it('should fail when no session to refresh', async () => {
      getSession.mockResolvedValueOnce(null);

      const result = await SessionManager.refreshSession();

      expect(result).toEqual({
        success: false,
        error: 'No session to refresh'
      });
    });
  });

  describe('session status management', () => {
    it('should store session status in localStorage', () => {
      const status = {
        isVerified: true,
        error: null,
        lastVerified: Date.now()
      };

      SessionManager.setSessionStatus(status);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'session-status',
        expect.stringContaining('"isVerified":true')
      );
    });

    it('should retrieve session status from localStorage', () => {
      const status = {
        isVerified: true,
        error: null,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(status));

      const result = SessionManager.getSessionStatus();

      expect(result).toEqual(status);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('session-status');
    });

    it('should return null when no session status exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = SessionManager.getSessionStatus();

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');

      const result = SessionManager.getSessionStatus();

      expect(result).toBeNull();
    });

    it('should clear session status', () => {
      SessionManager.clearSessionStatus();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('session-status');
    });
  });
});