import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Landmark,
  Laptop,
  Factory,
  HeartPulse,
  Cpu,
  Plane,
  Briefcase,
  Layers,
  IndianRupee,
  DoorClosed,
  Grid,
  ListFilter,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, getCompanyCategory } from '../../utils/companyCategories';

const CATEGORY_ICONS = {
  all: Building2,
  banking: Landmark,
  it_product: Laptop,
  manufacturing: Factory,
  bpo_services: Briefcase,
  healthcare: HeartPulse,
  core_engineering: Cpu,
  logistics: Plane,
  general: Layers,
};

const HomePage = () => {
  const { isAuthenticated, isStudent, isAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('segregated'); // 'segregated' or 'grid'

  useEffect(() => {
    fetchFeaturedCompanies();
  }, []);

  const fetchFeaturedCompanies = async (query = '') => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({ page: 1, search: query, page_size: 200 });
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

  // Group companies by category
  const categorizedData = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') groups[cat.id] = [];
    });

    companies.forEach((comp) => {
      const cat = getCompanyCategory(comp);
      const catId = groups[cat.id] ? cat.id : 'general';
      groups[catId].push(comp);
    });

    return groups;
  }, [companies]);

  // Real company count per category
  const categoryCounts = useMemo(() => {
    const counts = { all: companies.length };
    CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = (categorizedData[cat.id] || []).length;
      }
    });
    return counts;
  }, [companies, categorizedData]);

  // Filtered companies based on active pill
  const filteredCompanies = useMemo(() => {
    if (selectedCategory === 'all') return companies;
    return categorizedData[selectedCategory] || [];
  }, [selectedCategory, companies, categorizedData]);

  return (
    <div>
      {/* Exact Reference Hero Design matching user's mockup */}
      <section className="hero-ref-wrapper">
        <img
          src="/college-campus.webp"
          alt="TKRCET Campus"
          className="hero-ref-bg"
        />
        <div className="hero-ref-overlay" />

        <div className="hero-ref-container">
          {/* 1. Grand Event Title Block - HIGHLIGHT ONLY JOB MELA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="hero-title-container"
          >
            <div className="hero-mega-label">MEGA</div>

            {/* Specially Highlighted JOB MELA */}
            <div className="hero-jobmela-highlight-wrap">
              <div className="hero-jobmela-glow-backdrop" />
              <h1 className="hero-jobmela-label">JOB MELA</h1>
            </div>

            <div className="hero-year-wrapper">
              <span className="hero-year-text">2026</span>
              <svg className="hero-year-swoosh" viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10 18 Q 80 4 190 8 Q 110 24 10 18 Z" fill="url(#swooshGradient)" />
                <defs>
                  <linearGradient id="swooshGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="45%" stopColor="#0284c7" />
                    <stop offset="80%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* 2. Organized By Section with College Motto */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="hero-organized-section"
          >
            <div className="hero-org-divider-row">
              <div className="hero-org-line" />
              <span className="hero-org-label">Organized by</span>
              <div className="hero-org-line" />
            </div>
            <div className="hero-org-college-name">
              TKR College of Engineering &amp; Technology
            </div>
            <div className="hero-org-autonomous">
              (Autonomous)
            </div>

            {/* College Motto */}
            <div className="hero-institution-motto">
              “Indian in Character, International in Excellence”
            </div>
          </motion.div>

          {/* 5. Description */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="hero-description-match"
          >
            Connecting students from all streams with 150+ premier multinational recruiters and emerging enterprises.
          </motion.p>

          {/* 6. Event Highlights (Wide Horizontal Stats) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.38 }}
            className="hero-stats-row"
          >
            <div className="hero-stat-col">
              <div className="hero-stat-icon-wrapper" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.14)' }}>
                <Calendar size={18} color="#38bdf8" />
              </div>
              <div className="hero-stat-val">31 OCT 2026</div>
              <div className="hero-stat-lbl">Event Date</div>
            </div>

            <div className="hero-stat-divider" />

            <div className="hero-stat-col">
              <div className="hero-stat-icon-wrapper" style={{ borderColor: 'rgba(74, 222, 128, 0.4)', background: 'rgba(74, 222, 128, 0.14)' }}>
                <Building2 size={18} color="#4ade80" />
              </div>
              <div className="hero-stat-val">150+</div>
              <div className="hero-stat-lbl">Companies</div>
            </div>

            <div className="hero-stat-divider" />

            <div className="hero-stat-col">
              <div className="hero-stat-icon-wrapper" style={{ borderColor: 'rgba(252, 211, 77, 0.4)', background: 'rgba(252, 211, 77, 0.14)' }}>
                <Users size={18} color="#fcd34d" />
              </div>
              <div className="hero-stat-val">10,000+</div>
              <div className="hero-stat-lbl">Candidates</div>
            </div>
          </motion.div>

          {/* 7. Action Buttons (Side by Side Centered) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.44 }}
            className="hero-actions-row"
          >
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="hero-btn-register">
                  <span>REGISTER NOW</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="hero-btn-login">
                  <span>STUDENT LOGIN</span>
                  <ArrowRight size={18} />
                </Link>
              </>
            ) : isStudent ? (
              <>
                <Link to="/companies" className="hero-btn-register" style={{ maxWidth: 300 }}>
                  <span>EXPLORE 150+ COMPANIES</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/dashboard" className="hero-btn-login" style={{ maxWidth: 220 }}>
                  <span>MY DASHBOARD</span>
                  <ArrowRight size={18} />
                </Link>
              </>
            ) : (
              <Link
                to="/admin"
                className="hero-btn-register"
                style={{ maxWidth: 340, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#0f172a' }}
              >
                <ShieldCheck size={18} />
                <span>ADMIN COMMAND CENTER</span>
                <ArrowRight size={18} />
              </Link>
            )}
          </motion.div>

          {/* 8. Venue Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.5 }}
            className="hero-venue-block"
          >
            <div className="hero-venue-pin-circle">
              <MapPin size={17} color="#38bdf8" />
            </div>
            <div className="hero-venue-vdivider" />
            <div className="hero-venue-details">
              <div className="hero-venue-label">Venue</div>
              <div className="hero-venue-name">TKR College of Engineering &amp; Technology</div>
              <div className="hero-venue-sub">Medbowli, Meerpet, Hyderabad</div>
            </div>
          </motion.div>

          {/* Downward Chevron Scroll Indicator */}
          <motion.div
            className="hero-scroll-indicator"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => {
              window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
            }}
          >
            <ChevronDown size={24} color="rgba(255, 255, 255, 0.7)" />
          </motion.div>
        </div>
      </section>

      {/* Floating Key Benefits Strip (4 High-Impact Value Props) */}
      <section className="hero-benefits-strip">
        <div className="app-container">
          <div className="hero-benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div className="benefit-text-title">150+ Top Recruiters</div>
                <div className="benefit-text-desc">IT, Core Engineering, Banking &amp; Healthcare</div>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                <CheckCircle size={22} />
              </div>
              <div>
                <div className="benefit-text-title">Spot Offer Letters</div>
                <div className="benefit-text-desc">Immediate on-campus recruitment &amp; interviews</div>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <div className="benefit-text-title">All Degrees Eligible</div>
                <div className="benefit-text-desc">B.Tech, B.Sc, B.Com, MBA, MCA &amp; Diploma</div>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-box" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="benefit-text-title">100% Free Registration</div>
                <div className="benefit-text-desc">Zero entry fees for candidates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences / Educational Eligibility */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem' }}
          >
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
              Eligibility & Streams
            </div>
            <h2 style={{ fontSize: '2.1rem', marginBottom: '0.75rem', color: 'var(--color-primary-900)' }}>
              Inclusive Employment Drive
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Open to candidates across diverse academic levels, disciplines, and higher education institutions.
            </p>
          </motion.div>

          <div className="grid-4col-responsive">
            {[
              {
                title: 'B.Tech / B.E.',
                desc: 'CSE, ECE, EEE, Mechanical, Civil & Allied Engineering Streams',
                color: '#2563eb',
                bg: '#eff6ff',
                border: '#bfdbfe',
              },
              {
                title: 'Degree Graduates',
                desc: 'B.Sc, B.Com, BBA, BCA, BA and equivalent degree disciplines',
                color: '#059669',
                bg: '#ecfdf5',
                border: '#a7f3d0',
              },
              {
                title: 'Diploma Holders',
                desc: 'All Polytechnic engineering and technical diploma certifications',
                color: '#d97706',
                bg: '#fef3c7',
                border: '#fde68a',
              },
              {
                title: '10th & Intermediate',
                desc: 'Eligible candidates seeking early career openings and entry-level positions',
                color: '#7c3aed',
                bg: '#f5f3ff',
                border: '#ddd6fe',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ y: -6, boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.08)' }}
                className="card"
                style={{
                  borderTop: `4px solid ${item.color}`,
                  textAlign: 'center',
                  padding: '2.25rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    backgroundColor: item.bg,
                    color: item.color,
                    border: `1.5px solid ${item.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <GraduationCap size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem', color: 'var(--color-primary-900)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Participating Companies Section (Category Segregated) */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8fafc' }}>
        <div className="app-container">
          <div
            className="companies-header-wrapper"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginBottom: '1.5rem',
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
                Recruiting Campuses &amp; Organizations
              </div>
              <h2 className="companies-section-title">Participating Companies by Sector</h2>
              <p className="companies-section-subtitle">
                Explore <strong>{totalCompanies || companies.length} verified companies</strong> segregated category-wise across Banking, Product-Based IT, Manufacturing, Core Engineering and more.
              </p>
            </div>

            {/* Quick search & View Mode Toggle */}
            <div className="companies-filter-controls-wrapper">
              <form onSubmit={handleSearch} className="companies-search-form" style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: 320 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search company or role..."
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

              {/* View Mode Toggle */}
              <div
                className="companies-view-mode-toggle"
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#ffffff',
                  padding: '0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('segregated')}
                  className={`btn btn-sm ${viewMode === 'segregated' ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    gap: '0.35rem',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                  title="Grouped by Sector"
                >
                  <ListFilter size={14} /> Category Sections
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    gap: '0.35rem',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                  title="Unified Grid"
                >
                  <Grid size={14} /> Grid
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Category Filter Pills Bar */}
          <div className="category-pills-bar" role="tablist" aria-label="Company Categories">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Building2;
              const count = categoryCounts[cat.id] || 0;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-pill-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{cat.shortLabel}</span>
                  <span className="category-pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
              <div className="spinner spinner-primary" style={{ margin: '0 auto 1rem', width: 34, height: 34 }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Organizing companies category-wise...</p>
            </div>
          ) : companies.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--color-text-muted)' }}
            >
              <Building2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>No companies found matching "{search}"</h3>
              <p style={{ marginTop: '0.5rem' }}>Try clearing your search query or choose another category.</p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  fetchFeaturedCompanies('');
                }}
                style={{ marginTop: '1rem' }}
              >
                Reset Search
              </button>
            </div>
          ) : viewMode === 'segregated' && selectedCategory === 'all' ? (
            /* SEGREGATED SECTIONS: Categorized groups with headers and cards */
            <div>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const comps = categorizedData[cat.id] || [];
                if (comps.length === 0) return null;
                const Icon = CATEGORY_ICONS[cat.id] || Building2;

                return (
                  <div key={cat.id} className="category-section-container">
                    {/* Category Header */}
                    <div className="category-section-header">
                      <div className="category-header-title-box">
                        <div
                          className="category-header-icon"
                          style={{
                            backgroundColor: cat.bg,
                            border: `1.5px solid ${cat.border}`,
                            color: cat.color,
                          }}
                        >
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-900)', margin: 0, fontWeight: 700 }}>
                            {cat.label}
                          </h3>
                          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0' }}>
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="category-header-actions">
                        <span
                          className="badge"
                          style={{
                            backgroundColor: cat.bg,
                            color: cat.color,
                            border: `1px solid ${cat.border}`,
                            fontWeight: 700,
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.82rem',
                          }}
                        >
                          {comps.length} {comps.length === 1 ? 'Company' : 'Companies'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="btn btn-outline btn-sm category-view-only-btn"
                        >
                          View {cat.shortLabel} →
                        </button>
                      </div>
                    </div>

                    {/* Company Cards Grid for this category */}
                    <div className="category-companies-grid">
                      {comps.map((comp) => (
                        <div
                          key={comp.id}
                          className="card card-hover category-company-card"
                        >
                          <div>
                            {/* Top row: Avatar & Sector Badge */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: cat.bg,
                                  color: cat.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '1.05rem',
                                  border: `1px solid ${cat.border}`,
                                  flexShrink: 0,
                                }}
                              >
                                {comp.name.charAt(0).toUpperCase()}
                              </div>

                              <span
                                className="category-company-sector-badge"
                                style={{
                                  backgroundColor: cat.bg,
                                  color: cat.color,
                                  border: `1px solid ${cat.border}`,
                                }}
                              >
                                {comp.sector || cat.shortLabel}
                              </span>
                            </div>

                            <h4
                              style={{
                                fontSize: '1.02rem',
                                fontWeight: 700,
                                color: 'var(--color-primary-900)',
                                lineHeight: 1.3,
                                marginBottom: '0.4rem',
                                wordBreak: 'break-word',
                              }}
                            >
                              {comp.name}
                            </h4>

                            {comp.job_position && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--color-brand-700)', fontWeight: 600, marginBottom: '0.35rem' }}>
                                Role: {comp.job_position}
                              </div>
                            )}

                            {comp.salary_ctc && (
                              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <IndianRupee size={12} /> {comp.salary_ctc}
                              </div>
                            )}
                          </div>

                          <div
                            style={{
                              marginTop: '1rem',
                              paddingTop: '0.75rem',
                              borderTop: '1px solid #f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            {comp.room_no ? (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: '#1e3a8a',
                                  backgroundColor: '#eff6ff',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-sm)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <DoorClosed size={13} /> Room {comp.room_no}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {comp.location || 'On-Campus'}
                              </span>
                            )}

                            {isAuthenticated && isStudent ? (
                              comp.has_applied ? (
                                <span className="badge badge-applied" style={{ fontSize: '0.75rem' }}>✓ Applied</span>
                              ) : (
                                <Link to="/companies" className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}>
                                  Apply
                                </Link>
                              )
                            ) : (
                              <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}>
                                Apply
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/companies" className="btn btn-primary btn-lg">
                  Browse All {totalCompanies || companies.length} Companies <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          ) : (
            /* FILTERED CATEGORY OR GRID VIEW */
            <>
              {selectedCategory !== 'all' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                    padding: '0.85rem 1.25rem',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary-900)' }}>
                      Filtered Sector: {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                    </span>
                    <span className="badge badge-blue">
                      {filteredCompanies.length} Companies
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                  >
                    Clear Filter (Show All)
                  </button>
                </div>
              )}

              <div className="category-companies-grid">
                {filteredCompanies.map((comp) => {
                  const cat = getCompanyCategory(comp);
                  return (
                    <div
                      key={comp.id}
                      className="card card-hover category-company-card"
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: cat.bg,
                              color: cat.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.1rem',
                              border: `1px solid ${cat.border}`,
                            }}
                          >
                            {comp.name.charAt(0).toUpperCase()}
                          </div>

                          <span
                            className="category-company-sector-badge"
                            style={{
                              backgroundColor: cat.bg,
                              color: cat.color,
                              border: `1px solid ${cat.border}`,
                            }}
                          >
                            {comp.sector || cat.shortLabel}
                          </span>
                        </div>

                        <h4
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'var(--color-primary-900)',
                            lineHeight: 1.3,
                            marginBottom: '0.4rem',
                            wordBreak: 'break-word',
                          }}
                        >
                          {comp.name}
                        </h4>

                        {comp.job_position && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-brand-700)', fontWeight: 600, marginBottom: '0.35rem' }}>
                            Role: {comp.job_position}
                          </div>
                        )}

                        {comp.salary_ctc && (
                          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IndianRupee size={12} /> {comp.salary_ctc}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: '1.15rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {comp.room_no ? (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#1e3a8a',
                              backgroundColor: '#eff6ff',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <DoorClosed size={13} /> Room {comp.room_no}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {comp.location || 'On-Campus'}
                          </span>
                        )}

                        {isAuthenticated && isStudent ? (
                          comp.has_applied ? (
                            <span className="badge badge-applied" style={{ fontSize: '0.75rem' }}>✓ Applied</span>
                          ) : (
                            <Link to="/companies" className="btn btn-outline btn-sm">
                              Apply
                            </Link>
                          )
                        ) : (
                          <Link to="/login" className="btn btn-outline btn-sm">
                            Apply
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Link to="/companies" className="btn btn-primary">
                  View Full Companies Directory ({totalCompanies || companies.length}) <ArrowRight size={16} />
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
