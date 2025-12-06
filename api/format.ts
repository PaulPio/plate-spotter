import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const MODEL_FAST = 'gemini-2.5-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { input } = req.body;
    if (!input) {
        return res.status(400).json({ error: 'Missing input in request body' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: `Standardize this license plate text to a clean, uppercase alphanumeric format (spaces are allowed if standard for the region, otherwise remove them). Input: "${input}"`,
            config: {
                maxOutputTokens: 50,
                temperature: 0.1,
            }
        });

        const formatted = response.text?.trim() || input.toUpperCase();
        return res.status(200).json({ formatted });

    } catch (error) {
        console.error("Error formatting text:", error);
        // Fallback to basic formatting
        const formatted = input.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
        return res.status(200).json({ formatted });
    }
}
