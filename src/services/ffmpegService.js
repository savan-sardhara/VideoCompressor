// This service abstracts the IPC communication

export const selectFiles = async () => {
    if (window.electronAPI) {
        return await window.electronAPI.selectFiles();
    }
    return [];
};

export const selectDirectory = async () => {
    if (window.electronAPI) {
        return await window.electronAPI.selectDirectory();
    }
    return null;
};

export const startCompression = (files, settings) => {
    if (window.electronAPI) {
        window.electronAPI.startCompression(files, settings);
    }
};

export const cancelCompression = (filePath) => {
    if (window.electronAPI) {
        window.electronAPI.cancelCompression(filePath);
    }
};

export const subscribeToProgress = (callback) => {
    if (window.electronAPI) {
        window.electronAPI.onProgress(callback);
    }
};

export const subscribeToComplete = (callback) => {
    if (window.electronAPI) {
        window.electronAPI.onComplete(callback);
    }
};

export const removeListeners = () => {
    if (window.electronAPI) {
        window.electronAPI.removeListener('compression-progress');
        window.electronAPI.removeListener('compression-complete');
    }
}
