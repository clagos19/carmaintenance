import { PROVIDERS } from '../data/providers'
import { TASKS_BY_ID } from '../data/tasks'
import { dayMonth, dueLine } from '../lib/format'
import { summary } from '../lib/status'
import { useCars } from '../store'
import { IconChevron } from './Icons'
import { StatusDot } from './bits'

export function Agenda() {
  const cars = useCars()
  const sums = cars.map((car) => ({ car, ...summary(car) }))
  const appts = cars
    .flatMap((car) => car.appointments.map((a) => ({ car, a })))
    .filter(({ a }) => new Date(a.date).getTime() > Date.now() - 86400000)
    .sort((x, y) => x.a.date.localeCompare(y.a.date))
  const now = sums.flatMap((s) => s.now.map((t) => ({ ...t, car: s.car })))
  const soon = sums.flatMap((s) => s.soon.map((t) => ({ ...t, car: s.car })))

  const group = (title: string, items: typeof now) =>
    items.length > 0 && (
      <section>
        <h2 className="section-title">{title}</h2>
        <div className="card list">
          {items.map(({ task, st, car }) => (
            <a key={car.id + task.id} className="row" href={`#/car/${car.id}?task=${task.id}`}>
              <StatusDot status={st.status} />
              <div className="row-main">
                <div className="row-title">{task.name}</div>
                <div className="row-sub">{car.nickname || `${car.make} ${car.model}`} · {dueLine(st, car)}</div>
              </div>
              <IconChevron />
            </a>
          ))}
        </div>
      </section>
    )

  return (
    <div className="stack">
      <header className="page-head">
        <h1>Agenda</h1>
        <p className="muted">Everything due across your cars.</p>
      </header>

      {appts.length > 0 && (
        <section>
          <h2 className="section-title">Appointments</h2>
          <div className="card list">
            {appts.map(({ car, a }, i) => (
              <a key={i} className="row" href={`#/car/${car.id}`}>
                <div className="date-badge">
                  <span>{new Date(a.date).toLocaleDateString('en-CA', { month: 'short' })}</span>
                  <strong>{new Date(a.date).getDate()}</strong>
                </div>
                <div className="row-main">
                  <div className="row-title">{PROVIDERS[a.provider].name} · {new Date(a.date).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}</div>
                  <div className="row-sub">{car.nickname || `${car.make} ${car.model}`} · {a.taskIds.map((t) => TASKS_BY_ID[t]?.name).join(', ')}</div>
                </div>
                <IconChevron />
              </a>
            ))}
          </div>
        </section>
      )}

      {group('Do now', now)}
      {group('Coming up', soon)}

      {cars.length === 0 && <p className="muted">Add a car to see what’s due.</p>}
      {cars.length > 0 && now.length + soon.length + appts.length === 0 && (
        <div className="card empty">
          <h2>All caught up</h2>
          <p className="muted">Nothing is due. Last checked {dayMonth(new Date().toISOString())}.</p>
        </div>
      )}
    </div>
  )
}
