import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { FileCheck, Building2, Calendar, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import Alert from '../../components/Alert';

const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [totalApplied, setTotalApplied] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data.applications || []);
      setTotalApplied(data.total_applied || 0);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setAlert({ type: 'danger', message: 'Failed to retrieve your applications.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: 900 }}>
      {/* Page Title & Counter */}
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
          <div
            className="badge badge-blue"
            style={{ marginBottom: '0.4rem', padding: '0.35rem 0.85rem' }}
          >
            Candidate Portal
          </div>
          <h2 style={{ fontSize: '1.9rem', marginBottom: '0.25rem' }}>
            My Applications
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            All companies you have registered and applied for at TKRCET Job Mela 2026.
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: '0.85rem 1.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-50)',
              color: 'var(--color-success-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              Total Applied
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-900)', lineHeight: 1.1 }}>
              {totalApplied} Companies
            </div>
          </div>
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
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 2rem',
            backgroundColor: '#ffffff',
          }}
        >
          <Building2 size={48} style={{ color: 'var(--color-text-light)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            No Applications Submitted Yet
          </h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 450, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            You haven't registered for any companies yet. Explore the participating companies list and submit applications.
          </p>
          <Link to="/companies" className="btn btn-primary">
            Browse Participating Companies <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
              Registered Applications List ({applications.length})
            </span>
            <Link to="/companies" className="btn btn-outline btn-sm">
              + Apply to More Companies
            </Link>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>S.No</th>
                  <th>Company Name</th>
                  <th>Applied Date & Time</th>
                  <th style={{ textAlign: 'center' }}>Application Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={app.id}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {index + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-brand-50)',
                            color: 'var(--color-brand-600)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                          }}
                        >
                          {(app.company_name || app.company?.name || 'C').charAt(0)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--color-primary-900)' }}>
                            {app.company_name || app.company?.name}
                          </strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            TKRCET Job Mela 2026
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-700)', fontSize: '0.88rem' }}>
                        <Clock size={15} color="var(--color-text-light)" />
                        {new Date(app.applied_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-applied">
                        <CheckCircle2 size={13} /> Applied ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              Total Companies Applied: <strong style={{ color: 'var(--color-primary-900)' }}>{totalApplied}</strong>
            </div>

            <Link to="/companies" className="btn btn-primary btn-sm">
              Explore More Companies <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplicationsPage;
