import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../services/auth';
import { apiService } from '../../services/api';
import AddEditSiteModal from './modals/AddEditSiteModal';
import AddEditBuildingModal from './modals/AddEditBuildingModal';
import AddEditFloorModal from './modals/AddEditFloorModal';
import DeleteSiteModal from './modals/DeleteSiteModal';
import DeleteBuildingModal from './modals/DeleteBuildingModal';
import DeleteFloorModal from './modals/DeleteFloorModal';
import './AreaManagement.css';

const PAGE_SIZE = 10;

const AreaManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('site');
    const [sites, setSites] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [companies, setCompanies] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState({ site: 1, building: 1, floor: 1 });
    const [totalPages, setTotalPages] = useState({ site: 1, building: 1, floor: 1 });

    // Filters
    const [filters, setFilters] = useState({
        site: { company: '' },
        building: { company: '', site: '' },
        floor: { company: '', site: '', building: '' },
    });

    // Search inputs for the second-line search field in filters (layout only)
    const [search, setSearch] = useState({ site: '', building: '', floor: '' });

    // Modal
    const [modal, setModal] = useState({ open: false, type: '', data: null });

    const modulesToAccess = useMemo(() => {
        if (!user?.ComponentToAccess) return [];
        const companyModules = user.Company?.Modules?.split(',') || [];
        const userModules = user.ComponentToAccess.split(',');
        return user.Role === 'Super Admin'
            ? userModules
            : companyModules.filter(m => userModules.includes(m));
    }, [user]);

    /* ------------------------------------------------------------------ */
    /*  Set the first allowed tab on mount                                 */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        const firstTab = ['site', 'building', 'floor'].find(t => modulesToAccess.includes(t)) || '';
        if (firstTab) setActiveTab(firstTab);
    }, [modulesToAccess]);

    /* ------------------------------------------------------------------ */
    /*  Data fetching – runs when tab, page or filters change             */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        if (modulesToAccess.includes('company')) fetchCompanies();
        if (activeTab === 'site') fetchSites();
        if (activeTab === 'building') fetchBuildings();
        if (activeTab === 'floor') fetchFloors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentPage, filters, modulesToAccess]);

    const fetchCompanies = async () => {
        const res = await apiService.get('get-all-company');
        setCompanies(res.data);
    };

    const fetchSites = async () => {
        const offset = (currentPage.site - 1) * PAGE_SIZE;
        let url = `site/${offset}/${PAGE_SIZE}`;
        if (filters.site.company) url += `?companyId=${filters.site.company}`;
        const res = await apiService.get(url);
        setSites(res.data.rows);
        setTotalPages(p => ({ ...p, site: Math.ceil(res.data.total / PAGE_SIZE) }));
    };

    const fetchBuildings = async () => {
        const offset = (currentPage.building - 1) * PAGE_SIZE;
        let url = `building/${offset}/${PAGE_SIZE}`;
        const params = [];
        if (filters.building.company) params.push(`companyId=${filters.building.company}`);
        if (filters.building.site) params.push(`siteId=${filters.building.site}`);
        if (params.length) url += `?${params.join('&')}`;
        const res = await apiService.get(url);
        setBuildings(res.data.rows);
        setTotalPages(p => ({ ...p, building: Math.ceil(res.data.total / PAGE_SIZE) }));
    };

    const fetchFloors = async () => {
        const offset = (currentPage.floor - 1) * PAGE_SIZE;
        let url = `floor/${offset}/${PAGE_SIZE}`;
        const params = [];
        if (filters.floor.company) params.push(`companyId=${filters.floor.company}`);
        if (filters.floor.site) params.push(`siteId=${filters.floor.site}`);
        if (filters.floor.building) params.push(`buildingId=${filters.floor.building}`);
        if (params.length) url += `?${params.join('&')}`;
        const res = await apiService.get(url);
        setFloors(res.data.rows);
        setTotalPages(p => ({ ...p, floor: Math.ceil(res.data.total / PAGE_SIZE) }));
    };

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                            */
    /* ------------------------------------------------------------------ */
    const handlePageChange = (tab: string, page: number) => {
        setCurrentPage(p => ({ ...p, [tab]: page }));
    };

    const handleFilterChange = (tab: string, field: string, value: string) => {
        setFilters(p => ({
            ...p,
            [tab]: { ...p[tab], [field]: value },
        }));
        setCurrentPage(p => ({ ...p, [tab]: 1 }));
    };

    const handleSearchChange = (tab: string, value: string) => {
        setSearch(s => ({ ...s, [tab]: value }));
    };

    const resetFilters = (tab: string) => {
        // keep the filter keys present but reset values
        const empty = Object.keys(filters[tab] || {}).reduce((acc, k) => ({ ...acc, [k]: '' }), {});
        setFilters(p => ({ ...p, [tab]: empty }));
        setSearch(s => ({ ...s, [tab]: '' }));
        setCurrentPage(p => ({ ...p, [tab]: 1 }));
    };

    const openModal = (type: string, data = null) => setModal({ open: true, type, data });
    const closeModal = () => setModal({ open: false, type: '', data: null });

    const refreshData = () => {
        if (activeTab === 'site') fetchSites();
        if (activeTab === 'building') fetchBuildings();
        if (activeTab === 'floor') fetchFloors();
    };

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
        <div className="area-area-management-page">
            {/* ── Header ── */}
            <div className="area-header">
                <h1>Area Management Settings</h1>
                <div className="area-refresh-btn">
                    <i className="fas fa-sync-alt"></i> Auto-Refresh: ON
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="area-settings-tabs">
                {modulesToAccess.includes('site') && (
                    <button
                        className={`area-tab-btn ${activeTab === 'site' ? 'active' : ''}`}
                        onClick={() => setActiveTab('site')}
                    >
                        Site Management
                    </button>
                )}
                {modulesToAccess.includes('building') && (
                    <button
                        className={`area-tab-btn ${activeTab === 'building' ? 'active' : ''}`}
                        onClick={() => setActiveTab('building')}
                    >
                        Building Management
                    </button>
                )}
                {modulesToAccess.includes('floor') && (
                    <button
                        className={`area-tab-btn ${activeTab === 'floor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('floor')}
                    >
                        Floor Management
                    </button>
                )}
            </div>

            {/* ── Site Tab ── */}
            {activeTab === 'site' && modulesToAccess.includes('site') && (
                <div className="area-tab-content">
                    <div className="area-section-header">
                        <h2>Site</h2>
                        <button className="area-btn area-btn-primary" onClick={() => openModal('add-site')}>
                            <i className="fas fa-plus"></i> Add Site
                        </button>
                    </div>

                    {modulesToAccess.includes('company') && (
                        <div className="area-filters-section">
                            <div className="area-filters-top">
                                <div className="area-filter-group">
                                    <label>Company</label>
                                    <select
                                        value={filters.site.company}
                                        onChange={e => handleFilterChange('site', 'company', e.target.value)}
                                    >
                                        <option value="">All Companies</option>
                                        {companies.map(c => (
                                            <option key={c.CompanyId} value={c.CompanyId}>
                                                {c.CompanyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="area-filters-bottom">

                                <div className="area-filters-actions">
                                    <button
                                        className="area-btn area-btn-primary area-apply-filters"
                                        onClick={() => setCurrentPage(p => ({ ...p, site: 1 }))}
                                    >
                                        Filter
                                    </button>
                                    <button
                                        className="area-btn area-btn-secondary area-reset-filters"
                                        onClick={() => resetFilters('site')}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <table className="area-settings-table">
                        <thead>
                            <tr>
                                {user.Role === 'Super Admin' && <th>Company</th>}
                                <th>Site Name</th>
                                <th>Site Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.map(site => (
                                <tr key={site.SiteId}>
                                    {user.Role === 'Super Admin' && <td>{site.Company?.CompanyName}</td>}
                                    <td>{site.SiteName}</td>
                                    <td>{site.SiteDescription}</td>
                                    <td>
                                        <button className="area-action-btn edit" onClick={() => openModal('edit-site', site)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="area-action-btn delete" onClick={() => openModal('delete-site', site)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="area-pagination">
                        <button
                            disabled={currentPage.site === 1}
                            onClick={() => handlePageChange('site', currentPage.site - 1)}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <span>Page {currentPage.site} of {totalPages.site}</span>
                        <button
                            disabled={currentPage.site === totalPages.site}
                            onClick={() => handlePageChange('site', currentPage.site + 1)}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Building Tab ── */}
            {activeTab === 'building' && modulesToAccess.includes('building') && (
                <div className="area-tab-content">
                    <div className="area-section-header">
                        <h2>Building</h2>
                        <button className="area-btn area-btn-primary" onClick={() => openModal('add-building')}>
                            <i className="fas fa-plus"></i> Add Building
                        </button>
                    </div>

                    <div className="area-filters-section">
                        <div className="area-filters-top">
                            {modulesToAccess.includes('company') && (
                                <div className="area-filter-group">
                                    <label>Company</label>
                                    <select
                                        value={filters.building.company}
                                        onChange={e => handleFilterChange('building', 'company', e.target.value)}
                                    >
                                        <option value="">All Companies</option>
                                        {companies.map(c => (
                                            <option key={c.CompanyId} value={c.CompanyId}>
                                                {c.CompanyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {modulesToAccess.includes('site') && (
                                <div className="area-filter-group">
                                    <label>Site</label>
                                    <select
                                        value={filters.building.site}
                                        onChange={e => handleFilterChange('building', 'site', e.target.value)}
                                    >
                                        <option value="">All Sites</option>
                                        {sites
                                            .filter(s => !filters.building.company || s.CompanyId === filters.building.company)
                                            .map(s => (
                                                <option key={s.SiteId} value={s.SiteId}>
                                                    {s.SiteName}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="area-filters-bottom">

                            <div className="area-filters-actions">
                                <button
                                    className="area-btn area-btn-primary area-apply-filters"
                                    onClick={() => setCurrentPage(p => ({ ...p, building: 1 }))}
                                >
                                    Filter
                                </button>
                                <button
                                    className="area-btn area-btn-secondary area-reset-filters"
                                    onClick={() => resetFilters('building')}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <table className="area-settings-table">
                        <thead>
                            <tr>
                                <th>Site Name</th>
                                <th>Building Name</th>
                                <th>Building Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buildings.map(b => (
                                <tr key={b.BuildingId}>
                                    <td>{b.Site?.SiteName}</td>
                                    <td>{b.BuildingName}</td>
                                    <td>{b.BuildingDescription}</td>
                                    <td>
                                        <button className="area-action-btn edit" onClick={() => openModal('edit-building', b)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="area-action-btn delete" onClick={() => openModal('delete-building', b)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="area-pagination">
                        <button
                            disabled={currentPage.building === 1}
                            onClick={() => handlePageChange('building', currentPage.building - 1)}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <span>Page {currentPage.building} of {totalPages.building}</span>
                        <button
                            disabled={currentPage.building === totalPages.building}
                            onClick={() => handlePageChange('building', currentPage.building + 1)}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Floor Tab ── */}
            {activeTab === 'floor' && modulesToAccess.includes('floor') && (
                <div className="area-tab-content">
                    <div className="area-section-header">
                        <h2>Floor</h2>
                        <button className="area-btn area-btn-primary" onClick={() => openModal('add-floor')}>
                            <i className="fas fa-plus"></i> Add Floor
                        </button>
                    </div>

                    <div className="area-filters-section">
                        <div className="area-filters-top">
                            {modulesToAccess.includes('company') && (
                                <div className="area-filter-group">
                                    <label>Company</label>
                                    <select
                                        value={filters.floor.company}
                                        onChange={e => handleFilterChange('floor', 'company', e.target.value)}
                                    >
                                        <option value="">All Companies</option>
                                        {companies.map(c => (
                                            <option key={c.CompanyId} value={c.CompanyId}>
                                                {c.CompanyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {modulesToAccess.includes('site') && (
                                <div className="area-filter-group">
                                    <label>Site</label>
                                    <select
                                        value={filters.floor.site}
                                        onChange={e => handleFilterChange('floor', 'site', e.target.value)}
                                    >
                                        <option value="">All Sites</option>
                                        {sites
                                            .filter(s => !filters.floor.company || s.CompanyId === filters.floor.company)
                                            .map(s => (
                                                <option key={s.SiteId} value={s.SiteId}>
                                                    {s.SiteName}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}
                            {modulesToAccess.includes('building') && (
                                <div className="area-filter-group">
                                    <label>Building</label>
                                    <select
                                        value={filters.floor.building}
                                        onChange={e => handleFilterChange('floor', 'building', e.target.value)}
                                    >
                                        <option value="">All Buildings</option>
                                        {buildings
                                            .filter(b => !filters.floor.site || b.SiteId === filters.floor.site)
                                            .map(b => (
                                                <option key={b.BuildingId} value={b.BuildingId}>
                                                    {b.BuildingName}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="area-filters-bottom">

                            <div className="area-filters-actions">
                                <button
                                    className="area-btn area-btn-primary area-apply-filters"
                                    onClick={() => setCurrentPage(p => ({ ...p, floor: 1 }))}
                                >
                                    Filter
                                </button>
                                <button
                                    className="area-btn area-btn-secondary area-reset-filters"
                                    onClick={() => resetFilters('floor')}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <table className="area-settings-table">
                        <thead>
                            <tr>
                                <th>Site Name</th>
                                <th>Building Name</th>
                                <th>Floor Name</th>
                                <th>Floor Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {floors.map(f => (
                                <tr key={f.FloorId}>
                                    <td>{f.Building?.Site?.SiteName}</td>
                                    <td>{f.Building?.BuildingName}</td>
                                    <td>{f.FloorName}</td>
                                    <td>{f.FloorDescription}</td>
                                    <td>
                                        <button className="area-action-btn edit" onClick={() => openModal('edit-floor', f)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="area-action-btn delete" onClick={() => openModal('delete-floor', f)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="area-pagination">
                        <button
                            disabled={currentPage.floor === 1}
                            onClick={() => handlePageChange('floor', currentPage.floor - 1)}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <span>Page {currentPage.floor} of {totalPages.floor}</span>
                        <button
                            disabled={currentPage.floor === totalPages.floor}
                            onClick={() => handlePageChange('floor', currentPage.floor + 1)}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            {modal.open && modal.type.includes('site') && (
                modal.type.startsWith('add') || modal.type.startsWith('edit') ? (
                    <AddEditSiteModal
                        data={modal.data}
                        onClose={closeModal}
                        onSuccess={() => { closeModal(); refreshData(); }}
                    />
                ) : (
                    <DeleteSiteModal
                        data={modal.data}
                        onClose={closeModal}
                        onSuccess={() => { closeModal(); refreshData(); }}
                    />
                )
            )}

            {modal.open && modal.type.includes('building') && (
                modal.type.startsWith('add') || modal.type.startsWith('edit') ? (
                    <AddEditBuildingModal
                        data={modal.data}
                        onClose={closeModal}
                        onSuccess={() => { closeModal(); refreshData(); }}
                    />
                ) : (
                    <DeleteBuildingModal
                        data={modal.data}
                        onClose={closeModal}
                        onSuccess={() => { closeModal(); refreshData(); }}
                    />
                )
            )}

            {modal.open && modal.type.includes('floor') && (
                modal.type.startsWith('add') || modal.type.startsWith('edit') ? (
                    <AddEditFloorModal
                        data={modal.data}
                        onClose={closeModal}
                        onSuccess={() => { closeModal(); refreshData(); }}
                    />
                ) : (
                    <DeleteFloorModal
                        data={modal.data}
                        onClose={closeModal}
                        onSuccess={() => { closeModal(); refreshData(); }}
                    />
                )
            )}
        </div>
    );
};

export default AreaManagement;
