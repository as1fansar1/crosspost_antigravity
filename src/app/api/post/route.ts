import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const { text } = await request.json();

    if (!text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const xToken = cookieStore.get('x_access_token')?.value;
    const threadsToken = cookieStore.get('threads_access_token')?.value;

    const results: { x?: any; threads?: any } = {};

    // --- POST TO X ---
    if (xToken) {
        try {
            const res = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${xToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await res.json();
            if (res.ok) {
                results.x = { success: true, data };
            } else {
                console.error('X Post Error:', data);
                results.x = { success: false, error: data.detail || data.title || 'Unknown error' };
            }
        } catch (error) {
            console.error('X Network Error:', error);
            results.x = { success: false, error: 'Network error' };
        }
    } else {
        results.x = { success: false, error: 'Not connected' };
    }

    // --- POST TO THREADS ---
    if (threadsToken) {
        try {
            // Step 1: Create Media Container
            const userIdRes = await fetch('https://graph.threads.net/v1.0/me?fields=id', {
                headers: { 'Authorization': `Bearer ${threadsToken}` }
            });
            const userData = await userIdRes.json();

            if (!userIdRes.ok) {
                throw new Error(userData.error?.message || 'Failed to get user ID');
            }

            const userId = userData.id;

            const containerUrl = `https://graph.threads.net/v1.0/${userId}/threads`;
            const containerRes = await fetch(containerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    media_type: 'TEXT',
                    text: text,
                    access_token: threadsToken, // Threads API often takes token in body or query for POSTs too, but Bearer header is standard. 
                    // Docs say "access_token" parameter. Let's put it in body to be safe for this endpoint type.
                }),
            });

            const containerData = await containerRes.json();

            if (!containerRes.ok) {
                throw new Error(containerData.error?.message || 'Failed to create container');
            }

            const creationId = containerData.id;

            // Step 2: Publish
            const publishUrl = `https://graph.threads.net/v1.0/${userId}/threads_publish`;
            const publishRes = await fetch(publishUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creation_id: creationId,
                    access_token: threadsToken,
                }),
            });

            const publishData = await publishRes.json();

            if (publishRes.ok) {
                results.threads = { success: true, data: publishData };
            } else {
                console.error('Threads Publish Error:', publishData);
                results.threads = { success: false, error: publishData.error?.message || 'Failed to publish' };
            }

        } catch (error: any) {
            console.error('Threads Network Error:', error);
            results.threads = { success: false, error: error.message || 'Network error' };
        }
    } else {
        results.threads = { success: false, error: 'Not connected' };
    }

    return NextResponse.json(results);
}
