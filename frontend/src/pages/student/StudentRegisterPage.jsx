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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    if (errors.photo) {
      setErrors((prev) => ({ ...prev, photo: null }));
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError('Photo file size exceeds 3MB limit.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoPreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
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

    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!isValid) {
      setResumeError('Please upload a PDF, DOC, or DOCX document.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('Resume file size exceeds 5MB limit.');
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
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setGeneralError('');

    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Prevent exceeding Vercel 4.5MB payload limit
    const totalAttachmentBytes = (photoFile?.size || 0) + (resumeFile?.size || 0);
    if (totalAttachmentBytes > 4 * 1024 * 1024) {
      setGeneralError('Combined size of photograph and resume exceeds 4MB. Please upload smaller files.');
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
      if (err.response?.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object') {
          const formattedErrors = {};
          for (const key in backendErrors) {
            if (Array.isArray(backendErrors[key])) {
              formattedErrors[key] = backendErrors[key].join(' ');
            } else if (typeof backendErrors[key] === 'string') {
              formattedErrors[key] = backendErrors[key];
            }
          }
          setErrors(formattedErrors);
          if (backendErrors.non_field_errors) {
            setGeneralError(`${backendErrors.non_field_errors.join(' ')} (If any issue persists, please contact 8019792661)`);
          } else if (backendErrors.detail) {
            setGeneralError(`${backendErrors.detail} (If any issue persists, please contact 8019792661)`);
          }
        } else {
          setGeneralError('Registration failed. Please check your information and try again. If any issue regarding registration, please contact 8019792661.');
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        setGeneralError('Registration request timed out. Please check your internet connection or contact 8019792661 for assistance.');
      } else if (err.message?.includes('413') || err.response?.status === 413) {
        setGeneralError('Uploaded files are too large. Please upload smaller attachments (under 2MB) or contact 8019792661.');
      } else {
        setGeneralError('Unable to connect to the registration server. If any issue regarding registration, please contact 8019792661.');
      }
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
                  Candidate Photograph <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional, recommended)</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>JPG, PNG or WebP &lt; 3MB</span>
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
                      {formatFileSize(photoFile?.size)} • Ready for upload
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
                    Click to browse photograph from device
                  </div>
                </div>
              )}
              {photoError && <span className="form-error" style={{ marginTop: '0.35rem' }}>{photoError}</span>}
              {errors.photo && <span className="form-error" style={{ marginTop: '0.35rem' }}>{errors.photo}</span>}
            </div>

            {/* CANDIDATE RESUME / CV UPLOAD */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Resume / Curriculum Vitae (CV) <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional, recommended)</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PDF or DOCX &lt; 5MB</span>
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
              style={{ width: '100%', marginTop: '1.25rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} /> Registering Candidate...
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
