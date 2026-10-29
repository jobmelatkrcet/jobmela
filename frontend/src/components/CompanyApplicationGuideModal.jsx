import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  UserPlus,
  KeyRound,
  LogIn,
  Send,
  ArrowRight,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_GROUP_URL, WHATSAPP_CHANNEL_URL } from '../utils/constants';

/**
 * CompanyApplicationGuideModal
 *
 * Official Step-by-Step Walkthrough: "How to Apply for Companies"
 * Reusable across Homepage, Student Dashboard, Companies Directory, and WhatsApp Popup.
 */
const CompanyApplicationGuideModal = ({
  isOpen,
  onClose,
  onOpenRequirements,
  targetCompaniesUrl = '/companies',
  stepIndicator = 'Step 2 of 3',
}) => {
  const navigate = useNavigate();

  // Keyboard accessibility (ESC to close) and body scroll lock
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

  const handleGoToCompanies = () => {
    onClose?.();
    if (window.location.pathname === '/' && targetCompaniesUrl.startsWith('#')) {
      const el = document.getElementById(targetCompaniesUrl.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/companies');
  };

  const steps = [
    {
      num: 1,
      icon: ExternalLink,
      title: 'Visit the Official Job Mela Portal',
      instruction: 'Visit https://jobmela.vercel.app/',
      link: 'https://jobmela.vercel.app/',
      desc: 'Access the recruitment portal from any phone or desktop browser.',
    },
    {
      num: 2,
      icon: UserPlus,
      title: 'Complete Registration',
      instruction: 'Register with accurate personal, educational, and contact details.',
      desc: 'Enter your full name, mobile number, educational qualification, and college.',
    },
    {
      num: 3,
      icon: KeyRound,
      title: 'Create Your Password',
      instruction: 'Create a password during registration.',
      desc: 'Set a secure password so you can return and manage your applications anytime.',
    },
    {
      num: 4,
      icon: LogIn,
      title: 'Log In to Candidate Portal',
      instruction: 'Log in using the registered email address and password whenever needed.',
      desc: 'Keep your credentials handy for hall ticket viewing, interview calls, and updates.',
    },
    {
      num: 5,
      icon: Building2,
      title: 'Open Companies Directory',
      instruction: 'Open the Companies section.',
      desc: 'Browse participating recruiters, eligibility criteria, CTC packages, and job roles.',
    },
    {
      num: 6,
      icon: Send,
      title: 'Submit Individual Applications',
      instruction: 'Apply to preferred companies individually and verify successful submission.',
      desc: 'Click "Apply" on each company card and check for the green APPLIED badge on your dashboard.',
    },
  ];

  return (
    <div
      className="guide-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="guide-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        id="company-application-guide-modal"
      >
        {/* Header */}
        <div className="guide-modal-header">
          <button
            type="button"
            className="guide-modal-close-btn"
            onClick={onClose}
            aria-label="Close guide modal"
            id="close-guide-modal-btn"
          >
            <X size={18} />
          </button>

          <div className="guide-modal-badge">
            <Sparkles size={14} /> {stepIndicator ? `${stepIndicator} • Application Walkthrough` : 'Official Application Walkthrough'}
          </div>

          <h2 id="guide-modal-title" className="guide-modal-title">
            How to Apply for Companies
          </h2>
          <p className="guide-modal-subtitle">
            TKRCET Mega Job Mela 2026 • Follow these 6 steps to ensure your candidature is recorded
          </p>
        </div>

        {/* Modal Body */}
        <div className="guide-modal-body">
          {/* Important Highlight Callout Box */}
          <div className="guide-modal-alert-box" role="alert">
            <div className="guide-modal-alert-icon">
              <AlertTriangle size={22} color="#b45309" />
            </div>
            <div className="guide-modal-alert-content">
              <strong>Important:</strong> Registration alone does not mean you have applied to companies. Complete your company applications as soon as possible.
            </div>
          </div>

          {/* 6 Step Cards */}
          <div className="guide-steps-container">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="guide-step-card">
                  <div className="guide-step-number-wrap">
                    <span className="guide-step-number">{step.num}</span>
                  </div>

                  <div className="guide-step-content">
                    <div className="guide-step-header">
                      <span className="guide-step-title">{step.title}</span>
                      <Icon size={16} className="guide-step-icon" />
                    </div>

                    <div className="guide-step-instruction">
                      {step.link ? (
                        <>
                          Visit{' '}
                          <a
                            href={step.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="guide-step-link"
                          >
                            {step.link}
                          </a>
                        </>
                      ) : (
                        step.instruction
                      )}
                    </div>

                    <p className="guide-step-desc">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification Tip */}
          <div className="guide-modal-tip-box">
            <CheckCircle2 size={16} color="#059669" />
            <span>
              Tip: You can apply to all participating companies that match your stream. You will see a green <strong>APPLIED ✓</strong> badge on companies you have submitted for.
            </span>
          </div>
        </div>

        {/* Modal Footer with "Next: Candidate Requirements" or "Go to Companies" Button */}
        <div className="guide-modal-footer">
          <button
            type="button"
            className="guide-modal-dismiss-btn"
            onClick={onClose}
          >
            Close Guide
          </button>

          {onOpenRequirements ? (
            <button
              type="button"
              className="guide-modal-action-btn"
              onClick={() => {
                onClose?.();
                onOpenRequirements();
              }}
              id="guide-next-requirements-btn"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                border: 'none',
              }}
            >
              <ClipboardList size={18} />
              <span>Next: Candidate Requirements</span>
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              className="guide-modal-action-btn"
              onClick={handleGoToCompanies}
              id="guide-go-to-companies-btn"
            >
              <Building2 size={18} />
              <span>Go to Companies</span>
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyApplicationGuideModal;
