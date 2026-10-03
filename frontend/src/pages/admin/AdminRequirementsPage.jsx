import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Shirt,
  GraduationCap,
  Save,
  X,
} from 'lucide-react';
import requirementsService from '../../services/requirementsService';
import Alert from '../../components/Alert';
import ConfirmModal from '../../components/ConfirmModal';

const AdminRequirementsPage = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'documents',
    is_mandatory: true,
    order: 1,
  });
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const data = await requirementsService.getAdminRequirements();
      setRequirements(data.requirements || []);
    } catch (err) {
      console.error('Failed to fetch requirements:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to load requirements. Please refresh.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentId(null);
    setFormData({
      title: '',
      description: '',
      category: 'documents',
      is_mandatory: true,
      order: requirements.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setCurrentId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      is_mandatory: item.is_mandatory,
      order: item.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setAlert({ type: 'danger', message: 'Requirement title cannot be empty.' });
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'create') {
        await requirementsService.createRequirement(formData);
        setAlert({
          type: 'success',
          message: 'Requirement added successfully!',
        });
      } else {
        await requirementsService.updateRequirement(currentId, formData);
        setAlert({
          type: 'success',
          message: 'Requirement updated successfully!',
        });
      }
      setIsModalOpen(false);
      fetchRequirements();
    } catch (err) {
      console.error('Error saving requirement:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to save requirement. Please check the fields.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (item) => {
    setDeleteId(item.id);
    setDeleteTitle(item.title);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await requirementsService.deleteRequirement(deleteId);
      setAlert({
        type: 'success',
        message: `Requirement "${deleteTitle}" deleted.`,
      });
      setIsDeleteModalOpen(false);
      fetchRequirements();
    } catch (err) {
      console.error('Error deleting requirement:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to delete requirement.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryBadge = (category, categoryDisplay) => {
    switch (category) {
      case 'documents':
        return (
          <span className="badge badge-blue" style={{ gap: '0.3rem' }}>
            <FileText size={12} /> {categoryDisplay || 'Documents'}
          </span>
        );
      case 'instructions':
        return (
          <span className="badge badge-amber" style={{ gap: '0.3rem' }}>
            <Clock size={12} /> {categoryDisplay || 'Reporting'}
          </span>
        );
      case 'dress_code':
        return (
          <span
            className="badge"
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              gap: '0.3rem',
            }}
          >
            <Shirt size={12} /> {categoryDisplay || 'Dress Code'}
          </span>
        );
      case 'eligibility':
        return (
          <span className="badge badge-applied" style={{ gap: '0.3rem' }}>
            <GraduationCap size={12} /> {categoryDisplay || 'Eligibility'}
          </span>
        );
      default:
        return (
          <span className="badge badge-blue">
            {categoryDisplay || category}
          </span>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Alert banner */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>
            Job Mela Requirements &amp; Instructions Management
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Configure candidate guidelines, documents to carry, and instructions visible on the student portal.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          id="admin-add-requirement-btn"
        >
          <Plus size={16} /> Add Requirement
        </button>
      </div>

      {/* Summary Stat Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Guidelines
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-900)', marginTop: '0.2rem' }}>
            {requirements.length}
          </h3>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Mandatory Items
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>
            {requirements.filter((r) => r.is_mandatory).length}
          </h3>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Document Checklists
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-600)', marginTop: '0.2rem' }}>
            {requirements.filter((r) => r.category === 'documents').length}
          </h3>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Order</th>
                <th>Requirement Title &amp; Details</th>
                <th style={{ width: 160 }}>Category</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div className="spinner spinner-primary" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Loading requirements...</p>
                  </td>
                </tr>
              ) : requirements.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <ClipboardList size={40} color="var(--color-text-light)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontWeight: 600, color: 'var(--color-primary-800)' }}>No requirements configured yet.</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      Click "Add Requirement" to set up documents, dress code, and guidelines for students.
                    </p>
                  </td>
                </tr>
              ) : (
                requirements.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#f1f5f9',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--color-primary-800)',
                        }}
                      >
                        {item.order || index + 1}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.94rem', color: 'var(--color-primary-900)' }}>
                        {item.title}
                      </strong>
                      {item.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td>{getCategoryBadge(item.category, item.category_display)}</td>
                    <td>
                      {item.is_mandatory ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            textTransform: 'uppercase',
                          }}
                        >
                          Mandatory
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            textTransform: 'uppercase',
                          }}
                        >
                          Optional
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn btn-outline btn-sm"
                          title="Edit requirement"
                          style={{ padding: '0.3rem 0.6rem' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="btn btn-danger btn-sm"
                          title="Delete requirement"
                          style={{ padding: '0.3rem 0.6rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Requirement Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {modalMode === 'create' ? 'Add Candidate Requirement' : 'Edit Requirement'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Requirement Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Printed Copies of Updated Resume"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="documents">Required Documents</option>
                      <option value="instructions">Reporting &amp; Guidelines</option>
                      <option value="dress_code">Dress Code</option>
                      <option value="eligibility">Eligibility Criteria</option>
                      <option value="general">General Rules</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      className="form-control"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description / Instructions</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Explain clearly what students need to bring or follow..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="is_mandatory_check"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="is_mandatory_check" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                    Mark this item as Mandatory for campus entry &amp; interviews
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline btn-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? <div className="spinner" /> : <Save size={14} />}
                  {modalMode === 'create' ? 'Create Requirement' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Requirement"
        message={`Are you sure you want to remove the requirement "${deleteTitle}"? This will immediately remove it from the student guidelines.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AdminRequirementsPage;
