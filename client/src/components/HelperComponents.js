import React, { useEffect } from 'react';
import { Mail, RefreshCw, AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

export function SyncButton({ onSync, loading }) {
  return (
    <button
      onClick={onSync}
      disabled={loading}
      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
    >
      {loading ? (
        <>
          <RefreshCw className="w-5 h-5 animate-spin" />
          Syncing Gmail...
        </>
      ) : (
        <>
          <Mail className="w-5 h-5" />
          Sync Gmail Jobs
        </>
      )}
    </button>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-600 font-medium">Loading your job applications...</p>
      </div>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-red-800 mb-3">Error Loading Jobs</h3>
      <p className="text-red-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
      >
        Try Again
      </button>
    </div>
  );
}

function SyncPopup({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : XCircle;
  
  const baseClasses = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] max-w-md w-full mx-4";
  const backgroundClasses = isSuccess 
    ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200" 
    : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200";
  const iconClasses = isSuccess ? "text-emerald-600" : "text-red-600";
  const textClasses = isSuccess ? "text-emerald-800" : "text-red-800";

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`${baseClasses} ${backgroundClasses} rounded-2xl border-2 shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-4 fade-in duration-300`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'}`}>
              <Icon className={`w-6 h-6 ${iconClasses}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold ${textClasses} mb-2`}>
                {isSuccess ? 'Sync Successful!' : 'Sync Failed'}
              </h3>
              <p className={`${textClasses} opacity-90 leading-relaxed`}>
                {message}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg hover:bg-white/50 transition-all duration-200 ${textClasses} opacity-60 hover:opacity-100`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="h-1 bg-black/5 rounded-b-2xl overflow-hidden">
          <div 
            className={`h-full ${isSuccess ? 'bg-emerald-400' : 'bg-red-400'} animate-[shrink_4s_linear]`}
            style={{
              animation: 'shrink 4s linear forwards',
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}

export default SyncPopup;
