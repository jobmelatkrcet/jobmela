import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Sparkles,
  X,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, getCompanyCategory } from '../../utils/companyCategories';
import { CompanyCardSkeleton } from '../../components/Skeleton';
import poster1Img from '../../assets/jobmela-poster-1.jpg';
import poster2Img from '../../assets/jobmela-poster-2.jpg';

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

  // Front Page Hero Slideshow State:
  // Slide 0: Custom Designed Hero
  // Slide 1: Poster 1 (VIP & Dignitaries - Hon'ble CM Revanth Reddy & IT Minister Sridhar Babu)
  // Slide 2: Poster 2 (Schedule, Guidelines, Eligibility & Coordinators)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxPoster, setLightboxPoster] = useState(null);

  // Auto-advance slideshow smoothly every 3 seconds:
  // Slide 0: Designed hero (3s) -> Slide 1: Poster 1 only (3s) -> Slide 2: Poster 2 only (3s)
  useEffect(() => {
    if (lightboxPoster) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, [lightboxPoster]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3);

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
      {/* Front Page Hero Slideshow (Slide 1: Designed Hero, Slide 2: VIP Poster 1, Slide 3: Guidelines Poster 2) */}
      <section className="hero-slideshow-wrapper">
        {/* Persistent Campus Background for seamless light/blurred continuity */}
        <div className="hero-persistent-bg-container">
          <img
            src="/college-campus.webp"
            alt="TKRCET Campus"
            className="hero-ref-bg"
          />
          <div className="hero-ambient-sunflare" />
          <div className="hero-ref-overlay" />
        </div>

        <AnimatePresence initial={false}>
          {/* SLIDE 0: Custom Designed Interactive Hero */}
          {currentSlide === 0 && (
            <motion.div
              key="hero-slide-designed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', position: 'relative', zIndex: 3 }}
            >
              <div className="hero-ref-wrapper" style={{ background: 'transparent' }}>
                <div className="hero-ref-container">
                  {/* 1. College Organizer Block */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="hero-organized-section"
                  >
                    <div className="hero-org-college-name">
                      TKR College of Engineering &amp; Technology
                    </div>
                    <div className="hero-org-autonomous">
                      (Autonomous)
                    </div>

                    <div className="hero-org-divider-row">
                      <div className="hero-org-line" />
                      <span className="hero-org-label">ORGANISES</span>
                      <div className="hero-org-line" />
                    </div>
                  </motion.div>

                  {/* 2. Grand Event Title Block - MEGA JOB MELA 2026 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, delay: 0.14 }}
                    className="hero-title-container"
                  >
                    <div className="hero-mega-label">MEGA</div>

                    {/* Specially Highlighted JOB MELA with living pulsing glow */}
                    <div className="hero-jobmela-highlight-wrap">
                      <div className="hero-jobmela-glow-backdrop" />
                      <h1 className="hero-jobmela-label">JOB MELA</h1>
                    </div>

                    <div className="hero-year-wrapper">
                      <span className="hero-year-text">2026</span>
                      <svg
                        className="hero-year-swoosh"
                        viewBox="0 0 200 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
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

                  {/* 3. Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.22 }}
                    className="hero-description-match"
                  >
                    Connecting students from all streams with 150+ premier multinational recruiters and emerging enterprises.
                  </motion.p>

                  {/* 4. Event Highlights (Wide Horizontal Stats) */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.28 }}
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

                  {/* 5. Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.34 }}
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

                  {/* 6. Venue Card - Mobile Only */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.4 }}
                    className="hero-venue-block hero-mobile-only"
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
                  <div
                    className="hero-scroll-indicator hero-mobile-only"
                    onClick={() => {
                      window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
                    }}
                  >
                    <ChevronDown size={24} color="rgba(255, 255, 255, 0.7)" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 1: Poster 1 ONLY (Soft light blur backdrop, ambient glow, cool float animation) */}
          {currentSlide === 1 && (
            <motion.div
              key="hero-slide-poster-1"
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -16 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', position: 'relative', zIndex: 3 }}
            >
              <div className="hero-poster-ambient-slide">
                <div className="hero-poster-blur-backdrop" />
                <img
                  src={poster1Img}
                  alt=""
                  aria-hidden="true"
                  className="hero-poster-ambient-glow"
                />
                <div
                  className="hero-poster-float-wrapper"
                  onClick={() =>
                    setLightboxPoster({
                      src: poster1Img,
                      title: 'TKRCET Mega Job Mela 2026 - Chief Guest & Dignitaries Poster',
                    })
                  }
                  title="Click to zoom in high resolution"
                >
                  <img
                    src={poster1Img}
                    alt="Mega Job Mela 2026 Poster 1 - Chief Guest CM Revanth Reddy"
                    className="hero-poster-cinematic-img"
                  />
                  <div className="hero-poster-zoom-pill">
                    <Maximize2 size={13} /> Click to Zoom
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: Poster 2 ONLY (Soft light blur backdrop, ambient glow, cool float animation) */}
          {currentSlide === 2 && (
            <motion.div
              key="hero-slide-poster-2"
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -16 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', position: 'relative', zIndex: 3 }}
            >
              <div className="hero-poster-ambient-slide">
                <div className="hero-poster-blur-backdrop" />
                <img
                  src={poster2Img}
                  alt=""
                  aria-hidden="true"
                  className="hero-poster-ambient-glow"
                />
                <div
                  className="hero-poster-float-wrapper"
                  onClick={() =>
                    setLightboxPoster({
                      src: poster2Img,
                      title: 'TKRCET 31st Oct Mega Job Mela - Guidelines & Eligibility Poster',
                    })
                  }
                  title="Click to zoom in high resolution"
                >
                  <img
                    src={poster2Img}
                    alt="Mega Job Mela 2026 Poster 2 - Guidelines & Eligibility"
                    className="hero-poster-cinematic-img"
                  />
                  <div className="hero-poster-zoom-pill">
                    <Maximize2 size={13} /> Click to Zoom
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Lightbox Modal for Fullscreen Poster Inspection */}
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

      {/* Dedicated Official Announcement Posters Showcase */}
      <section id="posters" style={{ padding: '4.5rem 0', backgroundColor: '#061121', color: '#ffffff' }}>
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', maxWidth: 750, margin: '0 auto 3rem' }}
          >
            <div
              className="badge"
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                marginBottom: '1rem',
                padding: '0.4rem 1rem',
              }}
            >
              <Sparkles size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Official Event Posters &amp; Notifications
            </div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)', color: '#ffffff', marginBottom: '0.75rem', fontWeight: 900 }}>
              Mega Job Mela 2026 Official Posters
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Click on either official notification poster to zoom in full resolution, inspect guidelines, or download for candidate circulation.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: '2.5rem',
              alignItems: 'stretch',
            }}
          >
            {/* Poster Card 1 */}
            <div
              className="card card-hover"
              style={{
                backgroundColor: '#0d1a33',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#061121',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
                onClick={() =>
                  setLightboxPoster({
                    src: poster1Img,
                    title: 'TKRCET Mega Job Mela 2026 - Chief Guest & Dignitaries Poster',
                  })
                }
              >
                <img
                  src={poster1Img}
                  alt="Mega Job Mela 2026 - Chief Guest CM Revanth Reddy"
                  style={{ width: '100%', maxHeight: '460px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
                <div className="hero-poster-hover-overlay">
                  <Maximize2 size={34} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Click to Zoom / View Fullscreen</span>
                </div>
              </div>

              <div style={{ marginTop: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="badge badge-blue">VIP Dignitaries Launch</span>
                  <span style={{ color: '#38bdf8', fontSize: '0.86rem', fontWeight: 700 }}>OCT 31ST, 2026</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                  Mega Job Mela 2026 Launch Poster
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
                  Chief Guest: Hon'ble CM Sri Anumula Revanth Reddy &amp; Guest of Honour: Hon'ble IT Minister Sri Duddilla Sridhar Babu. Over 150+ companies with 5,000+ openings!
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <span style={{ padding: '0.3rem 0.65rem', borderRadius: 6, backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                    150+ Companies
                  </span>
                  <span style={{ padding: '0.3rem 0.65rem', borderRadius: 6, backgroundColor: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
                    5,000+ Openings
                  </span>
                  <span style={{ padding: '0.3rem 0.65rem', borderRadius: 6, backgroundColor: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                    Pan India Aspirants
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxPoster({
                        src: poster1Img,
                        title: 'TKRCET Mega Job Mela 2026 - Chief Guest & Dignitaries Poster',
                      })
                    }
                    className="btn btn-primary"
                    style={{ flex: 1, gap: '0.5rem', fontSize: '0.92rem' }}
                  >
                    <Maximize2 size={16} /> View Fullscreen
                  </button>
                  <a
                    href={poster1Img}
                    download="TKRCET-Job-Mela-2026-Poster-1.jpg"
                    className="btn btn-outline"
                    style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.25)', gap: '0.5rem', fontSize: '0.92rem' }}
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
              </div>
            </div>

            {/* Poster Card 2 */}
            <div
              className="card card-hover"
              style={{
                backgroundColor: '#0d1a33',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#061121',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
                onClick={() =>
                  setLightboxPoster({
                    src: poster2Img,
                    title: 'TKRCET 31st Oct Mega Job Mela - Guidelines & Eligibility Poster',
                  })
                }
              >
                <img
                  src={poster2Img}
                  alt="31st Oct Mega Job Mela - Guidelines & Eligibility"
                  style={{ width: '100%', maxHeight: '460px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
                <div className="hero-poster-hover-overlay">
                  <Maximize2 size={34} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Click to Zoom / View Fullscreen</span>
                </div>
              </div>

              <div style={{ marginTop: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="badge badge-success">Guidelines &amp; Eligibility</span>
                  <span style={{ color: '#4ade80', fontSize: '0.86rem', fontWeight: 700 }}>All Streams Eligible</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                  31st Oct Mega Job Mela Guidelines Poster
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
                  Complete eligibility rules for 10th/12th, ITI, Diploma, and all Degree disciplines. Direct HR recruitment, spot offers, and faculty coordinator helpline contacts.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <span style={{ padding: '0.3rem 0.65rem', borderRadius: 6, backgroundColor: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
                    10th / 12th / ITI / Diploma
                  </span>
                  <span style={{ padding: '0.3rem 0.65rem', borderRadius: 6, backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                    All Degrees &amp; B.Tech
                  </span>
                  <span style={{ padding: '0.3rem 0.65rem', borderRadius: 6, backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', fontSize: '0.8rem', fontWeight: 600 }}>
                    Spot Offer Letters
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxPoster({
                        src: poster2Img,
                        title: 'TKRCET 31st Oct Mega Job Mela - Guidelines & Eligibility Poster',
                      })
                    }
                    className="btn btn-primary"
                    style={{ flex: 1, gap: '0.5rem', fontSize: '0.92rem' }}
                  >
                    <Maximize2 size={16} /> View Fullscreen
                  </button>
                  <a
                    href={poster2Img}
                    download="TKRCET-Job-Mela-2026-Poster-2.jpg"
                    className="btn btn-outline"
                    style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.25)', gap: '0.5rem', fontSize: '0.92rem' }}
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))', gap: '1.5rem' }}>
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
                desc: 'B.Sc, B.Com, BBA, BCA, BA, MCA, MBA & other degree disciplines',
                color: '#059669',
                bg: '#ecfdf5',
                border: '#a7f3d0',
              },
              {
                title: 'Diploma Holders',
                desc: 'All Polytechnic engineering, technical & vocational diploma certifications',
                color: '#d97706',
                bg: '#fef3c7',
                border: '#fde68a',
              },
              {
                title: 'ITI (All Trades)',
                desc: 'Fitter, Electrician, Machinist, Welder, Wireman & all trade vocations',
                color: '#4f46e5',
                bg: '#eef2ff',
                border: '#c7d2fe',
              },
              {
                title: '10th & Intermediate',
                desc: 'SSC / 10th Pass, Intermediate (MPC, BiPC, CEC, HEC) & Equivalent',
                color: '#7c3aed',
                bg: '#f5f3ff',
                border: '#ddd6fe',
              },
              {
                title: 'All Other Sectors & General',
                desc: 'Open to all graduates, non-engineering & career aspirants across all sectors',
                color: '#0284c7',
                bg: '#f0f9ff',
                border: '#bae6fd',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
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
              <form onSubmit={handleSearch} className="home-search-capsule">
                <Search size={17} className="home-search-capsule-icon" />
                <input
                  type="text"
                  className="home-search-capsule-input"
                  placeholder="Search company or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      fetchFeaturedCompanies('');
                    }}
                    className="home-search-capsule-clear"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
                <button type="submit" className="home-search-capsule-submit" title="Search">
                  <Search size={14} />
                  <span>Search</span>
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
            <div style={{ padding: '1.5rem 0 3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span>Loading company directory with real-time room allocations...</span>
              </div>
              <CompanyCardSkeleton count={6} />
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
                                  minWidth: 40,
                                  minHeight: 40,
                                  maxWidth: 40,
                                  maxHeight: 40,
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
                                  alignSelf: 'flex-start',
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
                <div className="filtered-sector-banner">
                  <div className="filtered-sector-title-group">
                    <span className="filtered-sector-label">
                      Filtered Sector: <strong>{CATEGORIES.find((c) => c.id === selectedCategory)?.label}</strong>
                    </span>
                    <span className="badge badge-blue filtered-sector-count">
                      {filteredCompanies.length} Companies
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="btn btn-outline btn-sm filtered-sector-clear-btn"
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
                              width: 40,
                              height: 40,
                              minWidth: 40,
                              minHeight: 40,
                              maxWidth: 40,
                              maxHeight: 40,
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
                              alignSelf: 'flex-start',
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.85rem' }}>
                {[
                  { name: 'V. Pranathi', phone: '8121449141', displayPhone: '+91 81214 49141' },
                  { name: 'Srinivas Reddy', phone: '9949139414', displayPhone: '+91 99491 39414' },
                  { name: 'Balakrishna Reddy', phone: '9966559298', displayPhone: '+91 99665 59298' },
                  { name: 'Ashwini Reddy', phone: '7075450757', displayPhone: '+91 70754 50757' },
                  { name: 'Gnanesh', phone: '9052452403', displayPhone: '+91 90524 52403' },
                ].map((coord) => (
                  <div
                    key={coord.phone}
                    style={{
                      backgroundColor: '#1e293b',
                      padding: '1rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Faculty Coordinator
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
                      {coord.name}
                    </div>
                    <a
                      href={`tel:${coord.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        marginTop: '0.45rem',
                        color: '#38bdf8',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={14} /> {coord.displayPhone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
