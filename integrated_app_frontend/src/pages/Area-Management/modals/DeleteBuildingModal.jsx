// src/pages/Area-Management/modals/DeleteBuildingModal.jsx
import React from 'react';
import { apiService } from '../../../services/api';
import './Modal.css';

const DeleteBuildingModal = ({ data, onClose, onSuccess }) => {
  const handleDelete = async () => {
    try {
      await apiService.delete(`building/${data.BuildingId}`);
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content company-form-container" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Delete Building</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
          <div className="form-group">
            <label>Building Id</label>
            <input value={data.BuildingId} disabled />
          </div>
          <div className="form-group">
            <label>Building Name</label>
            <input value={data.BuildingName} disabled />
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

export default DeleteBuildingModal;