import { createRemoteJWKSet, jwtVerify } from 'jose';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

if (!SUPABASE_URL) {
  console.error('[AUTH] Missing SUPABASE_URL. Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '));
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL must be defined');
}

console.log('[AUTH] Initialized with SUPABASE_URL:', SUPABASE_URL);

// Create a remote JWKS (JSON Web Key Set) for verifying Supabase JWTs
// This automatically caches the keys and refreshes them as needed
let JWKS: any;
try {
  JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
  console.log('[AUTH] JWKS initialized successfully');
} catch (error) {
  console.error('[AUTH] Failed to initialize JWKS:', error);
  throw error;
}

export interface VerifiedToken {
  token: string;
  userId: string;
  payload: any;
}

/**
 * Verify a Supabase JWT token from the Authorization header
 * 
 * @param authHeader - The Authorization header value (should be "Bearer <token>")
 * @returns An object containing the verified token, userId, and full payload
 * @throws Error if the token is missing, invalid, or expired
 */
export async function verifySupabaseJWT(authHeader?: string): Promise<VerifiedToken> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    throw new Error('Missing token in Authorization header');
  }

  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not configured');
  }

  try {
    // Validate signature and standard claims
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`, // Supabase issues tokens with this issuer
      // Optionally add audience check if you set one
      // audience: 'authenticated',
    });

    // payload.sub is the user id (UUID in auth.users)
    if (!payload.sub) {
      throw new Error('Token missing subject (user ID)');
    }

    return {
      token,
      userId: payload.sub as string,
      payload,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Log more details for debugging
      console.error('[JWT Verification] Error type:', error.name);
      console.error('[JWT Verification] Message:', error.message);
      console.error('[JWT Verification] Stack:', error.stack?.substring(0, 200));
      throw new Error(`JWT verification failed: ${error.message}`);
    }
    throw new Error('JWT verification failed');
  }
}
