import { jwtVerify, importSPKI, importJWK } from 'jose';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_URL) {
  console.error('[AUTH] Missing SUPABASE_URL. Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '));
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL must be defined');
}

console.log('[AUTH] Initialized with SUPABASE_URL:', SUPABASE_URL);
console.log('[AUTH] JWT Secret available:', !!SUPABASE_JWT_SECRET);

// Cache for JWKS keys
let jwksCache: any = null;
let jkwsCacheTime = 0;
const JWKS_CACHE_TTL = 60000; // 1 minute

async function getJWKS() {
  const now = Date.now();
  if (jwksCache && (now - jkwsCacheTime) < JWKS_CACHE_TTL) {
    return jwksCache;
  }
  
  try {
    const jwksUrl = `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
    console.log('[AUTH] Fetching JWKS from:', jwksUrl);
    const response = await fetch(jwksUrl);
    console.log('[AUTH] JWKS response status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('[AUTH] JWKS response error:', text.substring(0, 200));
      throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log('[AUTH] JWKS response body:', text.substring(0, 500));
    
    jwksCache = JSON.parse(text);
    jkwsCacheTime = now;
    console.log('[AUTH] JWKS fetched successfully, keys count:', jwksCache.keys?.length || 0);
    if (jwksCache.keys && jwksCache.keys.length > 0) {
      console.log('[AUTH] First key alg:', jwksCache.keys[0].alg);
    }
    return jwksCache;
  } catch (error) {
    console.error('[AUTH] Failed to fetch JWKS:', error);
    throw error;
  }
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
export async function verifySupabaseJWT(authHeader: string | undefined) {
  try {
    if (!authHeader) {
      console.log('[AUTH] Missing authorization header');
      return null;
    }

    if (!SUPABASE_JWT_SECRET) {
      console.error('[AUTH] SUPABASE_JWT_SECRET is not configured');
      return null;
    }

    // Handle both "Bearer <token>" and raw token formats
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('[AUTH] Stripped Bearer prefix from authorization header');
    } else {
      console.log('[AUTH] Token received without Bearer prefix, using as-is');
    }
    
    console.log('[AUTH] Token received, starting verification with JWT secret');
    
    // Decode token to inspect it
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[AUTH] Invalid token format, expected 3 parts but got:', parts.length);
      return null;
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'));
    console.log('[AUTH] Token header:', header);
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    console.log('[AUTH] Token payload:', JSON.stringify(payload).substring(0, 200));

    // Import the JWT secret as the key
    console.log('[AUTH] Importing JWT secret as key...');
    const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET);
    
    // Verify the token using the JWT secret
    console.log('[AUTH] Verifying token with JWT secret...');
    const verified = await jwtVerify(token, secret);
    console.log('[AUTH] Token verified successfully');
    console.log('[AUTH] Verified user ID:', verified.payload.sub);
    
    return {
      token: token,
      userId: verified.payload.sub as string,
      payload: verified.payload
    };
  } catch (error) {
    console.error('[AUTH] JWT verification failed:', error);
    if (error instanceof Error) {
      console.error('[AUTH] Error details:', error.message);
    }
    return null;
  }
}
