import React from 'react';
import { ArrowRight, Landmark } from 'lucide-react';

export default function Hero({ onOpenApply, universityCount = 67 }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-italia-green/30 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-italia-red/20 rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Grid line pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Pill Alert */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-800/80 border border-slate-700/80 backdrop-blur-md mb-8 shadow-inner animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-italia-green ring-4 ring-italia-green/30" />
            <span className="text-xs font-semibold text-slate-200">
              Universitaly 2026/2027 Admissions Open for Algerian Students 🇩🇿 ➜ 🇮🇹
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider bg-italia-red/20 text-italia-red-light font-bold px-2 py-0.5 rounded border border-italia-red/30">
              Deadlines Approaching
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.1] mb-6">
            Your Gateway to Higher Education in <br className="hidden sm:inline" />
            <span className="relative whitespace-nowrap">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-rose-400">
                Italy 🇮🇹
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-italia-green via-italia-white to-italia-red rounded-full opacity-80" />
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Specialized admission and consular visa assistance for <strong className="text-white font-semibold">Algerian scholars</strong>. 
            Secure pre-enrolment on Universitaly, and apply to all 67 top Italian universities in English.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenApply}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-italia-green to-emerald-600 hover:from-emerald-600 hover:to-italia-green shadow-green-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group"
            >
              <span>Start Application</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#universities"
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-slate-200 hover:text-white bg-luxury-800/80 hover:bg-luxury-700/80 border border-slate-700/80 hover:border-slate-500 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Landmark className="w-5 h-5 text-italia-green" />
              <span>Explore {universityCount} Universities</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
