import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Trash2, X, Check, Clock, Building2, Calendar, Mail, ChevronDown } from 'lucide-react';

function JobCard({ job, onDelete, onUpdate, onSelect }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'not seen':
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          border: 'border-slate-200',
          badge: 'bg-slate-100 text-slate-700',
          icon: Clock
        };
      case 'applied':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          icon: Clock
        };
      case 'rejected':
        return {
          bg: 'bg-red-50',
          text: 'text-red-600',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700',
          icon: X
        };
      case 'selected':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-700',
          icon: Check
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          border: 'border-slate-200',
          badge: 'bg-slate-100 text-slate-700',
          icon: Clock
        };
    }
  };

  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div 
      className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group cursor-pointer hover:-translate-y-1 ${isDropdownOpen ? 'z-50' : ''}`}
      onClick={() => onSelect(job)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 border border-blue-100/50">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors duration-300 truncate">
                    {job.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold truncate">{job.company}</span>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.badge} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {job.status}
                </div>
              </div>

              {job.emailSubject && (
                <div className="flex items-start gap-2 text-slate-600 mb-3">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span className="text-sm font-medium line-clamp-1">{job.emailSubject}</span>
                </div>
              )}

              {job.emailSnippet && (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 mb-4 border border-slate-200/50">
                  <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                    {job.emailSnippet}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`px-4 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} text-sm font-medium flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {job.status}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {['Not Seen', 'Applied', 'Rejected', 'Selected'].map(status => {
                        const config = getStatusConfig(status);
                        const Icon = config.icon;
                        return (
                          <div
                            key={status}
                            onClick={() => {
                              onUpdate(job._id, status);
                              setIsDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm flex items-center gap-2"
                          >
                            <Icon className={`w-4 h-4 ${config.text}`} />
                            <span className={config.text}>{status}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatDate(job.dateApplied || job.date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDelete(job._id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Delete Job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobCard;