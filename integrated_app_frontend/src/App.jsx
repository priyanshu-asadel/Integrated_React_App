// App.js
import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import { CommonProvider } from './services/common';
import SignIn from './pages/SignIn/SignIn';
import Dashboard from './pages/Dashboard/Dashboard';
import SideBar from './pages/SideBar/SideBar';
import Alerts from './pages/Alerts/Alerts';
import './App.css';
import Cameras from './pages/Camera-Feed/Camera';
import Analytics from './pages/Analytics/Analytics';
import CompanyManagement from './pages/Company-Management/CompanyManagement';
import AreaManagement from './pages/Area-Management/AreaManagement';
import CameraManagement from './pages/Camera-Managment/CameraManagement';
import UserManagement from './pages/User-Management/UserManagement';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const ProtectedLayout = () => {
  const [isSidebarShrunk, setIsSidebarShrunk] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarShrunk, setIsSidebarShrunk }}>
      <div className="wrapper">
        <SideBar />
        <div className={`content ${isSidebarShrunk ? 'sidebarShrink' : ''}`}>
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

function App() {
  return (
    <CommonProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/sign-in" replace />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/alert" element={<Alerts />} />
              <Route path="/camera" element={<Cameras />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/company-settings" element={<CompanyManagement />} />
              <Route path="/area-settings" element={<AreaManagement />} />
              <Route path="/camera-settings" element={<CameraManagement />} />
              <Route path="/user-settings" element={<UserManagement />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </CommonProvider>
  );
}

export default App;