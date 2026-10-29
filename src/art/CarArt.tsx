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
    brakes: pct('side', 100, 125),
    tireRear: pct('side', 300, 152),
    wheelRear: pct('side', 318, 118),
    suspension: pct('side', 290, 92),
    diff: pct('side', 250, 150),
    rocker: pct('side', 200, 140),
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

interface SideShape {
  /** Wheel radius, wheel centre height and the arch radius around it */
  r: number
  cy: number
  arch: number
  /** Height of the sill between the wheels */
  sill: number
  roof: number
  /** The sharp highlight along the shoulder crease */
  shoulder: number
  body: string
  /** Side window opening */
  dlo: string
  pillars: [number, number][]
  doors: string
  handles: number[]
  mirror: string
  headlight: string
  tail: string
  intake: string
  /** Black plastic around the arches and along the sill */
  cladding?: boolean
  extra?: string
}

const ARCH = (cx: number, cy: number, ra: number, y: number) => {
  const dx = Math.sqrt(ra * ra - (y - cy) * (y - cy))
  return { l: cx - dx, r: cx + dx }
}

function shape(s: Omit<SideShape, 'body'> & { outline: (f: { l: number; r: number }, b: { l: number; r: number }) => string }): SideShape {
  const f = ARCH(92, s.cy, s.arch, s.sill)
  const b = ARCH(308, s.cy, s.arch, s.sill)
  return { ...s, body: s.outline(f, b) }
}

const SIDE: Record<BodyType, SideShape> = {
  sedan: shape({
    r: 26, cy: 134, arch: 30, sill: 146, roof: 53, shoulder: 103,
    outline: (f, b) =>
      `M30 146 C20 146 15 138 15 128 L16 116 C16 110 19 106 26 104 C60 98 100 93 140 89 C160 78 182 64 205 57 C225 53 260 53 280 56 C305 61 325 75 342 85 C358 86 372 87 382 89 C386 92 387 98 386 106 L384 128 C383 138 378 146 368 146 L${b.r} 146 A30 30 0 1 0 ${b.l} 146 L${f.r} 146 A30 30 0 1 0 ${f.l} 146 Z`,
    dlo: 'M148 92 C164 80 184 67 208 62 L272 60.5 C289 62.5 302 72 312 85 L311 88 L148 93 Z',
    pillars: [[226, 233], [289, 293]],
    doors: 'M139 92 C135 110 133 126 128 139 L278 139 M229.5 92 L228 139 M311 88 C306 102 294 112 281 118',
    handles: [192, 270],
    mirror: 'M147 92 C147 86 151 82.5 158 82.5 C163 82.5 165 85.5 163.5 88.5 C162 91.5 155 93.5 147 92 Z',
    headlight: 'M17 113 C18 107 23 105 31 104 L66 99.5 C63 104 54 108 42 110 Z',
    tail: 'M386 102 C386 95 383 91 377 90.5 L348 88.5 C352 93 362 98 376 101 Z',
    intake: 'M15 135 L42 137.5 C42 141 40 144 37 146 L28 146 C21 145.5 17 141 15 135 Z',
  }),
  hatchback: shape({
    r: 26, cy: 134, arch: 30, sill: 146, roof: 52, shoulder: 103,
    outline: (f, b) =>
      `M40 146 C30 146 26 138 26 128 L27 116 C27 110 31 106 38 104 C70 98 106 93 140 89 C160 76 182 62 206 56 C240 52 290 52 320 55 C336 57 350 62 358 70 C364 76 368 86 371 96 L372 126 C372 138 368 146 360 146 L${b.r} 146 A30 30 0 1 0 ${b.l} 146 L${f.r} 146 A30 30 0 1 0 ${f.l} 146 Z`,
    dlo: 'M148 92 C164 79 184 65 208 60 L312 58 C325 60 333 67 337 76 L339 87 L148 93 Z',
    pillars: [[228, 235], [298, 302]],
    doors: 'M139 92 C135 110 133 126 128 139 L278 139 M231.5 92 L230 139 M312 88 C309 101 298 112 283 118',
    handles: [194, 276],
    mirror: 'M147 92 C147 86 151 82.5 158 82.5 C163 82.5 165 85.5 163.5 88.5 C162 91.5 155 93.5 147 92 Z',
    headlight: 'M28 113 C29 107 34 105 42 104 L74 99 C71 104 62 108 50 110 Z',
    tail: 'M371.5 92 C364 90.5 357 91 352 94 C356 99 364 103 372 104 Z',
    intake: 'M26 135 L52 137.5 C52 141 50 144 47 146 L38 146 C31 145.5 28 141 26 135 Z',
  }),
  suv: shape({
    r: 28, cy: 136, arch: 33, sill: 143, roof: 37, shoulder: 95,
    outline: (f, b) =>
      `M26 143 C18 143 13 136 13 126 L13 108 C13 100 17 95 26 93 C60 88 100 84 134 80 C150 66 170 50 192 42 C230 38 300 37 352 38 C366 39 374 44 378 52 L385 80 L387 124 C387 136 383 143 374 143 L${b.r} 143 A33 33 0 1 0 ${b.l} 143 L${f.r} 143 A33 33 0 1 0 ${f.l} 143 Z`,
    dlo: 'M142 85 C156 71 172 57 194 48.5 L344 45.5 C352 45.5 358 49 362 55 L369 80 L142 86 Z',
    pillars: [[234, 241], [300, 306]],
    doors: 'M133 85 C129 104 128 120 126 132 M237.5 85 L237 136 M305 82 C305 99 301 109 289 115',
    handles: [198, 280],
    mirror: 'M141 85 C141 78 146 74.5 154 74.5 C159 74.5 161.5 78 160 81 C158.5 84.5 150 86.5 141 85 Z',
    headlight: 'M14 103 C16 97 21 95 29 94 L68 89.5 C65 94.5 56 99 42 101 Z',
    tail: 'M377 55 C380 61 383 70 384.5 82 L385 98 C381.5 98 379 95.5 378.5 92 L376 61 Z',
    intake: 'M13 128 L40 130 C40 136 38 141 34 143 L26 143 C18 143 14 137 13 128 Z',
    cladding: true,
    extra: 'M214 40.8 L336 39.8',
  }),
  truck: shape({
    r: 29, cy: 136, arch: 34, sill: 143, roof: 40, shoulder: 92,
    outline: (f, b) =>
      `M24 143 C16 143 12 136 12 126 L12 100 C12 92 16 88 24 87 C60 84 100 81 136 79 C148 64 160 50 176 42 L236 40 C242 40 245 43 246 48 L248 84 L386 82 C389 82 390 84 390 87 L390 126 C390 137 386 143 378 143 L${b.r} 143 A34 34 0 1 0 ${b.l} 143 L${f.r} 143 A34 34 0 1 0 ${f.l} 143 Z`,
    dlo: 'M142 83 C152 70 162 56 178 48.5 L233 47 C236.5 47 238.5 49.5 238.5 53 L239.5 82 Z',
    pillars: [[196, 202]],
    doors: 'M137 83 C133 104 131 120 128 132 M199 83 L199 136 M241 82 L241 136 M249 84 L249 136 M383 84 L383 136',
    handles: [176, 228],
    mirror: 'M140 83 C140 75 145 71.5 153 71.5 C158 71.5 160.5 75 159 78.5 C157.5 82.5 149 85 140 83 Z',
    headlight: 'M13 96 C14 91 18 89 26 88 L62 85.5 C60 90.5 51 94.5 38 96.5 L13 98.5 Z',
    tail: 'M384.5 86 L389.5 86 L389.5 114 L384.5 114 Z',
    intake: 'M12 126 L38 128 C38 135 36 141 32 143 L24 143 C16 143 12 137 12 126 Z',
    cladding: true,
    extra: 'M250 86.5 L382 85',
  }),
}

/** Five twin-spoke alloy with the brake disc showing through. */
function Wheel({ cx, cy, r, gid, caliper }: { cx: number; cy: number; r: number; gid: string; caliper?: boolean }) {
  const rim = r * 0.68
  const spokes: string[] = []
  for (let i = 0; i < 5; i++) {
    for (const off of [-9, 9]) {
      const a = ((i * 72 + off - 90) * Math.PI) / 180
      const n = a + Math.PI / 2
      const p = (rad: number, w: number, s: number) => `${(cx + Math.cos(a) * rad + Math.cos(n) * w * s).toFixed(2)} ${(cy + Math.sin(a) * rad + Math.sin(n) * w * s).toFixed(2)}`
      const w0 = 1.1, w1 = 1.9
      spokes.push(`M${p(rim * 0.26, w0, -1)} L${p(rim - 1.2, w1, -1)} L${p(rim - 1.2, w1, 1)} L${p(rim * 0.26, w0, 1)} Z`)
    }
  }
  const ca = (-48 * Math.PI) / 180
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gid}-tire)`} />
      <circle cx={cx} cy={cy} r={r - 2.2} fill="none" stroke="#3a3d43" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={rim + 1.4} fill="#1a1c20" />
      <circle cx={cx} cy={cy} r={rim} fill="#2a2d33" />
      {/* brake disc and caliper, seen through the spokes */}
      <circle cx={cx} cy={cy} r={rim * 0.8} fill={`url(#${gid}-disc)`} />
      {caliper !== false && (
        <path
          d={`M${cx + Math.cos(ca - 0.5) * rim * 0.84} ${cy + Math.sin(ca - 0.5) * rim * 0.84} A${rim * 0.84} ${rim * 0.84} 0 0 1 ${cx + Math.cos(ca + 0.5) * rim * 0.84} ${cy + Math.sin(ca + 0.5) * rim * 0.84} L${cx + Math.cos(ca + 0.45) * rim * 0.5} ${cy + Math.sin(ca + 0.45) * rim * 0.5} A${rim * 0.5} ${rim * 0.5} 0 0 0 ${cx + Math.cos(ca - 0.45) * rim * 0.5} ${cy + Math.sin(ca - 0.45) * rim * 0.5} Z`}
          fill="#4b5058"
          stroke="#2a2d32"
          strokeWidth="0.6"
        />
      )}
      <g fill={`url(#${gid}-spoke)`}>
        {spokes.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={rim} fill="none" stroke={`url(#${gid}-lip)`} strokeWidth="2.2" />
      <circle cx={cx} cy={cy} r={rim * 0.3} fill={`url(#${gid}-spoke)`} stroke="#6f757e" strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r={rim * 0.13} fill="#3a3e45" />
      {/* soft gloss across the rim */}
      <circle cx={cx} cy={cy} r={rim} fill={`url(#${gid}-gloss)`} />
    </g>
  )
}

export function SideView({ body, color }: ArtProps) {
  const id = useId().replace(/:/g, '')
  const s = SIDE[body]
  const ground = s.cy + s.r
  const span = s.sill - s.roof
  const at = (y: number) => Math.max(0, Math.min(1, (y - s.roof) / span))
  const sh = at(s.shoulder)
  const dark = shade(color, -0.45)
  const archPath = (cx: number) => {
    const a = ARCH(cx, s.cy, s.arch, s.sill)
    return `M${a.l} ${s.sill} A${s.arch} ${s.arch} 0 1 1 ${a.r} ${s.sill}`
  }
  return (
    <svg viewBox="0 0 400 180" className="art" role="img" aria-label="Side view of the car">
      <defs>
        <linearGradient id={`${id}-paint`} gradientUnits="userSpaceOnUse" x1="0" y1={s.roof} x2="0" y2={s.sill}>
          <stop offset="0" stopColor={shade(color, 0.5)} />
          <stop offset={sh * 0.55} stopColor={shade(color, 0.22)} />
          <stop offset={sh - 0.03} stopColor={shade(color, 0.1)} />
          <stop offset={sh} stopColor={shade(color, 0.55)} />
          <stop offset={sh + 0.025} stopColor={shade(color, 0.08)} />
          <stop offset={sh + (1 - sh) * 0.45} stopColor={color} />
          <stop offset={sh + (1 - sh) * 0.8} stopColor={shade(color, -0.25)} />
          <stop offset="1" stopColor={shade(color, -0.5)} />
        </linearGradient>
        <linearGradient id={`${id}-ends`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.12" stopColor="#000" stopOpacity="0" />
          <stop offset="0.86" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#9aa6b5" />
          <stop offset="0.45" stopColor="#3c4552" />
          <stop offset="1" stopColor="#161a20" />
        </linearGradient>
        <linearGradient id={`${id}-head`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#dfe6ee" />
          <stop offset="1" stopColor="#8d99a8" />
        </linearGradient>
        <linearGradient id={`${id}-tail`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b6b" />
          <stop offset="0.5" stopColor="#c81e2a" />
          <stop offset="1" stopColor="#7d0f18" />
        </linearGradient>
        <radialGradient id={`${id}-tire`}>
          <stop offset="0.66" stopColor="#30333a" />
          <stop offset="0.8" stopColor="#24272c" />
          <stop offset="1" stopColor="#101113" />
        </radialGradient>
        <radialGradient id={`${id}-disc`}>
          <stop offset="0.35" stopColor="#5d626a" />
          <stop offset="0.4" stopColor="#8f949b" />
          <stop offset="1" stopColor="#6b7078" />
        </radialGradient>
        <linearGradient id={`${id}-spoke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6f8" />
          <stop offset="0.5" stopColor="#b9bfc7" />
          <stop offset="1" stopColor="#80868f" />
        </linearGradient>
        <linearGradient id={`${id}-lip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f8fa" />
          <stop offset="1" stopColor="#7c828b" />
        </linearGradient>
        <radialGradient id={`${id}-gloss`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${id}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <clipPath id={`${id}-body`}>
          <path d={s.body} />
        </clipPath>
        <clipPath id={`${id}-above`}>
          <rect x="0" y="0" width="400" height={s.sill} />
        </clipPath>
        <clipPath id={`${id}-dlo`}>
          <path d={s.dlo} />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx="200" cy={ground + 1} rx="186" ry="8" fill="#0b1220" opacity="0.22" filter={`url(#${id}-blur)`} />
      <rect x="40" y={ground - 4} width="320" height="6" rx="3" fill="#0b1220" opacity="0.3" filter={`url(#${id}-soft)`} />

      {/* body */}
      <path d={s.body} fill={`url(#${id}-paint)`} />
      <g clipPath={`url(#${id}-body)`}>
        <rect x="0" y="0" width="400" height="180" fill={`url(#${id}-ends)`} />
        {/* crease below the shoulder highlight, and a lower body line */}
        <path d={`M10 ${s.shoulder + 1.6} C140 ${s.shoulder - 3} 260 ${s.shoulder - 5} 392 ${s.shoulder - 6}`} stroke="#000" strokeOpacity="0.12" strokeWidth="1.4" fill="none" transform={`translate(0 ${0})`} />
        <path d={`M120 ${s.sill - 14} C200 ${s.sill - 16} 250 ${s.sill - 16} 284 ${s.sill - 15}`} stroke="#fff" strokeOpacity="0.18" strokeWidth="1" fill="none" />
        <rect x="0" y={s.sill - 7} width="400" height="8" fill="#000" opacity="0.22" />
        {s.cladding && (
          <g fill="#2b2e34">
            <rect x="0" y={s.sill - 9} width="400" height="10" />
            <path d={`${archPath(92)} Z`} stroke="#2b2e34" strokeWidth="9" fill="none" />
            <path d={`${archPath(308)} Z`} stroke="#2b2e34" strokeWidth="9" fill="none" />
          </g>
        )}
        <path d={s.intake} fill="#1d1f24" />
      </g>

      {/* wheel wells */}
      <g clipPath={`url(#${id}-above)`}>
        <circle cx="92" cy={s.cy} r={s.arch} fill="#0e0f12" />
        <circle cx="308" cy={s.cy} r={s.arch} fill="#0e0f12" />
      </g>
      <path d={archPath(92)} stroke="#fff" strokeOpacity={s.cladding ? 0.08 : 0.3} strokeWidth="1" fill="none" />
      <path d={archPath(308)} stroke="#fff" strokeOpacity={s.cladding ? 0.08 : 0.3} strokeWidth="1" fill="none" />

      {/* glass */}
      <path d={s.dlo} fill="#14171c" stroke="#14171c" strokeWidth="3" strokeLinejoin="round" />
      <path d={s.dlo} fill={`url(#${id}-glass)`} />
      <g clipPath={`url(#${id}-dlo)`}>
        <path d="M150 100 L230 30 L262 30 L182 100 Z" fill="#fff" opacity="0.1" />
        <path d="M250 100 L320 30 L334 30 L264 100 Z" fill="#fff" opacity="0.07" />
        {s.pillars.map(([a, b]) => (
          <rect key={a} x={a} y="0" width={b - a} height="120" fill="#14171c" />
        ))}
      </g>
      {s.extra && <path d={s.extra} stroke={body === 'suv' ? '#2b2e34' : body === 'truck' ? shade(color, -0.35) : shade(color, -0.3)} strokeWidth={body === 'suv' ? 3 : 1.2} strokeLinecap="round" fill="none" />}

      {/* panels */}
      <path d={s.doors} stroke={dark} strokeOpacity="0.55" strokeWidth="0.9" fill="none" />
      {s.handles.map((x) => (
        <g key={x}>
          <rect x={x} y={s.shoulder + 1} width="17" height="3.6" rx="1.8" fill={shade(color, -0.32)} />
          <rect x={x + 1} y={s.shoulder + 1} width="15" height="1.2" rx="0.6" fill="#fff" opacity="0.45" />
        </g>
      ))}

      {/* lights */}
      <path d={s.headlight} fill={`url(#${id}-head)`} stroke="#5b6573" strokeWidth="0.7" />
      <path d={s.headlight} fill="none" stroke="#fff" strokeWidth="1.2" strokeDasharray="0" opacity="0.6" transform="translate(1 -0.6)" />
      <path d={s.tail} fill={`url(#${id}-tail)`} stroke="#5e0b12" strokeWidth="0.6" />

      {/* mirror */}
      <path d={s.mirror} fill={`url(#${id}-paint)`} stroke={dark} strokeOpacity="0.6" strokeWidth="0.7" />

      <Wheel cx={92} cy={s.cy} r={s.r} gid={id} />
      <Wheel cx={308} cy={s.cy} r={s.r} gid={id} />
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
  const outline = `M${left + 22} ${top + 7} C${left + 50} ${top - 2} ${right - 50} ${top - 2} ${right - 22} ${top + 7} C${right - 5} ${top + 13} ${right + 1} ${top + 40} ${right + 1} ${top + 72} C${right + 1} ${top + 120} ${right - 3} ${top + 150} ${right - 3} ${(top + bot) / 2} C${right - 3} ${bot - 130} ${right + 1} ${bot - 110} ${right + 1} ${bot - 74} C${right + 1} ${bot - 30} ${right - 5} ${bot - 5} ${right - 26} ${bot - 1} C${right - 50} ${bot + 2} ${left + 50} ${bot + 2} ${left + 26} ${bot - 1} C${left + 5} ${bot - 5} ${left - 1} ${bot - 30} ${left - 1} ${bot - 74} C${left - 1} ${bot - 110} ${left + 3} ${bot - 130} ${left + 3} ${(top + bot) / 2} C${left + 3} ${top + 150} ${left - 1} ${top + 120} ${left - 1} ${top + 72} C${left - 1} ${top + 40} ${left + 5} ${top + 13} ${left + 22} ${top + 7} Z`
  const inset = 15
  const windshield = `M${left + 12} ${glassFront + 10} C${left + 40} ${glassFront - 4} ${right - 40} ${glassFront - 4} ${right - 12} ${glassFront + 10} L${right - inset - 2} ${roofStart} C${right - 40} ${roofStart - 4} ${left + 40} ${roofStart - 4} ${left + inset + 2} ${roofStart} Z`
  const roof = `M${left + inset + 2} ${roofStart} C${left + 40} ${roofStart - 4} ${right - 40} ${roofStart - 4} ${right - inset - 2} ${roofStart} L${right - inset} ${roofEnd} C${right - 40} ${roofEnd + 3} ${left + 40} ${roofEnd + 3} ${left + inset} ${roofEnd} Z`
  const rearGlass = `M${left + inset} ${roofEnd} C${left + 40} ${roofEnd + 3} ${right - 40} ${roofEnd + 3} ${right - inset} ${roofEnd} L${right - 18} ${rearGlassEnd} C${right - 44} ${rearGlassEnd + 6} ${left + 44} ${rearGlassEnd + 6} ${left + 18} ${rearGlassEnd} Z`
  const sideGlass = (x0: number, x1: number) => `M${x0} ${glassFront + 16} L${x1} ${roofStart + 2} L${x1} ${roofEnd - 2} L${x0} ${body === 'truck' ? roofEnd : roofEnd + 6} Z`
  return (
    <svg viewBox="0 0 220 400" className="art art-tall" role="img" aria-label="Top view of the car">
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(color, -0.45)} />
          <stop offset="0.12" stopColor={shade(color, -0.1)} />
          <stop offset="0.32" stopColor={color} />
          <stop offset="0.5" stopColor={shade(color, 0.28)} />
          <stop offset="0.68" stopColor={color} />
          <stop offset="0.88" stopColor={shade(color, -0.1)} />
          <stop offset="1" stopColor={shade(color, -0.45)} />
        </linearGradient>
        <linearGradient id={`${id}-roof`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(color, -0.2)} />
          <stop offset="0.3" stopColor={shade(color, 0.15)} />
          <stop offset="0.45" stopColor={shade(color, 0.42)} />
          <stop offset="0.6" stopColor={shade(color, 0.15)} />
          <stop offset="1" stopColor={shade(color, -0.2)} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#8b97a6" />
          <stop offset="0.5" stopColor="#323a46" />
          <stop offset="1" stopColor="#161a20" />
        </linearGradient>
        <linearGradient id={`${id}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9aa5b3" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${id}-ws`}>
          <path d={windshield} />
        </clipPath>
      </defs>
      <path d={outline} fill="#0b1220" opacity="0.28" filter={`url(#${id}-blur)`} transform="translate(0 5)" />
      {/* tires just showing past the body */}
      {[top + 62, bot - 82].map((y) => (
        <g key={y} fill="#1b1d21">
          <rect x={left - 5} y={y} width="12" height="46" rx="5" />
          <rect x={right - 7} y={y} width="12" height="46" rx="5" />
        </g>
      ))}
      <path d={outline} fill={`url(#${id}-paint)`} stroke={shade(color, -0.5)} strokeOpacity="0.5" strokeWidth="0.8" />
      {/* hood creases and panel gaps */}
      <path d={`M${left + 30} ${top + 18} C${left + 34} ${top + 50} ${left + 36} ${top + 80} ${left + 30} ${glassFront + 4} M${right - 30} ${top + 18} C${right - 34} ${top + 50} ${right - 36} ${top + 80} ${right - 30} ${glassFront + 4}`} stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
      <path d={`M${left + 8} ${top + 26} C${left + 40} ${top + 16} ${right - 40} ${top + 16} ${right - 8} ${top + 26}`} stroke={shade(color, -0.5)} strokeOpacity="0.4" strokeWidth="0.8" fill="none" />
      {/* cowl */}
      <path d={`M${left + 10} ${glassFront + 9} C${left + 40} ${glassFront - 6} ${right - 40} ${glassFront - 6} ${right - 10} ${glassFront + 9} L${right - 12} ${glassFront + 13} C${right - 40} ${glassFront} ${left + 40} ${glassFront} ${left + 12} ${glassFront + 13} Z`} fill="#1a1d22" />
      {/* side windows */}
      <path d={sideGlass(left + 5, left + inset)} fill="#20252c" />
      <path d={sideGlass(right - 5, right - inset)} fill="#20252c" />
      <path d={windshield} fill={`url(#${id}-glass)`} />
      <g clipPath={`url(#${id}-ws)`}>
        <path d={`M${left} ${roofStart} L${left + 60} ${glassFront - 6} L${left + 84} ${glassFront - 6} L${left + 24} ${roofStart} Z`} fill="#fff" opacity="0.12" />
      </g>
      {/* wiper blades */}
      <path d={`M${left + 26} ${glassFront + 10} L${left + 70} ${glassFront + 4} M${left + 74} ${glassFront + 8} L${left + 116} ${glassFront + 2}`} stroke="#0f1114" strokeWidth="2.2" strokeLinecap="round" />
      <path d={roof} fill={`url(#${id}-roof)`} />
      {body === 'suv' && <path d={`M${left + inset + 6} ${roofStart + 8} L${left + inset + 6} ${roofEnd - 6} M${right - inset - 6} ${roofStart + 8} L${right - inset - 6} ${roofEnd - 6}`} stroke="#25282e" strokeWidth="3.5" strokeLinecap="round" />}
      {body === 'sedan' && <rect x={left + 34} y={roofStart + 12} width={w - 68} height="34" rx="6" fill={`url(#${id}-glass)`} opacity="0.85" />}
      <path d={rearGlass} fill={`url(#${id}-glass)`} />
      {body === 'truck' && (
        <g>
          <rect x={left + 10} y={rearGlassEnd + 12} width={w - 20} height={bot - rearGlassEnd - 24} rx="5" fill="#26292e" stroke={shade(color, -0.4)} strokeWidth="2" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={left + 22 + i * ((w - 50) / 6)} y={rearGlassEnd + 18} width="3" height={bot - rearGlassEnd - 36} rx="1.5" fill="#33373d" />
          ))}
        </g>
      )}
      {/* trunk or hatch gap */}
      {body === 'sedan' && <path d={`M${left + 14} ${bot - 62} C${left + 44} ${bot - 56} ${right - 44} ${bot - 56} ${right - 14} ${bot - 62}`} stroke={shade(color, -0.5)} strokeOpacity="0.4" strokeWidth="0.8" fill="none" />}
      {/* mirrors */}
      {[-1, 1].map((d) => {
        const x = d < 0 ? left : right
        return <path key={d} d={`M${x} ${glassFront + 18} L${x + d * 13} ${glassFront + 20} C${x + d * 15} ${glassFront + 21} ${x + d * 15} ${glassFront + 28} ${x + d * 12} ${glassFront + 29} L${x} ${glassFront + 28} Z`} fill={shade(color, -0.15)} stroke="#1a1d22" strokeWidth="1" />
      })}
      {/* lights */}
      <path d={`M${left + 6} ${top + 22} C${left + 12} ${top + 10} ${left + 24} ${top + 5} ${left + 42} ${top + 4} L${left + 44} ${top + 9} C${left + 26} ${top + 11} ${left + 15} ${top + 17} ${left + 8} ${top + 28} Z`} fill={`url(#${id}-head)`} stroke="#6b7480" strokeWidth="0.6" />
      <path d={`M${right - 6} ${top + 22} C${right - 12} ${top + 10} ${right - 24} ${top + 5} ${right - 42} ${top + 4} L${right - 44} ${top + 9} C${right - 26} ${top + 11} ${right - 15} ${top + 17} ${right - 8} ${top + 28} Z`} fill={`url(#${id}-head)`} stroke="#6b7480" strokeWidth="0.6" />
      <path d={`M${left + 5} ${bot - 18} C${left + 10} ${bot - 6} ${left + 20} ${bot - 2} ${left + 40} ${bot - 1} L${left + 40} ${bot - 5} C${left + 22} ${bot - 6} ${left + 12} ${bot - 10} ${left + 7} ${bot - 22} Z`} fill="#c81e2a" />
      <path d={`M${right - 5} ${bot - 18} C${right - 10} ${bot - 6} ${right - 20} ${bot - 2} ${right - 40} ${bot - 1} L${right - 40} ${bot - 5} C${right - 22} ${bot - 6} ${right - 12} ${bot - 10} ${right - 7} ${bot - 22} Z`} fill="#c81e2a" />
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
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${154 + i * 12} 96 L${150 + i * 12} 132`} stroke="#5a616b" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          ))}
          <ellipse cx="204" cy="178" rx="14" ry="7" fill="#3a4049" stroke="#9aa1ab" strokeWidth="1" />
          {/* hoses and wiring */}
          <path d="M160 246 C150 236 132 232 130 214" stroke="#141619" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M262 246 C276 236 296 230 300 152" stroke="#141619" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M120 176 C130 168 136 150 146 146 M114 190 C128 196 132 210 140 214" stroke="#2a2d33" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <rect x="276" y="62" width="44" height="22" rx="4" fill="#1d2025" stroke="#2f343b" />
          {/* oil cap */}
          <circle cx="236" cy="114" r="10" fill="#e7bf3f" stroke="#8f7015" strokeWidth="1.5" />
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
      <rect x="303" y="112" width="48" height="35" rx="7" fill="#f2a6c8" opacity="0.5" />
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
