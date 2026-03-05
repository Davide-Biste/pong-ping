import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const UpdateState = {
  IDLE: 'idle',
  DOWNLOADING: 'downloading',
  READY: 'ready',
  ERROR: 'error',
};

export default function UpdateDialog() {
  const [update, setUpdate] = useState(null);
  const [state, setState] = useState(UpdateState.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const result = await check();
        if (result?.available) {
          setUpdate(result);
        }
      } catch {
        // Silently ignore update check failures (offline, etc.)
      }
    };

    // Delay check slightly to not block app startup
    const timeout = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timeout);
  }, []);

  const handleInstall = async () => {
    if (!update) return;

    setState(UpdateState.DOWNLOADING);
    setProgress(0);

    try {
      let downloaded = 0;
      let total = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          total = event.data.contentLength ?? 0;
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          if (total > 0) {
            setProgress(Math.round((downloaded / total) * 100));
          }
        } else if (event.event === 'Finished') {
          setState(UpdateState.READY);
        }
      });

      if (state !== UpdateState.READY) {
        setState(UpdateState.READY);
      }
    } catch (err) {
      setError(err?.message ?? 'Errore durante il download.');
      setState(UpdateState.ERROR);
    }
  };

  const handleRelaunch = async () => {
    await relaunch();
  };

  const handleDismiss = () => {
    setUpdate(null);
  };

  if (!update) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={state === UpdateState.IDLE ? handleDismiss : undefined} />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-gray-900/95 border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-900/40 p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">Aggiornamento disponibile</h2>
            <p className="text-purple-300 text-sm mt-0.5">Versione {update.version}</p>
          </div>
        </div>

        {/* Notes */}
        {update.body && state === UpdateState.IDLE && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 text-gray-300 text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
            {update.body}
          </div>
        )}

        {/* Progress bar */}
        {state === UpdateState.DOWNLOADING && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Download in corso...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success state */}
        {state === UpdateState.READY && (
          <div className="mb-4 flex items-center gap-2 text-green-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Aggiornamento pronto. Rilancia l'app per completare.
          </div>
        )}

        {/* Error state */}
        {state === UpdateState.ERROR && (
          <div className="mb-4 flex items-center gap-2 text-red-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {state === UpdateState.IDLE && (
            <>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Più tardi
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
              >
                Aggiorna ora
              </button>
            </>
          )}

          {state === UpdateState.READY && (
            <button
              onClick={handleRelaunch}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              Riavvia ora
            </button>
          )}

          {state === UpdateState.ERROR && (
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Chiudi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
