export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // businessId
    const error = url.searchParams.get('error');

    if (error) {
        return Response.redirect(`${url.origin}/?view=settings&error=facebook_auth_failed`, 302);
    }

    if (!code || !state) {
        return new Response(JSON.stringify({ error: 'Invalid callback' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const REDIRECT_URI = `${url.origin}/api/auth/facebook/callback`;

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
        return new Response(JSON.stringify({ error: 'Facebook App not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch(
            `https://graph.facebook.com/v21.0/oauth/access_token?` +
            `client_id=${FACEBOOK_APP_ID}` +
            `&client_secret=${FACEBOOK_APP_SECRET}` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&code=${code}`
        );

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }

        // Exchange short-lived token for long-lived token (60 days)
        const longLivedResponse = await fetch(
            `https://graph.facebook.com/v21.0/oauth/access_token?` +
            `grant_type=fb_exchange_token` +
            `&client_id=${FACEBOOK_APP_ID}` +
            `&client_secret=${FACEBOOK_APP_SECRET}` +
            `&fb_exchange_token=${tokenData.access_token}`
        );

        const longLivedData = await longLivedResponse.json();

        // Get user's ad accounts
        const adAccountsResponse = await fetch(
            `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status&access_token=${longLivedData.access_token}`
        );

        const adAccountsData = await adAccountsResponse.json();

        // Store token and account info (in production, encrypt the token)
        const businessId = state;
        const tokenExpiry = Date.now() + (60 * 24 * 60 * 60 * 1000); // 60 days

        // Return success page with token data to be saved by frontend
        const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facebook Connected</title>
        <script>
          window.opener.postMessage({
            type: 'FACEBOOK_AUTH_SUCCESS',
            data: {
              businessId: '${businessId}',
              accessToken: '${longLivedData.access_token}',
              tokenExpiry: ${tokenExpiry},
              adAccounts: ${JSON.stringify(adAccountsData.data || [])}
            }
          }, '${url.origin}');
          setTimeout(() => window.close(), 1000);
        </script>
      </head>
      <body>
        <h1>✅ Facebook Connected!</h1>
        <p>You can close this window.</p>
      </body>
      </html>
    `;

        return new Response(htmlResponse, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error('Facebook OAuth error:', error);
        return Response.redirect(`${url.origin}/?view=settings&error=facebook_auth_failed`, 302);
    }
}
