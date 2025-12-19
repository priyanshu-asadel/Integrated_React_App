import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../services/auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import AddStatusAndRemark from './AddStatusAndRemark';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const [user, setUser] = useState(null);
  // Company ID is not used in the current scope, safe to leave null
  const [companyId, setCompanyId] = useState(null); 
  const [siteList, setSiteList] = useState([]);
  const [cameraList, setCameraList] = useState([]);
  const [cameraServerUrl] = useState('https://192.168.178.172:1339/video_feed?w');
  const [alertList, setAlertList] = useState([]);
  const [alertanalyticsList, setAlertanalyticsList] = useState([]);
  const [unseenAlertCount, setUnseenAlertCount] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const retryCounts = useRef({});
  const [loading, setLoading] = useState(true); // New loading state for initial fetch

  // *** UPDATED CHART OPTIONS (Unchanged, but good defaults) ***
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Alert Frequency by Alert Type',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grace: '10%',
        ticks: {
          stepSize: 1,
          precision: 0
        }
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Alert Frequency by Camera',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grace: '10%',
        ticks: {
          stepSize: 1,
          precision: 0
        }
      },
    },
  };

  // Chart data states (Unchanged)
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Total Count',
        data: [],
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        borderWidth: 1,
        maxBarThickness: 50, 
      },
    ],
  });

  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Total Count',
        data: [],
        fill: false,
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.2)',
        lineTension: 0.4,
      },
    ],
  });

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    
    // Use an async function to manage multiple data fetches and the final loading state
    const initializeDashboard = async () => {
        setLoading(true);
        await Promise.all([
            getAllCameras(),
            getAlerts(),
            getAllAlertAnalytics(),
            getUnseenAlertCount()
        ]);
        setLoading(false);
    };

    initializeDashboard();
  }, []);

  // Reset error states when camera list updates
  useEffect(() => {
    const newErrors = {};
    const newLoading = {};
    cameraList.forEach(cam => {
      newErrors[cam.CameraId] = false;
      newLoading[cam.CameraId] = true;
    });
    setImageErrors(newErrors);
    setImageLoading(newLoading);
  }, [cameraList]);

  // --- API FETCH FUNCTIONS WITH ERROR HANDLING ---

  const getAllCameras = async () => {
    try {
      const res = await apiService.get('all-cameras');
      const cameras = res.data || [];
      
      const statusRes = await apiService.get('camera-status');
      const cameraStatus = statusRes || [];

      const updatedCameras = cameras.map((meta) => {
        const matched = cameraStatus.find((c) => c.CameraId === meta.CameraId);
        return {
          ...meta,
          totalCount: matched ? matched.totalCount : 0,
        };
      });
      setCameraList(updatedCameras);
      loadLineChartData(updatedCameras);

    } catch (error) {
      console.error('ERROR GET all-cameras or camera-status failed:', error);
      // In case of error, ensure cameras and chart data are empty arrays
      setCameraList([]); 
      loadLineChartData([]);
    }
  };

  const loadLineChartData = (data) => {
    const labels = data.map(item => item.CameraName);
    const chartData = data.map(d => d.totalCount);

    setLineChartData(prevData => ({
      labels: labels,
      datasets: [
        {
          ...prevData.datasets[0],
          data: chartData,
        },
      ],
    }));
  };

  const getAlerts = async (offset = 0, limit = 5) => {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        const formatDate = (date) => date.toISOString().split('T')[0];

        // API Body often requires strict formatting, ensuring fields are present
        const body = {
            site: '',
            building: '',
            floor: '',
            status: 'all',
            cam: ['all'],
            alert: '',
            sdate: formatDate(sevenDaysAgo), // Send dates even if they aren't used for filtering
            edate: formatDate(today),
            offset,
            limit
        };

        const res = await apiService.post('alert', body);
        // Ensure res.data and res.data.rows exist before setting state
        setAlertList(res.data?.rows || []);

    } catch (error) {
        console.error('ERROR POST alert failed:', error.message || error);
        // Set alerts to an empty array on failure
        setAlertList([]);
    }
  };

  const getAllAlertAnalytics = async () => {
    try {
        const res = await apiService.get('get-all-alert-analytics');
        const analytics = res.data || [];

        const statusRes = await apiService.get('alert-analytic-status');
        const alertStatus = statusRes || [];
        
        const updatedAnalytics = analytics.map((meta) => {
            const matched = alertStatus.find((c) => c.Analytics === meta.AlertAnalyticsId);
            return {
                ...meta,
                totalCount: matched ? matched.totalCount : 0,
                unresolvedCount: matched ? matched.unresolvedCount : 0
            };
        });
        setAlertanalyticsList(updatedAnalytics);
        loadBarChartData(updatedAnalytics);
    } catch (error) {
        console.error('ERROR GET alert-analytics failed:', error.message || error);
        setAlertanalyticsList([]);
        loadBarChartData([]);
    }
  };

  const loadBarChartData = (data) => {
    const labels = data.map(item => item.AlertAnalyticsName);
    const chartData = data.map(item => item.totalCount);

    setBarChartData(prevData => ({
      labels: labels,
      datasets: [
        {
          ...prevData.datasets[0],
          data: chartData,
        },
      ],
    }));
  };

  const getUnseenAlertCount = async () => {
    try {
        const res = await apiService.get('unseen-alerts');
        setUnseenAlertCount(res.unseenCount || 0);
    } catch (error) {
        console.error('ERROR GET unseen-alerts failed:', error.message || error);
        setUnseenAlertCount(0);
    }
  };

  // --- MODAL AND REMARK HANDLING ---

  const addStatusAndRemark = (data) => {
    setSelectedAlert(data);
    setShowStatusModal(true);
  };

  const handleSaveStatusAndRemark = async (updatedData) => {
    try {
      await apiService.put(`alert/${updatedData.AlertId}`, {
        Status: updatedData.Status,
        Remark: updatedData.Remark
      });
      // Refresh alerts after successful update
      getAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
    } finally {
      setShowStatusModal(false);
      setSelectedAlert(null);
    }
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setSelectedAlert(null);
  };

  // --- IMAGE & RENDERING HELPERS ---

  const toggleMobileSidebar = () => {
    document.querySelector('.sidebar')?.classList.toggle('mobile-open');
  };

  const handleImageLoad = (cameraId) => {
    setImageLoading(prev => ({ ...prev, [cameraId]: false }));
    setImageErrors(prev => ({ ...prev, [cameraId]: false }));
  };

  const handleImageError = (cameraId) => {
    const currentRetryCount = retryCounts.current[cameraId] || 0;
    
    if (currentRetryCount < 3) {
      // Retry loading the image
      retryCounts.current[cameraId] = currentRetryCount + 1;
      setImageLoading(prev => ({ ...prev, [cameraId]: true }));
      
      // Delay the next attempt
      setTimeout(() => {
        setImageLoading(prev => ({ ...prev, [cameraId]: false }));
      }, 1000 * (currentRetryCount + 1)); // Backoff delay (1s, 2s, 3s)
    } else {
      // Max retries reached, show fallback
      setImageErrors(prev => ({ ...prev, [cameraId]: true }));
      setImageLoading(prev => ({ ...prev, [cameraId]: false }));
      retryCounts.current[cameraId] = 0; // Reset for future attempts
    }
  };

  const getImageSource = (cam) => {
    if (imageErrors[cam.CameraId]) {
      return '../../../../../assets/images/face.jpg'; // Fallback
    }
    // Note: cam.RTSPUrl likely needs to be encoded or handled specially by the backend feed server.
    // The current construction seems intentional, passing the RTSP URL as a query parameter.
    return cam ? `${cameraServerUrl}${cam.RTSPUrl}` : '../../../../../assets/images/face.jpg';
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="Dashboard-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Loading Dashboard...</h1>
        <i className="fas fa-spinner fa-spin fa-3x" style={{ color: '#42A5F5' }}></i>
      </div>
    );
  }

  // Once loading is false, if data lists are empty due to error or empty DB, 
  // the component will render with empty tables and charts (graceful empty page).
  
  return (
    <div className="Dashboard-container">
      {/* Main Content */}
      <div className="Dashboard-main-content">
        <div className="Dashboard-header">
          <div className="Dashboard-header-left">
            <button className="Dashboard-mobile-menu-toggle" onClick={toggleMobileSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>Dashboard</h1>
          </div>
          <div className="Dashboard-header-actions">
            <div className="Dashboard-refresh-btn">
              <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
            </div>
            <div className="Dashboard-notifications" onClick={() => navigate('/alert')}>
              <i className="fas fa-bell"></i>
              <span className="Dashboard-badge">{unseenAlertCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Alerts Section */}
        <div className="Dashboard-section Dashboard-recent-alerts">
          <div className="Dashboard-section-header">
            <h2>Alerts Analytics - Last 100 Days</h2>
            <a href="/analytics" className="Dashboard-view-all">
              View All <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <div className="Dashboard-alert-stats">
            <div className="Dashboard-stat-card">
              <h3>Alert Frequency by Alert Type</h3>
              <div className="Dashboard-chart-container">
                {barChartData.labels.length > 0 ? (
                    <Bar options={barChartOptions} data={barChartData} />
                ) : (
                    <div className="Dashboard-no-data">No Alert Type data available.</div>
                )}
              </div>
            </div>
            <div className="Dashboard-stat-card">
              <h3>Alert Frequency by Camera</h3>
              <div className="Dashboard-chart-container">
                {lineChartData.labels.length > 0 ? (
                    <Line options={lineChartOptions} data={lineChartData} />
                ) : (
                    <div className="Dashboard-no-data">No Camera Frequency data available.</div>
                )}
              </div>
            </div>
          </div>
          <div className="Dashboard-alert-table-container">
            <div className="Dashboard-section-header">
              <h2>Recent Alerts</h2>
              <a href="/alert" className="Dashboard-view-all">
                View All <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <table className="Dashboard-alert-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Alert</th>
                  <th>Camera</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="Dashboard-recentAlertsBody">
                {alertList.length > 0 ? (
                    alertList.map((alert, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: alert?.Seen?.toLowerCase() === 'yes' ? 'rgba(0, 128, 0, 0.1)' : ''
                        }}
                      >
                        <td>{new Date(alert.CreatedAt).toLocaleDateString()}</td>
                        <td>{new Date(alert.CreatedAt).toLocaleTimeString()}</td>
                        <td>{alert.AlertAnalytics?.AlertAnalyticsName}</td>
                        <td>{alert?.Camera?.CameraName}</td>
                        <td>{alert?.Camera?.Floor?.FloorName}</td>
                        <td>
                          <span className={`Dashboard-status-badge Dashboard-status-${alert.Status.toLowerCase()}`}>
                            {alert.Status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="Dashboard-action-btn Dashboard-update-status"
                            onClick={() => addStatusAndRemark(alert)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                            No recent alerts found.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total vs Unresolved Alerts */}
        <div className="Dashboard-section Dashboard-total-alerts">
          <div className="Dashboard-section-header">
            <h2>Total vs Unresolved Alerts - Last 100 Days</h2>
          </div>
          <div className="Dashboard-alert-cards">
            {alertanalyticsList.length > 0 ? (
                alertanalyticsList.map((alert, index) => (
                    <div className="Dashboard-alert-card" key={index}>
                        <h3>{alert.AlertAnalyticsName}</h3>
                        <div className="Dashboard-alert-count">
                            <span className="Dashboard-total">Total <strong>{alert.totalCount}</strong></span>
                            <span className="Dashboard-unresolved">Unresolved <strong>{alert.unresolvedCount}</strong></span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="Dashboard-no-data" style={{ width: '100%' }}>
                    No alert analytics data available.
                </div>
            )}
          </div>
        </div>

        {/* Camera Streams */}
        <div className="Dashboard-section Dashboard-camera-streams">
          <div className="Dashboard-section-header">
            <h2>Camera Streams</h2>
            <a href="/camera" className="Dashboard-view-all">
              View All <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <div className="Dashboard-camera-grid">
            {cameraList.length > 0 ? (
                cameraList.slice(0, 6).map((cam, index) => (
                    <div className="Dashboard-camera-card" key={index}>
                        <div className="Dashboard-camera-header">
                            <h3>{cam.CameraName}</h3>
                            <div className={`Dashboard-camera-status ${cam.Status === 'true' ? 'Dashboard-active' : 'Dashboard-inactive'}`}></div>
                        </div>
                        <div className="Dashboard-camera-feed">
                            {imageLoading[cam.CameraId] && !imageErrors[cam.CameraId] && (
                                <div className="Dashboard-image-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Loading...</span>
                                </div>
                            )}
                            <img
                                src={getImageSource(cam)}
                                alt="Camera Feed"
                                onLoad={() => handleImageLoad(cam.CameraId)}
                                onError={() => handleImageError(cam.CameraId)}
                                style={{ 
                                    display: imageLoading[cam.CameraId] && !imageErrors[cam.CameraId] ? 'none' : 'block'
                                }}
                            />
                            {imageErrors[cam.CameraId] && (
                                <div className="Dashboard-camera-offline">
                                    <i className="fas fa-video-slash"></i>
                                    <span>Camera Offline</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="Dashboard-no-data" style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
                    No cameras configured or available.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Status and Remark Modal */}
      {showStatusModal && selectedAlert && (
        <AddStatusAndRemark
          data={selectedAlert}
          onClose={handleCloseModal}
          onSave={handleSaveStatusAndRemark}
        />
      )}
    </div>
  );
};

export default Dashboard;