import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, CheckCircle, ArrowUpRight, X, Coins, FileCheck, Building2, LayoutGrid, TableProperties } from 'lucide-react';

// Helper functions to format Opening Date, Deadline, and calculate Countdown
export function getOpeningDateDisplay(openingDate) {
  if (!openingDate || typeof openingDate !== 'string') {
    return { text: 'To be announced', isTbd: true };
  }
  const clean = openingDate.trim();
  if (!clean || clean.toUpperCase() === 'TBD') {
    return { text: 'To be announced', isTbd: true };
  }
  return { text: clean, isTbd: false };
}

export function getDeadlineDisplay(deadline) {
  if (!deadline || typeof deadline !== 'string') {
    return { text: 'TBD', isTbd: true };
  }
  const clean = deadline.trim();
  if (!clean || clean.toUpperCase() === 'TBD') {
    return { text: 'TBD', isTbd: true };
  }
  return { text: clean, isTbd: false };
}

export function getCountdownTimer(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== 'string') return null;
  const clean = deadlineStr.trim();
  if (!clean || clean.toUpperCase() === 'TBD' || clean.toUpperCase() === 'TO BE ANNOUNCED') {
    return null;
  }
  
  // If multi-date format e.g. "Dec 1, 2026 / Mar 1, 2027", evaluate the first call
  let targetStr = clean;
  if (clean.includes('/')) {
    targetStr = clean.split('/')[0].trim();
  }

  const parsedTimestamp = Date.parse(targetStr);
  if (isNaN(parsedTimestamp)) return null;

  const targetDate = new Date(parsedTimestamp);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Only calculate or return countdown timer if a valid future date is available
  if (diffDays <= 0 || isNaN(diffDays)) return null;

  return {
    daysLeft: diffDays,
    label: diffDays === 1 ? '1 day left' : `${diffDays} days left`
  };
}

export default function UniversityDirectory({ universities, onApplyWithUniversity }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Filtered universities based strictly on the required fields, sorted A-Z by name
  const filteredUniversities = useMemo(() => {
    return universities
      .filter(u => {
        if (!u) return false;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.admissionFee && u.admissionFee.toLowerCase().includes(q)) ||
          (u.englishRequirement && u.englishRequirement.toLowerCase().includes(q)) ||
          (u.openingDate && u.openingDate.toLowerCase().includes(q)) ||
          (u.deadline && u.deadline.toLowerCase().includes(q)) ||
          (u.openingDate && u.openingDate.toUpperCase() === 'TBD' && 'to be announced'.includes(q));

        const matchesStatus =
          selectedStatus === 'all' ||
          (u.status && u.status.toLowerCase() === selectedStatus.toLowerCase());

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [universities, searchQuery, selectedStatus]);

  const openCount = universities.filter(u => u.status === 'Open').length;
  const upcomingCount = universities.filter(u => u.status === 'Upcoming').length;

  return (
    <section id="universities" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-italia-green/10 border border-italia-green/30 text-italia-green text-xs font-semibold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" />
              Official Admissions Directory
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
              Italian Universities Intakes
            </h2>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              Track admission fees, English certificate requirements, opening dates, and deadlines.
            </p>
          </div>

          {/* Quick Counter Badges & View Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-italia-green animate-pulse" />
              <span>{openCount} Open</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{upcomingCount} Upcoming</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-luxury-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
              <span>{universities.length} Total</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-luxury-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-luxury-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-luxury-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title="Table View"
              >
                <TableProperties className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800/90 shadow-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by university name, fee, or English requirement (e.g. Padua, Polimi, IELTS)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-luxury-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-italia-green focus:ring-1 focus:ring-italia-green transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="md:col-span-4 flex items-center bg-luxury-950/80 p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-all ${
                  selectedStatus === 'all' 
                    ? 'bg-luxury-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('open')}
                className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selectedStatus === 'open' 
                    ? 'bg-italia-green text-white shadow-green-glow' 
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                Open
              </button>
              <button
                onClick={() => setSelectedStatus('upcoming')}
                className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selectedStatus === 'upcoming' 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Upcoming
              </button>
            </div>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
          <span>
            Showing <strong className="text-white">{filteredUniversities.length}</strong> of {universities.length} universities
          </span>
          {(searchQuery || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
              className="text-italia-green hover:underline flex items-center gap-1"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredUniversities.length === 0 && (
          <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-1">No universities found matching criteria</h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
              className="mt-3 px-4 py-2 text-xs font-semibold bg-italia-green text-white rounded-lg"
            >
              Show All Universities
            </button>
          </div>
        )}

        {/* 1. TABLE VIEW */}
        {viewMode === 'table' && filteredUniversities.length > 0 && (
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-luxury-950/70 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-luxury-950 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="p-4">University Name</th>
                    <th className="p-4">Admission Fees</th>
                    <th className="p-4">English Certificate Requirement</th>
                    <th className="p-4">Opening Date</th>
                    <th className="p-4">Deadline Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUniversities.map((uni) => {
                    const openInfo = getOpeningDateDisplay(uni.openingDate);
                    const deadInfo = getDeadlineDisplay(uni.deadline);
                    const countdown = getCountdownTimer(uni.deadline);

                    return (
                      <tr key={uni.id} className="hover:bg-luxury-800/30 transition-colors">
                        <td className="p-4 font-bold text-white text-sm">
                          {uni.name}
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold px-2.5 py-1 rounded-md border text-xs ${
                            uni.admissionFee === 'No Fee' 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                              : 'bg-luxury-900 text-slate-200 border-slate-700'
                          }`}>
                            {uni.admissionFee}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-200">
                          {uni.englishRequirement}
                        </td>
                        <td className="p-4">
                          <span className={openInfo.isTbd ? 'text-slate-400 italic' : 'text-slate-200'}>
                            {openInfo.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${deadInfo.isTbd ? 'text-slate-400 italic font-normal' : 'text-rose-300'}`}>
                              {deadInfo.text}
                            </span>
                            {countdown && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0">
                                {countdown.label}
                              </span>
                            )}
                          </div>
                        </td>
                      <td className="p-4">
                        {uni.status === 'Open' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 text-italia-green" />
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Upcoming
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onApplyWithUniversity(uni.name)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white rounded-lg bg-italia-green hover:bg-emerald-600 shadow-sm transition-all inline-flex items-center gap-1"
                        >
                          <span>Apply</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. GRID CARD VIEW */}
        {viewMode === 'grid' && filteredUniversities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((uni) => {
              const isOpen = uni.status === 'Open';
              const openInfo = getOpeningDateDisplay(uni.openingDate);
              const deadInfo = getDeadlineDisplay(uni.deadline);
              const countdown = getCountdownTimer(uni.deadline);

              return (
                <div
                  key={uni.id}
                  className="group rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between hover:border-italia-green/50 transition-all duration-300"
                >
                  {/* Top Tricolor Accent Line on Hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-italia-green via-white/50 to-italia-red opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    {/* Header: Status Badge & Admission Fee */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      {isOpen ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-italia-green" />
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Upcoming
                        </span>
                      )}

                      {/* Admission Fee */}
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-luxury-900 text-slate-200 border border-slate-700/80">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fee: <strong className={uni.admissionFee === 'No Fee' ? 'text-emerald-400' : 'text-white'}>{uni.admissionFee}</strong></span>
                      </span>
                    </div>

                    {/* University Name */}
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-4 font-display min-h-[56px] flex items-center">
                      {uni.name}
                    </h3>

                    {/* Information Box displaying strictly the required fields */}
                    <div className="p-4 rounded-xl bg-luxury-950/80 border border-slate-800/90 space-y-3">
                      
                      {/* English Certificate Requirement */}
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                          <FileCheck className="w-3.5 h-3.5 text-italia-green" />
                          English Req:
                        </span>
                        <span className="font-semibold text-right text-slate-200">
                          {uni.englishRequirement}
                        </span>
                      </div>

                      {/* Opening Date */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/70">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          Opening Date:
                        </span>
                        <span className={`font-medium ${openInfo.isTbd ? 'text-slate-400 italic' : 'text-slate-300'}`}>
                          {openInfo.text}
                        </span>
                      </div>

                      {/* Deadline Date */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/70">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-italia-red" />
                          Deadline:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${deadInfo.isTbd ? 'text-slate-400 italic font-normal' : 'text-rose-300'}`}>
                            {deadInfo.text}
                          </span>
                          {countdown && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              {countdown.label}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card Footer: Apply CTA */}
                  <div className="px-6 py-4 bg-luxury-900/60 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => onApplyWithUniversity(uni.name)}
                      className="w-full py-2 text-xs font-bold text-white rounded-xl bg-italia-green hover:bg-emerald-600 shadow-green-glow transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Apply Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
