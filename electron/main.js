const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'));

const isDev = !app.isPackaged;
let mainWindow;
const ffmpegCommands = new Map(); // Store active commands

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        title: "Video Compressor",
        backgroundColor: '#121212',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false // Allow loading local files (dev mode mostly)
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#1e1e1e',
            symbolColor: '#ffffff',
            height: 48
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers

ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.filePaths;
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0]; // Return the first selected path
});

ipcMain.on('start-compression', (event, { files, settings }) => {
    // files is a single file object { id, path, name, ... } passed from App.jsx loop
    const file = files;
    const resolution = settings.resolution || '720p';

    // Determine output path
    const parsedPath = path.parse(file.path);
    const outputDir = settings.outputDir || parsedPath.dir; // Use selected dir or default to source

    let outputName = `${parsedPath.name}_compressed_${resolution}.mp4`;
    let outputPath = path.join(outputDir, outputName);

    // Handle duplicate filenames (auto-increment)
    let counter = 1;
    while (fs.existsSync(outputPath)) {
        outputName = `${parsedPath.name}_compressed_${resolution} (${counter}).mp4`;
        outputPath = path.join(outputDir, outputName);
        counter++;
    }

    console.log(`Starting compression for: ${file.path} to ${outputPath} (ID: ${file.id})`);

    const command = ffmpeg(file.path)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4');

    // Apply resolution settings
    // Ensure width/height are divisible by 2 for H.264 (yuv420p)
    let size = '?x720';
    if (resolution === '1080p') size = '?x1080';
    if (resolution === '480p') size = '?x480';

    command
        .size(size)
        // Auto padding to ensure even dimensions if needed, though ?xHEIGHT usually keeps aspect ratio. 
        // Better: use scale filter with force_original_aspect_ratio and pad
        // For simplicity with fluent-ffmpeg, we can force size to be even.
        // But ?x720 might yield odd width.
        // Let's use video filter for safer scaling
        .videoFilters([
            {
                filter: 'scale',
                options: {
                    w: '-2', // -2 ensures width is divisible by 2
                    h: resolution === '1080p' ? 1080 : (resolution === '480p' ? 480 : 720)
                }
            }
        ])
        .outputOptions([
            '-crf 28',
            '-preset medium',
            '-pix_fmt yuv420p', // Critical for compatibility and preventing corruption in some players
            '-movflags +faststart', // Good for web playback
            ...(settings.removeMetadata ? ['-map_metadata', '-1'] : [])
        ])
        .on('progress', (progress) => {
            // progress.percent might be undefined for some formats, can fallback to time calculation
            if (progress.percent) {
                mainWindow.webContents.send('compression-progress', {
                    fileId: file.id,
                    percent: Math.round(progress.percent)
                });
            }
        })
        .on('end', () => {
            ffmpegCommands.delete(file.id); // Remove from map
            // Get new file size
            fs.stat(outputPath, (err, stats) => {
                const outputSize = err ? 0 : stats.size;
                mainWindow.webContents.send('compression-complete', {
                    fileId: file.id,
                    status: 'success',
                    outputSize: outputSize
                });
            });
        })
        .on('error', (err) => {
            if (err.message.includes('SIGKILL')) {
                // Was cancelled
                return;
            }
            console.error('An error occurred: ' + err.message);
            ffmpegCommands.delete(file.id); // Remove from map
            mainWindow.webContents.send('compression-complete', {
                fileId: file.id,
                status: 'error',
                error: err.message
            });
        });

    // Store command using ID
    ffmpegCommands.set(file.id, command);

    command.save(outputPath);
});

ipcMain.on('cancel-compression', (event, fileId) => {
    const command = ffmpegCommands.get(fileId);
    if (command) {
        command.kill('SIGKILL');
        ffmpegCommands.delete(fileId);
        console.log(`Cancelled compression for ID: ${fileId}`);
        mainWindow.webContents.send('compression-complete', {
            fileId: fileId,
            status: 'cancelled'
        });
    }
});
