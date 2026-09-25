import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, User, Phone, MapPin, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendEmailJSNotification } from '../services/emailjs';
import { WILAYAS_ALGERIA } from '../data/universitiesData';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    wilaya: '16 - Alger',
    topic: 'Master Admissions 2026/2027',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const topics = [
    'Master Admissions 2026/2027',
    'Bachelor Admissions 2026/2027',
    'Universitaly Pre-enrolment Audit',
    'Italian Visa File (VFS Algiers)',
    'DSU & Scholarship Guidance',
    'Other Academic Inquiry'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendEmailJSNotification({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        wilaya: formData.wilaya,
        studyLevel: formData.topic,
        message: formData.message,
        notes: `Topic: ${formData.topic}\n\nMessage:\n${formData.message}`
      });

      if (!res.success) {
        throw new Error(res.error?.text || 'Failed to dispatch email. Please try again or email us directly.');
      }

      setIsSubmitted(true);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      wilaya: '16 - Alger',
      topic: 'Master Admissions 2026/2027',
      message: ''
    });
    setIsSubmitted(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleReset}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-luxury-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        
        {/* Italian Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-italia-green via-white to-italia-red" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-italia-green/10 border border-italia-green/30 flex items-center justify-center text-italia-green">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Contact Admissions Advisory</h3>
              <p className="text-xs text-slate-400">Direct message to <span className="text-emerald-400 font-semibold">italyoneway@gmail.com</span></p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-italia-green" />
            </div>
            <h4 className="text-xl font-bold text-white font-display">Message Sent Successfully!</h4>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your inquiry has been emailed directly to our admissions team at <strong className="text-emerald-400">italyoneway@gmail.com</strong>.
            </p>
            <div className="p-3 bg-luxury-950 rounded-xl border border-slate-800 text-xs text-slate-400 max-w-sm mx-auto">
              An OnWay Italy advisor will review your request and reach out within 24 hours.
            </div>
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-italia-green text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-green-glow"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Yacine Benali"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-luxury-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-italia-green focus:ring-1 focus:ring-italia-green transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="yacine@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-luxury-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-italia-green focus:ring-1 focus:ring-italia-green transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+213 6XX XX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-luxury-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-italia-green focus:ring-1 focus:ring-italia-green transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Wilaya & Topic Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Algerian Wilaya
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-luxury-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green transition-all appearance-none cursor-pointer"
                  >
                    {WILAYAS_ALGERIA.map((w) => (
                      <option key={w} value={w} className="bg-luxury-900 text-white">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Topic of Inquiry
                </label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2.5 bg-luxury-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-italia-green transition-all appearance-none cursor-pointer"
                >
                  {topics.map((t) => (
                    <option key={t} value={t} className="bg-luxury-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Message / Academic Dossier Details <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  placeholder="Provide your background, target universities (e.g. Padua, Polimi), target degree, or questions about Universitaly and consular visa..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 bg-luxury-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-italia-green focus:ring-1 focus:ring-italia-green transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-italia-green to-emerald-600 hover:from-emerald-600 hover:to-italia-green text-white font-bold text-sm shadow-green-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending to italyoneway@gmail.com...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message via EmailJS</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              Protected by EmailJS SSL transmission to <strong>italyoneway@gmail.com</strong>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
