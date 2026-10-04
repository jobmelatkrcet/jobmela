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
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import Alert from '../../components/Alert';

const AdminDashboardPage = ({ onTabChange }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                className="btn btn-primary btn-sm"
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
              <Link to="/admin?tab=companies" className="btn btn-primary btn-sm">
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
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner spinner-primary" style={{ margin: '0 auto 1rem', width: 36, height: 36 }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Calculating database aggregates...</p>
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
    </div>
  );
};

export default AdminDashboardPage;
