import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  BellRing,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_CHANNEL_URL } from '../utils/constants';

/**
 * StudentWhatsAppModal
 * 
 * Official notification modal prompting candidates to:
 * Follow the official WhatsApp Channel (Everyone should join!)
 * Clean, focused popup that delivers real-time job mela announcements.
 */
const StudentWhatsAppModal = ({
  isOpen,
  onClose,
  onNext = null,
  user = null,
  whatsappChannelUrl = WHATSAPP_CHANNEL_URL,
  stepIndicator = 'Step 1 of 3',
}) => {
  const [hasClickedChannel, setHasClickedChannel] = useState(false);

  // Derive per-student storage key
  const storageKey = user
    ? `jobmela_whatsapp_channel_followed_${user.id || user.email || 'student'}`
    : 'jobmela_whatsapp_channel_followed_student';

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

  // Handle clicking "Follow WhatsApp Channel" (Everyone should join)
  const handleChannelClick = () => {
    setHasClickedChannel(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {
      console.warn('Could not save WhatsApp preference', e);
    }
    window.open(whatsappChannelUrl || WHATSAPP_CHANNEL_URL, '_blank', 'noopener,noreferrer');
  };

  // Handle clicking "Already Following Channel / Dismiss"
  const handleAlreadyFollowing = () => {
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
        style={{ maxWidth: 460 }}
      >
        {/* Header */}
        <div className="student-wa-modal-header compact-wa-header">
          {/* Close button */}
          <button
            type="button"
            className="student-wa-close-btn"
            onClick={handleDismiss}
            aria-label="Close modal"
            id="close-whatsapp-modal-btn"
            title="Close / Cancel"
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
            <Sparkles size={11} /> {stepIndicator ? `${stepIndicator} • Official WhatsApp Channel` : 'Official Updates'}
          </div>

          <h2 id="student-wa-modal-title" className="student-wa-modal-title" style={{ fontSize: '1.28rem' }}>
            Official WhatsApp Channel
          </h2>
          <p className="student-wa-modal-subtitle">
            TKRCET Mega Job Mela 2026 • Live Announcements &amp; Guidance
          </p>
        </div>

        {/* Modal Body */}
        <div className="student-wa-modal-body compact-wa-body" style={{ gap: '0.85rem' }}>
          {/* Main Notice Callout */}
          <div className="student-wa-callout compact-wa-callout" style={{ padding: '0.85rem 1rem' }}>
            <div className="student-wa-callout-header" style={{ color: '#065f46', marginBottom: '0.45rem' }}>
              <BellRing size={14} /> Official Instructions for Candidates
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.83rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <span style={{ backgroundColor: '#075e54', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: 4, marginTop: 1, whiteSpace: 'nowrap' }}>
                  EVERYONE JOIN
                </span>
                <span style={{ color: '#064e3b', lineHeight: 1.4 }}>
                  <strong>WhatsApp Channel:</strong> All candidates must follow this official channel to receive instant notifications about company arrivals, interview schedules, round shortlists, and spot allocations during the Job Mela.
                </span>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="student-wa-actions" style={{ gap: '0.55rem' }}>
            {/* 1. Official WhatsApp Channel (Everyone should join) */}
            <button
              type="button"
              className="student-wa-btn-join"
              onClick={handleChannelClick}
              id="follow-whatsapp-channel-btn"
              title="Click to follow the official WhatsApp Channel"
              style={{
                background: 'linear-gradient(135deg, #075e54 0%, #064e3b 100%)',
                boxShadow: '0 4px 14px rgba(7, 94, 84, 0.35)',
                padding: '0.75rem 1.15rem',
                fontSize: '0.92rem',
              }}
            >
              <WhatsAppIcon size={18} color="#ffffff" />
              <span style={{ flex: 1, textAlign: 'left' }}>
                {hasClickedChannel ? 'Channel Opened' : 'Follow WhatsApp Channel'}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                  padding: '2px 7px',
                  borderRadius: 9999,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Everyone Join ↗
              </span>
            </button>

            {/* 2. Continue / Next: How to Apply Guide */}
            <button
              type="button"
              className="student-wa-btn-guide wa-modal-continue-btn"
              onClick={() => {
                if (onNext) {
                  onNext();
                } else {
                  onClose?.();
                }
              }}
              id="wa-modal-how-to-apply-btn"
              data-action="wa-modal-continue-btn"
              title="Proceed to How to Apply Guide"
              style={{
                backgroundColor: '#0284c7',
                borderColor: '#0284c7',
                color: '#ffffff',
                padding: '0.7rem 1.15rem',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <span style={{ flex: 1, textAlign: 'left' }}>Next: How to Apply Guide</span>
              <ArrowRight size={16} />
            </button>

            {/* 3. Already Following Channel / Dismiss Option */}
            <button
              type="button"
              className="student-wa-btn-ignore"
              onClick={handleAlreadyFollowing}
              id="already-joined-whatsapp-btn"
              title="Click if you are already following the WhatsApp channel"
              style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
            >
              <CheckCircle2 size={14} color="#16a34a" />
              <span>Already Following Channel • Close</span>
            </button>
          </div>

          <p className="student-wa-footer-text">
            Official announcements strictly for TKRCET Mega Job Mela 2026 participants.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentWhatsAppModal;
