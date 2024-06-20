const { app, BrowserWindow } = require('electron');
const mongoose = require('mongoose');
const path = require('path');

// Database Setup:
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

// Electron Setup:

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'dist/electron-app/browser/favicon.ico'
  });

  // mainWindow.loadFile(path.join(__dirname, 'renderer', 'dist', 'index.html'));
  mainWindow.loadFile('dist/electron-app/browser/index.html');
}

app.whenReady().then(createWindow);

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

