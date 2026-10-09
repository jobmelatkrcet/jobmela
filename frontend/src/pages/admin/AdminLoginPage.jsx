import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Alert from '../../components/Alert';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide administrative email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const user = response.user;

      if (!user.is_staff && user.role !== 'admin') {
        setError('Access denied. This account does not possess administrative privileges.');
        setLoading(false);
        return;
      }

      login(response.token, user);
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Invalid administrative credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0 6rem', backgroundColor: '#0f172a', minHeight: '80vh' }}>
      <div className="app-container" style={{ maxWidth: 460 }}>
        {/* Back link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              color: '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.88rem',
            }}
          >
            <ArrowLeft size={16} /> Return to TKRCET Job Mela Home
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#f59e0b',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.9rem', color: '#ffffff', marginBottom: '0.4rem' }}>
            Organizer & Admin Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            TKRCET Job Mela 2026 Management System
          </p>
        </div>

        {error && (
          <Alert type="danger" message={error} onClose={() => setError('')} />
        )}

        <div
          className="card"
          style={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email" style={{ color: '#f1f5f9' }}>
                Admin Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-email"
                  type="email"
                  className="form-control"
                  placeholder="admin@tkrcet.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#ffffff',
                  }}
                  required
                />
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="admin-pass" style={{ color: '#f1f5f9' }}>
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-pass"
                  type="password"
                  className="form-control"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#ffffff',
                  }}
                  required
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-lg"
              style={{
                width: '100%',
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                fontWeight: 700,
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#0f172a' }} /> Authenticating...
                </>
              ) : (
                <>
                  Enter Admin Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
