import { TASKS_BY_ID, tasksFor, type TaskDef } from '../data/tasks'
import type { Car, Status, TaskRecord, TaskStatus } from '../types'
import { worstSet } from './tread'

const DAY = 86400000

export function addMonths(iso: string, months: number) {
  const d = new Date(iso)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  if (d.getDate() < day) d.setDate(0) // clamp e.g. Jan 31 + 1 month
  return d.toISOString()
}

/** Next mid-April or mid-October after a date (when winter or summer tires go on). */
export function nextSwapDate(afterIso: string) {
  const after = new Date(afterIso)
  const y = after.getFullYear()
  const candidates = [new Date(y, 3, 15), new Date(y, 9, 15), new Date(y + 1, 3, 15)]
  return candidates.find((c) => c.getTime() > after.getTime() + 30 * DAY)!.toISOString()
}

/** The most recent swap date on or before now, used when there is no record yet. */
function lastSwapDate(now: Date) {
  const y = now.getFullYear()
  const candidates = [new Date(y, 9, 15), new Date(y, 3, 15), new Date(y - 1, 9, 15)]
  return candidates.find((c) => c.getTime() <= now.getTime())!.toISOString()
}

export function lastRecord(car: Car, taskId: string): TaskRecord | null {
  const h = car.history[taskId]
  return h && h.length ? h[h.length - 1] : null
}

/** Whether a job raises due-now and due-soon alerts on this car. */
export function alertsOn(task: TaskDef, car: Car) {
  return car.alerts?.[task.id] ?? !task.dashWarning
}

export function taskStatus(task: TaskDef, car: Car, now = new Date()): TaskStatus {
  const odo = car.odometerKm
  const intervalKm = task.km(car.specs)
  const months = task.months(car.specs)
  const last = lastRecord(car, task.id)
  const estimated = !last

  let dueKm: number | null = null
  let dueDate: string | null = null

  if (task.seasonal) {
    // Fixed spring/fall dates. Without a record, flag a swap season that started in the last
    // two months; otherwise assume the last swap happened on schedule.
    if (last) dueDate = nextSwapDate(last.date)
    else {
      const prev = lastSwapDate(now)
      dueDate = now.getTime() - new Date(prev).getTime() < 60 * DAY ? prev : nextSwapDate(prev)
    }
  } else {
    if (intervalKm > 0) {
      const lastKm = last ? last.km : Math.floor(odo / intervalKm) * intervalKm
      dueKm = lastKm + intervalKm
    }
    if (months > 0) {
      if (last) dueDate = addMonths(last.date, months)
      else if (intervalKm === 0) {
        // Time-only task with no record: assume it was done three-quarters of an interval before the car was added.
        dueDate = addMonths(car.createdAt, Math.max(1, Math.round(months / 4)))
      }
    }
  }

  const kmLeft = dueKm !== null ? dueKm - odo : null
  const daysLeft = dueDate !== null ? Math.ceil((new Date(dueDate).getTime() - now.getTime()) / DAY) : null

  let status: Status = 'ok'
  const soonKm = intervalKm > 0 ? Math.max(1000, intervalKm * 0.15) : 0
  if ((kmLeft !== null && kmLeft <= 0) || (daysLeft !== null && daysLeft <= 0)) status = 'overdue'
  else if ((kmLeft !== null && kmLeft <= soonKm) || (daysLeft !== null && daysLeft <= 30)) status = 'soon'

  // Measured tread beats the km estimate for tire replacement; the age limit still applies.
  const wear = task.id === 'tires' ? worstSet(car) : null
  if (wear) {
    const age: Status = daysLeft !== null && daysLeft <= 0 ? 'overdue' : daysLeft !== null && daysLeft <= 30 ? 'soon' : 'ok'
    status = RANK[wear.status] <= RANK[age] ? wear.status : age
    const tread = { set: wear.set.name, pos: wear.pos, depth: wear.depth, replaceAt: wear.replaceAt }
    if (!alertsOn(task, car)) status = 'off'
    return { status, kmLeft: wear.kmLeft, dueKm: null, dueDate, daysLeft, estimated: false, last, tread }
  }

  if (!alertsOn(task, car)) status = 'off'

  return { status, kmLeft, dueKm, dueDate, daysLeft, estimated, last }
}

export interface CarTask {
  task: TaskDef
  st: TaskStatus
}

const RANK: Record<Status, number> = { overdue: 0, soon: 1, ok: 2, off: 3 }

/** Rough number of days until the km-based due point, using the yearly km. */
export function daysUntilKm(car: Car, kmLeft: number) {
  return Math.round(kmLeft / (car.specs.annualKm / 365))
}

/** Sort key: how soon a task is due, in days, combining km and time */
function urgency(car: Car, st: TaskStatus) {
  const a = st.kmLeft !== null ? daysUntilKm(car, st.kmLeft) : Infinity
  const b = st.daysLeft ?? Infinity
  return Math.min(a, b)
}

export function carTasks(car: Car, view?: TaskDef['view'], now = new Date()): CarTask[] {
  return tasksFor(car.specs, view)
    .map((task) => ({ task, st: taskStatus(task, car, now) }))
    .sort((x, y) => RANK[x.st.status] - RANK[y.st.status] || urgency(car, x.st) - urgency(car, y.st))
}

export function summary(car: Car, now = new Date()) {
  const all = carTasks(car, undefined, now)
  return {
    all,
    now: all.filter((t) => t.st.status === 'overdue'),
    soon: all.filter((t) => t.st.status === 'soon'),
  }
}

/** When the task will next be due after clearing it now, in words. */
export function nextAfterClear(task: TaskDef, car: Car, km: number, date: string) {
  const fake: Car = { ...car, odometerKm: km, history: { ...car.history, [task.id]: [{ km, date }] } }
  return taskStatus(task, fake, new Date(date))
}

export { TASKS_BY_ID }
