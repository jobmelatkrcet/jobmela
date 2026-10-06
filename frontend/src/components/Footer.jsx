import React from 'react';
import { Calendar, MapPin, Phone, Award, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#091e42',
        color: '#94a3b8',
        padding: '3.5rem 0 1.5rem',
        marginTop: 'auto',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1: About TKRCET & Event */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <img
                src="/tkrcet-official-logo.png"
                alt="TKRCET Logo"
                style={{ width: 48, height: 48, objectFit: 'contain' }}
              />
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  TKR College of Engineering &amp; Technology
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                  (Autonomous) • NAAC "A+" Grade Accredited
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.86rem', lineHeight: '1.6', marginBottom: '1rem', color: '#cbd5e1' }}>
              TKRCET Job Mela 2026 is organized by the Training &amp; Placement Cell to provide employment opportunities to students from diverse educational backgrounds (10th, Diploma, Degree, B.Tech and allied streams).
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fef08a',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <Award size={14} /> Approved by AICTE • Affiliated to JNTUH
            </div>
          </div>

          {/* Col 2: Event Details */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '1rem',
                marginBottom: '1.25rem',
                fontWeight: 700,
              }}
            >
              Event Information
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Calendar size={18} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#f1f5f9' }}>Date:</strong> 31 October 2026 (Saturday)
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem' }}>
                <MapPin size={18} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#f1f5f9' }}>Venue:</strong>
                  <br />
                  TKR College of Engineering &amp; Technology (TKRCET Campus)
                  <br />
                  Medbowli, Meerpet, Saroornagar,
                  <br />
                  Hyderabad, Telangana — 500097
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Coordinators */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '1rem',
                marginBottom: '1.25rem',
                fontWeight: 700,
              }}
            >
              Faculty Coordinators
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem' }}>
              {[
                { name: 'V. Pranathi', phone: '8121449141', displayPhone: '+91 81214 49141' },
                { name: 'Srinivas Reddy', phone: '9949139414', displayPhone: '+91 99491 39414' },
                { name: 'Balakrishna Reddy', phone: '9966559298', displayPhone: '+91 99665 59298' },
                { name: 'Ashwini Reddy', phone: '7075450757', displayPhone: '+91 70754 50757' },
                { name: 'M. Gnanesh', phone: '9052452403', displayPhone: '+91 90524 52403' },
              ].map((coord) => (
                <div
                  key={coord.phone}
                  style={{
                    backgroundColor: '#0f274e',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #1e3a8a',
                  }}
                >
                  <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.88rem' }}>{coord.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
                    <Phone size={13} color="#4ade80" />
                    <a
                      href={`tel:${coord.phone}`}
                      style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none', fontSize: '0.84rem' }}
                    >
                      {coord.displayPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 4: Portals */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '1rem',
                marginBottom: '1.25rem',
                fontWeight: 700,
              }}
            >
              Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <Link to="/register" style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                  → Student Registration
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                  → Student Login
                </Link>
              </li>
              <li>
                <Link to="/companies" style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                  → Participating Companies
                </Link>
              </li>
              <li>
                <Link to="/admin/login" style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                  → Organizer Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
          }}
        >
          <div>
            © 2026 TKR College of Engineering &amp; Technology (TKRCET). All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '1rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
            <span>EAMCET Code: <strong>TKRC</strong></span>
            <span>Date: <strong>31 October 2026</strong></span>
            <span>Hyderabad, Telangana</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
