import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    jwtClient(), // Enable JWT token generation for backend API calls
  ],
});

// Export commonly used hooks for convenience
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;

/**
 * Get JWT token for backend API authentication.
 *
 * Session tokens (stored in cookies) are used for frontend authentication.
 * JWT tokens (generated on-demand) are used for backend API calls.
 *
 * @returns JWT token in format: eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0...
 *
 * @example
 * const jwtToken = await getJWTToken();
 * const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/me`, {
 *   headers: { 'Authorization': `Bearer ${jwtToken}` }
 * });
 */
export async function getJWTToken(): Promise<string | null> {
  try {
    const { data, error } = await authClient.token();

    if (error) {
      console.error('Failed to get JWT token:', error);
      return null;
    }else{
      console.log('JWT token:', data?.token);
    }

    return data?.token || null;
  } catch (error) {
    console.error('Error getting JWT token:', error);
    return null;
  }
}

