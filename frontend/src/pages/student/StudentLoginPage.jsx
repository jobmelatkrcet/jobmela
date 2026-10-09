import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRegistrationModal } from '../../context/RegistrationModalContext';
import { authService } from '../../services/authService';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import Alert from '../../components/Alert';

const StudentLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { openRegistrationModal } = useRegistrationModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || '');
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.token, response.user);

      if (response.user.role === 'admin' || response.user.is_staff) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors.join(' '));
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem', backgroundColor: '#f8fafc' }}>
      <div className="app-container" style={{ maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="badge badge-blue"
            style={{ marginBottom: '0.75rem', padding: '0.35rem 0.85rem' }}
          >
            Candidate Portal
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)', marginBottom: '0.5rem' }}>
            Student Login
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Access your applications and explore participating companies.
          </p>
        </div>

        {infoMessage && (
          <Alert type="info" message={infoMessage} onClose={() => setInfoMessage('')} />
        )}

        {error && (
          <Alert type="danger" message={error} onClose={() => setError('')} />
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Registered Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="e.g. student@tkrcet.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
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
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
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
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} /> Logging In...
                </>
              ) : (
                <>
                  Login to Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              fontSize: '0.92rem',
            }}
          >
            <div>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={openRegistrationModal}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--color-brand-600)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                }}
              >
                Register as Student
              </button>
            </div>

            <div style={{ fontSize: '0.85rem' }}>
              <Link
                to="/admin/login"
                style={{
                  color: 'var(--color-text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck size={15} /> Organizer / Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
