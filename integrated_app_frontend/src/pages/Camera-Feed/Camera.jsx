import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth';
import { apiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Camera.css';

const Cameras = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [camForm, setCamForm] = useState({
    site: '',
    building: '',
    floor: '',
    status: 'true,false',
    cam: 'all',
  });
  const [buildingList, setBuildingList] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [floorList, setFloorList] = useState([]);
  const [filteredFloorList, setFilteredFloorList] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [cameraList, setCameraList] = useState([]);
  const [filteredCameraList, setFilteredCameraList] = useState([]);
  const [floorFilteredCameraList, setFloorFilteredCameraList] = useState([]);
  const cameraServerUrl = process.env.REACT_APP_CAMERA_SERVER;

  useEffect(() => {
    if (user) {
      if (user.Role !== 'Super Admin') {
        setCompanyId(user.CompanyId);
      }
      getAllSite();
      getAllBuilding();
      getAllFloors();
      getAllCameras();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCamForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'site') {
      if (value) {
        const newFilteredBuildings = buildingList.filter(
          (building) => building.SiteId === value
        );
        setFilteredBuildings(newFilteredBuildings);

        const site = siteList.find((site) => site.SiteId === value);
        if (site) {
          setCompanyId(site.CompanyId);
        }
      } else {
        setFilteredBuildings([...buildingList]);
      }
      setCamForm((prev) => ({ ...prev, building: '', cam: 'all' }));
    }

    if (name === 'building') {
      if (value) {
        const newFilteredFloorList = floorList.filter(
          (floor) => floor.BuildingId === value
        );
        setFilteredFloorList(newFilteredFloorList);
      } else {
        setFilteredFloorList([...floorList]);
      }
      setCamForm((prev) => ({ ...prev, floor: '', cam: 'all' }));
    }

    if (name === 'floor') {
      if (value) {
        const newFloorFilteredCameraList = cameraList.filter(
          (cam) => cam.FloorId === value
        );
        setFloorFilteredCameraList(newFloorFilteredCameraList);
      } else {
        setFloorFilteredCameraList([...cameraList]);
      }
      setCamForm((prev) => ({ ...prev, cam: 'all' }));
    }
  };

  const handleCamChange = (e) => {
    const { value } = e.target;
    setCamForm((prev) => ({ ...prev, cam: value }));
  };

  const getAllSite = async () => {
    try {
      const res = await apiService.get('get-all-site');
      let sites = res.data;
      if (companyId) {
        sites = sites.filter((site) => site.CompanyId === companyId);
      }
      setSiteList(sites);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const getAllBuilding = async () => {
    try {
      const res = await apiService.get('get-all-building');
      setBuildingList(res.data);
      setFilteredBuildings(res.data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const getAllFloors = async () => {
    try {
      const res = await apiService.get('get-all-floor');
      setFloorList(res.data);
      setFilteredFloorList(res.data);
    } catch (error) {
      console.error('Error fetching floors:', error);
    }
  };

  const getAllCameras = async () => {
    try {
      const res = await apiService.get('all-cameras');
      setCameraList(res.data);
      setFilteredCameraList(res.data);
      setFloorFilteredCameraList(res.data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const onSubmit = () => {
    const { site, building, floor, status, cam } = camForm;
    let baseCameraList = [...cameraList];

    if (site) {
      baseCameraList = baseCameraList.filter((cam) => {
        const floor = floorList.find((f) => f.FloorId === cam.FloorId);
        if (floor) {
          const building = buildingList.find(
            (b) => b.BuildingId === floor.BuildingId
          );
          return building && building.SiteId === site;
        }
        return false;
      });
    }

    if (building) {
      baseCameraList = baseCameraList.filter((cam) => {
        const floor = floorList.find((f) => f.FloorId === cam.FloorId);
        return floor && floor.BuildingId === building;
      });
    }

    if (floor) {
      baseCameraList = baseCameraList.filter((cam) => cam.FloorId === floor);
    }

    if (cam && cam !== 'all') {
      baseCameraList = baseCameraList.filter((c) => c.CameraId === cam);
    }

    if (status && status !== 'true,false') {
      baseCameraList = baseCameraList.filter((cam) => cam.Status === status);
    }

    setFilteredCameraList(baseCameraList);
  };

  const reset = () => {
    setCamForm({
      site: '',
      building: '',
      floor: '',
      status: 'true,false',
      cam: 'all',
    });
    setFilteredBuildings([...buildingList]);
    setFilteredFloorList([...floorList]);
    setFloorFilteredCameraList([...cameraList]);
    setFilteredCameraList([...cameraList]);
  };

  return (
    <div className="camera-dashboard-container">
      <div className="camera-main-content">
        <div className="camera-header-css">
          <h1>Camera Streams</h1>
          <div className="camera-header-actions">
            <div className="camera-refresh-btn">
              <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
            </div>
          </div>
        </div>
        <form>
          <div className="camera-filters-section">
            <div className="camera-filter-row">
              <div className="camera-filter-group">
                <label htmlFor="regionFilter">Site</label>
                <select
                  id="regionFilter"
                  name="site"
                  value={camForm.site}
                  onChange={handleInputChange}
                >
                  <option value="">All Sites</option>
                  {siteList.map((site) => (
                    <option key={site.SiteId} value={site.SiteId}>
                      {site.SiteName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="camera-filter-group">
                <label htmlFor="subregionFilter">Building</label>
                <select
                  id="subregionFilter"
                  name="building"
                  value={camForm.building}
                  onChange={handleInputChange}
                >
                  <option value="">All Buildings</option>
                  {filteredBuildings.map((building) => (
                    <option key={building.BuildingId} value={building.BuildingId}>
                      {building.BuildingName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="camera-filter-group">
                <label htmlFor="floorFilter">Floor</label>
                <select
                  id="floorFilter"
                  name="floor"
                  value={camForm.floor}
                  onChange={handleInputChange}
                >
                  <option value="">All Floors</option>
                  {filteredFloorList.map((floor) => (
                    <option key={floor.FloorId} value={floor.FloorId}>
                      {floor.FloorName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="camera-filter-group">
                <label htmlFor="statusFilter">Status</label>
                <select
                  id="statusFilter"
                  name="status"
                  value={camForm.status}
                  onChange={handleInputChange}
                >
                  <option value="true,false">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="camera-filter-group">
                <label htmlFor="camFilter">Camera</label>
                <select
                  id="camFilter"
                  name="cam"
                  value={camForm.cam}
                  onChange={handleCamChange}
                  className="camera-dropdown"
                >
                  <option value="all">All Cameras</option>
                  {floorFilteredCameraList.map((cam) => (
                    <option key={cam.CameraId} value={cam.CameraId}>
                      {cam.CameraName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="camera-filter-buttons-row">
              <button
                type="button"
                className="btn camera-btn-primary camera-apply-filters"
                onClick={onSubmit}
              >
                Search
              </button>
              <button
                type="button"
                className="btn camera-btn-secondary camera-reset-filters"
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
        <div className="camera-section">
          <div className="camera-grid">
            {filteredCameraList.map((cam) => (
              <div className="camera-card" key={cam.CameraId}>
                <div className="camera-header">
                  <h3>{cam.CameraName}</h3>
                  <div
                    className={`camera-status ${
                      cam.Status === 'true' ? 'active' : 'inactive'
                    }`}
                  ></div>
                </div>
                <div className="camera-feed">
                  <img
                    src={
                      cam
                        ? `${cameraServerUrl}${cam.RTSPUrl}`
                        : '/assets/images/face.jpg'
                    }
                    alt="Camera Feed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cameras;