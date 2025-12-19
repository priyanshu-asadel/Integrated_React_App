import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from 'react-modal';
import Select from 'react-select'; // Import react-select
import { apiService } from '../../services/api';
import './CameraManagement.css';

Modal.setAppElement('#root');

// --- AnalyticsSelector COMPONENT (Retained/Updated for clarity) ---
function AnalyticsSelector({ allAnalytics, value, onChange }) {
    // Helper function to safely parse Classes from the API data
    const parseClasses = (data) => {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data) || [];
            } catch (e) {
                return [];
            }
        }
        return data || [];
    };
    
    const analyticsOptions = allAnalytics.map(a => ({
        value: a.AlertAnalyticsId,
        label: a.AlertAnalyticsName,
        allClasses: parseClasses(a.Classes) 
    }));
    
    const selectedAnalytics = value.map(selected => {
        const fullAnalytic = allAnalytics.find(a => a.AlertAnalyticsId === selected.analyticId);
        return {
            ...selected,
            label: fullAnalytic?.AlertAnalyticsName || 'Unknown',
            allClasses: parseClasses(fullAnalytic?.Classes) || []
        };
    });
    
    const handleAnalyticChange = (selectedOptions) => {
        const newConfig = selectedOptions.map(option => {
            const existing = value.find(a => a.analyticId === option.value);
            if (existing) {
                return existing;
            }
            return {
                analyticId: option.value,
                allClasses: option.allClasses,
                selectedClasses: option.allClasses 
            };
        });
        onChange(newConfig);
    };
    
    const handleClassChange = (analyticIndex, selectedClassOptions) => {
        const newConfig = [...value];
        newConfig[analyticIndex].selectedClasses = selectedClassOptions.map(c => c.value);
        onChange(newConfig);
    };

    // --- STYLES FOR REACT-SELECT (Must be defined globally or passed in) ---
    const customStyles = {
        control: (provided) => ({ ...provided, background: '#3a3a3a', border: '1px solid #555', color: '#fff', padding: '0.2rem' }),
        menu: (provided) => ({ ...provided, background: '#3a3a3a', color: '#fff', zIndex: 5 }),
        option: (provided, state) => ({ ...provided, background: state.isSelected ? '#4c82af' : '#3a3a3a', color: '#fff', ':hover': { background: '#4c82af' } }),
        multiValue: (provided) => ({ ...provided, background: '#4c82af', color: '#fff' }),
        multiValueLabel: (provided) => ({ ...provided, color: '#fff' }),
        multiValueRemove: (provided) => ({ ...provided, color: '#fff', ':hover': { background: '#ff6b6b', color: '#fff' } }),
        placeholder: (provided) => ({ ...provided, color: '#ccc' }),
        singleValue: (provided) => ({ ...provided, color: '#fff' }),
        input: (provided) => ({ ...provided, color: '#fff' })
    };

    return (
        <div className="CamMan-form-group">
            <label htmlFor="alert">Analytics *</label>
            <Select
                id="alert"
                isMulti
                options={analyticsOptions}
                value={analyticsOptions.filter(o => value.some(a => a.analyticId === o.value))}
                onChange={handleAnalyticChange}
                styles={customStyles}
            />
            {selectedAnalytics.length > 0 && <hr className="CamMan-divider" />}
            {selectedAnalytics.map((analytic, index) => {
                const classOptions = analytic.allClasses.map(cls => ({ value: cls, label: cls }));
                return (
                    <div key={analytic.analyticId} className="CamMan-form-group">
                        <label htmlFor={`classes-${analytic.analyticId}`}>
                            Selected Classes for: <strong>{analytic.label}</strong>
                        </label>
                        <Select
                            id={`classes-${analytic.analyticId}`}
                            isMulti
                            options={classOptions}
                            value={classOptions.filter(c => analytic.selectedClasses.includes(c.value))}
                            onChange={(selectedOptions) => handleClassChange(index, selectedOptions)} 
                            styles={customStyles}
                        />
                    </div>
                );
            })}
        </div>
    );
}

// --- CameraManagementTab COMPONENT (FIXED) ---
export default function CameraManagementTab() {
  const [cameras, setCameras] = useState([]);
  const [alertList, setAlertList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);

  const [filteredWorkstations, setFilteredWorkstations] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [isMasterLoading, setIsMasterLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [filterCompany, setFilterCompany] = useState('');
  const [filterWorkstation, setFilterWorkstation] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterFloor, setFilterFloor] = useState('');

  const [addModal, setAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  const user = JSON.parse(localStorage.getItem('APP_USER') || '{}');
   
  // Helper to safely extract data from Promise.allSettled result
  const extractData = (res) => {
    if (res.status === 'fulfilled') {
        // Ensure data is available on res.value (the resolved API response object)
        return res.value.data || res.value || []; 
    }
    // Log the error but return empty array to prevent app crash
    console.error(`ERROR: Failed to load resource. Status: ${res.status}. Reason:`, res.reason);
    return [];
  };

  const loadMaster = useCallback(() => {
    setIsMasterLoading(true);
    
    const requests = [
      apiService.get('get-all-company'),
      apiService.get('get-all-workstation'),
      apiService.get('get-all-site'),
      apiService.get('get-all-building'),
      apiService.get('get-all-floor'),
      apiService.get('get-all-alert-analytics'), 
    ];

    // FIX 1: Use Promise.allSettled to ensure failure of one API (like analytics) doesn't halt the others.
    Promise.allSettled(requests)
      .then(results => {
        const [compRes, wsRes, siteRes, buildRes, floorRes, alertRes] = results;

        const compData = extractData(compRes);
        const wsData = extractData(wsRes);
        const siteData = extractData(siteRes);
        const buildData = extractData(buildRes);
        const floorData = extractData(floorRes);
        const alertData = extractData(alertRes);

        // Update states
        setCompanies(compData);
        setWorkstations(wsData);
        setSites(siteData);
        setBuildings(buildData);
        setFloors(floorData);
        setAlertList(alertData);
        
        // Initialize filtered lists
        setFilteredWorkstations(wsData);
        setFilteredSites(siteData);
        setFilteredBuildings(buildData);
        setFilteredFloors(floorData);
        
      })
      .finally(() => {
        setIsMasterLoading(false);
      });
  }, []);

  const loadCameras = useCallback(() => {
    // Prevent execution if master data is still being processed
    if (isMasterLoading) return; 

    const offset = (currentPage - 1) * pageSize;
    let url = `camera/${offset}/${pageSize}`;
    const params = [];
    if (filterCompany) params.push(`companyId=${filterCompany}`);
    if (filterWorkstation) params.push(`workstationId=${filterWorkstation}`);
    if (filterSite) params.push(`siteId=${filterSite}`);
    if (filterBuilding) params.push(`buildingId=${filterBuilding}`);
    if (filterFloor) params.push(`floorId=${filterFloor}`);
    if (params.length) url += `?${params.join('&')}`;

    // FIX 2: Added .catch to prevent crash if camera API fails
    apiService.get(url).then(res => {
      setTotalPages(Math.ceil(res.data.total / pageSize));
      setCameras(res.data.rows);
    }).catch(err => {
        console.error("Failed to load cameras:", err);
        setCameras([]);
        setTotalPages(1);
    });
  }, [currentPage, filterCompany, filterWorkstation, filterSite, filterBuilding, filterFloor, isMasterLoading]);

  useEffect(() => {
    loadMaster();
  }, [loadMaster]);

  useEffect(() => {
    // Load cameras after master data is confirmed loaded/failed
    if (!isMasterLoading) {
      loadCameras();
    }
  }, [isMasterLoading, loadCameras]); 

  // --- Filtering Logic (Unchanged) ---
  useEffect(() => {
    if (filterCompany) {
      setFilteredWorkstations(workstations.filter(ws => ws.CompanyId === filterCompany));
      setFilteredSites(sites.filter(s => s.CompanyId === filterCompany));
    } else {
      setFilteredWorkstations(workstations);
      setFilteredSites(sites);
    }
    setFilterWorkstation('');
    setFilterSite('');
    setFilterBuilding('');
    setFilterFloor('');
  }, [filterCompany, workstations, sites]);

  useEffect(() => {
    if (filterSite) {
      setFilteredBuildings(buildings.filter(b => b.SiteId === filterSite));
    } else {
      setFilteredBuildings(buildings);
    }
    setFilterBuilding('');
    setFilterFloor('');
  }, [filterSite, buildings]);

  useEffect(() => {
    if (filterBuilding) {
      setFilteredFloors(floors.filter(f => f.BuildingId === filterBuilding));
    } else {
      setFilteredFloors(floors);
    }
    setFilterFloor('');
  }, [filterBuilding, floors]);


  // --- Pagination, Modal Handlers, Access Checks (Unchanged) ---
  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(c => c + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(c => c - 1); };
  const openAdd = () => { setEditData(null); setAddModal(true); };
  const closeAdd = (refresh) => {
    setAddModal(false);
    if (refresh) { setCurrentPage(1); loadCameras(); }
  };
  const openEdit = (cam) => { setEditData(cam); setAddModal(true); };
  const openDelete = (cam) => setDeleteData(cam);
  const closeDelete = (refresh) => { setDeleteData(null); if (refresh) loadCameras(); };
  const hasCompanyAccess = () => (user.ComponentToAccess || '').split(',').includes('company');
  const hasWorkstationAccess = () => (user.ComponentToAccess || '').split(',').includes('workstation');
  const hasSiteAccess = () => (user.ComponentToAccess || '').split(',').includes('site');
  const hasBuildingAccess = () => (user.ComponentToAccess || '').split(',').includes('building');
  const hasFloorAccess = () => (user.ComponentToAccess || '').split(',').includes('floor');
  const onFilterSubmit = () => { setCurrentPage(1); loadCameras(); };
  const resetFilter = () => {
    setFilterCompany(''); setFilterWorkstation(''); setFilterSite('');
    setFilterBuilding(''); setFilterFloor(''); setCurrentPage(1);
  };
  useEffect(() => {
    if (!filterCompany && !filterWorkstation && !filterSite && !filterBuilding && !filterFloor) {
      loadCameras();
    }
  }, [filterCompany, filterWorkstation, filterSite, filterBuilding, filterFloor, loadCameras]);


  return (
    <div className="CamMan-tab-pane CamMan-active">
      <div className="CamMan-section-header">
        <h2>Camera Management</h2>
        <button className="CamMan-btn CamMan-btn-primary" onClick={openAdd} disabled={isMasterLoading}>
          Add Camera
        </button>
      </div>

      {(hasCompanyAccess() || hasWorkstationAccess() || hasSiteAccess() || hasBuildingAccess() || hasFloorAccess()) && (
        <div className="CamMan-filters-section">
          {hasCompanyAccess() && (
            <div className="CamMan-filter-group">
              <label htmlFor="companyFilter">Company</label>
              <select
                id="companyFilter"
                value={filterCompany}
                onChange={e => setFilterCompany(e.target.value)}
                disabled={isMasterLoading}
              >
                <option value="">All Companies</option>
                {companies.map(c => (
                  <option key={c.CompanyId} value={c.CompanyId}>{c.CompanyName}</option>
                ))}
              </select>
            </div>
          )}
          {hasWorkstationAccess() && (
            <div className="CamMan-filter-group">
              <label htmlFor="workstationFilter">Workstation</label>
              <select
                id="workstationFilter"
                value={filterWorkstation}
                onChange={e => setFilterWorkstation(e.target.value)}
                disabled={isMasterLoading}
              >
                <option value="">All Workstations</option>
                {filteredWorkstations.map(ws => (
                  <option key={ws.WorkStationId} value={ws.WorkStationId}>{ws.WorkStationName}</option>
                ))}
              </select>
            </div>
          )}
          {hasSiteAccess() && (
            <div className="CamMan-filter-group">
              <label htmlFor="siteFilter">Site</label>
              <select
                id="siteFilter"
                value={filterSite}
                onChange={e => setFilterSite(e.target.value)}
                disabled={isMasterLoading}
              >
                <option value="">All Sites</option>
                {filteredSites.map(s => (
                  <option key={s.SiteId} value={s.SiteId}>{s.SiteName}</option>
                ))}
              </select>
            </div>
          )}
          {hasBuildingAccess() && (
            <div className="CamMan-filter-group">
              <label htmlFor="buildingFilter">Building</label>
              <select
                id="buildingFilter"
                value={filterBuilding}
                onChange={e => setFilterBuilding(e.target.value)}
                disabled={isMasterLoading}
              >
                <option value="">All Buildings</option>
                {filteredBuildings.map(b => (
                  <option key={b.BuildingId} value={b.BuildingId}>{b.BuildingName}</option>
                ))}
              </select>
            </div>
          )}
          {hasFloorAccess() && (
            <div className="CamMan-filter-group">
              <label htmlFor="floorFilter">Floor</label>
              <select
                id="floorFilter"
                value={filterFloor}
                onChange={e => setFilterFloor(e.target.value)}
                disabled={isMasterLoading}
              >
                <option value="">All Floors</option>
                {filteredFloors.map(f => (
                  <option key={f.FloorId} value={f.FloorId}>{f.FloorName}</option>
                ))}
              </select>
            </div>
          )}

          <button className="CamMan-btn CamMan-btn-primary CamMan-apply-filters" onClick={onFilterSubmit} disabled={isMasterLoading}>
            Filter
          </button>

          <button className="CamMan-btn CamMan-btn-secondary CamMan-reset-filters" onClick={resetFilter} disabled={isMasterLoading}>
            Reset
          </button>
        </div>
      )}
      
      {/* Loading Indicator for Cameras/Table */}
      {isMasterLoading ? (
        <div className="CamMan-loading-overlay">
          <i className="fas fa-spinner fa-spin"></i> Loading data...
        </div>
      ) : (
        <div className="CamMan-table-container">
          <table className="CamMan-settings-table">
            <thead>
              <tr>
                <th>Camera</th>
                <th>Description</th>
                <th>Floor</th>
                <th>Status</th>
                <th>WorkStation</th>
                <th>Analytics</th>
                <th>Roi</th>
                <th>Api</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cameras.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>No cameras found.</td>
                </tr>
              ) : (
                cameras.map(cam => (
                  <tr key={cam.CameraId}>
                    <td>{cam.CameraName}</td>
                    <td>{cam.CameraDescription}</td>
                    <td>{cam.Floor?.FloorName}</td>
                    <td>
                      <span className={`CamMan-status-indicator CamMan-status-${cam.Status === 'true' ? 'active' : 'inactive'}`}></span>
                      {cam.Status === 'true' ? 'Active' : 'Inactive'}
                    </td>
                    <td>{cam.WorkStation?.WorkStationName}</td>
                    <td>
                      <div className="CamMan-access-tags">
                        {/* Ensure AnalyticsConfig is parsed before accessing. The API should handle this, but checking prevents crash */}
                        {Array.isArray(cam.AnalyticsConfig) && cam.AnalyticsConfig.map((analytic, i) => {
                          const analyticName = alertList.find(a => a.AlertAnalyticsId === analytic.analyticId)?.AlertAnalyticsName;
                          return (
                            <span key={i} className="CamMan-access-tag" title={`Classes: ${analytic.selectedClasses?.join(', ') || 'N/A'}`}>
                              {analyticName || 'Unknown'}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      {cam.Roi && cam.Roi.xCoordinates
                        ? `X:${cam.Roi.xCoordinates.join(',')} Y:${cam.Roi.yCoordinates.join(',')}`
                        : 'NA'}
                    </td>
                    <td>{cam.Api}</td>
                    <td>
                      <button className="CamMan-action-btn CamMan-edit" onClick={() => openEdit(cam)}>
                        Edit
                      </button>
                      <button className="CamMan-action-btn CamMan-delete" onClick={() => openDelete(cam)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="CamMan-pagination">
        <button
          className="CamMan-btn CamMan-btn-secondary CamMan-prev-page"
          disabled={currentPage === 1 || isMasterLoading}
          onClick={prevPage}
        >
          Previous
        </button>
        <span className="CamMan-page-info">Page {currentPage} of {totalPages}</span>
        <button
          className="CamMan-btn CamMan-btn-secondary CamMan-next-page"
          disabled={currentPage === totalPages || isMasterLoading}
          onClick={nextPage}
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={addModal}
        onRequestClose={() => closeAdd()}
        className="CamMan-modal-content"
        overlayClassName="CamMan-modal-overlay"
        style={{ content: { width: '1000px', margin: 'auto' } }}
      >
        <AddUpdateCameraModal 
            data={editData} 
            onClose={closeAdd}
            allAnalytics={alertList}
            siteList={sites}
            buildingList={buildings}
            floorList={floors}
            wsList={workstations}
        />
      </Modal>

      <Modal
        isOpen={!!deleteData}
        onRequestClose={() => closeDelete()}
        className="CamMan-modal-content"
        overlayClassName="CamMan-modal-overlay"
        style={{ content: { width: '500px', margin: 'auto' } }}
      >
        {deleteData && <DeleteCameraModal data={deleteData} onClose={closeDelete} />}
      </Modal>
    </div>
  );
}


// === Add/Update Modal (LOGIC CORRECTED) ===
function AddUpdateCameraModal({ data, onClose, allAnalytics, siteList, buildingList, floorList, wsList }) {
  const isEditMode = !!data?.CameraId;
  
  // Helper to safely parse AnalyticsConfig
  const parseAnalyticsConfig = (config) => {
    if (typeof config === 'string') {
      try { return JSON.parse(config); } catch (e) { return []; }
    }
    return config || [];
  };

  const [camForm, setCamForm] = useState({
    name: data?.CameraName || '',
    des: data?.CameraDescription || '',
    ws: data?.WorkStationId || '',
    api: data?.Api || '',
    rtsp: data?.RTSPUrl || '',
    site: data?.Floor?.Building?.SiteId || '',
    building: data?.Floor?.BuildingId || '',
    floor: data?.FloorId || '',
    company: data?.WorkStation?.CompanyId || '' 
  });
  
  const [analyticsConfig, setAnalyticsConfig] = useState(parseAnalyticsConfig(data?.AnalyticsConfig));

  const [resolForm, setResolForm] = useState({ width: '', height: '' });
  const [showResolSelection, setShowResolSelection] = useState(false);
  const [selectROIData, setSelectROIData] = useState(false);

  // Filtered lists for dropdowns
  const [filteredBuildings, setFilteredBuildings] = useState(buildingList);
  const [filteredFloorList, setFilteredFloorList] = useState(floorList);
  const [filteredWSList, setFilteredWSList] = useState(wsList);
  const [filteredAlertList, setFilteredAlertList] = useState(allAnalytics);

  const [xPoint, setXPoint] = useState(data?.Roi?.xCoordinates || []);
  const [yPoint, setYPoint] = useState(data?.Roi?.yCoordinates || []);
  const [count, setCount] = useState(data?.Roi ? data.Roi.xCoordinates.length : 0);
  const roiCount = 4;
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(data?.CameraDefaultImage || '');

  // --- FILTERING LOGIC ---

  // On initial load (for Edit mode), pre-filter all lists
  useEffect(() => {
    if (isEditMode && data) {
        const companyId = data.WorkStation?.CompanyId;
        const siteId = data.Floor?.Building?.SiteId;
        const buildingId = data.Floor?.BuildingId;

        if (companyId) {
            setFilteredWSList(wsList.filter(ws => ws.CompanyId === companyId));
            setFilteredAlertList(allAnalytics.filter(a => a.CompanyId === companyId));
        }
        if (siteId) {
            setFilteredBuildings(buildingList.filter(b => b.SiteId === siteId));
        }
        if (buildingId) {
            setFilteredFloorList(floorList.filter(f => f.BuildingId === buildingId));
        }
    }
  }, [isEditMode, data, allAnalytics, siteList, buildingList, floorList, wsList]);


  // When Company changes, filter WS and Analytics lists
  useEffect(() => {
    let companyAnalytics = allAnalytics;
    let companyWs = wsList;
    
    if (camForm.company) {
        companyAnalytics = allAnalytics.filter(a => a.CompanyId === camForm.company);
        companyWs = wsList.filter(ws => ws.CompanyId === camForm.company);
    }
    
    setFilteredAlertList(companyAnalytics);
    setFilteredWSList(companyWs);

    // Filter the *selection* as well
    setAnalyticsConfig(prevConfig => 
        prevConfig.filter(analytic => 
            companyAnalytics.some(a => a.AlertAnalyticsId === analytic.analyticId)
        )
    );
  }, [camForm.company, allAnalytics, wsList]);

  // When Site changes, filter Buildings list
  useEffect(() => {
    if (camForm.site) {
        setFilteredBuildings(buildingList.filter(b => b.SiteId === camForm.site));
    } else {
        setFilteredBuildings(buildingList);
    }
  }, [camForm.site, buildingList]);

  // When Building changes, filter Floors list
  useEffect(() => {
    if (camForm.building) {
        setFilteredFloorList(floorList.filter(f => f.BuildingId === camForm.building));
    } else {
        setFilteredFloorList(floorList);
    }
  }, [camForm.building, floorList]);

  // Handle Site dropdown change
  const handleSiteChange = (siteId) => {
    const site = siteList.find(s => s.SiteId === siteId);
    const newCompanyId = site ? site.CompanyId : '';
    
    setCamForm(prev => ({ 
        ...prev, 
        site: siteId, 
        building: '', 
        floor: '',    
        company: newCompanyId 
    }));
  };

  // Handle Building dropdown change
  const handleBuildingChange = (buildingId) => {
    setCamForm(prev => ({ 
        ...prev, 
        building: buildingId, 
        floor: '' 
    }));
  };

  // --- SUBMIT AND ROI LOGIC ---

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const basePayload = {
        CameraName: camForm.name,
        CameraDescription: camForm.des,
        WorkStationId: camForm.ws,
        Api: camForm.api,
        AnalyticsConfig: analyticsConfig 
    };

    if (isEditMode) {
        // Edit mode: Update only general details and analytics config
        await apiService.put(`camera/${data.CameraId}`, basePayload);
        onClose(true);
        return;
    }

    // Add mode: Verify RTSP and proceed to ROI selection
    try {
        const verifyRes = await apiService.post('verify-rtsp', { url: camForm.rtsp });
        if (verifyRes.isValidUrl) {
            setImgUrl(`data:image/png;base64,${verifyRes.imgUrl}`);
            setResolForm({ width: verifyRes.resolution.width, height: verifyRes.resolution.height });
            setShowResolSelection(true);
        } else {
            alert('Invalid RTSP URL');
        }
    } catch (err) {
        alert('RTSP Verification failed. Please check the URL and network.');
    }
  };

  const showRoi = (e) => {
    e.preventDefault();
    setShowResolSelection(false);
    setSelectROIData(true);
    // ... (rest of showRoi canvas setup and event listener logic) ...
    // Placeholder for brevity: The original logic below needs the full context of the component above.
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctxRef.current = ctx;
      canvas.width = +resolForm.width;
      canvas.height = +resolForm.height;

      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Re-draw existing points if any
          if(xPoint.length > 0) {
              ctx.fillStyle = 'red';
              for(let i=0; i<xPoint.length; i++) {
                ctx.beginPath();
                ctx.arc(xPoint[i], yPoint[i], 5, 0, 2 * Math.PI);
                ctx.fill();
              }
          }
      };

      const handler = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);
        if (count < roiCount) {
          setCount(c => c + 1);
          setXPoint(p => [...p, x]);
          setYPoint(p => [...p, y]);
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      };
      canvas.addEventListener('mousedown', handler);
      return () => canvas.removeEventListener('mousedown', handler);
    }, 500);
  };

  const reset = () => {
    setCount(0);
    setXPoint([]);
    setYPoint([]);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => ctx.drawImage(img, 0, 0);
  };

  const addCamera = async () => {
    try {
      await apiService.post('camera', {
        CameraName: camForm.name,
        CameraDescription: camForm.des,
        RTSPUrl: camForm.rtsp,
        FloorId: camForm.floor,
        WorkStationId: camForm.ws,
        Api: camForm.api,
        Roi: { xCoordinates: xPoint, yCoordinates: yPoint },
        CameraDefaultImage: imgUrl,
        AnalyticsConfig: analyticsConfig 
      });
      onClose(true);
    } catch (err) {
      alert("Error adding camera. Please check all fields.");
    }
  };
  
  const handleAnalyticsConfigChange = (newConfig) => {
      setAnalyticsConfig(newConfig);
  };


  return (
    <div className="CamMan-modal-content">
      <div className="CamMan-dialog-header">
        <h2>{isEditMode ? 'Edit Camera' : 'Add Camera'}</h2>
        <button className="CamMan-close-button" onClick={() => onClose()}>X</button>
      </div>

      {!showResolSelection && !selectROIData && (
        <form onSubmit={onSubmit}>
          <div className="CamMan-form-row">
            {/* Location Fields (Only visible in Add mode) */}
            {!isEditMode && (
              <>
                <div className="CamMan-form-group CamMan-half-width">
                  <label htmlFor="site">Site *</label>
                  <select
                    id="site"
                    value={camForm.site}
                    onChange={e => handleSiteChange(e.target.value)}
                    required
                  >
                    <option value="">Select Site</option>
                    {siteList.map(s => <option key={s.SiteId} value={s.SiteId}>{s.SiteName}</option>)}
                  </select>
                </div>
                <div className="CamMan-form-group CamMan-half-width">
                  <label htmlFor="building">Building *</label>
                  <select
                    id="building"
                    value={camForm.building}
                    onChange={e => handleBuildingChange(e.target.value)}
                    required
                  >
                    <option value="">Select Building</option>
                    {filteredBuildings.map(b => <option key={b.BuildingId} value={b.BuildingId}>{b.BuildingName}</option>)}
                  </select>
                </div>
                <div className="CamMan-form-group CamMan-half-width">
                  <label htmlFor="floor">Floor *</label>
                  <select
                    id="floor"
                    value={camForm.floor}
                    onChange={e => setCamForm(p => ({ ...p, floor: e.target.value }))}
                    required
                  >
                    <option value="">Select Floor</option>
                    {filteredFloorList.map(f => <option key={f.FloorId} value={f.FloorId}>{f.FloorName}</option>)}
                  </select>
                </div>
                <div className="CamMan-form-group CamMan-half-width">
                  <label htmlFor="rtsp">RTSP Url *</label>
                  <input
                    id="rtsp"
                    value={camForm.rtsp}
                    onChange={e => setCamForm(p => ({ ...p, rtsp: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="CamMan-form-group CamMan-half-width">
              <label htmlFor="name">Camera Name *</label>
              <input
                id="name"
                value={camForm.name}
                onChange={e => setCamForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="CamMan-form-group CamMan-half-width">
              <label htmlFor="des">Description *</label>
              <input
                id="des"
                value={camForm.des}
                onChange={e => setCamForm(p => ({ ...p, des: e.target.value }))}
                required
              />
            </div>
            <div className="CamMan-form-group CamMan-half-width">
              <label htmlFor="ws">WorkStation *</label>
              <select
                id="ws"
                value={camForm.ws}
                onChange={e => setCamForm(p => ({ ...p, ws: e.target.value }))}
                required
              >
                <option value="">Select</option>
                {filteredWSList.map(ws => <option key={ws.WorkStationId} value={ws.WorkStationId}>{ws.WorkStationName}</option>)}
              </select>
              <small className="CamMan-help-text">Filtered by Company</small>
            </div>
            <div className="CamMan-form-group CamMan-half-width">
              <label htmlFor="api">Api *</label>
              <input
                id="api"
                value={camForm.api}
                onChange={e => setCamForm(p => ({ ...p, api: e.target.value }))}
                required
              />
            </div>
          </div>
          
          {/* Analytics Selector */}
          <AnalyticsSelector 
            allAnalytics={filteredAlertList}
            value={analyticsConfig}
            onChange={handleAnalyticsConfigChange}
          />

          <div className="CamMan-form-actions">
            <button type="submit" className="CamMan-btn CamMan-btn-primary">
              {isEditMode ? 'Update' : 'Verify RTSP & Continue'}
            </button>
            <button type="button" className="CamMan-btn CamMan-btn-secondary" onClick={() => onClose()}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Resolution Selection Modal Step */}
      {showResolSelection && (
        <form onSubmit={showRoi}>
          {/* ... (Resolution form content - unchanged) ... */}
          <div className="CamMan-form-row">
            <div className="CamMan-form-group CamMan-half-width">
              <label htmlFor="width">Width *</label>
              <input
                id="width"
                type="number"
                value={resolForm.width}
                onChange={e => setResolForm(p => ({ ...p, width: e.target.value }))}
                required
              />
            </div>

            <div className="CamMan-form-group CamMan-half-width">
              <label htmlFor="height">Height *</label>
              <input
                id="height"
                type="number"
                value={resolForm.height}
                onChange={e => setResolForm(p => ({ ...p, height: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="CamMan-form-actions">
            <button type="submit" className="CamMan-btn CamMan-btn-primary">
              Add Resolution & Set ROI
            </button>
            <button type="button" className="CamMan-btn CamMan-btn-secondary" onClick={() => onClose()}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ROI Drawing Modal Step */}
      {selectROIData && (
        <div>
          {/* ... (ROI drawing content - unchanged) ... */}
          <div className="CamMan-heading">
            <h3>Add ROI (Click {roiCount} points)</h3>
          </div>

          <canvas ref={canvasRef} className="CamMan-canvas"></canvas>

          <div className="CamMan-heading CamMan-verify-button">
            X-coordinates of points: {xPoint.toString()}
            <br />
            Y-coordinates of points: {yPoint.toString()}
          </div>

          <div className="CamMan-form-actions">
            <button
              className="CamMan-btn CamMan-btn-primary"
              disabled={count !== roiCount}
              onClick={addCamera}
            >
              Add Camera
            </button>

            <button
              className="CamMan-btn CamMan-btn-secondary"
              disabled={count === 0}
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// === Delete Modal (Unchanged) ===
function DeleteCameraModal({ data, onClose }) {
  const handleDelete = async (e) => {
    e.preventDefault();
    await apiService.delete(`camera/${data.CameraId}`);
    onClose(true);
  };

  return (
    <div className="CamMan-modal-content">
      <div className="CamMan-dialog-header">
        <h2>Delete Camera</h2>
        <button className="CamMan-close-button" onClick={() => onClose()}>X</button>
      </div>

      <form onSubmit={handleDelete}>
        <div className="CamMan-form-group">
          <label htmlFor="name">Are you sure you want to delete this camera?</label>
          <input id="name" value={data.CameraName} disabled />
        </div>

        <div className="CamMan-form-actions">
          <button type="submit" className="CamMan-btn CamMan-btn-primary" style={{ background: '#ff6b6b' }}>
            Delete
          </button>
          <button type="button" className="CamMan-btn CamMan-btn-secondary" onClick={() => onClose()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}