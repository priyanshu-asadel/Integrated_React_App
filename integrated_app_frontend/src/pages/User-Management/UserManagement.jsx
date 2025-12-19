import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { apiService } from '../../services/api';
import './UserManagement.css';

Modal.setAppElement('#root');

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('user');
  const [user, setUser] = useState(null);
  const [modulesToAccess, setModulesToAccess] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('APP_USER') || '{}');
    console.log('RAW user data from localStorage:', userData);
    console.log('All keys in user data:', Object.keys(userData));

    console.log('Alternative property checks:');
    console.log('Role:', userData.Role, userData.role);
    console.log('ComponentToAccess:', userData.ComponentToAccess, userData.componentToAccess, userData.access, userData.modules);
    console.log('Company:', userData.Company);
    console.log('Company Modules:', userData.Company?.Modules, userData.Company?.modules, userData.company?.Modules, userData.company?.modules);

    setUser(userData);

    const companyModules = (
      userData.Company?.Modules ||
      userData.Company?.modules ||
      userData.company?.Modules ||
      userData.company?.modules ||
      userData.modules ||
      ''
    ).split(',').filter(Boolean);

    const userModules = (
      userData.ComponentToAccess ||
      userData.componentToAccess ||
      userData.access ||
      userData.modules ||
      userData.permissions ||
      ''
    ).split(',').filter(Boolean);

    const userRole = userData.Role || userData.role || 'user';

    console.log('Final parsed values:');
    console.log('Company modules:', companyModules);
    console.log('User modules:', userModules);
    console.log('User role:', userRole);

    let accessibleModules = [];
    if (userRole === 'Super Admin' || userRole === 'super_admin' || userRole === 'admin') {
      accessibleModules = userModules.length > 0 ? userModules : ['user', 'company', 'site', 'building', 'floor', 'camera'];
    } else {
      accessibleModules = companyModules.length > 0
        ? companyModules.filter(item => userModules.includes(item))
        : userModules;
    }

    if (accessibleModules.length === 0) {
      accessibleModules = ['user'];
      console.warn('No modules found, using default:', accessibleModules);
    }

    console.log('Final accessible modules:', accessibleModules);
    setModulesToAccess(accessibleModules);
  }, []);

  return (
    <div className="UserMan-dashboard-container">
      <div className="UserMan-main-content">
        <div className="UserMan-header">
          <h1>User Management Settings</h1>
          <div className="UserMan-header-actions">
            <div className="UserMan-refresh-btn">
              <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
            </div>
          </div>
        </div>

        <div className="UserMan-settings-tabs">
          {modulesToAccess.includes('user') && (
            <button
              className={`UserMan-tab-btn ${activeTab === 'user' ? 'UserMan-active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              User Management
            </button>
          )}
        </div>

        <div className="UserMan-tab-content">
          {activeTab === 'user' && <UserManagementTab />}
        </div>
      </div>
    </div>
  );
}

function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [filterCompany, setFilterCompany] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [changePasswordData, setChangePasswordData] = useState(null);

  const modulesList = [
    { Value: 'company', Name: 'Company Management' },
    { Value: 'module', Name: 'Module Name Management' },
    { Value: 'site', Name: 'Site Management' },
    { Value: 'building', Name: 'Building Management' },
    { Value: 'floor', Name: 'Floor Management' },
    { Value: 'camera', Name: 'Camera Management' },
    { Value: 'cameralog', Name: 'Camera Log Management' },
    { Value: 'workstation', Name: 'WorkStation Management' },
    { Value: 'alertanalytics', Name: 'Alert Analytics Management' },
    { Value: 'analytics', Name: 'Analytics Management' },
    { Value: 'user', Name: 'User Management' },
    { Value: 'alert', Name: 'Alert Management' },
    { Value: 'dashboard', Name: 'Dashboard' },
    { Value: 'camerafeed', Name: 'Camera Feed' },
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('APP_USER') || '{}');
    setCurrentUser(userData);
    getCompanyList();
    getUserList();
  }, []);

  const getCompanyList = useCallback(() => {
    apiService.get('get-all-company').then(res => {
      setCompanies(res.data);
    });
  }, []);

  const getUserList = useCallback(() => {
    const offset = (currentPage - 1) * pageSize;
    let url = `user/${offset}/${pageSize}`;

    if (filterCompany) {
      url += `?companyId=${filterCompany}`;
    }

    apiService.get(url).then(res => {
      setTotalPages(Math.ceil(res.data.total / pageSize));
      setUsers(res.data.rows);
    });
  }, [currentPage, filterCompany]);

  useEffect(() => {
    getUserList();
  }, [getUserList]);

  const updatePage = () => {
    const start = (currentPage - 1) * pageSize;
    let url = `user/${start}/${pageSize}`;

    if (filterCompany) {
      url += `?companyId=${filterCompany}`;
    }

    apiService.get(url).then(res => {
      setTotalPages(Math.ceil(res.data.total / pageSize));
      setUsers(res.data.rows);
    });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(c => c + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(c => c - 1);
    }
  };

  const openAdd = () => {
    setEditData(null);
    setAddModal(true);
  };

  const closeAdd = (refresh) => {
    setAddModal(false);
    if (refresh) {
      setCurrentPage(1);
      getUserList();
    }
  };

  const openEdit = (user) => {
    setEditData(user);
    setAddModal(true);
  };

  const openDelete = (user) => setDeleteData(user);
  const closeDelete = (refresh) => {
    setDeleteData(null);
    if (refresh) getUserList();
  };

  const openChangePassword = (user) => setChangePasswordData(user);
  const closeChangePassword = () => setChangePasswordData(null);

  const getModulesName = (modules) => {
    const modulesArray = modules.split(',');
    const moduleNames = modulesArray.map(val => {
      const found = modulesList.find(item => item.Value === val);
      return found ? found.Name : val;
    });
    return moduleNames;
  };

  const hasCompanyAccess = () => {
    if (!currentUser || !currentUser.ComponentToAccess) return false;
    const modulesArray = currentUser.ComponentToAccess.split(',');
    return modulesArray.includes('company');
  };

  const onFilterSubmit = () => {
    setCurrentPage(1);
    getUserList();
  };

  const resetFilter = () => {
    setFilterCompany('');
    setCurrentPage(1);
    getUserList();
  };

  return (
    <div className="UserMan-tab-pane UserMan-active">
      <div className="UserMan-section-header">
        <h2>User</h2>
        <button className="UserMan-btn UserMan-btn-primary" onClick={openAdd}>
          <i className="fas fa-plus"></i> Add User
        </button>
      </div>

      {hasCompanyAccess() && (
        <div className="UserMan-filters-section">
          <div className="UserMan-filter-group">
            <label htmlFor="companyFilter">Company</label>
            <select
              id="companyFilter"
              value={filterCompany}
              onChange={e => setFilterCompany(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.CompanyId} value={company.CompanyId}>
                  {company.CompanyName}
                </option>
              ))}
            </select>
          </div>
          <button className="UserMan-btn UserMan-btn-primary UserMan-apply-filters" onClick={onFilterSubmit}>
            Filter
          </button>
          <button className="UserMan-btn UserMan-btn-secondary UserMan-reset-filters" onClick={resetFilter}>
            Reset
          </button>
        </div>
      )}

      <div className="UserMan-table-container">
        <table className="UserMan-settings-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>User Name</th>
              <th>User Email</th>
              <th>Gender</th>
              <th>Address</th>
              <th>Contact No.</th>
              <th>Role</th>
              <th>Status</th>
              <th>Access to Components</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.UserId}>
                <td>{user.Company?.CompanyName}</td>
                <td>{user.UserName}</td>
                <td>{user.UserEmail}</td>
                <td>{user.Gender}</td>
                <td>{user.Address}</td>
                <td>{user.ContactNo}</td>
                <td>
                  <span className={`UserMan-role-badge UserMan-role-${user.Role}`}>
                    {user.Role}
                  </span>
                </td>
                <td>{user.Status}</td>
                <td>
                  <div className="UserMan-access-tags">
                    {getModulesName(user.ComponentToAccess).map((module, i) => (
                      <span key={i} className="UserMan-access-tag">{module}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <button onClick={() => openEdit(user)} className="UserMan-action-btn UserMan-edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => openDelete(user)} className="UserMan-action-btn UserMan-delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="UserMan-pagination">
        <button
          className="UserMan-btn UserMan-btn-secondary UserMan-prev-page"
          disabled={currentPage === 1}
          onClick={prevPage}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <span className="UserMan-page-info">Page {currentPage} of {totalPages}</span>
        <button
          className="UserMan-btn UserMan-btn-secondary UserMan-next-page"
          disabled={currentPage === totalPages}
          onClick={nextPage}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <Modal
        isOpen={addModal}
        onRequestClose={() => closeAdd()}
        className="UserMan-modal-content"
        overlayClassName="UserMan-modal-overlay"
      >
        <AddUpdateUserModal
          data={editData}
          onClose={closeAdd}
          companies={companies}
          currentUser={currentUser}
          modulesList={modulesList}
          openChangePassword={openChangePassword}
        />
      </Modal>

      <Modal
        isOpen={!!deleteData}
        onRequestClose={() => closeDelete()}
        className="UserMan-modal-content"
        overlayClassName="UserMan-modal-overlay"
      >
        {deleteData && (
          <DeleteUserModal data={deleteData} onClose={closeDelete} />
        )}
      </Modal>

      <Modal
        isOpen={!!changePasswordData}
        onRequestClose={() => closeChangePassword()}
        className="UserMan-modal-content"
        overlayClassName="UserMan-modal-overlay"
      >
        {changePasswordData && (
          <ChangeUserPasswordModal data={changePasswordData} onClose={closeChangePassword} />
        )}
      </Modal>
    </div>
  );
}

function AddUpdateUserModal({ data, onClose, companies, currentUser, modulesList, openChangePassword }) {
  const isEditMode = !!data?.UserId;
  
  // Helper to determine the initial company ID
  const getInitialCompanyId = () => {
    if (isEditMode) return data.CompanyId;
    // If logged in user is not Super Admin, they are locked to their own company
    if (currentUser?.Role !== 'Super Admin') return currentUser.CompanyId;
    return '';
  };

  const [userForm, setUserForm] = useState({
    name: data?.UserName || '',
    email: data?.UserEmail || '',
    gender: data?.Gender || '',
    address: data?.Address || '',
    phone: data?.ContactNo || '',
    role: data?.Role || '',
    status: data?.Status || '',
    access: data?.ComponentToAccess ? data.ComponentToAccess.split(',') : [],
    company: getInitialCompanyId(),
    password: '',
  });

  // State to hold the *filtered* list of modules for the dropdown
  const [filteredModulesList, setFilteredModulesList] = useState([]); 
  const [errors, setErrors] = useState({});

  // Logic to filter modules based on a specific company ID
  const filterModulesForCompany = (companyId) => {
    if (!companyId) {
      setFilteredModulesList([]); // No company selected, no modules available
      return;
    }

    // Find the selected company in the companies list
    const selectedCompanyData = companies.find(c => c.CompanyId === companyId);
    
    if (selectedCompanyData && selectedCompanyData.Modules) {
      // Split the company's modules string into an array
      const companyModules = selectedCompanyData.Modules.split(',');
      
      // Filter the master `modulesList` to include ONLY modules in `companyModules`
      const availableModules = modulesList.filter(m => companyModules.includes(m.Value));
      
      // Map to react-select format
      const selectOptions = availableModules.map(m => ({
        value: m.Value,
        label: m.Name
      }));
      
      setFilteredModulesList(selectOptions);
    } else {
      // Fallback if company has no modules or data missing
      setFilteredModulesList([]); 
    }
  };

  // Initial Load / Edit Mode Setup
  useEffect(() => {
    // If we have a company ID (either from edit mode or logged-in user), filter the modules immediately
    if (userForm.company) {
      filterModulesForCompany(userForm.company);
    } else if (currentUser?.Role !== 'Super Admin' && currentUser?.CompanyId) {
       // Safety check: if user is not super admin, force their company
       filterModulesForCompany(currentUser.CompanyId);
       setUserForm(prev => ({...prev, company: currentUser.CompanyId}));
    }
  }, [userForm.company, companies]); 


  // Handle Company Change (Only for Super Admin)
  const handleCompanyChange = (companyId) => {
    setUserForm(prev => ({ 
        ...prev, 
        company: companyId, 
        access: [] // RESET ACCESS when company changes to avoid invalid selections
    }));
    filterModulesForCompany(companyId);
  };

  const handleAccessChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setUserForm(prev => ({ ...prev, access: selectedValues }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!userForm.name?.trim()) newErrors.name = 'User Name is required.';
    if (!userForm.email?.trim()) newErrors.email = 'User Email is required.';
    if (!userForm.gender) newErrors.gender = 'Gender is required.';
    if (!userForm.address?.trim()) newErrors.address = 'Address is required.';
    if (!userForm.phone?.trim()) newErrors.phone = 'Contact No. is required.';
    if (!userForm.role) newErrors.role = 'Role is required.';
    if (!userForm.status) newErrors.status = 'Status is required.';
    if (userForm.access.length === 0) newErrors.access = 'Component To Access are required.';

    if (!isEditMode) {
      if (!userForm.company) newErrors.company = 'Company Name is required.';
      if (!userForm.password) newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditMode) {
        const body = {
          UserName: userForm.name,
          UserEmail: userForm.email,
          Gender: userForm.gender,
          Address: userForm.address,
          ContactNo: userForm.phone,
          Role: userForm.role,
          Status: userForm.status,
          ComponentToAccess: userForm.access.join(','),
          CompanyId: userForm.company // Ensure company ID is sent if allowed
        };
        await apiService.put(`user/${data.UserId}`, body);
      } else {
        const body = {
          UserName: userForm.name,
          UserEmail: userForm.email,
          CompanyId: userForm.company,
          Password: userForm.password,
          Gender: userForm.gender,
          Address: userForm.address,
          ContactNo: userForm.phone,
          Role: userForm.role,
          Status: userForm.status,
          ComponentToAccess: userForm.access.join(','),
        };
        await apiService.post('user', body);
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <div className="UserMan-modal-content">
      <div className="UserMan-dialog-header">
        <h2>{isEditMode ? 'Edit User' : 'Add User'}</h2>
        <button className="UserMan-close-button" onClick={() => onClose()}>✕</button>
      </div>

      {isEditMode && (
        <button
          onClick={() => openChangePassword(data)}
          className="UserMan-action-btn UserMan-edit"
          style={{ marginBottom: '1rem', padding: '8px 16px' }}
        >
          <i className="fas fa-edit"></i> Change Password
        </button>
      )}

      <form onSubmit={onSubmit}>
        <div className="UserMan-form-row">
          
          {/* Only show Company Dropdown if NOT Edit Mode AND user is Super Admin */}
          {!isEditMode && currentUser?.Role === 'Super Admin' && (
            <div className="UserMan-form-group UserMan-half-width">
              <label htmlFor="company">Company *</label>
              <select
                id="company"
                value={userForm.company}
                onChange={e => handleCompanyChange(e.target.value)}
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.CompanyId} value={company.CompanyId}>
                    {company.CompanyName}
                  </option>
                ))}
              </select>
              {errors.company && <div className="UserMan-error">{errors.company}</div>}
            </div>
          )}

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="name">User Name *</label>
            <input
              id="name"
              value={userForm.name}
              onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && <div className="UserMan-error">{errors.name}</div>}
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="email">User Email *</label>
            <input
              id="email"
              type="email"
              value={userForm.email}
              onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              disabled={isEditMode}
            />
            {errors.email && <div className="UserMan-error">{errors.email}</div>}
          </div>

          {!isEditMode && (
            <div className="UserMan-form-group UserMan-half-width">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                value={userForm.password}
                onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              />
              {errors.password && <div className="UserMan-error">{errors.password}</div>}
            </div>
          )}

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              value={userForm.gender}
              onChange={e => setUserForm(prev => ({ ...prev, gender: e.target.value }))}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <div className="UserMan-error">{errors.gender}</div>}
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="address">Address *</label>
            <input
              id="address"
              value={userForm.address}
              onChange={e => setUserForm(prev => ({ ...prev, address: e.target.value }))}
            />
            {errors.address && <div className="UserMan-error">{errors.address}</div>}
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="phone">Contact No. *</label>
            <input
              id="phone"
              type="tel"
              value={userForm.phone}
              onChange={e => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
            />
            {errors.phone && <div className="UserMan-error">{errors.phone}</div>}
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              value={userForm.role}
              onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">Select Role</option>
              {/* Only Super Admin can create Admins, otherwise just Users */}
              {currentUser?.Role === 'Super Admin' && <option value="admin">Admin</option>}
              <option value="user">User</option>
            </select>
            {errors.role && <div className="UserMan-error">{errors.role}</div>}
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              value={userForm.status}
              onChange={e => setUserForm(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">InActive</option>
            </select>
            {errors.status && <div className="UserMan-error">{errors.status}</div>}
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="access">Component To Access *</label>
            <Select
              id="access"
              isMulti
              // Filter `filteredModulesList` to find currently selected options
              value={filteredModulesList.filter(option => userForm.access.includes(option.value))}
              onChange={handleAccessChange}
              options={filteredModulesList} // Use the filtered list here
              placeholder={userForm.company ? "Select components..." : "Select a company first"}
              isDisabled={!userForm.company} // Disable if no company selected
              styles={{
                control: (base) => ({
                  ...base,
                  background: '#3a3a3a',
                  borderColor: '#555',
                  color: '#fff',
                  padding: '2px',
                }),
                menu: (base) => ({
                  ...base,
                  background: '#2a2a2a',
                  color: '#fff',
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isFocused ? '#4c77af' : '#2a2a2a',
                  color: '#fff',
                }),
                multiValue: (base) => ({
                  ...base,
                  background: '#4c77af',
                  color: '#fff',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#fff',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#fff',
                  ':hover': {
                    background: '#ff6666',
                    color: '#fff',
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#bbb',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#fff',
                }),
              }}
            />
            {errors.access && <div className="UserMan-error">{errors.access}</div>}
          </div>
        </div>

        <div className="UserMan-form-actions">
          <button type="submit" className="UserMan-btn UserMan-btn-primary">
            {isEditMode ? 'Update' : 'Create'}
          </button>
          <button type="button" className="UserMan-btn UserMan-btn-secondary" onClick={() => onClose()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteUserModal({ data, onClose }) {
  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await apiService.delete(`user/${data.UserId}`);
      onClose(true);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="UserMan-modal-content">
      <div className="UserMan-dialog-header">
        <h2>Delete User</h2>
        <button className="UserMan-close-button" onClick={() => onClose()}>✕</button>
      </div>

      <form onSubmit={handleDelete}>
        <div className="UserMan-form-group">
          <label htmlFor="id">User Id *</label>
          <input id="id" value={data.UserId} disabled />
        </div>

        <div className="UserMan-form-group">
          <label htmlFor="name">User Name *</label>
          <input id="name" value={data.UserName} disabled />
        </div>

        <div className="UserMan-form-actions">
          <button type="submit" className="UserMan-btn UserMan-btn-primary">
            Delete
          </button>
          <button type="button" className="UserMan-btn UserMan-btn-secondary" onClick={() => onClose()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ChangeUserPasswordModal({ data, onClose }) {
  const [userForm, setUserForm] = useState({
    name: data?.UserName || '',
    email: data?.UserEmail || '',
    password: '',
    rpassword: '',
    ...(data.Role === 'user' && {
      oldpassword: '',
    }),
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!userForm.password) newErrors.password = 'Password is required.';
    if (!userForm.rpassword) newErrors.rpassword = 'ReType Password is required.';
    if (userForm.password !== userForm.rpassword) {
      newErrors.rpassword = 'Entered Password is not same';
    }

    if (data.Role === 'user' && !userForm.oldpassword) {
      newErrors.oldpassword = 'Old Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (data.Role !== 'user') {
        const body = {
          NewPassword: userForm.password,
        };
        await apiService.put(`user/update-password/${data.UserId}`, body);
      } else {
        const body = {
          OldPassword: userForm.oldpassword,
          NewPassword: userForm.password,
        };
        await apiService.put(`user/change-password/${data.UserId}`, body);
      }

      onClose(true);
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  return (
    <div className="UserMan-modal-content">
      <div className="UserMan-dialog-header">
        <h2>Change User Password</h2>
        <button className="UserMan-close-button" onClick={() => onClose()}>✕</button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="UserMan-form-row">
          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="name">User Name *</label>
            <input id="name" value={userForm.name} disabled />
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="email">User Email *</label>
            <input id="email" type="email" value={userForm.email} disabled />
          </div>

          {data.Role === 'user' && (
            <div className="UserMan-form-group UserMan-half-width">
              <label htmlFor="oldpassword">Old Password *</label>
              <input
                id="oldpassword"
                type="password"
                value={userForm.oldpassword}
                onChange={e => setUserForm(prev => ({ ...prev, oldpassword: e.target.value }))}
              />
              {errors.oldpassword && <div className="UserMan-error">{errors.oldpassword}</div>}
            </div>
          )}

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              value={userForm.password}
              onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
            />
            {errors.password && <div className="UserMan-error">{errors.password}</div>}
          </div>

          <div className="UserMan-form-group UserMan-half-width">
            <label htmlFor="rpassword">ReType Password *</label>
            <input
              id="rpassword"
              type="password"
              value={userForm.rpassword}
              onChange={e => setUserForm(prev => ({ ...prev, rpassword: e.target.value }))}
            />
            {errors.rpassword && <div className="UserMan-error">{errors.rpassword}</div>}
          </div>
        </div>

        <div className="UserMan-form-actions">
          <button type="submit" className="UserMan-btn UserMan-btn-primary">
            Change
          </button>
          <button type="button" className="UserMan-btn UserMan-btn-secondary" onClick={() => onClose()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}