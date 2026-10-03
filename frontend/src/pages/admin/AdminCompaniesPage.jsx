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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCompanies(1, search, orderBy);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadError('');
      setUploadResult(null);
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
            onClick={() => {
              setIsUploadModalOpen(true);
              setUploadResult(null);
              setUploadError('');
              setUploadFile(null);
            }}
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
        <div className="modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileSpreadsheet size={22} color="var(--color-brand-600)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Upload Companies Excel</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.92rem', color: 'var(--color-primary-700)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Upload an Excel spreadsheet (<strong>.xlsx</strong> or <strong>.xls</strong>) to update the participating company list.
                The system automatically reads company names, removes blank rows, and ignores duplicate entries safely.
              </p>

              {/* Format Guide */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--color-primary-900)' }}>
                  Smart Dynamic Excel Importer:
                </div>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.82rem', lineHeight: 1.4 }}>
                  Upload your original organizer spreadsheet directly. The system automatically detects and maps columns:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {['Company Name', 'Sector', 'Job Position', 'Openings', 'Salary / CTC', 'Qualification', 'Location', 'Gender', 'Eligibility', 'Facilities', 'Room No.'].map((col, idx) => (
                    <span key={idx} style={{ fontSize: '0.74rem', padding: '0.15rem 0.45rem', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {uploadError && (
                <Alert type="danger" message={uploadError} onClose={() => setUploadError('')} />
              )}

              {/* Upload Result (Requirements 8 & 26) */}
              {uploadResult && (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-success-50)',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
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
              <div
                style={{
                  border: '2px dashed var(--color-brand-500)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-brand-50)',
                  cursor: 'pointer',
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

                <Upload size={36} color="var(--color-brand-600)" style={{ margin: '0 auto 0.75rem' }} />

                {uploadFile ? (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary-900)' }}>
                      {uploadFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {(uploadFile.size / 1024).toFixed(1)} KB • Click to replace
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary-900)' }}>
                      Click to choose or drop Excel file
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                      Supports .xlsx and .xls spreadsheets
                    </div>
                  </div>
                )}
              </div>

              {/* Option to clear pre-existing companies */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.9rem 1rem',
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
                      fontSize: '0.9rem',
                      color: clearExisting ? '#991b1b' : 'var(--color-text-main)',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                  >
                    Erase all pre-existing companies before importing
                  </label>
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      fontSize: '0.8rem',
                      color: clearExisting ? '#b91c1c' : 'var(--color-text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {clearExisting
                      ? 'Recommended for fresh Jobmela roster: All existing sample/test companies will be erased so only your new Excel companies appear.'
                      : 'Unchecked: New companies will be merged into the existing company list.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={uploading}
              >
                {uploadResult ? 'Done' : 'Cancel'}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUploadSubmit}
                disabled={uploading || !uploadFile}
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
