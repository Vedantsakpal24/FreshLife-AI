const { app, BrowserWindow, protocol } = require('electron');
const serve = require('electron-serve');
const path = require('path');

// This serves the static files from the Next.js 'out' directory
const loadURL = serve({ directory: 'out' });

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'FreshLife AI',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Need this for ONNX WASM loading safely if accessing local files via URL
      webSecurity: false
    }
  });

  // Load the app via the custom protocol
  loadURL(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // Set up custom protocol if needed for WASM
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6);
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
