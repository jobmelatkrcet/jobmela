import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  Send,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Sparkles,
  ShieldAlert,
  Calendar,
  Building2,
  FileCheck,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_GROUP_URL } from '../utils/constants';

const PRESETS = [
  {
    title: 'Schedule & Guidelines',
    subject: 'Official Update: TKRCET Mega Job Mela 2026 Schedule & Guidelines',
    message: `Dear Candidates,

We are pleased to invite you to the TKRCET Mega Job Mela 2026. Over 150+ leading multinational companies and emerging enterprises will be conducting on-campus recruitment.

Important Event Guidelines:
1. Date: Saturday, 31 October 2026.
2. Reporting Time: Gates open at 8:30 AM.
3. Dress Code: Formal / professional attire only.
4. Mandatory Documents: Please bring at least 3-4 printed copies of your resume, 2 passport-size photographs, and photocopies of your educational certificates.

Please join our official WhatsApp group for live company spot announcements, interview round shortlists, and room allocations on the event day.`,
  },
  {
    title: 'Required Documents Checklist',
    subject: 'Action Required: Documents & Resume Checklist for TKRCET Job Mela 2026',
    message: `Dear Candidates,

To ensure smooth gate entry and seamless interview coordination at the TKRCET Mega Job Mela 2026 on 31 October 2026, please ensure you carry:

• 3-5 hard copies of your updated resume
• 3 passport-size color photographs
• Government photo ID proof (Aadhaar / Voter ID / Driving License)
• Photocopies of educational marksheets (10th / Diploma / Degree / B.Tech)
• Blue or black ballpoint pens and a writing pad

Join the official WhatsApp group for real-time announcements.`,
  },
  {
    title: 'WhatsApp Group Invitation',
    subject: 'Important: Join the Official TKRCET Job Mela 2026 WhatsApp Group',
    message: `Dear Candidates,

To ensure you receive instant, real-time updates during the TKRCET Mega Job Mela 2026, we have established the official Candidates WhatsApp Community.

Joining this group will provide you with:
• Live company arrival notices and spot interview openings
• Round-by-round candidate shortlists
• Specific room and hall ticket coordination
• Direct helpdesk support on 31 October 2026

Please click the button below to join the WhatsApp group immediately.`,
  },
];

const AdminBroadcastEmailModal = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [target, setTarget] = useState('all_students'); // 'all_students' | 'with_applications' | 'test_self'
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [message, setMessage] = useState(PRESETS[0].message);
  const [includeWhatsapp, setIncludeWhatsapp] = useState(true);

  const [viewTab, setViewTab] = useState('edit'); // 'edit' | 'preview'
  const [sending, setSending] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  // Fetch real-time candidate statistics when opened
  useEffect(() => {
    if (isOpen) {
      setStatusResult(null);
      setConfirmSendOpen(false);
      fetchStats();
    }
  }, [isOpen]);

  const extractErrorMessage = (err, defaultFallback) => {
    if (!err) return defaultFallback;
    if (err.response?.data) {
      const d = err.response.data;
      if (typeof d === 'string') return d;
      if (d.error) return d.error;
      if (d.detail) return d.detail;
      if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors.join('; ');
      if (d.message) return d.message;
    }
    if (err.message) return err.message;
    return defaultFallback;
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await adminService.getBroadcastEmailStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load broadcast email statistics:', err);
      const errMsg = extractErrorMessage(
        err,
        'Unable to load candidate statistics from backend'
      );
      setStatusResult({
        type: 'error',
        title: 'Audience Statistics Unavailable',
        message: `${errMsg}. Please ensure your administrator session is active.`,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isOpen) return null;

  const getRecipientCount = () => {
    if (loadingStats) return '...';
    if (!stats) return '...';
    if (target === 'test_self') return 1;
    if (target === 'with_applications') return stats.students_with_applications || 0;
    return stats.students_with_email || stats.total_registered_students || 0;
  };

  const handleApplyPreset = (preset) => {
    setSubject(preset.subject);
    setMessage(preset.message);
    setStatusResult(null);
  };

  const handleSendTestToSelf = async () => {
    setSending(true);
    setStatusResult(null);
    try {
      const res = await adminService.sendBroadcastEmail({
        subject,
        message,
        target: 'test_self',
        include_whatsapp: includeWhatsapp,
      });
      setStatusResult({
        type: 'success',
        title: 'Test Email Dispatched!',
        message:
          res.message ||
          `Sample preview email sent to your administrator address (${stats?.admin_email || 'admin'}). Check your inbox!`,
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        'Failed to dispatch test email. Please check your SMTP configuration.'
      );
      setStatusResult({
        type: 'error',
        title: 'Test Delivery Failed',
        message: errorMsg,
      });
    } finally {
      setSending(false);
    }
  };

  const handleExecuteBroadcast = async () => {
    setConfirmSendOpen(false);
    setSending(true);
    setStatusResult(null);
    try {
      const res = await adminService.sendBroadcastEmail({
        subject,
        message,
        target,
        include_whatsapp: includeWhatsapp,
      });
      setStatusResult({
        type: 'success',
        title: 'Broadcast Dispatched Successfully!',
        message:
          res.message ||
          `Successfully delivered email to ${res.sent_count} registered participants.`,
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        'Failed to dispatch broadcast emails. Please review your email settings.'
      );
      setStatusResult({
        type: 'error',
        title: 'Broadcast Dispatch Error',
        message: errorMsg,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="broadcast-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !sending) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="broadcast-modal-card">
        {/* Modal Header */}
        <div className="broadcast-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff' }}>
                Broadcast Email to Registered Participants
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#bfdbfe' }}>
                TKRCET Mega Job Mela 2026 • One-Shot Direct Announcement System
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: 0.8,
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="broadcast-modal-body">
          {/* Status Alert */}
          {statusResult && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor:
                  statusResult.type === 'success' ? '#ecfdf5' : '#fef2f2',
                border: `1.5px solid ${
                  statusResult.type === 'success' ? '#86efac' : '#fca5a5'
                }`,
                color: statusResult.type === 'success' ? '#065f46' : '#991b1b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}
            >
              {statusResult.type === 'success' ? (
                <CheckCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
              ) : (
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
              )}
              <div style={{ fontSize: '0.88rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                  {statusResult.title}
                </strong>
                <span>{statusResult.message}</span>
              </div>
            </div>
          )}

          {/* SMTP Not Configured Warning */}
          {stats && stats.smtp_configured === false && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffbeb',
                border: '1.5px solid #fde68a',
                color: '#92400e',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 1, color: '#d97706' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                  SMTP Credentials Not Configured on Server
                </strong>
                <span>
                  The backend server has no active <code>EMAIL_HOST_USER</code> or <code>EMAIL_HOST_PASSWORD</code> environment variables set. Please configure your Hostinger/SMTP environment variables in your server/Vercel dashboard.
                </span>
              </div>
            </div>
          )}

          {/* 1. Recipient Target Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--color-primary-900)',
                marginBottom: '0.5rem',
              }}
            >
              Select Target Audience
            </label>
            <div className="broadcast-target-pills">
              {/* All Students */}
              <div
                className={`broadcast-target-pill ${
                  target === 'all_students' ? 'selected' : ''
                }`}
                onClick={() => setTarget('all_students')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-900)' }}>
                    All Registered Candidates
                  </strong>
                  <span className="badge badge-blue">
                    {stats?.students_with_email || stats?.total_registered_students || 0}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Sends to every active participant with a valid email.
                </span>
              </div>

              {/* Students with Applications */}
              <div
                className={`broadcast-target-pill ${
                  target === 'with_applications' ? 'selected' : ''
                }`}
                onClick={() => setTarget('with_applications')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-900)' }}>
                    Applied Candidates Only
                  </strong>
                  <span className="badge badge-emerald">
                    {stats?.students_with_applications || 0}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Students who submitted at least 1 company application.
                </span>
              </div>

              {/* Test Self */}
              <div
                className={`broadcast-target-pill ${
                  target === 'test_self' ? 'selected' : ''
                }`}
                onClick={() => setTarget('test_self')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-900)' }}>
                    Test to Myself
                  </strong>
                  <span className="badge badge-amber">Preview</span>
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={stats?.admin_email}
                >
                  Deliver test sample only to {stats?.admin_email || 'your email'}.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginBottom: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
              }}
            >
              <Sparkles size={14} color="#f59e0b" />
              <span>Load Official Announcement Template:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label
              htmlFor="broadcast-subject-input"
              style={{
                display: 'block',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--color-primary-900)',
                marginBottom: '0.35rem',
              }}
            >
              Email Subject Line <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="broadcast-subject-input"
              type="text"
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Important Announcement: Gate Entry & Schedule for TKRCET Job Mela 2026"
              style={{ fontSize: '0.92rem', padding: '0.65rem 0.85rem' }}
              disabled={sending}
            />
          </div>

          {/* Editor & Preview Tabs */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.45rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-900)',
                  margin: 0,
                }}
              >
                Message Body <span style={{ color: '#dc2626' }}>*</span>
              </label>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setViewTab('edit')}
                  className={`btn btn-sm ${
                    viewTab === 'edit' ? 'btn-primary' : 'btn-outline'
                  }`}
                  style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                >
                  <Edit3 size={13} /> Edit Text
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('preview')}
                  className={`btn btn-sm ${
                    viewTab === 'preview' ? 'btn-primary' : 'btn-outline'
                  }`}
                  style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                >
                  <Eye size={13} /> Live Preview
                </button>
              </div>
            </div>

            {viewTab === 'edit' ? (
              <textarea
                className="form-control"
                rows={9}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement details here. Blank lines will be formatted into neat paragraphs..."
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  padding: '0.75rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                disabled={sending}
              />
            ) : (
              <div className="broadcast-preview-box">
                <div
                  style={{
                    backgroundColor: '#091e42',
                    color: '#ffffff',
                    padding: '1rem',
                    borderRadius: '8px 8px 0 0',
                    textAlign: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      background: '#f59e0b',
                      color: '#0f172a',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      textTransform: 'uppercase',
                    }}
                  >
                    Official Announcement
                  </span>
                  <h4 style={{ margin: '0.35rem 0 0', color: '#ffffff', fontSize: '1.05rem' }}>
                    TKRCET Mega Job Mela 2026
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                    TKR College of Engineering &amp; Technology, Hyderabad
                  </div>
                </div>

                <div style={{ padding: '0 0.5rem' }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                    Dear Candidate (Personalized with Student Name),
                  </p>
                  <div style={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: 1.6 }}>
                    {message || '(No message content entered yet)'}
                  </div>

                  {includeWhatsapp && (
                    <div
                      style={{
                        margin: '1.25rem 0',
                        background: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        borderRadius: 10,
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <span
                        style={{
                          background: '#22c55e',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 9999,
                        }}
                      >
                        Official Community
                      </span>
                      <h5 style={{ margin: '0.35rem 0 0.25rem', color: '#065f46', fontSize: '0.95rem' }}>
                        Join TKRCET Job Mela WhatsApp Group
                      </h5>
                      <p style={{ margin: '0 0 0.65rem', fontSize: '0.78rem', color: '#047857' }}>
                        Get real-time announcements on company arrivals and interview schedules.
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          background: '#25D366',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          padding: '0.4rem 0.95rem',
                          borderRadius: 6,
                        }}
                      >
                        👉 Join WhatsApp Group Now
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.76rem',
                      color: '#475569',
                      marginTop: '1rem',
                    }}
                  >
                    <div>🗓 <strong>Date:</strong> 31 October 2026 • 📍 <strong>Venue:</strong> TKRCET Campus, Hyderabad</div>
                    <div>📞 <strong>Helplines:</strong> 9949139414 / 7075450757</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Include Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <input
              id="include-whatsapp-checkbox"
              type="checkbox"
              checked={includeWhatsapp}
              onChange={(e) => setIncludeWhatsapp(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#16a34a', cursor: 'pointer' }}
              disabled={sending}
            />
            <label
              htmlFor="include-whatsapp-checkbox"
              style={{
                fontSize: '0.88rem',
                color: '#065f46',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <WhatsAppIcon size={18} color="#25D366" />
              <span>Include Official WhatsApp Group Invite &amp; Button in Email</span>
            </label>
          </div>

          {/* Double Confirmation Warning Prompt */}
          {confirmSendOpen && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '2px solid #f59e0b',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
                <ShieldAlert size={20} color="#b45309" />
                <strong style={{ fontSize: '0.95rem' }}>
                  Confirm Mass Email Broadcast
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350f', lineHeight: 1.5 }}>
                You are about to send this email notification directly to{' '}
                <strong>{getRecipientCount()} registered participants</strong> in one shot.
                This action cannot be undone. Are you sure you want to proceed?
              </p>
              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setConfirmSendOpen(false)}
                  className="btn btn-outline btn-sm"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBroadcast}
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626',
                    color: '#ffffff',
                  }}
                  disabled={sending}
                >
                  Yes, Send Broadcast Now ({getRecipientCount()})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="broadcast-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
            <Users size={16} />
            <span>
              Target:{' '}
              <strong style={{ color: 'var(--color-primary-900)' }}>
                {getRecipientCount()} Recipients
              </strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleSendTestToSelf}
              className="btn btn-outline btn-sm"
              disabled={sending || !subject.trim() || !message.trim()}
              title="Dispatches a sample test email directly to your logged-in administrator email"
            >
              <Mail size={15} /> Send Test to Myself
            </button>

            {target === 'test_self' ? (
              <button
                type="button"
                onClick={handleSendTestToSelf}
                className="btn btn-primary btn-sm"
                disabled={sending || !subject.trim() || !message.trim()}
              >
                {sending ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Test Email
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmSendOpen(true)}
                className="btn btn-primary btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                }}
                disabled={
                  sending ||
                  confirmSendOpen ||
                  !subject.trim() ||
                  !message.trim() ||
                  getRecipientCount() === 0
                }
              >
                {sending ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Sending to {getRecipientCount()} Participants...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send to All Registered Participants ({getRecipientCount()})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcastEmailModal;
