import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const xConnected = cookieStore.has('x_access_token');
  const threadsConnected = cookieStore.has('threads_access_token');

  return (
    <main className="container">
      <h1 className="title">CrossPost</h1>
      <p className="subtitle">Seamlessly publish to X and Threads at once.</p>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Connect Accounts</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>𝕏</span>
              <div>
                <div style={{ fontWeight: 600 }}>X (Twitter)</div>
                <div style={{ fontSize: '0.875rem', color: '#888' }}>
                  {xConnected ? <span className="status-badge status-connected">Connected</span> : <span className="status-badge status-disconnected">Not Connected</span>}
                </div>
              </div>
            </div>
            {!xConnected && (
              <a href="/api/auth/twitter?action=login" className="btn btn-x">
                Connect X
              </a>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>@</span>
              <div>
                <div style={{ fontWeight: 600 }}>Threads</div>
                <div style={{ fontSize: '0.875rem', color: '#888' }}>
                  {threadsConnected ? <span className="status-badge status-connected">Connected</span> : <span className="status-badge status-disconnected">Not Connected</span>}
                </div>
              </div>
            </div>
            {!threadsConnected && (
              <a href="/api/auth/threads?action=login" className="btn btn-threads">
                Connect Threads
              </a>
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/compose" className={`btn btn-primary ${(!xConnected && !threadsConnected) ? 'opacity-50 pointer-events-none' : ''}`}>
            Start Writing →
          </Link>
          {(!xConnected && !threadsConnected) && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Connect at least one account to continue</p>
          )}
        </div>
      </div>
    </main>
  );
}
