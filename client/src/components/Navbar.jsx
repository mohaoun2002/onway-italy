import React, { useState, useEffect } from 'react';
import { Compass, Shield, Search, ChevronRight, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenApply, onOpenTrack, onOpenAdmin, onOpenContact }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '67 Universities', href: '#universities' },
    { name: 'Services', href: '#services' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-luxury-900/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-3' 
        : 'bg-transparent py-5'
    }`}>
      {/* Top micro Italian Tricolor stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-italia-green via-italia-white to-italia-red" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo - Sleek Minimalist Luxury */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-italia-green/10 border border-italia-green/25 flex items-center justify-center text-italia-green group-hover:text-emerald-300 group-hover:border-italia-green/45 transition-all shrink-0">
              <Compass className="w-4 h-4 text-italia-green group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1 leading-tight">
                <span className="text-xl font-bold tracking-tight text-white font-display">OnWay</span>
                <span className="text-xl font-extrabold text-italia-green tracking-tight font-display">Italy</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Universitaly & Visa Guidance
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={onOpenContact}
              className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              Contact
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Track Application */}
            <button
              onClick={onOpenTrack}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700/70 hover:border-slate-500 bg-luxury-800/60 hover:bg-luxury-700/50 transition-all flex items-center gap-1.5 shadow-sm"
              title="Track submitted application status"
            >
              <Search className="w-3.5 h-3.5 text-italia-green" />
              <span>Track Dossier</span>
            </button>

            {/* Start Application Primary CTA */}
            <button
              onClick={onOpenApply}
              className="relative group px-5 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden shadow-green-glow transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-italia-green to-emerald-600 group-hover:from-emerald-600 group-hover:to-italia-green transition-all" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
              <span className="relative flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Start Application</span>
              </span>
            </button>

            {/* Counselor / Admin toggle */}
            <button
              onClick={onOpenAdmin}
              className="p-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 border border-transparent hover:border-slate-700/60 transition-all"
              title="Counselor Admin Panel"
            >
              <Shield className="w-4 h-4 text-italia-red hover:text-italia-red-light transition-colors" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onOpenApply}
              className="px-3 py-1.5 text-xs font-bold text-white rounded-lg bg-italia-green shadow-sm"
            >
              Apply
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-3 mx-4 p-4 rounded-2xl bg-luxury-900 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 rounded-lg"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 rounded-lg"
            >
              Contact
            </button>
            <hr className="border-slate-800 my-1" />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-italia-green" />
                Track My Application
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-italia-red" />
                Counselor Admin Dashboard
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
