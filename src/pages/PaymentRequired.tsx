/**
 * Payment Required Page
 * Shown to users who haven't verified their payment
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentRequired() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-yellow-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Required
          </h1>

          {/* Description */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-gray-700 mb-2">
                  Your account is currently pending payment verification.
                </p>
                <p className="text-sm text-gray-700">
                  To access the full features of OnSite RCM, please complete your payment setup.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="text-left bg-gray-50 rounded-md p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Account:</span> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {user.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Company:</span> {user.company}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = 'mailto:support@onsitercm.com?subject=Payment%20Verification%20Request'}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Contact Support for Payment Setup
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-xs text-gray-500">
            <p>Need help? Contact us at support@onsitercm.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
