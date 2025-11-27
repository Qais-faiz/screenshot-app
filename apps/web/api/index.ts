// Vercel Serverless Entry Point for React Router v7 + Hono
import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Pool } from 'pg';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { requestId } from 'hono/request-id';
import { handle } from 'hono/vercel';
import { serializeError } from 'serialize-error';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import type { StaticHandlerContext } from 'react-router';
import NeonAdapter from './__create/adapter';
import { getHTMLForErrorPage } from './__create/get-html-for-error-page';
import { API_BASENAME, api } from './__create/route-builder';

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

// Lazy initialize pool to avoid connection issues during build
let pool: Pool | null = null;
let adapter: ReturnType<typeof NeonAdapter> | null = null;

function getAdapter() {
  if (!adapter) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    adapter = NeonAdapter(pool);
  }
  return adapter;
}

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  const origins = process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
  app.use(
    '/*',
    cors({
      origin: origins,
    })
  );
}

if (process.env.AUTH_SECRET) {
  app.use(
    '*',
    initAuthConfig(() => ({
      secret: process.env.AUTH_SECRET!,
      adapter: getAdapter(),
      pages: {
        signIn: '/account/signin',
        signOut: '/account/logout',
      },
      skipCSRFCheck,
      session: {
        strategy: 'jwt',
      },
      trustHost: true,
      callbacks: {
        session({ session, token}) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
      cookies: {
        csrfToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        sessionToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        callbackUrl: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
      },
      providers: [
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            const user = await getAdapter().getUserByEmail(email);
            if (!user) {
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === 'credentials'
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              return null;
            }

            const isValid = await verify(accountPassword, password);
            if (!isValid) {
              return null;
            }

            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            try {
              const { email, password } = credentials;
              if (!email || !password) {
                console.error('[SIGNUP] Missing email or password');
                return null;
              }
              if (typeof email !== 'string' || typeof password !== 'string') {
                console.error('[SIGNUP] Invalid email or password type');
                return null;
              }

              console.log('[SIGNUP] Checking if user exists:', email);
              const user = await getAdapter().getUserByEmail(email);
              if (!user) {
                console.log('[SIGNUP] Creating new user');
                const newUser = await getAdapter().createUser({
                  id: crypto.randomUUID(),
                  emailVerified: null,
                  email,
                });
                console.log('[SIGNUP] User created:', newUser.id);
                
                await getAdapter().linkAccount({
                  extraData: {
                    password: await hash(password),
                  },
                  type: 'credentials',
                  userId: newUser.id,
                  providerAccountId: newUser.id,
                  provider: 'credentials',
                });
                console.log('[SIGNUP] Account linked successfully');
                return newUser;
              }
              console.log('[SIGNUP] User already exists');
              return null;
            } catch (error) {
              console.error('[SIGNUP] Error during signup:', error);
              throw error;
            }
          },
        }),
      ],
    }))
  );
}

app.all('/integrations/:path{.+}', async (c) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-ignore
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

app.use('/api/auth/*', authHandler());
app.route(API_BASENAME, api);

// React Router SSR Handler
let reactRouterHandler: any = null;

async function getReactRouterHandler() {
  if (!reactRouterHandler) {
    try {
      // @ts-ignore - This file is generated during build
      const serverBuild = await import('../build/server/index.js');
      reactRouterHandler = serverBuild;
    } catch (error) {
      console.error('Failed to load React Router server build:', error);
      throw error;
    }
  }
  return reactRouterHandler;
}

// Catch-all route for React Router SSR
app.get('*', async (c) => {
  try {
    const build = await getReactRouterHandler();
    const { queryRoute } = createStaticHandler(build.routes);
    const request = c.req.raw;
    const context = await queryRoute(request);
    
    if (context instanceof Response) {
      return context;
    }
    
    const router = createStaticRouter(build.routes, context);
    const html = renderToString(
      StaticRouterProvider({ 
        router, 
        context,
        hydrate: false 
      })
    );
    
    return c.html(`<!DOCTYPE html>${html}`);
  } catch (error) {
    console.error('SSR Error:', error);
    return c.html(getHTMLForErrorPage(error as Error), 500);
  }
});

// Export Vercel serverless handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export default handle(app);
