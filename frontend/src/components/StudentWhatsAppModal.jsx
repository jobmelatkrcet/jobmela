import React, { useEffect, useState } from 'react';
import { X, ExternalLink, CheckCircle2, BellRing, Sparkles, BookOpen } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_GROUP_URL } from '../utils/constants';

/**
 * StudentWhatsAppModal
 * 
 * Compact official notification modal prompting students to join the official
 * WhatsApp group if not joined, dismiss if already joined, and easily view
 * the "How to Apply for Companies" guide.
 */
const StudentWhatsAppModal = ({
  isOpen,
  onClose,
  onOpenGuide,
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
        className="student-wa-modal-card compact-wa-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-wa-modal-title"
        id="student-whatsapp-announcement-modal"
      >
        {/* Compact Header */}
        <div className="student-wa-modal-header compact-wa-header">
          {/* Close button */}
          <button
            type="button"
            className="student-wa-close-btn"
            onClick={handleDismiss}
            aria-label="Close modal"
            id="close-whatsapp-modal-btn"
            title="Close modal"
          >
            <X size={16} />
          </button>

          {/* Glowing Animated WhatsApp Badge */}
          <div className="student-wa-avatar-wrap compact-wa-avatar">
            <span className="whatsapp-pulse-ring" aria-hidden="true" />
            <div className="student-wa-avatar-icon">
              <WhatsAppIcon size={26} color="#ffffff" />
            </div>
          </div>

          <div className="student-wa-badge">
            <Sparkles size={11} /> Official Community
          </div>

          <h2 id="student-wa-modal-title" className="student-wa-modal-title">
            Join Official WhatsApp Group
          </h2>
          <p className="student-wa-modal-subtitle">
            TKRCET Mega Job Mela 2026 • Real-Time Alerts
          </p>
        </div>

        {/* Modal Body */}
        <div className="student-wa-modal-body compact-wa-body">
          {/* Main Notice Callout */}
          <div className="student-wa-callout compact-wa-callout">
            <div className="student-wa-callout-header">
              <BellRing size={14} /> Notice for Candidates
            </div>
            <div className="student-wa-callout-main">
              Join WhatsApp group if not joined.
            </div>
            <p className="student-wa-callout-note">
              👉 If you have <strong>already joined</strong>, please ignore this message.
            </p>
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
              <WhatsAppIcon size={19} color="#ffffff" />
              <span>
                {hasClickedJoin ? 'Opening WhatsApp...' : 'Join WhatsApp Group'}
              </span>
              <ExternalLink size={15} />
            </button>

            {/* 2. How to Apply for Companies Guide Button */}
            {onOpenGuide && (
              <button
                type="button"
                className="student-wa-btn-guide"
                onClick={() => {
                  onClose?.();
                  onOpenGuide();
                }}
                id="wa-modal-how-to-apply-btn"
                title="View step-by-step company application walkthrough"
              >
                <BookOpen size={16} color="#0284c7" />
                <span>How to Apply for Companies</span>
              </button>
            )}

            {/* 3. Already Joined / Ignore Option */}
            <button
              type="button"
              className="student-wa-btn-ignore"
              onClick={handleAlreadyJoined}
              id="already-joined-whatsapp-btn"
              title="Click if you have already joined the WhatsApp group"
            >
              <CheckCircle2 size={15} color="#16a34a" />
              <span>Already Joined • Ignore This Message</span>
            </button>
          </div>

          <p className="student-wa-footer-text">
            Official alerts strictly for Job Mela participants.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentWhatsAppModal;
