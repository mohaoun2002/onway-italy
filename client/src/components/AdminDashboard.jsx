import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Search, Lock, Filter, CheckCircle2, Clock, AlertTriangle, FileText, Download, ExternalLink, MessageCircle, Mail, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { WILAYAS_ALGERIA } from '../data/universitiesData';

export default function AdminDashboard({ isOpen, onClose, initialApplications = [] }) {
  if (!isOpen) return null;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const [applications, setApplications] = useState(initialApplications);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  // Edit status state
  const [editingStatus, setEditingStatus] = useState('');
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch applications from server
  const fetchApplications = async () => {
    setLoading(true);
    try {
      let apps = [];
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data)) apps = data;
          }
        }
      } catch (apiErr) {
        console.warn('API applications fetch notice:', apiErr);
      }

      if (apps.length === 0) {
        const localApps = JSON.parse(localStorage.getItem('owi_local_applications') || '[]');
        if (localApps.length > 0) apps = localApps;
      }

      setApplications(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e?.preventDefault();
    if (passcode === 'onway2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid counselor security key. Demo key is: onway2026');
    }
  };

  // Status badge styling
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Visa Stage':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Universitaly Validated':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'Under Review':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchSearch =
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.field.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'Pending Review' || a.status === 'Under Review').length,
      universitaly: applications.filter(a => a.status === 'Universitaly Validated').length,
      visa: applications.filter(a => a.status === 'Visa Stage').length,
      approved: applications.filter(a => a.status === 'Approved').length,
    };
  }, [applications]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedApp || !editingStatus) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editingStatus,
          statusNote: statusNoteInput || selectedApp.statusNote
        })
      });
      let updatedApp = {
        ...selectedApp,
        status: editingStatus,
        statusNote: statusNoteInput || selectedApp.statusNote
      };
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (json?.application) updatedApp = json.application;
        }
      }
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? updatedApp : a));
      setSelectedApp(updatedApp);
      try {
        localStorage.setItem(`owi_app_${selectedApp.id}`, JSON.stringify(updatedApp));
        const localApps = JSON.parse(localStorage.getItem('owi_local_applications') || '[]');
        localStorage.setItem('owi_local_applications', JSON.stringify(localApps.map(a => a.id === selectedApp.id ? updatedApp : a)));
      } catch (err) {}
    } catch (e) {
      console.error(e);
      alert('Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-luxury-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        
        {/* Top tricolor bar */}
        <div className="h-1.5 bg-gradient-to-r from-italia-green via-white to-italia-red" />

        {/* Dashboard Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-luxury-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-italia-red/10 border border-italia-red/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-italia-red" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-italia-red/20 text-italia-red-light border border-italia-red/30">
                  Counselor Admin
                </span>
                <span className="text-xs text-slate-400">OnWay Italy Management System</span>
              </div>
              <h3 className="text-lg font-bold text-white font-display">Student Admissions & Visa Pipeline</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={fetchApplications}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-luxury-800 hover:bg-luxury-700 transition-colors"
                title="Refresh applications"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-luxury-800 hover:bg-luxury-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOGIN SCREEN */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-luxury-800 border border-slate-700 flex items-center justify-center mx-auto text-italia-green shadow-green-glow">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-white font-display">Counselor Portal Lock</h4>
              <p className="text-xs text-slate-400 mt-1">
                Enter your security access code to view and manage Algerian student dossiers.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-center text-sm tracking-widest text-white focus:outline-none focus:border-italia-green font-mono"
                />
                {passcodeError && (
                  <p className="text-xs text-rose-400 mt-2">{passcodeError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-italia-green hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-green-glow transition-all"
              >
                Authorize Access
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasscode('onway2026');
                  setIsAuthenticated(true);
                }}
                className="text-xs text-slate-400 hover:text-italia-green underline block mx-auto"
              >
                One-click Demo Unlock (onway2026)
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED PIPELINE VIEW */
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Metric Pipeline Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-luxury-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Total Dossiers</span>
                <span className="text-2xl font-extrabold text-white font-display">{stats.total}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-luxury-950 border border-slate-800">
                <span className="text-[11px] text-amber-400 block mb-1">Pending / Review</span>
                <span className="text-2xl font-extrabold text-amber-400 font-display">{stats.pending}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-luxury-950 border border-slate-800">
                <span className="text-[11px] text-sky-400 block mb-1">Universitaly Pre-enrolled</span>
                <span className="text-2xl font-extrabold text-sky-400 font-display">{stats.universitaly}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-luxury-950 border border-slate-800">
                <span className="text-[11px] text-rose-400 block mb-1">Visa Stage</span>
                <span className="text-2xl font-extrabold text-rose-400 font-display">{stats.visa}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-luxury-950 border border-slate-800">
                <span className="text-[11px] text-emerald-400 block mb-1">Approved & Enrolled</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-display">{stats.approved}</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applicant, wilaya, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-luxury-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-italia-green"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
                {['all', 'Pending Review', 'Under Review', 'Universitaly Validated', 'Visa Stage', 'Approved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      statusFilter === st
                        ? 'bg-italia-green text-white'
                        : 'bg-luxury-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'all' ? 'All Stages' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-luxury-950/60 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-luxury-950 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="p-4">Dossier ID</th>
                      <th className="p-4">Applicant & Wilaya</th>
                      <th className="p-4">Target Universities</th>
                      <th className="p-4">Degree Track</th>
                      <th className="p-4">Consulate</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredApps.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-luxury-800/40 transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-white">
                          {app.id}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">{app.fullName}</div>
                          <div className="text-[11px] text-slate-400">{app.wilaya} • {app.phone}</div>
                        </td>
                        <td className="p-4 max-w-xs truncate">
                          <div className="font-medium text-slate-200 truncate">
                            {app.universities.join(', ')}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-emerald-400">{app.studyLevel}</span>
                          <span className="block text-[11px] text-slate-400">{app.field}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-[11px] text-slate-300">{app.consulate}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeStyle(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setEditingStatus(app.status);
                              setStatusNoteInput(app.statusNote || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-luxury-800 hover:bg-italia-green hover:text-white border border-slate-700 text-slate-200 transition-all font-semibold"
                          >
                            Manage Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredApps.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-12 text-center text-slate-400">
                          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-white">No applications or dossiers found</p>
                          <p className="text-xs text-slate-500 mt-1">Submitted student applications will appear here in real time.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* APPLICATION DOSSIER MANAGEMENT MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-luxury-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-luxury-950/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    {selectedApp.id}
                  </span>
                  <span className="text-xs text-slate-400">Created {new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  {selectedApp.fullName}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedApp.wilaya} • {selectedApp.currentDegree}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-luxury-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Direct Algerian Contact Buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${selectedApp.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Student ({selectedApp.phone})</span>
                </a>
                <a
                  href={`mailto:${selectedApp.email}`}
                  className="px-4 py-2 rounded-xl bg-luxury-800 hover:bg-luxury-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email ({selectedApp.email})</span>
                </a>
              </div>

              {/* Status Update Form */}
              <div className="p-4 rounded-2xl bg-luxury-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">Update Dossier Pipeline Stage</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Status Level:</label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="w-full p-2.5 bg-luxury-900 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-italia-green"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Universitaly Validated">Universitaly Validated</option>
                      <option value="Visa Stage">Visa Stage</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Assigned Consulate:</label>
                    <div className="p-2.5 bg-luxury-900 border border-slate-800 rounded-xl text-slate-300 font-medium">
                      {selectedApp.consulate}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Counselor Note (Visible to Student):</label>
                  <textarea
                    rows="2"
                    value={statusNoteInput}
                    onChange={(e) => setStatusNoteInput(e.target.value)}
                    className="w-full p-2.5 bg-luxury-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-italia-green"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="px-5 py-2 bg-italia-green hover:bg-emerald-600 text-white rounded-xl font-bold shadow-green-glow disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Status Update'}
                  </button>
                </div>
              </div>

              {/* Academic Profile Details */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-luxury-950/60 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Target Study Track:</span>
                  <strong className="text-white">{selectedApp.studyLevel} ({selectedApp.language})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Academic Field:</span>
                  <strong className="text-white">{selectedApp.field}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">GPA / Mention:</span>
                  <strong className="text-emerald-400">{selectedApp.gpa || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Baccalaureate Year:</span>
                  <strong className="text-white">{selectedApp.bacYear}</strong>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h4 className="font-bold text-white text-sm mb-2">Attached Student Documents</h4>
                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApp.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-luxury-950 border border-slate-800"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-italia-green shrink-0" />
                          <span className="text-white font-medium truncate">{doc.name}</span>
                          <span className="text-slate-500 text-[10px]">({doc.size || 'Verified'})</span>
                        </div>
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-luxury-800 hover:bg-italia-green text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                            Stored
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No documents uploaded with initial submission.</p>
                )}
              </div>

            </div>

            <div className="p-4 border-t border-slate-800 bg-luxury-950/80 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl bg-luxury-800 text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
