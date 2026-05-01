export default function ResultLoading() {
  return (
    <main className="flex flex-col items-center w-full px-4 pb-24 pt-12">
      {/* Back */}
      <div className="w-full max-w-lg mb-8">
        <div className="h-4 w-16 rounded animate-pulse" style={{ background: 'var(--border)' }} />
      </div>

      {/* Tier Card */}
      <section
        className="w-full max-w-lg rounded-lg p-8 flex flex-col items-center gap-6 mb-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* 아이콘 */}
        <div className="w-20 h-20 rounded-full animate-pulse" style={{ background: 'var(--border)' }} />

        {/* 티어명 + username */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-28 rounded animate-pulse" style={{ background: 'var(--border)' }} />
          <div className="h-4 w-20 rounded animate-pulse" style={{ background: 'var(--border)' }} />
        </div>

        {/* 점수 */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-3 w-12 rounded animate-pulse" style={{ background: 'var(--border)' }} />
          <div className="h-12 w-32 rounded animate-pulse" style={{ background: 'var(--border)' }} />
          <div className="h-4 w-6 rounded animate-pulse" style={{ background: 'var(--border)' }} />
        </div>

        {/* 백분위 */}
        <div className="h-8 w-52 rounded-full animate-pulse" style={{ background: 'var(--border)' }} />
      </section>

      {/* Stats Grid */}
      <section className="w-full max-w-lg mb-8">
        <div className="h-3 w-16 rounded mb-4 animate-pulse" style={{ background: 'var(--border)' }} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md p-4 flex flex-col gap-2 animate-pulse"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="h-3 w-14 rounded" style={{ background: 'var(--border)' }} />
              <div className="h-6 w-20 rounded" style={{ background: 'var(--border)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Badge */}
      <section className="w-full max-w-lg">
        <div className="h-3 w-8 rounded mb-4 animate-pulse" style={{ background: 'var(--border)' }} />
        <div className="h-16 w-full rounded-md animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
      </section>
    </main>
  )
}
