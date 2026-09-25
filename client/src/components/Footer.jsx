import React from 'react';
import { Mail, Globe, Shield } from 'lucide-react';

export default function Footer({ onOpenApply, onOpenTrack, onOpenAdmin, onOpenContact }) {
  return (
    <footer className="relative bg-luxury-950 border-t border-slate-800/80 pt-16 pb-12 overflow-hidden text-xs">
      {/* Micro tricolor top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-italia-green via-white to-italia-red" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🇮🇹</span>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  OnWay <span className="text-italia-green font-extrabold">Italy</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Algerian-Italian Academic Admissions Gateway</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Student Navigation</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#universities" className="hover:text-italia-green transition-colors">67 Italian Universities</a></li>
              <li><a href="#services" className="hover:text-italia-green transition-colors">Services & Admission</a></li>
              <li><button onClick={onOpenTrack} className="hover:text-white transition-colors text-left">Track Dossier</button></li>
            </ul>
          </div>

          {/* Consular Authority */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Consular Authority</h4>
            <div className="space-y-2.5 text-slate-400">
              <div>
                <strong className="text-white block">Embassy of Italy in Algiers</strong>
                <span>VFS Global Ben Aknoun, Algiers</span>
              </div>
              <div>
                <strong className="text-white block">Universitaly Coordination</strong>
                <span>MUR Rome, Italy</span>
              </div>
            </div>
          </div>

          {/* Direct Assistance */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Contact Advisory</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-italia-green shrink-0" />
                <a href="mailto:italyoneway@gmail.com" className="hover:text-white transition-colors">italyoneway@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-italia-green shrink-0" />
                <span>www.onway-italy.com</span>
              </div>
              <div className="pt-1">
                <button
                  onClick={onOpenContact}
                  className="text-italia-green hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  Send Direct Message →
                </button>
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="text-slate-500 hover:text-italia-red text-[11px] underline flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-italia-red" />
                  Counselor Admin Panel
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
          <p>© 2026 OnWay Italy. All rights reserved. Dedicated to Algerian Higher Education Excellence.</p>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Built with</span>
            <span className="text-italia-red">❤</span>
            <span>for Algeria 🇩🇿 & Italy 🇮🇹</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
