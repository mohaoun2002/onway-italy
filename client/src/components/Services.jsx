import React from 'react';
import { GraduationCap, Globe, Landmark, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function Services({ onOpenApply }) {
  const services = [
    {
      icon: GraduationCap,
      step: "01",
      title: "University Admission & Academic Assessment",
      badge: "Eligibility Audit",
      description: "Comprehensive evaluation of your Algerian academic dossier (Baccalaureate, Licence L1-L3, Master M1-M2). We match your GPA and credits with the top compatible Italian programs.",
      points: [
        "Credit compatibility analysis & transcript translation strategy",
        "Target application submission across up to 3 universities",
        "Assistance with English certification requirements (IELTS, Duolingo, MOI)",
        "Review and optimization of Motivation Letters and Europass CVs"
      ],
      accent: "emerald"
    },
    {
      icon: Globe,
      step: "02",
      title: "Universitaly Portal Pre-enrolment",
      badge: "Official Italian MUR",
      description: "End-to-end guidance through the mandatory Italian Ministry of Universities platform (Universitaly.it). Ensure error-free profile submission and university confirmation.",
      points: [
        "Step-by-step account setup and academic background mapping",
        "Uploading verified degree attestations and passport scans",
        "Coordination with university admission offices for approval",
        "Issuance of the official Universitaly Summary (Riepilogo) for the visa"
      ],
      accent: "teal"
    },
    {
      icon: Landmark,
      step: "03",
      title: "Consulate Visa File Preparation",
      badge: "Embassy in Algiers (VFS Global)",
      description: "Rock-solid National Study Visa (Type D) dossier preparation specifically tailored for the Italian Embassy in Algiers (VFS Global).",
      points: [
        "Proof of financial means (Blocked account / parental bank statements)",
        "Dichiarazione di Valore (DOV) or CIMEA comparability verification",
        "Schengen-compliant student health insurance & accommodation proof",
        "Mock interview training for visa appointment success"
      ],
      accent: "rose"
    }
  ];

  return (
    <section id="services" className="py-20 lg:py-28 relative">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-luxury-900/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-italia-green/10 border border-italia-green/30 text-italia-green text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Complete Algerian Student Pathway
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
            Our Dedicated 3-Stage Assistance
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            From your very first Algerian transcript review to collecting your Italian Type-D Student Visa, 
            we escort you every single step with zero guesswork.
          </p>
        </div>

        {/* Services Cards Grid - 3-column clean balanced layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div
                key={i}
                className="group relative p-8 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
              >
                {/* Micro accent top bar */}
                <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-italia-green via-slate-500 to-italia-red opacity-40 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Bar with Step & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-luxury-950 border border-slate-700/80 flex items-center justify-center text-italia-green group-hover:border-italia-green/60 transition-colors shadow-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {svc.badge}
                      </span>
                      <span className="text-xl font-display font-extrabold text-slate-600 group-hover:text-slate-400 transition-colors">
                        {svc.step}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-display group-hover:text-emerald-300 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {svc.description}
                  </p>

                  {/* Key Service Points */}
                  <ul className="space-y-2.5 mb-6">
                    {svc.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-italia-green shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA action */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500">100% Legal & Consular Verified</span>
                  <button
                    onClick={onOpenApply}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-italia-green group-hover:text-emerald-300 transition-colors"
                  >
                    <span>Include in My Application</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
