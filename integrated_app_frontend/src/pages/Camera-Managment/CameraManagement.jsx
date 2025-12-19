// src/pages/CameraManagement.jsx
import React, { useState, useEffect } from 'react';
import CameraManagementTab from './CameraManagementTab';
import CameraLogTab from './CameraLogTab';
import WorkStationTab from './WorkStationTab';
import AlertAnalyticsTab from './AlertAnalyticsTab';
import './CameraManagement.css';

export default function CameraManagement() {
  const [activeTab, setActiveTab] = useState('camera');
  const [modulesToAccess, setModulesToAccess] = useState([]);

  useEffect(() => {
    // Define all possible modules
    const allModules = ['camera', 'cameralog', 'workstation', 'alertanalytics'];

    const userData = JSON.parse(localStorage.getItem('APP_USER') || '{}');
    if (userData && userData.ComponentToAccess) {
      const userModules = userData.ComponentToAccess.split(',');
      
      if (userModules.length === 0 || (userModules.length === 1 && userModules[0] === '')) {
         // If ComponentToAccess is empty or missing, default to all modules
        setModulesToAccess(allModules);
      } else {
        // Otherwise, use the modules from user data
        setModulesToAccess(userModules);
      }
    } else {
      // Fallback for no user data
      setModulesToAccess(allModules);
    }
  }, []);


  useEffect(() => {
    // Filter the full list by the modules the user has access to
    const allowed = ['camera', 'cameralog', 'workstation', 'alertanalytics'].filter(t =>
      modulesToAccess.includes(t)
    );
    // Set the active tab to the first *allowed* tab
    if (allowed.length) {
        setActiveTab(allowed[0]);
    }
  }, [modulesToAccess]);

  return (
    <div className="CamMan-dashboard-container">
      <div className="CamMan-main-content">
        <div className="CamMan-header">
          <h1>Camera Management Settings</h1>
          <div className="CamMan-header-actions">
            <div className="CamMan-refresh-btn">
              <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
            </div>
          </div>
        </div>

        {/* Settings Tabs Navigation */}
        <div className="CamMan-settings-tabs">
          {modulesToAccess.includes('camera') && (
            <button
              className={`CamMan-tab-btn ${activeTab === 'camera' ? 'CamMan-active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              Camera Management
            </button>
          )}
          {modulesToAccess.includes('cameralog') && (
            <button
              className={`CamMan-tab-btn ${activeTab === 'cameralog' ? 'CamMan-active' : ''}`}
              onClick={() => setActiveTab('cameralog')}
            >
              Camera Log
            </button>
          )}
          {modulesToAccess.includes('workstation') && (
            <button
              className={`CamMan-tab-btn ${activeTab === 'workstation' ? 'CamMan-active' : ''}`}
              onClick={() => setActiveTab('workstation')}
            >
              WorkStation
            </button>
          )}
          {modulesToAccess.includes('alertanalytics') && (
            <button
              className={`CamMan-tab-btn ${activeTab === 'alertanalytics' ? 'CamMan-active' : ''}`}
              onClick={() => setActiveTab('alertanalytics')}
            >
              Alert Analytics
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="CamMan-tab-content">
          {activeTab === 'camera' && <CameraManagementTab />}
          {activeTab === 'cameralog' && <CameraLogTab />}
          {activeTab === 'workstation' && <WorkStationTab />}
          {activeTab === 'alertanalytics' && <AlertAnalyticsTab />}
        </div>
      </div>
    </div>
  );
}