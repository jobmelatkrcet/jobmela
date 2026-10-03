import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { companyService } from '../../services/companyService';
import {
  Building2,
  FileCheck,
  User,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import Alert from '../../components/Alert';
import ConfirmModal from '../../components/ConfirmModal';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [stats, setStats] = useState({ total_companies: 0, applied_count: 0 });
  const [myApplications, setMyApplications] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
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
      const [statsData, appsData, compsData] = await Promise.all([
        applicationService.getStudentStats(),
        applicationService.getMyApplications(),
        companyService.getCompanies({ page: 1, page_size: 6 }),
      ]);
      setStats(statsData);
      setMyApplications(appsData.applications || []);
      setFeaturedCompanies(compsData.results || []);
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

      {/* 3 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
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
          subtitle="Direct applications submitted"
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
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              <div className="spinner spinner-primary" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Loading applications...</p>
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
            {featuredCompanies.map((comp) => (
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
    </div>
  );
};

export default StudentDashboardPage;
