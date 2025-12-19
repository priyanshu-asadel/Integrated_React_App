import React from 'react';
import { useForm } from 'react-hook-form';
import './AddStatusAndRemark.css';
import { apiService } from '../../services/api'; // Assuming ApiService is available

const AddStatusAndRemark = ({ alert, onClose }) => {
  const { register, handleSubmit, formState: { errors, isTouched } } = useForm({
    defaultValues: {
      remarks: alert?.Remarks || 'NA',
      status: alert?.Status.toLowerCase() || '',
      seen: alert?.Seen.toLowerCase() || 'no',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    const body = {
      Remarks: data.remarks,
      Status: data.status,
      Seen: data.seen,
    };
    try {
      await apiService.put(`alert/${alert.AlertId}`, body);
      onClose(true);
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  return (
    <div className="company-form-container">
      <div className="dialog-header">
        <h2>Update Alert Status</h2>
        <button className="close-button" onClick={() => onClose(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select id="status" {...register('status', { required: true })}>
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="unresolved">Unresolved</option>
            </select>
            {errors.status && isTouched && <div className="error">Status is required.</div>}
          </div>
          <div className="form-group">
            <label htmlFor="seen">Seen *</label>
            <select id="seen" {...register('seen', { required: true })}>
              <option value="">Select Seen</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.seen && isTouched && <div className="error">Seen is required.</div>}
          </div>
          <div className="form-group">
            <label htmlFor="remarks">Remarks *</label>
            <input
              id="remarks"
              type="text"
              placeholder="Enter Remark"
              {...register('remarks', { required: true })}
            />
            {errors.remarks && isTouched && <div className="error">Remark is required.</div>}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={Object.keys(errors).length > 0}>
            Save
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => onClose(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStatusAndRemark;