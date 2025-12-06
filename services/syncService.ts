
import { ScanResult } from '../types';

/**
 * Sends the scan result to a configured webhook URL.
 * optimized for Google Apps Script Web Apps which require simple CORS handling.
 */
export const syncScanResult = async (result: ScanResult, webhookUrl: string): Promise<boolean> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.warn('Invalid or missing webhook URL');
    return false;
  }

  try {
    // We use 'no-cors' mode and 'text/plain' content type.
    // This is the most reliable way to post to Google Apps Script from a browser client
    // without triggering CORS Preflight (OPTIONS) errors.
    // The Apps Script must parse e.postData.contents.
    
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify(result),
    });

    console.log(`Successfully synced scan ${result.id} to webhook.`);
    return true;
  } catch (error) {
    console.error('Webhook sync failed:', error);
    return false;
  }
};
