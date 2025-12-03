/**
 * Crew Lead API Service
 * Handles all API calls related to crew lead management
 */

import { supabase } from '../../lib/supabaseClient';
import {
  InviteCrewLeadRequest,
  InviteCrewLeadResponse,
  CrewLeadsListResponse,
  ApiErrorResponse,
} from '../types/crew-lead.types';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Invite a crew lead by email
 * The crew lead will receive an invitation email with a sign-up link
 *
 * @param data - Crew lead invitation details
 * @returns Promise with crew lead data and message
 */
export async function inviteCrewLead(data: InviteCrewLeadRequest): Promise<InviteCrewLeadResponse> {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      throw new Error('Not authenticated');
    }

    const url = API_URL ? `${API_URL}/api/crew-leads/invite` : '/api/crew-leads/invite';
    console.log('[CrewLeadService] Inviting crew lead:', { url, email: data.email });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(error.message || `Failed to invite crew lead: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error inviting crew lead:', error);
    throw error;
  }
}

/**
 * Get list of crew leads for the authenticated contractor
 *
 * @param status - Optional filter by crew lead status (pending, active, inactive)
 * @returns Promise with array of crew leads
 */
export async function listCrewLeads(status?: string): Promise<CrewLeadsListResponse> {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session?.access_token) {
      throw new Error('Not authenticated');
    }

    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append('status', status);
    }

    const url = API_URL 
      ? `${API_URL}/api/crew-leads/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      : `/api/crew-leads/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('[CrewLeadService] Fetching crew leads:', { url });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(error.message || `Failed to fetch crew leads: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching crew leads:', error);
    throw error;
  }
}
