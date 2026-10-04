import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  FileCheck,
  User,
  LogOut,
  Menu,
  MoreVertical,
  UserPlus,
  LogIn,
  Sparkles,
  X,
  ShieldCheck,
  Home,
  Info,
  Phone,
  LayoutDashboard,
  Users,
  Award,
  ChevronDown,
  ClipboardList,
  DoorClosed,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="site-header">
      {/* Top Academic Bar */}
      <div className="top-utility-bar">
        <div className="app-container utility-container">
          <div className="utility-left">
            <span className="accreditation-pill">
              <Award size={13} /> NAAC "A+" Grade
            </span>
            <span className="utility-separator">•</span>
            <span>NBA Accredited</span>
            <span className="utility-separator">•</span>
            <span>AICTE Approved</span>
            <span className="utility-separator">•</span>
            <span>Affiliated to JNTUH (Autonomous)</span>
          </div>
          <div className="utility-right">
            <span>📅 Event Date: <strong>31 October 2026</strong></span>
            <span className="utility-separator">•</span>
            <span>Placement Helpline: <a href="tel:9949139414">9949139414</a> / <a href="tel:7075450757">7075450757</a></span>
          </div>
        </div>
      </div>

      {/* Main White Navbar */}
      <div className="main-navbar">
        <div className="app-container navbar-inner">
          {/* Official TKRCET Brand Logo */}
          <Link to="/" onClick={closeMenu} className="brand-link">
            <img
              src="/tkrcet-official-logo.png"
              alt="TKR College of Engineering and Technology Logo"
              className="tkrcet-logo-img"
            />
            <div className="brand-text-block">
              <div className="college-name">
                <span className="college-name-line1">TKR College of</span>
                <span className="college-name-line2">Engineering &amp; Technology</span>
              </div>
              <div className="college-subline">
                <span className="college-autonomous">(Autonomous)</span>
                <span className="subline-dot">•</span>
                <span className="subline-event">JOB MELA 2026</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav-menu">
            {/* PUBLIC GUEST VIEW */}
            {!isAuthenticated && (
              <>
                <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Home size={16} /> Home
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Info size={16} /> About
                </NavLink>
                <NavLink to="/companies" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Building2 size={16} /> Companies
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Phone size={16} /> Contact
                </NavLink>
              </>
            )}

            {/* STUDENT PORTAL (Clean, Non-Repeating) */}
            {isAuthenticated && isStudent && (
              <>
                <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Dashboard
                </NavLink>
                <NavLink to="/companies" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Building2 size={16} /> Browse Companies
                </NavLink>
                <NavLink to="/my-applications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FileCheck size={16} /> My Applications
                </NavLink>
              </>
            )}

            {/* ADMIN PORTAL */}
            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <ShieldCheck size={16} /> Admin Panel
                </NavLink>
              </>
            )}
          </nav>

          {/* User Account / Action Section */}
          <div className="navbar-actions">
            {!isAuthenticated ? (
              <div className="auth-buttons-group">
                <Link to="/login" className="btn btn-outline btn-sm login-btn">
                  Student Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm register-btn">
                  Register
                </Link>
                <Link to="/admin/login" className="admin-portal-link" title="Organizer Admin Access">
                  <ShieldCheck size={15} /> Admin
                </Link>
              </div>
            ) : (
              <div className="user-profile-badge">
                <div
                  className="user-info-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="user-avatar-circle">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-name-wrapper">
                    <span className="user-display-name">{user?.full_name || 'User'}</span>
                    <span className="user-role-label">
                      {isAdmin ? 'Administrator' : 'Registered Candidate'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="user-dropdown-arrow" />
                </div>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-header">
                      <strong>{user?.full_name}</strong>
                      <span className="dropdown-email">{user?.email}</span>
                    </div>
                    {isStudent && (
                      <Link to="/profile" onClick={closeMenu} className="dropdown-item">
                        <User size={15} /> My Profile
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Circular Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation and registration"
              title="Menu & Registration"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Opened via 3-dots) */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          {!isAuthenticated ? (
            <div className="mobile-links">
              {/* Clean, compact quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="btn btn-primary btn-sm"
                  style={{ justifyContent: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <UserPlus size={15} />
                  <span>Register</span>
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="btn btn-outline btn-sm"
                  style={{ justifyContent: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <LogIn size={15} />
                  <span>Student Login</span>
                </Link>
              </div>

              <div className="mobile-drawer-divider" />

              <div className="mobile-drawer-nav-label">Navigation Menu</div>
              <Link to="/" onClick={closeMenu} className="mobile-link">
                <Home size={18} /> Home
              </Link>
              <Link to="/about" onClick={closeMenu} className="mobile-link">
                <Info size={18} /> About Job Mela
              </Link>
              <Link to="/companies" onClick={closeMenu} className="mobile-link">
                <Building2 size={18} /> Participating Companies
              </Link>
              <Link to="/contact" onClick={closeMenu} className="mobile-link">
                <Phone size={18} /> Contact Coordinators
              </Link>

              <div className="mobile-drawer-divider" />

              <Link to="/admin/login" onClick={closeMenu} className="mobile-admin-access-link">
                <ShieldCheck size={16} /> Organizer Admin Login
              </Link>
            </div>
          ) : isStudent ? (
            <div className="mobile-links">
              <div className="mobile-user-card">
                <strong>{user?.full_name}</strong>
                <span>{user?.email}</span>
                <span className="badge badge-blue" style={{ marginTop: 4 }}>{user?.qualification}</span>
              </div>
              <Link to="/dashboard" onClick={closeMenu} className="mobile-link">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/companies" onClick={closeMenu} className="mobile-link">
                <Building2 size={18} /> Browse Companies
              </Link>
              <Link to="/my-applications" onClick={closeMenu} className="mobile-link">
                <FileCheck size={18} /> My Applications
              </Link>
              <Link to="/profile" onClick={closeMenu} className="mobile-link">
                <User size={18} /> My Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', marginTop: '0.75rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="mobile-links">
              <div className="badge badge-amber" style={{ width: 'fit-content', marginBottom: '0.5rem' }}>
                <ShieldCheck size={14} /> Organizer Admin Panel
              </div>
              <Link to="/admin" onClick={closeMenu} className="mobile-link" style={{ fontWeight: 700, color: 'var(--color-primary-900)' }}>
                <ShieldCheck size={18} /> Admin Panel (All Options)
              </Link>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', margin: '0.25rem 0 0.5rem' }}>
                <Link to="/admin?tab=overview" onClick={closeMenu} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.35rem' }}>
                  📊 Overview
                </Link>
                <Link to="/admin?tab=companies" onClick={closeMenu} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.35rem' }}>
                  🏢 Companies
                </Link>
                <Link to="/admin?tab=rooms" onClick={closeMenu} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.35rem' }}>
                  🚪 Room Alloc
                </Link>
                <Link to="/admin?tab=students" onClick={closeMenu} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.35rem' }}>
                  🎓 Students
                </Link>
              </div>
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', marginTop: '0.75rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
