import React, { useEffect, useState } from 'react';
import { X, ExternalLink, CheckCircle2, BellRing, Sparkles, ShieldCheck } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_GROUP_URL } from '../utils/constants';

/**
 * StudentWhatsAppModal
 * 
 * Pops up quickly when students log in or access the Student Portal.
 * Reminds candidates to join the official Job Mela WhatsApp group if not joined,
 * and allows them to easily ignore or dismiss if already joined.
 */
const StudentWhatsAppModal = ({
  isOpen,
  onClose,
  user = null,
  whatsappUrl = WHATSAPP_GROUP_URL,
}) => {
  const [hasClickedJoin, setHasClickedJoin] = useState(false);

  // Derive per-student storage key
  const storageKey = user
    ? `jobmela_whatsapp_joined_${user.id || user.email || 'student'}`
    : 'jobmela_whatsapp_joined_student';

  // Keyboard accessibility (ESC to close) and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle clicking "Join WhatsApp Group"
  const handleJoinClick = () => {
    setHasClickedJoin(true);
    // Mark as joined in localStorage
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {
      console.warn('Could not save WhatsApp join preference to localStorage', e);
    }

    // Open WhatsApp group link in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Close modal smoothly after user opens WhatsApp
    setTimeout(() => {
      onClose?.();
      setHasClickedJoin(false);
    }, 800);
  };

  // Handle clicking "Already Joined / Ignore"
  const handleAlreadyJoined = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {
      console.warn('Could not save WhatsApp preference', e);
    }
    onClose?.();
  };

  // Handle dismiss via X or backdrop (session dismissal)
  const handleDismiss = () => {
    try {
      sessionStorage.setItem('jobmela_wa_session_dismissed', 'true');
    } catch (e) {
      // ignore session storage errors
    }
    onClose?.();
  };

  return (
    <div
      className="student-wa-modal-backdrop"
      onClick={handleDismiss}
      role="presentation"
    >
      <div
        className="student-wa-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-wa-modal-title"
        id="student-whatsapp-announcement-modal"
      >
        {/* Header with Dark Premium Green / Slate Gradient */}
        <div className="student-wa-modal-header">
          {/* Close button */}
          <button
            type="button"
            className="student-wa-close-btn"
            onClick={handleDismiss}
            aria-label="Close modal"
            id="close-whatsapp-modal-btn"
            title="Close modal"
          >
            <X size={18} />
          </button>

          {/* Glowing Animated WhatsApp Badge */}
          <div className="student-wa-avatar-wrap">
            <span className="whatsapp-pulse-ring" aria-hidden="true" />
            <div className="student-wa-avatar-icon">
              <WhatsAppIcon size={36} color="#ffffff" />
            </div>
          </div>

          <div className="student-wa-badge">
            <Sparkles size={13} /> Official Student Community
          </div>

          <h2 id="student-wa-modal-title" className="student-wa-modal-title">
            Join Official WhatsApp Group
          </h2>
          <p className="student-wa-modal-subtitle">
            TKRCET Mega Job Mela 2026 • Real-Time Candidate Alerts
          </p>
        </div>

        {/* Modal Body */}
        <div className="student-wa-modal-body">
          {/* Main Notice Callout */}
          <div className="student-wa-callout">
            <div className="student-wa-callout-header">
              <BellRing size={16} /> Important Notice for Candidates
            </div>
            <div className="student-wa-callout-main">
              Join WhatsApp group if not joined.
            </div>
            <p className="student-wa-callout-note">
              👉 If you have <strong>already joined</strong>, please ignore this message.
            </p>
          </div>

          {/* Context & Value Points */}
          <div className="student-wa-highlights">
            <div className="student-wa-highlight-item">
              <span className="student-wa-highlight-dot">✓</span>
              <span><strong>Instant interview calls</strong> &amp; room allocation announcements</span>
            </div>
            <div className="student-wa-highlight-item">
              <span className="student-wa-highlight-dot">✓</span>
              <span><strong>Company shortlist alerts</strong> &amp; on-spot offer updates</span>
            </div>
            <div className="student-wa-highlight-item">
              <span className="student-wa-highlight-dot">✓</span>
              <span><strong>Document verification</strong> &amp; coordinator schedule guidance</span>
            </div>
          </div>

          {/* Action Options */}
          <div className="student-wa-actions">
            {/* 1. Join WhatsApp Group Button */}
            <button
              type="button"
              className="student-wa-btn-join"
              onClick={handleJoinClick}
              id="join-whatsapp-group-btn"
              title="Click to open official WhatsApp group"
            >
              <WhatsAppIcon size={22} color="#ffffff" />
              <span>
                {hasClickedJoin ? 'Opening WhatsApp Group...' : 'Join WhatsApp Group'}
              </span>
              <ExternalLink size={17} />
            </button>

            {/* 2. Already Joined / Ignore Option */}
            <button
              type="button"
              className="student-wa-btn-ignore"
              onClick={handleAlreadyJoined}
              id="already-joined-whatsapp-btn"
              title="Click if you have already joined the WhatsApp group"
            >
              <CheckCircle2 size={17} color="#16a34a" />
              <span>Already Joined • Ignore This Message</span>
            </button>
          </div>

          <p className="student-wa-footer-text">
            Official group strictly for registered Job Mela participants. You can also re-open or access this link anytime from the green WhatsApp button on your screen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentWhatsAppModal;
