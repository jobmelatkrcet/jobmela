import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Users,
  Search,
  Eye,
  X,
  Building2,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Student detail modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadStudents(currentPage, search);
  }, [currentPage]);

  const loadStudents = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const data = await adminService.getStudents({ page, search: searchQuery });
      setStudents(data.results || []);
      setTotalStudents(data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
    } catch (err) {
      console.error('Error fetching students:', err);
      setAlert({ type: 'danger', message: 'Failed to load students list.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadStudents(1, search);
  };

  const handleOpenStudent = async (studentId) => {
    setIsModalOpen(true);
    setDetailLoading(true);
    try {
      const data = await adminService.getStudent(studentId);
      setSelectedStudent(data);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setAlert({ type: 'danger', message: 'Could not load student profile.' });
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
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
            Registered Students Directory
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Search candidates, inspect qualifications, and view their company applications.
          </p>
        </div>

        <div className="badge badge-blue" style={{ padding: '0.45rem 1rem', fontSize: '0.88rem' }}>
          Total Candidates: {totalStudents}
        </div>
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
          style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 260, maxWidth: 500 }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name, email, mobile, qualification, college..."
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
                loadStudents(1, '');
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Showing {students.length} students on page {currentPage}
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner spinner-primary" style={{ margin: '0 auto 1rem', width: 36, height: 36 }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--color-text-muted)' }}
        >
          <Users size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-800)' }}>
            No students found matching "{search}"
          </h3>
          <p style={{ marginTop: '0.4rem' }}>Try clearing the search query.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Qualification</th>
                  <th>College / Institution</th>
                  <th>Reg. Date</th>
                  <th style={{ textAlign: 'center' }}>Applications</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {(currentPage - 1) * 20 + idx + 1}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary-900)' }}>
                        {student.full_name}
                      </strong>
                    </td>
                    <td>
                      <a
                        href={`mailto:${student.email}`}
                        style={{ color: 'var(--color-brand-600)' }}
                      >
                        {student.email}
                      </a>
                    </td>
                    <td>{student.mobile || '—'}</td>
                    <td>
                      <span className="badge badge-blue">
                        {student.qualification || '—'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.college || '—'}
                    </td>
                    <td>
                      {new Date(student.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-applied">
                        {student.applications_count} Applied
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenStudent(student.id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.75rem', gap: '0.35rem' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalStudents}
            pageSize={20}
            onPageChange={(p) => setCurrentPage(p)}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        </>
      )}

      {/* Student Details & Applied Companies Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 650 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={20} color="var(--color-brand-600)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Candidate Profile Details</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {detailLoading || !selectedStudent ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div className="spinner spinner-primary" style={{ margin: '0 auto 0.75rem' }} />
                  <p>Loading candidate details...</p>
                </div>
              ) : (
                <div>
                  {/* Basic Info */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      padding: '1.25rem',
                      backgroundColor: 'var(--color-bg-main)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.5rem',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Candidate Name
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary-900)' }}>
                        {selectedStudent.full_name}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Email Address
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>
                        {selectedStudent.email}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Mobile Number
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>
                        {selectedStudent.mobile || '—'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Qualification
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-brand-700)' }}>
                        {selectedStudent.qualification || '—'}
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        College / Institution
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>
                        {selectedStudent.college || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Applied Companies List */}
                  <div>
                    <h4
                      style={{
                        fontSize: '1.05rem',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Applied Companies ({selectedStudent.applications?.length || 0})</span>
                      <span className="badge badge-applied">
                        {selectedStudent.applications_count} Total
                      </span>
                    </h4>

                    {selectedStudent.applications?.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '1.5rem',
                          backgroundColor: '#ffffff',
                          border: '1px dashed var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        This student has not submitted applications for any companies yet.
                      </div>
                    ) : (
                      <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Company Name</th>
                              <th>Applied Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudent.applications?.map((app, i) => (
                              <tr key={app.id}>
                                <td>{i + 1}</td>
                                <td>
                                  <strong>{app.company_name}</strong>
                                </td>
                                <td>
                                  {new Date(app.applied_at).toLocaleString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;
