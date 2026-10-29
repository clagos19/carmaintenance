import { describe, expect, it } from 'vitest'
import { TASKS_BY_ID } from '../data/tasks'
import type { Car } from '../types'
import { resolveSpecs } from './specs'
import { nextSwapDate, taskStatus } from './status'

function car(odometerKm: number, history: Car['history'] = {}): Car {
  const { specs, sources } = resolveSpecs('Honda', 'Civic')
  return {
    id: 'x', make: 'Honda', model: 'Civic', year: 2020, color: '#ccc',
    odometerKm, odometerUpdatedAt: '2026-10-01T00:00:00Z', odometerLog: [],
    specs, sources, history, appointments: [], profileComplete: false, createdAt: '2026-10-01T00:00:00Z',
  }
}

const now = new Date('2026-10-29T12:00:00Z')

describe('taskStatus', () => {
  it('flags an oil change past its km interval as overdue', () => {
    const c = car(50000, { oil: [{ km: 41000, date: '2026-06-01T00:00:00Z' }] })
    const st = taskStatus(TASKS_BY_ID.oil, c, now)
    expect(st.status).toBe('overdue')
    expect(st.kmLeft).toBe(-1000)
  })

  it('marks a job inside the last 15% of its interval as soon', () => {
    const c = car(48000, { oil: [{ km: 41000, date: '2026-06-01T00:00:00Z' }] })
    expect(taskStatus(TASKS_BY_ID.oil, c, now).status).toBe('soon')
  })

  it('goes overdue on time even if km is low', () => {
    const c = car(42000, { oil: [{ km: 41000, date: '2025-09-01T00:00:00Z' }] })
    expect(taskStatus(TASKS_BY_ID.oil, c, now).status).toBe('overdue')
  })

  it('estimates the last service when there is no record', () => {
    const st = taskStatus(TASKS_BY_ID.oil, car(50000), now)
    expect(st.estimated).toBe(true)
    expect(st.dueKm).toBe(56000)
    expect(st.status).toBe('ok')
  })

  it('schedules seasonal swaps for mid-April and mid-October', () => {
    expect(new Date(nextSwapDate('2026-10-20T00:00:00Z')).getMonth()).toBe(3)
    expect(new Date(nextSwapDate('2026-04-20T00:00:00Z')).getMonth()).toBe(9)
  })
})

describe('resolveSpecs', () => {
  it('uses the spec sheet for known models and flags guesses as assumed', () => {
    const { specs, sources } = resolveSpecs('Honda', 'Civic')
    expect(specs.tireSize).toBe('215/55R16')
    expect(sources.tireSize).toBe('spec')
    expect(sources.drivingStyle).toBe('assumed')
  })

  it('falls back to body style guesses for unknown models', () => {
    const { specs, sources } = resolveSpecs('Ford', 'F-250 Super Duty')
    expect(specs.bodyType).toBe('truck')
    expect(sources.tireSize).toBe('assumed')
  })

  it('lets values the user entered win', () => {
    const { specs, sources } = resolveSpecs('Honda', 'Civic', { drivingStyle: 'severe' })
    expect(specs.drivingStyle).toBe('severe')
    expect(sources.drivingStyle).toBe('you')
  })
})
