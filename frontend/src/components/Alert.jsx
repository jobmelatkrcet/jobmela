import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} />,
    danger: <AlertTriangle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`alert alert-${type}`}>
      <span style={{ display: 'flex', marginTop: 2 }}>{icons[type]}</span>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            opacity: 0.7,
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
