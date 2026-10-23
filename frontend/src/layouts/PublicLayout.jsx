import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';

const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      {/* Floating Official WhatsApp Community Action Button */}
      <WhatsAppFloatingButton />
    </div>
  );
};

export default PublicLayout;
