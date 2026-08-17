import React, { useState, useEffect } from "react";
import { Activity, ShieldAlert } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function SystemStatus() {
  const [checking, setChecking] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Try pinging auth/me or base endpoint to see if API is reachable
        const res = await fetch(`${API_BASE_URL}/auth/me`, { method: "GET" });
        // Even if unauthorized (401), if we get a response, the backend is up
        setBackendAvailable(res.status === 401 || res.ok);
      } catch (err) {
        setBackendAvailable(false);
      } finally {
        setChecking(false);
      }
    };
    checkBackend();
  }, []);

  const services = [
    { name: "Document Service", key: "document" },
    { name: "OCR Service", key: "ocr" },
    { name: "AI Summarization", key: "ai" },
    { name: "Database Connection", key: "database" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Activity size={20} className="text-blue-500" />
        <h3 className="text-lg font-semibold text-text">System Status</h3>
      </div>

      {checking ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-muted ml-2">Checking systems...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {services.map((service) => (
              <div
                key={service.key}
                className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-border rounded-lg"
              >
                <span className="text-sm font-semibold text-text">{service.name}</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                  <span className="text-xs font-semibold text-muted">Status unavailable</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-500/5 dark:border-amber-500/20 p-4 flex gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            <ShieldAlert size={18} className="shrink-0 text-amber-500" />
            <p className="leading-relaxed">
              <strong>System Status Details:</strong> Actual backend health/status APIs are not provided by the DocuSphere backend server. The services status is currently reported as <em>Status unavailable</em>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
