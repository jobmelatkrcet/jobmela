import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { companyService } from '../../services/companyService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';

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
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner spinner-primary" style={{ margin: '0 auto 1rem', width: 36, height: 36 }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Loading participating companies...</p>
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-brand-50)',
                        color: 'var(--color-brand-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        marginBottom: '1.15rem',
                      }}
                    >
                      {company.name.charAt(0).toUpperCase()}
                    </div>

                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--color-primary-900)',
                        lineHeight: 1.3,
                        marginBottom: '0.4rem',
                      }}
                    >
                      {company.name}
                    </h3>
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
          title="Confirm Application"
          message={
            <div>
              <p style={{ marginBottom: '0.75rem' }}>
                Are you sure you want to register/apply for:
              </p>
              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  backgroundColor: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--color-primary-900)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {selectedCompany?.name}
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
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
