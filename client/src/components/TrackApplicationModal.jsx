import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, FileText, AlertCircle, MapPin, Building, Shield } from 'lucide-react';

export default function TrackApplicationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const cleanId = trackingId.trim().toUpperCase();
      let foundData = null;

      try {
        const res = await fetch(`/api/applications/${encodeURIComponent(cleanId)}`);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data && !data.error) {
              foundData = data;
            }
          }
        }
      } catch (apiErr) {
        console.warn('API lookup warning:', apiErr);
      }

      // Check client-side stored application if API was unavailable or not found
      if (!foundData) {
        const localRecord = localStorage.getItem(`owi_app_${cleanId}`);
        if (localRecord) {
          try {
            foundData = JSON.parse(localRecord);
          } catch (e) {}
        }
      }

      if (foundData) {
        setApplication(foundData);
      } else {
        throw new Error("No application found with tracking code " + cleanId);
      }
    } catch (err) {
      setError(err.message || 'Failed to locate application dossier');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-luxury-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Italian tricolor top line */}
        <div className="h-1 bg-gradient-to-r from-italia-green via-white to-italia-red" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-luxury-950/60">
          <div>
            <span className="text-xs font-bold text-italia-green tracking-wider uppercase">Live Dossier Tracking</span>
            <h3 className="text-xl font-bold text-white font-display">Student Application Status</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-luxury-800 hover:bg-luxury-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Search Input Bar */}
          <form onSubmit={handleTrack} className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Enter your OnWay Italy Reference (e.g. OWI-2026-XXXX)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="OWI-2026-XXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-luxury-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 uppercase focus:outline-none focus:border-italia-green"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-italia-green hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-green-glow disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Application Details */}
          {application && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-luxury-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Current Stage:</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${getStatusBadge(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Reference:</span>
                  <div className="font-mono text-white font-bold">{application.id}</div>
                </div>
              </div>

              {/* Counselor Note */}
              {application.statusNote && (
                <div className="p-4 rounded-xl bg-luxury-850 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-italia-green block">Academic Counselor Update:</span>
                  <p className="leading-relaxed text-slate-300">{application.statusNote}</p>
                </div>
              )}

              {/* Applicant Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-luxury-950/60 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Candidate:</span>
                  <strong className="text-white">{application.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Wilaya:</span>
                  <strong className="text-white">{application.wilaya}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Degree:</span>
                  <strong className="text-emerald-400">{application.studyLevel} ({application.language})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Academic Field:</span>
                  <strong className="text-slate-200">{application.field}</strong>
                </div>
              </div>

              {/* Consulate Jurisdiction */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-italia-red shrink-0" />
                <span>Assigned Consulate: <strong className="text-white">{application.consulate}</strong></span>
              </div>

              {/* Target Universities */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">Selected Universities:</span>
                <div className="space-y-1.5">
                  {application.universities.map((u, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-luxury-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-italia-green shrink-0" />
                      <span>{u}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Logged */}
              {application.documents && application.documents.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-2">Attached Documents ({application.documents.length}):</span>
                  <div className="space-y-1.5">
                    {application.documents.map((doc, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-luxury-950 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-italia-green shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{doc.size || 'Verified'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-luxury-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
