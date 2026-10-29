import React, { useState, useRef, useEffect } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_GROUP_URL, WHATSAPP_CHANNEL_URL } from '../utils/constants';
import { X } from 'lucide-react';

/**
 * High-visibility Floating WhatsApp Community Action Button
 * Provides instant access to both official WhatsApp Channel (Everyone Join)
 * and WhatsApp Group (Join if not joined).
 */
const WhatsAppFloatingButton = ({
  tooltip = 'Official WhatsApp Updates & Community',
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside
      ref={containerRef}
      className={`whatsapp-floating-container ${position}`}
      aria-label="Official Job Mela WhatsApp Announcements & Group"
      style={{ zIndex: 1050 }}
    >
      {/* Floating Flyout Menu when clicked */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            right: 0,
            width: '290px',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: '1rem',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(7, 94, 84, 0.15)',
            border: '2px solid #86efac',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.45rem',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <WhatsAppIcon size={18} color="#16a34a" />
              <strong style={{ fontSize: '0.88rem', color: '#064e3b' }}>Official WhatsApp</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
              title="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* 1. Official Channel (Everyone Join) */}
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            id="floating-menu-channel-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #075e54 0%, #064e3b 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(7, 94, 84, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <WhatsAppIcon size={16} color="#ffffff" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>WhatsApp Channel</div>
                <div style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>Live Announcements</div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                padding: '2px 6px',
                borderRadius: 9999,
                whiteSpace: 'nowrap',
              }}
            >
              Everyone Join ↗
            </span>
          </a>

          {/* 2. Official Group (If Not Joined) */}
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            id="floating-menu-group-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 10,
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#065f46',
              textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <WhatsAppIcon size={16} color="#16a34a" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>WhatsApp Group</div>
                <div style={{ fontSize: '0.68rem', color: '#047857' }}>Community &amp; Q&amp;A</div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: '#22c55e',
                color: '#ffffff',
                padding: '2px 6px',
                borderRadius: 9999,
                whiteSpace: 'nowrap',
              }}
            >
              If Not Joined ↗
            </span>
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        className="whatsapp-floating-btn"
        id="whatsapp-floating-action-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={tooltip}
        style={{ border: 'none', outline: 'none' }}
      >
        <span className="whatsapp-pulse-ring" aria-hidden="true" />
        <span className="whatsapp-floating-icon-wrap">
          <WhatsAppIcon size={28} color="#ffffff" />
        </span>
        <span className="whatsapp-floating-label expanded">
          WhatsApp Updates
        </span>
      </button>
    </aside>
  );
};

export default WhatsAppFloatingButton;
