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

  // Automatically and quickly pop up WhatsApp invitation for students who haven't joined yet
  useEffect(() => {
    // Only target student candidates
    if (!user || user.role === 'admin' || user.is_staff) return;

    const storageKey = `jobmela_whatsapp_joined_${user.id || user.email || 'student'}`;
    let hasJoined = false;
    try {
      hasJoined = localStorage.getItem(storageKey) === 'true';
    } catch (e) {
      hasJoined = false;
    }

    // If candidate has already joined or marked ignore, do not auto-popup
    if (hasJoined) return;

    // Check if candidate just logged in or if modal was dismissed for current session
    let justLoggedIn = false;
    let sessionDismissed = false;
    try {
      justLoggedIn =
        sessionStorage.getItem('jobmela_just_logged_in') === 'true' ||
        Boolean(location.state?.justLoggedIn);
      sessionDismissed = sessionStorage.getItem('jobmela_wa_session_dismissed') === 'true';
    } catch (e) {
      // ignore storage access errors
    }

    // If candidate just logged in, clear session dismissal to guarantee prompt
    if (justLoggedIn) {
      try {
        sessionStorage.removeItem('jobmela_just_logged_in');
        sessionStorage.removeItem('jobmela_wa_session_dismissed');
      } catch (e) {}
      sessionDismissed = false;
    }

    // When candidate opens or logs in, pop up quickly (200ms delay for smooth layout mount)
    if (!sessionDismissed) {
      const timer = setTimeout(() => {
        setIsWhatsAppModalOpen(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [user, location.state]);

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
                onClick={() => setIsWhatsAppModalOpen(true)}
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
                onClick={() => setIsRequirementsModalOpen(true)}
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
                onClick={() => setIsGuideModalOpen(true)}
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

      {/* Official Job Mela Requirements Modal (Loaded dynamically from Admin Portal) */}
      <RequirementsModal
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
      />

      {/* Official Job Mela Student WhatsApp Popup Modal */}
      <StudentWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenRequirements={() => setIsRequirementsModalOpen(true)}
        user={user}
      />

      {/* Official Company Application Guide Modal */}
      <CompanyApplicationGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenRequirements={() => setIsRequirementsModalOpen(true)}
      />
    </div>
  );
};

export default StudentLayout;
