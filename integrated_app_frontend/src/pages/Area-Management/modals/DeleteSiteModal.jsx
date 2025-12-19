// src/pages/Area-Management/modals/DeleteSiteModal.jsx
import React from 'react';
import { apiService } from '../../../services/api';
import './Modal.css';

const DeleteSiteModal = ({ data, onClose, onSuccess }) => {
  const handleDelete = async () => {
    try {
      await apiService.delete(`site/${data.SiteId}`);
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content company-form-container" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Delete Site</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
          <div className="form-group">
            <label>Site Id</label>
            <input value={data.SiteId} disabled />
          </div>
          <div className="form-group">
            <label>Site Name</label>
            <input value={data.SiteName} disabled />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Delete
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

export default DeleteSiteModal;