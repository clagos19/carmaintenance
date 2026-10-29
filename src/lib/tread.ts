import type { Car, Status, TireKind, TirePos, TireSet, TreadReading } from '../types'

export const POSITIONS: TirePos[] = ['FL', 'FR', 'RL', 'RR']
export const POS_LABEL: Record<TirePos, string> = { FL: 'Front left', FR: 'Front right', RL: 'Rear left', RR: 'Rear right' }

export const KIND_LABEL: Record<TireKind, string> = { winter: 'Winter', 'all-season': 'All-season', 'all-weather': 'All-weather', summer: 'Summer' }

/**
 * When to buy, in 32nds. Winter tires lose much of their snow grip below about 5/32, so they're flagged
 * earlier; 2/32 is the legal minimum for any tire.
 */
export const TREAD_LIMITS: Record<TireKind, { soon: number; replace: number }> = {
  winter: { soon: 6, replace: 5 },
  'all-weather': { soon: 5, replace: 4 },
  'all-season': { soon: 4, replace: 3 },
  summer: { soon: 4, replace: 3 },
}

/** Typical tread on a new tire, used to show how much is left. */
export const NEW_TREAD: Record<TireKind, number> = { winter: 11, 'all-weather': 11, 'all-season': 10, summer: 9 }

export const latest = (set: TireSet): TreadReading | undefined => set.readings[set.readings.length - 1]

/** The most worn tire in a reading. */
export function worst(r: TreadReading): { pos: TirePos; depth: number } | null {
  let out: { pos: TirePos; depth: number } | null = null
  for (const pos of POSITIONS) {
    const d = r.depths[pos]
    if (d !== undefined && (out === null || d < out.depth)) out = { pos, depth: d }
  }
  return out
}

export function depthStatus(kind: TireKind, depth: number): Exclude<Status, 'off'> {
  const l = TREAD_LIMITS[kind]
  return depth <= l.replace ? 'overdue' : depth <= l.soon ? 'soon' : 'ok'
}

/**
 * km driven per 32nd worn, from the first and last readings of a set (at least 2,000 km apart).
 * Only counts km while the set was being measured, so a winter set's off-season doesn't skew it.
 */
export function kmPer32nd(set: TireSet): number | null {
  if (set.readings.length < 2) return null
  const a = set.readings[0]
  const b = latest(set)!
  const wa = worst(a)
  const wb = worst(b)
  if (!wa || !wb) return null
  const km = b.km - a.km
  const worn = wa.depth - wb.depth
  if (km < 2000 || worn <= 0) return null
  return km / worn
}

export interface SetWear {
  set: TireSet
  pos: TirePos
  depth: number
  status: Exclude<Status, 'off'>
  replaceAt: number
  /** Projected km until the replace point, when the wear rate is known */
  kmLeft: number | null
}

export function setWear(set: TireSet): SetWear | null {
  const r = latest(set)
  const w = r && worst(r)
  if (!w) return null
  const replaceAt = TREAD_LIMITS[set.kind].replace
  const rate = kmPer32nd(set)
  return {
    set,
    ...w,
    status: depthStatus(set.kind, w.depth),
    replaceAt,
    kmLeft: rate === null ? null : Math.max(0, Math.round(((w.depth - replaceAt) * rate) / 500) * 500),
  }
}

const RANK = { overdue: 0, soon: 1, ok: 2 }

/** The set closest to needing replacement, across all measured sets. */
export function worstSet(car: Car): SetWear | null {
  const all = (car.tireSets ?? []).map(setWear).filter((w): w is SetWear => w !== null)
  all.sort((a, b) => RANK[a.status] - RANK[b.status] || a.depth - a.replaceAt - (b.depth - b.replaceAt))
  return all[0] ?? null
}
