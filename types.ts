export interface ScanResult {
  id: string;
  plateNumber: string;
  timestamp: string; // ISO string
  confidence?: string;
  region?: string;
  notes?: string;
  entryType: 'repair' | 'wash'; // Type of entry: repair or car wash
  serviceDetails?: string; // For repair entries: service description
  companyName?: string; // For wash entries: company/owner name
  imageUrl?: string; // Base64 or URL
  method: 'camera' | 'upload' | 'manual';
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  message?: string;
}