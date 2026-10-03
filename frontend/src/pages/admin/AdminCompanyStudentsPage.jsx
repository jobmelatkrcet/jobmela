import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Building2,
  Users,
  Download,
  ArrowLeft,
  Search,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
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

const hasValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return !['', 'n/a', 'na', 'nil', '-', '--', 'null', 'none', 'unknown', 'not available'].includes(s);
};

const AdminCompanyStudentsPage = () => {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [students, setStudents] = useState([]);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadCompanyStudents(currentPage, search);
  }, [id, currentPage]);

  const loadCompanyStudents = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const data = await adminService.getCompanyStudents(id, {
        page,
        search: searchQuery,
      });
      setStudents(data.results || []);
      setCompany(data.company || null);
      setTotalRegistered(data.company?.total_registered || data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
    } catch (err) {
      console.error('Error fetching company students:', err);
      setAlert({ type: 'danger', message: 'Failed to load company applicants data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCompanyStudents(1, search);
  };

  // Mandatory Feature: Company-wise Excel Export
  const handleExportExcel = async () => {
    if (!company) return;
    setExporting(true);
    setAlert(null);
    try {
      const cleanName = company.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanName}_Registered_Students.xlsx`;
      await adminService.exportCompanyExcel(company.id, filename);
      setAlert({
        type: 'success',
        message: `Successfully generated and downloaded ${filename} with only ${company.name} registered candidates.`,
      });
    } catch (err) {
      console.error('Excel export failed:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to generate Excel export file. Please check server logs.',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/admin/companies"
          style={{
            color: 'var(--color-primary-700)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Companies List
        </Link>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Company Header matching Requirement 23 & 24 */}
      <div
        className="card"
        style={{
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-brand-50)',
                color: 'var(--color-brand-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.4rem',
                border: '1px solid var(--color-brand-100)',
              }}
            >
              {company?.name ? company.name.charAt(0).toUpperCase() : 'C'}
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  color: 'var(--color-brand-600)',
                  marginBottom: '0.2rem',
                }}
              >
                Participating Company Dossier
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>
                {company?.name || 'Company'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.92rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.35rem',
                }}
              >
                <Users size={16} color="var(--color-brand-600)" />
                Total Registered Students:{' '}
                <strong style={{ color: 'var(--color-primary-900)', fontSize: '1.05rem' }}>
                  {totalRegistered.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Mandatory Feature: Company-wise Export Excel Button */}
          <div>
            <button
              onClick={handleExportExcel}
              disabled={exporting || totalRegistered === 0}
              className="btn btn-success btn-lg"
              style={{
                gap: '0.6rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                fontWeight: 700,
              }}
              title="Export registered students for this company to Excel (.xlsx)"
            >
              {exporting ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} /> Generating Excel...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={20} /> EXPORT STUDENTS EXCEL
                </>
              )}
            </button>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                textAlign: 'right',
                marginTop: '0.4rem',
              }}
            >
              Downloads: {company?.name ? company.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Company'}_Registered_Students.xlsx
            </div>
          </div>

          {/* Dynamic Company Details Grid (Requirement 5) */}
          {company && (hasValue(company.sector) || hasValue(company.job_position) || hasValue(company.salary_ctc) || hasValue(company.location) || hasValue(company.room_no) || hasValue(company.openings) || hasValue(company.qualification) || hasValue(company.gender) || hasValue(company.eligibility) || hasValue(company.facilities)) && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--color-border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                fontSize: '0.88rem',
              }}
            >
              {hasValue(company.sector) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Sector</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>{company.sector}</span>
                </div>
              )}
              {hasValue(company.job_position) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Job Position</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-900)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Briefcase size={14} color="var(--color-brand-600)" /> {company.job_position}
                  </span>
                </div>
              )}
              {hasValue(company.salary_ctc) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Salary / CTC</span>
                  <span style={{ fontWeight: 700, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <IndianRupee size={14} color="#059669" /> {company.salary_ctc}
                  </span>
                </div>
              )}
              {hasValue(company.location) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Location</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-primary-900)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--color-brand-600)" /> {company.location}
                  </span>
                </div>
              )}
              {hasValue(company.room_no) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Room / Venue</span>
                  <span style={{ fontWeight: 700, color: '#6d28d9', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DoorClosed size={14} color="#7c3aed" /> Room {company.room_no}
                  </span>
                </div>
              )}
              {hasValue(company.openings) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Openings</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>{company.openings}</span>
                </div>
              )}
              {hasValue(company.qualification) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Qualification</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-primary-900)' }}>{company.qualification}</span>
                </div>
              )}
              {hasValue(company.gender) && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Gender</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-primary-900)' }}>{company.gender}</span>
                </div>
              )}
              {hasValue(company.eligibility) && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Eligibility</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-primary-900)' }}>{company.eligibility}</span>
                </div>
              )}
              {hasValue(company.facilities) && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Facilities</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-primary-900)' }}>{company.facilities}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search within company candidates */}
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
              placeholder={`Search registered candidates for ${company?.name || 'this company'}...`}
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
                loadCompanyStudents(1, '');
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Showing {students.length} applicants on page {currentPage}
        </div>
      </div>

      {/* Table: Name | Email | Mobile | Qualification | College | Applied Date */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner spinner-primary" style={{ margin: '0 auto 1rem', width: 36, height: 36 }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading applicants registered for {company?.name}...</p>
        </div>
      ) : students.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--color-text-muted)' }}
        >
          <Users size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-800)' }}>
            No Students Registered for {company?.name || 'This Company'}
          </h3>
          <p style={{ marginTop: '0.4rem' }}>
            {search
              ? `No applicants match the search keyword "${search}".`
              : 'Students can register and apply directly from the student portal.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Qualification</th>
                  <th>College / Institution</th>
                  <th>Applied Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {(currentPage - 1) * 20 + idx + 1}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary-900)' }}>{item.name}</strong>
                    </td>
                    <td>
                      <a href={`mailto:${item.email}`} style={{ color: 'var(--color-brand-600)' }}>
                        {item.email}
                      </a>
                    </td>
                    <td>{item.mobile || '—'}</td>
                    <td>
                      <span className="badge badge-blue">
                        {item.qualification || '—'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.college || '—'}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <Clock size={14} />
                        {new Date(item.applied_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalRegistered}
            pageSize={20}
            onPageChange={(p) => setCurrentPage(p)}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        </>
      )}
    </div>
  );
};

export default AdminCompanyStudentsPage;
