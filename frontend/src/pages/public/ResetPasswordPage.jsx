import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import Alert from '../../components/Alert';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Support both /reset-password/:uid/:token and /reset-password?uid=...&token=...
  const uid = params.uid || searchParams.get('uid') || '';
  const token = params.token || searchParams.get('token') || '';

  const [validating, setValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!uid || !token) {
        if (isMounted) {
          setError('Password reset link is incomplete or missing necessary tokens. Please request a new link.');
          setIsTokenValid(false);
          setValidating(false);
        }
        return;
      }

      try {
        const res = await authService.validateResetToken(uid, token);
        if (isMounted) {
          if (res?.valid) {
            setIsTokenValid(true);
            setMaskedEmail(res.email || '');
            setCandidateName(res.full_name || '');
          } else {
            setIsTokenValid(false);
            setError(res?.detail || 'This password reset link is invalid or has expired.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsTokenValid(false);
          const detail =
            err.response?.data?.detail ||
            err.response?.data?.token?.[0] ||
            'This password reset link is invalid or has expired. Please request a new link.';
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setValidating(false);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.confirmPasswordReset({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Password reset confirm error:', err);
      const detail =
        err.response?.data?.token?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.detail ||
        'Unable to update password. Please verify the reset link or request a new one.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="app-container" style={{ maxWidth: 480 }}>
        {/* Navigation back */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/login"
            style={{
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: isSuccess ? '#dcfce7' : isTokenValid ? '#eff6ff' : '#fee2e2',
              color: isSuccess ? '#15803d' : isTokenValid ? '#2563eb' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            {isSuccess ? (
              <CheckCircle2 size={30} />
            ) : isTokenValid ? (
              <Lock size={28} />
            ) : (
              <AlertTriangle size={28} />
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.1rem)', marginBottom: '0.4rem', color: '#0f172a' }}>
            {isSuccess ? 'Password Reset Complete' : 'Choose New Password'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {isSuccess
              ? 'Your password has been securely updated.'
              : isTokenValid
              ? candidateName
                ? `Welcome back, ${candidateName}. Please enter your new password below.`
                : 'Create a new, strong password for your account.'
              : 'Verifying password reset security token...'}
          </p>
        </div>

        {error && (
          <Alert type="danger" message={error} onClose={() => setError('')} />
        )}

        <div className="card" style={{ padding: '2.25rem 2rem' }}>
          {validating ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <span className="spinner" style={{ width: 28, height: 28, margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Verifying your secure password reset link...
              </p>
            </div>
          ) : isSuccess ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                  color: '#166534',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                Your password has been reset successfully. You can now use your new password to sign into the TKRCET Job Mela portal.
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() =>
                  navigate('/login', {
                    state: { message: 'Password updated successfully! Please log in with your new password.' },
                  })
                }
              >
                Proceed to Login <ArrowRight size={18} />
              </button>
            </div>
          ) : !isTokenValid ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                  color: '#991b1b',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                }}
              >
                This password reset link is invalid, expired, or has already been used. Security links expire after 1 hour or immediately upon successful reset.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/forgot-password"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Request a New Reset Link <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {maskedEmail && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md, 6px)',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Updating password for: <strong style={{ color: '#0f172a' }}>{maskedEmail}</strong>
                </div>
              )}

              {/* New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    minLength={6}
                    required
                    autoFocus
                  />
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-light)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-light)',
                      padding: 0,
                    }}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    minLength={6}
                    required
                  />
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-light)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-light)',
                      padding: 0,
                    }}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <small style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.35rem', display: 'block' }}>
                    Passwords do not match
                  </small>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={submitting || (confirmPassword && newPassword !== confirmPassword)}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18 }} /> Resetting Password...
                  </>
                ) : (
                  <>
                    Save New Password <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
