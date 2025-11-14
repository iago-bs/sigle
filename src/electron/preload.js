const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações do app
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Adicione aqui outras APIs que precisar expor do Node.js para o frontend
  // Exemplo:
  // readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
});

// Informação para o renderer saber que está rodando no Electron
contextBridge.exposeInMainWorld('isElectron', true);
