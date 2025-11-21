'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ComposePage() {
    const [text, setText] = useState('');
    const [posting, setPosting] = useState(false);
    const [results, setResults] = useState<{ x?: { success: boolean; error?: string }; threads?: { success: boolean; error?: string } } | null>(null);

    const handlePost = async () => {
        if (!text.trim()) return;
        setPosting(true);
        setResults(null);

        try {
            const res = await fetch('/api/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error('Posting failed', error);
            setResults({ x: { success: false, error: 'Network error' }, threads: { success: false, error: 'Network error' } });
        } finally {
            setPosting(false);
        }
    };

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/" className="btn btn-secondary">
                    ← Back
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>New Post</h1>
                <div style={{ width: '80px' }}></div> {/* Spacer */}
            </div>

            <div className="card">
                <div className="input-group">
                    <textarea
                        className="textarea"
                        placeholder="What's on your mind?"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={posting}
                    />
                    <div style={{ textAlign: 'right', marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                        {text.length} characters
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handlePost}
                        disabled={posting || !text.trim()}
                    >
                        {posting ? 'Publishing...' : 'Post to All'}
                    </button>
                </div>

                {results && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Results</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <span>X (Twitter)</span>
                                {results.x?.success ? (
                                    <span className="status-badge status-connected">Posted</span>
                                ) : (
                                    <span className="status-badge status-disconnected">{results.x?.error || 'Failed'}</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <span>Threads</span>
                                {results.threads?.success ? (
                                    <span className="status-badge status-connected">Posted</span>
                                ) : (
                                    <span className="status-badge status-disconnected">{results.threads?.error || 'Failed'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
