import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    const { businessId } = req.query;

    console.log(`[Twilio Webhook] Incoming message for business: ${businessId}`);
    console.log('[Twilio Webhook] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[Twilio Webhook] Body:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // Basic TwiML Response to acknowledge receipt
    // In a real app, you would process the message here
    const twiml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response></Response>
  `;

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml);
}
