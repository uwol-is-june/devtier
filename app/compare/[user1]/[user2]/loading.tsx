export default function CompareLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#e6edf3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
      }}
    >
      <svg
        style={{ animation: 'spin 1s linear infinite' }}
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(124,255,91,0.7)"
        strokeWidth="2"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <p
        style={{
          fontFamily: "system-ui, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.04em',
          margin: 0,
        }}
      >
        전투력 불러오는 중…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
