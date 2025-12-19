// src/pages/Area-Management/modals/AddEditBuildingModal.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './Modal.css';

const AddEditBuildingModal = ({ data, onClose, onSuccess }) => {
  const isEdit = !!data;
  const [form, setForm] = useState({
    name: data?.BuildingName || '',
    description: data?.BuildingDescription || '',
    site: data?.SiteId || ''
  });
  const [sites, setSites] = useState([]);

  useEffect(() => {
    apiService.get('get-all-site').then(res => setSites(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await apiService.put(`building/${data.BuildingId}`, {
          BuildingName: form.name,
          BuildingDescription: form.description
        });
      } else {
        await apiService.post('building', {
          BuildingName: form.name,
          BuildingDescription: form.description,
          SiteId: form.site
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
          <h2>{isEdit ? 'Edit Building' : 'Add Building'}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <div className="form-group">
              <label htmlFor="site">Site *</label>
              <select
                id="site"
                value={form.site}
                onChange={e => setForm({ ...form, site: e.target.value })}
                required
              >
                <option value="">Select Site</option>
                {sites.map(s => (
                  <option key={s.SiteId} value={s.SiteId}>{s.SiteName}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="name">Building Name *</label>
            <input
              id="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter Building Name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Building Description *</label>
            <input
              id="description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Enter Building description"
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

export default AddEditBuildingModal;