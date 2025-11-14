const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1366,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'SIGLE Systems - Sistema de Gerenciamento de Lojas de Eletrônicos',
    autoHideMenuBar: false,
    frame: true,
  });

  // Remove menu bar (opcional - descomente se quiser sem menu)
  // mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    // Modo desenvolvimento - conecta ao Vite dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Modo produção - carrega os arquivos buildados
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Previne navegação externa
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Permite apenas URLs do Supabase e localhost
    if (url.startsWith('https://') && url.includes('.supabase.co')) {
      return { action: 'allow' };
    }
    if (isDev && url.startsWith('http://localhost')) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });
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

// IPC Handlers (se precisar de comunicação entre renderer e main process)
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// Log de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
