// src/pages/Area-Management/modals/AddEditSiteModal.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../services/auth';
import './Modal.css';

const AddEditSiteModal = ({ data, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isEdit = !!data;
  const [form, setForm] = useState({
    name: data?.SiteName || '',
    description: data?.SiteDescription || '',
    company: data?.CompanyId || (user.Role !== 'Super Admin' ? user.CompanyId : '')
  });
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    if (user.Role === 'Super Admin' && !isEdit) {
      apiService.get('get-all-company').then(res => setCompanies(res.data));
    }
  }, [user.Role, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await apiService.put(`site/${data.SiteId}`, {
          SiteName: form.name,
          SiteDescription: form.description
        });
      } else {
        await apiService.post('site', {
          SiteName: form.name,
          SiteDescription: form.description,
          CompanyId: form.company
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content company-form-container" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{isEdit ? 'Edit Site' : 'Add Site'}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {user.Role === 'Super Admin' && !isEdit && (
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <select
                id="company"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                required
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.CompanyId} value={c.CompanyId}>{c.CompanyName}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="name">Site Name *</label>
            <input
              id="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter Site Name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Site Description *</label>
            <input
              id="description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Enter Site description"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditSiteModal;