import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSidebar } from '../../App';
import './SideBar.css';

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarShrunk, setIsSidebarShrunk } = useSidebar();
  const [modulesToAccess, setModulesToAccess] = useState([]);
  const [activeItem, setActiveItem] = useState('');
  const [user, setUser] = useState(null);
  const imageLoadedRef = useRef(false);

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('APP_USER');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const logout = () => {
    console.log('Logged out');
    localStorage.removeItem('APP_USER'); // Clear user data
    localStorage.removeItem('JWT_TOKEN');
  };

  useEffect(() => {
    // Update active item based on current path
    const path = location.pathname;
    console.log('Current path:', path); // Debug log
    
    // Extract the main route segment
    const routeSegment = path.split('/')[1];
    setActiveItem(routeSegment || 'dashboard');
  }, [location]);

  useEffect(() => {
    if (user) {
      const companyModules = user.Company?.Modules?.split(',') || [];
      const userModules = user.ComponentToAccess?.split(',') || [];
      if (user.Role === 'Super Admin') {
        setModulesToAccess(userModules);
      } else {
        setModulesToAccess(companyModules.filter((item) => userModules.includes(item)));
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const toggleSidebar = () => {
    setIsSidebarShrunk(!isSidebarShrunk);
  };

  // Handle image load success
  const handleImageLoad = () => {
    imageLoadedRef.current = true;
  };

  // Handle image load error – only once
  const handleImageError = (e) => {
    if (imageLoadedRef.current) return; // Prevent re-trigger
    imageLoadedRef.current = true;
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA0NCA0NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIiIGN5PSIyMiIgcj0iMjIiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTIyIDE2QzE5Ljc5IDE2IDE4IDE3Ljc5IDE4IDIwQzE4IDIyLjIxIDE5Ljc5IDI0IDIyIDI0QzI0LjIxIDI0IDI2IDIyLjIxIDI2IDIwQzI2IDE3Ljc5IDI0LjIxIDE2IDIyIDE2Wk0yMiAyNkMxOC42NyAyNiAxMiAyNy4zMyAxMiAzMEgzMkMzMiAyNy4zMyAyNS4zMyAyNiAyMiAyNloiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+";
  };

  // Return correct image source
  const getProfileImageSrc = () => {
    if (!user || !user.UserPic || user.UserPic === 'NA') {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA0NCA0NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIiIGN5PSIyMiIgcj0iMjIiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTIyIDE2QzE5Ljc5IDE2IDE4IDE3Ljc5IDE4IDIwQzE4IDIyLjIxIDE5Ljc5IDI0IDIyIDI0QzI0LjIxIDI0IDI2IDIyLjIxIDI2IDIwQzI2IDE3Ljc5IDI0LjIxIDE2IDIyIDE2Wk0yMiAyNkMxOC42NyAyNiAxMiAyNy4zMyAxMiAzMEgzMkMzMiAyNy4zMyAyNS4zMyAyNiAyMiAyNloiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+";
    }
    return user.UserPic;
  };

  const isHaveAccess = (module) => {
    return module.some((m) => modulesToAccess.includes(m));
  };

  const isActive = (path) => {
    return activeItem === path;
  };

  console.log('Active item:', activeItem); // Debug log

  return (
    <div className={`sidebar ${isSidebarShrunk ? 'shrunk' : ''}`}>
      <div className="logo">
        <h2>
          <i className="fas fa-shield-alt"></i>
          {!isSidebarShrunk && <span className="logo-text">Security Dashboard</span>}
        </h2>
      </div>

      <ul className="menu">
        {modulesToAccess.includes('dashboard') && (
          <li className={isActive('dashboard') ? 'active' : ''}>
            <Link to="/dashboard">
              <i className="fas fa-tachometer-alt"></i>
              {!isSidebarShrunk && <span>Dashboard</span>}
            </Link>
          </li>
        )}

        {modulesToAccess.includes('alert') && (
          <li className={isActive('alert') ? 'active' : ''}>
            <Link to="/alert">
              <i className="fas fa-bell"></i>
              {!isSidebarShrunk && <span>Alerts</span>}
            </Link>
          </li>
        )}

        {modulesToAccess.includes('camerafeed') && (
          <li className={isActive('camera') ? 'active' : ''}>
            <Link to="/camera">
              <i className="fas fa-video"></i>
              {!isSidebarShrunk && <span>Cameras</span>}
            </Link>
          </li>
        )}

        {modulesToAccess.includes('analytics') && (
          <li className={isActive('analytics') ? 'active' : ''}>
            <Link to="/analytics">
              <i className="fas fa-chart-bar"></i>
              {!isSidebarShrunk && <span>Analytics</span>}
            </Link>
          </li>
        )}

        {!isSidebarShrunk && <li className="menu-section">Management</li>}

        {isHaveAccess(['company', 'module']) && (
          <li className={isActive('company-settings') ? 'active' : ''}>
            <Link to="/company-settings">
              <i className="fas fa-building"></i>
              {!isSidebarShrunk && <span>Company</span>}
            </Link>
          </li>
        )}

        {isHaveAccess(['site', 'building', 'floor']) && (
          <li className={isActive('area-settings') ? 'active' : ''}>
            <Link to="/area-settings">
              <i className="fas fa-map-marked-alt"></i>
              {!isSidebarShrunk && <span>Area</span>}
            </Link>
          </li>
        )}

        {isHaveAccess(['camera', 'cameralog', 'workstation', 'alertanalytics']) && (
          <li className={isActive('camera-settings') ? 'active' : ''}>
            <Link to="/camera-settings">
              <i className="fas fa-camera"></i>
              {!isSidebarShrunk && <span>Camera</span>}
            </Link>
          </li>
        )}

        {isHaveAccess(['user']) && (
          <li className={isActive('user-settings') ? 'active' : ''}>
            <Link to="/user-settings">
              <i className="fas fa-users"></i>
              {!isSidebarShrunk && <span>Users</span>}
            </Link>
          </li>
        )}
      </ul>

      {user && (
        <div className="user-profile">
          <img
            src={getProfileImageSrc()}
            alt={user.UserName || 'User'}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {!isSidebarShrunk && (
            <div className="user-info">
              <span className="username">{user.UserName || 'User'}</span>
              <span className="role">{user.Role || 'Unknown Role'}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="logout"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      )}

      <button
        className="shrink-icon"
        onClick={toggleSidebar}
        title={isSidebarShrunk ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <i className={`fas fa-chevron-${isSidebarShrunk ? 'right' : 'left'}`}></i>
      </button>
    </div>
  );
};

export default SideBar;