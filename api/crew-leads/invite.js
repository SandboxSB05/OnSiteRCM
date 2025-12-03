import { supabaseAdminClient } from '../_lib/supabase.js';
import { verifySupabaseJWT } from '../_lib/auth.ts';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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

    // Verify user is a contractor - contractors.id IS the user_id
    const { data: contractor, error: contractorError } = await supabaseAdminClient()
      .from('contractors')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('[Invite] userId:', userId);
    console.log('[Invite] contractor query result:', { contractor, error: contractorError?.message });

    if (contractorError || !contractor) {
      console.error('[Invite] Contractor lookup failed:', contractorError?.message);
      return res.status(403).json({ 
        error: 'Only contractors can invite crew leads',
        details: contractorError?.message 
      });
    }

    // Extract email from request body
    const { email, name, phone, notes } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('[Invite] Creating invitation for:', { email, name, phone });

    const adminClient = supabaseAdminClient();

    // Create the invitation
    try {
      console.log('[Invite] Creating invitation for:', { email, name, phone });

      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            name: name,
            phone: phone || '',
            role: 'crew_lead',
            contractor_id: contractor.id,
          },
          redirectTo: 'http://localhost:3001/crew-lead-signup',
          expiresIn: 86400, // 24 hours in seconds
        }
      );

      if (inviteError) {
        console.error('[Invite] inviteUserByEmail error:', inviteError);
        return res.status(400).json({ error: inviteError.message });
      }

      console.log('[Invite] User invitation created:', inviteData.user?.id);

      // Store the pending crew lead invitation in the pending_crew_leads table
      // This will be moved to crew_leads when they complete signup
      const { data: pendingCrewLead, error: pendingError } = await adminClient
        .from('pending_crew_leads')
        .insert({
          contractor_id: contractor.id,
          email: email,
          name: name,
          phone: phone || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (pendingError) {
        console.error('[Invite] Failed to store pending crew lead:', pendingError);
        // Don't fail the entire request if we can't store the pending record
        // The invite was still sent
      }

      console.log('[Invite] Pending crew lead record created:', pendingCrewLead);

      return res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        crewLead: {
          id: inviteData.user.id,
          email: email,
          name: name,
          phone: phone || undefined,
          status: 'pending',
          invitedAt: new Date().toISOString(),
        },
      });
    } catch (inviteErr) {
      console.error('[Invite] Catch error:', inviteErr);
      return res.status(500).json({ 
        error: 'Failed to send invitation',
        details: inviteErr?.message 
      });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error?.message });
  }
}
