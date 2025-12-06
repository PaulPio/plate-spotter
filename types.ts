export interface ScanResult {
  id: string;
  plateNumber: string;
  timestamp: string; // ISO string
  confidence?: string;
  region?: string;
  notes?: string;
  serviceDetails?: string; // New field for mechanic service description
  imageUrl?: string; // Base64 or URL
  method: 'camera' | 'upload' | 'manual';
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  message?: string;
}