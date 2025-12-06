import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_FAST, MODEL_VISION } from "../constants";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes an image to extract license plate information.
 * Uses gemini-3-pro-preview for high-accuracy image understanding.
 */
export const analyzeLicensePlateImage = async (base64Image: string): Promise<{ plateNumber: string; confidence: string; region: string } | null> => {
  if (!apiKey) throw new Error("API Key is missing.");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_VISION,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for camera captures usually
              data: base64Image
            }
          },
          {
            text: "Analyze this image and identify any vehicle license plate. Return the license plate number (alphanumeric only), a confidence level (High, Medium, Low), and the likely region/state if visible."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plateNumber: { type: Type.STRING, description: "The alphanumeric characters of the license plate." },
            confidence: { type: Type.STRING, description: "Confidence level of the detection: High, Medium, or Low." },
            region: { type: Type.STRING, description: "The state, province, or country identified on the plate, or 'Unknown'." },
            found: { type: Type.BOOLEAN, description: "Whether a license plate was successfully found in the image." }
          },
          required: ["found"],
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    if (!data.found || !data.plateNumber) return null;

    return {
      plateNumber: data.plateNumber.toUpperCase(),
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
 * Uses gemini-flash-lite-latest for low-latency text processing.
 */
export const formatManualEntry = async (input: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Standardize this license plate text to a clean, uppercase alphanumeric format (spaces are allowed if standard for the region, otherwise remove them). Input: "${input}"`,
      config: {
        maxOutputTokens: 50, // Keep it very short and fast
        temperature: 0.1, // Deterministic
      }
    });

    return response.text?.trim() || input.toUpperCase();
  } catch (error) {
    console.error("Error processing text:", error);
    // Fallback to basic JS formatting if AI fails for some reason
    return input.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
  }
};
