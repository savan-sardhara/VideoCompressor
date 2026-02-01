import React from 'react';

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileItem = ({ file, onRemove, onCancel }) => {
    return (
        <div className={`file-item ${file.status}`}>
            <div className="file-info">
                <div className="file-icon">🎬</div>
                <div className="file-details">
                    <div className="file-name" title={file.path}>{file.name}</div>
                    <div className="file-meta">
                        <span>{formatSize(file.size)}</span>
                        {file.compressedSize && (
                            <>
                                <span className="arrow">→</span>
                                <span className="compressed-size">{formatSize(file.compressedSize)}</span>
                                <span className="reduction-badge">
                                    -{((1 - file.compressedSize / file.size) * 100).toFixed(1)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="file-status">
                    {file.status === 'queued' && <span className="badge pending">Pending</span>}
                    {file.status === 'compressing' && <span className="badge processing">Processing</span>}
                    {file.status === 'done' && <span className="badge success">Done</span>}
                    {file.status === 'error' && <span className="badge error">Error</span>}
                    {file.status === 'cancelled' && <span className="badge cancelled">Cancelled</span>}
                </div>
                <div className="file-actions">
                    {file.status === 'compressing' ? (
                        <button className="icon-btn cancel" onClick={() => onCancel(file.id)} title="Cancel">✕</button>
                    ) : (
                        <button className="icon-btn remove" onClick={() => onRemove(file.path)} title="Remove">🗑️</button>
                    )}
                </div>
            </div>

            {file.status === 'compressing' && (
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${file.progress || 0}%` }}></div>
                </div>
            )}
        </div>
    );
};

export default FileItem;
