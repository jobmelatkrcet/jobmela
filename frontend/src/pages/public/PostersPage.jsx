import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Maximize2,
  Download,
  Calendar,
  MapPin,
  Building2,
  Users,
  Award,
  Phone,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import poster1Img from '../../assets/jobmela-poster-1.jpg';
import poster2Img from '../../assets/jobmela-poster-2.jpg';

const PostersPage = () => {
  const [lightboxPoster, setLightboxPoster] = useState(null);

  const facultyCoordinators = [
    { name: 'V. Pranathi', role: 'Faculty Coordinator', phone: '+91 81214 49141' },
    { name: 'Srinivas Reddy', role: 'Faculty Coordinator', phone: '+91 99491 39414' },
    { name: 'Balakrishna Reddy', role: 'Faculty Coordinator', phone: '+91 99665 59298' },
    { name: 'Ashwini Reddy', role: 'Faculty Coordinator', phone: '+91 70754 50757' },
    { name: 'Gnanesh', role: 'Faculty Coordinator', phone: '+91 90524 52403' },
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #061121 0%, #0b1d3a 50%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '4rem 1.5rem 3.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="hero-ambient-sunflare" style={{ top: '-10%', right: '10%' }} />
        <div className="app-container" style={{ position: 'relative', zIndex: 2, maxWidth: 850 }}>
          <div
            className="badge"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '0.4rem 1.1rem',
              marginBottom: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Sparkles size={15} /> Official Event Circulars &amp; Notification
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4vw, 3.2rem)',
              fontWeight: 950,
              letterSpacing: '-0.02em',
              margin: '0.5rem 0 1rem',
              lineHeight: 1.15,
              color: '#ffffff',
            }}
          >
            Mega Job Mela 2026 <span style={{ color: '#38bdf8' }}>Official Posters</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: 720,
              margin: '0 auto 1.75rem',
            }}
          >
            Review the official dignitaries launch circular and complete candidate eligibility guidelines issued by TKR Educational Society. Click any poster to zoom in full clarity or download.
          </p>

          {/* Quick Stats Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(10px)',
              padding: '0.75rem 1.5rem',
              borderRadius: 999,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>
              <Calendar size={16} /> 31 October 2026
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 700 }}>
              <Building2 size={16} /> 150+ Top Companies
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#4ade80', fontSize: '0.9rem', fontWeight: 700 }}>
              <CheckCircle size={16} /> 100% Free Entry
            </span>
          </div>
        </div>
      </section>

      {/* Main Dual Poster Showcase Section */}
      <div className="app-container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
            gap: '2.5rem',
            alignItems: 'stretch',
          }}
        >
          {/* POSTER 1 CARD */}
          <div
            className="card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="badge badge-blue" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                Poster 1 • Chief Guest Launch
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                High Resolution Original
              </span>
            </div>

            {/* Poster 1 Frame */}
            <div
              style={{
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: '#061121',
                border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
              }}
              onClick={() =>
                setLightboxPoster({
                  src: poster1Img,
                  title: 'TKRCET Mega Job Mela 2026 - Chief Guest & Dignitaries Poster',
                })
              }
              title="Click to view full poster in high resolution"
            >
              <img
                src={poster1Img}
                alt="Mega Job Mela 2026 - Chief Guest Hon'ble CM Revanth Reddy"
                style={{
                  width: '100%',
                  maxHeight: 520,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  transition: 'transform 0.3s ease',
                }}
              />
              <div className="hero-poster-hover-overlay">
                <Maximize2 size={38} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Click to Zoom / View Fullscreen</span>
              </div>
            </div>

            {/* Details */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  VIP Dignitaries &amp; Mega Announcement
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Sponsored by <strong>TKR Educational Society</strong> (Approved by AICTE, Affiliated to JNTUH, NBA &amp; NAAC A+ Accredited).
                </p>
              </div>

              {/* Dignitaries Highlight Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Award size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, textTransform: 'uppercase' }}>
                      Chief Guest
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                      Sri Anumula Revanth Reddy
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Hon'ble Chief Minister of Telangana
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Award size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                      Guest of Honour
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                      Sri Duddilla Sridhar Babu
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Hon'ble IT Minister of Telangana
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxPoster({
                      src: poster1Img,
                      title: 'TKRCET Mega Job Mela 2026 - Chief Guest & Dignitaries Poster',
                    })
                  }
                  className="btn btn-outline"
                  style={{ flex: 1, gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Maximize2 size={16} /> View Fullscreen
                </button>
                <a
                  href={poster1Img}
                  download="TKRCET-Mega-Job-Mela-2026-VIP-Poster.jpg"
                  className="btn btn-primary"
                  style={{ flex: 1, gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          </div>

          {/* POSTER 2 CARD */}
          <div
            className="card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                Poster 2 • Eligibility &amp; Guidelines
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                High Resolution Original
              </span>
            </div>

            {/* Poster 2 Frame */}
            <div
              style={{
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: '#061121',
                border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
              }}
              onClick={() =>
                setLightboxPoster({
                  src: poster2Img,
                  title: 'TKRCET 31st Oct Mega Job Mela - Guidelines & Eligibility Poster',
                })
              }
              title="Click to view full poster in high resolution"
            >
              <img
                src={poster2Img}
                alt="Mega Job Mela 2026 - Guidelines & Eligibility"
                style={{
                  width: '100%',
                  maxHeight: 520,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  transition: 'transform 0.3s ease',
                }}
              />
              <div className="hero-poster-hover-overlay">
                <Maximize2 size={38} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Click to Zoom / View Fullscreen</span>
              </div>
            </div>

            {/* Details */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  Candidate Eligibility &amp; Event Drive
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Open for unemployed youth and students from across <strong>Pan India</strong> across all disciplines.
                </p>
              </div>

              {/* Eligibility Matrix */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 12,
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Eligible Educational Qualifications:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.45rem',
                    fontSize: '0.86rem',
                    color: '#15803d',
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} color="#16a34a" /> 10th / 12th Pass
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} color="#16a34a" /> ITI / Diploma
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} color="#16a34a" /> B.Tech / BE (All Streams)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} color="#16a34a" /> B.Sc, B.Com, BBA, BA
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} color="#16a34a" /> MCA / MBA / Post Graduates
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={15} color="#16a34a" /> Freshers &amp; Experienced
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxPoster({
                      src: poster2Img,
                      title: 'TKRCET 31st Oct Mega Job Mela - Guidelines & Eligibility Poster',
                    })
                  }
                  className="btn btn-outline"
                  style={{ flex: 1, gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Maximize2 size={16} /> View Fullscreen
                </button>
                <a
                  href={poster2Img}
                  download="TKRCET-Mega-Job-Mela-2026-Guidelines-Poster.jpg"
                  className="btn btn-primary"
                  style={{ flex: 1, gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Coordinators Section in exact requested order */}
        <div style={{ marginTop: '3.5rem' }}>
          <div className="card" style={{ padding: '2rem 2.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  Official Faculty Placement Coordinators
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  Contact coordinators directly for event-day guidance, registration queries, or corporate verification.
                </p>
              </div>
              <Link to="/contact" className="btn btn-outline btn-sm" style={{ gap: '0.45rem' }}>
                <Phone size={15} /> View Full Contact Directory →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1rem',
              }}
            >
              {facultyCoordinators.map((c, index) => (
                <div
                  key={c.name}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                    Faculty Coordinator
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {c.name}
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/\s+/g, '')}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#0284c7',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginTop: '0.35rem',
                    }}
                  >
                    <Phone size={14} /> {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div
          style={{
            marginTop: '3rem',
            background: 'linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
              Ready to Secure Your Dream Placement?
            </h3>
            <p style={{ margin: 0, color: '#e0f2fe', fontSize: '1rem' }}>
              Free spot registration is open for all eligible students. Over 150 top MNCs and local enterprises are hiring!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-warning" style={{ fontWeight: 800, padding: '0.85rem 1.75rem' }}>
              <span>REGISTER FOR FREE NOW</span>
              <ArrowRight size={17} style={{ marginLeft: '0.4rem' }} />
            </Link>
            <Link to="/companies" className="btn btn-outline" style={{ borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff' }}>
              Browse 150+ Companies
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Fullscreen Zoom Inspection */}
      {lightboxPoster && (
        <div
          className="poster-lightbox-backdrop"
          onClick={() => setLightboxPoster(null)}
        >
          <div
            className="poster-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="poster-lightbox-close"
              onClick={() => setLightboxPoster(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <img
              src={lightboxPoster.src}
              alt={lightboxPoster.title}
              className="poster-lightbox-img"
            />
            <div
              style={{
                marginTop: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                color: '#ffffff',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{lightboxPoster.title}</span>
              <a
                href={lightboxPoster.src}
                download
                className="btn btn-primary btn-sm"
                style={{ gap: '0.45rem', padding: '0.45rem 0.95rem' }}
              >
                <Download size={15} /> Download Poster
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostersPage;
