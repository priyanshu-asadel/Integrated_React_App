import React, { useState, useEffect, useMemo,useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { apiService } from '../../services/api';
import './Analytics.css';

ChartJS.register(...registerables);

const Analytics = () => {
  const [cameraList, setCameraList] = useState([]);
  const [alertList, setAlertList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false); // Flag for successful initial load
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false); // Retained but not used in logic below
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, touchedFields },
  } = useForm({
    defaultValues: {
      status: 'all',
      cam: ['all'],
      alert: '',
      sdate: '',
      edate: '',
    },
    mode: 'onTouched',
  });

  // Chart States
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
  const [barChartDataForCamera, setBarChartDataForCamera] = useState({ labels: [], datasets: [] });
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 } // Ensure integer ticks
      }
    }
  };

  // === FETCH CAMERAS & ALERTS FOR DROPDOWNS ===
  useEffect(() => {
    const fetchDropdownData = async () => {
      let success = false;
      try {
        setIsLoading(true);
        // Using Promise.allSettled to ensure all promises finish, regardless of individual failure
        const [camRes, alertRes] = await Promise.allSettled([
          apiService.get('all-cameras'),
          apiService.get('get-all-alert-analytics'),
        ]);

        // Process Camera Data
        if (camRes.status === 'fulfilled') {
          setCameraList(camRes.value.data || []);
        } else {
          console.error('Failed to load cameras:', camRes.reason);
          alert('Error: Could not load cameras for filters.');
        }

        // Process Alert Analytics Data
        if (alertRes.status === 'fulfilled') {
          setAlertList(alertRes.value.data || []);
          success = true; // Mark as successful if at least one critical list loaded
        } else {
          console.error('Failed to load alert types:', alertRes.reason);
          alert('Error: Could not load alert types for filters. Check backend status.');
        }
        
        // Use a critical check: if either camera or alert list failed due to 400 error, halt.
        if (camRes.status === 'rejected' || alertRes.status === 'rejected') {
            setHasInitialData(false);
        } else {
            setHasInitialData(true);
        }

      } catch (error) {
        console.error('Initial dropdown load failed:', error);
        alert('A critical error occurred during initialization. Please check the network connection.');
        setHasInitialData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  // === PREPARE FORM DATA FOR API ===
  const prepareFormData = useCallback(() => {
    const values = watch();
    const data = {};

    // Remove 'all' options or empty strings before sending to API
    if (values.status && values.status !== 'all') data.status = values.status;

    const cams = values.cam || [];
    if (cams.length > 0 && !cams.includes('all')) data.cam = cams;
    // If 'all' is the only selection, the backend should typically handle it by omitting the filter
    else if (cams.includes('all')) data.cam = ['all'];

    if (values.alert) data.alert = values.alert;
    if (values.sdate) data.sdate = values.sdate;
    if (values.edate) data.edate = values.edate;

    return data;
  }, [watch]);

  // === VALIDATE DATE RANGE ===
  const validateDateRange = (data) => {
    if (data.sdate && data.edate && new Date(data.sdate) > new Date(data.edate)) {
      return 'Start date must be before end date.';
    }
    return null;
  };

  // === API CALLS with specific error handling ===
  const fetchAlertTypeStatus = async (formData) => {
    try {
        const res = await apiService.post('analytics/alert-status', formData);
        const data = res.data || [];

        setBarChartData({
          labels: data.map((d) => d.AlertAnalyticsName || 'Unknown'),
          datasets: [
            {
              label: 'Total Count',
              data: data.map((d) => d.count || 0),
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              borderWidth: 1,
            },
          ],
        });
    } catch (error) {
        console.error('Analytics/alert-status fetch failed:', error);
        // Throw or alert if this critical chart fails
        alert('Error fetching Alert Type Status data.');
        setBarChartData({ labels: [], datasets: [] });
    }
  };

  const fetchCameraStatus = async (formData) => {
    try {
        const res = await apiService.post('analytics/camera-status', formData);
        const data = res.data || [];

        const labels = data.map((d) => d.CameraName || 'Unknown');
        const counts = data.map((d) => d.count || 0);

        setLineChartData({
          labels,
          datasets: [
            {
              label: 'Total Count',
              data: counts,
              fill: false,
              borderColor: '#ff6384',
              backgroundColor: 'rgba(255,99,132,0.2)',
              tension: 0.4,
            },
          ],
        });

        setBarChartDataForCamera({
          labels,
          datasets: [
            {
              label: 'Total Count',
              data: counts,
              backgroundColor: '#9c27b0',
              borderColor: '#7b1fa2',
              borderWidth: 1,
            },
          ],
        });
    } catch (error) {
        console.error('Analytics/camera-status fetch failed:', error);
        alert('Error fetching Camera Status data.');
        setLineChartData({ labels: [], datasets: [] });
        setBarChartDataForCamera({ labels: [], datasets: [] });
    }
  };

  const fetchStatusDistribution = async (formData) => {
    try {
        const res = await apiService.post('analytics/status', formData);
        const data = res.data || [];

        setPieChartData({
          labels: data.map((d) => d.Status || 'Unknown'),
          datasets: [
            {
              data: data.map((d) => d.count || 0),
              backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
            },
          ],
        });
    } catch (error) {
        console.error('Analytics/status fetch failed:', error);
        alert('Error fetching Alert Status Distribution data.');
        setPieChartData({ labels: [], datasets: [] });
    }
  };

  // === SUBMIT HANDLER ===
  const onSubmit = async () => {
    // Prevent submission if initial data fetch failed
    if (!hasInitialData) {
        alert("Cannot run search. Initialization failed due to a critical API error.");
        return;
    }

    const formData = prepareFormData();
    const dateError = validateDateRange(formData);
    if (dateError) {
      alert(dateError);
      return;
    }

    setIsLoading(true);
    try {
      // Run all chart fetches concurrently
      await Promise.all([
        fetchAlertTypeStatus(formData),
        fetchCameraStatus(formData),
        fetchStatusDistribution(formData),
      ]);
    } catch (error) {
      // The individual fetch functions already alerted the user and cleared the chart data
      console.log('Chart update complete (some parts may have failed).');
    } finally {
      setIsLoading(false);
    }
  };

  // === AUTO-REFRESH ON FILTER CHANGE (Debounced) ===
  // Note: The `debounce` utility function must be defined and included in the file.
  const debouncedSubmit = useMemo(
    () =>
      debounce(() => {
        onSubmit();
      }, 600),
    [onSubmit] // Dependency on onSubmit ensures the memoized function uses the latest onSubmit (which depends on hasInitialData)
  );

  useEffect(() => {
    const subscription = watch(() => {
      // Only debounced submit if initial data was loaded successfully
      if (hasInitialData) {
        debouncedSubmit();
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedSubmit.cancel();
    };
  }, [watch, debouncedSubmit, hasInitialData]);

  // === INITIAL LOAD AFTER DROPDOWNS ===
  useEffect(() => {
    // Only run initial submit if initialization succeeded
    if (hasInitialData) {
      onSubmit();
    }
  }, [hasInitialData]); // Only trigger when initial data state changes

  // === RESET FORM ===
  const resetForm = () => {
    reset({
      status: 'all',
      cam: ['all'],
      alert: '',
      sdate: '',
      edate: '',
    });
    // Auto-submit via watch
  };
  
  // Custom component for showing "No Data" overlay on charts
  const NoDataOverlay = ({ text }) => (
    <div 
        style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10,
            fontSize: '1.2em',
            color: '#666',
            pointerEvents: 'none'
        }}
    >
        {text}
    </div>
  );

  // --- RENDER ---
  return (
    <div className="analytics-dashboard-container">
      <div className="analytics-main-content">
        <div className="analytics-header">
          <h1>Analytics</h1>
          <div className="analytics-header-actions">
            <div className="analytics-refresh-btn">
              <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="analytics-filters-section">
            <div className="analytics-filter-row">
              {/* Date Inputs */}
              <div className="analytics-filter-group date">
                <label htmlFor="sdate">Start Date</label>
                <input type="date" id="sdate" {...register('sdate')} />
              </div>
              <div className="analytics-filter-group date">
                <label htmlFor="edate">End Date</label>
                <input type="date" id="edate" {...register('edate')} />
              </div>

              {/* Camera Select */}
              <div className="analytics-filter-group">
                <label htmlFor="camFilter">Camera</label>
                <Select
                  isMulti
                  options={[
                    { value: 'all', label: 'All Cameras' },
                    ...cameraList.map((cam) => ({
                      value: cam.CameraId,
                      label: cam.CameraName,
                    })),
                  ]}
                  value={watch('cam')?.map((val) => ({
                    value: val,
                    label:
                      val === 'all'
                        ? 'All Cameras'
                        : cameraList.find((c) => c.CameraId === val)?.CameraName || val,
                  }))}
                  onChange={(selected) => {
                    const values = selected.map((opt) => opt.value);
                    if (values.includes('all') && values.length > 1) {
                      setValue('cam', ['all'], { shouldValidate: true });
                    } else {
                      setValue('cam', values.filter(v => v !== 'all' || v === 'all' && values.length === 1), { shouldValidate: true });
                    }
                  }}
                  classNamePrefix="black-dropdown"
                  className="analytics-camera-select"
                  placeholder="Select Cameras"
                  isClearable
                  isSearchable
                  menuPlacement="auto"
                  maxMenuHeight={200}
                  isDisabled={!hasInitialData && cameraList.length === 0}
                />
              </div>

              {/* Status Select */}
              <div className="analytics-filter-group">
                <label htmlFor="statusFilter">Status</label>
                <select id="statusFilter" {...register('status')} disabled={!hasInitialData}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="unresolved">Unresolved</option>
                </select>
              </div>

              {/* Alert Type Select */}
              <div className="analytics-filter-group">
                <label htmlFor="regionFilter">Alert Type</label>
                <select id="regionFilter" {...register('alert')} disabled={!hasInitialData}>
                  <option value="">Select Alert Type</option>
                  {alertList.map((alert) => (
                    <option key={alert.AlertAnalyticsId} value={alert.AlertAnalyticsName}>
                      {alert.AlertAnalyticsName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="analytics-filter-buttons-row">
              <button className="btn analytics-btn-primary analytics-apply-filters" type="submit" disabled={isLoading || !hasInitialData}>
                Search
              </button>
              <button
                className="btn analytics-btn-secondary analytics-reset-filters"
                type="button"
                onClick={resetForm}
                disabled={!hasInitialData}
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* LOADING STATE */}
        {isLoading && hasInitialData ? (
          <div className="analytics-loading">
            <i className="fas fa-spinner fa-spin"></i> Loading charts...
          </div>
        ) : (
          <div className="analytics-grid">
            
            {/* Chart 1: Alert Frequency by Alert Type */}
            <div className="analytics-card">
              <h3>Alert Frequency by Alert Type</h3>
              <div className="chart-container" style={{ position: 'relative' }}>
                <Bar data={barChartData} options={chartOptions} />
                {barChartData.labels.length === 0 && (
                   <NoDataOverlay text="No data or configuration found for Alert Types." />
                )}
              </div>
            </div>

            {/* Chart 2: Alert Frequency by Camera (Line) */}
            <div className="analytics-card">
              <h3>Alert Frequency by Camera (Line)</h3>
              <div className="chart-container" style={{ position: 'relative' }}>
                <Line data={lineChartData} options={chartOptions} />
                 {lineChartData.labels.length === 0 && (
                   <NoDataOverlay text="No data or configuration found for Cameras." />
                )}
              </div>
            </div>

            {/* Chart 3: Alert Status Distribution (Pie) */}
            <div className="analytics-card">
              <h3>Alert Status Distribution</h3>
              <div className="chart-container" style={{ position: 'relative' }}>
                <Pie data={pieChartData} options={{...chartOptions, maintainAspectRatio: true}} />
                {pieChartData.labels.length === 0 && (
                   <NoDataOverlay text="No data or configuration found for Status Distribution." />
                )}
              </div>
            </div>

            {/* Chart 4: Alerts Over Camera (Bar) */}
            <div className="analytics-card">
              <h3>Alerts Over Camera (Bar)</h3>
              <div className="chart-container" style={{ position: 'relative' }}>
                <Bar data={barChartDataForCamera} options={chartOptions} />
                 {barChartDataForCamera.labels.length === 0 && (
                   <NoDataOverlay text="No data or configuration found for Cameras." />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple debounce (no external deps)
// Enhanced debounce with .cancel()
function debounce(func, wait) {
  let timeout = null;
  const debounced = function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };

  debounced.cancel = function () {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

export default Analytics;