import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  X,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Upload,
  DoorClosed,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import roomService from '../services/roomService';
import { companyService } from '../services/companyService';
import Alert from './Alert';

const StudentQRScannerModal = ({ isOpen, onClose, onCheckInSuccess }) => {
  const navigate = useNavigate();

  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'manual' | 'test'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedResult, setScannedResult] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Attempts stats
  const [attemptsData, setAttemptsData] = useState({
    attempts_count: 0,
    max_attempts: 3,
    remaining_attempts: 3,
    can_attempt_more: true,
    attempts: [],
  });
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Quick test rooms list for rapid desktop testing
  const [testRooms, setTestRooms] = useState([]);
  const [selectedTestRoom, setSelectedTestRoom] = useState('');

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'student-qr-reader-viewport';

  // Load candidate attempts and test rooms
  useEffect(() => {
    if (isOpen) {
      loadAttempts();
      loadTestRooms();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const loadAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const data = await roomService.getMyAttempts();
      setAttemptsData(data);
    } catch (err) {
      console.warn('Could not load attempts data:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const loadTestRooms = async () => {
    try {
      const data = await companyService.getCompanies({ page: 1, page_size: 20 });
      const rooms = (data.results || [])
        .filter((c) => c.room_no)
        .map((c) => ({
          room_no: c.room_no,
          company_name: c.name,
          job_position: c.job_position,
        }));
      setTestRooms(rooms);
      if (rooms.length > 0) {
        setSelectedTestRoom(rooms[0].room_no);
      }
    } catch (e) {
      console.warn('Could not fetch test rooms:', e);
    }
  };

  // Start Camera when scanMode is 'camera'
  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode]);

  const startCamera = async () => {
    setCameraError('');
    setCameraActive(false);

    try {
      // Ensure any existing instance is cleared
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (_) {}
        html5QrCodeRef.current = null;
      }

      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Frame parse error - ignore standard noise
        }
      );

      setCameraActive(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError('Camera access unavailable or permission denied. You can enter the room number manually or choose a test room.');
      setScanMode('manual');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (_) {}
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  const extractToken = (rawString) => {
    if (!rawString) return '';
    const trimmed = rawString.trim();
    // If it's a URL like .../checkin/<token>
    if (trimmed.includes('/checkin/')) {
      const parts = trimmed.split('/checkin/');
      const tokenPart = parts[1].split('/')[0].split('?')[0];
      return tokenPart;
    }
    return trimmed;
  };

  const handleScanSuccess = async (decodedText) => {
    const token = extractToken(decodedText);
    if (!token) return;

    await stopCamera();
    setScannedResult(token);
    proceedToCheckIn(token);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setProcessing(true);

    try {
      const qrScanner = new Html5Qrcode('qr-file-dummy');
      const decodedText = await qrScanner.scanFile(file, true);
      const token = extractToken(decodedText);
      if (token) {
        proceedToCheckIn(token);
      } else {
        setError('No valid Room QR detected in the uploaded image.');
      }
    } catch (err) {
      console.error('File scan error:', err);
      setError('Could not decode QR code from this image. Please try another image or use manual entry.');
    } finally {
      setProcessing(false);
    }
  };

  const proceedToCheckIn = (token) => {
    const clean = token.trim();
    if (!clean) {
      setError('Please enter a valid Room Token or Room Number.');
      return;
    }

    // Check if limit is reached
    if (attemptsData.attempts_count >= 3) {
      // Check if student already checked into this room
      const alreadyChecked = attemptsData.attempts.some(
        (a) => a.room_number.toLowerCase() === clean.toLowerCase() || a.unique_room_token === clean
      );
      if (!alreadyChecked) {
        setError(
          'Attempt limit reached! You have already checked in to 3 companies. Each candidate is permitted a maximum of 3 interview attempts.'
        );
        return;
      }
    }

    onClose();
    navigate(`/checkin/${clean}`);
  };

  if (!isOpen) return null;

  const isLimitReached = attemptsData.attempts_count >= 3;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-primary-900)' }}>
                Interview Room QR Scanner
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.1rem 0 0' }}>
                Scan the QR outside the interview room to check in
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3-Attempt Status Banner */}
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isLimitReached ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${isLimitReached ? '#fca5a5' : '#86efac'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {isLimitReached ? (
              <ShieldAlert size={20} color="#b91c1c" />
            ) : (
              <CheckCircle2 size={20} color="#15803d" />
            )}
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isLimitReached ? '#991b1b' : '#166534',
                }}
              >
                Interview Attempts: {attemptsData.attempts_count} of 3 Used
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: isLimitReached ? '#b91c1c' : '#15803d',
                  marginTop: '0.1rem',
                }}
              >
                {isLimitReached
                  ? '3/3 Maximum reached. You cannot attempt another company.'
                  : `${attemptsData.remaining_attempts} interview attempt(s) remaining`}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '4px',
            }}
          >
            {[1, 2, 3].map((slot) => {
              const filled = slot <= attemptsData.attempts_count;
              return (
                <div
                  key={slot}
                  style={{
                    width: 20,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: filled
                      ? isLimitReached
                        ? '#dc2626'
                        : '#16a34a'
                      : '#cbd5e1',
                  }}
                  title={`Slot ${slot} ${filled ? 'Used' : 'Available'}`}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <Alert type="danger" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Scan Mode Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.4rem',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setScanMode('camera')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: scanMode === 'camera' ? '#ffffff' : 'transparent',
              color: scanMode === 'camera' ? '#0284c7' : '#64748b',
              fontWeight: scanMode === 'camera' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: scanMode === 'camera' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Camera size={15} /> Live Camera
          </button>
          <button
            type="button"
            onClick={() => setScanMode('manual')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: scanMode === 'manual' ? '#ffffff' : 'transparent',
              color: scanMode === 'manual' ? '#0284c7' : '#64748b',
              fontWeight: scanMode === 'manual' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: scanMode === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <DoorClosed size={15} /> Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setScanMode('test')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: scanMode === 'test' ? '#ffffff' : 'transparent',
              color: scanMode === 'test' ? '#0284c7' : '#64748b',
              fontWeight: scanMode === 'test' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: scanMode === 'test' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Sparkles size={15} /> Quick Test
          </button>
        </div>

        {/* Tab 1: Live Camera Viewport */}
        {scanMode === 'camera' && (
          <div>
            {cameraError ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.88rem', color: '#991b1b', marginBottom: '1rem' }}>{cameraError}</p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setScanMode('manual')}
                >
                  Switch to Manual Entry →
                </button>
              </div>
            ) : (
              <div>
                <div
                  id={scannerContainerId}
                  style={{
                    width: '100%',
                    minHeight: 280,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#0f172a',
                    border: '2px solid #38bdf8',
                  }}
                />
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.75rem',
                  }}
                >
                  Point camera at the QR code placard posted outside the company's interview room.
                </p>

                {/* File scan alternative */}
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--color-border)',
                    textAlign: 'center',
                  }}
                >
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.82rem',
                      color: 'var(--color-brand-600)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <Upload size={15} />
                    <span>Or scan from photo / screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                      disabled={processing}
                    />
                  </label>
                  <div id="qr-file-dummy" style={{ display: 'none' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manual Room Token / Number */}
        {scanMode === 'manual' && (
          <div style={{ padding: '0.5rem 0' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                marginBottom: '0.4rem',
              }}
            >
              Room Number or Room Token:
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 101, CF-01, or RM_101_..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              style={{ padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: 600 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') proceedToCheckIn(manualToken);
              }}
            />
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
              Enter the room number displayed on the door placard to proceed with check-in.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
              onClick={() => proceedToCheckIn(manualToken)}
              disabled={!manualToken.trim()}
            >
              <span>Verify &amp; Check In</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* Tab 3: Quick Test Room (For easy local testing) */}
        {scanMode === 'test' && (
          <div style={{ padding: '0.5rem 0' }}>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                fontSize: '0.8rem',
                color: '#1e40af',
                marginBottom: '1rem',
              }}
            >
              ⚡ <strong>Instant Testing Mode:</strong> Select any company room below to test scanning without camera or physical placards.
            </div>

            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                marginBottom: '0.4rem',
              }}
            >
              Select Interview Room:
            </label>
            <select
              className="form-control"
              value={selectedTestRoom}
              onChange={(e) => setSelectedTestRoom(e.target.value)}
              style={{ padding: '0.65rem', fontSize: '0.9rem' }}
            >
              {testRooms.map((r, i) => (
                <option key={i} value={r.room_no}>
                  Room {r.room_no} — {r.company_name} ({r.job_position || 'Drive'})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
              onClick={() => proceedToCheckIn(selectedTestRoom)}
              disabled={!selectedTestRoom}
            >
              <span>Test Check-In to Room {selectedTestRoom}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* Attempts History Footer */}
        {attemptsData.attempts.length > 0 && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Your Checked-In Companies ({attemptsData.attempts.length}/3):
            </div>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              {attemptsData.attempts.map((att, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>
                    {idx + 1}. {att.company_name} (Room {att.room_number})
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {att.checked_in_at.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQRScannerModal;
