import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: {
      bg: 'var(--color-brand-50)',
      text: 'var(--color-brand-600)',
      border: 'var(--color-brand-100)',
    },
    emerald: {
      bg: 'var(--color-success-50)',
      text: 'var(--color-success-600)',
      border: '#a7f3d0',
    },
    amber: {
      bg: 'var(--color-accent-gold-light)',
      text: 'var(--color-accent-amber)',
      border: '#fde68a',
    },
    purple: {
      bg: '#f3e8ff',
      text: '#7e22ce',
      border: '#e9d5ff',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-muted)',
            marginBottom: '0.35rem',
          }}
        >
          {title}
        </p>
        <h3
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--color-primary-900)',
            lineHeight: 1.1,
          }}
        >
          {value !== undefined ? value.toLocaleString() : '—'}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-light)',
              marginTop: '0.35rem',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: scheme.bg,
            color: scheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${scheme.border}`,
          }}
        >
          <Icon size={26} />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
