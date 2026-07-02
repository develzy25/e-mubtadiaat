import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { bearer } from 'better-auth/plugins';

// This function returns the betterAuth instance configured with the D1 database binding
export const getAuth = (
  env: { DB: D1Database; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string },
  requestUrl?: string
) => {
  const db = drizzle(env.DB, { schema });

  // Dynamically set baseURL if requestUrl is provided to support localhost and deployed dev url simultaneously
  let finalBaseURL = env.BETTER_AUTH_URL;
  if (requestUrl) {
    const urlObj = new URL(requestUrl);
    // baseURL must point to the base auth endpoint (e.g. https://domain.com/api/auth)
    finalBaseURL = `${urlObj.origin}/api/auth`;
  }
  
  const origins = [
    'http://localhost:5173',
    'https://mubtadiaat.pages.dev'
  ];

  if (requestUrl) {
    try {
      const urlObj = new URL(requestUrl);
      const origin = urlObj.origin;
      if (origin.endsWith('.pages.dev') && !origins.includes(origin)) {
        origins.push(origin);
      }
    } catch (_) {}
  }

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite', // using d1 sqlite
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true, // We enable standard email/password login
    },
    plugins: [
      bearer(),
    ],
    trustedOrigins: origins,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: finalBaseURL,
  });
};
