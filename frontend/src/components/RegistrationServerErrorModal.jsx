import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Smartphone,
  Laptop,
  FileText,
  Camera,
  Phone,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

/**
 * RegistrationServerErrorModal
 * 
 * Pops up when a server error, upload failure, or network timeout occurs during student registration.
 * Prominently instructs students:
 * 1. Do in another mobile or laptop
 * 2. Make sure image and resume size should be 100kb
 */
const RegistrationServerErrorModal = ({
  isOpen,
  onClose,
  onRetry = null,
  errorMessage = '',
  supportPhone = '8019792661',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="presentation"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="server-error-title"
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid #fee2e2',
          animation: 'scaleUp 0.22s ease-out',
        }}
      >
        {/* Header with High-Visibility Error Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
            padding: '1.75rem 1.5rem 1.25rem',
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
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.2s',
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.45)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <AlertTriangle size={30} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#fef2f2',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            Registration Submission Alert
          </div>

          <h3
            id="server-error-title"
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              margin: '0 0 0.25rem',
              color: '#ffffff',
            }}
          >
            Server Error During Registration
          </h3>
          <p style={{ color: '#fecaca', fontSize: '0.86rem', margin: 0 }}>
            TKRCET Mega Job Mela 2026
          </p>
        </div>

        {/* Modal body */}
        <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          {errorMessage ? (
            <div
              style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '10px',
                padding: '0.75rem 0.95rem',
                marginBottom: '1.2rem',
                fontSize: '0.86rem',
                color: '#9f1239',
                lineHeight: 1.5,
              }}
            >
              <strong>Server Notice:</strong> {errorMessage}
            </div>
          ) : (
            <p
              style={{
                fontSize: '0.9rem',
                color: '#475569',
                margin: '0 0 1.2rem',
                lineHeight: 1.5,
              }}
            >
              The server could not complete your registration. Please follow these 2 required steps to register successfully:
            </p>
          )}

          {/* STEP 1: Do in another mobile or laptop */}
          <div
            style={{
              display: 'flex',
              gap: '0.9rem',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '0.85rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  marginBottom: '0.3rem',
                }}
              >
                <span>1. Do in another mobile or laptop</span>
                <span style={{ display: 'inline-flex', gap: '3px', color: '#2563eb' }}>
                  <Smartphone size={16} />
                  <Laptop size={16} />
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#475569',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Please try submitting from <strong>another mobile phone</strong> or a <strong>laptop / PC</strong>. If you are using mobile data, connect to Wi-Fi or try another browser (e.g. Chrome, Edge, or Safari).
              </p>
            </div>
          </div>

          {/* STEP 2: Make sure image and resume size should be 100kb */}
          <div
            style={{
              display: 'flex',
              gap: '0.9rem',
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#d97706',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  color: '#78350f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  marginBottom: '0.3rem',
                }}
              >
                <span>2. Make sure image and resume size should be 100kb</span>
                <span style={{ display: 'inline-flex', gap: '3px', color: '#d97706' }}>
                  <Camera size={16} />
                  <FileText size={16} />
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#92400e',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Make sure your <strong>photograph image</strong> and <strong>resume / CV document</strong> are <strong>100KB or below</strong>. Large file attachments cause server timeout errors on mobile connections.
              </p>
            </div>
          </div>

          {/* Registration Helpline Support */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.86rem',
              color: '#1e3a8a',
              marginBottom: '1.25rem',
            }}
          >
            <Phone size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
            <div>
              <span>Registration Helpline Support: </span>
              <a
                href={`tel:${supportPhone}`}
                style={{
                  fontWeight: 700,
                  color: '#1d4ed8',
                  textDecoration: 'underline',
                }}
              >
                {supportPhone}
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
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
              <CheckCircle2 size={17} /> I Understand, Let Me Check My Files
            </button>
            {onRetry && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                <RefreshCw size={15} /> Retry Registration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationServerErrorModal;

