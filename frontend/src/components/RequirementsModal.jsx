import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Shirt,
  GraduationCap,
  Download,
  Printer,
} from 'lucide-react';
import requirementsService from '../services/requirementsService';

const RequirementsModal = ({ isOpen, onClose }) => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchRequirements();
    }
  }, [isOpen]);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const data = await requirementsService.getPublicRequirements();
      setRequirements(data.requirements || []);
    } catch (err) {
      console.error('Failed to load requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: 'All Guidelines' },
    { key: 'documents', label: 'Documents' },
    { key: 'instructions', label: 'Reporting & Venue' },
    { key: 'dress_code', label: 'Dress Code' },
    { key: 'eligibility', label: 'Eligibility' },
  ];

  const filteredRequirements =
    activeCategory === 'all'
      ? requirements
      : requirements.filter((r) => r.category === activeCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'documents':
        return <FileText size={16} color="var(--color-brand-600)" />;
      case 'instructions':
        return <Clock size={16} color="var(--color-accent-amber)" />;
      case 'dress_code':
        return <Shirt size={16} color="var(--color-primary-700)" />;
      case 'eligibility':
        return <GraduationCap size={16} color="var(--color-success-600)" />;
      default:
        return <ClipboardList size={16} color="var(--color-brand-600)" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 2200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            backgroundColor: 'var(--color-tkrcet-navy)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fef08a',
              }}
            >
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Job Mela 2026 — Candidate Requirements
              </h3>
              <p style={{ color: '#93c5fd', fontSize: '0.78rem', margin: 0, marginTop: '0.15rem' }}>
                Official mandatory guidelines, documents &amp; reporting instructions from placement cell
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid var(--color-border)',
            overflowX: 'auto',
            flexWrap: 'nowrap',
          }}
        >
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: activeCategory === c.key ? '1px solid var(--color-brand-600)' : '1px solid var(--color-border)',
                backgroundColor: activeCategory === c.key ? 'var(--color-brand-600)' : '#ffffff',
                color: activeCategory === c.key ? '#ffffff' : 'var(--color-primary-700)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Modal Body / Requirements List */}
        <div
          className="modal-body"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#ffffff',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="spinner spinner-primary" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Loading verified requirements from administrator...
              </p>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--color-text-muted)' }}>
              No requirements found under this category.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredRequirements.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.95rem 1.15rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: 'var(--color-brand-700)',
                      flexShrink: 0,
                      marginTop: '0.1rem',
                    }}
                  >
                    {item.order || index + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.96rem', color: 'var(--color-primary-900)' }}>
                        {item.title}
                      </strong>

                      {item.is_mandatory ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Mandatory
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            textTransform: 'uppercase',
                          }}
                        >
                          Recommended
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {getCategoryIcon(item.category)}
                        {item.category_display || item.category}
                      </span>
                    </div>

                    {item.description && (
                      <p
                        style={{
                          fontSize: '0.86rem',
                          color: 'var(--color-primary-700)',
                          marginTop: '0.35rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <AlertCircle size={14} color="var(--color-accent-amber)" />
            <span>Updated live from TKRCET Placement Administration.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-outline btn-sm"
              title="Print guidelines checklist"
            >
              <Printer size={14} /> Print Checklist
            </button>
            <button onClick={onClose} className="btn btn-primary btn-sm">
              Understood / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsModal;
