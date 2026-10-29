import { useSyncExternalStore } from 'react'
import { resolveSpecs } from './lib/specs'
import type { Appointment, Car, CarSpecs, Receipt, SpecKey, TaskRecord } from './types'

const KEY = 'carmaint:v1'
const DAY = 86400000

interface State {
  cars: Car[]
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as State
      if (Array.isArray(s.cars)) return s
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return { cars: [] }
}

let state = applyKmAuto(load())
const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private mode: keep working in memory */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/**
 * Average km per day from the user's own readings (at least a week apart),
 * falling back to the yearly km in the car's specs.
 */
export function dailyKm(car: Car) {
  const log = car.odometerLog
  if (log.length >= 2) {
    const first = log[0]
    const last = log[log.length - 1]
    const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / DAY
    if (days >= 7 && last.km > first.km) return (last.km - first.km) / days
  }
  return car.specs.annualKm / 365
}

/** KM auto estimate: last real reading plus average daily km for each day since. */
export function estimateKm(car: Car, now = Date.now()) {
  const days = Math.max(0, Math.floor((now - new Date(car.odometerUpdatedAt).getTime()) / DAY))
  const anchor = car.odometerLog.length ? car.odometerLog[car.odometerLog.length - 1].km : car.odometerKm
  return Math.round(anchor + days * dailyKm(car))
}

function applyKmAuto(s: State): State {
  let changed = false
  const cars = s.cars.map((c) => {
    if (!c.kmAuto || !c.odometerLog.length) return c
    const est = estimateKm(c)
    if (est <= c.odometerKm) return c
    changed = true
    return { ...c, odometerKm: est, odometerEstimated: true }
  })
  return changed ? { ...s, cars } : s
}

/** Re-run KM auto when the app comes back to the foreground (iPhone keeps PWAs alive for days). */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const next = applyKmAuto(state)
      if (next !== state) set(next)
    }
  })
}

export function setKmAuto(id: string, on: boolean) {
  updateCar(id, (c) => applyKmAuto({ cars: [{ ...c, kmAuto: on }] }).cars[0])
}

export function useCars() {
  return useSyncExternalStore(subscribe, () => state.cars)
}

export function useCar(id: string | undefined) {
  const cars = useCars()
  return cars.find((c) => c.id === id)
}

function updateCar(id: string, fn: (c: Car) => Car) {
  set({ ...state, cars: state.cars.map((c) => (c.id === id ? fn(c) : c)) })
}

export interface NewCar {
  make: string
  model: string
  year: number
  trim?: string
  nickname?: string
  color?: string
  odometerKm?: number
  given?: Partial<CarSpecs>
  lastOilKm?: number
  profileComplete: boolean
}

export const CAR_COLORS = ['#c9ccd3', '#2b2f36', '#f4f4f2', '#b3262e', '#2f5fb3', '#6b7a5e', '#8a6a4b', '#4f5d73']

export function addCar(n: NewCar): Car {
  const now = new Date().toISOString()
  const { specs, sources } = resolveSpecs(n.make, n.model, n.given)
  const odo = n.odometerKm ?? 0
  const history: Record<string, TaskRecord[]> = {}
  if (n.lastOilKm !== undefined && n.lastOilKm <= odo) history.oil = [{ km: n.lastOilKm, date: now, note: 'Entered when adding the car' }]
  const car: Car = {
    id: Math.random().toString(36).slice(2, 10),
    make: n.make,
    model: n.model,
    year: n.year,
    trim: n.trim,
    nickname: n.nickname,
    color: n.color ?? CAR_COLORS[state.cars.length % CAR_COLORS.length],
    odometerKm: odo,
    odometerUpdatedAt: now,
    odometerLog: odo ? [{ km: odo, date: now }] : [],
    specs,
    sources,
    history,
    appointments: [],
    profileComplete: n.profileComplete,
    createdAt: now,
  }
  set({ ...state, cars: [...state.cars, car] })
  return car
}

export function removeCar(id: string) {
  set({ ...state, cars: state.cars.filter((c) => c.id !== id) })
}

export function setOdometer(id: string, km: number) {
  const date = new Date().toISOString()
  updateCar(id, (c) => {
    if (c.odometerKm === km && !c.odometerEstimated) return c
    return { ...c, odometerKm: km, odometerEstimated: false, odometerUpdatedAt: date, odometerLog: [...c.odometerLog, { km, date }].slice(-100) }
  })
}

export function setSpec<K extends SpecKey>(id: string, key: K, value: CarSpecs[K]) {
  updateCar(id, (c) => ({ ...c, specs: { ...c.specs, [key]: value }, sources: { ...c.sources, [key]: 'you' } }))
}

export function confirmSpec(id: string, key: SpecKey) {
  updateCar(id, (c) => ({ ...c, sources: { ...c.sources, [key]: 'you' } }))
}

export function updateCarInfo(id: string, patch: Partial<Pick<Car, 'nickname' | 'color' | 'trim' | 'year'>>) {
  updateCar(id, (c) => ({ ...c, ...patch }))
}

export function clearTask(id: string, taskId: string, rec: TaskRecord) {
  updateCar(id, (c) => {
    const list = [...(c.history[taskId] ?? []), rec].sort((a, b) => a.km - b.km || a.date.localeCompare(b.date))
    // Clearing a task means it is done, so drop appointments that only covered this task.
    const appointments = c.appointments
      .map((a) => ({ ...a, taskIds: a.taskIds.filter((t) => t !== taskId) }))
      .filter((a) => a.taskIds.length)
    return {
      ...c,
      history: { ...c.history, [taskId]: list },
      appointments,
      odometerKm: Math.max(c.odometerKm, rec.km),
    }
  })
}

export function removeRecord(id: string, taskId: string, index: number) {
  updateCar(id, (c) => ({ ...c, history: { ...c.history, [taskId]: (c.history[taskId] ?? []).filter((_, i) => i !== index) } }))
}

export function addAppointment(id: string, a: Appointment) {
  updateCar(id, (c) => ({ ...c, appointments: [...c.appointments, a].sort((x, y) => x.date.localeCompare(y.date)) }))
}

export function removeAppointment(id: string, index: number) {
  updateCar(id, (c) => ({ ...c, appointments: c.appointments.filter((_, i) => i !== index) }))
}

/** Apply a scanned receipt: clear each confirmed task and keep a record of the receipt. */
export function applyReceipt(id: string, r: Receipt, km: number) {
  const date = r.date
  for (const taskId of r.taskIds) clearTask(id, taskId, { km, date, note: r.shop ? `Receipt from ${r.shop}` : 'From a receipt' })
  updateCar(id, (c) => ({ ...c, receipts: [r, ...(c.receipts ?? [])].slice(0, 50) }))
}

export function exportData() {
  return JSON.stringify(state, null, 2)
}

export function importData(json: string) {
  const s = JSON.parse(json) as State
  if (!Array.isArray(s.cars)) throw new Error('Not a backup file')
  set(s)
}
