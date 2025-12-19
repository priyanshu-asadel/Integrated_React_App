import React, { useState, useEffect } from 'react';
import './AddStatusAndRemark.css';

const AddStatusAndRemark = ({ data, onClose, onSave }) => {
  const [status, setStatus] = useState(data?.Status || '');
  const [remark, setRemark] = useState(data?.Remark || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...data,
      Status: status,
      Remark: remark
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Update Status and Remark</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Select Status</option>
              <option value="Resolved">Resolved</option>
              <option value="Pending">Pending</option>
              <option value="Unresolved">Unresolved</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="remark">Remark</label>
            <textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows="4"
              placeholder="Enter remarks..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStatusAndRemark;