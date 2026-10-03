import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { User, Mail, Phone, GraduationCap, Building2, Calendar, Edit3, Check, Save } from 'lucide-react';
import Alert from '../../components/Alert';

const StudentProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    qualification: '',
    college: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        mobile: user.mobile || '',
        qualification: user.qualification || '',
        college: user.college || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      await authService.updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
      setAlert({ type: 'success', message: 'Profile details updated successfully!' });
    } catch (err) {
      console.error('Update profile error:', err);
      const msg = err.response?.data?.mobile || 'Failed to update profile. Please try again.';
      setAlert({ type: 'danger', message: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: 760 }}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>
                {user?.full_name || 'Student Profile'}
              </h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Registered Participant • TKRCET Job Mela 2026
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel Editing
            </button>
          )}
        </div>

        {!isEditing ? (
          /* View Mode */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <span className="form-label" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Full Name
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                <User size={18} color="var(--color-brand-600)" />
                {user?.full_name || 'Not provided'}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <span className="form-label" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Email Address (Registered)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                <Mail size={18} color="var(--color-brand-600)" />
                {user?.email || 'Not provided'}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <span className="form-label" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Mobile Number
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                <Phone size={18} color="var(--color-brand-600)" />
                {user?.mobile || 'Not provided'}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <span className="form-label" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Educational Qualification
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                <GraduationCap size={18} color="var(--color-brand-600)" />
                {user?.qualification || 'Not provided'}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <span className="form-label" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                College / Institution
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                <Building2 size={18} color="var(--color-brand-600)" />
                {user?.college || 'Not provided'}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <span className="form-label" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Registration Date
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                <Calendar size={16} />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }) : 'N/A'}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="form-control"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--color-bg-main)', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Email cannot be changed as it serves as your unique candidate identity.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobile">
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                maxLength={10}
                className="form-control"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="qualification">
                Qualification
              </label>
              <input
                id="qualification"
                name="qualification"
                type="text"
                className="form-control"
                value={formData.qualification}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="college">
                College / Institution
              </label>
              <input
                id="college"
                name="college"
                type="text"
                className="form-control"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentProfilePage;
