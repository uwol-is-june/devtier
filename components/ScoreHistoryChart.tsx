'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type HistoryPoint = { score: number; recorded_at: string }

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, padding: '6px 10px', fontSize: '0.72rem', color: '#e6edf3' }}>
      <div style={{ color: '#8b949e', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#7CFF5B', fontWeight: 700 }}>{payload[0].value.toLocaleString('ko-KR')}점</div>
    </div>
  )
}

export function ScoreHistoryChart({ username }: { username: string }) {
  const [data, setData] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/score-history/${username}`)
      .then(r => r.json())
      .then(j => setData(j.history ?? []))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) return null
  if (data.length < 2) return null

  const chartData = data.map(p => ({ date: formatDate(p.recorded_at), score: p.score }))
  const scores = data.map(p => p.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const padding = Math.max(Math.round((maxScore - minScore) * 0.1), 50)

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.72)',
        border: '1px solid #30363d',
        borderRadius: 8,
        backdropFilter: 'blur(14px)',
        padding: '1.25rem 1.25rem 0.75rem',
      }}
    >
      <div style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: '0.52rem', letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        SCORE_HISTORY
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minScore - padding, maxScore + padding]}
            tick={{ fill: '#8b949e', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={v => v.toLocaleString('ko-KR')}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124,255,91,0.15)' }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#7CFF5B"
            strokeWidth={1.5}
            dot={{ fill: '#7CFF5B', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#7CFF5B', r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
