import React, { useState } from 'react';

const SettingsPanel = ({ settings, onSettingsChange, onSelectDirectory }) => {
    const presets = [
        { label: '1080p (Full HD)', value: '1080p' },
        { label: '720p (HD)', value: '720p' },
        { label: '480p (SD)', value: '480p' },
    ];

    return (
        <div className="settings-panel">
            <h3>Compression Settings</h3>

            <div className="setting-group">
                <label>Quality Preset</label>
                <div className="preset-options">
                    {presets.map(p => (
                        <button
                            key={p.value}
                            className={`preset-btn ${settings.resolution === p.value ? 'active' : ''}`}
                            onClick={() => onSettingsChange({ ...settings, resolution: p.value })}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>


            <div className="setting-group">
                <label className="checkbox-container">
                    <input
                        type="checkbox"
                        checked={settings.removeMetadata || false}
                        onChange={(e) => onSettingsChange({ ...settings, removeMetadata: e.target.checked })}
                    />
                    <span className="checkbox-label">Remove Metadata</span>
                </label>
            </div>

            <div className="setting-group">
                <label>Output Directory</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                        flex: 1,
                        background: 'var(--bg-tertiary)',
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        color: settings.outputDir ? 'var(--text-primary)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        border: '1px solid var(--border-color)'
                    }} title={settings.outputDir || 'Same as source file'}>
                        {settings.outputDir || 'Same as source file'}
                    </div>
                    <button
                        className="preset-btn"
                        style={{ flex: '0 0 auto', width: 'auto' }}
                        onClick={onSelectDirectory}
                    >
                        Change
                    </button>
                    {settings.outputDir && (
                        <button
                            className="preset-btn"
                            style={{ flex: '0 0 auto', width: 'auto' }}
                            onClick={() => onSettingsChange({ ...settings, outputDir: '' })}
                            title="Reset to source"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default SettingsPanel;
