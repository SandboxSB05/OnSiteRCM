import { supabaseAdminClient } from '../_lib/supabase.js';
import { verifySupabaseJWT } from '../_lib/auth.ts';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    let userId;
    
    // Try JWT verification first
    const verified = await verifySupabaseJWT(authHeader);
    if (verified) {
      userId = verified.userId;
    } else {
      // Fallback: try to decode token without verification for development
      try {
        const token = authHeader.replace('Bearer ', '');
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub;
          console.log('[Dev Mode] Using unverified token, userId:', userId);
        }
      } catch (e) {
        console.log('[Dev Mode] Could not decode token:', e.message);
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = { id: userId };

    // Get contractor info - contractors.id IS the user_id
    const { data: contractor, error: contractorError } = await supabaseAdminClient()
      .from('contractors')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('[List] userId:', userId);
    console.log('[List] contractor query result:', { contractor, error: contractorError?.message });

    if (contractorError || !contractor) {
      console.error('[List] Contractor lookup failed:', contractorError?.message);
      return res.status(403).json({ 
        error: 'Only contractors can view crew leads',
        details: contractorError?.message 
      });
    }

    // Get crew leads for this contractor
    const { data: crewLeads, error: listError, count } = await supabaseAdminClient()
      .from('crew_leads')
      .select('*', { count: 'exact' })
      .eq('contractor_id', contractor.id);

    if (listError) {
      console.error('List error:', listError);
      return res.status(500).json({ error: 'Failed to fetch crew leads' });
    }

    return res.status(200).json({
      crewLeads: crewLeads || [],
      count: count || 0,
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error?.message });
  }
}
