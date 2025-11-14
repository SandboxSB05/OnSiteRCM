import { supabaseAdminClient } from '../_lib/supabase.js';
import { verifySupabaseJWT } from '../_lib/auth.ts';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    let userId;
    const verified = await verifySupabaseJWT(authHeader);
    if (verified) {
      userId = verified.userId;
    } else {
      try {
        const token = authHeader.replace('Bearer ', '');
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get contractor info - only contractors can delete invitations
    const { data: contractor, error: contractorError } = await supabaseAdminClient()
      .from('contractors')
      .select('id')
      .eq('id', userId)
      .single();

    if (contractorError || !contractor) {
      return res.status(403).json({ error: 'Only contractors can delete invitations' });
    }

    // Get email from query params
    const { searchParams } = new URL(req.url, 'http://localhost');
    const email = searchParams.get('email');

    if (!email) {
      return res.status(400).json({ error: 'Email parameter required' });
    }

    console.log('[DeleteInvite] Attempting to delete user:', email);

    // Delete the user from auth.users
    const { error: deleteError } = await supabaseAdminClient().auth.admin.deleteUser(
      email, // Note: some versions use email, others use userId
      false // Don't throw on error
    );

    // If that didn't work, try finding by email first
    if (deleteError) {
      console.log('[DeleteInvite] Error deleting by email:', deleteError);
      
      // Try to find user by email and delete by ID
      const { data: { users }, error: searchError } = await supabaseAdminClient().auth.admin.listUsers();
      
      if (searchError || !users) {
        return res.status(500).json({ error: 'Failed to find user' });
      }

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { error: deleteByIdError } = await supabaseAdminClient().auth.admin.deleteUser(user.id);
      
      if (deleteByIdError) {
        console.error('[DeleteInvite] Error deleting by ID:', deleteByIdError);
        return res.status(500).json({ 
          error: 'Failed to delete user', 
          details: deleteByIdError.message 
        });
      }
    }

    console.log('[DeleteInvite] User deleted successfully:', email);

    // Also delete from pending_crew_leads if exists
    const { error: pendingError } = await supabaseAdminClient()
      .from('pending_crew_leads')
      .delete()
      .eq('email', email)
      .eq('contractor_id', contractor.id);

    if (pendingError) {
      console.log('[DeleteInvite] Note: pending record not found or error:', pendingError);
    }

    return res.status(200).json({
      success: true,
      message: `Invitation for ${email} has been cancelled`,
    });
  } catch (error) {
    console.error('[DeleteInvite] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error?.message 
    });
  }
}
