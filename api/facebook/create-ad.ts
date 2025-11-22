export const config = {
    runtime: 'edge',
};

interface CreateAdRequest {
    businessId: string;
    platform: 'facebook' | 'instagram';
    headline: string;
    primaryText: string;
    imageHash: string;
    budget: number;
    whatsappNumber: string;
    pageId: string;
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body: CreateAdRequest = await req.json();
        const {
            businessId,
            platform,
            headline,
            primaryText,
            imageHash,
            budget,
            whatsappNumber,
            pageId
        } = body;

        if (!businessId || !headline || !imageHash || !whatsappNumber || !pageId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const accessToken = req.headers.get('x-facebook-access-token');
        const adAccountId = req.headers.get('x-facebook-ad-account-id');

        if (!accessToken || !adAccountId) {
            return new Response(JSON.stringify({ error: 'Facebook not connected' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Step 1: Create Campaign
        const campaignResponse = await fetch(
            `https://graph.facebook.com/v21.0/${adAccountId}/campaigns`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `Chat2Close - ${headline}`,
                    objective: 'MESSAGES',
                    status: 'PAUSED', // Start paused for review
                    access_token: accessToken,
                }),
            }
        );

        const campaignData = await campaignResponse.json();
        if (campaignData.error) throw new Error(campaignData.error.message);
        const campaignId = campaignData.id;

        // Step 2: Create Ad Set
        const adSetResponse = await fetch(
            `https://graph.facebook.com/v21.0/${adAccountId}/adsets`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `AdSet - ${headline}`,
                    campaign_id: campaignId,
                    daily_budget: budget * 100, // Convert to cents
                    billing_event: 'IMPRESSIONS',
                    optimization_goal: 'CONVERSATIONS',
                    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
                    targeting: {
                        geo_locations: { countries: ['US'] }, // Default, should be configurable
                        age_min: 18,
                        age_max: 65,
                    },
                    status: 'PAUSED',
                    access_token: accessToken,
                }),
            }
        );

        const adSetData = await adSetResponse.json();
        if (adSetData.error) throw new Error(adSetData.error.message);
        const adSetId = adSetData.id;

        // Step 3: Create Ad Creative
        const creativeResponse = await fetch(
            `https://graph.facebook.com/v21.0/${adAccountId}/adcreatives`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `Creative - ${headline}`,
                    object_story_spec: {
                        page_id: pageId,
                        link_data: {
                            message: primaryText,
                            link: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`,
                            name: headline,
                            image_hash: imageHash,
                            call_to_action: {
                                type: 'MESSAGE_PAGE',
                                value: {
                                    app_destination: 'MESSENGER',
                                },
                            },
                        },
                    },
                    access_token: accessToken,
                }),
            }
        );

        const creativeData = await creativeResponse.json();
        if (creativeData.error) throw new Error(creativeData.error.message);
        const creativeId = creativeData.id;

        // Step 4: Create Ad
        const adResponse = await fetch(
            `https://graph.facebook.com/v21.0/${adAccountId}/ads`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: headline,
                    adset_id: adSetId,
                    creative: { creative_id: creativeId },
                    status: 'PAUSED',
                    access_token: accessToken,
                }),
            }
        );

        const adData = await adResponse.json();
        if (adData.error) throw new Error(adData.error.message);

        return new Response(JSON.stringify({
            success: true,
            adId: adData.id,
            campaignId,
            adSetId,
            creativeId,
            previewUrl: `https://www.facebook.com/ads/manager/account_overview/?act=${adAccountId.replace('act_', '')}&selected_campaign_ids=${campaignId}`,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Ad creation error:', error);
        return new Response(JSON.stringify({
            error: 'Ad creation failed',
            details: error.message,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
