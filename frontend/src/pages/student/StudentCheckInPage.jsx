import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import roomService from '../../services/roomService';
import {
  DoorClosed,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  MapPin,
  IndianRupee,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import Alert from '../../components/Alert';
import { Skeleton } from '../../components/Skeleton';

const StudentCheckInPage = () => {
  const { token } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);

  useEffect(() => {
    fetchRoomInfo();
  }, [token]);

  const fetchRoomInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await roomService.getCheckInInfo(token);
      setRoomData(data);
      if (data.already_checked_in) {
        setCheckInSuccess({
          message: 'You have already checked in to this room!',
          checked_in_at: data.checked_in_at,
        });
      }
    } catch (err) {
      console.error('Failed to resolve room:', err);
      const msg = err.response?.data?.error || 'Invalid or inactive Room QR code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/checkin/${token}` } });
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await roomService.submitCheckIn(token);
      setCheckInSuccess(res);
      // Reload room info
      await fetchRoomInfo();
    } catch (err) {
      console.error('Check-in error:', err);
      const msg = err.response?.data?.error || 'Failed to complete check-in. Please contact the help desk.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: 600, padding: '2.5rem 1rem 4rem' }}>
      <div className="card" style={{ padding: '2rem', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        {/* Header Branding */}
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-brand-600)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          TKR College of Engineering &amp; Technology
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '0.1rem' }}>
          JOB MELA 2026 • CANDIDATE INTERVIEW CHECK-IN
        </div>

        {error && (
          <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <Alert type="danger" message={error} onClose={() => setError('')} />
          </div>
        )}

        {loading ? (
          <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <Skeleton width={180} height={42} borderRadius="10px" />
            <Skeleton width="80%" height={24} />
            <Skeleton width="60%" height={18} />
            <div style={{ width: '100%', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Skeleton width="100%" height={80} borderRadius="12px" />
              <Skeleton width="100%" height={80} borderRadius="12px" />
            </div>
          </div>
        ) : roomData ? (
          <div>
            {/* Room Badge */}
            <div
              style={{
                margin: '1.5rem auto 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}
            >
              <DoorClosed size={22} /> ROOM {roomData.room_number}
            </div>

            {/* Company Card */}
            {roomData.company ? (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #e2e8f0',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Interviewing Company:
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-900)', margin: '0.25rem 0 0.5rem' }}>
                  {roomData.company.name}
                </h3>

                <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                  {roomData.company.job_position && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Briefcase size={14} color="var(--color-brand-600)" />
                      <span>Role: <strong>{roomData.company.job_position}</strong></span>
                    </div>
                  )}

                  {roomData.company.sector && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={14} color="#6d28d9" />
                      <span>Sector: <strong>{roomData.company.sector}</strong></span>
                    </div>
                  )}

                  {roomData.company.salary_ctc && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IndianRupee size={14} color="#059669" />
                      <span>Package: <strong>{roomData.company.salary_ctc}</strong></span>
                    </div>
                  )}

                  {roomData.company.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#ea580c" />
                      <span>Location: <strong>{roomData.company.location}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '0.88rem' }}>
                No company is currently assigned to this room.
              </div>
            )}

            {/* Check-in State Box */}
            <div style={{ marginTop: '1.75rem' }}>
              {checkInSuccess ? (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#ecfdf5',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid #a7f3d0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 800, fontSize: '1.1rem' }}>
                    <CheckCircle2 size={24} /> Checked In Successfully!
                  </div>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#065f46' }}>
                    Candidate: <strong>{user?.full_name || 'Candidate'}</strong>
                  </p>
                  {checkInSuccess.checked_in_at && (
                    <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.2rem' }}>
                      Recorded at: {checkInSuccess.checked_in_at}
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    <Link to="/dashboard" className="btn btn-outline btn-sm">
                      Go to My Dashboard
                    </Link>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <div>
                  <div style={{ marginBottom: '1rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                    Candidate: <strong>{user?.full_name}</strong> ({user?.email})
                  </div>
                  <button
                    onClick={handleCheckInSubmit}
                    disabled={submitting || roomData.qr_status !== 'active'}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      gap: '0.5rem',
                      backgroundColor: '#1e3a8a',
                      boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
                    }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner" style={{ width: 18, height: 18 }} /> Recording Check-In...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Confirm Interview Check-In
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#eff6ff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '0.35rem' }}>
                    Candidate Login Required
                  </div>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#1e3a8a' }}>
                    Please login with your registered student account to record your attendance for this room.
                  </p>
                  <Link
                    to="/login"
                    state={{ returnUrl: `/checkin/${token}` }}
                    className="btn btn-primary"
                    style={{ width: '100%', gap: '0.4rem', justifyContent: 'center' }}
                  >
                    <LogIn size={16} /> Login to Check In <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StudentCheckInPage;
