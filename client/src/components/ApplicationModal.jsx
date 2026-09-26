import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, ChevronLeft, Upload, FileText, Trash2, Sparkles, Building, AlertCircle, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UNIVERSITIES_DATA, WILAYAS_ALGERIA } from '../data/universitiesData';
import { sendEmailJSNotification } from '../services/emailjs';

export default function ApplicationModal({ isOpen, onClose, preselectedUni, onApplicationCreated }) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studyLevel: 'Master',
    field: 'Computer Science & Artificial Intelligence',
    language: 'English',
    universities: preselectedUni ? [preselectedUni] : ['University of Padua'],
    fullName: '',
    email: '',
    phone: '+213 ',
    wilaya: '16 - Alger',
    gpa: '',
    bacYear: '2023',
    currentDegree: '',
    notes: ''
  });

  // Attached files state
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileError, setFileError] = useState('');

  const studyFields = [
    "Computer Science & Artificial Intelligence",
    "Data Science & Analytics",
    "Mechanical & Automotive Engineering",
    "Civil & Environmental Engineering",
    "Biomedical Engineering & Biotech",
    "Medicine & Surgery (IMAT Track)",
    "Business Administration & Management",
    "Economics & Finance",
    "Architecture & Urban Design",
    "International Relations & Global Studies",
    "Other Academic Specialization"
  ];

  const handleUniversityToggle = (uniName) => {
    setFormData(prev => {
      const exists = prev.universities.includes(uniName);
      if (exists) {
        if (prev.universities.length === 1) return prev; // keep at least 1
        return { ...prev, universities: prev.universities.filter(u => u !== uniName) };
      } else {
        if (prev.universities.length >= 3) {
          return { ...prev, universities: [prev.universities[1], prev.universities[2], uniName] };
        }
        return { ...prev, universities: [...prev.universities, uniName] };
      }
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setFileError('');
    const newAttachments = [];

    for (const f of files) {
      if (f.size > 20 * 1024 * 1024) {
        setFileError(`File ${f.name} exceeds 20MB limit.`);
        continue;
      }
      newAttachments.push({
        file: f,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'Document'
      });
    }

    setAttachedFiles(prev => [...prev, ...newAttachments]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build FormData for multipart upload
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('wilaya', formData.wilaya);
      data.append('studyLevel', formData.studyLevel);
      data.append('field', formData.field);
      data.append('language', formData.language);
      data.append('gpa', formData.gpa);
      data.append('bacYear', formData.bacYear);
      data.append('currentDegree', formData.currentDegree);
      data.append('universities', JSON.stringify(formData.universities));
      data.append('notes', formData.notes);

      // Append physical files
      attachedFiles.forEach(item => {
        if (item.file) {
          data.append('documents', item.file);
        }
      });

      // Provide metadata fallback if no real files attached
      if (attachedFiles.length === 0) {
        data.append('documentsMeta', JSON.stringify([
          { name: "Academic_Transcripts_Dossier.pdf", size: "2.1 MB", uploadedAt: new Date().toISOString() },
          { name: "Passport_BioPage.pdf", size: "1.1 MB", uploadedAt: new Date().toISOString() }
        ]));
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: data
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submission failed');

      // Dispatch EmailJS notification directly to italyoneway@gmail.com with applicant email embedded
      const dossierSummaryMessage = [
        `NEW APPLICATION DOSSIER: ${json.application?.id || 'Pending'}`,
        `==================================================`,
        `APPLICANT EMAIL: ${formData.email}`,
        `REPLY-TO: ${formData.email}`,
        `FULL NAME: ${formData.fullName}`,
        `PHONE / WHATSAPP: ${formData.phone}`,
        `WILAYA: ${formData.wilaya}`,
        `--------------------------------------------------`,
        `ACADEMIC TARGET & BACKGROUND:`,
        `- Study Level: ${formData.studyLevel}`,
        `- Field of Study: ${formData.field}`,
        `- Current Degree: ${formData.currentDegree} (Baccalaureate: ${formData.bacYear})`,
        `- GPA / Mention: ${formData.gpa || 'N/A'}`,
        `- Target Italian Universities: ${Array.isArray(formData.universities) ? formData.universities.join(', ') : formData.universities}`,
        `--------------------------------------------------`,
        `APPLICANT NOTES / INQUIRY:`,
        formData.notes || 'None provided',
        `==================================================`,
        `DIRECT REPLY EMAIL: ${formData.email}`
      ].join('\n');

      sendEmailJSNotification({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        wilaya: formData.wilaya,
        studyLevel: formData.studyLevel,
        field: formData.field,
        universities: formData.universities,
        notes: formData.notes,
        message: dossierSummaryMessage,
        trackingId: json.application?.id
      }).catch(err => {
        console.warn('[EmailJS Notification Warning]', err);
      });

      setSubmissionResult(json.application);
      if (onApplicationCreated) onApplicationCreated(json.application);

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      console.error(err);
      alert(err.message || 'Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTracking = () => {
    if (submissionResult?.id) {
      navigator.clipboard.writeText(submissionResult.id);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-luxury-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Italian Tricolor Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-italia-green via-white to-italia-red" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-luxury-950/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-italia-green/20 text-italia-green border border-italia-green/30">
                Official Intake 2026/2027
              </span>
              <span className="text-xs text-slate-400">Algerian Student Portal</span>
            </div>
            <h3 className="text-xl font-bold text-white font-display mt-0.5">
              University & Visa Application Dossier
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-luxury-800 hover:bg-luxury-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Indicator */}
        {!submissionResult && (
          <div className="px-6 py-3 bg-luxury-950/40 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className={currentStep >= 1 ? 'text-italia-green font-bold' : ''}>1. Academic Goal</span>
              <span className="text-slate-700">›</span>
              <span className={currentStep >= 2 ? 'text-italia-green font-bold' : ''}>2. Universities</span>
              <span className="text-slate-700">›</span>
              <span className={currentStep >= 3 ? 'text-italia-green font-bold' : ''}>3. Personal Details</span>
              <span className="text-slate-700">›</span>
              <span className={currentStep >= 4 ? 'text-italia-green font-bold' : ''}>4. Documents</span>
              <span className="text-slate-700">›</span>
              <span className={currentStep >= 5 ? 'text-italia-green font-bold' : ''}>5. Review</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* SUCCESS SCREEN */}
          {submissionResult ? (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-italia-green flex items-center justify-center mx-auto shadow-green-glow">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white font-display mb-1">
                  Application Dossier Registered!
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Congratulations, <strong className="text-white">{submissionResult.fullName}</strong>. Your file has been assigned to an OnWay Italy academic counselor.
                </p>
              </div>

              {/* Tracking ID Badge */}
              <div className="p-4 rounded-2xl bg-luxury-950 border border-slate-800 max-w-sm mx-auto">
                <span className="text-xs text-slate-400 block mb-1">Your Tracking Code:</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-mono font-bold text-emerald-400 tracking-wider">
                    {submissionResult.id}
                  </span>
                  <button
                    onClick={copyTracking}
                    className="p-1.5 rounded-lg bg-luxury-800 text-slate-300 hover:text-white border border-slate-700"
                    title="Copy tracking code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-italia-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Save this code to check your admission & visa progress</span>
              </div>

              {/* Next Steps Card */}
              <div className="p-4 rounded-xl bg-luxury-850 border border-slate-800 text-left max-w-md mx-auto text-xs space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Next Steps for Your Dossier:</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 pl-4 list-disc">
                  <li>Our counselor will review your transcripts against MUR admission tables.</li>
                  <li>You will receive a WhatsApp message at <strong className="text-white">{submissionResult.phone}</strong>.</li>
                  <li>Assigned Consulate: <strong className="text-emerald-400">{submissionResult.consulate}</strong>.</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-bold text-white bg-italia-green hover:bg-emerald-600 rounded-xl shadow-green-glow"
                >
                  Done & Back to Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Academic Track */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Target Degree Level in Italy
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, studyLevel: 'Master' })}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          formData.studyLevel === 'Master'
                            ? 'bg-italia-green/15 border-italia-green text-white shadow-green-glow'
                            : 'bg-luxury-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-sm font-bold mb-1">Master's Degree (Laurea Magistrale)</div>
                        <p className="text-xs text-slate-400">2-Year programs for Algerian Licence / Bachelor graduates.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, studyLevel: 'Bachelor' })}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          formData.studyLevel === 'Bachelor'
                            ? 'bg-italia-green/15 border-italia-green text-white shadow-green-glow'
                            : 'bg-luxury-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-sm font-bold mb-1">Bachelor's Degree (Laurea Triennale)</div>
                        <p className="text-xs text-slate-400">3-Year programs for Algerian Baccalaureate holders.</p>
                      </button>
                    </div>
                  </div>

                  {/* Academic Field */}
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Intended Field of Study
                    </label>
                    <select
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green"
                    >
                      {studyFields.map((f, i) => (
                        <option key={i} value={f} className="bg-luxury-900">{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language of Instruction */}
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Instruction Medium
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, language: 'English' })}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          formData.language === 'English'
                            ? 'bg-luxury-800 border-italia-green text-emerald-400'
                            : 'bg-luxury-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        🇬🇧 100% English Taught (Most Popular)
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, language: 'Italian' })}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          formData.language === 'Italian'
                            ? 'bg-luxury-800 border-italia-green text-emerald-400'
                            : 'bg-luxury-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        🇮🇹 Italian Taught (B2 Level)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: University Choices */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Select Up to 3 Target Universities ({formData.universities.length} / 3 selected)
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">
                    Click to select or change your priority choices from the 67 Italian public institutions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {UNIVERSITIES_DATA.map((uni) => {
                      const isSelected = formData.universities.includes(uni.name);
                      return (
                        <div
                          key={uni.id}
                          onClick={() => handleUniversityToggle(uni.name)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-italia-green/15 border-italia-green text-white shadow-sm'
                              : 'bg-luxury-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">{uni.name}</div>
                            <div className="text-[10px] text-slate-400">{uni.city} • {uni.region}</div>
                          </div>
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-italia-green text-white' : 'border border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Personal Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Full Name (as written on Algerian Passport) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rayane Boumaza"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rayane@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Phone / WhatsApp (+213) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+213 550 12 34 56"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Wilaya of Residence *
                      </label>
                      <select
                        value={formData.wilaya}
                        onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                        className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green"
                      >
                        {WILAYAS_ALGERIA.map((w, i) => (
                          <option key={i} value={w} className="bg-luxury-900">{w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                        GPA / Baccalaureate Mention
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 14.50 / 20 or Mention Bien"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Current Academic Level / Institution in Algeria
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Licence 3 Informatique (USTHB Alger)"
                      value={formData.currentDegree}
                      onChange={(e) => setFormData({ ...formData, currentDegree: e.target.value })}
                      className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Document Upload */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Upload Supporting Documents (Optional now, can submit later)
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Accepts PDF or Images (Passport scan, Relevés de notes, Diplôme / Bac, CV). Max 20MB per file.
                    </p>

                    {/* Drag and Drop Zone */}
                    <div className="relative border-2 border-dashed border-slate-700 hover:border-italia-green rounded-2xl p-6 text-center bg-luxury-950/60 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <Upload className="w-8 h-8 text-italia-green mb-2" />
                        <span className="text-xs font-semibold text-white">Click or drag files here to upload</span>
                        <span className="text-[11px] text-slate-500 mt-1">PDF, JPG, PNG up to 20MB</span>
                      </div>
                    </div>

                    {fileError && (
                      <p className="text-xs text-rose-400 mt-2">{fileError}</p>
                    )}
                  </div>

                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-300 block">Attached Documents ({attachedFiles.length}):</span>
                      {attachedFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-luxury-950 border border-slate-800 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-italia-green shrink-0" />
                            <span className="text-slate-200 truncate">{file.name}</span>
                            <span className="text-slate-500 text-[10px]">({file.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Additional notes */}
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Counselor Notes or Special Inquiries
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Need assistance with CIMEA comparability or DSU scholarship deadline..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-3 bg-luxury-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-italia-green"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Final Review */}
              {currentStep === 5 && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-luxury-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-white flex items-center justify-between">
                      <span>Dossier Summary</span>
                      <span className="text-emerald-400 text-xs">Ready to Dispatch</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Applicant:</span>
                        <strong className="text-white">{formData.fullName || 'Not specified'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">WhatsApp:</span>
                        <strong className="text-white">{formData.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Email:</span>
                        <strong className="text-white">{formData.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Wilaya:</span>
                        <strong className="text-white">{formData.wilaya}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Study Level:</span>
                        <strong className="text-emerald-400">{formData.studyLevel} ({formData.language})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Documents Attached:</span>
                        <strong className="text-white">{attachedFiles.length} file(s)</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block mb-1">Target Universities:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.universities.map((u, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-luxury-800 text-slate-200 border border-slate-700">
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-luxury-950 border border-slate-800 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 3) {
                        if (!formData.fullName || !formData.email || !formData.phone) {
                          alert('Please complete your full name, email, and phone number.');
                          return;
                        }
                      }
                      setCurrentStep(prev => prev + 1);
                    }}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-italia-green hover:bg-emerald-600 rounded-xl shadow-green-glow flex items-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="px-8 py-3 text-xs font-bold text-white bg-gradient-to-r from-italia-green to-emerald-600 hover:from-emerald-600 hover:to-italia-green rounded-xl shadow-green-glow flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Transmitting Dossier...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Final Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
