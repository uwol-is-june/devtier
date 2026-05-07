'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  opacity: number; opacityDir: number; opacitySpeed: number
}

export default function ParticleCanvas({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w = window.innerWidth
    let h = window.innerHeight

    const setSize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const initParticles = () => {
      const count = Math.min(100, Math.floor((w * h) / 10000))
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        size: 0.8 + Math.random() * 1.8,
        opacity: 0.18 + Math.random() * 0.5,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        opacitySpeed: 0.002 + Math.random() * 0.003,
      }))
    }

    const drawGrid = () => {
      const step = 60
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(124,255,91,0.032)'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= w; x += step) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = 0; y <= h; y += step) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()

      ctx.strokeStyle = 'rgba(124,255,91,0.09)'
      ctx.lineWidth = 0.5
      for (let cx = 0; cx <= w; cx += step * 3) {
        for (let cy = 0; cy <= h; cy += step * 3) {
          ctx.beginPath()
          ctx.moveTo(cx - 5, cy)
          ctx.lineTo(cx + 5, cy)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(cx, cy - 5)
          ctx.lineTo(cx, cy + 5)
          ctx.stroke()
        }
      }
    }

    const loop = () => {
      ctx.clearRect(0, 0, w, h)
      drawGrid()

      const ps = particlesRef.current
      const { x: mx, y: my } = mouseRef.current
      const checkN = Math.min(55, ps.length)

      for (const p of ps) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) { p.vx *= -1; p.x = p.x < 0 ? 0 : w }
        if (p.y < 0 || p.y > h) { p.vy *= -1; p.y = p.y < 0 ? 0 : h }

        p.opacity += p.opacityDir * p.opacitySpeed
        if (p.opacity > 0.78 || p.opacity < 0.1) p.opacityDir *= -1

        const dx = p.x - mx
        const dy = p.y - my
        if (dx * dx + dy * dy < 16900) {
          p.vx += dx * 0.00013
          p.vy += dy * 0.00013
        }
      }

      for (let i = 0; i < checkN; i++) {
        for (let j = i + 1; j < checkN; j++) {
          const dx = ps[i].x - ps[j].x
          const dy = ps[i].y - ps[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < 10000) {
            const alpha = (0.13 * (1 - Math.sqrt(d2) / 100)).toFixed(3)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(124,255,91,${alpha})`
            ctx.lineWidth = 0.5
            ctx.moveTo(ps[i].x, ps[i].y)
            ctx.lineTo(ps[j].x, ps[j].y)
            ctx.stroke()
          }
        }
      }

      for (const p of ps) {
        const dx = p.x - mx
        const dy = p.y - my
        const near = dx * dx + dy * dy < 16900
        ctx.beginPath()
        ctx.arc(p.x, p.y, near ? p.size + 1 : p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(124,255,91,${(near ? Math.min(p.opacity + 0.35, 1) : p.opacity).toFixed(3)})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    setSize()
    initParticles()

    if (prefersReduced) {
      ctx.clearRect(0, 0, w, h)
      drawGrid()
    } else {
      rafRef.current = requestAnimationFrame(loop)
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onResize = () => {
      setSize()
      initParticles()
    }
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current)
      else if (!prefersReduced) rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} style={style} aria-hidden />
}
