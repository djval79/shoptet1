export const config = {
    runtime: 'edge',
};

interface UploadImageRequest {
    businessId: string;
    imageBase64: string;
    imageName: string;
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body: UploadImageRequest = await req.json();
        const { businessId, imageBase64, imageName } = body;

        if (!businessId || !imageBase64) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // In production, retrieve business config from database
        // For now, we'll expect the access token to be passed in headers
        const accessToken = req.headers.get('x-facebook-access-token');
        const adAccountId = req.headers.get('x-facebook-ad-account-id');

        if (!accessToken || !adAccountId) {
            return new Response(JSON.stringify({ error: 'Facebook not connected' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Convert base64 to blob
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload image to Facebook
        const formData = new FormData();
        formData.append('bytes', new Blob([buffer]), imageName || 'ad-image.jpg');
        formData.append('access_token', accessToken);

        const uploadResponse = await fetch(
            `https://graph.facebook.com/v21.0/${adAccountId}/adimages`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const uploadData = await uploadResponse.json();

        if (uploadData.error) {
            throw new Error(uploadData.error.message);
        }

        // Extract image hash
        const imageHash = uploadData.images?.[Object.keys(uploadData.images)[0]]?.hash;

        if (!imageHash) {
            throw new Error('Failed to get image hash');
        }

        return new Response(JSON.stringify({
            success: true,
            imageHash,
            url: uploadData.images?.[Object.keys(uploadData.images)[0]]?.url
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Image upload error:', error);
        return new Response(JSON.stringify({
            error: 'Image upload failed',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
