import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: (import.meta.env.VITE_API_URL || 'https://backend.eppds.workers.dev/api') + '/auth'
});

export const { signIn, signUp, signOut, useSession } = authClient;
