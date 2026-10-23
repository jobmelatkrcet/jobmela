import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Users,
  Building2,
  FileCheck,
  Upload,
  ArrowRight,
  TrendingUp,
  Clock,
  Download,
  AlertCircle,
  ClipboardList,
  DoorClosed,
  Mail,
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import Alert from '../../components/Alert';
import { StatsGridSkeleton, TableSkeleton } from '../../components/Skeleton';
import AdminBroadcastEmailModal from '../../components/AdminBroadcastEmailModal';

const AdminDashboardPage = ({ onTabChange }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      setAlert({ type: 'danger', message: 'Failed to load administrator dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.9rem', marginBottom: '0.25rem' }}>
            Event Overview & Analytics
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            TKRCET Job Mela 2026 • 31 October 2026 • Live Database Statistics
          </p>
        </div>

        <div className="admin-dashboard-quick-actions">
          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
            id="admin-quick-send-email-btn"
            title="Send announcement email to all registered candidates in one shot"
          >
            <Mail size={15} /> Send Mail to All Students
          </button>
          {onTabChange ? (
            <>
              <button
                type="button"
                onClick={() => onTabChange('requirements')}
                className="btn btn-outline btn-sm"
              >
                <ClipboardList size={15} /> Candidate Requirements
              </button>
              <button
                type="button"
                onClick={() => onTabChange('companies')}
                className="btn btn-outline btn-sm"
              >
                <Upload size={15} /> Upload Companies Excel
              </button>
              <button
                type="button"
                onClick={() => onTabChange('rooms')}
                className="btn btn-outline btn-sm"
              >
                <DoorClosed size={15} /> Room Allocation
              </button>
              <button
                type="button"
                onClick={() => onTabChange('students')}
                className="btn btn-outline btn-sm"
              >
                <Users size={15} /> Manage Students
              </button>
            </>
          ) : (
            <>
              <Link to="/admin?tab=requirements" className="btn btn-outline btn-sm">
                <ClipboardList size={15} /> Candidate Requirements
              </Link>
              <Link to="/admin?tab=companies" className="btn btn-outline btn-sm">
                <Upload size={15} /> Upload Companies Excel
              </Link>
              <Link to="/admin?tab=rooms" className="btn btn-outline btn-sm">
                <DoorClosed size={15} /> Room Allocation
              </Link>
              <Link to="/admin?tab=students" className="btn btn-outline btn-sm">
                <Users size={15} /> Manage Students
              </Link>
            </>
          )}
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {loading ? (
        <div style={{ padding: '0.5rem 0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            <span>Calculating database aggregates & real-time counts...</span>
          </div>
          <StatsGridSkeleton count={4} />
          <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <TableSkeleton rows={4} columns={4} />
          </div>
        </div>
      ) : (
        <>
          {/* Main 3 Database Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <StatsCard
              title="Total Students"
              value={dashboard?.total_students || 0}
              icon={Users}
              color="blue"
              subtitle="Registered candidate accounts"
            />

            <StatsCard
              title="Total Companies"
              value={dashboard?.total_companies || 0}
              icon={Building2}
              color="amber"
              subtitle="Participating recruiting campuses"
            />

            <StatsCard
              title="Total Applications"
              value={dashboard?.total_applications || 0}
              icon={FileCheck}
              color="emerald"
              subtitle="Direct student-company submissions"
            />
          </div>

          {/* One-Shot Mass Email Broadcaster Action Banner */}
          <div
            className="card"
            style={{
              marginBottom: '2rem',
              padding: '1.25rem 1.75rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', minWidth: 260 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <Mail size={24} color="#38bdf8" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>
                    Send Email to All Registered Participants
                  </h3>
                  <span
                    style={{
                      background: '#38bdf8',
                      color: '#0f172a',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      textTransform: 'uppercase',
                    }}
                  >
                    One-Shot Broadcast
                  </span>
                </div>
                <p style={{ margin: 0, color: '#bfdbfe', fontSize: '0.86rem' }}>
                  Send schedule updates, gate guidelines, and the official WhatsApp group link to all {dashboard?.total_students || 0} registered candidates in one click.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="btn btn-sm"
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 700,
                fontSize: '0.88rem',
                padding: '0.6rem 1.35rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
              id="admin-dashboard-compose-email-banner-btn"
            >
              <Mail size={16} /> Compose Broadcast Email →
            </button>
          </div>

          {/* 2-Column Content Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Top Companies by Registrations */}
            <div className="card">
              <div
                className="admin-dashboard-section-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <TrendingUp size={20} color="var(--color-brand-600)" style={{ flexShrink: 0 }} />
                  <h3 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', margin: 0, color: 'var(--color-primary-900)' }}>
                    Top Companies by Student Interest
                  </h3>
                </div>
                {onTabChange ? (
                  <button
                    type="button"
                    onClick={() => onTabChange('companies')}
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-brand-600)',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    View All →
                  </button>
                ) : (
                  <Link to="/admin?tab=companies" style={{ fontSize: '0.85rem', color: 'var(--color-brand-600)', fontWeight: 600 }}>
                    View All →
                  </Link>
                )}
              </div>

              {dashboard?.top_companies?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  No applications recorded yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboard?.top_companies?.map((comp, idx) => (
                    <div
                      key={comp.id}
                      className="admin-top-comp-row"
                    >
                      <div className="admin-top-comp-info">
                        <span className="admin-top-comp-rank">
                          #{idx + 1}
                        </span>
                        <strong className="admin-top-comp-name">
                          {comp.name}
                        </strong>
                      </div>

                      <div className="admin-top-comp-actions">
                        <span className="badge badge-blue">
                          {comp.applicant_count} {comp.applicant_count === 1 ? 'Student' : 'Students'}
                        </span>
                        <Link
                          to={`/admin/companies/${comp.id}`}
                          className="btn btn-outline btn-sm admin-top-comp-btn"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Submissions Feed */}
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} color="var(--color-brand-600)" />
                  <h3 style={{ fontSize: '1.25rem' }}>Recent Applications</h3>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Latest 10 entries
                </span>
              </div>

              {dashboard?.recent_applications?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  No recent applications.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboard?.recent_applications?.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.88rem',
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--color-primary-900)' }}>
                          {app.student_name}
                        </strong>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                          applied to <span style={{ color: 'var(--color-brand-700)', fontWeight: 600 }}>{app.company_name}</span>
                        </div>
                      </div>
                      <span style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>
                        {app.applied_at}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Official Mass Broadcast Email Modal */}
      <AdminBroadcastEmailModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboardPage;
