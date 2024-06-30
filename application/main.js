const { app, BrowserWindow, utilityProcess } = require('electron');
const path = require('path');

// Prevent Squirrel.Window to launch the app multiple times during installation
if (require('electron-squirrel-startup') === true) app.quit();

let serverProcess;

// Electron Setup:
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'dist', 'application', 'browser', 'assets', 'icons', 'favicon.ico')
  });
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.loadFile(path.join(__dirname, 'dist', 'application', 'browser', 'index.html'));
}

app.whenReady().then(() => {
  // Run Server as a utilityProcess
  serverProcess = utilityProcess
  .fork(path.join(__dirname, 'server', 'server.js'))
  .on('spawn', () => console.log('Electron: [Spawned new server process...]'))
  .on('message', (message) => console.log(`[Server: ${message}]`))
  .on('exit', (code) => console.log(`Electron: [Server process exited with code ${code}]`));

  // Create Electron Window
  createWindow();
}).catch((error) => {
  console.error('Electron: [App failed to be ready:]', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      console.log('Electron: [Sending shutdown message to server...]');
      serverProcess.postMessage({message: 'shutdown'});
      serverProcess.on('exit', (code) => {
        if (code === 1) {
          console.log('Electron: [Trying to forcefully kill server process...]');
          serverProcess.kill('SIGTERM');
          app.quit();
        } else {
          app.quit();
        }

      });
    } else {
      app.quit();
    }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
