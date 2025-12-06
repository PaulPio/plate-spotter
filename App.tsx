
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import HistoryList from './components/HistoryList';
import Scanner from './components/Scanner';
import Settings from './components/Settings';
import { ScanResult } from './types';
import { syncScanResult } from './services/syncService';

const App: React.FC = () => {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Load history and settings from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('plate_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }

    const savedWebhook = localStorage.getItem('plate_webhook_url');
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('plate_history', JSON.stringify(history));
  }, [history]);

  const handleSaveSettings = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('plate_webhook_url', url);
  };

  const handleScanComplete = (result: ScanResult) => {
    setHistory(prev => [result, ...prev]);
    setIsScanning(false);
    
    // Automatically sync if URL is configured
    if (webhookUrl) {
      syncScanResult(result, webhookUrl);
    }
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 max-w-md mx-auto relative shadow-2xl border-x border-slate-800/50">
      
      {/* Header */}
      <header className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 z-40 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
             P
           </div>
           <h1 className="text-xl font-bold tracking-tight text-white">PlateSpotter</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            AI Active
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        
        {/* Stats Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Scans</p>
            <p className="text-2xl font-bold text-white">{history.length}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Today</p>
            <p className="text-2xl font-bold text-white">
              {history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>

        {/* Action Button (Large) */}
        {!isScanning && (
          <button 
            onClick={() => setIsScanning(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white p-6 rounded-2xl shadow-xl shadow-indigo-900/20 flex flex-col items-center justify-center group transition-all transform hover:scale-[1.02]"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <span className="text-lg font-bold">New Scan</span>
            <span className="text-indigo-200 text-sm">Camera or Manual Entry</span>
          </button>
        )}

        {/* History List */}
        <HistoryList items={history} onDelete={handleDelete} />

      </main>

      {/* Scanner Overlay */}
      {isScanning && (
        <Scanner onScanComplete={handleScanComplete} onCancel={() => setIsScanning(false)} />
      )}

      {/* Settings Modal */}
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        webhookUrl={webhookUrl}
        onSave={handleSaveSettings}
      />

      {/* Floating Action Button (Sticky, for when scanned list is long) */}
      {!isScanning && history.length > 5 && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setIsScanning(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-900/40 transition-transform hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
