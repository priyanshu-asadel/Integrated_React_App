import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../services/auth';
import { apiService } from '../../services/api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './CompanyManagement.css';

const CompanyManagement = () => {
  const { getUser } = useAuth();
  const user = useMemo(() => getUser(), []);
  const [activeTab, setActiveTab] = useState('company');
  const [modulesToAccess, setModulesToAccess] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [modules, setModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAddUpdateCompany, setOpenAddUpdateCompany] = useState(false);
  const [openDeleteCompany, setOpenDeleteCompany] = useState(false);
  const [openAddUpdateModule, setOpenAddUpdateModule] = useState(false);
  const [openDeleteModule, setOpenDeleteModule] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [companyList, setCompanyList] = useState([]);
  const pageSize = 10;

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
    const companyModules = user.Company?.Modules?.split(',') || [];
    const userModules = user.ComponentToAccess?.split(',') || [];
    const accessModules = user.Role === 'Super Admin' ? userModules : companyModules.filter(item => userModules.includes(item));
    setModulesToAccess(accessModules);
    if (!activeTab || !accessModules.includes(activeTab)) {
      setActiveTab(accessModules[0] || 'company');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'company' && modulesToAccess.includes('company')) {
      getCompanyList();
    } else if (activeTab === 'module' && modulesToAccess.includes('module')) {
      getModuleList();
    }
  }, [activeTab, currentPage, modulesToAccess]);

  useEffect(() => {
    getAllCompanies();
  }, []);

  const getCompanyList = async () => {
    const offset = (currentPage - 1) * pageSize;
    try {
      const res = await apiService.get(`company/${offset}/${pageSize}`);
      setCompanies(res.data.rows || []);
      setTotalPages(Math.ceil(res.data.total / pageSize) || 1);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
      setTotalPages(1);
    }
  };

  const getModuleList = async () => {
    const offset = (currentPage - 1) * pageSize;
    try {
      const res = await apiService.get(`module-name/${offset}/${pageSize}`);
      setModules(res.data.rows || []);
      setTotalPages(Math.ceil(res.data.total / pageSize) || 1);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
      setTotalPages(1);
    }
  };

  const getAllCompanies = async () => {
    try {
      const res = await apiService.get('get-all-company');
      setCompanyList(res.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanyList([]);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getModulesName = (modules) => {
    const modulesArray = modules?.split(',') || [];
    return modulesArray.map(val => {
      const found = modulesList.find(item => item.Value === val);
      return found ? found.Name : val;
    });
  };

  const AddUpdateCompany = ({ open, onClose, company }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
      defaultValues: {
        name: company?.CompanyName || '',
        email: company?.CompanyEmail || '',
        phone: company?.PhoneNumber || '',
        modules: company?.Modules?.split(',') || [],
        password: '',
      },
    });

    const onSubmit = async (data) => {
      const body = {
        CompanyName: data.name,
        CompanyEmail: data.email,
        PhoneNumber: data.phone,
        Modules: data.modules.join(','),
        ...(company ? {} : { Password: data.password }),
      };
      try {
        if (company) {
          await apiService.put(`company/${company.CompanyId}`, body);
        } else {
          await apiService.post('company', body);
        }
        setCurrentPage(1);
        getCompanyList();
        onClose();
        reset();
      } catch (error) {
        console.error('Error saving company:', error);
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        className="company-custom-dialog-container"
        PaperProps={{ style: { minWidth: '600px', backgroundColor: '#2a2a2a' } }}
      >
        <div className="company-dialog-header">
          <DialogTitle>{company ? 'Edit Company' : 'Add Company'}</DialogTitle>
          <IconButton className="company-close-button" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent>
          <div className="company-form-container">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="company-form-group">
                <label htmlFor="name">Company Name *</label>
                <TextField
                  {...register('name', { required: 'Company Name is required' })}
                  fullWidth
                  placeholder="Enter Company Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-group">
                <label htmlFor="email">Company Email *</label>
                <TextField
                  {...register('email', {
                    required: 'Valid Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  type="email"
                  fullWidth
                  placeholder="Enter Company Email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-group">
                <label htmlFor="phone">Company Phone *</label>
                <TextField
                  {...register('phone', { required: 'Valid Phone Number is required' })}
                  type="tel"
                  fullWidth
                  placeholder="Enter Company Phone"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-group">
                <label htmlFor="modules">Modules *</label>
                <FormControl fullWidth error={!!errors.modules}>
                  <InputLabel className="company-input-label">Select Modules</InputLabel>
                  <Select
                    {...register('modules', { required: 'Modules are required' })}
                    multiple
                    defaultValue={company?.Modules?.split(',') || []}
                    className="company-input"
                  >
                    {modulesList.map(module => (
                      <MenuItem key={module.Value} value={module.Value} className="company-menu-item">
                        {module.Name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.modules && <div className="company-error">{errors.modules.message}</div>}
                </FormControl>
              </div>
              {!company && (
                <div className="company-form-group">
                  <label htmlFor="password">Company Password *</label>
                  <TextField
                    {...register('password', { required: 'Valid Password is required' })}
                    type="password"
                    fullWidth
                    placeholder="Enter Company Password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{ className: 'company-input' }}
                  />
                </div>
              )}
              <div className="company-form-actions">
                <Button type="submit" className="company-btn company-btn-primary" disabled={Object.keys(errors).length > 0}>
                  {company ? 'Update' : 'Create'}
                </Button>
                <Button className="company-btn company-btn-secondary" onClick={onClose}>Cancel</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const DeleteCompany = ({ open, onClose, company }) => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        id: company?.CompanyId || '',
        name: company?.CompanyName || '',
      },
    });

    const onSubmit = async () => {
      try {
        await apiService.delete(`company/${company.CompanyId}`);
        getCompanyList();
        onClose();
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        className="company-custom-dialog-container"
        PaperProps={{ style: { minWidth: '600px', backgroundColor: '#2a2a2a' } }}
      >
        <div className="company-dialog-header">
          <DialogTitle>Delete Company</DialogTitle>
          <IconButton className="company-close-button" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent>
          <div className="company-form-container">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="company-form-group">
                <label htmlFor="id">Company Id *</label>
                <TextField
                  {...register('id')}
                  disabled
                  fullWidth
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-group">
                <label htmlFor="name">Company Name *</label>
                <TextField
                  {...register('name')}
                  disabled
                  fullWidth
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-actions">
                <Button type="submit" className="company-btn company-btn-primary">Delete</Button>
                <Button className="company-btn company-btn-secondary" onClick={onClose}>Cancel</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const AddUpdateModuleName = ({ open, onClose, module }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
      defaultValues: {
        site: module?.SiteName || '',
        building: module?.BuildingName || '',
        floor: module?.FloorName || '',
        company: module?.CompanyId || '',
      },
    });

    const onSubmit = async (data) => {
      const body = {
        SiteName: data.site,
        BuildingName: data.building,
        FloorName: data.floor,
        ...(module ? {} : { CompanyId: data.company }),
      };
      try {
        if (module) {
          await apiService.put(`module-name/${module.ModulesNameId}`, body);
        } else {
          await apiService.post('module-name', body);
        }
        setCurrentPage(1);
        getModuleList();
        onClose();
        reset();
      } catch (error) {
        console.error('Error saving module:', error);
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        className="company-custom-dialog-container"
        PaperProps={{ style: { minWidth: '600px', backgroundColor: '#2a2a2a' } }}
      >
        <div className="company-dialog-header">
          <DialogTitle>{module ? 'Edit Module Name' : 'Add Module Name'}</DialogTitle>
          <IconButton className="company-close-button" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent>
          <div className="company-form-container">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="company-form-group">
                <label htmlFor="site">Site Name *</label>
                <TextField
                  {...register('site', { required: 'Site Name is required' })}
                  fullWidth
                  placeholder="Enter Site Name"
                  error={!!errors.site}
                  helperText={errors.site?.message}
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-group">
                <label htmlFor="building">Building Name *</label>
                <TextField
                  {...register('building', { required: 'Building Name is required' })}
                  fullWidth
                  placeholder="Enter Building Name"
                  error={!!errors.building}
                  helperText={errors.building?.message}
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-group">
                <label htmlFor="floor">Floor Name *</label>
                <TextField
                  {...register('floor', { required: 'Floor Name is required' })}
                  fullWidth
                  placeholder="Enter Floor Name"
                  error={!!errors.floor}
                  helperText={errors.floor?.message}
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              {!module && (
                <div className="company-form-group">
                  <label htmlFor="company">Company *</label>
                  <FormControl fullWidth error={!!errors.company}>
                    <InputLabel className="company-input-label">Select Company</InputLabel>
                    <Select
                      {...register('company', { required: 'Company is required' })}
                      defaultValue=""
                      className="company-input"
                    >
                      {companyList.map(company => (
                        <MenuItem key={company.CompanyId} value={company.CompanyId} className="company-menu-item">
                          {company.CompanyName}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.company && <div className="company-error">{errors.company.message}</div>}
                  </FormControl>
                </div>
              )}
              <div className="company-form-actions">
                <Button type="submit" className="company-btn company-btn-primary" disabled={Object.keys(errors).length > 0}>
                  {module ? 'Update' : 'Create'}
                </Button>
                <Button className="company-btn company-btn-secondary" onClick={onClose}>Cancel</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const DeleteModuleName = ({ open, onClose, module }) => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        id: module?.ModulesNameId || '',
        name: module?.Company?.CompanyName || '',
      },
    });

    const onSubmit = async () => {
      try {
        await apiService.delete(`module-name/${module.ModulesNameId}`);
        getModuleList();
        onClose();
      } catch (error) {
        console.error('Error deleting module:', error);
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        className="company-custom-dialog-container"
        PaperProps={{ style: { minWidth: '600px', backgroundColor: '#2a2a2a' } }}
      >
        <div className="company-dialog-header">
          <DialogTitle>Delete Module Name</DialogTitle>
          <IconButton className="company-close-button" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent>
          <div className="company-form-container">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="company-form-group">
                <label htmlFor="id">Module Name Id *</label>
                <TextField
                  {...register('id')}
                  disabled
                  fullWidth
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-group">
                <label htmlFor="name">Company Name *</label>
                <TextField
                  {...register('name')}
                  disabled
                  fullWidth
                  InputProps={{ className: 'company-input' }}
                />
              </div>
              <div className="company-form-actions">
                <Button type="submit" className="company-btn company-btn-primary">Delete</Button>
                <Button className="company-btn company-btn-secondary" onClick={onClose}>Cancel</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="company-dashboard-container">
      <div className="company-main-content">
        <div className="company-header">
          <h1 id="settingsTitle">Company Management Settings</h1>
          <div className="company-header-actions">
            <div className="company-refresh-btn">
              <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
            </div>
          </div>
        </div>

        <div className="company-settings-tabs">
          {modulesToAccess.includes('company') && (
            <button
              className={`company-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              Company Management
            </button>
          )}
          {modulesToAccess.includes('module') && (
            <button
              className={`company-tab-btn ${activeTab === 'module' ? 'active' : ''}`}
              onClick={() => setActiveTab('module')}
            >
              Modules Name Management
            </button>
          )}
        </div>

        <div className="company-tab-content">
          {activeTab === 'company' && (
            <div className="company-tab-pane active">
              <div className="company-section-header">
                <h2>Companies</h2>
                <button
                  className="company-btn company-btn-primary"
                  onClick={() => {
                    setSelectedCompany(null);
                    setOpenAddUpdateCompany(true);
                  }}
                  style={{ backgroundColor: '#03a9f4' }}
                >
                  <i className="fas fa-plus"></i> Add Company
                </button>
              </div>
              <div className="company-table-container">
                <table className="company-settings-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Access to Modules</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => (
                      <tr key={company.CompanyId}>
                        <td>{company.CompanyName}</td>
                        <td>{company.CompanyEmail}</td>
                        <td>{company.PhoneNumber}</td>
                        <td>
                          <div className="company-access-tags">
                            {getModulesName(company.Modules).map((module, index) => (
                              <span key={index} className="company-access-tag">{module}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button
                            className="company-action-btn company-edit"
                            onClick={() => {
                              setSelectedCompany(company);
                              setOpenAddUpdateCompany(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="company-action-btn company-delete"
                            onClick={() => {
                              setSelectedCompany(company);
                              setOpenDeleteCompany(true);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="company-pagination">
                <button
                  className="company-btn company-btn-secondary company-prev-page"
                  disabled={currentPage === 1}
                  onClick={prevPage}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="company-page-info">Page {currentPage} of {totalPages}</span>
                <button
                  className="company-btn company-btn-secondary company-next-page"
                  disabled={currentPage === totalPages}
                  onClick={nextPage}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
          {activeTab === 'module' && (
            <div className="company-tab-pane active">
              <div className="company-section-header">
                <h2>Modules Name</h2>
                <button
                  className="company-btn company-btn-primary"
                  onClick={() => {
                    setSelectedModule(null);
                    setOpenAddUpdateModule(true);
                  }}
                  style={{ backgroundColor: '#03a9f4' }}
                >
                  <i className="fas fa-plus"></i> Add Modules Name
                </button>
              </div>
              <div className="company-table-container">
                <table className="company-settings-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Site Name</th>
                      <th>Building Name</th>
                      <th>Floor Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(module => (
                      <tr key={module.ModulesNameId}>
                        <td>{module?.Company?.CompanyName || 'N/A'}</td>
                        <td>{module.SiteName}</td>
                        <td>{module.BuildingName}</td>
                        <td>{module.FloorName}</td>
                        <td>
                          <button
                            className="company-action-btn company-edit"
                            onClick={() => {
                              setSelectedModule(module);
                              setOpenAddUpdateModule(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="company-action-btn company-delete"
                            onClick={() => {
                              setSelectedModule(module);
                              setOpenDeleteModule(true);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="company-pagination">
                <button
                  className="company-btn company-btn-secondary company-prev-page"
                  disabled={currentPage === 1}
                  onClick={prevPage}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="company-page-info">Page {currentPage} of {totalPages}</span>
                <button
                  className="company-btn company-btn-secondary company-next-page"
                  disabled={currentPage === totalPages}
                  onClick={nextPage}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
        <AddUpdateCompany
          open={openAddUpdateCompany}
          onClose={() => setOpenAddUpdateCompany(false)}
          company={selectedCompany}
        />
        <DeleteCompany
          open={openDeleteCompany}
          onClose={() => setOpenDeleteCompany(false)}
          company={selectedCompany}
        />
        <AddUpdateModuleName
          open={openAddUpdateModule}
          onClose={() => setOpenAddUpdateModule(false)}
          module={selectedModule}
        />
        <DeleteModuleName
          open={openDeleteModule}
          onClose={() => setOpenDeleteModule(false)}
          module={selectedModule}
        />
      </div>
    </div>
  );
};

export default CompanyManagement;