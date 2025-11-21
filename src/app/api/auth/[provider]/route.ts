import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Helper to generate random string
function generateRandomString(length: number) {
    return crypto.randomBytes(length).toString('hex');
}

// Helper for PKCE code challenge (S256)
function sha256(buffer: string) {
    return crypto.createHash('sha256').update(buffer).digest();
}

function base64URLEncode(str: Buffer) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function getPKCE(verifier: string) {
    const challenge = base64URLEncode(sha256(verifier));
    return challenge;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // --- TWITTER (X) ---
    if (provider === 'twitter') {
        const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI;

        if (!clientId || !redirectUri) {
            return NextResponse.json({ error: 'Missing Twitter credentials' }, { status: 500 });
        }

        if (action === 'login') {
            const state = generateRandomString(16);
            const codeVerifier = generateRandomString(32);
            const codeChallenge = getPKCE(codeVerifier);

            // Store verifier in cookie for callback
            const response = NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`);

            response.cookies.set('twitter_code_verifier', codeVerifier, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
            response.cookies.set('twitter_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

            return response;
        }

        if (action === 'callback') {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const storedState = request.cookies.get('twitter_state')?.value;
            const codeVerifier = request.cookies.get('twitter_code_verifier')?.value;

            if (!code || !state || state !== storedState || !codeVerifier) {
                return NextResponse.json({ error: 'Invalid state or missing code' }, { status: 400 });
            }

            // Exchange code for token
            const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
            const body = new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: clientId,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
            });

            // Basic Auth header is required if client is confidential, but for public clients (PKCE) usually just client_id in body is enough.
            // However, Twitter docs say if you have a client secret, you must use it.
            // Assuming confidential client for web app.
            const clientSecret = process.env.TWITTER_CLIENT_SECRET;
            const headers: Record<string, string> = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };

            if (clientSecret) {
                const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
            }

            try {
                const res = await fetch(tokenUrl, {
                    method: 'POST',
                    headers,
                    body,
                });

                const data = await res.json();

                if (!res.ok) {
                    return NextResponse.json(data, { status: res.status });
                }

                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.set('x_access_token', data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
                // Clean up temp cookies
                response.cookies.delete('twitter_code_verifier');
                response.cookies.delete('twitter_state');

                return response;
            } catch (error) {
                return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
            }
        }
    }

    // --- THREADS ---
    if (provider === 'threads') {
        const appId = process.env.NEXT_PUBLIC_THREADS_APP_ID;
        const redirectUri = process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI;
        const appSecret = process.env.THREADS_APP_SECRET;

        if (!appId || !redirectUri || !appSecret) {
            return NextResponse.json({ error: 'Missing Threads credentials' }, { status: 500 });
        }

        if (action === 'login') {
            const state = generateRandomString(16);
            const scope = 'threads_basic,threads_content_publish';
            const url = `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;

            const response = NextResponse.redirect(url);
            response.cookies.set('threads_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
            return response;
        }

        if (action === 'callback') {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const storedState = request.cookies.get('threads_state')?.value;

            if (!code || !state || state !== storedState) {
                // Threads might not return state in some cases? Docs say it does.
                // For now be strict.
                return NextResponse.json({ error: 'Invalid state or missing code' }, { status: 400 });
            }

            // Exchange code for token
            const tokenUrl = 'https://graph.threads.net/oauth/access_token';
            const body = new URLSearchParams({
                client_id: appId,
                client_secret: appSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code,
            });

            try {
                const res = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body,
                });

                const data = await res.json();

                if (!res.ok) {
                    return NextResponse.json(data, { status: res.status });
                }

                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.set('threads_access_token', data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
                // Threads tokens are long-lived (60 days), we might want to exchange for long-lived if this is short-lived, 
                // but for MVP standard flow is fine. Actually Threads default token is short lived? 
                // Docs say: "Exchange the code for a short-lived access token".
                // Then "Exchange short-lived for long-lived".
                // For MVP, short-lived (1 hour) is fine for testing.

                response.cookies.delete('threads_state');
                return response;
            } catch (error) {
                return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
}
