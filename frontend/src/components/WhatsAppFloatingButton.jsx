import React, { useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_GROUP_URL } from '../utils/constants';

/**
 * High-visibility Floating WhatsApp Community Action Button
 * Provides instant 1-click access to the official Job Mela WhatsApp group.
 */
const WhatsAppFloatingButton = ({
  tooltip = 'Join Official WhatsApp Group',
  showText = false,
  position = 'bottom-right',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      className={`whatsapp-floating-container ${position}`}
      aria-label="Official Job Mela WhatsApp Community"
    >
      <a
        href={WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-floating-btn"
        id="whatsapp-floating-action-btn"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={tooltip}
      >
        <span className="whatsapp-pulse-ring" aria-hidden="true" />
        <span className="whatsapp-floating-icon-wrap">
          <WhatsAppIcon size={28} color="#ffffff" />
        </span>
        <span className={`whatsapp-floating-label ${isHovered || showText ? 'expanded' : ''}`}>
          Join WhatsApp Group
        </span>
      </a>
    </aside>
  );
};

export default WhatsAppFloatingButton;
