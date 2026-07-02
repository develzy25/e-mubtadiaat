import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: import.meta.env.DEV 
      ? 'http://localhost:8787/api/auth' 
      : 'https://backend.eppds.workers.dev/api/auth',
    fetchOptions: {
        onRequest: (context) => {
            const token = localStorage.getItem("better-auth.session_token");
            if (token) {
                const headers = context.headers || {};
                if (headers instanceof Headers) {
                    headers.set("Authorization", `Bearer ${token}`);
                } else {
                    (headers as any)["Authorization"] = `Bearer ${token}`;
                }
                context.headers = headers;
            }
            return context;
        },
        onResponse: async (context) => {
            try {
                const url = context.response.url;
                if (url.includes('/sign-in/email') || url.includes('/sign-up/email')) {
                    const clonedResponse = context.response.clone();
                    const body = await clonedResponse.json();
                    if (body && body.token) {
                        localStorage.setItem("better-auth.session_token", body.token);
                    }
                } else if (url.includes('/sign-out')) {
                    localStorage.removeItem("better-auth.session_token");
                    localStorage.removeItem("FORCE_PASSWORD_CHANGE");
                }
            } catch (e) {
                console.error("Error parsing auth token response:", e);
            }
            return context;
        }
    }
});

export const { signIn, signUp, signOut, useSession } = authClient;
