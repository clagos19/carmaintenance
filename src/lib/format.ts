import type { Car, TaskStatus } from '../types'
import { daysUntilKm } from './status'

export const km = (n: number) => `${Math.round(n).toLocaleString('en-CA')} km`

export const money = ([a, b]: [number, number]) =>
  a === 0 && b === 0 ? 'Free' : a === b ? `$${a}` : `$${a.toLocaleString('en-CA')}–${b.toLocaleString('en-CA')}`

export const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })

export const dayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })

export const carName = (c: Pick<Car, 'year' | 'make' | 'model'>) => `${c.year} ${c.make} ${c.model}`

export const todayIso = () => new Date().toISOString()

/** One short line about when a task is due, e.g. "Overdue by 1,200 km" or "In 3,000 km · ~Mar 2027". */
export function dueLine(st: TaskStatus, car: Car): string {
  const parts: string[] = []
  if (st.status === 'overdue') {
    if (st.kmLeft !== null && st.kmLeft <= 0) parts.push(st.kmLeft === 0 ? 'Due now' : `Overdue by ${km(-st.kmLeft)}`)
    else if (st.daysLeft !== null && st.daysLeft <= 0) parts.push(st.daysLeft > -2 ? 'Due today' : `Overdue since ${dayMonth(st.dueDate!)}`)
    return parts.join(' · ')
  }
  const kmDays = st.kmLeft !== null ? daysUntilKm(car, st.kmLeft) : Infinity
  if (st.kmLeft !== null) parts.push(`In ${km(st.kmLeft)}`)
  const dateBased = st.daysLeft !== null && st.daysLeft < kmDays
  if (dateBased) parts.push(st.kmLeft === null ? `Due ${dayMonth(st.dueDate!)}` : `or by ${monthYear(st.dueDate!)}`)
  else if (st.kmLeft !== null) {
    const d = new Date(Date.now() + kmDays * 86400000).toISOString()
    parts.push(`~${monthYear(d)}`)
  }
  return parts.join(' · ')
}
