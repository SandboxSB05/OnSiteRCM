/**
 * API Types for Crew Lead Management
 * These types are used for API requests and responses
 */

import { CrewLeadStatus } from './database.types';

// =========================================================================
// INVITE CREW LEAD
// =========================================================================

export interface InviteCrewLeadRequest {
  email: string;
  name: string;
  phone?: string;
  notes?: string;
}

export interface CrewLeadInvitation {
  id: string;
  email: string;
  name: string;
  phone?: string;
  status: CrewLeadStatus;
  invitedAt: string;
}

export interface InviteCrewLeadResponse {
  success: boolean;
  crewLead: CrewLeadInvitation;
  message: string;
}

// =========================================================================
// LIST CREW LEADS
// =========================================================================

export interface CrewLeadListItem {
  id: string;
  email: string;
  name: string;
  phone?: string;
  status: CrewLeadStatus;
  notes?: string;
  invitedAt: string;
  activatedAt?: string;
}

export interface CrewLeadsListResponse {
  crewLeads: CrewLeadListItem[];
  count: number;
}

// =========================================================================
// ERROR RESPONSE
// =========================================================================

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// =========================================================================
// CREW LEAD STATUS LABELS
// =========================================================================

export const CREW_LEAD_STATUS_LABELS: Record<CrewLeadStatus, string> = {
  pending: 'Pending Invitation',
  active: 'Active',
  inactive: 'Inactive',
};

export const CREW_LEAD_STATUS_COLORS: Record<CrewLeadStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
};
