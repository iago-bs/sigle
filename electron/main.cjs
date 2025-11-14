const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Desabilitar recursos que podem causar problemas com ffmpeg
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');

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
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false, // Temporariamente desabilitado para desenvolvimento
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
      webgl: false, // Desabilita WebGL para reduzir dependências
      experimentalFeatures: false,
    },
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'SIGLE Systems - Sistema de Gerenciamento de Lojas de Eletrônicos',
    autoHideMenuBar: false,
    frame: true,
  });

  // Remove menu bar (opcional - descomente se quiser sem menu)
  // mainWindow.setMenuBarVisibility(false);

  // Carrega do servidor de desenvolvimento se estiver em dev mode, caso contrário usa build
  if (isDev) {
    const devURL = 'http://localhost:3000';
    console.log('Carregando do servidor de desenvolvimento:', devURL);
    mainWindow.loadURL(devURL);
  } else {
    const htmlPath = path.join(__dirname, '../build/index.html');
    console.log('Carregando HTML de:', htmlPath);
    mainWindow.loadFile(htmlPath);
  }
  
  // Abrir DevTools para debug
  mainWindow.webContents.openDevTools();
  
  // Log quando o conteúdo carregar
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Página carregada com sucesso!');
  });
  
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Erro ao carregar página:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

    // Previne navegação criando janelas, mas abre links externos no browser
    const { shell } = require('electron');
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      try {
        // Allow internal dev server and local files to open in-window
        if (isDev && url.startsWith('http://localhost')) {
          return { action: 'allow' };
        }

        // Allow app's own build files
        if (url.startsWith('file:')) {
          return { action: 'allow' };
        }

        // Open any external https link in user's default browser
        if (url.startsWith('http://') || url.startsWith('https://')) {
          shell.openExternal(url);
          return { action: 'deny' };
        }
      } catch (err) {
        console.error('Error handling external link', err);
      }

      return { action: 'deny' };
    });

    // IPC handler to save current window as PDF
    const { dialog } = require('electron');
    const fs = require('fs');
    ipcMain.handle('save-pdf', async () => {
      try {
        const pdfBuffer = await mainWindow.webContents.printToPDF({});
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
          title: 'Salvar PDF',
          defaultPath: 'documento.pdf',
          filters: [{ name: 'PDF', extensions: ['pdf'] }],
        });
        if (!filePath) return { cancelled: true };
        fs.writeFileSync(filePath, pdfBuffer);
        return { cancelled: false, path: filePath };
      } catch (error) {
        console.error('save-pdf error', error);
        return { cancelled: true, error: String(error) };
      }
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
// Abrir URL no navegador externo (ex: WhatsApp Web / wa.me)
ipcMain.handle('open-external', async (_, url) => {
  try {
    await shell.openExternal(url);
    return { ok: true };
  } catch (err) {
    console.error('open-external error:', err);
    return { ok: false, error: String(err) };
  }
});

// Gerar PDF do conteúdo atual e salvar via diálogo
ipcMain.handle('print-to-pdf', async (_, payload) => {
  try {
    if (!mainWindow) throw new Error('Main window not ready');
    const suggestedFileName = typeof payload === 'string' ? payload : payload?.suggestedFileName || 'document.pdf';
    const html = typeof payload === 'object' ? payload?.html : undefined;

    // Opções para PDF
    const pdfOptions = {
      printBackground: true,
      marginsType: 0,
      pageSize: 'A4',
      landscape: false,
      scaleFactor: 100,
      headerFooter: false,
      displayHeaderFooter: false,
      printSelectionOnly: false,
    };

    // Se HTML foi passado, renderiza em janela oculta e gera o PDF só desse conteúdo
    if (html && typeof html === 'string') {
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          contextIsolation: true,
          sandbox: true,
        },
      });

      const boilerplate = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              /* Estilos mínimos para garantir visibilidade e cores */
              @media print { @page { size: A4; margin: 10mm; } }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              body { background: #ffffff !important; color: #000 !important; margin: 0; padding: 0; }
            </style>
          </head>
          <body>${html}</body>
        </html>`;

      await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(boilerplate));
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = await printWindow.webContents.printToPDF(pdfOptions);
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Salvar PDF',
        defaultPath: suggestedFileName,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (canceled || !filePath) {
        printWindow.destroy();
        return { ok: false, canceled: true };
      }
      fs.writeFileSync(filePath, data);
      printWindow.destroy();
      return { ok: true, filePath };
    }

    // Caso contrário, imprime a janela atual inteira
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = await mainWindow.webContents.printToPDF(pdfOptions);
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Salvar PDF',
      defaultPath: suggestedFileName,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    fs.writeFileSync(filePath, data);
    return { ok: true, filePath };
  } catch (err) {
    console.error('print-to-pdf error:', err);
    return { ok: false, error: String(err) };
  }
});

// Imprimir diretamente (abre diálogo de impressão nativo)
ipcMain.handle('print', async (_, options = {}) => {
  try {
    if (!mainWindow) throw new Error('Main window not ready');
    const html = options?.html;
    
    // Opções melhoradas para impressão
    const printOptions = {
      silent: false,
      printBackground: true,
      deviceName: '', // Deixa o usuário escolher
      color: true,
      margins: {
        marginType: 'none'
      },
      landscape: false,
      scaleFactor: 100,
      ...options
    };

    // Se um HTML foi fornecido, imprimir a partir de uma janela oculta
    if (html && typeof html === 'string') {
      const printWindow = new BrowserWindow({ show: false });
      const boilerplate = `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body>${html}</body></html>`;
      await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(boilerplate));
      await new Promise(resolve => setTimeout(resolve, 300));
      await new Promise((resolve) => printWindow.webContents.print(printOptions, () => resolve()));
      printWindow.destroy();
      return { ok: true };
    }

    // Caso contrário, imprime a janela atual
    await new Promise(resolve => setTimeout(resolve, 500));
    await new Promise((resolve, reject) => {
      mainWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          console.error('Print failed:', failureReason);
          reject(new Error(String(failureReason)));
        } else {
          resolve(undefined);
        }
      });
    });
    return { ok: true };
  } catch (err) {
    console.error('print error:', err);
    return { ok: false, error: String(err) };
  }
});

// Salvar arquivo binário enviado pelo renderer (por exemplo PDF já gerado no renderer)
ipcMain.handle('save-file', async (_, { defaultPath, bufferBase64 }) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({ defaultPath });
    if (canceled || !filePath) return { ok: false, canceled: true };
    const buffer = Buffer.from(bufferBase64, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { ok: true, filePath };
  } catch (err) {
    console.error('save-file error:', err);
    return { ok: false, error: String(err) };
  }
});

// Log de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});