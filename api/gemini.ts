import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers for security
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-gemini-api-key',
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // BYOK: Require customer to provide their own API key
    const apiKey = req.headers['x-gemini-api-key'] as string;

    if (!apiKey) {
        return res.status(401).json({
            error: 'Gemini API key required',
            message: 'Please add your Gemini API key in Settings → AI Brain to use AI features.'
        });
    }

    try {
        const { prompt, context, model = 'gemini-2.0-flash-exp' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Build the request payload
        const payload = {
            contents: [
                {
                    parts: [
                        ...(context ? [{ text: context }] : []),
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        // Call Gemini API with server-side key
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return res.status(response.status).json({
                error: 'Gemini API request failed',
                details: errorData
            });
        }

        const data = await response.json();

        // Set CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Gemini API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
