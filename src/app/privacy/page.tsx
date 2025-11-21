import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/" className="btn btn-secondary">
                    ← Back
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Privacy Policy</h1>
                <div style={{ width: '80px' }}></div>
            </div>

            <div className="card" style={{ lineHeight: '1.6', color: '#ccc' }}>
                <h2 style={{ color: 'white', marginTop: 0 }}>Privacy Policy for CrossPost</h2>
                <p><strong>Effective Date:</strong> November 21, 2025</p>

                <h3 style={{ color: 'white' }}>1. Introduction</h3>
                <p>
                    CrossPost ("we", "our", or "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our application to cross-post content to X (formerly Twitter) and Threads.
                </p>

                <h3 style={{ color: 'white' }}>2. Information We Collect</h3>
                <p>We only collect the minimum information necessary to provide our service:</p>
                <ul>
                    <li><strong>Authentication Tokens:</strong> When you connect your X or Threads accounts, we receive access tokens from these platforms. These tokens allow us to post content on your behalf.</li>
                    <li><strong>Post Content:</strong> We temporarily process the text you write in the "Compose" area to send it to the respective APIs. We do not permanently store your posts on our servers.</li>
                </ul>

                <h3 style={{ color: 'white' }}>3. How We Use Your Information</h3>
                <p>We use your information solely for the following purposes:</p>
                <ul>
                    <li>To authenticate you with X and Threads.</li>
                    <li>To publish the content you create to your connected accounts.</li>
                </ul>

                <h3 style={{ color: 'white' }}>4. Data Storage and Security</h3>
                <p>
                    Access tokens are stored securely in <strong>HTTP-only cookies</strong> on your device. We do not maintain a central database of user tokens. This means your credentials remain with you.
                </p>

                <h3 style={{ color: 'white' }}>5. Third-Party Services</h3>
                <p>
                    Our app interacts with the APIs of X and Threads (Meta). By using our service, you are also subject to the privacy policies of these platforms:
                </p>
                <ul>
                    <li><a href="https://twitter.com/en/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>X Privacy Policy</a></li>
                    <li><a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Meta Privacy Policy (Threads)</a></li>
                </ul>

                <h3 style={{ color: 'white' }}>6. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at support@crosspost.app.
                </p>
            </div>
        </main>
    );
}
