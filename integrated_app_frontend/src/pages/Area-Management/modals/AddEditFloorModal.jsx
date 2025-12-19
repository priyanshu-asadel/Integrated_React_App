// src/pages/Area-Management/modals/AddEditFloorModal.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './Modal.css';

const AddEditFloorModal = ({ data, onClose, onSuccess }) => {
  const isEdit = !!data;
  const [form, setForm] = useState({
    name: data?.FloorName || '',
    description: data?.FloorDescription || '',
    site: data?.Building?.SiteId || '',
    building: data?.BuildingId || ''
  });
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);

  useEffect(() => {
    apiService.get('get-all-site').then(res => setSites(res.data));
    apiService.get('get-all-building').then(res => {
      setBuildings(res.data);
      setFilteredBuildings(res.data);
    });
  }, []);

  useEffect(() => {
    if (form.site) {
      const filtered = buildings.filter(b => b.SiteId === form.site);
      setFilteredBuildings(filtered);
      if (!isEdit) setForm(prev => ({ ...prev, building: '' }));
    } else {
      setFilteredBuildings(buildings);
    }
  }, [form.site, buildings, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await apiService.put(`floor/${data.FloorId}`, {
          FloorName: form.name,
          FloorDescription: form.description
        });
      } else {
        await apiService.post('floor', {
          FloorName: form.name,
          FloorDescription: form.description,
          BuildingId: form.building
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
          <h2>{isEdit ? 'Edit Floor' : 'Add Floor'}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <>
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
              <div className="form-group">
                <label htmlFor="building">Building *</label>
                <select
                  id="building"
                  value={form.building}
                  onChange={e => setForm({ ...form, building: e.target.value })}
                  required
                >
                  <option value="">Select Building</option>
                  {filteredBuildings.map(b => (
                    <option key={b.BuildingId} value={b.BuildingId}>{b.BuildingName}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="name">Floor Name *</label>
            <input
              id="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter Floor Name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Floor Description *</label>
            <input
              id="description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Enter Floor description"
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

export default AddEditFloorModal;