import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import './CameraManagement.css'; // Use existing styles

// Define default values
const DEFAULTS = {
    ALERT_COOLDOWN_SECONDS: '10',
    CLIP_DURATION: '5',
    ALERT_TILE_PADDING_PX: '8',
    CLIP_SAVE_DIR: 'alert_clips',
    ALERT_IMAGE_DIR: 'alert_images'
};

export default function SystemConfigTab() {
    const [config, setConfig] = useState(DEFAULTS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const loadConfig = useCallback(() => {
        setIsLoading(true);
        apiService.get('system-config')
            .then(res => {
                // Merge loaded config with defaults to ensure all keys exist
                setConfig(prev => ({ ...prev, ...res.data }));
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error loading config:", err);
                setIsLoading(false);
                setMessage({ type: 'error', text: 'Failed to load system configuration.' });
            });
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseInt(value, 10) : 0) : value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        apiService.put('system-config', config)
            .then(() => {
                setIsSaving(false);
                setMessage({ type: 'success', text: 'Configuration saved successfully!' });
            })
            .catch(err => {
                console.error("Error saving config:", err);
                setIsSaving(false);
                setMessage({ type: 'error', text: 'Failed to save configuration.' });
            });
    };

    if (isLoading) {
        return <div>Loading configuration...</div>;
    }

    return (
        <div className="CamMan-tab-pane CamMan-active">
            <div className="CamMan-section-header">
                <h2>Global System Configuration</h2>
            </div>
            
            {/* Re-using modal-content for styling, but it's not a modal */}
            <form onSubmit={handleSave} className="CamMan-modal-content" style={{ maxWidth: '800px', margin: '0 auto', background: '#333' }}>
                <fieldset className="CamMan-form-fieldset" style={{ background: '#2a2a2a' }}>
                    <legend>Alert & Clip Settings</legend>
                    <div className="CamMan-form-row">
                        <div className="CamMan-form-group CamMan-half-width">
                            <label>Alert Cooldown (seconds)</label>
                            <input
                                name="ALERT_COOLDOWN_SECONDS"
                                type="number"
                                value={config.ALERT_COOLDOWN_SECONDS}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="CamMan-form-group CamMan-half-width">
                            <label>Alert Clip Duration (seconds)</label>
                            <input
                                name="CLIP_DURATION"
                                type="number"
                                value={config.CLIP_DURATION}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="CamMan-form-row">
                        <div className="CamMan-form-group CamMan-half-width">
                            <label>Alert Image Padding (pixels)</label>
                            <input
                                name="ALERT_TILE_PADDING_PX"
                                type="number"
                                value={config.ALERT_TILE_PADDING_PX}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="CamMan-form-fieldset" style={{ background: '#2a2a2a' }}>
                    <legend>File Paths (on server)</legend>
                    <div className="CamMan-form-row">
                         <div className="CamMan-form-group CamMan-half-width">
                            <label>Clip Save Directory</label>
                            <input
                                name="CLIP_SAVE_DIR"
                                type="text"
                                value={config.CLIP_SAVE_DIR}
                                onChange={handleChange}
                            />
                        </div>
                         <div className="CamMan-form-group CamMan-half-width">
                            <label>Alert Image Directory</label>
                            <input
                                name="ALERT_IMAGE_DIR"
                                type="text"
                                value={config.ALERT_IMAGE_DIR}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <div className="CamMan-form-actions">
                    <button type="submit" className="CamMan-btn CamMan-btn-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                    {message.text && (
                        <span style={{ color: message.type === 'error' ? '#ff6b6b' : '#46923c' }}>
                            {message.text}
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}