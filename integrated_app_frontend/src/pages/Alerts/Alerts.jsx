/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from 'react-modal';
import Select from 'react-select';
import AddStatusAndRemark from './AddStatusAndRemark';
import { useSidebar } from '../../App';
import './Alerts.css';
import { apiService } from '../../services/api';
import { useAuth } from '../../services/auth';

Modal.setAppElement('#root');

const PAGE_SIZE = 10;

const Alerts = () => {
  const { isSidebarShrunk } = useSidebar();
  const auth = useAuth();
  const user = auth.getUser();

  /* ---------- STATE ---------- */
  const [statusCount, setStatusCount] = useState({ all: 0, resolved: 0, pending: 0, unresolved: 0 });
  const [unseenCount, setUnseenCount] = useState(0);
  const [siteList, setSiteList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [floorList, setFloorList] = useState([]);
  const [cameraList, setCameraList] = useState([]);
  const [alertAnalyticsList, setAlertAnalyticsList] = useState([]);

  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);

  const [alertRows, setAlertRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [companyId, setCompanyId] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /* ---------- FORM ---------- */
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      site: '',
      building: '',
      floor: '',
      status: 'all',
      cam: [],          
      alert: '',
      sdate: '',
      edate: '',
    },
    mode: 'onChange',
  });

  const watched = watch();

  /* ---------- MEMOISED API CALLS ---------- */
  const fetchStatusCount = useCallback(async () => {
    try {
      const res = await apiService.get('count-by-status');
      setStatusCount(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchUnseenCount = useCallback(async () => {
    try {
      const res = await apiService.get('unseen-alerts');
      setUnseenCount(res.unseenCount ?? 0);
    } catch (e) { console.error(e); }
  }, []);

  const fetchSites = useCallback(async () => {
    try {
      const res = await apiService.get('get-all-site');
      setSiteList(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchBuildings = useCallback(async () => {
    try {
      const res = await apiService.get('get-all-building');
      setBuildingList(res.data);
      setFilteredBuildings(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchFloors = useCallback(async () => {
    try {
      const res = await apiService.get('get-all-floor');
      setFloorList(res.data);
      setFilteredFloors(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchCameras = useCallback(async () => {
    try {
      const res = await apiService.get('all-cameras');
      setCameraList(res.data);
      setFilteredCameras(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchAlertAnalytics = useCallback(async () => {
    try {
      const res = await apiService.get('get-all-alert-analytics');
      setAlertAnalyticsList(res.data);
    } catch (e) { console.error(e); }
  }, []);

  /* ---------- FETCH ALERTS (pagination + filters) ---------- */
  const fetchAlerts = useCallback(
    async (page = 1, filters = {}) => {
      const offset = (page - 1) * PAGE_SIZE;
      const body = { ...filters, offset, limit: PAGE_SIZE };

      try {
        const res = await apiService.post('alert', body);
        setAlertRows(res.data.rows);
        setTotalRecords(res.data.total);
        setTotalPages(Math.ceil(res.data.total / PAGE_SIZE));
        setCurrentPage(page);
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (user && user.Role !== 'Super Admin') {
      setCompanyId(user.CompanyId);
    }

    const init = async () => {
      await Promise.all([
        fetchStatusCount(),
        fetchUnseenCount(),
        fetchSites(),
        fetchBuildings(),
        fetchFloors(),
        fetchCameras(),
        fetchAlertAnalytics(),
      ]);
      await fetchAlerts(1, {});
      setIsInitialLoad(false);
    };

    if (isInitialLoad) {
      init();
    }
  }, [
    user,
    isInitialLoad
  ]);

  /* ---------- FILTER DEPENDENCIES ---------- */
  useEffect(() => {
    if (isInitialLoad) return;

    const siteId = watched.site;
    if (siteId) {
      const filteredB = buildingList.filter(b => b.SiteId === siteId);
      setFilteredBuildings(filteredB);
      setValue('building', '');
      setValue('floor', '');
      setValue('cam', []);
    } else {
      setFilteredBuildings(buildingList);
    }
  }, [watched.site, buildingList, setValue, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;

    const buildingId = watched.building;
    if (buildingId) {
      const filteredF = floorList.filter(f => f.BuildingId === buildingId);
      setFilteredFloors(filteredF);
      setValue('floor', '');
      setValue('cam', []);
    } else {
      setFilteredFloors(floorList);
    }
  }, [watched.building, floorList, setValue, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;

    const floorId = watched.floor;
    if (floorId) {
      const filteredC = cameraList.filter(c => c.FloorId === floorId);
      setFilteredCameras(filteredC);
      setValue('cam', []);
    } else {
      setFilteredCameras(cameraList);
    }
  }, [watched.floor, cameraList, setValue, isInitialLoad]);

  /* ---------- FORM SUBMIT (search) ---------- */
  const onSearch = async (data) => {
    const filters = {};

    if (data.site) filters.site = data.site;
    if (data.building) filters.building = data.building;
    if (data.floor) filters.floor = data.floor;
    if (data.status && data.status !== 'all') filters.status = data.status;
    if (data.alert) filters.alert = data.alert;
    if (data.sdate) filters.sdate = data.sdate;
    if (data.edate) filters.edate = data.edate;

    if (data.cam && data.cam.length) {
      if (!data.cam.includes('all')) {
        filters.cam = data.cam;
      }
    }

    setCurrentPage(1);
    await fetchAlerts(1, filters);
  };

  /* ---------- RESET ---------- */
  const resetAll = () => {
    reset({
      site: '',
      building: '',
      floor: '',
      status: 'all',
      cam: [],
      alert: '',
      sdate: '',
      edate: '',
    });
    setCurrentPage(1);
    fetchAlerts(1, {});
  };

  /* ---------- PAGINATION ---------- */
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    const filters = prepareFilters();
    fetchAlerts(page, filters);
  };

  const prepareFilters = () => {
    const v = getValues();
    const f = {};
    if (v.site) f.site = v.site;
    if (v.building) f.building = v.building;
    if (v.floor) f.floor = v.floor;
    if (v.status && v.status !== 'all') f.status = v.status;
    if (v.alert) f.alert = v.alert;
    if (v.sdate) f.sdate = v.sdate;
    if (v.edate) f.edate = v.edate;
    if (v.cam && v.cam.length && !v.cam.includes('all')) f.cam = v.cam;
    return f;
  };

  /* ---------- MODAL ---------- */
  const openModal = (alert) => {
    setSelectedAlert(alert);
    setModalOpen(true);
  };
  const closeModal = async (refresh) => {
    setModalOpen(false);
    setSelectedAlert(null);
    if (refresh) {
      await Promise.all([fetchStatusCount(), fetchUnseenCount()]);
      await fetchAlerts(currentPage, prepareFilters());
    }
  };

  /* ---------- PDF ---------- */
  const downloadPdf = async () => {
    const v = getValues();
    const params = new URLSearchParams();
    if (v.site) params.append('site', v.site);
    if (v.building) params.append('building', v.building);
    if (v.floor) params.append('floor', v.floor);
    if (v.status && v.status !== 'all') params.append('status', v.status);
    if (v.alert) params.append('alert', v.alert);
    if (v.sdate) params.append('sdate', v.sdate);
    if (v.edate) params.append('edate', v.edate);
    if (v.cam && v.cam.length && !v.cam.includes('all')) {
      v.cam.forEach(c => params.append('cam', c));
    }

    const url = `alert/pdf${params.toString() ? `?${params}` : ''}`;
    try {
      const res = await apiService.get(url);
      const link = document.createElement('a');
      link.href = `http://localhost:3000${res.data}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert('PDF download failed');
    }
  };

  /* ---------- CAMERA SELECT LOGIC ---------- */
  const handleCameraChange = (selected) => {
    const values = selected ? selected.map(o => o.value) : [];
    if (values.includes('all')) {
      setValue('cam', ['all']);
    } else {
      setValue('cam', values);
    }
  };

  const cameraOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Cameras' },
      ...filteredCameras.map(c => ({ value: c.CameraId, label: c.CameraName })),
    ];
  }, [filteredCameras]);

  const selectedCameraValues = useMemo(() => {
    const cam = watched.cam || [];
    if (cam.includes('all')) return [{ value: 'all', label: 'All Cameras' }];
    return cam.map(id => {
      const c = filteredCameras.find(x => x.CameraId === id);
      return { value: id, label: c?.CameraName ?? id };
    });
  }, [watched.cam, filteredCameras]);

  /* ---------- HELPERS ---------- */
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="alerts-main-content">
      {/* ---------- HEADER ---------- */}
      <div className="alerts-header">
        <h1 className="alerts-title">Alerts</h1>
        <div className="alerts-header-actions">
          <div className="alerts-refresh-btn">
            <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
          </div>
          <div className="alerts-notifications">
            <i className="fas fa-bell"></i>
            <span className="alerts-badge">{unseenCount}</span>
          </div>
        </div>
      </div>

      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="alerts-summary">
        <div className="alerts-summary-card">
          <h3>Total</h3>
          <span className="alerts-count">{statusCount.all}</span>
        </div>
        <div className="alerts-summary-card alerts-resolved">
          <h3>Resolved</h3>
          <span className="alerts-count">{statusCount.resolved}</span>
        </div>
        <div className="alerts-summary-card alerts-pending">
          <h3>Pending</h3>
          <span className="alerts-count">{statusCount.pending}</span>
        </div>
        <div className="alerts-summary-card alerts-unresolved">
          <h3>Unresolved</h3>
          <span className="alerts-count">{statusCount.unresolved}</span>
        </div>
      </div>

      {/* ---------- FILTER FORM ---------- */}
      <form onSubmit={handleSubmit(onSearch)} className="alerts-form">
        <div className="alerts-filters-section">
          <div className="alerts-filter-row">
            {/* DATE */}
            <div className="alerts-filter-group alerts-date-filter">
              <label htmlFor="sdate">Start Date</label>
              <input type="date" id="sdate" {...register('sdate')} className="alerts-date-input" />
            </div>
            <div className="alerts-filter-group alerts-date-filter">
              <label htmlFor="edate">End Date</label>
              <input type="date" id="edate" {...register('edate')} className="alerts-date-input" />
            </div>

            {/* SITE */}
            <div className="alerts-filter-group">
              <label htmlFor="site">Site</label>
              <select id="site" {...register('site')} className="alerts-select">
                <option value="">Select Site</option>
                {siteList.map(s => (
                  <option key={s.SiteId} value={s.SiteId}>
                    {s.SiteName}
                  </option>
                ))}
              </select>
            </div>

            {/* BUILDING */}
            <div className="alerts-filter-group">
              <label htmlFor="building">Building</label>
              <select id="building" {...register('building')} className="alerts-select">
                <option value="">Select Building</option>
                {filteredBuildings.map(b => (
                  <option key={b.BuildingId} value={b.BuildingId}>
                    {b.BuildingName}
                  </option>
                ))}
              </select>
            </div>

            {/* FLOOR */}
            <div className="alerts-filter-group">
              <label htmlFor="floor">Floor</label>
              <select id="floor" {...register('floor')} className="alerts-select">
                <option value="">Select Floor</option>
                {filteredFloors.map(f => (
                  <option key={f.FloorId} value={f.FloorId}>
                    {f.FloorName}
                  </option>
                ))}
              </select>
            </div>

            {/* CAMERA (react-select) */}
            <div className="alerts-filter-group alerts-camera-multi-select">
              <label htmlFor="cam">Camera</label>
              <Controller
                name="cam"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    options={cameraOptions}
                    value={selectedCameraValues}
                    onChange={handleCameraChange}
                    classNamePrefix="alerts-react-select"
                    className="alerts-camera-select"
                    placeholder="Select Cameras"
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                )}
              />
            </div>

            {/* STATUS */}
            <div className="alerts-filter-group">
              <label htmlFor="status">Status</label>
              <select id="status" {...register('status')} className="alerts-select">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="unresolved">Unresolved</option>
              </select>
            </div>

            {/* ALERT TYPE */}
            {/* *** CORRECTION HERE: sending Name instead of ID *** */}
            <div className="alerts-filter-group">
              <label htmlFor="alert">Alert Type</label>
              <select id="alert" {...register('alert')} className="alerts-select">
                <option value="">Select Alert Type</option>
                {alertAnalyticsList.map(a => (
                  <option key={a.AlertAnalyticsId} value={a.AlertAnalyticsName}>
                    {a.AlertAnalyticsName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="alerts-filter-buttons-row">
            <button type="submit" className="alerts-btn alerts-btn-primary alerts-apply-filters">
              Search
            </button>
            <button type="button" onClick={resetAll} className="alerts-btn alerts-btn-secondary alerts-reset-filters">
              Reset
            </button>
            <button type="button" onClick={downloadPdf} className="alerts-btn alerts-btn-danger alerts-pdf-download">
              <i className="fas fa-file-pdf"></i> PDF
            </button>
          </div>
        </div>
      </form>

      {/* ---------- TABLE ---------- */}
      <div className="alerts-table-container">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Alert</th>
              <th>Camera</th>
              <th>Region</th>
              <th>Subregion</th>
              <th>Floor</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Snap 1</th>
              <th>Snap 2</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alertRows.map(a => (
              <tr
                key={a.AlertId}
                className={a.Seen?.toLowerCase() === 'yes' ? 'alerts-seen-row' : ''}
              >
                <td>{formatDate(a.CreatedAt)}</td>
                <td>{formatTime(a.CreatedAt)}</td>
                <td>{a.AlertAnalytics?.AlertAnalyticsName ?? '-'}</td>
                <td>{a.Camera?.CameraName ?? '-'}</td>
                <td>{a.Camera?.Floor?.Building?.Site?.SiteName ?? '-'}</td>
                <td>{a.Camera?.Floor?.Building?.BuildingName ?? '-'}</td>
                <td>{a.Camera?.Floor?.FloorName ?? '-'}</td>
                <td>
                  <span className={`alerts-status-badge alerts-status-${a.Status?.toLowerCase()}`}>
                    {a.Status ?? '-'}
                  </span>
                </td>
                <td>{a.Remarks || 'NA'}</td>
                <td>
                  <img src={a.Image1} alt="snap1" className="alerts-snap-thumbnail" />
                </td>
                <td>
                  <img src={a.Image2} alt="snap2" className="alerts-snap-thumbnail" />
                </td>
                <td>
                  <button
                    className="alerts-action-btn alerts-update-status"
                    onClick={() => openModal(a)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- PAGINATION ---------- */}
      <div className="alerts-pagination">
        <button
          className="alerts-btn alerts-btn-secondary alerts-prev-page"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <span className="alerts-page-info">
          Page {currentPage} of {totalPages} ({totalRecords} records)
        </span>
        <button
          className="alerts-btn alerts-btn-secondary alerts-next-page"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* ---------- MODAL ---------- */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => closeModal(false)}
        className="custom-dialog-container"
        overlayClassName="modal-overlay"
      >
        <AddStatusAndRemark alert={selectedAlert} onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default Alerts;