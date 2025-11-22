export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const businessId = url.searchParams.get('businessId');

    if (!businessId) {
        return new Response(JSON.stringify({ error: 'businessId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // These are YOUR Meta App credentials (Chat2Close platform app)
    // All customers will authorize through this single app
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const REDIRECT_URI = `${url.origin}/api/auth/facebook/callback`;

    if (!FACEBOOK_APP_ID) {
        return new Response(JSON.stringify({ error: 'Facebook App not configured. Contact support.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Required permissions for Click-to-WhatsApp ads
    const scopes = [
        'ads_management',
        'ads_read',
        'business_management',
        'pages_read_engagement',
    ].join(',');

    const facebookAuthUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
        `client_id=${FACEBOOK_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&state=${businessId}` + // Pass businessId to identify which business is connecting
        `&response_type=code`;

    return Response.redirect(facebookAuthUrl, 302);
}
