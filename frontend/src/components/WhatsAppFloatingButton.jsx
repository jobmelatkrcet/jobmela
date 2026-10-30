import React from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_CHANNEL_URL } from '../utils/constants';

/**
 * High-visibility Floating WhatsApp Channel Action Button
 * Provides instant 1-click access to the official WhatsApp Channel (Everyone Join).
 */
const WhatsAppFloatingButton = ({
  tooltip = 'Follow Official WhatsApp Channel',
  position = 'bottom-right',
}) => {
  return (
    <aside
      className={`whatsapp-floating-container ${position}`}
      aria-label="Official Job Mela WhatsApp Channel"
      style={{ zIndex: 1050 }}
    >
      <a
        href={WHATSAPP_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-floating-btn"
        id="whatsapp-floating-action-btn"
        title={tooltip}
        style={{
          border: 'none',
          outline: 'none',
          textDecoration: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #075e54 0%, #064e3b 100%)',
          boxShadow: '0 4px 14px rgba(7, 94, 84, 0.4)',
        }}
      >
        <span className="whatsapp-pulse-ring" aria-hidden="true" />
        <span className="whatsapp-floating-icon-wrap">
          <WhatsAppIcon size={28} color="#ffffff" />
        </span>
        <span className="whatsapp-floating-label expanded">
          WhatsApp Channel ↗
        </span>
      </a>
    </aside>
  );
};

export default WhatsAppFloatingButton;
