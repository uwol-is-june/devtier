export default function ResultLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e6edf3', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes cyber-pulse {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.28; }
        }
        .ske { background: rgba(124,255,91,0.14); border-radius: 3px; animation: cyber-pulse 1.8s ease-in-out infinite; }
        .ske-dim { background: rgba(255,255,255,0.06); border-radius: 3px; animation: cyber-pulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* Nav skeleton */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 2.5rem', background: 'rgba(0,0,0,0.52)', borderBottom: '1px solid rgba(124,255,91,0.07)' }}>
        <div className="ske" style={{ width: 80, height: 12 }} />
        <div className="ske-dim" style={{ width: 90, height: 10 }} />
      </div>

      {/* Main */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '7rem 1.5rem 6rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Tier hero card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2.5rem', background: 'rgba(0,0,0,0.72)', border: '1.5px solid rgba(124,255,91,0.12)', borderRadius: 8 }}>
          <div className="ske" style={{ width: 160, height: 32 }} />
          <div className="ske-dim" style={{ width: 80, height: 80, borderRadius: '50%' }} />
          <div className="ske-dim" style={{ width: 100, height: 12 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className="ske-dim" style={{ width: 80, height: 8 }} />
            <div className="ske" style={{ width: 180, height: 48 }} />
            <div className="ske-dim" style={{ width: 20, height: 8 }} />
          </div>
          <div className="ske" style={{ width: 160, height: 28, borderRadius: 100 }} />
        </div>

        {/* Stat panel */}
        <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(124,255,91,0.1)', borderRadius: 8, padding: '1.75rem' }}>
          <div className="ske" style={{ width: 100, height: 8, marginBottom: '1.25rem' }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="ske-dim" style={{ width: 140, height: 8, animationDelay: `${i * 0.1}s` }} />
              <div className="ske" style={{ width: 60, height: 10, animationDelay: `${i * 0.1}s` }} />
            </div>
          ))}
        </div>

        {/* Action area */}
        <div className="ske-dim" style={{ width: '100%', height: 44, borderRadius: 4 }} />
      </div>
    </div>
  )
}
