import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, CheckCircle2, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react';
import { companyService } from '../../services/companyService';
import { applicationService } from '../../services/applicationService';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { CompanyCardSkeleton } from '../../components/Skeleton';

const StudentCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState('');
  const [qualification, setQualification] = useState('all');
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadCompanies(currentPage, search, qualification);
  }, [currentPage, qualification]);

  const loadCompanies = async (page = 1, searchQuery = '', qual = qualification) => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies({
        page,
        search: searchQuery,
        qualification: qual,
        page_size: 20,
      });
      setCompanies(data.results || []);
      setTotalCompanies(data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setAlert({ type: 'danger', message: 'Could not load companies list from server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCompanies(1, search, qualification);
  };

  const handleQualificationChange = (newQual) => {
    setQualification(newQual);
    setCurrentPage(1);
  };

  const openApplyModal = (company) => {
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
        message: res.message || 'Application Successful',
      });
      // Mark company as applied in local state
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id ? { ...c, has_applied: true } : c
        )
      );
      setIsModalOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      console.error('Apply error:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.company_id ||
        'Failed to apply. Please try again.';
      setAlert({
        type: 'danger',
        message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
      });
      setIsModalOpen(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            Participating Companies
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Apply to multiple companies. Your applications are recorded directly with the organizers.
          </p>
        </div>

        <Link to="/my-applications" className="btn btn-outline btn-sm">
          View My Applications ({companies.filter((c) => c.has_applied).length} on this page) →
        </Link>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search Bar */}
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
          style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 260, maxWidth: 480 }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search companies..."
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
          Showing {companies.length} of <strong style={{ color: 'var(--color-primary-900)' }}>{totalCompanies}</strong> companies
        </div>
      </div>

      {/* Qualification Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-primary-900)',
            marginRight: '0.5rem',
          }}
        >
          <GraduationCap size={18} color="var(--color-brand-600)" />
          <span>Filter by Qualification:</span>
        </div>

        {[
          { id: 'all', label: 'All Qualifications' },
          { id: 'btech', label: 'B.Tech / B.E' },
          { id: 'degree', label: 'Degree / Graduation' },
          { id: 'diploma', label: 'Diploma / Polytechnic' },
          { id: 'pg_mba', label: 'MBA / PG / MCA' },
          { id: '10th_inter', label: '10th / Inter / ITI' },
        ].map((opt) => {
          const active = qualification === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleQualificationChange(opt.id)}
              style={{
                border: active ? '1px solid #0284c7' : '1px solid #e2e8f0',
                backgroundColor: active ? '#0284c7' : '#f8fafc',
                color: active ? '#ffffff' : '#334155',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: active ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Companies List */}
      {loading ? (
        <div style={{ padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            <span>Buffering company opportunities...</span>
          </div>
          <CompanyCardSkeleton count={8} />
        </div>
      ) : companies.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--color-text-muted)' }}
        >
          <Building2 size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-800)' }}>
            No companies found matching "{search}"
          </h3>
          <p style={{ marginTop: '0.4rem' }}>Try searching with another keyword or clear search filter.</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSearch('');
              loadCompanies(1, '');
            }}
            style={{ marginTop: '1.25rem' }}
          >
            Show All Companies
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
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
                  border: company.has_applied
                    ? '1.5px solid #a7f3d0'
                    : '1px solid var(--color-border)',
                  backgroundColor: company.has_applied ? '#f0fdf4' : '#ffffff',
                }}
              >
                <div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: company.has_applied
                        ? 'var(--color-success-50)'
                        : 'var(--color-brand-50)',
                      color: company.has_applied
                        ? 'var(--color-success-600)'
                        : 'var(--color-brand-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      marginBottom: '1rem',
                      border: company.has_applied ? '1px solid #bbf7d0' : 'none',
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
                      <CheckCircle2 size={13} /> ✓ Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => openApplyModal(company)}
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
            totalItems={totalCompanies}
            pageSize={20}
            onPageChange={(p) => setCurrentPage(p)}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        </>
      )}

      {/* Confirmation Modal: Requirement 15 */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Application"
        message={
          <div>
            <p style={{ fontSize: '1rem', marginBottom: '0.85rem', color: 'var(--color-primary-800)' }}>
              Are you sure you want to register for this company?
            </p>
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-bg-main)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '1.15rem',
                color: 'var(--color-brand-700)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
              }}
            >
              <Building2 size={20} />
              {selectedCompany?.name}
            </div>
            <p
              style={{
                marginTop: '0.85rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              Once submitted, your application will be forwarded to the organizing placement cell.
              You can apply to multiple companies for TKRCET Job Mela 2026.
            </p>
          </div>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        loading={applying}
        onConfirm={confirmApply}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
      />
    </div>
  );
};

export default StudentCompaniesPage;
