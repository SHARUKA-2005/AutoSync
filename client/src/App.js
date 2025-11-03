import React, { useState, useEffect } from "react";
import { Briefcase, RefreshCw, Mail, LogOut } from "lucide-react";
import JobCard from "./components/JobCard";
import JobModal from "./components/JobModal";
import AuthPage from "./components/AuthPage";
import {
  SyncButton,
  LoadingSpinner,
  ErrorMessage,
} from "./components/HelperComponents";
import SyncPopup from "./components/HelperComponents";

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncType, setSyncType] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setCheckingAuth(true);
      const response = await fetch("http://localhost:5000/api/auth/status");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (err) {
      console.error("Error checking auth status:", err);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:5000/api/jobs");

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch("http://localhost:5000/api/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      setSyncMessage(
        `Successfully synced ${result.count} job emails from Gmail!`
      );
      setSyncType("success");

      await fetchJobs();
    } catch (err) {
      console.error("Sync error:", err);
      setSyncMessage(`Sync failed: ${err.message}`);
      setSyncType("error");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/revoke", {
        method: "POST",
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        setJobs([]);
        setSyncMessage("Successfully disconnected Gmail account");
        setSyncType("success");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setSyncMessage("Failed to disconnect account");
      setSyncType("error");
    }
  };

  const deleteJob = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      setJobs(jobs.filter((job) => job._id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    }
  };

  const updateJobStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job");
      }

      const updatedJob = await response.json();
      setJobs(jobs.map((job) => (job._id === id ? updatedJob : job)));
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job status");
    }
  };

  const closeSyncPopup = () => {
    setSyncMessage("");
    setSyncType("");
  };

  const handleAuthComplete = () => {
    setIsAuthenticated(true);
    fetchJobs();
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !checkingAuth) {
      fetchJobs();
    }
  }, [isAuthenticated, checkingAuth]);

  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show authentication page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onAuthComplete={handleAuthComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-1 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-lg">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Job Tracker
            </h1>
          </div>
          <p className="text-slate-600 max-w-3xl mx-auto mb-8 text-lg leading-relaxed">
            Automatically sync and track your job applications from Gmail with
            our intelligent system. Never miss an opportunity and stay organized
            throughout your job search journey.
          </p>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            <SyncButton onSync={handleSync} loading={syncing} />
            <button
              onClick={fetchJobs}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-slate-700 font-semibold rounded-2xl transition-all duration-300 border border-white/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-3 px-6 py-3 bg-red-50/70 backdrop-blur-sm hover:bg-red-100/90 text-red-600 font-semibold rounded-2xl transition-all duration-300 border border-red-200/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Gmail
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchJobs} />
        ) : (
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-6 bg-white/50 backdrop-blur-sm rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-white/20">
                  <Mail className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  No job applications found
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Click "Sync Gmail Jobs" to import your job-related emails and
                  start tracking your applications.
                </p>
                <SyncButton onSync={handleSync} loading={syncing} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                      Your Applications
                    </h2>
                    <p className="text-slate-600">
                      {jobs.length} applications synced from Gmail
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {jobs.length}
                    </div>
                    <div className="text-sm text-slate-500">Total Jobs</div>
                  </div>
                </div>

                <div className="grid gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onDelete={deleteJob}
                      onUpdate={updateJobStatus}
                      onSelect={setSelectedJob}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />

        <SyncPopup
          message={syncMessage}
          type={syncType}
          onClose={closeSyncPopup}
        />
      </div>
    </div>
  );
};

export default App;