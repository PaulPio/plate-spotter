/**
 * Analyzes an image to extract license plate information.
 * Calls the serverless API route which securely accesses the Gemini API.
 */
export const analyzeLicensePlateImage = async (base64Image: string): Promise<{ plateNumber: string; confidence: string; region: string } | null> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    if (!data.found || !data.plateNumber) return null;

    return {
      plateNumber: data.plateNumber,
      confidence: data.confidence || 'Medium',
      region: data.region || 'Unknown'
    };

  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

/**
 * Normalizes and formats a manually entered license plate.
 * Calls the serverless API route for text processing.
 */
export const formatManualEntry = async (input: string): Promise<string> => {
  try {
    const response = await fetch('/api/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });

    if (!response.ok) {
      // Fallback to basic formatting
      return input.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
    }

    const data = await response.json();
    return data.formatted || input.toUpperCase();

  } catch (error) {
    console.error("Error processing text:", error);
    return input.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
  }
};
