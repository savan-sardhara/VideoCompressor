import React, { useCallback } from 'react';

const DropZone = ({ onFilesAdded }) => {
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('video/') || file.name.match(/\.(mp4|mkv|avi|mov|webm)$/i)
        );

        if (files.length > 0) {
            onFilesAdded(files);
        }
    }, [onFilesAdded]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onFilesAdded(files);
        }
    };

    return (
        <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input').click()}
        >
            <input
                type="file"
                id="file-input"
                multiple
                accept=".mp4,.mkv,.avi,.mov,.webm,video/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <div className="drop-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Drag & Drop videos here</p>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>or click to browse</span>
            </div>
        </div>
    );
};

export default DropZone;
