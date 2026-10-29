import { useSyncExternalStore } from 'react'
import { resolveSpecs } from './lib/specs'
import { allReceiptImages, deleteReceiptImage, saveReceiptImage } from './lib/receiptImages'
import type { Appointment, Car, CarPhoto, CarSpecs, Receipt, SpecKey, TaskRecord, TireKind, TreadReading, ViewId } from './types'

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

/** Set when the last save failed, usually because photos filled the phone's storage for this site. */
export let storageFull = false

function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    storageFull = false
  } catch {
    // Private mode or quota exceeded: keep working in memory.
    storageFull = true
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
  const gone = state.cars.find((c) => c.id === id)
  set({ ...state, cars: state.cars.filter((c) => c.id !== id) })
  for (const r of gone?.receipts ?? []) if (r.id && r.hasImage) deleteReceiptImage(r.id).catch(() => {})
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

export function setAlerts(id: string, taskId: string, on: boolean) {
  updateCar(id, (c) => ({ ...c, alerts: { ...c.alerts, [taskId]: on } }))
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
  for (const taskId of r.taskIds) clearTask(id, taskId, { km, date, note: r.shop ? `Receipt from ${r.shop}` : 'From a receipt', receiptId: r.id })
  updateCar(id, (c) => ({ ...c, receipts: [r, ...(c.receipts ?? [])] }))
}

/** Save a receipt's photo, then mark the receipt as having one. */
export async function attachReceiptImage(carId: string, receiptId: string, dataUrl: string) {
  await saveReceiptImage(receiptId, dataUrl)
  updateCar(carId, (c) => ({ ...c, receipts: (c.receipts ?? []).map((r) => (r.id === receiptId ? { ...r, hasImage: true } : r)) }))
}

export function findReceipt(car: Car, receiptId: string | undefined) {
  return receiptId ? car.receipts?.find((r) => r.id === receiptId) : undefined
}

export function setPhoto(id: string, view: ViewId, photo: CarPhoto | null) {
  updateCar(id, (c) => {
    const photos = { ...(c.photos ?? {}) }
    if (photo) photos[view] = photo
    else delete photos[view]
    return { ...c, photos }
  })
}

export function setPhotoSpot(id: string, view: ViewId, key: string, pt: { x: number; y: number }) {
  updateCar(id, (c) => {
    const p = c.photos?.[view]
    if (!p) return c
    return { ...c, photos: { ...c.photos, [view]: { ...p, spots: { ...p.spots, [key]: pt } } } }
  })
}

// ---------------------------------------------------------------- tires

export function addTireSet(carId: string, name: string, kind: TireKind) {
  const id = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
  updateCar(carId, (c) => {
    const sets = c.tireSets ?? []
    return { ...c, tireSets: [...sets, { id, name, kind, mounted: sets.length === 0, readings: [] }] }
  })
  return id
}

export function removeTireSet(carId: string, setId: string) {
  updateCar(carId, (c) => ({ ...c, tireSets: (c.tireSets ?? []).filter((s) => s.id !== setId) }))
}

/** Put one set on the car; the others come off. */
export function mountTireSet(carId: string, setId: string) {
  updateCar(carId, (c) => ({ ...c, tireSets: (c.tireSets ?? []).map((s) => ({ ...s, mounted: s.id === setId })) }))
}

export function addTreadReading(carId: string, setId: string, r: TreadReading) {
  updateCar(carId, (c) => ({
    ...c,
    tireSets: (c.tireSets ?? []).map((s) =>
      s.id === setId ? { ...s, readings: [...s.readings, r].sort((a, b) => a.date.localeCompare(b.date) || a.km - b.km) } : s,
    ),
  }))
}

export function removeTreadReading(carId: string, setId: string, index: number) {
  updateCar(carId, (c) => ({
    ...c,
    tireSets: (c.tireSets ?? []).map((s) => (s.id === setId ? { ...s, readings: s.readings.filter((_, i) => i !== index) } : s)),
  }))
}

/** A backup holds the cars plus every saved receipt photo. */
export async function exportData() {
  return JSON.stringify({ ...state, receiptImages: await allReceiptImages() })
}

export async function importData(json: string) {
  const { receiptImages, ...s } = JSON.parse(json) as State & { receiptImages?: Record<string, string> }
  if (!Array.isArray(s.cars)) throw new Error('Not a backup file')
  set(s)
  let failed = 0
  for (const [id, url] of Object.entries(receiptImages ?? {})) await saveReceiptImage(id, url).catch(() => failed++)
  return { photos: Object.keys(receiptImages ?? {}).length - failed, failed }
}
