import { describe, expect, it } from 'vitest'
import { dailyKm, estimateKm } from './store'
import type { Car } from './types'

const base = { specs: { annualKm: 18250 } } as Car

describe('KM auto', () => {
  it('uses the average from the user readings', () => {
    const c = { ...base, odometerLog: [{ km: 10000, date: '2026-09-01T00:00:00Z' }, { km: 11500, date: '2026-10-01T00:00:00Z' }] } as Car
    expect(dailyKm(c)).toBe(50)
  })

  it('falls back to km per year without enough readings', () => {
    expect(dailyKm({ ...base, odometerLog: [] } as unknown as Car)).toBe(50)
  })

  it('adds days since the last reading times the daily average', () => {
    const c = {
      ...base,
      odometerKm: 10000,
      odometerUpdatedAt: '2026-10-01T00:00:00Z',
      odometerLog: [{ km: 10000, date: '2026-10-01T00:00:00Z' }],
    } as Car
    expect(estimateKm(c, new Date('2026-10-11T00:00:00Z').getTime())).toBe(10500)
  })
})
