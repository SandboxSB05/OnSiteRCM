import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function CrewLeadSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    // Check if user has a valid session/token from the email link
    const checkSession = async () => {
      try {
        console.log('[CrewLeadSignup] Checking session...');
        console.log('[CrewLeadSignup] Full URL:', window.location.href);
        console.log('[CrewLeadSignup] URL hash:', window.location.hash);
        console.log('[CrewLeadSignup] URL pathname:', window.location.pathname);
        
        // Check if there's a token in the URL
        const hash = window.location.hash;
        console.log('[CrewLeadSignup] Hash length:', hash.length);
        console.log('[CrewLeadSignup] Has access_token:', hash.includes('access_token'));
        console.log('[CrewLeadSignup] Has type=recovery:', hash.includes('type=recovery'));
        
        if (!hash.includes('access_token')) {
          setError(`No invitation token found. URL: ${window.location.href}`);
          setValidating(false);
          return;
        }

        if (!hash.includes('type=recovery') && !hash.includes('type=invite')) {
          setError('Invalid invitation link type.');
          setValidating(false);
          return;
        }

        console.log('[CrewLeadSignup] Found valid invitation token...');
        
        // Wait for Supabase to process the hash and establish session
        // Use a listener to catch when the session is ready
        let sessionFound = false;
        let attempts = 0;
        const maxAttempts = 10; // Try for up to 2 seconds (10 * 200ms)
        
        while (!sessionFound && attempts < maxAttempts) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          console.log(`[CrewLeadSignup] Session attempt ${attempts + 1}:`, { 
            hasSession: !!session,
            error: sessionError?.message,
            userEmail: session?.user?.email
          });
          
          if (session && session.user) {
            sessionFound = true;
            console.log('[CrewLeadSignup] Session established for:', session.user.email);
            console.log('[CrewLeadSignup] User metadata:', session.user.user_metadata);
            
            // Verify this is actually a crew lead invitation (should have contractor_id in metadata)
            if (!session.user.user_metadata?.contractor_id) {
              console.warn('[CrewLeadSignup] Warning: No contractor_id in user metadata. This may not be a crew lead invitation.');
            }
            
            setUserEmail(session.user.email || '');
            setValidating(false);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Wait 200ms before trying again
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        if (!sessionFound) {
          setError('Unable to establish session. The invitation link may have expired. Please check your email for a new invitation link.');
          setValidating(false);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('An error occurred while validating your invitation.');
        setValidating(false);
      }
    };

    checkSession();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      // Get the current session with the access token from the email link
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('[CrewLeadSignup] Error getting session:', sessionError);
        setError('Session error. Please click the invitation link again.');
        setLoading(false);
        return;
      }

      console.log('[CrewLeadSignup] Session token found, calling signup API...');

      // Call the backend API to complete signup
      // This uses the service role key to update the password
      const response = await fetch('/api/auth/crew-lead-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[CrewLeadSignup] API error:', errorData);
        setError(errorData.message || 'Failed to complete signup');
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log('[CrewLeadSignup] Signup API response:', result);

      setSuccess('Password set successfully! Creating your account...');

      // Redirect to crew lead dashboard after a brief delay
      setTimeout(() => {
        console.log('[CrewLeadSignup] Redirecting to dashboard');
        navigate('/crew-lead-dashboard');
      }, 1500);
    } catch (err) {
      console.error('[CrewLeadSignup] Catch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-center text-gray-600">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  if (error && validating === false && !userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h1 className="text-xl font-bold">Invalid Invitation</h1>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Signup</h1>
        <p className="text-gray-600 mb-6">Finish setting up your crew lead account</p>

        {userEmail && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Email:</span> {userEmail}
            </p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 8 characters)"
              disabled={loading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={loading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Password must be at least 8 characters long
        </p>
      </div>
    </div>
  );
}
