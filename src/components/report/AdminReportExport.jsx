import React, { useState } from 'react';
import {
  Users,
  LayoutDashboard,
  FileDown,
  FileText,
  Table as TableIcon,
  Sheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';
import authService from '../../services/authService.js';

const AdminReportExport = () => {
  const [loading, setLoading] = useState({
    usersPdf: false, usersCsv: false, usersXlsx: false,
    teamsPdf: false, teamsCsv: false, teamsXlsx: false,
    documentsPdf: false, documentsCsv: false, documentsXlsx: false,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleExport = async (reportType, format) => {
    const key = `${reportType}${format.charAt(0).toUpperCase()}${format.slice(1)}`;
    try {
      setLoading(prev => ({ ...prev, [key]: true }));
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
      const endpoint = `${API_BASE_URL}/admin/reports/${reportType}/export-${format}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:
            format === 'pdf' ? 'application/pdf'
            : format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv',
        },
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Access denied. Admin role required.');
        throw new Error(`Failed to export ${reportType} report.`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess(`✓ ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to export report.');
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const reports = [
    {
      title: 'Users Report',
      reportType: 'users',
      description: 'Complete list of all registered users, their roles, and account details.',
      icon: Users,
      accent: 'bg-[#eef2ff] text-[#3730a3]',
    },
    {
      title: 'Teams Report',
      reportType: 'teams',
      description: 'All teams overview including member counts and creation dates.',
      icon: LayoutDashboard,
      accent: 'bg-[#fefce8] text-[#a16207]',
    },
    {
      title: 'Documents Report',
      reportType: 'documents',
      description: 'All uploaded documents with owner, team, file type and status.',
      icon: FileDown,
      accent: 'bg-[#ecfdf5] text-[#047857]',
    },
  ];

  const exportButtons = [
    {
      format: 'pdf',
      label: 'Export PDF',
      icon: FileText,
      className: 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300',
    },
    {
      format: 'csv',
      label: 'Export CSV',
      icon: TableIcon,
      className: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300',
    },
    {
      format: 'xlsx',
      label: 'Export XLSX',
      icon: Sheet,
      className: 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map(({ title, reportType, description, icon: Icon, accent }) => (
          <div
            key={reportType}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${accent}`}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Action Buttons — full-width stacked rows */}
            <div className="flex flex-col gap-2.5">
              {exportButtons.map(({ format, label, icon: BtnIcon, className }) => {
                const key = `${reportType}${format.charAt(0).toUpperCase()}${format.slice(1)}`;
                const isLoading = loading[key];
                return (
                  <button
                    key={format}
                    onClick={() => handleExport(reportType, format)}
                    disabled={isLoading}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isLoading
                        ? <Loader2 size={16} className="animate-spin" />
                        : <BtnIcon size={16} />
                      }
                      {label}
                    </div>
                    <Download size={14} className="opacity-50" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {error && (
          <div className="bg-white border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px]">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span className="text-sm font-medium flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {success && (
          <div className="bg-white border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px]">
            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
            <span className="text-sm font-medium flex-1">{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">✕</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportExport;
