export const STYLES = `
/* ── Keyframes ── */

@keyframes cyber-glitch-1 {
  0%, 91%, 100% { clip-path: inset(100% 0 0 0); transform: translate(0); opacity: 0; }
  92% { clip-path: inset(8% 0 82% 0);  transform: translate(-4px, 2px);  opacity: 1; }
  93% { clip-path: inset(55% 0 25% 0); transform: translate(3px, -2px);  opacity: 1; }
  94% { clip-path: inset(28% 0 52% 0); transform: translate(-2px, 3px);  opacity: 1; }
  95% { clip-path: inset(78% 0 5% 0);  transform: translate(4px, -1px);  opacity: 1; }
  96% { clip-path: inset(42% 0 42% 0); transform: translate(-3px, 1px);  opacity: 1; }
  97% { clip-path: inset(2% 0 90% 0);  transform: translate(2px, -3px);  opacity: 1; }
  98% { clip-path: inset(100% 0 0 0);  transform: translate(0);          opacity: 0; }
}

@keyframes cyber-glitch-2 {
  0%, 93%, 100% { clip-path: inset(100% 0 0 0); transform: translate(0); opacity: 0; }
  94% { clip-path: inset(38% 0 52% 0); transform: translate(4px, -1px);  opacity: 1; color: #ff2266; }
  95% { clip-path: inset(68% 0 22% 0); transform: translate(-3px, 2px);  opacity: 1; color: #00ffcc; }
  96% { clip-path: inset(18% 0 77% 0); transform: translate(2px, -3px);  opacity: 1; }
  97% { clip-path: inset(53% 0 38% 0); transform: translate(-4px, 1px);  opacity: 1; color: #ff2266; }
  98% { clip-path: inset(100% 0 0 0);  transform: translate(0);          opacity: 0; }
}

@keyframes neon-pulse {
  0%, 100% {
    text-shadow:
      0 0 8px rgba(124,255,91,0.95),
      0 0 18px rgba(124,255,91,0.6),
      0 0 36px rgba(124,255,91,0.3),
      0 0 72px rgba(124,255,91,0.12);
  }
  50% {
    text-shadow:
      0 0 4px rgba(124,255,91,0.4),
      0 0 10px rgba(124,255,91,0.18);
  }
}

@keyframes scanline-move {
  0%   { transform: translateY(-100px); opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { transform: translateY(110vh);  opacity: 0; }
}

@keyframes fade-blur-in {
  from { opacity: 0; transform: translateY(22px); filter: blur(8px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
}

@keyframes float-y {
  0%, 100% { transform: translateY(0);     }
  50%       { transform: translateY(-12px); }
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

@keyframes hud-ping {
  0%, 100% { opacity: 0.22; }
  50%       { opacity: 0.85; }
}

@keyframes status-pulse {
  0%, 100% { box-shadow: 0 0 0 0   rgba(124,255,91,0.9); }
  70%       { box-shadow: 0 0 0 8px rgba(124,255,91,0);   }
}

@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0);   opacity: 0.35; }
  50%       { transform: translateY(6px); opacity: 1;    }
}

@keyframes hero-enter {
  from { opacity: 0; transform: translateY(28px); filter: blur(10px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0);    }
}

@keyframes border-glow {
  0%, 100% {
    box-shadow:
      0 0 6px  rgba(124,255,91,0.12),
      0 0 12px rgba(124,255,91,0.06),
      inset 0 0 8px rgba(124,255,91,0.03);
  }
  50% {
    box-shadow:
      0 0 20px rgba(124,255,91,0.28),
      0 0 40px rgba(124,255,91,0.1),
      inset 0 0 16px rgba(124,255,91,0.06);
  }
}

@keyframes cta-glow-pulse {
  0%, 100% {
    background:
      radial-gradient(ellipse 50% 35% at 50% 50%,
        rgba(124,255,91,0.06) 0%, transparent 70%);
  }
  50% {
    background:
      radial-gradient(ellipse 60% 45% at 50% 50%,
        rgba(124,255,91,0.12) 0%, transparent 70%);
  }
}

/* ── Glitch Title ── */

.glitch-wrap {
  position: relative;
  display: inline-block;
}

.glitch-title {
  font-family: var(--font-orbitron), monospace;
  font-weight: 900;
  color: #7CFF5B;
  letter-spacing: 0.04em;
  line-height: 1;
  font-size: clamp(3.2rem, 11vw, 9rem);
  animation: neon-pulse 4s ease-in-out infinite;
  position: relative;
  z-index: 1;
  margin: 0;
}

.glitch-layer {
  position: absolute;
  inset: 0;
  font-family: var(--font-orbitron), monospace;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1;
  font-size: clamp(3.2rem, 11vw, 9rem);
  pointer-events: none;
  white-space: nowrap;
}

.glitch-layer-1 {
  color: #7CFF5B;
  animation: cyber-glitch-1 7s linear infinite;
}

.glitch-layer-2 {
  color: #7CFF5B;
  animation: cyber-glitch-2 7s linear infinite;
  animation-delay: 0.09s;
}

/* ── Navigation ── */

.cyber-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 2.5rem;
  background: rgba(0,0,0,0.52);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(124,255,91,0.07);
  transition: background 0.3s;
}

.nav-logo {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: #7CFF5B;
  letter-spacing: 0.14em;
  text-shadow: 0 0 12px rgba(124,255,91,0.55);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.58rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  transition: color 0.2s, text-shadow 0.2s;
}

.nav-link:hover {
  color: #7CFF5B;
  text-shadow: 0 0 10px rgba(124,255,91,0.7);
}

/* ── Status Badge ── */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-orbitron), monospace;
  font-size: 0.56rem;
  letter-spacing: 0.2em;
  color: rgba(124,255,91,0.7);
  border: 1px solid rgba(124,255,91,0.18);
  padding: 0.38rem 1.1rem;
  border-radius: 100px;
  background: rgba(124,255,91,0.04);
  backdrop-filter: blur(4px);
  animation: hero-enter 0.8s ease both;
}

.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #7CFF5B;
  flex-shrink: 0;
  animation: status-pulse 2.2s ease-in-out infinite;
}

/* ── HUD Corners ── */

.hud-corner {
  position: absolute;
  width: 22px;
  height: 22px;
  animation: hud-ping 3.8s ease-in-out infinite;
}
.hud-tl { top: 20px; left: 20px; border-top: 1.5px solid rgba(124,255,91,0.65); border-left: 1.5px solid rgba(124,255,91,0.65); }
.hud-tr { top: 20px; right: 20px; border-top: 1.5px solid rgba(124,255,91,0.65); border-right: 1.5px solid rgba(124,255,91,0.65); animation-delay: 0.7s; }
.hud-bl { bottom: 20px; left: 20px; border-bottom: 1.5px solid rgba(124,255,91,0.65); border-left: 1.5px solid rgba(124,255,91,0.65); animation-delay: 1.4s; }
.hud-br { bottom: 20px; right: 20px; border-bottom: 1.5px solid rgba(124,255,91,0.65); border-right: 1.5px solid rgba(124,255,91,0.65); animation-delay: 2.1s; }

/* ── Feature Cards ── */

.feature-card {
  position: relative;
  overflow: hidden;
  background: rgba(0, 255, 70, 0.022);
  border: 1px solid rgba(124,255,91,0.1);
  border-radius: 8px;
  padding: 2rem;
  opacity: 0;
  transform: translateY(28px);
  filter: blur(5px);
  transition:
    opacity 0.75s ease,
    transform 0.75s ease,
    filter 0.75s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
  transform-style: preserve-3d;
  will-change: transform;
}

.feature-card.is-visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.feature-card:hover {
  border-color: rgba(124,255,91,0.42);
  box-shadow: 0 0 24px rgba(124,255,91,0.1), 0 0 60px rgba(124,255,91,0.04);
}

.card-shine {
  position: absolute;
  top: 0; left: -120%;
  width: 55%; height: 100%;
  background: linear-gradient(
    108deg,
    transparent 20%,
    rgba(124,255,91,0.045) 50%,
    transparent 80%
  );
  transition: left 0.65s ease;
  pointer-events: none;
}

.feature-card:hover .card-shine { left: 160%; }

/* ── Buttons ── */

.btn-primary {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  background: #7CFF5B;
  color: #000;
  border: none;
  padding: 0.9rem 2.4rem;
  border-radius: 4px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.2s;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
}

.btn-primary:hover {
  box-shadow:
    0 0 16px rgba(124,255,91,0.65),
    0 0 40px rgba(124,255,91,0.28),
    0 0 80px rgba(124,255,91,0.08);
  transform: translateY(-2px) scale(1.02);
}

.btn-outline {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.63rem;
  font-weight: 400;
  letter-spacing: 0.16em;
  background: transparent;
  color: rgba(124,255,91,0.75);
  border: 1px solid rgba(124,255,91,0.32);
  padding: 0.9rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s, box-shadow 0.3s, transform 0.2s;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
}

.btn-outline:hover {
  border-color: rgba(124,255,91,0.72);
  color: #7CFF5B;
  box-shadow: 0 0 12px rgba(124,255,91,0.18);
  transform: translateY(-2px);
}

/* ── Terminal ── */

.terminal {
  background: rgba(0,0,0,0.92);
  border: 1px solid rgba(124,255,91,0.22);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace;
  width: 100%;
  max-width: 520px;
  animation: border-glow 4s ease-in-out infinite;
}

.terminal-bar {
  background: rgba(124,255,91,0.055);
  border-bottom: 1px solid rgba(124,255,91,0.14);
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.t-dot { width: 11px; height: 11px; border-radius: 50%; }
.t-dot-r { background: #FF5F57; }
.t-dot-y { background: #FEBC2E; }
.t-dot-g { background: #28C840; }

.terminal-title {
  font-family: var(--font-space-grotesk), system-ui, sans-serif;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.35);
  margin-left: 0.5rem;
}

.terminal-body {
  padding: 1.25rem 1.5rem;
  font-size: 0.8rem;
  line-height: 2;
}

.t-prompt  { color: rgba(124,255,91,0.55); }
.t-cmd     { color: rgba(255,255,255,0.8);  }
.t-cursor  { color: #7CFF5B; animation: cursor-blink 1.1s step-end infinite; }
.t-key     { color: rgba(124,255,91,0.85); }
.t-str     { color: #FFA857; }
.t-num     { color: #79C0FF; }
.t-comment { color: rgba(255,255,255,0.28); }
.t-line    { display: block; }

/* ── Stat Panel ── */

.stat-panel {
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(124,255,91,0.1);
  border-radius: 8px;
  padding: 1.75rem;
  animation: border-glow 5s ease-in-out infinite;
}

.stat-panel-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(124,255,91,0.07);
}

.stat-panel-label {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.58rem;
  letter-spacing: 0.22em;
  color: rgba(124,255,91,0.45);
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.stat-key {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.45);
}

.stat-val {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #7CFF5B;
}

/* ── Tier Rows ── */

.tier-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.55rem 0;
}

.tier-name {
  font-family: var(--font-orbitron), monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  min-width: 64px;
}

.tier-bar-track {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.07);
  border-radius: 2px;
  overflow: hidden;
}

.tier-bar-fill {
  height: 100%;
  border-radius: 2px;
  width: 0;
  transition: width 1.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.tier-bar-fill.animate {
  width: var(--tw);
}

.tier-range {
  font-family: var(--font-space-grotesk), system-ui, sans-serif;
  font-size: 0.58rem;
  color: rgba(255,255,255,0.3);
  min-width: 76px;
  text-align: right;
}

/* ── Section transitions ── */

.section-anim-child {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(4px);
  transition: opacity 0.65s ease, transform 0.65s ease, filter 0.65s ease;
}

.section-visible .section-anim-child:nth-child(1) { opacity:1; transform:translateY(0); filter:blur(0); transition-delay: 0s;    }
.section-visible .section-anim-child:nth-child(2) { opacity:1; transform:translateY(0); filter:blur(0); transition-delay: 0.12s; }
.section-visible .section-anim-child:nth-child(3) { opacity:1; transform:translateY(0); filter:blur(0); transition-delay: 0.24s; }
.section-visible .section-anim-child:nth-child(4) { opacity:1; transform:translateY(0); filter:blur(0); transition-delay: 0.36s; }
.section-visible .section-anim-child:nth-child(5) { opacity:1; transform:translateY(0); filter:blur(0); transition-delay: 0.48s; }
.section-visible .section-anim-child:nth-child(6) { opacity:1; transform:translateY(0); filter:blur(0); transition-delay: 0.60s; }

/* ── Responsive ── */

@media (max-width: 768px) {
  .cyber-nav { padding: 0.75rem 1.2rem; }
  .nav-links  { gap: 1.4rem; }
  .nav-link   { font-size: 0.52rem; }
}

@media (max-width: 540px) {
  .nav-links { display: none; }
  .cyber-nav { justify-content: center; }
}
`
