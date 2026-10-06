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

        {/* Faculty Coordinators Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-900)', marginBottom: '0.35rem' }}>
            Faculty Coordinators
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            Official institutional faculty representatives for TKRCET Mega Job Mela 2026.
          </p>
        </div>

        {/* Faculty Coordinators Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          {[
            { name: 'V. Pranathi', phone: '8121449141', displayPhone: '+91 81214 49141', role: 'Faculty Coordinator' },
            { name: 'Srinivas Reddy', phone: '9949139414', displayPhone: '+91 99491 39414', role: 'Faculty Coordinator' },
            { name: 'Parashina Balakrishna Reddy', phone: '9966559298', displayPhone: '+91 99665 59298', role: 'Faculty Coordinator' },
            { name: 'Ashwini Reddy', phone: '7075450757', displayPhone: '+91 70754 50757', role: 'Faculty Coordinator' },
            { name: 'M. Gnanesh', phone: '9052452403', displayPhone: '+91 90524 52403', role: 'Faculty Coordinator' },
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
                padding: '1.75rem 1.25rem',
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-50)',
                  color: 'var(--color-brand-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.85rem',
                }}
              >
                <UserCheck size={28} />
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-brand-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.25rem',
                }}
              >
                {coord.role}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{coord.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
                TKRCET Campus
              </p>

              <a
                href={`tel:${coord.phone}`}
                className="btn btn-primary"
                style={{ width: '100%', gap: '0.5rem', fontSize: '0.92rem', padding: '0.6rem 0.85rem', marginTop: 'auto' }}
              >
                <Phone size={15} /> {coord.displayPhone}
              </a>
            </div>
          ))}
        </div>

        {/* Student Coordinators Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-900)', marginBottom: '0.35rem' }}>
            Student Coordinators
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            Candidate support & campus navigation assistance desk.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.25rem',
            marginBottom: '3.5rem',
          }}
        >
          {[
            { name: 'P. Siddartha', phone: '8019198059', displayPhone: '+91 80191 98059', role: 'Student Coordinator' },
            { name: 'M. Dilip', phone: '8919298459', displayPhone: '+91 89192 98459', role: 'Student Coordinator' },
          ].map((coord, idx) => (
            <div
              key={idx}
              className="card card-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderLeft: '4px solid #10b981',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  {coord.role}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary-900)', marginTop: '0.2rem' }}>
                  {coord.name}
                </div>
              </div>
              <a
                href={`tel:${coord.phone}`}
                className="btn btn-outline"
                style={{ gap: '0.5rem', fontSize: '0.9rem', padding: '0.55rem 0.95rem' }}
              >
                <Phone size={15} color="#059669" /> {coord.displayPhone}
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
