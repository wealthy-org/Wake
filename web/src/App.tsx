import { useState } from 'react';
import {
  Laptop,
  Terminal,
  Play,
  Check,
  Globe,
  Monitor,
  ArrowRight,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { ObservationDemo } from './ObservationDemo';
import { HeroNetwork } from './HeroNetwork';
import './App.css';

function App() {
  const [copiedStep2, setCopiedStep2] = useState(false);
  const [copiedStep3, setCopiedStep3] = useState(false);

  const step2Code = `git clone https://github.com/wealthy-org/Wake.git\ncd wake\nnpm install`;
  const step3Code = `npm run start`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* 0. HEADER */}
      <header className="wake-header">
        <div className="wake-container wake-header-inner">
          <div className="wake-brand">
            <div className="wake-brand-logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: '1rem', height: '1rem' }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8.5" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
                <path d="M6.5 8L9.5 16.5L12 11.5L14.5 16.5L17.5 8" strokeWidth="1.8" />
                <circle cx="12" cy="11.5" r="1.2" fill="currentColor" />
              </svg>
            </div>
            <span className="wake-brand-name">Wake</span>
            <span className="wake-tag">Local Software</span>
          </div>

          <nav className="wake-nav">
            <a href="#what-you-see" onClick={(e) => { e.preventDefault(); scrollTo('what-you-see'); }}>What you see</a>
            <a href="#install" onClick={(e) => { e.preventDefault(); scrollTo('install'); }}>Install</a>
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollTo('demo'); }}>Demo</a>
            <a href="#architecture" onClick={(e) => { e.preventDefault(); scrollTo('architecture'); }}>Architecture</a>
            <a href="#limits" onClick={(e) => { e.preventDefault(); scrollTo('limits'); }}>Limits</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a>
            <a href="https://github.com/wealthy-org/Wake" target="_blank" rel="noopener noreferrer">GitHub</a>
            <button type="button" className="btn-primary" onClick={() => scrollTo('install')}>
              Install Wake
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* 1. HERO */}
        <section id="hero" className="hero-section">
          {/* Ambient on-chain observation network sitting behind documentation */}
          <HeroNetwork />
          <div className="wake-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            {/* REFINED LOCAL RUNTIME STATUS PANEL */}
            <div className="hero-status-panel" role="status" aria-label="Local Runtime Status">
              <div className="hero-status-header">
                <div className="hero-status-indicator">
                  <span className="hero-status-dot" aria-hidden="true" />
                  <span className="hero-status-tag">LOCAL INSTANCE</span>
                </div>
                <span className="hero-status-ip">127.0.0.1</span>
              </div>

              <div className="hero-status-body">
                <span className="hero-status-primary">Wake runs on your machine.</span>
                <span className="hero-status-secondary">The web interface is served locally through localhost.</span>
              </div>

              <div className="hero-status-meta">
                <span>Documentation only</span>
                <span className="hero-status-sep">·</span>
                <span>No site backend</span>
                <span className="hero-status-sep">·</span>
                <span>No wallet connection</span>
              </div>
            </div>

            <h1 className="hero-title">
              See where capital moves on Robinhood Chain.
            </h1>

            <p className="hero-subtitle">
              Wake is local software that lets users observe on-chain capital movement.
            </p>

            <div className="hero-actions">
              <button type="button" className="btn-primary" onClick={() => scrollTo('install')}>
                <Terminal style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Install
              </button>
              <button type="button" className="btn-outline" onClick={() => scrollTo('demo')}>
                <Play style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', fill: 'currentColor' }} />
                Watch the demo
              </button>
            </div>

            <div className="hero-badges">
              <span>Runs locally on 127.0.0.1</span>
              <span>·</span>
              <span>No wallet connection</span>
              <span>·</span>
              <span>Public RPC</span>
              <span>·</span>
              <span>Node.js 22+</span>
            </div>
          </div>
        </section>

        {/* 2. WHAT YOU SEE */}
        <section id="what-you-see" className="section">
          <div className="wake-container">
            <div className="section-header">
              <span className="section-label">Observational Views</span>
              <h2 className="section-title">What you see</h2>
              <p className="section-desc">
                Wake lets the user observe different aspects of on-chain capital movement across four dedicated views.
              </p>
            </div>

            {/* Feature 1: Inflow (Wide) */}
            <div className="feature-box">
              <div className="feature-box-header">
                <p className="feature-box-title">Feature 01 · Inflow</p>
                <p className="feature-box-purpose">Purpose: Show ranking of tokens receiving capital.</p>
                <p className="feature-box-desc">
                  Wake ranks tokens receiving rotation inflow from wallets that recently exited other positions, ordered by observed incoming flow metrics.
                </p>
              </div>
              <div className="feature-screenshot-area">
                <div className="screenshot-placeholder">
                  <div className="screenshot-topbar">
                    <span>wake-view-inflow · 127.0.0.1:PORT</span>
                    <span className="badge-sample">Recorded sample, not a live market feed</span>
                  </div>
                  <div className="screenshot-content">
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>[Recorded Sample Screenshot: Inflow]</p>
                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                      Token ranking board displaying observed rotation inflow, acceleration ratio, and curve stage.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Coin Flow (Split Layout) */}
            <div className="split-layout">
              <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
                <p className="feature-box-title">Feature 02 · Coin Flow</p>
                <p className="feature-box-purpose">Purpose: Show the origin and destination wallets involved in token movement.</p>
                <p className="feature-box-desc" style={{ marginTop: '0.5rem' }}>
                  Coin Flow traces token-level capital paths, showing where wallets originated before entering and where they rotated next.
                </p>
              </div>
              <div className="screenshot-placeholder">
                <div className="screenshot-topbar">
                  <span>wake-view-coinflow · Ego Network</span>
                  <span className="badge-sample">Recorded sample, not a live market feed</span>
                </div>
                <div className="screenshot-content">
                  <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>[Recorded Sample Screenshot: Coin Flow]</p>
                  <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                    Origin tokens → Target token → Subsequent destination tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3: Network (Wide) */}
            <div className="feature-box">
              <div className="feature-box-header">
                <p className="feature-box-title">Feature 03 · Network</p>
                <p className="feature-box-purpose">Purpose: Show the network relationship between wallets/tokens and the observed flow.</p>
                <p className="feature-box-desc">
                  Visualizes relational graphs between tokens and wallets across the observed match window. Line width corresponds to unique wallet counts.
                </p>
              </div>
              <div className="feature-screenshot-area">
                <div className="screenshot-placeholder">
                  <div className="screenshot-topbar">
                    <span>wake-view-network · Force Directed Graph (Window: 30m)</span>
                    <span className="badge-sample">Recorded sample, not a live market feed</span>
                  </div>
                  <div className="screenshot-content">
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>[Recorded Sample Screenshot: Network]</p>
                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                      Interactive token nodes and rotation links. Distance between nodes is layout only, not an analytical fact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Watchlist (Asymmetric Layout) */}
            <div className="asymmetric-layout">
              <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
                <p className="feature-box-title">Feature 04 · Watchlist</p>
                <p className="feature-box-purpose">Purpose: Allow the user to monitor selected wallets.</p>
                <p className="feature-box-desc" style={{ marginTop: '0.5rem' }}>
                  Maintains a private list of monitored wallet addresses stored locally at ~/.wake/watchlist.json.
                </p>
              </div>
              <div className="screenshot-placeholder">
                <div className="screenshot-topbar">
                  <span>wake-view-watchlist · Local Wallets</span>
                  <span className="badge-sample">Recorded sample, not a live market feed</span>
                </div>
                <div className="screenshot-content">
                  <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>[Recorded Sample Screenshot: Watchlist]</p>
                  <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                    Monitored addresses, rotation indicators (rotated, active, idle), and unread state.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. INSTALL IN 3 STEPS */}
        <section id="install" className="section section-alt">
          <div className="wake-container">
            <div className="section-header">
              <span className="section-label">Setup Guide</span>
              <h2 className="section-title">Install in 3 steps</h2>
              <p className="section-desc">
                Install and run Wake directly on your machine.
              </p>
            </div>

            <div className="callout-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Check style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem' }}>
                  No Python. No API key required for Sample mode.
                </span>
              </div>
              <span className="wake-tag" style={{ background: '#27272a', color: '#fff', border: 'none' }}>
                Node.js only
              </span>
            </div>

            {/* Step 1 */}
            <div className="step-card">
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>
                Step 1 — Runtime Requirement
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                Install <strong>Node.js 22+</strong> on your system.
              </p>
              <div style={{ background: '#f4f4f5', padding: '0.5rem 0.75rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <code>node -v</code> (must be v22.x or later)
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>
                Step 2 — Clone & Dependencies
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0' }}>
                Clone the repository and install dependencies.
              </p>
              <div className="code-block">
                <div className="code-topbar">
                  <span>bash</span>
                  <button type="button" className="btn-copy" onClick={() => copyToClipboard(step2Code, setCopiedStep2)}>
                    {copiedStep2 ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="code-body"><code>{step2Code}</code></pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>
                Step 3 — Start Wake
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0' }}>
                Start Wake locally:
              </p>
              <div className="code-block">
                <div className="code-topbar">
                  <span>bash</span>
                  <button type="button" className="btn-copy" onClick={() => copyToClipboard(step3Code, setCopiedStep3)}>
                    {copiedStep3 ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="code-body"><code>{step3Code}</code></pre>
              </div>
              <div style={{ marginTop: '1rem', background: '#f4f4f5', padding: '1rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Then:</p>
                <p style={{ margin: '0 0 0.25rem' }}>Open: <code>http://127.0.0.1:PORT</code></p>
                <p style={{ margin: 0 }}>and click: <strong>Load sample</strong></p>
              </div>
            </div>

          </div>
        </section>

        {/* 4. DEMO */}
        <section id="demo" className="section">
          <div className="wake-container">
            <div className="section-header">
              <span className="section-label">Recorded Observation Replay</span>
              <h2 className="section-title">Demo</h2>
              <p className="section-desc">
                Explore a recorded Wake sample. Follow wallet activity, inspect token flows, and open the history behind each observed relationship.
              </p>
            </div>

            {/* INTERACTIVE 2D OBSERVATION CANVAS */}
            <ObservationDemo />

            <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>This demo replays a self-contained recorded sample on client memory. Zero RPC calls · Zero external network traffic.</span>
              <span>Wake Terminal Demo v0.1</span>
            </div>
          </div>
        </section>

        {/* 5. HOW IT READS THE CHAIN */}
        <section id="architecture" className="section section-alt">
          <div className="wake-container">
            <div className="section-header">
              <span className="section-label">Architecture</span>
              <h2 className="section-title">How it reads the chain</h2>
              <p className="section-desc">
                Wake reads public on-chain data and presents the resulting views locally. There is no Wake server storing the user's data.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '2rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)' }}>Flow:</span>
              <span style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>Public RPC</span>
              <ArrowRight style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
              <span style={{ background: 'var(--bg-dark)', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>Your laptop</span>
              <ArrowRight style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
              <span style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>Local Wake views</span>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card-subtle)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <Globe style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem', color: 'var(--text-secondary)' }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem', margin: '0 0 0.25rem' }}>Public RPC</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Robinhood Chain public logs</p>
                </div>

                <div style={{ background: 'var(--bg-dark)', color: '#fff', padding: '1.5rem', borderRadius: '6px' }}>
                  <Laptop style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem', color: '#10b981' }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem', margin: '0 0 0.25rem' }}>Your Laptop</p>
                  <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: 0 }}>Wake Engine + SQLite (~/.wake/)</p>
                </div>

                <div style={{ background: 'var(--bg-card-subtle)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <Monitor style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem', color: 'var(--text-secondary)' }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem', margin: '0 0 0.25rem' }}>Local Wake views</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Web views on 127.0.0.1:PORT</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. HONEST LIMITS */}
        <section id="limits" className="section">
          <div className="wake-container">
            <div className="section-header">
              <span className="section-label">Transparency</span>
              <h2 className="section-title">Honest limits</h2>
              <p className="section-desc">
                Technical boundaries and explicit system constraints.
              </p>
            </div>

            <div className="limits-list">
              <div className="limits-item">
                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Limit 01:</span>
                Wake currently covers only the Pons V2 curve and its v4 pools.
              </div>
              <div className="limits-item">
                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Limit 02:</span>
                Block time is interpolated.
              </div>
              <div className="limits-item">
                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Limit 03:</span>
                Wallet identity on v4 pools can sometimes be a router, so confidence may be low.
              </div>
              <div className="limits-item">
                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Limit 04:</span>
                External data is only available in Live mode.
              </div>
              <div className="limits-item">
                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Limit 05:</span>
                Verdicts are model outputs, not financial advice or recommendations.
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section id="faq" className="section section-alt">
          <div className="wake-container">
            <div className="section-header">
              <span className="section-label">Questions</span>
              <h2 className="section-title">FAQ</h2>
              <p className="section-desc">
                Common questions about Wake software and execution.
              </p>
            </div>

            <div className="faq-list">
              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Is Wake a website I can open?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  No. It is software you run on your own computer. This site only explains it.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Do I need a wallet?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  No. Wake reads public on-chain data. There is no wallet connection.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Does it cost anything?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  No hosting cost. It uses public RPC by default. Optional keys such as Hypersync and X mentions are free or optional.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Where is my data stored?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  Only on your machine (~/.wake/ and the local database). Nothing is sent to us.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Do I need Python?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  No. Node.js 22+ only.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Is this financial advice?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  No. Wake shows observed on-chain order of trades. Verdicts are model outputs, not recommendations.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Why is nothing showing?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  Use Load sample first, or wait for the live backfill to finish.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-summary">
                  <span>Is it real time?</span>
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                </summary>
                <div className="faq-answer">
                  Only while the app is open in Live mode. It does not run in the background.
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="wake-footer">
        <div className="wake-container">
          <div className="footer-inner">
            <div style={{ maxWidth: '28rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Wake</span>
                <span className="wake-tag">Documentation</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0, lineHeight: 1.6 }}>
                Wake is local software that runs on the user's computer. The web views open at a localhost address and nobody else sees your instance. This website is documentation only.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 700, margin: '0 0 0.5rem', textTransform: 'uppercase' }}>Project</p>
                <p style={{ margin: '0 0 0.35rem' }}>
                  <a href="https://github.com/wealthy-org/Wake" target="_blank" rel="noopener noreferrer">
                    GitHub <ArrowUpRight style={{ width: '0.75rem', height: '0.75rem', display: 'inline' }} />
                  </a>
                </p>
                <p style={{ margin: 0 }}>
                  <a href="https://github.com/wealthy-org/Wake/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
                    License (MIT) <ArrowUpRight style={{ width: '0.75rem', height: '0.75rem', display: 'inline' }} />
                  </a>
                </p>
              </div>

              <div style={{ maxWidth: '20rem' }}>
                <p style={{ fontWeight: 700, margin: '0 0 0.5rem', textTransform: 'uppercase' }}>Attribution</p>
                <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Wake is a TypeScript port of{' '}
                  <a href="https://github.com/Argona7/stampede" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                    STAMPEDE
                  </a>
                  , used with permission from its original author.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <div>
              <span style={{ fontWeight: 700 }}>Disclaimer: </span>
              <span>Not financial advice.</span>
            </div>
            <div>
              <span>Wake © {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
