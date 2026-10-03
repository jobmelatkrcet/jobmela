import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Building2,
  Users,
  GraduationCap,
  ArrowRight,
  Search,
  CheckCircle,
  Phone,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, isStudent, isAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCompanies();
  }, []);

  const fetchFeaturedCompanies = async (query = '') => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({ page: 1, search: query, page_size: 12 });
      setCompanies(data.results || []);
      setTotalCompanies(data.count || 0);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFeaturedCompanies(search);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="app-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            {/* Official Logo & Accreditation */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src="/tkrcet-official-logo.png"
                alt="TKRCET Logo"
                className="hero-logo-img"
              />
              <div className="hero-institution-title">
                TKR College of Engineering &amp; Technology (Autonomous)
              </div>
              <div className="hero-institution-motto">
                "Indian in Character, International in Excellence" • Approved by AICTE • Affiliated to JNTUH
              </div>
              <div className="hero-accreditation-pill">
                <Award size={14} /> NAAC "A+" Grade Accredited • NBA Tier-1 Accredited
              </div>
            </div>

            <h1 className="hero-main-title">
              TKRCET JOB MELA <span style={{ color: '#60a5fa' }}>2026</span>
            </h1>

            <p className="hero-description">
              Organized by <strong>TKR College of Engineering &amp; Technology</strong> to provide
              employment opportunities for students from diverse educational backgrounds.
            </p>

            {/* Event Highlights Badges */}
            <div className="hero-highlights-grid">
              <div className="hero-highlight-chip">
                <Calendar size={18} color="#38bdf8" />
                <span>31 OCTOBER 2026</span>
              </div>

              <div className="hero-highlight-chip">
                <Building2 size={18} color="#4ade80" />
                <span>100+ Companies Expected</span>
              </div>

              <div className="hero-highlight-chip">
                <Users size={18} color="#fcd34d" />
                <span>10,000+ Students Expected</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="hero-ctas-container">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-lg"
                    style={{
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                    }}
                  >
                    REGISTER NOW <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#ffffff',
                    }}
                  >
                    STUDENT LOGIN
                  </Link>
                </>
              ) : isStudent ? (
                <>
                  <Link to="/companies" className="btn btn-primary btn-lg">
                    Browse Companies & Apply <ArrowRight size={18} />
                  </Link>
                  <Link to="/dashboard" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#fff' }}>
                    Go to My Dashboard
                  </Link>
                </>
              ) : (
                <Link to="/admin" className="btn btn-primary btn-lg" style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
                  Open Admin Command Center <ArrowRight size={18} />
                </Link>
              )}
            </div>

            <div className="hero-venue-row">
              <MapPin size={16} color="#38bdf8" /> Venue: TKR College of Engineering &amp; Technology, Medbowli, Meerpet, Hyderabad
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences / Educational Eligibility */}
      <section style={{ padding: '4rem 0', backgroundColor: '#ffffff' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              Inclusive Employment Drive
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
              Open to candidates across diverse academic levels and institutions.
            </p>
          </div>

          <div className="grid-4col-responsive">
            {[
              {
                title: 'B.Tech / B.E.',
                desc: 'CSE, ECE, EEE, Mechanical, Civil & Allied Engineering Streams',
              },
              {
                title: 'Degree Graduates',
                desc: 'B.Sc, B.Com, BBA, BCA, BA and equivalent degree disciplines',
              },
              {
                title: 'Diploma Holders',
                desc: 'All Polytechnic engineering and technical diploma certifications',
              },
              {
                title: '10th & Intermediate',
                desc: 'Eligible candidates seeking early career openings and entry-level positions',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="card card-hover"
                style={{
                  borderTop: '4px solid var(--color-brand-600)',
                  textAlign: 'center',
                  padding: '2rem 1.5rem',
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-brand-50)',
                    color: 'var(--color-brand-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <GraduationCap size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participating Companies Preview */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8fafc' }}>
        <div className="app-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-brand-600)',
                  letterSpacing: '0.06em',
                  marginBottom: '0.35rem',
                }}
              >
                Recruiting Campuses & Organizations
              </div>
              <h2 style={{ fontSize: '2rem' }}>Participating Companies</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Currently displaying verified participating companies from our central database.
              </p>
            </div>

            {/* Quick search input */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: 360 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search company name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search
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
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="spinner spinner-primary" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Loading participating companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--color-text-muted)' }}
            >
              <Building2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>No companies found matching "{search}"</h3>
              <p style={{ marginTop: '0.5rem' }}>Try clearing your search query or check back soon.</p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearch('');
                  fetchFeaturedCompanies('');
                }}
                style={{ marginTop: '1rem' }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                  gap: '1.25rem',
                }}
              >
                {companies.map((comp) => (
                  <div
                    key={comp.id}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '1.35rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-brand-50)',
                          color: 'var(--color-brand-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        {comp.name.charAt(0).toUpperCase()}
                      </div>
                      <h4
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: 'var(--color-primary-900)',
                          lineHeight: 1.3,
                        }}
                      >
                        {comp.name}
                      </h4>
                    </div>

                    <div
                      style={{
                        marginTop: '1.25rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        Participating Recruiter
                      </span>

                      {isAuthenticated && isStudent ? (
                        comp.has_applied ? (
                          <span className="badge badge-applied">✓ Applied</span>
                        ) : (
                          <Link to="/companies" className="btn btn-outline btn-sm">
                            Apply
                          </Link>
                        )
                      ) : (
                        <Link to="/login" className="btn btn-outline btn-sm">
                          Register to Apply
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Link to="/companies" className="btn btn-primary">
                  View All Companies ({totalCompanies}) <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Event Details Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="app-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-brand-600)',
                  letterSpacing: '0.06em',
                  marginBottom: '0.35rem',
                }}
              >
                Key Event Information
              </div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1.25rem' }}>
                Event Schedule & Venue
              </h2>
              <p style={{ color: 'var(--color-primary-700)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                The TKRCET Job Mela 2026 brings together renowned industry partners and ambitious job
                seekers under one roof. Registered students can apply to multiple organizations and
                participate in recruitment interactions on the event day.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand-50)',
                      color: 'var(--color-brand-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Date of Job Mela</h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      Saturday, 31 October 2026
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand-50)',
                      color: 'var(--color-brand-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Event Venue</h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      TKR College of Engineering & Technology (TKRCET) Campus
                      <br />
                      Medbowli, Meerpet, Saroornagar, Hyderabad, Telangana — 500097
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinator Contact Card */}
            <div
              className="card"
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <h3 style={{ color: '#ffffff', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
                Need Assistance? Contact Organizers
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '2rem' }}>
                For general event queries, student registration guidance, or college coordination,
                feel free to reach out to our placement team.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    padding: '1.15rem 1.35rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #334155',
                  }}
                >
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Placement Coordinator
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
                    Srinivas Reddy
                  </div>
                  <a
                    href="tel:9949139414"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      color: '#38bdf8',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    <Phone size={16} /> 9949139414
                  </a>
                </div>

                <div
                  style={{
                    backgroundColor: '#1e293b',
                    padding: '1.15rem 1.35rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #334155',
                  }}
                >
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Placement Coordinator
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
                    Ashwini Reddy
                  </div>
                  <a
                    href="tel:7075450757"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      color: '#38bdf8',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    <Phone size={16} /> 7075450757
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
