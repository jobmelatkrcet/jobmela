import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { companyService } from '../../services/companyService';
import { authService } from '../../services/authService';
import {
  Building2,
  FileCheck,
  User,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Award,
  GraduationCap,
  QrCode,
  Camera,
  DoorClosed,
  BookOpen,
  FileUp,
  Sparkles,
  AlertCircle,
  ClipboardList,
  BellRing,
} from 'lucide-react';
import roomService from '../../services/roomService';
import StudentQRScannerModal from '../../components/StudentQRScannerModal';
import CompanyApplicationGuideModal from '../../components/CompanyApplicationGuideModal';
import RequirementsModal from '../../components/RequirementsModal';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import { WHATSAPP_CHANNEL_URL } from '../../utils/constants';
import StatsCard from '../../components/StatsCard';
import Alert from '../../components/Alert';
import ConfirmModal from '../../components/ConfirmModal';
import { ApplicationListSkeleton, Skeleton } from '../../components/Skeleton';

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

const PHOTO_MAX_BYTES = 3 * 1024 * 1024; // 3MB
const PHOTO_ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const RESUME_ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

const StudentDashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();

  const [profile, setProfile] = useState(user || null);
  const [stats, setStats] = useState({ total_companies: 0, applied_count: 0 });
  const [myApplications, setMyApplications] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [attemptsData, setAttemptsData] = useState({
    attempts_count: 0,
    max_attempts: 3,
    remaining_attempts: 3,
    can_attempt_more: true,
    attempts: [],
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(
    location.state?.message ? { type: 'success', message: location.state.message } : null
  );

  // Guide and Requirements modal state
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);

  // Profile documents upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState(null);
  const [resumeUploadError, setResumeUploadError] = useState(null);
  const [profileActionMessage, setProfileActionMessage] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);

  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Apply modal state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, appsData, compsData, profileData, attemptsRes] = await Promise.allSettled([
        applicationService.getStudentStats(),
        applicationService.getMyApplications(),
        companyService.getCompanies({ page: 1, page_size: 6 }),
        authService.getProfile(),
        roomService.getMyAttempts(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (appsData.status === 'fulfilled') setMyApplications(appsData.value.applications || []);
      if (compsData.status === 'fulfilled') setFeaturedCompanies(compsData.value.results || []);
      if (profileData.status === 'fulfilled') setProfile(profileData.value);
      if (attemptsRes.status === 'fulfilled') setAttemptsData(attemptsRes.value);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApply = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const confirmQuickApply = async () => {
    if (!selectedCompany) return;
    setApplying(true);
    try {
      const res = await applicationService.applyToCompany(selectedCompany.id);
      setAlert({
        type: 'success',
        message: res.message || `Application Successful for ${selectedCompany.name}!`,
      });
      setIsModalOpen(false);
      setSelectedCompany(null);
      fetchDashboardData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to apply. Please try again.';
      setAlert({ type: 'danger', message: errMsg });
      setIsModalOpen(false);
    } finally {
      setApplying(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-uploading the same file triggers change
    e.target.value = '';
    setPhotoUploadError(null);
    setProfileActionMessage(null);

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!PHOTO_ALLOWED_EXT.includes(ext)) {
      setPhotoUploadError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoUploadError('Photograph file size exceeds 3MB limit. Please choose a smaller image.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhotoPreviewUrl(preview);
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await authService.updateProfile(formData);
      const updatedUser = res.user || res;
      setProfile(updatedUser);
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      setProfileActionMessage({
        type: 'success',
        text: 'Passport photograph updated successfully! Your candidate admit card is updated.',
      });
    } catch (err) {
      console.error('Photo upload failed:', err);
      const errDetail =
        err.response?.data?.photo ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to upload photograph. Please check file format and try again.';
      setPhotoUploadError(typeof errDetail === 'string' ? errDetail : JSON.stringify(errDetail));
      setPhotoPreviewUrl(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-uploading triggers change
    e.target.value = '';
    setResumeUploadError(null);
    setProfileActionMessage(null);

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!RESUME_ALLOWED_EXT.includes(ext)) {
      setResumeUploadError('Please select a PDF, DOC, or DOCX document.');
      return;
    }

    if (file.size > RESUME_MAX_BYTES) {
      setResumeUploadError('Resume file size exceeds 5MB limit. Please choose a smaller document.');
      return;
    }

    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await authService.updateProfile(formData);
      const updatedUser = res.user || res;
      setProfile(updatedUser);
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      setProfileActionMessage({
        type: 'success',
        text: 'Resume document uploaded successfully! Recruiters will now be able to view it.',
      });
    } catch (err) {
      console.error('Resume upload failed:', err);
      const errDetail =
        err.response?.data?.resume ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to upload resume. Please check file format and try again.';
      setResumeUploadError(typeof errDetail === 'string' ? errDetail : JSON.stringify(errDetail));
    } finally {
      setUploadingResume(false);
    }
  };

  const hasPhoto = Boolean(profile?.photo);
  const hasResume = Boolean(profile?.resume);
  const photoFilename =
    profile?.photo_name ||
    (profile?.photo ? profile.photo.split('/').pop().split('?')[0] : null);
  const resumeFilename =
    profile?.resume_name ||
    (profile?.resume ? profile.resume.split('/').pop().split('?')[0] : null);

  return (
    <div className="app-container">
      {/* Alert Notification */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Official Candidate Accreditation Card with Photograph & Resume status */}
      <div className="candidate-admit-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Candidate identity & photo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {profile?.photo ? (
              <img
                src={getMediaUrl(profile.photo)}
                alt={profile.full_name || 'Candidate'}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #38bdf8',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                  backgroundColor: '#1e293b',
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  border: '2px dashed #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                }}
              >
                {(profile?.full_name || user?.full_name || 'S').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {profile?.full_name || user?.full_name || 'Registered Candidate'}
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Candidate ID: TKRCET-{(profile?.id || user?.id || 1).toString().padStart(4, '0')}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  marginTop: '0.45rem',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                }}
              >
                <span>{profile?.email || user?.email}</span>
                {profile?.mobile && <span>• {profile.mobile}</span>}
                {profile?.qualification && <span>• {profile.qualification}</span>}
              </div>

              {profile?.college && (
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  {profile.college}
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Resume Download & Accreditation & Guide */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsGuideModalOpen(true)}
              className="btn"
              id="student-dashboard-top-guide-btn"
              title="View step-by-step company application walkthrough"
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <BookOpen size={17} /> How to Apply Guide
            </button>

            <button
              type="button"
              onClick={() => setIsRequirementsModalOpen(true)}
              className="btn"
              id="student-dashboard-top-requirements-btn"
              title="View mandatory document checklist, dress code and entry rules"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <ClipboardList size={17} /> Requirements Checklist
            </button>

            {profile?.resume ? (
              <a
                href={getMediaUrl(profile.resume)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
                }}
              >
                <FileText size={17} /> View / Download Resume <ExternalLink size={14} />
              </a>
            ) : (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  border: '1px dashed #475569',
                }}
              >
                No Resume Attached
              </span>
            )}
          </div>
        </div>
      </div>

      {/* HIGHLIGHTED: Official WhatsApp Channels & Candidate Requirements Hub */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          padding: '1.4rem 1.6rem',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 45%, #eff6ff 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid #86efac',
          boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.18)',
        }}
      >
        {/* Banner Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '0.9rem',
            borderBottom: '1.5px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: '#075e54',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(7, 94, 84, 0.3)',
              }}
            >
              <WhatsAppIcon size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#064e3b' }}>
                Important Job Mela Announcements &amp; Guidelines
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#047857', margin: '0.15rem 0 0', fontWeight: 600 }}>
                Official Communication Channels &amp; Mandatory Candidate Documents
              </p>
            </div>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              border: '1.5px solid #86efac',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
                boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.4)',
              }}
            />
            CRITICAL UPDATES
          </span>
        </div>

        {/* Highlighted Action Cards: Channel, Requirements, Guide */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Card 1: Official WhatsApp Channel (EVERYONE JOIN) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '1.2rem',
              border: '2px solid #075e54',
              boxShadow: '0 4px 14px rgba(7, 94, 84, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#075e54',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderBottomLeftRadius: 8,
                letterSpacing: '0.4px',
              }}
            >
              EVERYONE SHOULD JOIN
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem', marginTop: '0.2rem' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: '#e6f7f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WhatsAppIcon size={20} color="#075e54" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    WhatsApp Channel
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#075e54', fontWeight: 700 }}>
                    Mandatory for All Candidates
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.83rem', color: '#334155', lineHeight: 1.45, margin: '0.4rem 0 1.1rem' }}>
                <strong style={{ color: '#064e3b' }}>Everyone should join this channel!</strong> Spot hiring calls, company arrivals, interview room schedules, and immediate announcements are broadcast live here.
              </p>
            </div>

            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="dashboard-join-channel-btn"
              style={{
                background: 'linear-gradient(135deg, #075e54 0%, #064e3b 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                padding: '0.7rem 1rem',
                borderRadius: 8,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 3px 10px rgba(7, 94, 84, 0.3)',
              }}
            >
              <WhatsAppIcon size={18} color="#ffffff" />
              <span>Follow WhatsApp Channel</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Card 2: Candidate Requirements & Documents Checklist */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '1.2rem',
              border: '2px solid #f59e0b',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#d97706',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderBottomLeftRadius: 8,
                letterSpacing: '0.4px',
              }}
            >
              MANDATORY CHECKLIST
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem', marginTop: '0.2rem' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ClipboardList size={20} color="#b45309" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Candidate Requirements
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>
                    Documents &amp; Dress Code
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.83rem', color: '#334155', lineHeight: 1.45, margin: '0.4rem 0 1.1rem' }}>
                <strong style={{ color: '#b45309' }}>Mandatory checklist:</strong> 3-5 resume hard copies, passport size photos, educational marksheets, valid photo ID, and formal dress code.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsRequirementsModalOpen(true)}
              id="dashboard-open-requirements-btn"
              style={{
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.88rem',
                padding: '0.7rem 1rem',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 3px 10px rgba(245, 158, 11, 0.25)',
              }}
            >
              <ClipboardList size={18} />
              <span>View Requirements Checklist</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Compact "Complete Your Profile" Card */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          padding: '1.4rem 1.6rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.9rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-primary-900)' }}>
                Complete Your Profile
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0' }}>
                Upload or update your passport photograph and resume for verified recruiter matching
              </p>
            </div>
          </div>

          <div>
            {hasPhoto && hasResume ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={14} /> Profile 100% Complete ✓
              </span>
            ) : hasPhoto || hasResume ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <AlertCircle size={14} /> 50% Complete (1 of 2 Attached)
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <AlertCircle size={14} /> 0% Complete (Upload Documents)
              </span>
            )}
          </div>
        </div>

        {/* Action feedback message */}
        {profileActionMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: profileActionMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: profileActionMessage.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${profileActionMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <span>{profileActionMessage.text}</span>
            <button
              type="button"
              onClick={() => setProfileActionMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'inherit',
                padding: '0 0.35rem',
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Two-Column Upload Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Photograph Upload Card */}
          <div
            style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-md)',
              border: hasPhoto ? '1px solid #bbf7d0' : '1px dashed #cbd5e1',
              backgroundColor: hasPhoto ? '#f0fdf4' : '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              id="student-photo-file-input"
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Photo Preview Thumbnail */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#e2e8f0',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {photoPreviewUrl || profile?.photo ? (
                  <img
                    src={photoPreviewUrl || getMediaUrl(profile.photo)}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Camera size={24} color="#94a3b8" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary-900)' }}>
                    Passport Photograph
                  </strong>
                  {hasPhoto ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      Uploaded ✓
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#64748b',
                        backgroundColor: '#e2e8f0',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      Skipped / Not Uploaded
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={photoFilename || 'JPG, PNG, WebP • Max 3MB'}
                >
                  {hasPhoto ? (
                    <span>
                      File: <strong>{photoFilename || 'candidate_photo'}</strong>
                    </span>
                  ) : (
                    <span>JPG, PNG, WebP • Max 3MB</span>
                  )}
                </div>

                {photoUploadError && (
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.35rem', fontWeight: 600 }}>
                    {photoUploadError}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className={`btn btn-sm ${hasPhoto ? 'btn-outline' : 'btn-primary'}`}
                id="student-dashboard-photo-upload-btn"
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', gap: '0.4rem' }}
              >
                {uploadingPhoto ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    <span>Uploading Photo...</span>
                  </>
                ) : (
                  <>
                    <FileUp size={14} />
                    <span>{hasPhoto ? 'Update Photo' : 'Upload Photo'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resume Upload Card */}
          <div
            style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-md)',
              border: hasResume ? '1px solid #bbf7d0' : '1px dashed #cbd5e1',
              backgroundColor: hasResume ? '#f0fdf4' : '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <input
              type="file"
              ref={resumeInputRef}
              onChange={handleResumeSelect}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              id="student-resume-file-input"
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Resume Document Icon Box */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '12px',
                  backgroundColor: hasResume ? '#ecfdf5' : '#e2e8f0',
                  color: hasResume ? '#059669' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1.5px solid ${hasResume ? '#a7f3d0' : '#cbd5e1'}`,
                }}
              >
                <FileText size={26} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary-900)' }}>
                    Candidate Resume (CV)
                  </strong>
                  {hasResume ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      Uploaded ✓
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#64748b',
                        backgroundColor: '#e2e8f0',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      Skipped / Not Uploaded
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={resumeFilename || 'PDF, DOC, DOCX • Max 5MB'}
                >
                  {hasResume ? (
                    <span>
                      File: <strong>{resumeFilename || 'candidate_resume.pdf'}</strong>
                    </span>
                  ) : (
                    <span>PDF, DOC, DOCX • Max 5MB</span>
                  )}
                </div>

                {resumeUploadError && (
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.35rem', fontWeight: 600 }}>
                    {resumeUploadError}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
              {hasResume && profile?.resume && (
                <a
                  href={getMediaUrl(profile.resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '0.35rem' }}
                  title="View / Download current uploaded resume"
                >
                  <Download size={14} /> View
                </a>
              )}

              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className={`btn btn-sm ${hasResume ? 'btn-outline' : 'btn-primary'}`}
                id="student-dashboard-resume-upload-btn"
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', gap: '0.4rem' }}
              >
                {uploadingResume ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    <span>Uploading Resume...</span>
                  </>
                ) : (
                  <>
                    <FileUp size={14} />
                    <span>{hasResume ? 'Update Resume' : 'Upload Resume'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Rounds Check-In Card (Max 3 Companies Allowed) */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid #334155',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          {/* Left info */}
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Interview Room QR Check-In
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  A candidate can apply to all companies, but can attempt <strong>maximum 3 companies</strong>.
                </div>
              </div>
            </div>

            {/* Quota Progress */}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: attemptsData.attempts_count >= 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: `1px solid ${attemptsData.attempts_count >= 3 ? '#ef4444' : '#10b981'}`,
                  color: attemptsData.attempts_count >= 3 ? '#fca5a5' : '#6ee7b7',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                Attempts: {attemptsData.attempts_count} of 3 Used
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[1, 2, 3].map((slot) => {
                  const filled = slot <= attemptsData.attempts_count;
                  return (
                    <div
                      key={slot}
                      style={{
                        width: 28,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: filled
                          ? attemptsData.attempts_count >= 3
                            ? '#ef4444'
                            : '#10b981'
                          : '#475569',
                      }}
                      title={`Attempt ${slot} ${filled ? 'Completed' : 'Available'}`}
                    />
                  );
                })}
              </div>

              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {attemptsData.attempts_count >= 3
                  ? 'All 3 attempts completed (Limit Reached)'
                  : `${attemptsData.remaining_attempts} attempt(s) remaining`}
              </span>
            </div>
          </div>

          {/* Right action button */}
          <div>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="btn btn-primary"
              style={{
                backgroundColor: attemptsData.attempts_count >= 3 ? '#475569' : '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: attemptsData.attempts_count >= 3 ? 'none' : '0 4px 14px rgba(2, 132, 199, 0.4)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <QrCode size={19} />
              <span>{attemptsData.attempts_count >= 3 ? 'View Attempted Rooms' : 'Scan Room QR to Check In'}</span>
            </button>
          </div>
        </div>

        {/* Attempted companies listing */}
        {attemptsData.attempts && attemptsData.attempts.length > 0 && (
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Checked-In Interview Rooms:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem' }}>
              {attemptsData.attempts.map((att, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                      {att.company_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                      Room {att.room_number} {att.job_position ? `• ${att.job_position}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {att.checked_in_at?.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatsCard
          title="Participating Companies"
          value={stats.total_companies}
          icon={Building2}
          color="blue"
          subtitle="Available in central recruitment database"
        />

        <StatsCard
          title="Your Applications"
          value={stats.applied_count}
          icon={FileCheck}
          color="emerald"
          subtitle="Direct applications submitted (unlimited)"
        />

        <StatsCard
          title="Interview Attempts"
          value={`${attemptsData.attempts_count} / 3`}
          icon={DoorClosed}
          color={attemptsData.attempts_count >= 3 ? 'red' : 'indigo'}
          subtitle={attemptsData.attempts_count >= 3 ? 'Maximum 3 attempts reached' : `${attemptsData.remaining_attempts} attempt(s) remaining`}
        />

        <StatsCard
          title="Academic Candidate"
          value={user?.qualification || 'Registered'}
          icon={User}
          color="purple"
          subtitle="Eligible for multiple company drives"
        />
      </div>

      {/* Main Two-Column Workflow Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Applied Companies Overview */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>
                Your Applied Companies
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                {stats.applied_count > 0
                  ? `Registered for ${stats.applied_count} participating organization(s)`
                  : 'You have not submitted applications yet'}
              </p>
            </div>

            {stats.applied_count > 0 && (
              <Link to="/my-applications" className="btn btn-outline btn-sm">
                View All ({stats.applied_count}) →
              </Link>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '0.5rem 0' }}>
              <ApplicationListSkeleton count={3} />
            </div>
          ) : myApplications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                backgroundColor: 'var(--color-bg-main)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <FileCheck size={36} color="var(--color-text-light)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary-800)', marginBottom: '0.35rem' }}>
                No applications submitted yet
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Select participating companies from the list to register your candidacy.
              </p>
              <Link to="/companies" className="btn btn-primary btn-sm">
                Explore Companies <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myApplications.slice(0, 6).map((app, index) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--color-bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-brand-50)',
                        color: 'var(--color-brand-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary-900)' }}>
                        {app.company_name || app.company?.name}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                        <Clock size={12} />
                        Applied: {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-applied">
                    <CheckCircle2 size={12} /> APPLIED ✓
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Featured Participating Companies */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--color-border)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>
                Featured Participating Companies
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                Apply directly with a single click
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(true)}
                className="btn btn-outline btn-sm"
                id="dashboard-companies-guide-btn"
                title="View step-by-step company application walkthrough"
                style={{
                  borderColor: '#38bdf8',
                  color: '#0284c7',
                  backgroundColor: '#f0f9ff',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <BookOpen size={14} /> How to Apply Guide
              </button>

              <Link to="/companies" className="btn btn-outline btn-sm">
                View All ({stats.total_companies}) →
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <ApplicationListSkeleton count={4} />
            ) : featuredCompanies.map((comp) => (
              <div
                key={comp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: comp.has_applied ? '#f0fdf4' : '#ffffff',
                  border: comp.has_applied ? '1px solid #bbf7d0' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: comp.has_applied ? 'var(--color-success-50)' : 'var(--color-brand-50)',
                      color: comp.has_applied ? 'var(--color-success-600)' : 'var(--color-brand-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    {comp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary-900)' }}>
                      {comp.name}
                    </strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      Campus Recruitment Partner
                    </div>
                  </div>
                </div>

                {comp.has_applied ? (
                  <span className="badge badge-applied">
                    <CheckCircle2 size={12} /> APPLIED ✓
                  </span>
                ) : (
                  <button
                    onClick={() => handleQuickApply(comp)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.35rem 0.85rem' }}
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/companies" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-brand-600)' }}>
              Browse all {stats.total_companies} participating companies →
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Application"
        message={
          <div>
            <p style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-primary-800)' }}>
              Are you sure you want to register for this company?
            </p>
            <div
              style={{
                padding: '0.85rem 1.15rem',
                backgroundColor: 'var(--color-bg-main)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--color-brand-700)',
                border: '1px solid var(--color-border)',
              }}
            >
              {selectedCompany?.name}
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Your application details will be registered with the placement administration.
            </p>
          </div>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        loading={applying}
        onConfirm={confirmQuickApply}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
      />

      {/* QR Scanner Modal */}
      <StudentQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCheckInSuccess={() => {
          setIsScannerOpen(false);
          fetchDashboardData();
        }}
      />

      {/* Official Company Application Guide Modal */}
      <CompanyApplicationGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenRequirements={() => setIsRequirementsModalOpen(true)}
      />

      {/* Official Job Mela Requirements Modal */}
      <RequirementsModal
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
      />
    </div>
  );
};

export default StudentDashboardPage;
