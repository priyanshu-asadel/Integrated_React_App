import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { apiService } from '../../services/api';
import './CameraManagement.css';

Modal.setAppElement('#root');

export default function WorkStationTab() {
  const [workstations, setWorkstations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [filterCompany, setFilterCompany] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  const user = JSON.parse(localStorage.getItem('APP_USER') || '{}');

  const loadMaster = useCallback(() => {
    apiService.get('get-all-company').then(res => setCompanies(res.data));
  }, []);

  const loadWorkstations = useCallback(() => {
    const offset = (currentPage - 1) * pageSize;
    let url = `workstation/${offset}/${pageSize}`;
    if (filterCompany) url += `?companyId=${filterCompany}`;

    apiService.get(url).then(res => {
      setTotalPages(Math.ceil(res.data.total / pageSize));
      setWorkstations(res.data.rows);
    });
  }, [currentPage, filterCompany]);

  useEffect(() => {
    loadMaster();
    loadWorkstations();
  }, [loadMaster, loadWorkstations]);

  const openAdd = () => {
    setEditData(null);
    setAddModal(true);
  };
  const closeAdd = (refresh) => {
    setAddModal(false);
    if (refresh) loadWorkstations();
  };
  const openEdit = (item) => {
    setEditData(item);
    setAddModal(true);
  };
  const openDelete = (item) => setDeleteData(item);
  const closeDelete = (refresh) => {
    setDeleteData(null);
    if (refresh) loadWorkstations();
  };

  return (
    <div className="CamMan-tab-pane CamMan-active">
      <div className="CamMan-section-header">
        <h2>WorkStation Management</h2>
        <button className="CamMan-btn CamMan-btn-primary" onClick={openAdd}>
          Add WorkStation
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
          onClick={loadWorkstations}
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
              <th>Api</th>
              {user.Role === 'Super Admin' && <th>Company</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workstations.map(ws => (
              <tr key={ws.WorkStationId}>
                <td>{ws.WorkStationName}</td>
                <td>{ws.WorkStationDescription}</td>
                <td>{ws.Api}</td>
                {user.Role === 'Super Admin' && <td>{ws.Company?.CompanyName}</td>}
                <td>
                  <button
                    className="CamMan-action-btn CamMan-edit"
                    onClick={() => openEdit(ws)}
                  >
                    Edit
                  </button>
                  <button
                    className="CamMan-action-btn CamMan-delete"
                    onClick={() => openDelete(ws)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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
        style={{ content: { width: '500px', margin: 'auto' } }}
      >
        <WorkStationModal
          data={editData}
          onClose={closeAdd}
          companies={companies}
          user={user}
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
          <DeleteWorkStationModal data={deleteData} onClose={closeDelete} />
        )}
      </Modal>
    </div>
  );
}

/* ---------- Add / Edit Modal ---------- */
function WorkStationModal({ data, onClose, companies, user }) {
  const isEdit = !!data;
  const [form, setForm] = useState({
    name: (data && data.WorkStationName) || '',
    description: (data && data.WorkStationDescription) || '',
    api: (data && data.Api) || '',
    company: (data && data.CompanyId) || (user.CompanyId || '')
  });

  const submit = async e => {
    e.preventDefault();
    if (isEdit) {
      await apiService.put(`workstation/${data.WorkStationId}`, {
        WorkStationName: form.name,
        WorkStationDescription: form.description,
        Api: form.api
      });
    } else {
      await apiService.post('workstation', {
        WorkStationName: form.name,
        WorkStationDescription: form.description,
        Api: form.api,
        CompanyId: form.company
      });
    }
    onClose(true);
  };

  return (
    <div className="CamMan-modal-content">
      <div className="CamMan-dialog-header">
        <h2>{isEdit ? 'Edit' : 'Add'} WorkStation</h2>
        <button className="CamMan-close-button" onClick={() => onClose()}>
          X
        </button>
      </div>

      <form onSubmit={submit}>
        {!isEdit && user.Role === 'Super Admin' && (
          <div className="CamMan-form-group">
            <label>Company *</label>
            <select
              value={form.company}
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
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
        )}

        <div className="CamMan-form-group">
          <label>Name *</label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        <div className="CamMan-form-group">
          <label>Description *</label>
          <input
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            required
          />
        </div>

        <div className="CamMan-form-group">
          <label>Api *</label>
          <input
            value={form.api}
            onChange={e => setForm(p => ({ ...p, api: e.target.value }))}
            required
          />
        </div>

        <div className="CamMan-form-actions">
          <button type="submit" className="CamMan-btn CamMan-btn-primary">
            {isEdit ? 'Update' : 'Add'}
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

/* ---------- Delete Modal ---------- */
function DeleteWorkStationModal({ data, onClose }) {
  const del = async (e) => {
    e.preventDefault();
    await apiService.delete(`workstation/${data.WorkStationId}`);
    onClose(true);
  };

  return (
    <div className="CamMan-modal-content">
      <div className="CamMan-dialog-header">
        <h2>Delete WorkStation</h2>
        <button className="CamMan-close-button" onClick={() => onClose()}>
          X
        </button>
      </div>

      <form onSubmit={del}>
        <div className="CamMan-form-group">
          <label>WorkStation ID</label>
          <input value={data.WorkStationId} disabled />
        </div>

        <div className="CamMan-form-group">
          <label>WorkStation Name</label>
          <input value={data.WorkStationName} disabled />
        </div>

        <div className="CamMan-form-actions">
          <button type="submit" className="CamMan-btn CamMan-btn-primary">
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