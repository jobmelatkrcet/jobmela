import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ClipboardList, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RequirementsModal from '../components/RequirementsModal';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import WhatsAppIcon from '../components/WhatsAppIcon';
import StudentWhatsAppModal from '../components/StudentWhatsAppModal';
import CompanyApplicationGuideModal from '../components/CompanyApplicationGuideModal';
import { WHATSAPP_CHANNEL_URL } from '../utils/constants';

const StudentLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isIntroFlow, setIsIntroFlow] = useState(false);

  // Automatically trigger sequential onboarding flow: WhatsApp -> How to Apply -> Requirements
  useEffect(() => {
    // Only target student candidates
    if (!user || user.role === 'admin' || user.is_staff) return;

    let justLoggedIn = false;
    let sequenceDismissed = false;
    try {
      justLoggedIn =
        sessionStorage.getItem('jobmela_just_logged_in') === 'true' ||
        Boolean(location.state?.justLoggedIn);
      sequenceDismissed = sessionStorage.getItem('jobmela_sequence_dismissed') === 'true';
    } catch (e) {
      // ignore storage access errors
    }

    // If candidate just logged in, reset sequence dismissal to ensure fresh walkthrough
    if (justLoggedIn) {
      try {
        sessionStorage.removeItem('jobmela_just_logged_in');
        sessionStorage.removeItem('jobmela_sequence_dismissed');
      } catch (e) {}
      sequenceDismissed = false;
    }

    // When candidate opens or logs in, initiate sequential popups (250ms delay for layout mount)
    if (!sequenceDismissed) {
      const timer = setTimeout(() => {
        setIsIntroFlow(true);
        setIsWhatsAppModalOpen(true);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [user, location.state]);

  // Step 1 -> Step 2: After WhatsApp cancel or close, pop up How to Apply
  const handleWhatsAppClose = () => {
    setIsWhatsAppModalOpen(false);
    if (isIntroFlow) {
      setTimeout(() => {
        setIsGuideModalOpen(true);
      }, 250);
    }
  };

  // Step 2 -> Step 3: After How to Apply cancel or close, pop up Candidate Requirements
  const handleGuideClose = () => {
    setIsGuideModalOpen(false);
    if (isIntroFlow) {
      setTimeout(() => {
        setIsRequirementsModalOpen(true);
      }, 250);
    }
  };

  // Step 3 Completion: Mark sequence completed
  const handleRequirementsClose = () => {
    setIsRequirementsModalOpen(false);
    setIsIntroFlow(false);
    try {
      sessionStorage.setItem('jobmela_sequence_dismissed', 'true');
    } catch (e) {}
  };

  // Manual trigger handlers from top banner (open standalone modal without forcing sequence)
  const handleBannerWhatsAppClick = () => {
    setIsIntroFlow(false);
    setIsWhatsAppModalOpen(true);
  };

  const handleBannerGuideClick = () => {
    setIsIntroFlow(false);
    setIsGuideModalOpen(true);
  };

  const handleBannerRequirementsClick = () => {
    setIsIntroFlow(false);
    setIsRequirementsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      {/* Sleek Student Welcome Strip */}
      <div className="student-banner-strip">
        <div className="app-container">
          <div className="student-banner-content">
            {/* Left: Clean Greeting */}
            <div className="student-banner-left">
              <h1 className="student-welcome-title">
                Welcome, {user?.full_name || 'Student'}!
              </h1>
            </div>

            {/* Right: Channel, Group, Requirements, How to Apply Quick Action Buttons */}
            <div
              className="student-banner-right"
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}
            >
              {/* Official WhatsApp Channel (Everyone Should Join) */}
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="student-whatsapp-channel-btn"
                id="student-banner-channel-btn"
                title="Follow official WhatsApp Channel - Everyone Should Join"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #075e54 0%, #064e3b 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(7, 94, 84, 0.35)',
                  border: '1px solid #10b981',
                }}
              >
                <WhatsAppIcon size={16} color="#ffffff" />
                <span>WhatsApp Channel</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    backgroundColor: '#f59e0b',
                    color: '#0f172a',
                    padding: '1px 6px',
                    borderRadius: 9999,
                    textTransform: 'uppercase',
                  }}
                >
                  Everyone Join ↗
                </span>
              </a>

              {/* Official WhatsApp Group (Join if Not Joined) */}
              <button
                type="button"
                onClick={handleBannerWhatsAppClick}
                className="student-whatsapp-btn"
                id="student-banner-whatsapp-btn"
                title="Click to view official WhatsApp community details"
              >
                <WhatsAppIcon size={16} color="#ffffff" />
                <span>WhatsApp Group</span>
                <span className="student-whatsapp-tag">If Not Joined ↗</span>
              </button>

              <button
                type="button"
                onClick={handleBannerRequirementsClick}
                className="requirements-trigger-btn"
                id="view-job-mela-requirements-btn"
                title="Click to view all guidelines, documents and dress code"
              >
                <ClipboardList size={16} color="#fef08a" />
                <span>Requirements for Job Mela</span>
                <span className="requirements-view-tag">View Guidelines ↗</span>
              </button>

              <button
                type="button"
                onClick={handleBannerGuideClick}
                className="student-guide-banner-btn"
                id="student-banner-guide-btn"
                title="Click to view How to Apply for Companies step-by-step guide"
              >
                <BookOpen size={16} color="#38bdf8" />
                <span>How to Apply</span>
                <span className="student-guide-tag">Guide ↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="main-content" style={{ padding: '2rem 0 4rem' }}>
        <Outlet />
      </main>

      {/* Floating Official WhatsApp Community Action Button for Student Portal */}
      <WhatsAppFloatingButton />

      <Footer />

      {/* 1. Official Job Mela Student WhatsApp Popup Modal (Step 1) */}
      <StudentWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={handleWhatsAppClose}
        onNext={handleWhatsAppClose}
        user={user}
        stepIndicator={isIntroFlow ? 'Step 1 of 3' : null}
      />

      {/* 2. Official Company Application Guide Modal (Step 2) */}
      <CompanyApplicationGuideModal
        isOpen={isGuideModalOpen}
        onClose={handleGuideClose}
        onOpenRequirements={handleGuideClose}
        stepIndicator={isIntroFlow ? 'Step 2 of 3' : null}
      />

      {/* 3. Official Job Mela Requirements Modal (Step 3) */}
      <RequirementsModal
        isOpen={isRequirementsModalOpen}
        onClose={handleRequirementsClose}
        stepIndicator={isIntroFlow ? 'Step 3 of 3 • Final Step' : null}
      />
    </div>
  );
};

export default StudentLayout;
