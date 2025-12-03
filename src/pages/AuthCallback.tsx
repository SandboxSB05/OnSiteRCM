import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing auth callback...');
        console.log('[AuthCallback] URL:', window.location.href);
        console.log('[AuthCallback] Hash:', window.location.hash);

        // Check the hash for error or success
        const hash = window.location.hash;
        
        if (hash.includes('error=')) {
          const params = new URLSearchParams(hash.substring(1));
          const errorDescription = params.get('error_description');
          setError(decodeURIComponent(errorDescription || 'Authentication failed'));
          setLoading(false);
          return;
        }

        if (hash.includes('access_token') && (hash.includes('type=recovery') || hash.includes('type=invite'))) {
          console.log('[AuthCallback] Valid invite token found, redirecting to signup...');
          // Redirect to crew lead signup - Supabase will have already processed the hash
          navigate('/crew-lead-signup');
          return;
        }

        // If no token found, redirect home
        console.log('[AuthCallback] No token found, redirecting to home');
        navigate('/');
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setError('An error occurred processing your invitation.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-center text-gray-600">Processing your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h1 className="text-xl font-bold">Error</h1>
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

  return null;
}
