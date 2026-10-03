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
  Trash2,
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
import ConfirmModal from '../../components/ConfirmModal';

const hasValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return !['', 'n/a', 'na', 'nil', '-', '--', 'null', 'none', 'unknown', 'not available'].includes(s);
};

const AdminCompaniesPage = () => {
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
  const [clearExisting, setClearExisting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [clearing, setClearing] = useState(false);
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
    setClearExisting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenUploadModal = () => {
    setUploadFile(null);
    setPreviewData(null);
    setUploadError('');
    setUploadResult(null);
    setClearExisting(false);
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
      const result = await adminService.uploadCompaniesExcel(uploadFile, clearExisting);
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

  const handleClearAllSubmit = async () => {
    setClearing(true);
    try {
      const res = await adminService.clearAllCompanies();
      setShowClearConfirmModal(false);
      setAlert({
        type: 'success',
        message: res.message || 'All companies have been successfully erased.',
      });
      setCurrentPage(1);
      loadCompanies(1, search, orderBy);
    } catch (err) {
      console.error('Failed to clear companies:', err);
      setAlert({
        type: 'danger',
        message: err.response?.data?.error || 'Failed to clear companies.',
      });
    } finally {
      setClearing(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await adminService.downloadTemplate();
    } catch (err) {
      console.error('Failed to download template:', err);
      setAlert({ type: 'danger', message: 'Failed to download Excel template.' });
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
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenUploadModal}
            className="btn btn-primary"
            style={{ gap: '0.5rem', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)' }}
          >
            <Upload size={17} /> UPLOAD COMPANIES EXCEL
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="btn btn-outline"
            style={{ gap: '0.4rem' }}
          >
            <Download size={16} /> Sample Excel Template
          </button>

          {totalCompanies > 0 && (
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="btn btn-outline"
              style={{
                gap: '0.4rem',
                color: 'var(--color-danger-600)',
                borderColor: '#fca5a5',
              }}
              title="Erase all pre-existing sample companies"
            >
              <Trash2 size={16} /> Erase All Companies
            </button>
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
          style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 260, maxWidth: 450 }}
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
                loadCompanies(1, '', orderBy);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Sort by:</span>
            <select
              className="form-control"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="name">Company Name (A-Z)</option>
              <option value="applications_desc">Most Registered Students</option>
              <option value="applications_asc">Least Registered Students</option>
            </select>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Total: <strong style={{ color: 'var(--color-primary-900)' }}>{totalCompanies}</strong>
          </div>
        </div>
      </div>

      {/* Companies List matching Prompt Requirement 22 */}
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
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.35rem 1.75rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand-50)',
                      color: 'var(--color-brand-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                    }}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--color-primary-900)',
                          margin: 0,
                        }}
                      >
                        {company.name}
                      </h3>
                      {hasValue(company.sector) && (
                        <span
                          className="badge badge-blue"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', textTransform: 'none' }}
                        >
                          {company.sector}
                        </span>
                      )}
                    </div>

                    {/* Available details only (Requirement 5) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.45rem', fontSize: '0.82rem' }}>
                      {hasValue(company.job_position) && (
                        <span style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Briefcase size={13} color="var(--color-brand-600)" />
                          <strong style={{ color: 'var(--color-primary-800)' }}>{company.job_position}</strong>
                        </span>
                      )}
                      {hasValue(company.salary_ctc) && (
                        <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                          <IndianRupee size={13} color="#059669" />
                          {company.salary_ctc}
                        </span>
                      )}
                      {hasValue(company.location) && (
                        <span style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} color="var(--color-brand-600)" />
                          {company.location}
                        </span>
                      )}
                      {hasValue(company.room_no) && (
                        <span style={{ color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                          <DoorClosed size={13} color="#7c3aed" />
                          Room {company.room_no}
                        </span>
                      )}
                      {hasValue(company.openings) && (
                        <span style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Users size={13} color="var(--color-brand-600)" />
                          {company.openings} Openings
                        </span>
                      )}
                      {hasValue(company.qualification) && (
                        <span style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <GraduationCap size={13} color="var(--color-brand-600)" />
                          {company.qualification}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--color-brand-700)',
                      }}
                    >
                      {company.registered_students_count?.toLocaleString() || 0}
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      Students Registered
                    </div>
                  </div>

                  <Link
                    to={`/admin/companies/${company.id}`}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                  >
                    VIEW STUDENTS <ArrowRight size={16} />
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
                  <strong>Flexible Structure:</strong> Company Name is the ONLY mandatory field. All other columns are optional and different column formats/namings are automatically recognized.
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
                    <div>Companies Processed: <strong>{uploadResult.total_rows}</strong></div>
                    <div>New Companies: <strong style={{ color: 'var(--color-success-700)' }}>+{uploadResult.new_companies}</strong></div>
                    <div>Updated Companies: <strong style={{ color: '#2563eb' }}>{uploadResult.updated_companies || 0}</strong></div>
                    <div>Invalid Rows: <strong style={{ color: uploadResult.invalid_rows ? '#dc2626' : 'inherit' }}>{uploadResult.invalid_rows || 0}</strong></div>
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

                    <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '0.72rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 700 }}>Possible Duplicates</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.2rem' }}>
                        {previewData.possible_duplicates_count}
                        <span style={{ fontSize: '0.72rem', fontWeight: 500, marginLeft: '0.35rem' }}>(merge mode)</span>
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

                  {/* Duplicate merging note */}
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#1e40af', backgroundColor: '#eff6ff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.4 }}>
                    <strong>Smart Merge Enabled:</strong> Matching company records (e.g. <em>ABC Ltd</em> and <em>ABC Limited</em>) will be merged non-destructively. Existing information will NOT be deleted or lost.
                  </div>
                </div>
              )}

              {/* Option to clear pre-existing companies */}
              {!uploadResult && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: clearExisting ? '#fef2f2' : 'var(--color-bg-main)',
                    border: `1.5px solid ${clearExisting ? '#f87171' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setClearExisting(!clearExisting)}
                >
                  <input
                    type="checkbox"
                    id="clearExistingCheckbox"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginTop: '0.2rem',
                      width: 18,
                      height: 18,
                      accentColor: '#dc2626',
                      cursor: 'pointer',
                    }}
                  />
                  <div>
                    <label
                      htmlFor="clearExistingCheckbox"
                      style={{
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        color: clearExisting ? '#991b1b' : 'var(--color-text-main)',
                        cursor: 'pointer',
                        display: 'block',
                      }}
                    >
                      Erase all pre-existing companies before importing
                    </label>
                    <p
                      style={{
                        margin: '0.2rem 0 0',
                        fontSize: '0.78rem',
                        color: clearExisting ? '#b91c1c' : 'var(--color-text-muted)',
                        lineHeight: 1.4,
                      }}
                    >
                      {clearExisting
                        ? 'Recommended if you want a clean slate for this Job Mela: All current companies will be replaced by the Excel.'
                        : 'Unchecked (Default): Preserves existing database and merges or adds companies non-destructively.'}
                    </p>
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

      {/* Confirm Clear All Companies Modal */}
      <ConfirmModal
        isOpen={showClearConfirmModal}
        title="Erase All Pre-existing Companies?"
        message={`Are you sure you want to permanently erase all ${totalCompanies} pre-existing companies from the database? This will clear all sample companies so you can start with a fresh roster. This action cannot be undone.`}
        confirmText="Yes, Erase All Companies"
        cancelText="Keep Companies"
        variant="danger"
        loading={clearing}
        onConfirm={handleClearAllSubmit}
        onCancel={() => setShowClearConfirmModal(false)}
      />
    </div>
  );
};

export default AdminCompaniesPage;
