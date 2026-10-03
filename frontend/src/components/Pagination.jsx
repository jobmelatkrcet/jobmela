import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalItems,
  pageSize = 20,
  onPageChange,
  hasNext,
  hasPrevious,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.5rem',
        padding: '0.75rem 0',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
        Showing page <strong style={{ color: 'var(--color-primary-900)' }}>{currentPage}</strong> of{' '}
        <strong style={{ color: 'var(--color-primary-900)' }}>{totalPages}</strong> ({totalItems} total items)
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious && currentPage <= 1}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <span
          style={{
            padding: '0.4rem 0.8rem',
            background: 'var(--color-brand-50)',
            color: 'var(--color-brand-700)',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
          }}
        >
          {currentPage}
        </span>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext && currentPage >= totalPages}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
