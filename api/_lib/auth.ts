import { jwtVerify, importSPKI, importJWK } from 'jose';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

if (!SUPABASE_URL) {
  console.error('[AUTH] Missing SUPABASE_URL. Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '));
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL must be defined');
}

console.log('[AUTH] Initialized with SUPABASE_URL:', SUPABASE_URL);

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
    console.log('[AUTH] Fetching JWKS from:', `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
    const response = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`);
    }
    jwksCache = await response.json();
    jkwsCacheTime = now;
    console.log('[AUTH] JWKS fetched successfully, keys count:', jwksCache.keys?.length || 0);
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
    console.log('[AUTH] Verifying JWT token...');
    
    // Decode header to see what algorithm is being used
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'));
    console.log('[AUTH] Token header:', JSON.stringify(header));
    
    // Get JWKS keys
    const jwks = await getJWKS();
    
    // Find the key that matches the kid in the token header
    let key = null;
    if (header.kid) {
      console.log('[AUTH] Looking for key with kid:', header.kid);
      key = jwks.keys?.find((k: any) => k.kid === header.kid);
      if (!key) {
        console.error('[AUTH] No key found for kid:', header.kid);
        console.error('[AUTH] Available kids:', jwks.keys?.map((k: any) => k.kid).join(', '));
      }
    } else {
      // If no kid, use the first key
      console.log('[AUTH] No kid in header, using first available key');
      key = jwks.keys?.[0];
    }
    
    if (!key) {
      throw new Error('No suitable key found in JWKS for token verification');
    }
    
    console.log('[AUTH] Using key with alg:', key.alg);
    console.log('[AUTH] Full key:', JSON.stringify(key).substring(0, 200));
    
    // Import the key - the algorithm must be one that jose supports
    try {
      const publicKey = await importJWK(key, key.alg);
      
      // Validate signature and standard claims
      const { payload } = await jwtVerify(token, publicKey, {
        issuer: `${SUPABASE_URL}/auth/v1`, // Supabase issues tokens with this issuer
      });

      console.log('[AUTH] JWT verification successful');

      // payload.sub is the user id (UUID in auth.users)
      if (!payload.sub) {
        throw new Error('Token missing subject (user ID)');
      }

      return {
        token,
        userId: payload.sub as string,
        payload,
      };
    } catch (importError) {
      console.error('[AUTH] Failed to import key or verify JWT:', importError);
      throw importError;
    }
  } catch (error) {
    if (error instanceof Error) {
      // Log more details for debugging
      console.error('[JWT Verification] Error type:', error.name);
      console.error('[JWT Verification] Message:', error.message);
      console.error('[JWT Verification] Stack:', error.stack?.substring(0, 500));
      
      // Check if it's a key resolution error
      if (error.message.includes('Unsupported') || error.message.includes('alg')) {
        console.error('[JWT Verification] Algorithm mismatch - checking JWKS...');
        console.error('[JWT Verification] SUPABASE_URL:', SUPABASE_URL);
      }
      
      throw new Error(`JWT verification failed: ${error.message}`);
    }
    throw new Error('JWT verification failed');
  }
}
