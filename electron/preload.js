const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFiles: () => ipcRenderer.invoke('select-files'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    startCompression: (files, settings) => ipcRenderer.send('start-compression', { files, settings }),
    cancelCompression: (filePath) => ipcRenderer.send('cancel-compression', filePath),
    onProgress: (callback) => ipcRenderer.on('compression-progress', callback),
    onComplete: (callback) => ipcRenderer.on('compression-complete', callback),
    removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
    getPathForFile: (file) => webUtils.getPathForFile(file)
});
