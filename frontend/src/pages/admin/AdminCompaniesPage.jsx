import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Building2,
  Search,
  Upload,
  Download,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  X,
  ArrowRight,
  Briefcase,
  MapPin,
  IndianRupee,
  GraduationCap,
  DoorClosed,
  ShieldCheck,
  Gift,
  Info,
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { TableSkeleton } from '../../components/Skeleton';

const hasValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return !['', 'n/a', 'na', 'nil', '-', '--', 'null', 'none', 'unknown', 'not available'].includes(s);
};

const AdminCompaniesPage = ({ onTabChange }) => {
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [alert, setAlert] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCompanies(currentPage, search, orderBy);
  }, [currentPage, orderBy]);

  const loadCompanies = async (page = 1, searchQuery = '', order = 'name') => {
    setLoading(true);
    try {
      const data = await adminService.getCompanies({
        page,
        search: searchQuery,
        order,
      });
      setCompanies(data.results || []);
      setTotalCompanies(data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setAlert({ type: 'danger', message: 'Failed to load companies list.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setPreviewData(null);
    setUploadError('');
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenUploadModal = () => {
    setUploadFile(null);
    setPreviewData(null);
    setUploadError('');
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploadModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCompanies(1, search, orderBy);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadError('');
      setUploadResult(null);
      setPreviewData(null);
      setLoadingPreview(true);

      try {
        const preview = await adminService.previewCompaniesExcel(file);
        setPreviewData(preview);
      } catch (err) {
        console.error('Preview error:', err);
        const errMsg =
          err.response?.data?.error ||
          'Failed to inspect Excel file. Please ensure it is a valid spreadsheet.';
        setUploadError(errMsg);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please choose an Excel file (.xlsx) to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadResult(null);

    try {
      const result = await adminService.uploadCompaniesExcel(uploadFile, false);
      setUploadResult(result);
      // Refresh list
      loadCompanies(1, search, orderBy);
    } catch (err) {
      console.error('Upload error:', err);
      const errMsg =
        err.response?.data?.error ||
        'Failed to process Excel upload. Please verify file formatting.';
      setUploadError(errMsg);
    } finally {
      setUploading(false);
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
          <h2 style={{ fontSize: '1.9rem', marginBottom: '0.25rem' }}>
            Company Management
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Manage participating companies, inspect registered student cohorts, and import rosters.
          </p>
        </div>

        {/* Major Feature Upload Button */}
        <div className="admin-companies-top-actions">
          <button
            onClick={handleOpenUploadModal}
            className="btn btn-primary"
            style={{ gap: '0.5rem', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)' }}
          >
            <Upload size={17} /> UPLOAD COMPANIES EXCEL
          </button>

          {onTabChange ? (
            <button
              type="button"
              onClick={() => onTabChange('rooms')}
              className="btn btn-outline"
              style={{ gap: '0.4rem', color: '#6d28d9', borderColor: '#c4b5fd' }}
            >
              <DoorClosed size={16} /> Room Allocation
            </button>
          ) : (
            <Link
              to="/admin?tab=rooms"
              className="btn btn-outline"
              style={{ gap: '0.4rem', color: '#6d28d9', borderColor: '#c4b5fd' }}
            >
              <DoorClosed size={16} /> Room Allocation
            </Link>
          )}
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="card admin-search-filter-card">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
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
                loadCompanies(1, '', orderBy);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="admin-search-filter-controls">
          <div className="admin-search-sort-box">
            <span style={{ color: 'var(--color-text-muted)' }}>Sort by:</span>
            <select
              className="form-control form-control-sm"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="name">Company Name (A-Z)</option>
              <option value="applications_desc">Most Registered Students</option>
              <option value="applications_asc">Least Registered Students</option>
            </select>
          </div>

          <div className="admin-search-total-badge">
            Total: <strong>{totalCompanies}</strong>
          </div>
        </div>
      </div>

      {/* Companies List matching Prompt Requirement 22 */}
      {loading ? (
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            <span>Buffering company records & venue room assignments...</span>
          </div>
          <TableSkeleton rows={7} columns={6} />
        </div>
      ) : companies.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--color-text-muted)' }}
        >
          <Building2 size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-800)' }}>
            No companies found
          </h3>
          <p style={{ marginTop: '0.4rem' }}>
            Use the "Upload Companies Excel" button above to upload companies from an Excel spreadsheet.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {companies.map((company) => (
              <div
                key={company.id}
                className="card card-hover admin-company-row-card"
              >
                <div className="admin-company-main-col">
                  <div className="admin-company-avatar-box">
                    {company.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="admin-company-content-box">
                    <div className="admin-company-header-row">
                      <h3 className="admin-company-title">
                        {company.name}
                      </h3>
                      {hasValue(company.sector) && (
                        <span className="badge badge-blue admin-company-sector-badge">
                          {company.sector}
                        </span>
                      )}
                    </div>

                    {/* Role line */}
                    {hasValue(company.job_position) && (
                      <div className="admin-company-role-line">
                        <Briefcase size={13} color="var(--color-brand-600)" />
                        <span><strong>Role:</strong> {company.job_position}</span>
                      </div>
                    )}

                    {/* Specs chips grid */}
                    <div className="admin-company-specs-grid">
                      {hasValue(company.salary_ctc) && (
                        <span className="admin-company-spec-pill pill-salary">
                          <IndianRupee size={12} />
                          <span>{company.salary_ctc}</span>
                        </span>
                      )}
                      {hasValue(company.room_no) && (
                        <span className="admin-company-spec-pill pill-room">
                          <DoorClosed size={12} />
                          <span>Room {company.room_no}</span>
                        </span>
                      )}
                      {hasValue(company.openings) && (
                        <span className="admin-company-spec-pill pill-openings">
                          <Users size={12} />
                          <span>{company.openings} Openings</span>
                        </span>
                      )}
                      {hasValue(company.qualification) && (
                        <span className="admin-company-spec-pill pill-qual">
                          <GraduationCap size={12} />
                          <span>{company.qualification}</span>
                        </span>
                      )}
                      {hasValue(company.location) && (
                        <span className="admin-company-spec-pill pill-location">
                          <MapPin size={12} />
                          <span>{company.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-company-actions-col">
                  <div className="admin-company-registered-chip">
                    <Users size={13} />
                    <span><strong>{company.registered_students_count || 0}</strong> Registered</span>
                  </div>

                  <Link
                    to={`/admin/companies/${company.id}`}
                    className="btn btn-primary admin-company-view-btn"
                  >
                    <span>View Students</span>
                    <ArrowRight size={14} />
                  </Link>
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

      {/* Excel Upload Modal (Requirement 25, 26) */}
      {isUploadModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal-content"
            style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileSpreadsheet size={22} color="var(--color-brand-600)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Upload Companies Excel</h3>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Dynamic Excel Importer Description */}
              <p style={{ fontSize: '0.92rem', color: 'var(--color-primary-800)', marginBottom: '0.75rem', lineHeight: 1.5, fontWeight: 500 }}>
                Upload the original company Excel file. The system automatically detects available company information such as job position, qualification, salary, location, eligibility, facilities and room number.
              </p>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.82rem',
                  color: '#166534',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Accurate 1-to-1 Import:</strong> Company Name is the mandatory field. Every company row in your spreadsheet will be imported directly as its own entry without merging.
                </span>
              </div>

              {uploadError && (
                <div style={{ marginBottom: '1rem' }}>
                  <Alert type="danger" message={uploadError} onClose={() => setUploadError('')} />
                </div>
              )}

              {/* Upload Result (after import) */}
              {uploadResult && (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-success-50)',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success-700)', fontWeight: 700, marginBottom: '0.75rem' }}>
                    <CheckCircle2 size={18} /> {uploadResult.message || 'Import Complete'}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '0.75rem',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div>Rows Processed: <strong>{uploadResult.total_rows}</strong></div>
                    <div>Companies Added: <strong style={{ color: 'var(--color-success-700)' }}>+{uploadResult.new_companies}</strong></div>
                    <div>Invalid / Blank Rows: <strong style={{ color: uploadResult.invalid_rows ? '#dc2626' : 'inherit' }}>{uploadResult.invalid_rows || 0}</strong></div>
                  </div>

                  {uploadResult.columns_detected && uploadResult.columns_detected.length > 0 && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #d1fae5' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                        Recognized Columns ({uploadResult.columns_detected.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {uploadResult.columns_detected.map((col, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.76rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: '#ffffff',
                              border: '1px solid #a7f3d0',
                              fontWeight: 600,
                              color: 'var(--color-primary-900)',
                            }}
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* File Dropzone / Picker */}
              {!uploadResult && (
                <div
                  style={{
                    border: '2px dashed var(--color-brand-500)',
                    borderRadius: 'var(--radius-lg)',
                    padding: uploadFile ? '1.25rem' : '2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-brand-50)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  <Upload size={32} color="var(--color-brand-600)" style={{ margin: '0 auto 0.5rem' }} />

                  {uploadFile ? (
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '0.95rem' }}>
                        {uploadFile.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        {(uploadFile.size / 1024).toFixed(1)} KB • Click to choose a different file
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '0.95rem' }}>
                        Click to choose or drop original organizer Excel file
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                        Supports .xlsx and .xls (ESWAR, Guntur, or custom format)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Loading Preview Spinner */}
              {loadingPreview && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-brand-600)' }}>
                  <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Analyzing spreadsheet columns & rows...</div>
                </div>
              )}

              {/* IMPORT PREVIEW (Exact Requirement) */}
              {previewData && !loadingPreview && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #93c5fd',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileSpreadsheet size={18} color="var(--color-brand-600)" />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary-900)' }}>
                        Import Preview
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '0.2rem 0.55rem', borderRadius: 9999 }}>
                      Ready to Process
                    </span>
                  </div>

                  {/* Preview Metrics Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>File Name</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-900)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                        {previewData.filename}
                      </div>
                    </div>

                    <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Rows Detected</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-900)', marginTop: '0.2rem' }}>
                        {previewData.total_rows}
                      </div>
                    </div>

                    <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#065f46', textTransform: 'uppercase', fontWeight: 700 }}>Companies Detected</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem' }}>
                        {previewData.companies_detected}
                      </div>
                    </div>

                    <div style={{ padding: '0.65rem 0.75rem', backgroundColor: previewData.invalid_rows > 0 ? '#fff7ed' : '#f8fafc', borderRadius: 'var(--radius-md)', border: `1px solid ${previewData.invalid_rows > 0 ? '#fed7aa' : '#e2e8f0'}` }}>
                      <div style={{ fontSize: '0.72rem', color: previewData.invalid_rows > 0 ? '#9a3412' : 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Invalid Rows</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: previewData.invalid_rows > 0 ? '#c2410c' : 'var(--color-primary-900)', marginTop: '0.2rem' }}>
                        {previewData.invalid_rows}
                        {previewData.invalid_rows > 0 && <span style={{ fontSize: '0.72rem', fontWeight: 500, marginLeft: '0.35rem' }}>(skipped)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Detected Columns */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-900)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Detected Columns ({previewData.columns_detected?.length || 0}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {previewData.columns_detected && previewData.columns_detected.length > 0 ? (
                        previewData.columns_detected.map((col, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: '#e0f2fe',
                              border: '1px solid #bae6fd',
                              fontWeight: 600,
                              color: '#0369a1',
                            }}
                          >
                            ✓ {col}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>No matching columns detected</span>
                      )}
                    </div>
                  </div>

                  {/* Sample rows preview */}
                  {previewData.sample_rows && previewData.sample_rows.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Sample Data (First {previewData.sample_rows.length} Companies):
                      </div>
                      <div style={{ overflowX: 'auto', maxHeight: 150, border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                          <thead style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                              <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Company Name</th>
                              <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Position / Sector</th>
                              <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Salary / CTC</th>
                              <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Location</th>
                              <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Room</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.sample_rows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.35rem 0.5rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                                  {row.name || '—'}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', color: 'var(--color-text-muted)' }}>
                                  {row.job_position || row.sector || '—'}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', color: 'var(--color-text-muted)' }}>
                                  {row.salary_ctc || '—'}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', color: 'var(--color-text-muted)' }}>
                                  {row.location || '—'}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', color: 'var(--color-text-muted)' }}>
                                  {row.room_no || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 1-to-1 accurate import note */}
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#047857', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.4 }}>
                    <strong>Accurate 1-to-1 Import:</strong> Every company row will be imported directly as its own entry without merging, ensuring an exact count matching your spreadsheet.
                  </div>
                </div>
              )}

            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCloseModal}
                disabled={uploading}
              >
                {uploadResult ? 'Done' : 'Cancel'}
              </button>

              {!uploadResult && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUploadSubmit}
                  disabled={uploading || !uploadFile || loadingPreview}
                >
                  {uploading ? (
                    <>
                      <span className="spinner" style={{ width: 18, height: 18 }} /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Process & Import
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesPage;
