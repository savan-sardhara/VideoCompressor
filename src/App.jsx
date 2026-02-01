import React, { useState, useEffect } from 'react';
import DropZone from './components/DropZone';
import FileList from './components/FileList';
import SettingsPanel from './components/SettingsPanel';
import { startCompression, cancelCompression, selectDirectory, subscribeToProgress, subscribeToComplete, removeListeners } from './services/ffmpegService';
import './style.css';

function App() {
    const [files, setFiles] = useState([]);
    const [settings, setSettings] = useState({ resolution: '720p', outputDir: '', removeMetadata: false });

    // Derived state
    const isProcessing = files.some(f => f.status === 'compressing');
    const hasPending = files.some(f => f.status === 'queued' || f.status === 'error');

    useEffect(() => {
        // Listen for progress
        subscribeToProgress((event, { fileId, percent }) => {
            setFiles(prevFiles => prevFiles.map(f => {
                if (f.id === fileId) {
                    return { ...f, progress: percent, status: 'compressing' };
                }
                return f;
            }));
        });

        // Listen for completion
        subscribeToComplete((event, { fileId, status, error, outputSize }) => {
            setFiles(prevFiles => prevFiles.map(f => {
                if (f.id === fileId) {
                    return {
                        ...f,
                        status: status === 'success' ? 'done' : (status === 'cancelled' ? 'cancelled' : 'error'),
                        compressedSize: outputSize,
                        progress: status === 'success' ? 100 : (status === 'cancelled' ? f.progress : 0)
                    };
                }
                return f;
            }));
        });

        return () => {
            removeListeners();
        };
    }, []);

    const handleFilesAdded = (newFiles) => {
        const formattedFiles = newFiles.map(f => ({
            id: crypto.randomUUID(), // Unique ID for every added file instance
            name: f.name,
            path: window.electronAPI ? window.electronAPI.getPathForFile(f) : f.path,
            size: f.size,
            status: 'queued',
            progress: 0
        }));

        // Allowed duplicates as per request
        setFiles(prev => [...prev, ...formattedFiles]);
    };

    const handleRemove = (index) => {
        const newFiles = [...files];
        const fileToRemove = newFiles[index];
        if (fileToRemove.status === 'compressing') {
            cancelCompression(fileToRemove.id);
        }
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    const handleStart = () => {
        const pendingFiles = files.filter(f => f.status === 'queued' || f.status === 'error');
        if (pendingFiles.length === 0) return;

        setFiles(prev => prev.map(f => {
            if (f.status === 'queued' || f.status === 'error') {
                return { ...f, status: 'compressing' };
            }
            return f;
        }));

        pendingFiles.forEach(file => {
            startCompression(file, settings);
        });
    };

    const handleCancel = (fileId) => {
        cancelCompression(fileId);
    };

    const handleSelectDirectory = async () => {
        const path = await selectDirectory();
        if (path) {
            setSettings({ ...settings, outputDir: path });
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Video Compressor</h1>
            </header>

            <main>
                <div className="main-content">
                    <div className="left-panel">
                        <DropZone onFilesAdded={handleFilesAdded} />
                        <SettingsPanel
                            settings={settings}
                            onSettingsChange={setSettings}
                            onSelectDirectory={handleSelectDirectory}
                        />
                        <button
                            className={`start-btn ${!hasPending ? 'disabled' : ''}`}
                            onClick={handleStart}
                            disabled={!hasPending}
                        >
                            {isProcessing ? (hasPending ? 'Start Pending' : 'Processing...') : 'Start Compression'}
                        </button>
                        { /* Stats or additional info */}
                    </div>

                    <div className="right-panel">
                        <FileList files={files} onRemove={handleRemove} onCancel={handleCancel} />
                    </div>
                </div>
            </main>

            <footer className="status-bar">
                {isProcessing ? 'Compressing videos...' : 'Ready'}
            </footer>
        </div>
    );
}

export default App;
