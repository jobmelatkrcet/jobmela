import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Navbar />

      {/* Admin Subheader Banner */}
      <div className="admin-banner-strip">
        <div className="app-container">
          <div className="admin-banner-content">
            <div className="admin-banner-left">
              <div className="admin-badge-tag">
                <ShieldCheck size={14} /> Organizer Control Panel
              </div>
              <h1 className="admin-title">
                Job Mela 2026 Administrator Portal
              </h1>
              <div className="admin-meta-row">
                <span>Active Administrator: <strong>{user?.full_name || 'Organizer'}</strong> ({user?.email})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="main-content" style={{ padding: '2rem 0 4rem' }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AdminLayout;
