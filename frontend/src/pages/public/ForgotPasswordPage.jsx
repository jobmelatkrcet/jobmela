import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { authService } from '../../services/authService';
import Alert from '../../components/Alert';

const ForgotPasswordPage = () => {
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [devResetUrl, setDevResetUrl] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.requestPasswordReset(cleanEmail);
      setSubmitted(true);
      setSubmittedEmail(cleanEmail);
      setCooldown(60);
      if (response?.dev_reset_url) {
        setDevResetUrl(response.dev_reset_url);
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      const detail =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        'Unable to send password reset link right now. Please verify your internet connection or try again later.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || loading) return;
    handleSubmit();
  };

  return (
    <div style={{ padding: '3rem 0 5rem', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="app-container" style={{ maxWidth: 480 }}>
        {/* Back navigation */}
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
            <ArrowLeft size={16} /> Back to Student Login
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: submitted ? '#dcfce7' : '#eff6ff',
              color: submitted ? '#15803d' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)',
            }}
          >
            {submitted ? <CheckCircle2 size={30} /> : <KeyRound size={28} />}
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.1rem)', marginBottom: '0.5rem', color: '#0f172a' }}>
            {submitted ? 'Check Your Email' : 'Forgot Password?'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {submitted
              ? `We have sent password reset instructions to your email address.`
              : `Enter the email associated with your account and we'll send you a link to reset your password.`}
          </p>
        </div>

        {error && (
          <Alert type="danger" message={error} onClose={() => setError('')} />
        )}

        <div className="card" style={{ padding: '2.25rem 2rem' }}>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label" htmlFor="forgot-email">
                  Registered Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-control"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                    autoFocus
                  />
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-light)',
                    }}
                  />
                </div>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', display: 'block' }}>
                  Make sure this is the email you used during registration.
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18 }} /> Sending Link...
                  </>
                ) : (
                  <>
                    Send Password Reset Link <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.92rem',
                  color: 'var(--color-text-main)',
                  lineHeight: 1.6,
                }}
              >
                If an account exists for <strong style={{ color: '#0f172a' }}>{submittedEmail}</strong>, you will receive an email shortly containing a link to choose a new password.
              </div>

              {devResetUrl && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px dashed #3b82f6',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ExternalLink size={14} /> Dev Helper: Reset Link Generated
                  </div>
                  <a
                    href={devResetUrl}
                    style={{ color: '#2563eb', wordBreak: 'break-all', textDecoration: 'underline' }}
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Didn't see the email? Be sure to check your spam/junk folder.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                  {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Email Link'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSubmitted(false);
                    setDevResetUrl(null);
                  }}
                  style={{ width: '100%' }}
                >
                  Use a different email address
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem',
              fontSize: '0.9rem',
            }}
          >
            Remembered your password?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--color-brand-600)',
                fontWeight: 700,
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
