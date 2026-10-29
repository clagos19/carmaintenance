import { useId } from 'react'
import type { BodyType, Powertrain, ViewId } from '../types'

/**
 * Car illustrations with transparent backgrounds so they sit on the page like cut-out PNGs.
 * Hotspot positions are in percent of each view's box, so overlays line up at any size.
 */

export const VIEWBOX: Record<ViewId, { w: number; h: number }> = {
  side: { w: 400, h: 180 },
  top: { w: 220, h: 400 },
  engine: { w: 400, h: 300 },
}

const pct = (view: ViewId, x: number, y: number) => ({ x: (x / VIEWBOX[view].w) * 100, y: (y / VIEWBOX[view].h) * 100 })

export const SPOTS: Record<ViewId, Record<string, { x: number; y: number }>> = {
  side: {
    wheelFront: pct('side', 80, 112),
    brakes: pct('side', 96, 132),
    tireRear: pct('side', 300, 152),
    wheelRear: pct('side', 318, 118),
    suspension: pct('side', 290, 92),
    diff: pct('side', 250, 150),
    rocker: pct('side', 200, 128),
  },
  top: {
    headlights: pct('top', 62, 46),
    wipers: pct('top', 110, 140),
    cabin: pct('top', 142, 160),
    wheelFL: pct('top', 36, 100),
    wheelFR: pct('top', 184, 100),
  },
  engine: {
    oilcap: pct('engine', 236, 116),
    coolant: pct('engine', 326, 118),
    radiator: pct('engine', 200, 262),
    airbox: pct('engine', 78, 108),
    brakefluid: pct('engine', 118, 62),
    battery: pct('engine', 80, 206),
    plugs: pct('engine', 180, 150),
    belt: pct('engine', 150, 222),
    trans: pct('engine', 272, 198),
    timing: pct('engine', 252, 176),
    washer: pct('engine', 330, 212),
  },
}

interface ArtProps {
  body: BodyType
  color: string
  powertrain?: Powertrain
}

/** Lighten or darken a hex colour by a fraction (-1..1). */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))))
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// ---------------------------------------------------------------- side view

const SIDE_BODY: Record<BodyType, string> = {
  sedan:
    'M26 132 C18 130 16 118 20 110 C24 102 32 99 44 97 L132 88 C150 76 168 62 192 58 L262 56 C284 58 302 72 318 84 L366 90 C378 92 384 100 384 112 L382 128 C381 132 378 134 372 134 L340 134 A32 32 0 0 0 276 134 L124 134 A32 32 0 0 0 60 134 Z',
  hatchback:
    'M26 132 C18 130 16 118 20 110 C24 102 32 99 44 97 L134 88 C152 76 170 62 194 58 L292 56 C318 58 344 70 364 84 C376 92 380 102 380 114 L379 128 C378 132 375 134 370 134 L340 134 A32 32 0 0 0 276 134 L124 134 A32 32 0 0 0 60 134 Z',
  suv:
    'M24 134 C16 132 14 118 18 106 C22 96 32 92 46 90 L128 82 C142 66 160 50 180 44 L336 42 C352 42 366 48 374 60 L382 84 C386 96 386 112 384 128 C383 133 380 136 374 136 L342 136 A34 34 0 0 0 274 136 L126 136 A34 34 0 0 0 58 136 Z',
  truck:
    'M22 134 C14 132 12 118 16 104 C20 92 30 88 44 86 L122 80 C134 64 146 50 160 46 L226 46 C232 46 236 50 236 56 L238 84 L382 84 C386 84 388 88 388 92 L388 128 C388 133 384 136 378 136 L342 136 A34 34 0 0 0 274 136 L126 136 A34 34 0 0 0 58 136 Z',
}

const SIDE_GLASS: Record<BodyType, string> = {
  sedan: 'M146 88 C160 76 174 66 194 63 L258 61 C278 63 292 74 304 86 Z',
  hatchback: 'M148 88 C162 76 176 66 196 63 L290 61 C312 63 332 72 350 84 Z',
  suv: 'M138 82 C150 68 164 56 182 50 L332 48 C344 48 352 54 356 62 L360 82 Z',
  truck: 'M132 80 C142 66 152 56 164 52 L222 52 C226 52 228 55 228 58 L229 80 Z',
}

const SIDE_PILLARS: Record<BodyType, number[]> = {
  sedan: [226],
  hatchback: [232, 306],
  suv: [238, 302],
  truck: [196],
}

function Wheel({ cx, cy, r, gid }: { cx: number; cy: number; r: number; gid: string }) {
  const spokes = [0, 72, 144, 216, 288]
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#24272d" />
      <circle cx={cx} cy={cy} r={r - 3} fill="none" stroke="#3a3e46" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill={`url(#${gid}-rim)`} />
      {spokes.map((a) => (
        <rect key={a} x={cx - 2.2} y={cy - r * 0.58} width="4.4" height={r * 0.5} rx="2" fill="#aeb4bd" transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.16} fill="#8d939c" />
    </g>
  )
}

export function SideView({ body, color }: ArtProps) {
  const id = useId().replace(/:/g, '')
  const big = body === 'suv' || body === 'truck'
  const wy = big ? 136 : 134
  const r = big ? 28 : 26
  const base = big ? 136 : 134
  return (
    <svg viewBox="0 0 400 180" className="art" role="img" aria-label="Side view of the car">
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(color, 0.35)} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor={shade(color, -0.35)} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5d6878" />
          <stop offset="0.6" stopColor="#2b323d" />
          <stop offset="1" stopColor="#1d222a" />
        </linearGradient>
        <radialGradient id={`${id}-rim`}>
          <stop offset="0" stopColor="#e9ecef" />
          <stop offset="1" stopColor="#9aa1ab" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="202" cy={base + 26} rx="182" ry="9" fill="#0b1220" opacity="0.18" filter={`url(#${id}-blur)`} />
      <path d={SIDE_BODY[body]} fill={`url(#${id}-paint)`} stroke={shade(color, -0.45)} strokeWidth="1" />
      {/* shoulder highlight */}
      <path d={body === 'truck' ? 'M40 96 L236 92 M240 94 L384 94' : 'M40 104 L376 100'} stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <path d={SIDE_GLASS[body]} fill={`url(#${id}-glass)`} />
      {SIDE_PILLARS[body].map((x) => (
        <rect key={x} x={x - 3} y="40" width="6" height="50" fill={shade(color, -0.2)} clipPath={`url(#${id}-gclip)`} />
      ))}
      <clipPath id={`${id}-gclip`}>
        <path d={SIDE_GLASS[body]} />
      </clipPath>
      {/* door seams and handles */}
      <path d={`M${SIDE_PILLARS[body][0]} 90 L${SIDE_PILLARS[body][0] - 2} 128`} stroke={shade(color, -0.4)} strokeOpacity="0.6" fill="none" />
      {body !== 'truck' && <path d={`M150 90 L148 128 M${(SIDE_PILLARS[body][1] ?? 300)} 88 L${(SIDE_PILLARS[body][1] ?? 300) + 2} 120`} stroke={shade(color, -0.4)} strokeOpacity="0.5" fill="none" />}
      <rect x={SIDE_PILLARS[body][0] - 30} y="100" width="16" height="4" rx="2" fill={shade(color, -0.3)} />
      <rect x={SIDE_PILLARS[body][0] + 22} y="100" width="16" height="4" rx="2" fill={shade(color, -0.3)} />
      {/* lights */}
      <path d="M22 106 C26 100 34 99 44 98 L46 106 C38 107 30 108 22 108 Z" fill="#fff6d6" stroke="#d8cfa8" strokeWidth="0.8" />
      <rect x={body === 'truck' ? 382 : body === 'sedan' ? 372 : 374} y={body === 'sedan' ? 94 : 90} width="8" height="14" rx="3" fill="#d6363d" />
      {/* mirror */}
      <path d={body === 'truck' ? 'M124 80 L136 72 L142 80 Z' : body === 'suv' ? 'M130 82 L142 72 L148 82 Z' : 'M136 88 L148 80 L154 88 Z'} fill={shade(color, -0.25)} />
      {/* rocker and bumpers */}
      <path d={`M124 ${base - 4} L276 ${base - 4}`} stroke="#000" strokeOpacity="0.18" strokeWidth="4" />
      <Wheel cx={92} cy={wy} r={r} gid={id} />
      <Wheel cx={308} cy={wy} r={r} gid={id} />
    </svg>
  )
}

// ---------------------------------------------------------------- top view

export function TopView({ body, color }: ArtProps) {
  const id = useId().replace(/:/g, '')
  const len = body === 'truck' ? 360 : body === 'suv' ? 350 : body === 'hatchback' ? 320 : 345
  const top = (400 - len) / 2
  const bot = top + len
  const w = body === 'truck' || body === 'suv' ? 136 : 128
  const left = (220 - w) / 2
  const right = left + w
  const glassFront = top + 102
  const roofStart = glassFront + 42
  const roofEnd = body === 'suv' ? bot - 62 : body === 'hatchback' ? bot - 56 : body === 'truck' ? roofStart + 64 : bot - 108
  const rearGlassEnd = body === 'suv' || body === 'hatchback' ? bot - 34 : body === 'truck' ? roofEnd + 10 : roofEnd + 36
  return (
    <svg viewBox="0 0 220 400" className="art art-tall" role="img" aria-label="Top view of the car">
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(color, -0.3)} />
          <stop offset="0.25" stopColor={color} />
          <stop offset="0.5" stopColor={shade(color, 0.3)} />
          <stop offset="0.75" stopColor={color} />
          <stop offset="1" stopColor={shade(color, -0.3)} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#56606f" />
          <stop offset="1" stopColor="#222831" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect x={left + 4} y={top + 10} width={w - 8} height={len - 4} rx="40" fill="#0b1220" opacity="0.2" filter={`url(#${id}-blur)`} />
      {/* wheels peeking out */}
      {[top + 62, bot - 82].map((y) => (
        <g key={y}>
          <rect x={left - 7} y={y} width="16" height="46" rx="6" fill="#24272d" />
          <rect x={right - 9} y={y} width="16" height="46" rx="6" fill="#24272d" />
        </g>
      ))}
      <path
        d={`M${left + 18} ${top + 14} Q110 ${top - 6} ${right - 18} ${top + 14} Q${right} ${top + 22} ${right} ${top + 60} L${right} ${bot - 40} Q${right} ${bot} ${right - 30} ${bot} L${left + 30} ${bot} Q${left} ${bot} ${left} ${bot - 40} L${left} ${top + 60} Q${left} ${top + 22} ${left + 18} ${top + 14} Z`}
        fill={`url(#${id}-paint)`}
        stroke={shade(color, -0.45)}
      />
      {/* hood crease */}
      <path d={`M${left + 34} ${top + 30} L${left + 40} ${glassFront - 6} M${right - 34} ${top + 30} L${right - 40} ${glassFront - 6}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="2" />
      {/* windshield */}
      <path d={`M${left + 14} ${glassFront + 8} Q110 ${glassFront - 8} ${right - 14} ${glassFront + 8} L${right - 18} ${roofStart} L${left + 18} ${roofStart} Z`} fill={`url(#${id}-glass)`} />
      {/* wiper blades */}
      <path d={`M${left + 26} ${glassFront + 10} L${left + 70} ${glassFront + 4} M${left + 74} ${glassFront + 8} L${left + 116} ${glassFront + 2}`} stroke="#15181d" strokeWidth="2.4" strokeLinecap="round" />
      {/* roof */}
      <rect x={left + 18} y={roofStart} width={w - 36} height={roofEnd - roofStart} rx="10" fill={shade(color, 0.12)} />
      <path d={`M${left + 14} ${roofStart + 4} L${left + 14} ${roofEnd} M${right - 14} ${roofStart + 4} L${right - 14} ${roofEnd}`} stroke={`url(#${id}-glass)`} strokeWidth="5" />
      {/* rear glass */}
      <path d={`M${left + 18} ${roofEnd} L${right - 18} ${roofEnd} L${right - 22} ${rearGlassEnd} Q110 ${rearGlassEnd + 6} ${left + 22} ${rearGlassEnd} Z`} fill={`url(#${id}-glass)`} />
      {body === 'truck' && (
        <rect x={left + 12} y={rearGlassEnd + 12} width={w - 24} height={bot - rearGlassEnd - 26} rx="6" fill={shade(color, -0.35)} stroke={shade(color, -0.5)} />
      )}
      {/* mirrors */}
      <ellipse cx={left - 6} cy={glassFront + 22} rx="9" ry="5" fill={shade(color, -0.2)} />
      <ellipse cx={right + 6} cy={glassFront + 22} rx="9" ry="5" fill={shade(color, -0.2)} />
      {/* lights */}
      <path d={`M${left + 8} ${top + 26} Q${left + 22} ${top + 10} ${left + 44} ${top + 8} L${left + 44} ${top + 16} Q${left + 24} ${top + 20} ${left + 10} ${top + 34} Z`} fill="#fff6d6" />
      <path d={`M${right - 8} ${top + 26} Q${right - 22} ${top + 10} ${right - 44} ${top + 8} L${right - 44} ${top + 16} Q${right - 24} ${top + 20} ${right - 10} ${top + 34} Z`} fill="#fff6d6" />
      <rect x={left + 10} y={bot - 8} width="30" height="5" rx="2.5" fill="#d6363d" />
      <rect x={right - 40} y={bot - 8} width="30" height="5" rx="2.5" fill="#d6363d" />
    </svg>
  )
}

// ---------------------------------------------------------------- engine bay

export function EngineView({ color, powertrain }: ArtProps) {
  const id = useId().replace(/:/g, '')
  const ev = powertrain === 'ev'
  return (
    <svg viewBox="0 0 400 300" className="art" role="img" aria-label="Under the hood">
      <defs>
        <linearGradient id={`${id}-bay`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3f48" />
          <stop offset="1" stopColor="#23272e" />
        </linearGradient>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(color, -0.3)} />
          <stop offset="0.5" stopColor={shade(color, 0.2)} />
          <stop offset="1" stopColor={shade(color, -0.3)} />
        </linearGradient>
        <linearGradient id={`${id}-cover`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c838e" />
          <stop offset="1" stopColor="#4a5059" />
        </linearGradient>
        <linearGradient id={`${id}-tank`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3f1ea" />
          <stop offset="1" stopColor="#cfccc2" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <path d="M40 30 L360 30 L392 260 Q392 292 360 292 L40 292 Q8 292 8 260 Z" fill="#0b1220" opacity="0.18" filter={`url(#${id}-blur)`} transform="translate(0 8)" />
      {/* fenders */}
      <path d="M36 24 L364 24 L394 258 Q394 288 362 288 L38 288 Q6 288 6 258 Z" fill={`url(#${id}-paint)`} />
      {/* bay */}
      <path d="M54 40 L346 40 L370 250 Q370 272 348 272 L52 272 Q30 272 30 250 Z" fill={`url(#${id}-bay)`} />
      {/* cowl */}
      <rect x="58" y="40" width="284" height="14" rx="4" fill="#191c21" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <rect key={i} x={70 + i * 22} y="44" width="14" height="5" rx="2" fill="#2c3037" />
      ))}
      {/* radiator */}
      <rect x="92" y="246" width="216" height="22" rx="4" fill="#1a1d22" />
      {Array.from({ length: 26 }, (_, i) => (
        <rect key={i} x={98 + i * 8} y="249" width="3" height="16" fill="#3b4049" />
      ))}
      {ev ? (
        <g>
          {/* front trunk and power electronics */}
          <rect x="128" y="84" width="144" height="128" rx="16" fill="#555b65" />
          <rect x="138" y="94" width="124" height="108" rx="12" fill="#646b76" stroke="#7b828d" />
          <text x="200" y="154" textAnchor="middle" fontSize="13" fontFamily="-apple-system, system-ui" fill="#c7ccd3" fontWeight="600" letterSpacing="2">FRUNK</text>
          <rect x="246" y="168" width="48" height="36" rx="6" fill="#2f343c" />
          <path d="M256 186 h28 M270 176 v20" stroke="#f59e0b" strokeWidth="2" />
        </g>
      ) : (
        <g>
          {/* intake */}
          <rect x="44" y="76" width="70" height="66" rx="10" fill="#15171b" />
          <rect x="50" y="82" width="58" height="10" rx="3" fill="#24272d" />
          <path d="M114 108 C134 108 136 112 148 112" stroke="#15171b" strokeWidth="18" fill="none" strokeLinecap="round" />
          {/* engine block and cover */}
          <rect x="138" y="82" width="132" height="132" rx="18" fill="#2b2f36" />
          <rect x="146" y="90" width="116" height="104" rx="14" fill={`url(#${id}-cover)`} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={160 + i * 24} y="140" width="14" height="22" rx="4" fill="#2f343b" stroke="#8a919b" strokeWidth="0.8" />
          ))}
          <text x="186" y="124" textAnchor="middle" fontSize="11" fontFamily="-apple-system, system-ui" fill="#d7dbe0" fontWeight="600" letterSpacing="1.5">ENGINE</text>
          {/* oil cap */}
          <circle cx="236" cy="114" r="10" fill="#f2c94c" stroke="#b08c1d" strokeWidth="1.5" />
          <path d="M231 114 h10" stroke="#8a6d13" strokeWidth="2" />
          {/* dipstick */}
          <circle cx="158" cy="200" r="6" fill="none" stroke="#f2c94c" strokeWidth="3" />
          {/* belt and pulleys */}
          <g>
            <circle cx="150" cy="226" r="11" fill="#5f6670" />
            <circle cx="196" cy="230" r="8" fill="#5f6670" />
            <circle cx="236" cy="226" r="10" fill="#5f6670" />
            <path d="M140 222 Q196 210 246 222 M141 232 Q196 244 245 230" stroke="#111" strokeWidth="3" fill="none" />
          </g>
          {/* transmission */}
          <rect x="270" y="176" width="34" height="40" rx="8" fill="#3d424b" />
          <circle cx="287" cy="190" r="5" fill="#d64545" />
        </g>
      )}
      {/* battery */}
      <rect x="48" y="174" width="66" height="54" rx="6" fill="#2e333a" />
      <rect x="52" y="178" width="58" height="10" rx="3" fill="#43484f" />
      <rect x="58" y="168" width="10" height="8" rx="2" fill="#d64545" />
      <rect x="94" y="168" width="10" height="8" rx="2" fill="#5b6068" />
      {/* brake fluid */}
      <rect x="102" y="56" width="34" height="24" rx="6" fill={`url(#${id}-tank)`} />
      <rect x="104" y="66" width="30" height="12" rx="4" fill="#d9a441" opacity="0.7" />
      <circle cx="119" cy="58" r="6" fill="#20232a" />
      {/* coolant */}
      <rect x="300" y="88" width="54" height="62" rx="10" fill={`url(#${id}-tank)`} />
      <rect x="303" y="112" width="48" height="35" rx="7" fill="#f472b6" opacity="0.55" />
      <circle cx="327" cy="92" r="9" fill="#20232a" />
      <path d="M306 108 h10 M306 130 h10" stroke="#8b8a83" strokeWidth="1.5" />
      {/* washer */}
      <rect x="306" y="186" width="50" height="46" rx="10" fill={`url(#${id}-tank)`} />
      <rect x="309" y="204" width="44" height="25" rx="6" fill="#60a5fa" opacity="0.55" />
      <circle cx="330" cy="190" r="7" fill="#2563eb" />
    </svg>
  )
}

export function CarArt({ view, ...p }: ArtProps & { view: ViewId }) {
  if (view === 'top') return <TopView {...p} />
  if (view === 'engine') return <EngineView {...p} />
  return <SideView {...p} />
}
