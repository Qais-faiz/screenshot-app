import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import type { Adapter } from 'next-auth/adapters';
import type { NextAuthConfig } from 'next-auth';

function createAdapter(client: Pool): Adapter {
  return {
    async createVerificationToken(verificationToken) {
      const { identifier, expires, token } = verificationToken;
      const sql = `
        INSERT INTO auth_verification_token ( identifier, expires, token )
        VALUES ($1, $2, $3)
        RETURNING identifier, expires, token
        `;
      const result = await client.query(sql, [identifier, expires, token]);
      return result.rows[0];
    },
    
    async useVerificationToken({ identifier, token }) {
      const sql = `DELETE FROM auth_verification_token
      WHERE identifier = $1 AND token = $2
      RETURNING identifier, expires, token`;
      const result = await client.query(sql, [identifier, token]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },

    async createUser(user) {
      const { name, email, emailVerified, image } = user;
      const sql = `
        INSERT INTO auth_users (name, email, "emailVerified", image)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, "emailVerified", image`;
      const result = await client.query(sql, [name, email, emailVerified, image]);
      return result.rows[0];
    },
    
    async getUser(id) {
      const sql = 'SELECT * FROM auth_users WHERE id = $1';
      try {
        const result = await client.query(sql, [id]);
        return result.rowCount === 0 ? null : result.rows[0];
      } catch {
        return null;
      }
    },
    
    async getUserByEmail(email) {
      const sql = 'SELECT * FROM auth_users WHERE email = $1';
      const result = await client.query(sql, [email]);
      if (result.rowCount === 0) {
        return null;
      }
      return result.rows[0];
    },
    
    async getUserByAccount({ providerAccountId, provider }) {
      const sql = `
        SELECT u.* FROM auth_users u 
        JOIN auth_accounts a ON u.id = a."userId"
        WHERE a.provider = $1 AND a."providerAccountId" = $2`;
      const result = await client.query(sql, [provider, providerAccountId]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },
    
    async updateUser(user) {
      const fetchSql = 'SELECT * FROM auth_users WHERE id = $1';
      const query1 = await client.query(fetchSql, [user.id]);
      const oldUser = query1.rows[0];
      const newUser = { ...oldUser, ...user };
      const { id, name, email, emailVerified, image } = newUser;
      const updateSql = `
        UPDATE auth_users SET
        name = $2, email = $3, "emailVerified" = $4, image = $5
        WHERE id = $1
        RETURNING name, id, email, "emailVerified", image`;
      const query2 = await client.query(updateSql, [id, name, email, emailVerified, image]);
      return query2.rows[0];
    },
    
    async linkAccount(account) {
      const sql = `
        INSERT INTO auth_accounts
        ("userId", provider, type, "providerAccountId", access_token, expires_at, 
         refresh_token, id_token, scope, session_state, token_type, password)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`;
      const params = [
        account.userId,
        account.provider,
        account.type,
        account.providerAccountId,
        account.access_token ?? null,
        account.expires_at ?? null,
        account.refresh_token ?? null,
        account.id_token ?? null,
        account.scope ?? null,
        account.session_state ?? null,
        account.token_type ?? null,
        (account as any).extraData?.password ?? null,
      ];
      const result = await client.query(sql, params);
      return result.rows[0];
    },
    
    async createSession({ sessionToken, userId, expires }) {
      const sql = `INSERT INTO auth_sessions ("userId", expires, "sessionToken")
        VALUES ($1, $2, $3)
        RETURNING id, "sessionToken", "userId", expires`;
      const result = await client.query(sql, [userId, expires, sessionToken]);
      return result.rows[0];
    },

    async getSessionAndUser(sessionToken) {
      if (!sessionToken) return null;
      const result1 = await client.query(
        `SELECT * FROM auth_sessions WHERE "sessionToken" = $1`,
        [sessionToken]
      );
      if (result1.rowCount === 0) return null;
      const session = result1.rows[0];
      const result2 = await client.query('SELECT * FROM auth_users WHERE id = $1', [session.userId]);
      if (result2.rowCount === 0) return null;
      const user = result2.rows[0];
      return { session, user };
    },
    
    async updateSession(session) {
      const { sessionToken } = session;
      const result1 = await client.query(
        `SELECT * FROM auth_sessions WHERE "sessionToken" = $1`,
        [sessionToken]
      );
      if (result1.rowCount === 0) return null;
      const originalSession = result1.rows[0];
      const newSession = { ...originalSession, ...session };
      const sql = `UPDATE auth_sessions SET expires = $2 WHERE "sessionToken" = $1 RETURNING *`;
      const result = await client.query(sql, [newSession.sessionToken, newSession.expires]);
      return result.rows[0];
    },
    
    async deleteSession(sessionToken) {
      await client.query(`DELETE FROM auth_sessions WHERE "sessionToken" = $1`, [sessionToken]);
    },
    
    async unlinkAccount(partialAccount) {
      const { provider, providerAccountId } = partialAccount;
      await client.query(`DELETE FROM auth_accounts WHERE "providerAccountId" = $1 AND provider = $2`, 
        [providerAccountId, provider]);
    },
    
    async deleteUser(userId) {
      await client.query('DELETE FROM auth_users WHERE id = $1', [userId]);
      await client.query('DELETE FROM auth_sessions WHERE "userId" = $1', [userId]);
      await client.query('DELETE FROM auth_accounts WHERE "userId" = $1', [userId]);
    },
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = createAdapter(pool);

const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || 'fallback-secret-key-for-development-only-change-in-production',
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter,
  providers: [
    Credentials({
      id: 'credentials-signin',
      name: 'Credentials Sign in',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          console.log('[SIGNIN] Starting signin process for:', credentials?.email);
          const { email, password } = credentials as { email: string; password: string };
          
          if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            console.log('[SIGNIN] Invalid credentials format');
            throw new Error('CredentialsSignin');
          }

          console.log('[SIGNIN] Looking up user in database');
          // Get user from database
          const userResult = await pool.query(
            'SELECT * FROM auth_users WHERE email = $1',
            [email.toLowerCase().trim()]
          );
          const user = userResult.rows[0];
          
          if (!user) {
            console.log('[SIGNIN] User not found for email:', email);
            throw new Error('CredentialsSignin');
          }

          console.log('[SIGNIN] User found, checking password');
          // Get account password
          const accountsData = await pool.query(
            'SELECT * FROM auth_accounts WHERE "userId" = $1 AND provider = $2',
            [user.id, 'credentials']
          );
          
          const matchingAccount = accountsData.rows[0];
          const accountPassword = matchingAccount?.password;
          
          if (!accountPassword) {
            console.log('[SIGNIN] No password found for user');
            throw new Error('CredentialsSignin');
          }

          const isValid = await bcrypt.compare(password, accountPassword);
          
          if (!isValid) {
            console.log('[SIGNIN] Invalid password');
            throw new Error('CredentialsSignin');
          }

          console.log('[SIGNIN] Authentication successful for user:', user.id);
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            image: user.image 
          };
        } catch (error) {
          console.error('[SIGNIN] Error during signin:', error);
          
          // Re-throw known errors to preserve error type
          if (error instanceof Error && error.message === 'CredentialsSignin') {
            throw error;
          }
          
          // For database or other errors, throw a generic credentials error
          throw new Error('CredentialsSignin');
        }
      },
    }),
    Credentials({
      id: 'credentials-signup',
      name: 'Credentials Sign up',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        image: { label: 'Image', type: 'text' },
      },
      authorize: async (credentials) => {
        try {
          console.log('[SIGNUP] Starting signup process');
          const { email, password, name, image } = credentials as { 
            email: string; 
            password: string; 
            name?: string; 
            image?: string; 
          };
          
          if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            console.log('[SIGNUP] Invalid credentials format');
            throw new Error('EmailCreateAccount');
          }

          const normalizedEmail = email.toLowerCase().trim();
          console.log('[SIGNUP] Checking if user exists:', normalizedEmail);
          
          // Check if user already exists
          const existingUserResult = await pool.query(
            'SELECT * FROM auth_users WHERE email = $1',
            [normalizedEmail]
          );
          
          if (existingUserResult.rows.length > 0) {
            console.log('[SIGNUP] User already exists');
            throw new Error('EmailCreateAccount');
          }

          // Validate password strength
          if (password.length < 6) {
            console.log('[SIGNUP] Password too short');
            throw new Error('EmailCreateAccount');
          }

          // Create new user
          const userId = crypto.randomUUID();
          const userName = typeof name === 'string' && name.trim().length > 0
            ? name.trim()
            : null;
          const userImage = typeof image === 'string' && image.trim().length > 0 
            ? image.trim() 
            : null;

          console.log('[SIGNUP] Creating new user:', { userId, email: normalizedEmail, name: userName });
          const newUserResult = await pool.query(
            'INSERT INTO auth_users (id, name, email, "emailVerified", image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, userName, normalizedEmail, null, userImage]
          );
          const newUser = newUserResult.rows[0];
          console.log('[SIGNUP] User created successfully');

          // Create account with hashed password
          console.log('[SIGNUP] Hashing password');
          const hashedPassword = await bcrypt.hash(password, 12);
          
          console.log('[SIGNUP] Creating account record');
          await pool.query(
            'INSERT INTO auth_accounts ("userId", provider, type, "providerAccountId", password) VALUES ($1, $2, $3, $4, $5)',
            [userId, 'credentials', 'credentials', userId, hashedPassword]
          );
          
          console.log('[SIGNUP] Signup completed successfully for user:', userId);
          return { 
            id: newUser.id, 
            email: newUser.email, 
            name: newUser.name, 
            image: newUser.image 
          };
        } catch (error) {
          console.error('[SIGNUP] Error during signup:', error);
          
          // Re-throw known errors to preserve error type
          if (error instanceof Error && error.message === 'EmailCreateAccount') {
            throw error;
          }
          
          // Handle specific database errors
          if (error instanceof Error && error.message.includes('duplicate key')) {
            console.log('[SIGNUP] Duplicate email detected');
            throw new Error('EmailCreateAccount');
          }
          
          // For other errors, throw a generic signup error
          throw new Error('EmailCreateAccount');
        }
      },
    }),
  ],
  pages: {
    signIn: '/account/signin',
    signOut: '/account/logout',
    error: '/api/auth/error',
  },
  callbacks: {
    async signIn(params) {
      const { user, account } = params;
      console.log('[AUTH] SignIn callback:', { user: user?.email, account: account?.provider });
      
      // Always allow sign in for credential providers
      if (account?.provider === 'credentials-signin' || account?.provider === 'credentials-signup') {
        console.log('[AUTH] Credential provider sign in approved');
        return true;
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        console.log('[AUTH] JWT callback - setting user data:', { userId: user.id, email: user.email });
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        console.log('[AUTH] Session callback - setting session data:', { tokenId: token.id });
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[AUTH] Redirect callback:', { url, baseUrl });
      
      // Handle callbackUrl parameter
      if (url.includes('callbackUrl=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const callbackUrl = urlParams.get('callbackUrl');
        if (callbackUrl) {
          console.log('[AUTH] Using callbackUrl:', callbackUrl);
          // Ensure it's a relative URL or same origin
          if (callbackUrl.startsWith('/')) {
            return `${baseUrl}${callbackUrl}`;
          }
          try {
            const callbackUrlObj = new URL(callbackUrl);
            const baseUrlObj = new URL(baseUrl);
            if (callbackUrlObj.origin === baseUrlObj.origin) {
              return callbackUrl;
            }
          } catch (e) {
            console.log('[AUTH] Invalid callbackUrl, using default');
          }
        }
      }
      
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        const finalUrl = `${baseUrl}${url}`;
        console.log('[AUTH] Relative URL redirect:', finalUrl);
        return finalUrl;
      }
      
      // If it's the same origin, allow it
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('[AUTH] Same origin redirect:', url);
          return url;
        }
      } catch (e) {
        console.log('[AUTH] Invalid URL, using default workspace');
      }
      
      // Default to workspace for successful auth
      const defaultUrl = `${baseUrl}/workspace`;
      console.log('[AUTH] Default workspace redirect:', defaultUrl);
      return defaultUrl;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const nextAuth = NextAuth(authConfig);

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
