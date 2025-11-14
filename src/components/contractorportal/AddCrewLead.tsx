import React, { useState, useEffect } from 'react';
import { inviteCrewLead, listCrewLeads } from '@/services/crewLeadService';
import { InviteCrewLeadRequest, CrewLeadListItem } from '@/types/crew-lead.types';
import { CREW_LEAD_STATUS_LABELS, CREW_LEAD_STATUS_COLORS } from '@/types/crew-lead.types';

/**
 * AddCrewLead Component
 *
 * Allows contractors to:
 * 1. View their existing crew leads
 * 2. Invite new crew leads via email
 *
 * Usage:
 * ```tsx
 * <AddCrewLead />
 * ```
 */
export function AddCrewLead() {
  const [tab, setTab] = useState<'list' | 'invite'>('list');
  const [crewLeads, setCrewLeads] = useState<CrewLeadListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<InviteCrewLeadRequest>({
    email: '',
    name: '',
    phone: '',
    notes: '',
  });

  // Load crew leads on mount
  useEffect(() => {
    if (tab === 'list') {
      loadCrewLeads();
    }
  }, [tab]);

  const loadCrewLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCrewLeads();
      setCrewLeads(data.crewLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crew leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.email || !formData.name) {
        throw new Error('Email and name are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const result = await inviteCrewLead(formData);

      setSuccess(
        `${result.crewLead.name} has been invited! They will receive an email at ${result.crewLead.email} with instructions to create their account.`
      );

      // Reset form
      setFormData({
        email: '',
        name: '',
        phone: '',
        notes: '',
      });

      // Reload list
      setTimeout(() => {
        loadCrewLeads();
        setTab('list');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite crew lead');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Crew Lead Management</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setTab('list')}
          className={`px-4 py-2 font-medium transition-colors ${
            tab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          View Crew Leads
        </button>
        <button
          onClick={() => setTab('invite')}
          className={`px-4 py-2 font-medium transition-colors ${
            tab === 'invite'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Invite New Crew Lead
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <p className="font-medium">Success</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* List Tab */}
      {tab === 'list' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Crew Leads ({crewLeads.length})</h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading crew leads...</div>
          ) : crewLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No crew leads yet. Invite one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-sm">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {crewLeads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            CREW_LEAD_STATUS_COLORS[lead.status]
                          }`}
                        >
                          {CREW_LEAD_STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Tab */}
      {tab === 'invite' && (
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">Invite a New Crew Lead</h3>
          <p className="text-gray-600 mb-6">
            Fill in the crew lead's information and they will receive an email invitation to create their account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="crew@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">The email address where the invitation will be sent</p>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="555-1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Optional</p>
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="e.g., Senior crew lead with 10+ years experience"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - for your internal use only</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors disabled:cursor-not-allowed"
              >
                {loading ? 'Inviting...' : 'Invite Crew Lead'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ email: '', name: '', phone: '', notes: '' });
                  setError(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
              <li>Enter the crew lead's email and name</li>
              <li>Click "Invite Crew Lead"</li>
              <li>They will receive an email with a sign-up link</li>
              <li>After they sign up, their account will be active and linked to your company</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCrewLead;
