// src/pages/CameraLogTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import './CameraManagement.css';

export default function CameraLogTab() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = useCallback(() => {
    const offset = (currentPage - 1) * pageSize;
    apiService.get(`camera-log/${offset}/${pageSize}`).then(res => {
      setTotalPages(Math.ceil(res.data.total / pageSize));
      setLogs(res.data.rows);
    });
  }, [currentPage]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(c => c + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(c => c - 1);
  };

  return (
    <div className="CamMan-tab-pane CamMan-active">
      <div className="CamMan-section-header">
        <h2>Camera Log Management</h2>
      </div>

      <div className="CamMan-table-container">
        <table className="CamMan-settings-table">
          <thead>
            <tr>
              <th>Log Name</th>
              <th>Camera Name</th>
              <th>Description</th>
              <th>RTSP Url</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.CameraLogId}>
                <td>{log?.CameraLogName}</td>
                <td>{log?.CameraName}</td>
                <td>{log.CameraDescription}</td>
                <td>{log.RTSPUrl}</td>
                <td>
                  <span
                    className={`CamMan-status-indicator CamMan-status-${
                      log.Status === 'true' ? 'active' : 'inactive'
                    }`}
                  ></span>
                  {log.Status === 'true' ? 'Active' : 'Inactive'}
                </td>
                <td>{new Date(log.CreatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="CamMan-pagination">
        <button
          className="CamMan-btn CamMan-btn-secondary CamMan-prev-page"
          disabled={currentPage === 1}
          onClick={prevPage}
        >
          Previous
        </button>
        <span className="CamMan-page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="CamMan-btn CamMan-btn-secondary CamMan-next-page"
          disabled={currentPage === totalPages}
          onClick={nextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}