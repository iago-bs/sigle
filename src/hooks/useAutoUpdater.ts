import { useState, useEffect } from 'react';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

export function useAutoUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Verifica se estamos no Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      
      // Listener para atualização disponível
      const handleUpdateAvailable = (info: UpdateInfo) => {
        setUpdateAvailable(true);
        setUpdateInfo(info);
        setIsChecking(false);
      };

      // Listener para progresso do download
      const handleDownloadProgress = (progress: DownloadProgress) => {
        setDownloadProgress(progress);
      };

      // Listener para atualização baixada
      const handleUpdateDownloaded = (info: UpdateInfo) => {
        setUpdateDownloaded(true);
        setDownloadProgress(null);
        setUpdateInfo(info);
      };

      // Adicionar listeners
      window.electronAPI.on('update-available', handleUpdateAvailable);
      window.electronAPI.on('download-progress', handleDownloadProgress);
      window.electronAPI.on('update-downloaded', handleUpdateDownloaded);

      // Cleanup
      return () => {
        window.electronAPI.removeListener('update-available', handleUpdateAvailable);
        window.electronAPI.removeListener('download-progress', handleDownloadProgress);
        window.electronAPI.removeListener('update-downloaded', handleUpdateDownloaded);
      };
    }
  }, []);

  const checkForUpdates = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsChecking(true);
      try {
        await window.electronAPI.invoke('check-for-updates');
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
        setIsChecking(false);
      }
    }
  };

  const restartAndInstall = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await window.electronAPI.invoke('restart-and-install');
      } catch (error) {
        console.error('Erro ao reiniciar e instalar:', error);
      }
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
    setUpdateDownloaded(false);
    setUpdateInfo(null);
    setDownloadProgress(null);
  };

  return {
    updateAvailable,
    updateInfo,
    downloadProgress,
    updateDownloaded,
    isChecking,
    checkForUpdates,
    restartAndInstall,
    dismissUpdate,
  };
}

// Tipos para o TypeScript
declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, func: (...args: any[]) => void) => void;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
      // Novas APIs para impressão e links externos
      openExternal: (url: string) => Promise<{ ok: boolean; error?: string }>;
      printToPdf: (payload?: string | { suggestedFileName?: string; html?: string }) => Promise<{ ok: boolean; filePath?: string; canceled?: boolean; error?: string }>;
      print: (options?: any) => Promise<{ ok: boolean; error?: string }>;
      saveFile: (options: { defaultPath: string; bufferBase64: string }) => Promise<{ ok: boolean; filePath?: string; canceled?: boolean; error?: string }>;
    };
  }
}
