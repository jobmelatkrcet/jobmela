import React from 'react';

/**
 * Universal Shimmer Skeleton Component
 */
export const Skeleton = ({
  width,
  height,
  borderRadius,
  variant = 'rectangular', // 'text', 'circular', 'rectangular', 'rounded'
  dark = false,
  className = '',
  style = {},
}) => {
  let defaultRadius = 'var(--radius-md, 8px)';
  if (variant === 'circular') defaultRadius = '50%';
  else if (variant === 'text') defaultRadius = '4px';
  else if (variant === 'rounded') defaultRadius = 'var(--radius-lg, 12px)';

  return (
    <div
      className={`${dark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer'} ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? (variant === 'text' ? '1rem' : '100%'),
        borderRadius: borderRadius ?? defaultRadius,
        display: 'inline-block',
        ...style,
      }}
    />
  );
};

/**
 * Company Card Skeleton (Matches the public & student company card layout)
 */
export const CompanyCardSkeleton = ({ count = 6, dark = false }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
        gap: '1.25rem',
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: dark ? '#0f172a' : '#ffffff',
            border: dark ? '1px solid #1e293b' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {/* Header: Logo placeholder + Name + Sector badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Skeleton
              variant="rounded"
              width={46}
              height={46}
              dark={dark}
              borderRadius="10px"
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <Skeleton width="65%" height="1.1rem" dark={dark} />
              <Skeleton width="40%" height="0.8rem" dark={dark} />
            </div>
          </div>

          {/* Tags row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Skeleton width="28%" height="1.4rem" borderRadius="999px" dark={dark} />
            <Skeleton width="34%" height="1.4rem" borderRadius="999px" dark={dark} />
          </div>

          {/* Body Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton width="90%" height="0.85rem" dark={dark} />
            <Skeleton width="75%" height="0.85rem" dark={dark} />
          </div>

          {/* Meta strip (Vacancies & Salary) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.5rem',
              borderTop: dark ? '1px solid #1e293b' : '1px solid #f1f5f9',
            }}
          >
            <Skeleton width="35%" height="1rem" dark={dark} />
            <Skeleton width="30%" height="1rem" dark={dark} />
          </div>

          {/* Button placeholder */}
          <Skeleton
            width="100%"
            height="2.35rem"
            borderRadius="var(--radius-md)"
            dark={dark}
            style={{ marginTop: '0.25rem' }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Table Rows Skeleton (For Admin & Student tables)
 */
export const TableSkeleton = ({ rows = 6, columns = 5 }) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <th key={colIdx} style={{ padding: '0.85rem 1rem' }}>
                <Skeleton width={`${50 + (colIdx % 3) * 20}%`} height="0.95rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              style={{
                borderBottom: '1px solid var(--color-border-light, #f1f5f9)',
                backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'rgba(248, 250, 252, 0.5)',
              }}
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} style={{ padding: '1rem' }}>
                  {colIdx === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton width="70%" height="0.9rem" />
                    </div>
                  ) : colIdx === columns - 1 ? (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Skeleton width={55} height="1.8rem" borderRadius="6px" />
                      <Skeleton width={32} height="1.8rem" borderRadius="6px" />
                    </div>
                  ) : (
                    <Skeleton width={`${55 + ((colIdx + rowIdx) % 4) * 12}%`} height="0.9rem" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Stats Card Skeleton
 */
export const StatsGridSkeleton = ({ count = 4 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 240px), 1fr))`,
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            padding: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Skeleton variant="rounded" width={52} height={52} borderRadius="12px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton width="50%" height="0.8rem" />
            <Skeleton width="40%" height="1.6rem" />
            <Skeleton width="75%" height="0.75rem" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Application Card Skeleton
 */
export const ApplicationListSkeleton = ({ count = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            padding: '1.15rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <Skeleton variant="rounded" width={44} height={44} borderRadius="8px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Skeleton width={140} height="1.05rem" />
              <Skeleton width={180} height="0.8rem" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Skeleton width={90} height="1.6rem" borderRadius="999px" />
            <Skeleton width={110} height="2rem" borderRadius="6px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
