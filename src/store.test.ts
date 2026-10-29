import { describe, expect, it } from 'vitest'
import { addCar, applyReceipt, dailyKm, estimateKm, exportData, findReceipt } from './store'
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

describe('receipts', () => {
  it('links the history records a scan creates to its receipt', async () => {
    const car = addCar({ make: 'Toyota', model: '4Runner', year: 2021, odometerKm: 60000, profileComplete: false })
    applyReceipt(car.id, { id: 'r1', date: '2026-10-01T12:00:00Z', shop: 'Kal Tire', total: 120, summary: 'Oil change', taskIds: ['oil'], scannedAt: '2026-10-02T00:00:00Z' }, 60500)
    const backup = JSON.parse(await exportData()) as { cars: Car[]; receiptImages: object }
    expect(backup.receiptImages).toEqual({})
    const saved = backup.cars.find((c) => c.id === car.id)!
    const rec = saved.history.oil[saved.history.oil.length - 1]
    expect(rec.receiptId).toBe('r1')
    expect(findReceipt(saved, rec.receiptId)?.shop).toBe('Kal Tire')
  })
})
