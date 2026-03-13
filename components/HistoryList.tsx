import React from 'react';
import { ScanResult } from '../types';

interface HistoryListProps {
  items: ScanResult[];
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ items, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">No recent scans</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-1">Recent Activity</h3>
      {items.map((item) => (
        <div key={item.id} className="bg-slate-800 rounded-xl p-4 flex items-start justify-between shadow-sm border border-slate-700/50">
          <div className="flex items-start space-x-4">
            <div className={`mt-1 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${item.method === 'manual' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {item.method === 'manual' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 001.075.676L10 15.082l5.925 2.844A.75.75 0 0017 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0010 2z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="font-mono text-lg font-bold text-white tracking-wide leading-none">{item.plateNumber}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.entryType === 'repair' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : item.entryType === 'wash' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}>
                  {item.entryType === 'repair' ? '🔧 Repair' : item.entryType === 'wash' ? '🚿 Wash' : '↩️ Return'}
                </span>
              </div>

              {item.entryType === 'repair' && item.serviceDetails && (
                <p className="text-slate-300 text-sm mb-2 line-clamp-2">{item.serviceDetails}</p>
              )}

              {(item.entryType === 'wash' || item.entryType === 'return') && item.companyName && (
                <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                  <span className="text-slate-400">Company:</span> {item.companyName}
                </p>
              )}

              <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center">
                <span>{item.timestamp}</span>
                {item.region && item.region !== 'Unknown' && (
                  <>
                    <span className="hidden sm:inline mx-1">•</span>
                    <span className="text-indigo-400">{item.region}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="text-slate-500 hover:text-red-400 p-2 transition-colors -mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;