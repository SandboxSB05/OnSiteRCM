import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface CrewLeadSignupBody {
  password: string;
  phone?: string;
}

/**
 * POST /api/auth/crew-lead-signup
 * 
 * Complete crew lead signup by setting their password and creating records
 * Requires valid Supabase session from invitation email link
 * 
 * Request Body:
 * {
 *   "password": "securepassword123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Signup completed successfully",
 *   "user": {
 *     "id": "uuid",
 *     "email": "crewlead@example.com"
 *   }
 * }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Supabase environment variables are not configured'
      });
    }

    const { password, phone } = req.body as CrewLeadSignupBody;

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password is required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters'
      });
    }

    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid session token provided'
      });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create user client with the session token to identify who is making the request
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    // Get the current user from the session
    const { data: { user }, error: getUserError } = await supabaseUser.auth.getUser();

    if (getUserError || !user) {
      console.error('Error getting user from session:', getUserError);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired session'
      });
    }

    console.log('[Crew Lead Signup] ===== SESSION USER =====');
    console.log('[Crew Lead Signup] User ID:', user.id);
    console.log('[Crew Lead Signup] User email:', user.email);
    console.log('[Crew Lead Signup] User metadata:', user.user_metadata);
    console.log('[Crew Lead Signup] ========================');

    // Create service role client to update user password
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Update the user's password using service role
    const { error: updateError } = await supabaseService.auth.admin.updateUserById(
      user.id,
      { 
        password: password,
        email_confirm: true // Ensure email is confirmed
      }
    );

    if (updateError) {
      console.error('[Crew Lead Signup] Error updating password:', updateError);
      return res.status(500).json({
        error: 'Failed to update password',
        message: updateError.message || 'An error occurred while updating your password'
      });
    }

    console.log('[Crew Lead Signup] Password updated successfully');

    // Fetch the pending crew lead record to get additional info
    const userEmail = user.email;
    console.log('[Crew Lead Signup] Looking for pending crew lead with email:', userEmail);
    
    const { data: pendingCrewLead, error: pendingError } = await supabaseService
      .from('pending_crew_leads')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (pendingError) {
      console.warn('[Crew Lead Signup] Warning fetching pending crew lead record:', pendingError);
      // Don't fail - record might not exist if signup happened outside the invite flow
    } else {
      console.log('[Crew Lead Signup] Found pending crew lead record:', pendingCrewLead);
    }

    // Create crew_leads record if it doesn't exist
    const contractorId = user.user_metadata?.contractor_id;
    console.log('[Crew Lead Signup] User metadata:', user.user_metadata);
    console.log('[Crew Lead Signup] Contractor ID from metadata:', contractorId);
    console.log('[Crew Lead Signup] Contractor ID from pending:', pendingCrewLead?.contractor_id);
    
    const finalContractorId = contractorId || pendingCrewLead?.contractor_id;
    
    if (!finalContractorId) {
      console.error('[Crew Lead Signup] ERROR: No contractor_id found in metadata or pending record');
      return res.status(400).json({
        error: 'Invalid invitation',
        message: 'Could not find contractor information. Your invitation may be invalid.'
      });
    }

    // NOW create crew_leads record
    console.log('[Crew Lead Signup] Creating crew_leads entry with:', {
      userId: user.id,
      contractorId: finalContractorId,
      phone: phone || pendingCrewLead?.phone || null,
      notes: pendingCrewLead?.notes || null,
    });
    
    const { data, error: crewLeadError } = await supabaseService
      .from('crew_leads')
      .insert({
        id: user.id,
        contractor_id: finalContractorId,
        status: 'active',
        email: pendingCrewLead?.email || user.email || null,
        name: pendingCrewLead?.name || user.user_metadata?.name || null,
        phone: phone || pendingCrewLead?.phone || null,
        notes: pendingCrewLead?.notes || null,
      })
      .select();

    if (crewLeadError) {
      console.error('[Crew Lead Signup] Error creating crew lead record:', {
        code: crewLeadError.code,
        message: crewLeadError.message,
        details: crewLeadError.details,
      });
      
      return res.status(500).json({
        error: 'Failed to create crew lead record',
        message: crewLeadError.message || 'An error occurred while creating your crew lead profile'
      });
    } else {
      console.log('[Crew Lead Signup] Crew lead record created successfully:', data);
    }

    console.log('[Crew Lead Signup] Signup completed successfully for user:', user.id);

    return res.status(200).json({
      success: true,
      message: 'Signup completed successfully',
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('[Crew Lead Signup] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}
