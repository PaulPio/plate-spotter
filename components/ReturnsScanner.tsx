import React, { useState, useRef } from 'react';
import { analyzeLicensePlateImage, formatManualEntry } from '../services/geminiService';
import { ProcessingState, ScanResult } from '../types';

interface ReturnsScannerProps {
    onScanComplete: (result: ScanResult) => void;
    onCancel: () => void;
}

const ReturnsScanner: React.FC<ReturnsScannerProps> = ({ onScanComplete, onCancel }) => {
    const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
    const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Form State
    const [plateInput, setPlateInput] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [scanStep, setScanStep] = useState<'capture' | 'review'>('capture');

    // Temporary storage for camera results before saving
    const [tempScanData, setTempScanData] = useState<{
        confidence?: string;
        region?: string;
        imageUrl?: string;
    }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Compress image to reduce size for API calls (Vercel has 4.5MB limit)
    const compressImage = (base64: string, maxWidth = 1280, quality = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale down if larger than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Return compressed base64 (without data URL prefix for API)
                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            };
            img.src = base64;
        });
    };

    const resetState = () => {
        setProcessing({ status: 'idle' });
        setPreviewUrl(null);
        setPlateInput('');
        setCompanyName('');
        setScanStep('capture');
        setTempScanData({});
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setProcessing({ status: 'analyzing', message: 'Analyzing vehicle...' });

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;

            try {
                // Compress image for preview and API
                const compressedBase64 = await compressImage(base64String);
                setPreviewUrl(compressedBase64);

                const rawBase64 = compressedBase64.split(',')[1];
                const analysis = await analyzeLicensePlateImage(rawBase64);

                if (analysis) {
                    // Pre-fill data and move to review step
                    setPlateInput(analysis.plateNumber);
                    setTempScanData({
                        confidence: analysis.confidence,
                        region: analysis.region,
                        imageUrl: compressedBase64
                    });
                    setScanStep('review');
                    setProcessing({ status: 'idle' });
                } else {
                    setProcessing({ status: 'error', message: 'Could not detect a license plate. Please try again or use manual entry.' });
                }
            } catch (err) {
                setProcessing({ status: 'error', message: 'Network or API error. Check your connection.' });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleManualFormat = async () => {
        if (!plateInput.trim()) return;
        setProcessing({ status: 'analyzing', message: 'Formatting...' });
        try {
            const formatted = await formatManualEntry(plateInput);
            setPlateInput(formatted);
            setProcessing({ status: 'idle' });
        } catch (e) {
            setProcessing({ status: 'idle' });
        }
    };

    const handleFinalSave = () => {
        const result: ScanResult = {
            id: crypto.randomUUID(),
            plateNumber: plateInput.toUpperCase(),
            timestamp: new Date().toISOString(),
            method: activeTab === 'camera' ? 'camera' : 'manual',
            entryType: 'return',
            companyName: companyName,
            ...tempScanData
        };

        setProcessing({ status: 'success' });
        setTimeout(() => onScanComplete(result), 500);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">
                    {scanStep === 'capture' ? 'New Return Entry' : 'Review & Save'}
                </h2>
                <button onClick={onCancel} className="text-slate-400 hover:text-white">
                    Close
                </button>
            </div>

            {/* Tabs - Only show in capture mode */}
            {scanStep === 'capture' && (
                <div className="flex p-2 bg-slate-800 mx-4 mt-4 rounded-lg">
                    <button
                        onClick={() => { setActiveTab('camera'); resetState(); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'camera' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Camera Scan
                    </button>
                    <button
                        onClick={() => { setActiveTab('manual'); resetState(); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'manual' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Manual Entry
                    </button>
                </div>
            )}

            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                {/* Error Message */}
                {processing.status === 'error' && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-start">
                        <span className="mr-2">⚠️</span> {processing.message}
                    </div>
                )}

                {/* --- CAMERA CAPTURE MODE --- */}
                {activeTab === 'camera' && scanStep === 'capture' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30 relative overflow-hidden group">
                            <div className="text-center p-6">
                                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:bg-slate-600/50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                    </svg>
                                </div>
                                <p className="text-slate-400">Tap below to scan license plate</p>
                            </div>

                            {processing.status === 'analyzing' && (
                                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                                    <p className="text-emerald-400 font-medium animate-pulse">{processing.message}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={processing.status === 'analyzing'}
                            className="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8z" />
                            </svg>
                            <span>Capture Plate</span>
                        </button>

                        <button
                            onClick={() => galleryInputRef.current?.click()}
                            disabled={processing.status === 'analyzing'}
                            className="mt-3 w-full py-4 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 border border-slate-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Upload Photo</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleCameraCapture}
                        />
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCameraCapture}
                        />
                    </div>
                )}

                {/* --- REVIEW MODE (Shared for Camera result & Manual input) --- */}
                {(scanStep === 'review' || (activeTab === 'manual' && scanStep === 'capture')) && (
                    <div className="flex flex-col h-full space-y-5">

                        {/* Image Preview (Only for Camera) */}
                        {previewUrl && activeTab === 'camera' && (
                            <div className="w-full h-40 bg-slate-800 rounded-xl overflow-hidden relative border border-slate-700">
                                <img src={previewUrl} alt="Vehicle" className="w-full h-full object-cover" />
                                <button
                                    onClick={resetState}
                                    className="absolute top-2 right-2 bg-slate-900/70 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Plate Input */}
                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">License Plate</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={plateInput}
                                    onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                                    onBlur={activeTab === 'manual' ? handleManualFormat : undefined}
                                    placeholder="ABC 1234"
                                    className="w-full bg-slate-800 border border-slate-700 text-white text-3xl font-mono p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-slate-600 uppercase text-center tracking-wider"
                                    autoFocus={activeTab === 'manual'}
                                />
                                {tempScanData.region && tempScanData.region !== 'Unknown' && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] rounded uppercase font-bold border border-indigo-500/30">
                                        {tempScanData.region}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company Name Input */}
                        <div className="flex-1">
                            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">
                                Company Name (Owner)
                            </label>
                            <textarea
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g. Enterprise, Hertz, Avis, Private Owner..."
                                className="w-full h-32 bg-slate-800 border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-slate-600 resize-none text-base"
                            />
                        </div>

                        <button
                            onClick={handleFinalSave}
                            disabled={!plateInput.trim() || !companyName.trim() || processing.status === 'success'}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing.status === 'success' ? (
                                <span>Saved!</span>
                            ) : (
                                <span>Save Entry</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnsScanner;
