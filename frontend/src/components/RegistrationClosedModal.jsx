import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Lock, AlertCircle, X, ArrowRight, Home } from 'lucide-react';

const RegistrationClosedModal = ({ isOpen, onClose }) => {
  let navigate = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Fallback if rendered outside Router
    navigate = null;
  }

  if (!isOpen) return null;

  const handleGoHome = () => {
    onClose?.();
    if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  };

  const handleGoLogin = () => {
    onClose?.();
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '480px',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'scaleUp 0.22s ease-out',
        }}
      >
        {/* Header with Dark Premium Theme */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem 1.5rem 1.5rem',
            color: '#ffffff',
            position: 'relative',
            textAlign: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'background 0.2s',
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.1rem',
              boxShadow: '0 10px 24px rgba(245, 158, 11, 0.4)',
            }}
          >
            <Lock size={32} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(245, 158, 11, 0.18)',
              color: '#fbbf24',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              border: '1px solid rgba(245, 158, 11, 0.35)',
            }}
          >
            <Calendar size={13} /> Registrations Opening Soon
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#ffffff' }}>
            Portal Access Restricted
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            TKRCET Mega Job Mela 2026
          </p>
        </div>

        {/* Modal body */}
        <div style={{ padding: '1.75rem 1.5rem', backgroundColor: '#ffffff' }}>
          <div
            style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '14px',
              padding: '1.25rem 1rem',
              marginBottom: '1.35rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: '#92400e',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.4rem',
              }}
            >
              Notice to all Students & Candidates
            </div>
            <div
              style={{
                fontSize: '1.28rem',
                fontWeight: 800,
                color: '#b45309',
                lineHeight: 1.35,
              }}
            >
              Registrations will be opened by 10/10/2026
            </div>
          </div>

          <p
            style={{
              color: '#475569',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              margin: '0 0 1.25rem',
              textAlign: 'center',
            }}
          >
            Student registration is currently closed while final company requirements and interview scheduling are being finalized.
            Candidate registration access will be opened on <strong>10/10/2026</strong>.
          </p>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              fontSize: '0.85rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0',
            }}
          >
            <AlertCircle size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
            <span>Already have an account? You can log in directly to your candidate dashboard.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGoHome}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Home size={17} /> Return to Home
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleGoLogin}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Candidate Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationClosedModal;
