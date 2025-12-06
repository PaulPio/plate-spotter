import React, { useState, useEffect } from 'react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSave: (url: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, webhookUrl, onSave }) => {
  const [inputUrl, setInputUrl] = useState(webhookUrl);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'install'>('sync');

  useEffect(() => {
    setInputUrl(webhookUrl);
  }, [webhookUrl, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(inputUrl);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const copyScriptToClipboard = () => {
    const script = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rawData = e.postData.contents;
  var data = JSON.parse(rawData);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Plate", "Service", "Region", "Method"]);
  }
  
  sheet.appendRow([
    data.timestamp,
    data.plateNumber,
    data.serviceDetails || "N/A",
    data.region || "Unknown",
    data.method
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({status: "success"}));
}`;
    navigator.clipboard.writeText(script);
    alert("Script copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-2xl z-10 shrink-0">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
           <button 
             onClick={() => setActiveTab('sync')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'sync' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-700/30' : 'text-slate-400 hover:text-white'}`}
           >
             Cloud Sync
           </button>
           <button 
             onClick={() => setActiveTab('install')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'install' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-700/30' : 'text-slate-400 hover:text-white'}`}
           >
             Install App
           </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* --- SYNC TAB --- */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/..."
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                />
              </div>

              <button
                onClick={handleSave}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                  isSaved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isSaved ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>

              <hr className="border-slate-700" />

              <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-sm text-slate-300">
                <h3 className="font-bold text-white mb-2">Google Sheets Setup</h3>
                <ol className="list-decimal pl-4 space-y-2 text-slate-400 text-xs">
                  <li>Create a new Google Sheet.</li>
                  <li>Go to <span className="text-white">Extensions {'>'} Apps Script</span>.</li>
                  <li>Paste the code below into the editor.</li>
                  <li>Click <span className="text-white">Deploy {'>'} New Deployment</span>.</li>
                  <li>Select Type: <span className="text-white">Web app</span>.</li>
                  <li>Set <strong>Who has access</strong> to <span className="text-indigo-400">Anyone</span>.</li>
                  <li>Click Deploy and copy the URL above.</li>
                </ol>

                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[10px] text-emerald-400 font-mono border border-slate-800">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rawData = e.postData.contents;
  var data = JSON.parse(rawData);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Plate", "Service", "Region", "Method"]);
  }
  
  sheet.appendRow([
    data.timestamp,
    data.plateNumber,
    data.serviceDetails || "N/A",
    data.region || "Unknown",
    data.method
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({status: "success"}));
}`}
                  </pre>
                  <button 
                    onClick={copyScriptToClipboard}
                    className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded border border-slate-700 hover:bg-slate-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- INSTALL TAB --- */}
          {activeTab === 'install' && (
            <div className="space-y-6">
              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                <p className="text-sm text-indigo-200">
                  You can install PlateSpotter on your phone to use it exactly like a native app. No App Store download required.
                </p>
              </div>

              <div className="space-y-6">
                {/* iOS Instructions */}
                <div>
                   <h3 className="text-white font-bold flex items-center space-x-2 mb-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 384 512" fill="currentColor">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 105.1 84.7 105.1 27.6 0 38-19.7 75.9-19.7 37.5 0 46 19.7 78.8 19.7 29.8 0 54.4-44.1 66-64.7-27.1-13.3-45.2-40.2-45.1-75.3zM229.2 80c21.8-29.4 43.1-41.7 41.5-70-22.9 1-49.6 15.1-66.2 35.7-16.7 20.7-32.9 50.1-27.4 69.4 24.8 2.1 40.5-16.6 52.1-35.1z"/>
                     </svg>
                     <span>iOS (iPhone/iPad)</span>
                   </h3>
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-sm text-slate-400 space-y-2">
                     <p>1. Open this page in <strong>Safari</strong>.</p>
                     <p>2. Tap the <strong>Share</strong> button <span className="inline-block p-1 bg-slate-700 rounded mx-1"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg> </span> in the toolbar.</p>
                     <p>3. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                     <p>4. Tap <strong>Add</strong>.</p>
                   </div>
                </div>

                {/* Android Instructions */}
                <div>
                   <h3 className="text-white font-bold flex items-center space-x-2 mb-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 576 512" fill="currentColor">
                        <path d="M420.55 301.93a24 24 0 1 1 24-24 24 24 0 0 1-24 24m-265.1 0a24 24 0 1 1 24-24 24 24 0 0 1-24 24m273.7-144.48 47.94-83a10 10 0 1 0-17.27-9.92l-48.54 84a302.06 302.06 0 0 0-246.56 0l-48.54-84a10 10 0 1 0-17.27 9.92l47.94 83C64.53 202.22 8.24 285.55 0 384h576c-8.24-98.45-64.54-181.78-146.85-226.55"/>
                     </svg>
                     <span>Android (Chrome)</span>
                   </h3>
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-sm text-slate-400 space-y-2">
                     <p>1. Open this page in <strong>Chrome</strong>.</p>
                     <p>2. Tap the <strong>Menu</strong> (three dots) icon.</p>
                     <p>3. Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</p>
                     <p>4. Follow the prompt to install.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;