import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import roomService from '../../services/roomService';
import {
  DoorClosed,
  Upload,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  Printer,
  QrCode,
  Users,
  Search,
  ArrowRight,
  Info,
  RefreshCw,
  FileDown,
} from 'lucide-react';
import Alert from '../../components/Alert';
import { generatePlacardsPDF } from '../../utils/qrPlacardPdfGenerator';
import { TableSkeleton } from '../../components/Skeleton';

const AdminRoomAllocationPage = ({ onTabChange }) => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  // PDF Export state
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0, name: '' });

  // Upload & Preview state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [allocationSuccess, setAllocationSuccess] = useState(null);

  // QR Modal state
  const [selectedRoomQR, setSelectedRoomQR] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);

  // Room Students Modal & Live Check-in Monitor state
  const [activeViewMode, setActiveViewMode] = useState('allocations'); // 'allocations' | 'live'
  const [selectedRoomStudents, setSelectedRoomStudents] = useState(null);
  const [loadingRoomStudents, setLoadingRoomStudents] = useState(false);
  const [liveRoomsData, setLiveRoomsData] = useState([]);
  const [loadingLiveRooms, setLoadingLiveRooms] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const handleViewRoomStudents = async (roomId) => {
    setLoadingRoomStudents(true);
    try {
      const data = await roomService.getRoomQR(roomId);
      setSelectedRoomStudents(data);
    } catch (err) {
      console.error('Failed to load room candidates:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to load checked-in candidates for this room.',
      });
    } finally {
      setLoadingRoomStudents(false);
    }
  };

  const loadLiveRooms = async () => {
    setLoadingLiveRooms(true);
    try {
      const res = await roomService.getLiveRoomCheckins(search);
      setLiveRoomsData(res.rooms || []);
    } catch (err) {
      console.error('Failed to load live rooms:', err);
    } finally {
      setLoadingLiveRooms(false);
    }
  };

  useEffect(() => {
    if (activeViewMode === 'live') {
      loadLiveRooms();
    }
  }, [activeViewMode, search]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomsSummary();
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load room summary:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to load room allocation summary. Please refresh the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = () => {
    setUploadFile(null);
    setPreviewData(null);
    setUploadError('');
    setAllocationSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setPreviewData(null);
    setUploadError('');
    setAllocationSuccess(null);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadError('');
      setPreviewData(null);
      setLoadingPreview(true);

      try {
        const preview = await roomService.previewRoomExcel(file);
        setPreviewData(preview);
      } catch (err) {
        console.error('Preview error:', err);
        const errMsg =
          err.response?.data?.error ||
          'Failed to inspect Room Numbers Excel file. Please ensure it has a valid Room No column.';
        setUploadError(errMsg);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  const handleConfirmAllocation = async () => {
    if (!previewData || !previewData.rooms_sequence) return;
    setConfirming(true);
    setUploadError('');

    try {
      const res = await roomService.confirmAllocation(previewData.rooms_sequence);
      setAllocationSuccess(res.message);
      // Reload summary
      await loadSummary();
    } catch (err) {
      console.error('Allocation error:', err);
      const errMsg =
        err.response?.data?.error ||
        'Failed to save automatic room allocation. Please try again.';
      setUploadError(errMsg);
    } finally {
      setConfirming(false);
    }
  };

  const handleViewQR = async (roomId) => {
    setLoadingQR(true);
    try {
      const data = await roomService.getRoomQR(roomId);
      setSelectedRoomQR(data);
    } catch (err) {
      console.error('Failed to load room QR:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to load QR code for this room.',
      });
    } finally {
      setLoadingQR(false);
    }
  };

  const handleToggleQRStatus = async (roomId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await roomService.toggleRoomStatus(roomId, newStatus);
      // Update local state
      if (selectedRoomQR && selectedRoomQR.id === roomId) {
        setSelectedRoomQR((prev) => ({ ...prev, qr_status: newStatus }));
      }
      loadSummary();
    } catch (err) {
      console.error('Failed to toggle QR status:', err);
      setAlert({ type: 'danger', message: 'Failed to update QR status.' });
    }
  };

  const handlePrintPlacard = () => {
    window.print();
  };

  const handleDownloadAllPlacardsPDF = async () => {
    const allocations = summaryData?.allocations || [];
    const valid = allocations.filter(
      (a) => a.room_number && a.room_number !== 'Unallocated'
    );

    if (valid.length === 0) {
      setAlert({
        type: 'danger',
        message: 'No allocated rooms found to export. Please allocate rooms to companies first.',
      });
      return;
    }

    setExportingPdf(true);
    setPdfProgress({ current: 0, total: valid.length, name: 'Initializing PDF document...' });

    try {
      const res = await generatePlacardsPDF(valid, {
        onProgress: (current, total, item) => {
          setPdfProgress({
            current,
            total,
            name: `ROOM ${item.room_number} — ${item.company_name}`,
          });
        },
      });

      setAlert({
        type: 'success',
        message: `Successfully generated and downloaded ${res.filename} with ${res.count} high-resolution room placards!`,
      });
    } catch (err) {
      console.error('Error generating PDF placards:', err);
      setAlert({
        type: 'danger',
        message: err.message || 'Failed to generate room QR placards PDF.',
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadSinglePlacardPDF = async () => {
    if (!selectedRoomQR) return;
    try {
      const singleItem = [
        {
          room_id: selectedRoomQR.id,
          room_number: selectedRoomQR.room_number,
          company_name: selectedRoomQR.assigned_company?.name || 'Assigned Recruiter',
          sector: selectedRoomQR.assigned_company?.sector || '',
          job_position: selectedRoomQR.assigned_company?.job_position || '',
          unique_room_token: selectedRoomQR.unique_room_token,
          qr_status: selectedRoomQR.qr_status,
        },
      ];
      await generatePlacardsPDF(singleItem, { singleRoom: true });
    } catch (err) {
      console.error('Failed to export single placard PDF:', err);
      setAlert({ type: 'danger', message: 'Failed to download QR placard PDF.' });
    }
  };

  // Filter allocations
  const filteredAllocations = (summaryData?.allocations || []).filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.company_name?.toLowerCase().includes(q) ||
      item.room_number?.toLowerCase().includes(q) ||
      item.sector?.toLowerCase().includes(q) ||
      item.job_position?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-container">
      {/* Header section */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#6d28d9',
                backgroundColor: '#ede9fe',
                padding: '0.2rem 0.6rem',
                borderRadius: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <DoorClosed size={13} /> Venue &amp; Facilities
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>
            Automatic Room Allocation
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            Upload a Room Numbers spreadsheet to automatically pair participating companies with rooms sequentially.
          </p>
        </div>

        <div className="admin-room-top-actions">
          <button
            onClick={handleDownloadAllPlacardsPDF}
            disabled={exportingPdf || !summaryData?.allocated_companies_count}
            className="btn btn-primary"
            style={{
              gap: '0.5rem',
              backgroundColor: '#047857',
              borderColor: '#047857',
              boxShadow: '0 4px 10px rgba(4, 120, 87, 0.25)',
            }}
            title="Download all allocated room QR placards as a single PDF document"
          >
            <FileDown size={17} /> Download All QRs (PDF)
          </button>

          <button
            onClick={handleOpenUploadModal}
            className="btn btn-outline"
            style={{ gap: '0.5rem' }}
          >
            <Upload size={17} /> Upload Room Numbers Excel
          </button>

          {onTabChange ? (
            <button
              type="button"
              onClick={() => onTabChange('companies')}
              className="btn btn-outline"
              style={{ gap: '0.4rem' }}
            >
              <Building2 size={16} /> View Companies
            </button>
          ) : (
            <Link to="/admin?tab=companies" className="btn btn-outline" style={{ gap: '0.4rem' }}>
              <Building2 size={16} /> View Companies
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

      {/* Metrics Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Companies
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-900)', marginTop: '0.35rem' }}>
            {loading ? '...' : summaryData?.total_companies ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Requires 1 interview room each
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase' }}>
            Available Rooms
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6d28d9', marginTop: '0.35rem' }}>
            {loading ? '...' : summaryData?.total_rooms ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Total rooms in database
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
            Allocated Companies
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#047857', marginTop: '0.35rem' }}>
            {loading ? '...' : `${summaryData?.allocated_companies_count ?? 0} / ${summaryData?.total_companies ?? 0}`}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '0.2rem' }}>
            {summaryData?.unallocated_companies_count === 0
              ? '✓ 100% Companies Allocated'
              : `${summaryData?.unallocated_companies_count ?? 0} unallocated`}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>
            Unused / Free Rooms
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>
            {loading ? '...' : summaryData?.available_rooms_count ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Spare capacity for extra drives
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
        <div className="admin-room-assignments-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.25rem' }}>
              Current Room Assignments
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
              Showing {filteredAllocations.length} of {summaryData?.total_companies ?? 0} companies
            </p>
          </div>

          <div className="admin-room-search-controls">
            <div className="admin-room-search-input-wrap">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search company or room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
            </div>
            <div className="admin-room-search-buttons">
              <button
                onClick={handleDownloadAllPlacardsPDF}
                disabled={exportingPdf || !summaryData?.allocated_companies_count}
                className="btn btn-outline btn-sm admin-room-download-btn"
                title="Download all allocated room QR placards as a single PDF document"
              >
                <FileDown size={14} /> Download All QRs (PDF)
              </button>
              <button
                onClick={loadSummary}
                className="btn btn-outline btn-sm admin-room-refresh-btn"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem',
            backgroundColor: '#f1f5f9',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            width: 'fit-content',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveViewMode('allocations')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeViewMode === 'allocations' ? '#ffffff' : 'transparent',
              color: activeViewMode === 'allocations' ? 'var(--color-primary-900)' : '#64748b',
              fontWeight: activeViewMode === 'allocations' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeViewMode === 'allocations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <DoorClosed size={16} /> All Room Allocations ({filteredAllocations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('live')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeViewMode === 'live' ? '#ffffff' : 'transparent',
              color: activeViewMode === 'live' ? '#0284c7' : '#64748b',
              fontWeight: activeViewMode === 'live' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeViewMode === 'live' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Users size={16} /> 📡 Live Room Check-ins Monitor
          </button>
        </div>

        {/* Allocations Table */}
        {activeViewMode === 'allocations' ? (
          loading ? (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span>Buffering room assignments and interview venue locations...</span>
              </div>
              <TableSkeleton rows={8} columns={6} />
            </div>
          ) : filteredAllocations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <DoorClosed size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-primary-900)' }}>
                No companies or matching allocations found.
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                Click "Upload Room Numbers Excel" above to automatically allocate rooms.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '4%' }}>#</th>
                    <th style={{ width: '25%' }}>Company Name</th>
                    <th style={{ width: '18%' }}>Position / Sector</th>
                    <th style={{ width: '14%' }}>Assigned Room</th>
                    <th style={{ width: '12%' }}>QR Status</th>
                    <th style={{ width: '14%' }}>Candidates</th>
                    <th style={{ width: '13%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllocations.map((item, index) => (
                    <tr key={item.company_id}>
                      <td style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {index + 1}
                      </td>
                      <td>
                        <Link
                          to={`/admin/companies/${item.company_id}`}
                          style={{
                            fontWeight: 700,
                            color: 'var(--color-brand-600)',
                            textDecoration: 'none',
                          }}
                        >
                          {item.company_name}
                        </Link>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {item.job_position || item.sector || '—'}
                      </td>
                      <td>
                        {item.room_id ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.65rem',
                              backgroundColor: '#ede9fe',
                              color: '#6d28d9',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              border: '1px solid #ddd6fe',
                            }}
                          >
                            <DoorClosed size={14} /> Room {item.room_number}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: '#dc2626',
                              backgroundColor: '#fef2f2',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 600,
                            }}
                          >
                            Unallocated
                          </span>
                        )}
                      </td>
                      <td>
                        {item.room_id ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 9999,
                              fontWeight: 700,
                              backgroundColor: item.qr_status === 'active' ? '#ecfdf5' : '#fef2f2',
                              color: item.qr_status === 'active' ? '#047857' : '#b91c1c',
                              border: `1px solid ${item.qr_status === 'active' ? '#a7f3d0' : '#fecaca'}`,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: item.qr_status === 'active' ? '#10b981' : '#ef4444',
                              }}
                            />
                            {item.qr_status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {item.room_id ? (
                          <button
                            type="button"
                            onClick={() => handleViewRoomStudents(item.room_id)}
                            className="btn btn-ghost btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: (item.checkins_count || 0) > 0 ? '#047857' : '#64748b',
                              backgroundColor: (item.checkins_count || 0) > 0 ? '#ecfdf5' : '#f1f5f9',
                              border: `1px solid ${(item.checkins_count || 0) > 0 ? '#a7f3d0' : '#e2e8f0'}`,
                              padding: '0.25rem 0.55rem',
                              borderRadius: '9999px',
                              cursor: 'pointer',
                            }}
                            title="Click to view all candidates in this room"
                          >
                            <Users size={13} />
                            <span>{item.checkins_count || 0} in Room</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.room_id ? (
                          <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              onClick={() => handleViewRoomStudents(item.room_id)}
                              className="btn btn-outline btn-sm"
                              style={{ gap: '0.3rem', fontSize: '0.76rem', padding: '0.25rem 0.5rem' }}
                              title="View Candidates Inside Room"
                            >
                              <Users size={13} /> Students
                            </button>
                            <button
                              onClick={() => handleViewQR(item.room_id)}
                              className="btn btn-outline btn-sm"
                              style={{ gap: '0.3rem', fontSize: '0.76rem', padding: '0.25rem 0.5rem' }}
                              title="View Room QR Placard"
                            >
                              <QrCode size={13} /> QR
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleOpenUploadModal}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                          >
                            Allocate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Live Room & Student Monitor View */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Showing <strong>{liveRoomsData.length}</strong> active interview rooms with live student check-ins.
              </div>
              <button
                type="button"
                onClick={loadLiveRooms}
                className="btn btn-outline btn-sm"
                style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                disabled={loadingLiveRooms}
              >
                <RefreshCw size={14} className={loadingLiveRooms ? 'spinner' : ''} />
                <span>Refresh Live Check-Ins</span>
              </button>
            </div>

            {loadingLiveRooms ? (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <span className="spinner" style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading live room check-ins...</p>
              </div>
            ) : liveRoomsData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <Users size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No rooms matching your search.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {liveRoomsData.map((rm) => (
                  <div
                    key={rm.room_id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      border: rm.checkins_count > 0 ? '1.5px solid #a7f3d0' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: rm.checkins_count > 0 ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    {/* Room & Company Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.65rem',
                            backgroundColor: '#1e3a8a',
                            color: '#ffffff',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                          }}
                        >
                          <DoorClosed size={14} /> ROOM {rm.room_number}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-900)', margin: '0.4rem 0 0.15rem' }}>
                          {rm.company?.name || 'Direct Interview Room'}
                        </h3>
                        {rm.company?.job_position && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            Role: <strong>{rm.company.job_position}</strong> {rm.company.salary_ctc ? `• ${rm.company.salary_ctc}` : ''}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 9999,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: rm.checkins_count > 0 ? '#10b981' : '#f1f5f9',
                            color: rm.checkins_count > 0 ? '#ffffff' : '#64748b',
                          }}
                        >
                          <Users size={12} /> {rm.checkins_count} Candidates
                        </span>
                      </div>
                    </div>

                    {/* Students list */}
                    {rm.students && rm.students.length > 0 ? (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                          Checked-In Students:
                        </div>
                        <div style={{ display: 'grid', gap: '0.4rem', maxHeight: 220, overflowY: 'auto' }}>
                          {rm.students.map((st, i) => (
                            <div
                              key={i}
                              style={{
                                padding: '0.45rem 0.65rem',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.78rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: 'var(--color-primary-900)' }}>{i + 1}. {st.full_name}</strong>
                                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>{st.checked_in_at.split(',')[0]}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                                {st.hall_ticket_number && <span>HT: {st.hall_ticket_number}</span>}
                                {st.mobile && <span>Ph: {st.mobile}</span>}
                                {st.qualification && <span>{st.qualification}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        No candidates have checked into this room yet.
                      </div>
                    )}

                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleViewQR(rm.room_id)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        <QrCode size={13} /> View QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPLOAD & ALLOCATION PREVIEW MODAL */}
      {isUploadModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseUploadModal}>
          <div
            className="modal-content"
            style={{ maxWidth: 740, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <DoorClosed size={22} color="var(--color-brand-600)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Automatic Room Allocation</h3>
              </div>
              <button
                onClick={handleCloseUploadModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.92rem', color: 'var(--color-primary-800)', marginBottom: '0.75rem', lineHeight: 1.5, fontWeight: 500 }}>
                Upload your Room Numbers Excel file. The system will automatically compare available rooms against all {summaryData?.total_companies ?? 0} participating companies and allocate them sequentially.
              </p>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#f5f3ff',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px solid #ddd6fe',
                  fontSize: '0.82rem',
                  color: '#5b21b6',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Sequential Rule:</strong> Companies are assigned 1-to-1 in order. Room QR codes remain permanently bound to rooms, even if companies change rooms in future allocations.
                </span>
              </div>

              {uploadError && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <Alert type="danger" message={uploadError} onClose={() => setUploadError('')} />
                </div>
              )}

              {allocationSuccess && (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-success-50)',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success-700)', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <CheckCircle2 size={18} /> Allocation Persisted Successfully!
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-primary-900)' }}>
                    {allocationSuccess}
                  </p>
                </div>
              )}

              {/* File Dropzone */}
              {!allocationSuccess && (
                <div
                  style={{
                    border: '2px dashed var(--color-brand-500)',
                    borderRadius: 'var(--radius-lg)',
                    padding: uploadFile ? '1.25rem' : '1.75rem',
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
                        Click to choose or drop Room Numbers Excel (.xlsx or .xls)
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                        Column header can be 'Room No', 'Room Number', or 'Room'
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Loading spinner */}
              {loadingPreview && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-brand-600)' }}>
                  <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Analyzing rooms &amp; checking availability...</div>
                </div>
              )}

              {/* ALLOCATION PREVIEW CARD */}
              {previewData && !loadingPreview && !allocationSuccess && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #c4b5fd',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 2px 8px rgba(109, 40, 217, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileSpreadsheet size={18} color="#6d28d9" />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#4c1d95' }}>
                        Allocation Preview
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: 9999 }}>
                      Ready to Allocate
                    </span>
                  </div>

                  {/* Summary Metric Chips */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                      gap: '0.6rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ padding: '0.6rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Companies</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>{previewData.total_companies}</div>
                    </div>

                    <div style={{ padding: '0.6rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Rooms in Excel</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6d28d9' }}>{previewData.available_rooms_count}</div>
                    </div>

                    <div style={{ padding: '0.6rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 700 }}>Rooms Required</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d4ed8' }}>{previewData.rooms_required}</div>
                    </div>

                    <div style={{ padding: '0.6rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#065f46', textTransform: 'uppercase', fontWeight: 700 }}>Rooms Used</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>{previewData.rooms_used}</div>
                    </div>

                    <div style={{ padding: '0.6rem', backgroundColor: '#faf5ff', borderRadius: 'var(--radius-md)', border: '1px solid #e9d5ff', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#6b21a8', textTransform: 'uppercase', fontWeight: 700 }}>Unused Rooms</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7e22ce' }}>{previewData.unused_rooms_count}</div>
                    </div>
                  </div>

                  {/* Duplicate warning */}
                  {previewData.duplicates_detected && previewData.duplicates_detected.length > 0 && (
                    <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#9a3412' }}>
                      <strong>Duplicate Rooms Unified:</strong> The Excel contains duplicate entries for room(s): <strong>{previewData.duplicates_detected.join(', ')}</strong>. Duplicates have been deduplicated to assign each company a unique room.
                    </div>
                  )}

                  {/* Preview Table */}
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-900)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Proposed Sequential Allocation (First 15 Pairs):
                  </div>
                  <div style={{ overflowX: 'auto', maxHeight: 220, border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', width: 40 }}>#</th>
                          <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Company Name</th>
                          <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Sector / Position</th>
                          <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Current Room</th>
                          <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0', width: 30 }}>→</th>
                          <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#6d28d9' }}>New Assigned Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.preview_pairs?.slice(0, 15).map((pair, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.4rem 0.6rem', color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                            <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700, color: 'var(--color-primary-900)' }}>{pair.company_name}</td>
                            <td style={{ padding: '0.4rem 0.6rem', color: 'var(--color-text-muted)' }}>{pair.job_position || pair.sector || '—'}</td>
                            <td style={{ padding: '0.4rem 0.6rem', color: 'var(--color-text-muted)' }}>{pair.current_room}</td>
                            <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', color: '#6d28d9' }}><ArrowRight size={14} /></td>
                            <td style={{ padding: '0.4rem 0.6rem', fontWeight: 800, color: '#6d28d9' }}>Room {pair.new_room}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {previewData.preview_pairs && previewData.preview_pairs.length > 15 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                      + {previewData.preview_pairs.length - 15} more companies will be sequentially allocated upon confirmation.
                    </div>
                  )}

                  {/* Unused rooms list */}
                  {previewData.unused_rooms && previewData.unused_rooms.length > 0 && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Unallocated Spare Rooms ({previewData.unused_rooms_count}):{' '}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#6b21a8', fontWeight: 600 }}>
                        {previewData.unused_rooms.join(', ')}{previewData.unused_rooms_count > 20 ? ' ...' : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCloseUploadModal}
                disabled={confirming}
              >
                {allocationSuccess ? 'Done' : 'Cancel'}
              </button>

              {!allocationSuccess && previewData && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmAllocation}
                  disabled={confirming || loadingPreview}
                  style={{ backgroundColor: '#6d28d9', borderColor: '#6d28d9' }}
                >
                  {confirming ? (
                    <>
                      <span className="spinner" style={{ width: 18, height: 18 }} /> Persisting Allocation...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Confirm Allocation
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROOM QR CODE PLACARD MODAL */}
      {selectedRoomQR && (
        <div className="modal-backdrop" onClick={() => setSelectedRoomQR(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={20} color="#6d28d9" />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Room QR Placard</h3>
              </div>
              <button
                onClick={() => setSelectedRoomQR(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
              {/* Placard Container designed for printable display */}
              <div
                id="printable-room-placard"
                style={{
                  border: '2px solid #1e3a8a',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                {/* Header branding */}
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TKR College of Engineering &amp; Technology
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.1rem' }}>
                  JOB MELA 2026 • 31 OCTOBER 2026
                </div>

                <div
                  style={{
                    margin: '1rem 0 0.5rem',
                    padding: '0.4rem 1rem',
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    display: 'inline-block',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                  }}
                >
                  ROOM {selectedRoomQR.room_number}
                </div>

                {selectedRoomQR.assigned_company ? (
                  <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Interview Venue For:
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedRoomQR.assigned_company.name}
                    </div>
                    {selectedRoomQR.assigned_company.job_position && (
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {selectedRoomQR.assigned_company.job_position}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ margin: '0.5rem 0 1rem', fontSize: '0.9rem', color: '#dc2626', fontWeight: 600 }}>
                    Unassigned Room
                  </div>
                )}

                {/* Vector QR Code */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '1rem auto',
                    maxWidth: 220,
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedRoomQR.qr_svg }}
                />

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', marginTop: '0.75rem' }}>
                  📱 Scan with smartphone camera to check in
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Direct Check-in URL: <code style={{ fontSize: '0.7rem' }}>{selectedRoomQR.checkin_url}</code>
                </div>
              </div>

              {/* Status control */}
              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>QR Check-in Status: </span>
                  <span style={{ fontWeight: 700, color: selectedRoomQR.qr_status === 'active' ? '#047857' : '#b91c1c' }}>
                    {selectedRoomQR.qr_status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleQRStatus(selectedRoomQR.id, selectedRoomQR.qr_status)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.76rem' }}
                >
                  {selectedRoomQR.qr_status === 'active' ? 'Disable QR' : 'Enable QR'}
                </button>
              </div>

              {/* Checked-in candidates summary in QR modal */}
              {selectedRoomQR.students && selectedRoomQR.students.length > 0 && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                      👥 Candidates in Room ({selectedRoomQR.students.length}):
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.35rem', maxHeight: 150, overflowY: 'auto' }}>
                    {selectedRoomQR.students.map((st, i) => (
                      <div key={i} style={{ padding: '0.4rem 0.65rem', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{i + 1}. {st.full_name}</strong> {st.hall_ticket_number ? `(${st.hall_ticket_number})` : ''}</span>
                        <span style={{ fontSize: '0.72rem', color: '#059669' }}>{st.checked_in_at.split(',')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedRoomQR(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDownloadSinglePlacardPDF}
                style={{ gap: '0.4rem', color: '#047857', borderColor: '#a7f3d0' }}
                title="Download this room's official QR placard as a PDF"
              >
                <FileDown size={16} /> Download PDF
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePrintPlacard}
                style={{ gap: '0.4rem' }}
              >
                <Printer size={16} /> Print Placard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Progress Modal */}
      {exportingPdf && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: 460, textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <FileDown size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: '#0f172a' }}>
              Generating All Room QR Placards PDF
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Creating high-resolution vector QR placards for every allocated interview room...
            </p>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: 10,
                backgroundColor: '#e2e8f0',
                borderRadius: 9999,
                overflow: 'hidden',
                marginBottom: '0.85rem',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#047857',
                  width: `${pdfProgress.total > 0 ? (pdfProgress.current / pdfProgress.total) * 100 : 0}%`,
                  transition: 'width 0.15s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
              <span>Placard {pdfProgress.current} of {pdfProgress.total}</span>
              <span>{pdfProgress.total > 0 ? Math.round((pdfProgress.current / pdfProgress.total) * 100) : 0}%</span>
            </div>

            <div
              style={{
                fontSize: '0.76rem',
                color: '#64748b',
                marginTop: '0.5rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pdfProgress.name}
            </div>
          </div>
        </div>
      )}

      {/* ROOM CANDIDATES MODAL */}
      {selectedRoomStudents && (
        <div className="modal-backdrop" onClick={() => setSelectedRoomStudents(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: 840, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span
                  style={{
                    padding: '0.35rem 0.85rem',
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  <DoorClosed size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  ROOM {selectedRoomStudents.room_number}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-900)' }}>
                    {selectedRoomStudents.assigned_company?.name || 'Direct Interview Room'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {selectedRoomStudents.assigned_company?.job_position && (
                      <span>Role: <strong>{selectedRoomStudents.assigned_company.job_position}</strong> • </span>
                    )}
                    <span>Total Check-ins: <strong>{selectedRoomStudents.students?.length || 0} Candidates</strong></span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedRoomStudents(null)}
                style={{ padding: '0.35rem', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
              {selectedRoomStudents.students && selectedRoomStudents.students.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '22%' }}>Candidate Name</th>
                        <th style={{ width: '18%' }}>Hall Ticket No</th>
                        <th style={{ width: '15%' }}>Mobile</th>
                        <th style={{ width: '22%' }}>Qualification / Branch</th>
                        <th style={{ width: '18%', textAlign: 'right' }}>Check-in Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRoomStudents.students.map((st, idx) => (
                        <tr key={st.id || idx}>
                          <td style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                          <td>
                            <strong style={{ color: 'var(--color-primary-900)' }}>{st.full_name}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{st.email}</div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0369a1' }}>
                            {st.hall_ticket_number || '—'}
                          </td>
                          <td>{st.mobile || '—'}</td>
                          <td>
                            <div>{st.qualification || '—'}</div>
                            {st.branch && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{st.branch}</div>}
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '0.76rem', color: '#047857', fontWeight: 600 }}>
                            {st.checked_in_at}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                  <Users size={38} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>
                    No candidates have checked into Room {selectedRoomStudents.room_number} yet.
                  </p>
                  <p style={{ fontSize: '0.8rem' }}>
                    When students scan the placard outside this room, their live check-in details will appear here immediately.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Rule: Students can attempt a maximum of <strong>3 companies</strong>.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleViewRoomStudents(selectedRoomStudents.id)}
                  style={{ gap: '0.35rem', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={14} className={loadingRoomStudents ? 'spinner' : ''} /> Refresh
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelectedRoomStudents(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomAllocationPage;
