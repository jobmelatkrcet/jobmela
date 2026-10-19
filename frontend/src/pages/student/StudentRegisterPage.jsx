import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  UserCheck,
  Lock,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  User,
  ArrowRight,
  Camera,
  FileText,
  Upload,
  X,
  CheckCircle2,
  FileCheck,
  Megaphone,
  PenLine,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from '../../components/Alert';

export const MAX_PHOTO_BYTES = 200 * 1024; // 200 KB (204,800 bytes)
export const PHOTO_SIZE_ERROR_MESSAGE = 'Photo file size exceeds 200KB limit.';
export const VALID_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const validatePhotoFile = (file) => {
  if (!file) return null;
  if (!VALID_PHOTO_TYPES.includes(file.type)) {
    return 'Please upload a valid image file (JPG, PNG, or WebP).';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return PHOTO_SIZE_ERROR_MESSAGE;
  }
  return null;
};

/**
 * Automatically compresses candidate photograph client-side to ensure it is under targetBytes (200KB)
 * and resizes large dimensions down to maximum passport size (800x800).
 */
export const compressImageFile = (file, maxDimension = 800, targetBytes = 200 * 1024) => {
  return new Promise((resolve) => {
    // If not in a browser environment or not an image, resolve directly
    if (typeof window === 'undefined' || typeof document === 'undefined' || !file || !file.type?.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const tryQuality = (quality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= targetBytes || quality <= 0.5) {
                const newName = file.name.replace(/\.[^.]+$/, '.jpg');
                const compressedFile = new File([blob], newName, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                tryQuality(Math.max(0.5, quality - 0.15));
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryQuality(0.85);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const MAX_RESUME_BYTES = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)
export const RESUME_SIZE_ERROR_MESSAGE = 'Resume file size exceeds 1MB limit. Please upload a PDF or DOCX file under 1MB.';
export const VALID_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const VALID_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const validateResumeFile = (file) => {
  if (!file) return null;
  const fileNameLower = (file.name || '').toLowerCase();
  const hasValidExt = VALID_RESUME_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  if (!VALID_RESUME_TYPES.includes(file.type) && !hasValidExt) {
    return 'Please upload a PDF, DOC, or DOCX document.';
  }
  if (file.size > MAX_RESUME_BYTES) {
    return RESUME_SIZE_ERROR_MESSAGE;
  }
  return null;
};

export const MAX_COMBINED_BYTES = 1.2 * 1024 * 1024; // 1.2 MB combined ceiling (200KB photo + 1MB resume)
export const COMBINED_SIZE_ERROR_MESSAGE = 'The combined size of photo and resume exceeds 1.2MB. Please reduce attachment sizes.';

export const SUPPORT_PHONE = '8019792661';

export const sanitizeErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return '';
  const trimmed = msg.trim();

  // If HTML document or snippet was returned (e.g. Nginx / Vercel error page)
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return `The server returned an unexpected response. Please try again shortly or contact support at ${SUPPORT_PHONE}.`;
  }

  // Detect sensitive technical details, SQL errors, or stack traces
  const technicalSignatures = [
    /traceback/i,
    /operationalerror/i,
    /programmingerror/i,
    /integrityerror/i,
    /syntaxerror/i,
    /typeerror/i,
    /attributeerror/i,
    /django/i,
    /postgres/i,
    /psycopg/i,
    /supabase/i,
    /select\s+.+\s+from/i,
    /insert\s+into/i,
    /update\s+.+\s+set/i,
    /delete\s+from/i,
    /secret/i,
    /token\s+[a-f0-9]{20,}/i,
    /connection\s+refused/i,
  ];

  for (const sig of technicalSignatures) {
    if (sig.test(trimmed)) {
      return `A server error occurred. Please try again shortly or contact support at ${SUPPORT_PHONE}.`;
    }
  }

  return trimmed;
};

export const parseRegistrationError = (err) => {
  // 1. HTTP 413 Payload Too Large
  if (err?.response?.status === 413 || err?.message?.includes('413')) {
    return {
      fieldErrors: {},
      generalError: 'Uploaded files are too large. Please ensure photo is under 3 MB, resume is under 3.5 MB, and combined attachments do not exceed 4 MB.',
    };
  }

  // 2. Request Timeout
  if (
    err?.code === 'ECONNABORTED' ||
    err?.code === 'ETIMEDOUT' ||
    err?.message?.toLowerCase().includes('timeout')
  ) {
    return {
      fieldErrors: {},
      generalError: 'Registration request timed out. Please check your internet connection and try again.',
    };
  }

  // 3. Network Failure (no response received from server)
  if (
    (!err?.response && err?.request) ||
    err?.code === 'ERR_NETWORK' ||
    err?.message === 'Network Error' ||
    (err && !err.response && !err.status)
  ) {
    return {
      fieldErrors: {},
      generalError: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  const status = err?.response?.status;
  const data = err?.response?.data;

  // 4. HTTP 429 Too Many Requests (Rate limit)
  if (status === 429) {
    return {
      fieldErrors: {},
      generalError: 'Too many registration attempts. Please wait a moment and try again.',
    };
  }

  // 5. HTTP 500, 502, 503, 504 Server Errors or Gateway issues
  if (status >= 500 && status <= 504) {
    const msg =
      status === 500
        ? 'Our registration server encountered an unexpected error. Please try again shortly.'
        : 'The registration server is temporarily unavailable. Please try again in a few moments.';
    return {
      fieldErrors: {},
      generalError: `${msg} If the issue persists, contact support at ${SUPPORT_PHONE}.`,
    };
  }

  // 6. Structured Field Errors from Django / DRF (typically 400 Bad Request)
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const fieldErrors = {};
    let generalMsg = '';
    let hasDuplicateEmail = false;
    let hasDuplicateMobile = false;

    for (const key in data) {
      if (key === 'non_field_errors') {
        const raw = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key]);
        generalMsg = sanitizeErrorMessage(raw);
      } else if (key === 'detail') {
        const raw = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key]);
        generalMsg = sanitizeErrorMessage(raw);
      } else {
        const raw = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key]);
        const sanitized = sanitizeErrorMessage(raw);
        fieldErrors[key] = sanitized;

        const lower = raw.toLowerCase();
        if (key === 'email' && (lower.includes('already exists') || lower.includes('already registered'))) {
          hasDuplicateEmail = true;
        }
        if (key === 'mobile' && (lower.includes('already exists') || lower.includes('already registered') || lower.includes('in use'))) {
          hasDuplicateMobile = true;
        }
      }
    }

    if (hasDuplicateEmail) {
      generalMsg = 'An account with this email address already exists. Please log in to your account.';
    } else if (hasDuplicateMobile) {
      generalMsg = 'This mobile number is already registered. Please check your number or log in.';
    } else if (!generalMsg && Object.keys(fieldErrors).length > 0) {
      generalMsg = 'Please correct the errors highlighted below and try again.';
    }

    return { fieldErrors, generalError: generalMsg };
  }

  // 7. Plain text / String error
  if (typeof data === 'string' && data.trim()) {
    return {
      fieldErrors: {},
      generalError: sanitizeErrorMessage(data),
    };
  }

  // 8. Fallback for unexpected failures
  return {
    fieldErrors: {},
    generalError: `Registration could not be completed. Please try again or contact support at ${SUPPORT_PHONE}.`,
  };
};

const StudentRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    qualification: '',
    college: '',
    heard_about: '',
    other_heard_about: '',
    password: '',
    confirm_password: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');

  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'heard_about' && value !== 'Others') {
      setFormData((prev) => ({ ...prev, heard_about: value, other_heard_about: '' }));
      if (errors.other_heard_about) {
        setErrors((prev) => ({ ...prev, other_heard_about: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    if (errors.photo) {
      setErrors((prev) => ({ ...prev, photo: null }));
    }

    if (!VALID_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Please upload a valid image file (JPG, PNG, or WebP).');
      setPhotoFile(null);
      setPhotoPreview(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }

    try {
      // Automatically compress smartphone / high-res photographs down to < 200 KB
      const processedFile = await compressImageFile(file, 800, MAX_PHOTO_BYTES);

      const validationError = validatePhotoFile(processedFile);
      if (validationError) {
        setPhotoError(validationError);
        setPhotoFile(null);
        setPhotoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
        return;
      }

      if (resumeFile && processedFile.size + resumeFile.size > MAX_COMBINED_BYTES) {
        setPhotoError(COMBINED_SIZE_ERROR_MESSAGE);
        setPhotoFile(null);
        setPhotoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
        return;
      }

      setPhotoFile(processedFile);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotoPreview(uploadEvent.target.result);
      };
      reader.readAsDataURL(processedFile);
    } catch {
      setPhotoError('Failed to process image. Please choose another photograph.');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError('');
    if (errors.photo) {
      setErrors((prev) => ({ ...prev, photo: null }));
    }
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeError('');
    if (errors.resume) {
      setErrors((prev) => ({ ...prev, resume: null }));
    }

    const validationError = validateResumeFile(file);
    if (validationError) {
      setResumeError(validationError);
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }

    if (photoFile && file.size + photoFile.size > MAX_COMBINED_BYTES) {
      setResumeError(COMBINED_SIZE_ERROR_MESSAGE);
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }

    setResumeFile(file);
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeError('');
    if (errors.resume) {
      setErrors((prev) => ({ ...prev, resume: null }));
    }
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      errs.mobile = 'Please enter a valid 10-digit mobile number.';
    }
    if (!formData.qualification.trim()) errs.qualification = 'Please select or enter your qualification.';
    if (!formData.college.trim()) errs.college = 'College or institution name is required.';
    if (!formData.heard_about.trim()) {
      errs.heard_about = 'Please select where you heard about Job Mela.';
    } else if (formData.heard_about === 'Others' && !formData.other_heard_about.trim()) {
      errs.other_heard_about = 'Please specify where you heard about Job Mela.';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }
    if (photoFile) {
      const photoValidationError = validatePhotoFile(photoFile);
      if (photoValidationError) {
        errs.photo = photoValidationError;
      }
    }
    if (resumeFile) {
      const resumeValidationError = validateResumeFile(resumeFile);
      if (resumeValidationError) {
        errs.resume = resumeValidationError;
      }
    }
    if (photoFile && resumeFile && photoFile.size + resumeFile.size > MAX_COMBINED_BYTES) {
      errs.photo = COMBINED_SIZE_ERROR_MESSAGE;
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setGeneralError('');

    if (photoError || resumeError) {
      return;
    }

    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Additional safeguard before submission
    if (photoFile && photoFile.size > MAX_PHOTO_BYTES) {
      setPhotoError(PHOTO_SIZE_ERROR_MESSAGE);
      return;
    }
    if (resumeFile && resumeFile.size > MAX_RESUME_BYTES) {
      setResumeError(RESUME_SIZE_ERROR_MESSAGE);
      return;
    }

    // Prevent exceeding Vercel 4.5MB payload limit
    const totalAttachmentBytes = (photoFile?.size || 0) + (resumeFile?.size || 0);
    if (totalAttachmentBytes > MAX_COMBINED_BYTES) {
      setGeneralError(COMBINED_SIZE_ERROR_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const resolvedHeardAbout =
        formData.heard_about === 'Others'
          ? (formData.other_heard_about.trim() ? `Other: ${formData.other_heard_about.trim()}` : 'Others')
          : formData.heard_about.trim();

      let payload;
      if (!photoFile && !resumeFile) {
        payload = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.trim(),
          qualification: formData.qualification.trim(),
          college: formData.college.trim(),
          heard_about: resolvedHeardAbout,
          password: formData.password,
          confirm_password: formData.confirm_password,
        };
      } else {
        payload = new FormData();
        payload.append('full_name', formData.full_name.trim());
        payload.append('email', formData.email.trim().toLowerCase());
        payload.append('mobile', formData.mobile.trim());
        payload.append('qualification', formData.qualification.trim());
        payload.append('college', formData.college.trim());
        payload.append('heard_about', resolvedHeardAbout);
        payload.append('password', formData.password);
        payload.append('confirm_password', formData.confirm_password);

        if (photoFile) {
          payload.append('photo', photoFile);
        }
        if (resumeFile) {
          payload.append('resume', resumeFile);
        }
      }

      const response = await authService.register(payload);
      // Auto-login upon successful registration
      login(response.token, response.user);
      navigate('/dashboard', {
        state: { message: 'Registration successful! Welcome to TKRCET Job Mela 2026.' },
      });
    } catch (err) {
      console.error('Registration error:', err);
      const { fieldErrors, generalError: parsedGeneralError } = parseRegistrationError(err);
      setErrors(fieldErrors);
      setGeneralError(parsedGeneralError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4.5rem', backgroundColor: '#f8fafc' }}>
      <div className="app-container" style={{ maxWidth: 680 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="badge badge-blue"
            style={{ marginBottom: '0.75rem', padding: '0.35rem 0.85rem' }}
          >
            Candidate Portal
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)', marginBottom: '0.5rem' }}>
            Student Registration
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Register to participate and apply for 150+ participating companies at TKRCET Job Mela 2026.
          </p>
        </div>

        {generalError && (
          <Alert type="danger" message={generalError} onClose={() => setGeneralError('')} />
        )}

        <div className="card">
          {/* Registration Helpline Support Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '0.85rem 1.15rem',
              marginBottom: '1.75rem',
              fontSize: '0.92rem',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--color-brand-600)',
              }}
            >
              <Phone size={18} />
            </div>
            <div style={{ color: '#1e293b' }}>
              <span>If any issue regarding registration, please contact </span>
              <a
                href="tel:8019792661"
                style={{
                  fontWeight: 700,
                  color: 'var(--color-brand-600)',
                  textDecoration: 'underline',
                  letterSpacing: '0.02em',
                }}
              >
                8019792661
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              * Required fields
            </p>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rushi Badavath"
                  value={formData.full_name}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User
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
              {errors.full_name && <span className="form-error">{errors.full_name}</span>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address * (Must be unique)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="rushi@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail
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
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="mobile">
                Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  maxLength={10}
                  className="form-control"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Phone
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
              {errors.mobile && <span className="form-error">{errors.mobile}</span>}
            </div>

            {/* Qualification */}
            <div className="form-group">
              <label className="form-label" htmlFor="qualification">
                Educational Qualification *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="qualification"
                  name="qualification"
                  className="form-control"
                  value={formData.qualification}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="">-- Select Highest Qualification --</option>
                  <option value="B.Tech (CSE / IT / Allied)">B.Tech (CSE / IT / Allied)</option>
                  <option value="B.Tech (ECE / EEE / Core)">B.Tech (ECE / EEE / Core)</option>
                  <option value="B.Tech (Mechanical / Civil)">B.Tech (Mechanical / Civil)</option>
                  <option value="B.Sc / BCA">B.Sc / BCA</option>
                  <option value="B.Com / BBA">B.Com / BBA</option>
                  <option value="BA / Other Degree">BA / Other Degree</option>
                  <option value="Polytechnic Diploma">Polytechnic Diploma</option>
                  <option value="ITI (All Trades / Vocation)">ITI (All Trades / Vocation)</option>
                  <option value="Intermediate / 12th">Intermediate / 12th</option>
                  <option value="10th Class (SSC)">10th Class (SSC)</option>
                  <option value="Post Graduate (MCA / MBA / M.Tech)">Post Graduate (MCA / MBA / M.Tech)</option>
                  <option value="Other Eligible Qualification">Other Eligible Qualification</option>
                </select>
                <GraduationCap
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
              {errors.qualification && <span className="form-error">{errors.qualification}</span>}
            </div>

            {/* College / Institution */}
            <div className="form-group">
              <label className="form-label" htmlFor="college">
                College / Institution Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="college"
                  name="college"
                  type="text"
                  className="form-control"
                  placeholder="e.g. TKR College of Engineering & Technology"
                  value={formData.college}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Building2
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
              {errors.college && <span className="form-error">{errors.college}</span>}
            </div>

            {/* Where did you hear about Job Mela */}
            <div className="form-group">
              <label className="form-label" htmlFor="heard_about">
                Where did you hear about Job Mela? *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="heard_about"
                  name="heard_about"
                  className="form-control"
                  value={formData.heard_about}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="">-- Select where you heard about Job Mela --</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="WhatsApp Ads">WhatsApp Ads</option>
                  <option value="Others">Others</option>
                </select>
                <Megaphone
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
              {errors.heard_about && <span className="form-error">{errors.heard_about}</span>}
            </div>

            {/* Manual input when "Others" is selected */}
            <AnimatePresence>
              {formData.heard_about === 'Others' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '-0.25rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="form-group"
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      backgroundColor: 'rgba(238, 242, 255, 0.75)',
                      border: '1px solid rgba(199, 210, 254, 0.95)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.15rem',
                      boxShadow: '0 2px 6px -1px rgba(79, 70, 229, 0.08)',
                    }}
                  >
                    <label
                      className="form-label"
                      htmlFor="other_heard_about"
                      style={{
                        marginBottom: '0.45rem',
                        color: 'var(--color-brand-800, #3730a3)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                      }}
                    >
                      <PenLine size={15} color="var(--color-brand-600, #4f46e5)" />
                      Please specify where you heard about Job Mela *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="other_heard_about"
                        name="other_heard_about"
                        type="text"
                        className="form-control"
                        placeholder="e.g. College circular, Friend, Telegram group, Newspaper..."
                        value={formData.other_heard_about}
                        onChange={handleChange}
                        autoFocus
                        style={{
                          backgroundColor: '#ffffff',
                          borderColor: errors.other_heard_about ? 'var(--color-danger, #ef4444)' : 'var(--color-brand-300, #a5b4fc)',
                        }}
                      />
                    </div>
                    {errors.other_heard_about && (
                      <span className="form-error" style={{ display: 'block', marginTop: '0.35rem' }}>
                        {errors.other_heard_about}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CANDIDATE PHOTOGRAPH UPLOAD */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Candidate Photograph *
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>JPG, PNG or WebP &lt; 200KB</span>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
                id="candidate-photo-input"
              />

              {photoPreview ? (
                <div className="photo-preview-container">
                  <img src={photoPreview} alt="Candidate Preview" className="photo-preview-img" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                      {photoFile?.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {formatFileSize(photoFile?.size)} • Ready for upload (Optimized)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn-remove-file"
                    title="Remove selected photograph"
                  >
                    <X size={16} /> Remove
                  </button>
                </div>
              ) : (
                <div
                  className="upload-dropzone"
                  onClick={() => photoInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      photoInputRef.current?.click();
                    }
                  }}
                >
                  <div className="upload-dropzone-icon">
                    <Camera size={22} />
                  </div>
                  <div className="upload-dropzone-title">Upload Passport Size Photograph</div>
                  <div className="upload-dropzone-hint">
                    Click to browse photograph from device (auto-compressed to &lt; 200KB)
                  </div>
                </div>
              )}
              {photoError && <span className="form-error" style={{ marginTop: '0.35rem' }}>{photoError}</span>}
              {errors.photo && errors.photo !== photoError && (
                <span className="form-error" style={{ marginTop: '0.35rem' }}>{errors.photo}</span>
              )}
            </div>

            {/* CANDIDATE RESUME / CV UPLOAD */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Resume / Curriculum Vitae *
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PDF, DOC or DOCX &lt; 1MB</span>
              </div>

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleResumeChange}
                style={{ display: 'none' }}
                id="candidate-resume-input"
              />

              {resumeFile ? (
                <div className="resume-preview-container">
                  <div className="resume-preview-info">
                    <div className="resume-preview-icon">
                      <FileCheck size={22} />
                    </div>
                    <div className="resume-preview-text">
                      <div className="resume-preview-filename">{resumeFile.name}</div>
                      <div className="resume-preview-filesize">
                        {formatFileSize(resumeFile.size)} • Document attached
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="btn-remove-file"
                    title="Remove selected resume"
                  >
                    <X size={16} /> Remove
                  </button>
                </div>
              ) : (
                <div
                  className="upload-dropzone"
                  onClick={() => resumeInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      resumeInputRef.current?.click();
                    }
                  }}
                >
                  <div className="upload-dropzone-icon" style={{ color: '#059669' }}>
                    <FileText size={22} />
                  </div>
                  <div className="upload-dropzone-title">Upload Resume / Curriculum Vitae</div>
                  <div className="upload-dropzone-hint">
                    Click to browse your latest resume (PDF or DOCX format)
                  </div>
                </div>
              )}
              {resumeError && <span className="form-error" style={{ marginTop: '0.35rem' }}>{resumeError}</span>}
              {errors.resume && <span className="form-error" style={{ marginTop: '0.35rem' }}>{errors.resume}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password * (minimum 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
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
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  className="form-control"
                  placeholder="Re-enter your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
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
              {errors.confirm_password && (
                <span className="form-error">{errors.confirm_password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '1.25rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
              }}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} />{' '}
                  {photoFile || resumeFile
                    ? 'Uploading Files & Registering...'
                    : 'Registering Candidate...'}
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem',
              fontSize: '0.92rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <div>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--color-brand-600)', fontWeight: 700 }}>
                Login to Student Portal
              </Link>
            </div>
            <div
              style={{
                fontSize: '0.86rem',
                color: 'var(--color-text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Phone size={14} style={{ color: 'var(--color-brand-600)' }} />
              <span>
                If any issue regarding registration, please contact{' '}
                <a
                  href="tel:8019792661"
                  style={{
                    color: 'var(--color-brand-600)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  8019792661
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
