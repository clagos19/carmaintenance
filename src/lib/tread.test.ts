import { describe, expect, it } from 'vitest'
import { TASKS_BY_ID } from '../data/tasks'
import type { Car, TireSet } from '../types'
import { dueLine } from './format'
import { resolveSpecs } from './specs'
import { taskStatus } from './status'
import { kmPer32nd, setWear, worstSet } from './tread'

const set = (kind: TireSet['kind'], readings: TireSet['readings'], name = 'Winter'): TireSet => ({ id: name, name, kind, mounted: true, readings })
const r = (km: number, FL: number, FR = FL, RL = FL, RR = FL, date = '2026-10-01T12:00:00Z') => ({ date, km, depths: { FL, FR, RL, RR } })

function car(tireSets: TireSet[]): Car {
  const { specs, sources } = resolveSpecs('Toyota', '4Runner')
  return {
    id: 'x', make: 'Toyota', model: '4Runner', year: 2021, color: '#ccc', odometerKm: 60000, odometerUpdatedAt: '2026-10-01T00:00:00Z',
    odometerLog: [], specs, sources, history: {}, appointments: [], profileComplete: false, createdAt: '2026-01-01T00:00:00Z', tireSets,
  }
}
const now = new Date('2026-10-29T12:00:00Z')

describe('tread', () => {
  it('flags winter tires earlier than all-season tires at the same depth', () => {
    expect(setWear(set('winter', [r(60000, 6)]))!.status).toBe('soon')
    expect(setWear(set('all-season', [r(60000, 6)]))!.status).toBe('ok')
    expect(setWear(set('winter', [r(60000, 5)]))!.status).toBe('overdue')
  })

  it('uses the most worn tire', () => {
    const w = setWear(set('all-season', [r(60000, 8, 7, 3, 8)]))!
    expect(w.pos).toBe('RL')
    expect(w.status).toBe('overdue')
  })

  it('projects km left from the wear rate', () => {
    const s = set('winter', [r(40000, 10), r(50000, 8)])
    expect(kmPer32nd(s)).toBe(5000)
    expect(setWear(s)!.kmLeft).toBe(15000)
  })

  it('drives the tire replacement job from the worst set', () => {
    const c = car([set('all-season', [r(60000, 7)], 'All-season'), set('winter', [r(55000, 6)])])
    expect(worstSet(c)!.set.name).toBe('Winter')
    const st = taskStatus(TASKS_BY_ID.tires, c, now)
    expect(st.status).toBe('soon')
    expect(dueLine(st, c)).toBe('6/32 on winter set, front left · replace at 5/32')
  })
})
