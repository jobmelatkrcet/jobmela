import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RequirementsModal from '../components/RequirementsModal';
import WhatsAppIcon from '../components/WhatsAppIcon';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import { WHATSAPP_GROUP_URL } from '../utils/constants';

const StudentLayout = () => {
  const { user } = useAuth();
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);

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

            {/* Right: WhatsApp Group and Requirements for Job Mela Guidelines */}
            <div className="student-banner-right" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="student-whatsapp-btn"
                id="student-banner-whatsapp-btn"
                title="Join the official Job Mela WhatsApp group for live announcements and interview schedules"
              >
                <WhatsAppIcon size={17} color="#ffffff" />
                <span>Join WhatsApp Group</span>
                <span className="student-whatsapp-tag">Community ↗</span>
              </a>

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
    </div>
  );
};

export default StudentLayout;
