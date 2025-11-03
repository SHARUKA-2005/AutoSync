import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

function AuthPage({ onAuthComplete }) {
  const [authStatus, setAuthStatus] = useState('idle'); // idle, loading, success, error
  const [authUrl, setAuthUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/status');
      const data = await response.json();
      
      if (data.authenticated) {
        setAuthStatus('success');
        if (onAuthComplete) {
          setTimeout(() => onAuthComplete(), 1500);
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const initiateAuth = async () => {
    try {
      setAuthStatus('loading');
      setErrorMessage('');
      
      const response = await fetch('http://localhost:5000/api/auth/url');
      const data = await response.json();
      
      if (data.authUrl) {
        setAuthUrl(data.authUrl);
        // Open in new window
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const authWindow = window.open(
          data.authUrl,
          'Gmail Authorization',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch('http://localhost:5000/api/auth/status');
            const statusData = await statusResponse.json();
            
            if (statusData.authenticated) {
              clearInterval(pollInterval);
              if (authWindow && !authWindow.closed) {
                authWindow.close();
              }
              setAuthStatus('success');
              if (onAuthComplete) {
                setTimeout(() => onAuthComplete(), 1500);
              }
            }
          } catch (err) {
            console.error('Polling error:', err);
          }
        }, 2000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (authStatus === 'loading') {
            setAuthStatus('error');
            setErrorMessage('Authentication timeout. Please try again.');
          }
        }, 300000);
        
      } else {
        setAuthStatus('error');
        setErrorMessage(data.error || 'Failed to get authorization URL');
      }
    } catch (err) {
      console.error('Auth initiation error:', err);
      setAuthStatus('error');
      setErrorMessage(err.message || 'Failed to initiate authentication');
    }
  };

  const handleManualAuth = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-lg">
                <Mail className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              Connect Gmail Account
            </h1>
            <p className="text-slate-600 leading-relaxed">
              Authenticate with Gmail to sync your job application emails automatically
            </p>
          </div>

          {authStatus === 'idle' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Secure Authentication</p>
                    <p className="text-blue-700">
                      Your credentials are handled securely by Google OAuth. We only access read-only permissions for your emails.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={initiateAuth}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Mail className="w-5 h-5" />
                Authorize Gmail Access
              </button>
            </div>
          )}

          {authStatus === 'loading' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                  <Mail className="w-8 h-8 text-blue-600 animate-bounce absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-800 mb-2">
                    Waiting for Authorization...
                  </p>
                  <p className="text-sm text-slate-600">
                    Please complete the authentication in the popup window
                  </p>
                </div>
              </div>

              {authUrl && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-sm text-slate-600 mb-3">
                    Popup blocked? Click below to open manually:
                  </p>
                  <button
                    onClick={handleManualAuth}
                    className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Authorization Page
                  </button>
                </div>
              )}
            </div>
          )}

          {authStatus === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Authentication Successful!
              </h3>
              <p className="text-slate-600">
                Your Gmail account has been connected successfully. Redirecting...
              </p>
            </div>
          )}

          {authStatus === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-900 mb-1">
                      Authentication Failed
                    </p>
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={initiateAuth}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Mail className="w-5 h-5" />
                Try Again
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              By connecting your Gmail account, you agree to allow this app to read job-related emails. You can revoke access anytime from your Google Account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;