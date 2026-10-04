import React from 'react';
import { Phone, MapPin, Calendar, Mail, UserCheck, Clock } from 'lucide-react';

const ContactPage = () => {
  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="app-container">
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem' }}>
          <div className="badge badge-blue" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
            Get In Touch
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', marginBottom: '1rem' }}>
            Event Coordinators & Contact
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Contact the placement coordinators of TKRCET Job Mela 2026 for inquiries regarding
            student participation, verification, or corporate registration.
          </p>
        </div>

        {/* Coordinators Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {[
            { name: 'Srinivas Reddy', phone: '9949139414', role: 'Organizing Coordinator' },
            { name: 'Ashwini Reddy', phone: '7075450757', role: 'Organizing Coordinator' },
            { name: 'V. Pranthi', phone: '8121449141', role: 'Placement Coordinator' },
            { name: 'Gnanesh', phone: '9052452403', role: 'Placement Coordinator' },
            { name: 'BalaKrishna Reddy', phone: '9966559298', role: 'Placement Coordinator' },
          ].map((coord, idx) => (
            <div
              key={idx}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderTop: '5px solid var(--color-brand-600)',
                padding: '2rem 1.5rem',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-50)',
                  color: 'var(--color-brand-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <UserCheck size={32} />
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--color-brand-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.25rem',
                }}
              >
                {coord.role}
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{coord.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                TKR College of Engineering &amp; Technology
              </p>

              <a
                href={`tel:${coord.phone}`}
                className="btn btn-primary"
                style={{ width: '100%', gap: '0.65rem', fontSize: '0.98rem', padding: '0.65rem 1rem' }}
              >
                <Phone size={17} /> {coord.phone}
              </a>
            </div>
          ))}
        </div>

        {/* Venue Information */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <MapPin size={22} color="var(--color-brand-600)" />
              <h3 style={{ fontSize: '1.25rem' }}>Campus Location</h3>
            </div>
            <p style={{ color: 'var(--color-primary-700)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              <strong>TKR College of Engineering & Technology</strong>
              <br />
              Medbowli, Meerpet, Saroornagar,
              <br />
              Hyderabad, Telangana — 500097
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Calendar size={22} color="var(--color-brand-600)" />
              <h3 style={{ fontSize: '1.25rem' }}>Event Timing</h3>
            </div>
            <p style={{ color: 'var(--color-primary-700)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              <strong>Date:</strong> 31 October 2026 (Saturday)
              <br />
              <strong>Entry:</strong> Valid student registration confirmation
              <br />
              <strong>Reporting Time:</strong> 8:30 AM onwards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
