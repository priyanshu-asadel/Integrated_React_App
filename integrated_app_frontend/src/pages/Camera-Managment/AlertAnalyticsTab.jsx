import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { apiService } from '../../services/api';
import './CameraManagement.css'; 
// NOTE: Assuming your custom CSS is correctly loaded via this path.

Modal.setAppElement('#root');

export default function AlertAnalyticsTab() {
  const [analytics, setAnalytics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [filterCompany, setFilterCompany] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  const loadMaster = useCallback(() => {
    // FIX: Add error handling to prevent crash if company list fails
    apiService.get('get-all-company')
      .then(res => setCompanies(res.data || []))
      .catch(err => {
        console.error("Failed to load companies for filter:", err);
        setCompanies([]);
        // Alert the user about the failure
        alert("Warning: Failed to load company list. Filters may not work.");
      });
  }, []);

  const loadAnalytics = useCallback(() => {
    const offset = (currentPage - 1) * pageSize;
    let url = `alert-analytics/${offset}/${pageSize}`;
    if (filterCompany) url += `?companyId=${filterCompany}`;

    // FIX: Add error handling and safely extract data
    apiService.get(url).then(res => {
      const total = res.data?.total || 0;
      const rows = res.data?.rows || [];
      setTotalPages(Math.ceil(total / pageSize) || 1);
      setAnalytics(rows);
    }).catch(err => {
      console.error("Failed to load alert analytics data:", err);
      setAnalytics([]);
      setTotalPages(1);
    });
  }, [currentPage, filterCompany]);

  useEffect(() => {
    loadMaster();
    loadAnalytics();
  }, [loadMaster, loadAnalytics]);

  const openAdd = () => {
    setEditData(null);
    setAddModal(true);
  };
  const closeAdd = (refresh) => {
    setAddModal(false);
    if (refresh) loadAnalytics();
  };
  const openEdit = (item) => {
    setEditData(item);
    setAddModal(true);
  };
  const openDelete = (item) => setDeleteData(item);
  const closeDelete = (refresh) => {
    setDeleteData(null);
    if (refresh) loadAnalytics();
  };

  return (
    <div className="CamMan-tab-pane CamMan-active">
      <div className="CamMan-section-header">
        <h2>Alert Analytics Management</h2>
        <button className="CamMan-btn CamMan-btn-primary" onClick={openAdd}>
          Add Analytics
        </button>
      </div>

      <div className="CamMan-filters-section">
        <div className="CamMan-filter-group">
          <label>Company</label>
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
            <option value="">All Companies</option>
            {companies.map(c => (
              <option key={c.CompanyId} value={c.CompanyId}>
                {c.CompanyName}
              </option>
            ))}
          </select>
        </div>
        <button
          className="CamMan-btn CamMan-btn-primary CamMan-apply-filters"
          onClick={loadAnalytics}
        >
          Filter
        </button>
      </div>

      <div className="CamMan-table-container">
        <table className="CamMan-settings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {analytics.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No alert analytics found.</td>
              </tr>
            ) : (
              analytics.map(a => (
                <tr key={a.AlertAnalyticsId}>
                  <td>{a.AlertAnalyticsName}</td>
                  <td>{a.AlertAnalyticsDescription}</td>
                  <td>{a.Company && a.Company.CompanyName}</td>
                  <td>
                    <span
                      className={`CamMan-status-indicator CamMan-status-${
                        a.Status === 'true' ? 'active' : 'inactive'
                      }`}
                    ></span>
                    {a.Status === 'true' ? 'Active' : 'Inactive'}
                  </td>
                  <td>
                    <button
                      className="CamMan-action-btn CamMan-edit"
                      onClick={() => openEdit(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="CamMan-action-btn CamMan-delete"
                      onClick={() => openDelete(a)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="CamMan-pagination">
        <button
          className="CamMan-btn CamMan-btn-secondary CamMan-prev-page"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(c => c - 1)}
        >
          Previous
        </button>
        <span className="CamMan-page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="CamMan-btn CamMan-btn-secondary CamMan-next-page"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(c => c + 1)}
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={addModal}
        onRequestClose={() => closeAdd()}
        className="CamMan-modal-content"
        overlayClassName="CamMan-modal-overlay"
        style={{ content: { maxWidth: '900px', margin: 'auto' } }} 
      >
        <AlertAnalyticsModal
          data={editData}
          onClose={closeAdd}
          companies={companies}
        />
      </Modal>

      <Modal
        isOpen={!!deleteData}
        onRequestClose={() => closeDelete()}
        className="CamMan-modal-content"
        overlayClassName="CamMan-modal-overlay"
        style={{ content: { width: '500px', margin: 'auto' } }}
      >
        {deleteData && (
          <DeleteAnalyticsModal data={deleteData} onClose={closeDelete} />
        )}
      </Modal>
    </div>
  );
}

// --- AlertAnalyticsModal Component ---
// This is used for adding/editing analytics and config details.
function AlertAnalyticsModal({ data, onClose, companies }) {
  const isEdit = !!data;
  
  const DEFAULT_CONFIG = {
    GpuId: 0,
    BatchSize: 1,
    NetworkMode: 2,
    NetworkType: 0,
    ProcessMode: 1,
    Interval: 0,
    OnnxFile: '',
    ModelEngineFile: '',
    LabelFilePath: '',
    CustomLibPath: 'nvdsinfer_custom_impl_Yolo/libnvdsinfer_custom_impl_Yolo.so',
    ParseBboxFuncName: 'NvDsInferParseYolo',
    EngineCreateFuncName: 'NvDsInferYoloCudaEngineGet',
    PreClusterThreshold: 0.5,
    NmsIouThreshold: 0.3,
    TopK: 300,
  };
  
  // Helper to safely reverse-engineer labels from DB JSON strings on edit
  const getLabelsFromData = (data) => {
    if (!data) return [];
    try {
        // Attempt to parse string JSON fields if necessary (as seen in previous context)
        const classes = (typeof data.Classes === 'string' ? JSON.parse(data.Classes) : data.Classes) || [];
        const alertThresh = (typeof data.AlertThresholds === 'string' ? JSON.parse(data.AlertThresholds) : data.AlertThresholds) || {};
        const confThresh = (typeof data.ConfidenceThresholds === 'string' ? JSON.parse(data.ConfidenceThresholds) : data.ConfidenceThresholds) || {};
        
        return classes.map(name => ({
            name: name,
            alertThresh: alertThresh[name] || 1,
            confThresh: confThresh[name] || 0.5
        }));
    } catch (e) {
        console.error("Error parsing label data:", e);
        return [];
    }
  };
  
  // Form state for Analytics
  const [form, setForm] = useState({
    CompanyId: (data && data.CompanyId) || '',
    AlertAnalyticsName: (data && data.AlertAnalyticsName) || '',
    AlertAnalyticsDescription: (data && data.AlertAnalyticsDescription) || '',
    Status: (data && data.Status) || 'true',
  });
  
  // Form state for DeepStream Config
  const [configForm, setConfigForm] = useState(
    (data && data.DeepStreamModelConfig) 
    ? data.DeepStreamModelConfig 
    : DEFAULT_CONFIG
  );
  
  // State for dynamic labels table
  const [labels, setLabels] = useState(getLabelsFromData(data));
  const [newLabelName, setNewLabelName] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleConfigFormChange = (e) => {
    const { name, value, type } = e.target;
    setConfigForm(p => ({ 
        ...p, 
        // Ensure numbers are stored as numbers or 0 if empty/invalid
        [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value 
    }));
  };

  const addLabel = () => {
    if (newLabelName && !labels.find(l => l.name === newLabelName)) {
      setLabels(p => [...p, { name: newLabelName, alertThresh: 1, confThresh: 0.5 }]);
      setNewLabelName('');
    }
  };

  const updateLabel = (index, field, value) => {
    setLabels(p => p.map((label, i) => 
        i === index ? { ...label, [field]: value } : label
    ));
  };
  
  const removeLabel = (index) => {
    setLabels(p => p.filter((_, i) => i !== index));
  };

  const submit = async e => {
    e.preventDefault();
    
    // Simple validation
    if (!form.CompanyId || !form.AlertAnalyticsName) {
        alert("Please fill in Company and Analytics Name.");
        return;
    }
    
    // 1. Transform labels state into JSON objects
    const classesList = labels.map(l => l.name);
    const alertThresholds = {};
    const confidenceThresholds = {};
    labels.forEach(l => {
        // Ensure values are numbers for API payload
        alertThresholds[l.name] = parseInt(l.alertThresh, 10) || 1;
        confidenceThresholds[l.name] = parseFloat(l.confThresh) || 0.5;
    });
    
    // 2. Prepare the payload
    const analyticsData = {
        ...form,
        Classes: classesList,
        AlertThresholds: alertThresholds,
        ConfidenceThresholds: confidenceThresholds,
    };
    
    // Set NumDetectedClasses based on labels count
    const configData = {
        ...configForm,
        NumDetectedClasses: classesList.length || 1
    };
    
    const payload = { analyticsData, configData };

    try {
      if (isEdit) {
        await apiService.put(`alert-analytics/${data.AlertAnalyticsId}`, payload);
      } else {
        await apiService.post('alert-analytics', payload);
      }
      onClose(true); // Close modal and refresh list
    } catch (err) {
        console.error("Failed to save analytics:", err);
        alert("Error saving analytics. Check console for details and ensure model paths are correct.");
    }
  };

  return (
    <div className="CamMan-modal-content">
      <div className="CamMan-dialog-header">
        <h2>{isEdit ? 'Edit' : 'Add'} Alert Analytics</h2>
        <button className="CamMan-close-button" onClick={() => onClose()}>X</button>
      </div>

      <form onSubmit={submit}>
        
        {/* Section 1: Analytics Details */}
        <fieldset className="CamMan-form-fieldset">
          <legend>Analytics Details</legend>
          <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-half-width">
              <label>Analytics Name *</label>
              <input
                name="AlertAnalyticsName"
                value={form.AlertAnalyticsName}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="CamMan-form-group CamMan-half-width">
              <label>Company *</label>
              <select
                name="CompanyId"
                value={form.CompanyId}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.CompanyId} value={c.CompanyId}>
                    {c.CompanyName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="CamMan-form-group">
            <label>Description *</label>
            <input
              name="AlertAnalyticsDescription"
              value={form.AlertAnalyticsDescription}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="CamMan-form-group CamMan-half-width">
              <label>Status</label>
              <select name="Status" value={form.Status} onChange={handleFormChange}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
              </select>
          </div>
        </fieldset>

        {/* Section 2: Class Labels & Thresholds */}
        <fieldset className="CamMan-form-fieldset">
          <legend>Class Labels & Thresholds</legend>
          <div className="CamMan-form-group">
            <label>Add New Class Label</label>
            <div className="CamMan-input-group">
              <input
                value={newLabelName}
                onChange={e => setNewLabelName(e.target.value)}
                placeholder="e.g., person"
              />
              <button type="button" className="CamMan-btn CamMan-btn-secondary" onClick={addLabel}>Add</button>
            </div>
          </div>
          <table className="CamMan-label-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Alert Count Threshold</th>
                <th>Confidence Threshold (0.0-1.0)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, index) => (
                <tr key={index}>
                  <td>{label.name}</td>
                  <td>
                    <input 
                      type="number" 
                      value={label.alertThresh}
                      onChange={e => updateLabel(index, 'alertThresh', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      step="0.05"
                      min="0.0"
                      max="1.0"
                      value={label.confThresh}
                      onChange={e => updateLabel(index, 'confThresh', e.target.value)}
                    />
                  </td>
                  <td>
                    <button type="button" className="CamMan-btn-icon-delete" onClick={() => removeLabel(index)}>
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>

        {/* Section 3: DeepStream Config */}
        <fieldset className="CamMan-form-fieldset">
          <legend>DeepStream nvinfer Config</legend>
          <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-half-width">
              <label>Model Engine File Path</label>
              <input
                name="ModelEngineFile"
                value={configForm.ModelEngineFile}
                onChange={handleConfigFormChange}
                placeholder="/home/user/models/model.engine"
              />
              <small className="CamMan-help-text">Must be the full, absolute path on the server.</small>
            </div>
            <div className="CamMan-form-group CamMan-half-width">
              <label>ONNX File Path (for engine creation)</label>
              <input
                name="OnnxFile"
                value={configForm.OnnxFile}
                onChange={handleConfigFormChange}
                placeholder="/home/user/models/model.onnx"
              />
              <small className="CamMan-help-text">Must be the full, absolute path on the server.</small>
            </div>
          </div>
          <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-half-width">
              <label>Label File Path</label>
              <input
                name="LabelFilePath"
                value={configForm.LabelFilePath}
                onChange={handleConfigFormChange}
                placeholder="/home/user/models/labels.txt"
              />
              <small className="CamMan-help-text">Must be the full, absolute path on the server.</small>
            </div>
             <div className="CamMan-form-group CamMan-half-width">
              <label>Custom Library Path</label>
              <input
                name="CustomLibPath"
                value={configForm.CustomLibPath}
                onChange={handleConfigFormChange}
                placeholder="nvdsinfer_custom_impl_Yolo/..."
              />
            </div>
          </div>
          <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-third-width">
                <label>GPU ID</label>
                <input name="GpuId" type="number" value={configForm.GpuId} onChange={handleConfigFormChange} />
            </div>
            <div className="CamMan-form-group CamMan-third-width">
                <label>Batch Size</label>
                <input name="BatchSize" type="number" value={configForm.BatchSize} onChange={handleConfigFormChange} />
            </div>
            <div className="CamMan-form-group CamMan-third-width">
                <label>Interval</label>
                <input name="Interval" type="number" value={configForm.Interval} onChange={handleConfigFormChange} />
            </div>
          </div>
          <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-third-width">
                <label>Network Mode</label>
                <input name="NetworkMode" type="number" value={configForm.NetworkMode} onChange={handleConfigFormChange} />
                <small className="CamMan-help-text">0=FP32, 1=INT8, 2=FP16</small>
            </div>
            <div className="CamMan-form-group CamMan-third-width">
                <label>Network Type</label>
                <input name="NetworkType" type="number" value={configForm.NetworkType} onChange={handleConfigFormChange} />
                <small className="CamMan-help-text">0=YOLO, 1=Detector, etc.</small>
            </div>
            <div className="CamMan-form-group CamMan-third-width">
                <label>Process Mode</label>
                <input name="ProcessMode" type="number" value={configForm.ProcessMode} onChange={handleConfigFormChange} />
                <small className="CamMan-help-text">1=Primary, 2=Secondary</small>
            </div>
          </div>
           <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-third-width">
              <label>Pre-Cluster Threshold</label>
              <input name="PreClusterThreshold" type="number" step="0.05" value={configForm.PreClusterThreshold} onChange={handleConfigFormChange} />
            </div>
            <div className="CamMan-form-group CamMan-third-width">
              <label>NMS IOU Threshold</label>
              <input name="NmsIouThreshold" type="number" step="0.05" value={configForm.NmsIouThreshold} onChange={handleConfigFormChange} />
            </div>
             <div className="CamMan-form-group CamMan-third-width">
                <label>TopK</label>
                <input name="TopK" type="number" value={configForm.TopK} onChange={handleConfigFormChange} />
            </div>
          </div>
          <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-half-width">
              <label>Parse BBox Func Name</label>
              <input name="ParseBboxFuncName" value={configForm.ParseBboxFuncName} onChange={handleConfigFormChange} />
            </div>
            <div className="CamMan-form-group CamMan-half-width">
              <label>Engine Create Func Name</label>
              <input name="EngineCreateFuncName" value={configForm.EngineCreateFuncName} onChange={handleConfigFormChange} />
            </div>
          </div>
        </fieldset>
        
        <div className="CamMan-form-actions">
          <button type="submit" className="CamMan-btn CamMan-btn-primary">
            {isEdit ? 'Update Analytics' : 'Add Analytics'}
          </button>
          <button
            type="button"
            className="CamMan-btn CamMan-btn-secondary"
            onClick={() => onClose()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// --- DeleteAnalyticsModal Component ---
// This is required for the main component to function.
function DeleteAnalyticsModal({ data, onClose }) {
  const del = async (e) => {
    e.preventDefault();
    try {
      await apiService.delete(`alert-analytics/${data.AlertAnalyticsId}`);
      onClose(true); // Close and refresh
    } catch (err) {
      console.error("Failed to delete analytics:", err);
      alert("Error deleting analytics. Check console for details.");
      onClose(false); // Close but do not refresh
    }
  };

  return (
    <div className="CamMan-modal-content">
      <div className="CamMan-dialog-header">
        <h2>Delete Analytics</h2>
        <button className="CamMan-close-button" onClick={() => onClose()}>
          X
        </button>
      </div>

      <form onSubmit={del}>
        <div className="CamMan-form-group">
          <label>Are you sure you want to delete this analytic and its configuration?</label>
          <input value={data.AlertAnalyticsName} disabled />
        </div>

        <div className="CamMan-form-actions">
          <button type="submit" className="CamMan-btn CamMan-btn-primary" style={{ background: '#ff6b6b' }}>
            Delete
          </button>
          <button
            type="button"
            className="CamMan-btn CamMan-btn-secondary"
            onClick={() => onClose()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}