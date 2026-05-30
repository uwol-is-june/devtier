'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/context/LangContext'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import type { WeaknessPercentile } from '@/lib/getScoreData'

const WEAK_THRESHOLD = 30

function CustomTick({
  x, y, payload, weakSet,
}: {
  x?: number | string
  y?: number | string
  payload?: { value: string }
  weakSet: Set<string>
}) {
  const isWeak = weakSet.has(payload?.value ?? '')
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill={isWeak ? '#FF4655' : 'rgba(255,255,255,0.45)'}
      fontSize={9}
      fontFamily="var(--font-orbitron), monospace"
      letterSpacing="0.08em"
    >
      {payload?.value}
    </text>
  )
}

export function WeaknessRadarChart({ data }: { data: WeaknessPercentile[] }) {
  const [mounted, setMounted] = useState(false)
  const { t } = useT()
  useEffect(() => { setMounted(true) }, [])

  if (!mounted || data.length === 0) return null

  const chartData = data.map(d => ({
    ...d,
    label: t.stats[d.key]?.label() ?? d.label,
    fullMark: 100,
  }))
  const weakSet = new Set(chartData.filter(d => d.pct < WEAK_THRESHOLD).map(d => d.label))
  const weakPoints = chartData.filter(d => d.pct < WEAK_THRESHOLD)

  return (
    <div className="stat-panel" style={{ marginTop: '1rem' }}>
      <div style={{
        fontFamily: 'var(--font-orbitron), monospace',
        fontSize: '0.5rem',
        letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.28)',
        marginBottom: '1rem',
      }}>
        WEAKNESS_ANALYSIS
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={chartData} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
          <PolarGrid stroke="rgba(48,54,61,0.9)" />
          <PolarAngleAxis
            dataKey="label"
            tick={(props) => <CustomTick {...props} weakSet={weakSet} />}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="pct"
            stroke="#7CFF5B"
            fill="#7CFF5B"
            fillOpacity={0.15}
            dot={(props: any) => {
              const isWeak = (props.payload?.pct ?? 100) < WEAK_THRESHOLD
              return (
                <circle
                  key={props.index}
                  cx={props.cx}
                  cy={props.cy}
                  r={3.5}
                  fill={isWeak ? '#FF4655' : '#7CFF5B'}
                />
              )
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {weakPoints.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
          {weakPoints.map(p => (
            <span
              key={p.key}
              style={{
                fontFamily: 'var(--font-orbitron), monospace',
                fontSize: '0.52rem',
                letterSpacing: '0.08em',
                color: '#FF4655',
                background: 'rgba(255,70,85,0.08)',
                border: '1px solid rgba(255,70,85,0.25)',
                borderRadius: '3px',
                padding: '0.15rem 0.45rem',
              }}
            >
              {t.weakness.bottom(p.label, 100 - p.pct)}
            </span>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '0.6rem',
        fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
        fontSize: '0.6rem',
        color: 'rgba(255,255,255,0.2)',
      }}>
        {t.weakness.desc}
      </div>
    </div>
  )
}
