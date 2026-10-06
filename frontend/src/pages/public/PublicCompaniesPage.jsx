import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  MapPin,
  IndianRupee,
  GraduationCap,
  DoorClosed,
  Users,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { getCompanyCategory } from '../../utils/companyCategories';
import { CompanyCardSkeleton } from '../../components/Skeleton';

const hasValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return !['', 'n/a', 'na', 'nil', '-', '--', 'null', 'none', 'unknown', 'not available'].includes(s);
};

const PublicCompaniesPage = () => {
  const { isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadCompanies(currentPage, search);
  }, [currentPage]);

  const loadCompanies = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({
        page,
        search: searchQuery,
        page_size: 16,
      });
      setCompanies(data.results || []);
      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setAlert({ type: 'danger', message: 'Failed to load companies from server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCompanies(1, search);
  };

  const handleApplyClick = (company) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: `Please log in to apply for ${company.name}` } });
      return;
    }
    if (!isStudent) {
      setAlert({ type: 'danger', message: 'Only registered students can apply for companies.' });
      return;
    }
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const confirmApply = async () => {
    if (!selectedCompany) return;
    setApplying(true);
    try {
      const res = await applicationService.applyToCompany(selectedCompany.id);
      setAlert({
        type: 'success',
        message: res.message || `Application Successful for ${selectedCompany.name}!`,
      });
      // Update local company state to has_applied: true
      setCompanies((prev) =>
        prev.map((c) => (c.id === selectedCompany.id ? { ...c, has_applied: true } : c))
      );
      setIsModalOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit application. Please try again.';
      setAlert({ type: 'danger', message: errMsg });
      setIsModalOpen(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="app-container">
        {/* Page Header */}
        <div style={{ maxWidth: 760, marginBottom: '2.5rem' }}>
          <div
            className="badge badge-blue"
            style={{ marginBottom: '0.75rem', padding: '0.35rem 0.85rem' }}
          >
            Participating Organizations
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', marginBottom: '0.75rem' }}>
            Participating Companies
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            Browse verified companies participating in TKRCET Job Mela 2026. Registered students
            can apply to multiple companies across different sectors.
          </p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Search & Stats Bar */}
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: 'flex', gap: '0.6rem', flex: 1, minWidth: 280, maxWidth: 500 }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search companies by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                  loadCompanies(1, '');
                }}
              >
                Clear
              </button>
            )}
          </form>

          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Total Companies Available: <strong style={{ color: 'var(--color-primary-900)' }}>{totalCount}</strong>
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              <span>Buffering company listings and floor details...</span>
            </div>
            <CompanyCardSkeleton count={9} />
          </div>
        ) : companies.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--color-text-muted)' }}
          >
            <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-800)' }}>
              No companies match "{search}"
            </h3>
            <p style={{ marginTop: '0.5rem' }}>Try refining your search keyword or clear filter.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSearch('');
                loadCompanies(1, '');
              }}
              style={{ marginTop: '1.25rem' }}
            >
              View All Companies
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-brand-50)',
                          color: 'var(--color-brand-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          flexShrink: 0,
                        }}
                      >
                        {company.name.charAt(0).toUpperCase()}
                      </div>

                      {(() => {
                        const cat = getCompanyCategory(company);
                        return (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              padding: '0.2rem 0.6rem',
                              fontWeight: 700,
                              borderRadius: '9999px',
                              backgroundColor: cat.bg,
                              color: cat.color,
                              border: `1px solid ${cat.border}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {company.sector || cat.shortLabel}
                          </span>
                        );
                      })()}
                    </div>

                    <h3
                      style={{
                        fontSize: '1.18rem',
                        fontWeight: 700,
                        color: 'var(--color-primary-900)',
                        lineHeight: 1.3,
                        marginBottom: '0.6rem',
                      }}
                    >
                      {company.name}
                    </h3>

                    {/* Dynamic Fields: ONLY render if data exists (Requirement 5) */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-main)',
                        marginTop: '1rem',
                      }}
                    >
                      {hasValue(company.job_position) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Briefcase size={15} color="var(--color-brand-600)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Job Position
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>{company.job_position}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.salary_ctc) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <IndianRupee size={15} color="#059669" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Salary / CTC
                            </span>
                            <span style={{ fontWeight: 700, color: '#059669' }}>{company.salary_ctc}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.location) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <MapPin size={15} color="var(--color-brand-600)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Location
                            </span>
                            <span style={{ fontWeight: 500 }}>{company.location}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.room_no) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <DoorClosed size={15} color="#7c3aed" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Room / Venue
                            </span>
                            <span style={{ fontWeight: 700, color: '#6d28d9' }}>{company.room_no}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.openings) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Users size={15} color="var(--color-brand-600)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Openings
                            </span>
                            <span style={{ fontWeight: 600 }}>{company.openings}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.qualification) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <GraduationCap size={15} color="var(--color-brand-600)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Qualification
                            </span>
                            <span style={{ fontWeight: 500, fontSize: '0.82rem' }}>{company.qualification}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.eligibility) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <CheckCircle2 size={15} color="#2563eb" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Eligibility
                            </span>
                            <span style={{ fontWeight: 500, fontSize: '0.82rem' }}>{company.eligibility}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.gender) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <ShieldCheck size={15} color="var(--color-brand-600)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Gender
                            </span>
                            <span style={{ fontWeight: 500 }}>{company.gender}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(company.facilities) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Gift size={15} color="#ea580c" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Facilities
                            </span>
                            <span style={{ fontWeight: 500, fontSize: '0.82rem' }}>{company.facilities}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      TKRCET 2026
                    </span>

                    {company.has_applied ? (
                      <span className="badge badge-applied">
                        <CheckCircle2 size={13} /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(company)}
                        className="btn btn-primary btn-sm"
                      >
                        APPLY
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={16}
              onPageChange={(p) => setCurrentPage(p)}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          </>
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={isModalOpen}
          title="Confirm Company Registration"
          message={
            <div>
              <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                You are registering your application for:
              </p>
              <div
                style={{
                  padding: '1rem 1.15rem',
                  backgroundColor: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary-900)', marginBottom: '0.35rem' }}>
                  {selectedCompany?.name}
                </div>
                {selectedCompany && hasValue(selectedCompany.job_position) && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Role: <strong style={{ color: 'var(--color-primary-800)' }}>{selectedCompany.job_position}</strong>
                  </div>
                )}
                {selectedCompany && hasValue(selectedCompany.salary_ctc) && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Salary / CTC: <strong style={{ color: '#059669' }}>{selectedCompany.salary_ctc}</strong>
                  </div>
                )}
                {selectedCompany && hasValue(selectedCompany.location) && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Location: <strong style={{ color: 'var(--color-primary-800)' }}>{selectedCompany.location}</strong>
                  </div>
                )}
                {selectedCompany && hasValue(selectedCompany.room_no) && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Room No: <strong style={{ color: '#6d28d9' }}>{selectedCompany.room_no}</strong>
                  </div>
                )}
              </div>
              <p style={{ marginTop: '0.85rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                You can apply to multiple participating companies for TKRCET Job Mela 2026.
              </p>
            </div>
          }
          confirmText="Confirm & Apply"
          cancelText="Cancel"
          loading={applying}
          onConfirm={confirmApply}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedCompany(null);
          }}
        />
      </div>
    </div>
  );
};

export default PublicCompaniesPage;
