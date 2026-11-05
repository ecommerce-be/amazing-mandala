// Mandala generativo: forme deterministiche ricavate da un "seme" numerico.
// Stesso seme = stesso disegno, così la pagina non cambia a ogni caricamento.

const PALETTES = [
  ['#d7263d', '#f46036', '#f4c430', '#1b998b', '#2e6fdb', '#6a3fa0'],
  ['#0e3b43', '#1b998b', '#d8a441', '#b5446e', '#f2eee6', '#6a3fa0'],
  ['#2b211c', '#b8893b', '#eadbc4', '#c2410c', '#7c2d12', '#f4c430'],
  ['#1f2a44', '#d9a21b', '#e9dcc6', '#c2187a', '#2e6fdb', '#7cb518'],
]

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function petal(r0: number, r1: number, w: number, deg: number) {
  const a = (deg * Math.PI) / 180
  const ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux, m = (r0 + r1) / 2
  const p = (x: number, y: number) => `${(100 + x).toFixed(2)} ${(100 + y).toFixed(2)}`
  return `M${p(ux * r0, uy * r0)} Q${p(ux * m + px * w, uy * m + py * w)} ${p(ux * r1, uy * r1)} Q${p(ux * m - px * w, uy * m - py * w)} ${p(ux * r0, uy * r0)}Z`
}

export function GenerativeMandala({ seed, className }: { seed: number; className?: string }) {
  const rand = rng(seed)
  const pal = PALETTES[Math.floor(rand() * PALETTES.length)]
  const ink = pal[0]
  const shapes: React.ReactNode[] = []
  let r = 92
  let ring = 0

  while (r > 14) {
    const counts = [8, 12, 16, 24]
    const n = counts[Math.floor(rand() * counts.length)]
    const depth = 10 + rand() * 18
    const width = ((Math.PI * r) / n) * (0.6 + rand() * 0.55)
    const offset = rand() < 0.5 ? 0 : 180 / n
    const c1 = pal[1 + Math.floor(rand() * (pal.length - 1))]
    const c2 = pal[1 + Math.floor(rand() * (pal.length - 1))]
    for (let i = 0; i < n; i++) {
      shapes.push(
        <path
          key={`${ring}-${i}`}
          d={petal(r - depth, r, width, (360 / n) * i + offset - 90)}
          fill={i % 2 === 0 ? c1 : c2}
          stroke={ink}
          strokeWidth={0.6}
        />,
      )
    }
    // petali sottili intercalati, per riempire gli spazi
    if (rand() < 0.65) {
      const c3 = pal[1 + Math.floor(rand() * (pal.length - 1))]
      for (let i = 0; i < n; i++) {
        shapes.push(
          <path
            key={`${ring}-in-${i}`}
            d={petal(r - depth * 0.85, r - depth * 0.15, width * 0.38, (360 / n) * i + offset + 180 / n - 90)}
            fill={c3}
            stroke={ink}
            strokeWidth={0.5}
          />,
        )
      }
    }
    if (rand() < 0.6) {
      shapes.push(
        <circle key={`c-${ring}`} cx={100} cy={100} r={r - depth - 1} fill="none" stroke={c1} strokeWidth={0.8} strokeDasharray="1.5 2" />,
      )
    }
    r -= depth * (0.45 + rand() * 0.25)
    ring++
  }

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx={100} cy={100} r={96} fill={pal[0]} />
      {shapes}
      <circle cx={100} cy={100} r={8} fill={pal[3]} stroke={ink} strokeWidth={0.8} />
      <circle cx={100} cy={100} r={3} fill={pal[2]} />
    </svg>
  )
}
