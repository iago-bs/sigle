const { contextBridge, ipcRenderer, shell } = require('electron');

// Expõe APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações do app
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Abre link externo no navegador padrão
  openExternal: (url) => shell.openExternal(url),

  // Salva a janela atual como PDF (invoca handler no main)
  savePDF: () => ipcRenderer.invoke('save-pdf'),

  // Gera PDF com nome de arquivo sugerido (string)
  printToPdf: (suggestedFileName) => ipcRenderer.invoke('print-to-pdf', suggestedFileName),

  // Imprimir diretamente (abre caixa de diálogo de impressão)
  print: (options) => ipcRenderer.invoke('print', options || {}),

  // Salvar um arquivo binário enviado em base64 (renderer -> main)
  saveFile: ({ defaultPath, bufferBase64 }) => ipcRenderer.invoke('save-file', { defaultPath, bufferBase64 }),

  // Exemplo adicional: download direto via main
  // downloadUrl: (url) => ipcRenderer.invoke('download-url', url),
});

// Informação para o renderer saber que está rodando no Electron
contextBridge.exposeInMainWorld('isElectron', true);