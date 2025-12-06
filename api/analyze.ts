import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const MODEL_VISION = 'gemini-2.5-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { base64Image } = req.body;
    if (!base64Image) {
        return res.status(400).json({ error: 'Missing base64Image in request body' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: MODEL_VISION,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
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
        if (!text) {
            return res.status(200).json({ found: false });
        }

        const data = JSON.parse(text);
        if (!data.found || !data.plateNumber) {
            return res.status(200).json({ found: false });
        }

        return res.status(200).json({
            found: true,
            plateNumber: data.plateNumber.toUpperCase(),
            confidence: data.confidence || 'Medium',
            region: data.region || 'Unknown'
        });

    } catch (error) {
        console.error("Error analyzing image:", error);
        return res.status(500).json({ error: 'Failed to analyze image' });
    }
}
