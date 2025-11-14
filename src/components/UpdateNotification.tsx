import React from 'react';
import { useAutoUpdater } from '../hooks/useAutoUpdater';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Download, RefreshCw, X, CheckCircle } from 'lucide-react';

// Tipagem para window.isElectron
declare global {
  interface Window {
    isElectron?: boolean;
  }
}

export function UpdateNotification() {
  const {
    updateAvailable,
    updateInfo,
    downloadProgress,
    updateDownloaded,
    isChecking,
    checkForUpdates,
    restartAndInstall,
    dismissUpdate,
  } = useAutoUpdater();

  // Não mostrar nada se não houver atualizações ou se não estiver no Electron
  if (typeof window === 'undefined' || !window.isElectron) {
    return null;
  }

  // Notificação de atualização baixada e pronta para instalar
  if (updateDownloaded) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900">
              Atualização Pronta!
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Versão {updateInfo?.version} foi baixada e está pronta para instalação.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={restartAndInstall}
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reiniciar e Instalar
              </Button>
              <Button size="sm" variant="outline" onClick={dismissUpdate}>
                Mais Tarde
              </Button>
            </div>
          </div>
          <button
            onClick={dismissUpdate}
            className="text-green-400 hover:text-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Notificação de download em progresso
  if (downloadProgress) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900">
              Baixando Atualização
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Versão {updateInfo?.version}
            </p>
            <div className="mt-3">
              <Progress value={downloadProgress.percent} className="w-full" />
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>{Math.round(downloadProgress.percent)}%</span>
                <span>
                  {Math.round(downloadProgress.bytesPerSecond / 1024)} KB/s
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={dismissUpdate}
            className="text-blue-400 hover:text-blue-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Notificação de atualização disponível
  if (updateAvailable) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900">
              Nova Versão Disponível
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              Versão {updateInfo?.version} está disponível para download.
            </p>
            {updateInfo?.releaseNotes && (
              <p className="text-xs text-amber-600 mt-2">
                {updateInfo.releaseNotes}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  // Download será iniciado automaticamente
                  // Apenas fechamos a notificação
                  dismissUpdate();
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
              <Button size="sm" variant="outline" onClick={dismissUpdate}>
                Mais Tarde
              </Button>
            </div>
          </div>
          <button
            onClick={dismissUpdate}
            className="text-amber-400 hover:text-amber-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Botão para verificar atualizações manualmente (apenas se não estiver verificando)
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        size="sm"
        variant="outline"
        onClick={checkForUpdates}
        disabled={isChecking}
        className="shadow-lg"
      >
        {isChecking ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-1" />
        )}
        {isChecking ? 'Verificando...' : 'Verificar Atualizações'}
      </Button>
    </div>
  );
}
