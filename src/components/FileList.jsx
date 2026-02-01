import React from 'react';
import FileItem from './FileItem';

const FileList = ({ files, onRemove, onCancel }) => {
    if (files.length === 0) return null;

    return (
        <div className="file-list">
            <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Video Queue ({files.length})</span>
                {files.some(f => f.status === 'compressing') && (
                    <span className="processing-indicator">Processing...</span>
                )}
            </div>
            <div className="list-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {files.map((file, index) => (
                    <FileItem
                        key={file.id}
                        file={file}
                        onRemove={() => onRemove(index)}
                        onCancel={onCancel}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileList;
