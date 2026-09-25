import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UniversityDirectory from './components/UniversityDirectory';
import Services from './components/Services';
import ApplicationModal from './components/ApplicationModal';
import TrackApplicationModal from './components/TrackApplicationModal';
import AdminDashboard from './components/AdminDashboard';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';
import { UNIVERSITIES_DATA } from './data/universitiesData';

export default function App() {
  const [universities, setUniversities] = useState(UNIVERSITIES_DATA);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [preselectedUniversity, setPreselectedUniversity] = useState('');

  // Fetch live universities from server API if available
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const res = await fetch('/api/universities');
        if (res.ok) {
          const data = await res.json();
          if (data?.universities && data.universities.length > 0) {
            setUniversities(data.universities);
          }
        }
      } catch (err) {
        // fallback gracefully to bundled data
        console.log('Using local universities dataset');
      }
    };
    loadUniversities();
  }, []);

  const handleOpenApply = (uniName = '') => {
    setPreselectedUniversity(typeof uniName === 'string' ? uniName : '');
    setApplyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-luxury-950 text-slate-100 flex flex-col selection:bg-italia-green selection:text-white">
      {/* Navigation Header */}
      <Navbar
        onOpenApply={() => handleOpenApply()}
        onOpenTrack={() => setTrackModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onOpenApply={() => handleOpenApply()}
          universityCount={universities.length}
        />

        {/* 2. Target 67 Italian Universities Directory */}
        <UniversityDirectory
          universities={universities}
          onApplyWithUniversity={handleOpenApply}
        />

        {/* 3. Core Services Breakdown */}
        <Services
          onOpenApply={() => handleOpenApply()}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenApply={() => handleOpenApply()}
        onOpenTrack={() => setTrackModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* Multi-Step Application Modal */}
      <ApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        preselectedUni={preselectedUniversity}
        onApplicationCreated={(newApp) => {
          // Can show notification if needed
        }}
      />

      {/* Direct Contact Modal (EmailJS) */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* Application Status Tracker Modal */}
      <TrackApplicationModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />

      {/* Counselor Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
}
