import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '2rem',
            textAlign: 'center',
            borderTop: '1px solid var(--border)',
            color: '#666',
            fontSize: '0.875rem'
        }}>
            <div className="container">
                <p>&copy; {new Date().getFullYear()} CrossPost. All rights reserved.</p>
                <div style={{ marginTop: '0.5rem' }}>
                    <Link href="/privacy" style={{ color: '#888', textDecoration: 'underline' }}>
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}
