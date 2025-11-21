import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    const { businessId } = req.query;

    console.error(`[Twilio Fallback] Error for business: ${businessId}`);
    console.error('[Twilio Fallback] Body:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    return res.status(200).send('OK');
}
