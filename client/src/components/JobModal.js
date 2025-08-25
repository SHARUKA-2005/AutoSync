import React from 'react';
import { Briefcase, X, Building2, Mail, ExternalLink } from 'lucide-react';

function JobModal({ job, onClose }) {
  if (!job) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'not seen':
        return { color: 'text-slate-600', bg: 'bg-slate-100' };
      case 'applied':
        return { color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100' };
      case 'selected':
        return { color: 'text-emerald-600', bg: 'bg-emerald-100' };
      default:
        return { color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  const statusConfig = getStatusConfig(job.status);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{job.title}</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-5 h-5" />
                  <span className="font-semibold text-lg">{job.company}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                  {job.status}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200/50">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Sender</h4>
              <p className="text-slate-800 font-medium">{job.senderEmail || 'Unknown'}</p>
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200/50">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Date Applied</h4>
              <p className="text-slate-800 font-medium">{new Date(job.dateApplied).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100/50">
            <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Email Subject</h4>
            <p className="text-slate-800 font-medium leading-relaxed">{job.emailSubject}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200/50">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-slate-600" />
            Email Content
          </h4>
          <div className="bg-white rounded-xl p-6 shadow-inner max-h-64 overflow-y-auto border border-slate-200/50">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.emailContent || 'No content available'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
          >
            Close
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            View Original
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobModal;