import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import roomService from '../../services/roomService';
import StudentQRScannerModal from '../../components/StudentQRScannerModal';
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

const StudentDashboardPage = () => {
  const { user } = useAuth();
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

          {/* Right Action: Resume Download & Accreditation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

            <Link to="/companies" className="btn btn-outline btn-sm">
              View All ({stats.total_companies}) →
            </Link>
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
    </div>
  );
};

export default StudentDashboardPage;
