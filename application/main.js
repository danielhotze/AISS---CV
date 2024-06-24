const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const treeKill = require('tree-kill');

let serverProcess;

// Electron Setup:
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'dist', 'application', 'browser', 'assets', 'icons', 'favicon.ico')
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'application', 'browser', 'index.html'));
}

app.whenReady().then(() => {
  // Run Server as a child_process
  serverProcess = spawn('node', ['server/server.js'], {
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    process.stdout.write(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    process.stderr.write(`Server Error: ${data}`);
  });

  serverProcess.on('error', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  // Create Electron Window
  createWindow();
}).catch((error) => {
  console.error('App failed to be ready:', error);
});

app.on('before-quit', () => {
  //When server is still running, initialize a graceful shutdown before closing the App
  if (serverProcess) {
    console.log('Killing server process');
    treeKill(serverProcess.pid, 'SIGTERM', (err) => {
      if (err) {
        console.error('Failed to kill server process:', err);
      } else {
        console.log('Server process killed successfully');
      }
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
