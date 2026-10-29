import { useState } from 'react'
import { PROVIDERS } from '../data/providers'
import { TASKS_BY_ID, costFactor } from '../data/tasks'
import { carName, dayMonth, dueLine, km, money, monthYear } from '../lib/format'
import { alertsOn, nextAfterClear, taskStatus } from '../lib/status'
import { clearTask, findReceipt, removeRecord, setAlerts } from '../store'
import type { Car, Provider, Receipt } from '../types'
import { IconCalendar, IconCheck, IconPlay, IconReceipt } from './Icons'
import { Sheet } from './Sheet'
import { TreadCard } from './TreadCard'
import { StatusPill } from './bits'

const TIRE_TASKS = ['tires', 'tire-check', 'tire-swap', 'rotation']

export function TaskSheet({ car, taskId, onClose, onBook, onReceipt }: { car: Car; taskId: string | null; onClose: () => void; onBook: (taskId: string) => void; onReceipt: (r: Receipt) => void }) {
  const task = taskId ? TASKS_BY_ID[taskId] : null
  const [clearing, setClearing] = useState(false)
  const [doneKm, setDoneKm] = useState('')
  const [doneDate, setDoneDate] = useState('')
  const [justCleared, setJustCleared] = useState<string | null>(null)

  if (!task) return <Sheet open={false} onClose={onClose}>{null}</Sheet>

  const st = taskStatus(task, car)
  const f = costFactor(car.specs)
  const scale = ([a, b]: [number, number]): [number, number] => [Math.round((a * f) / 5) * 5, Math.round((b * f) / 5) * 5]
  const kmVal = doneKm ? parseInt(doneKm.replace(/\D/g, ''), 10) : car.odometerKm
  const dateVal = doneDate ? new Date(doneDate + 'T12:00:00').toISOString() : new Date().toISOString()
  const preview = nextAfterClear(task, car, kmVal, dateVal)
  const history = car.history[task.id] ?? []
  const lastReceipt = findReceipt(car, st.last?.receiptId)
  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${carName(car)} ${task.video}`)}`
  const intervalParts = [
    task.km(car.specs) ? `every ${km(task.km(car.specs))}` : '',
    task.seasonal ? 'every spring and fall' : task.months(car.specs) ? `every ${task.months(car.specs)} months` : '',
  ].filter(Boolean)

  const close = () => {
    setClearing(false)
    setJustCleared(null)
    setDoneKm('')
    setDoneDate('')
    onClose()
  }

  const nextText = (s: typeof preview) =>
    [s.dueKm !== null ? `at ${km(s.dueKm)}` : '', s.dueDate ? `${s.dueKm !== null ? 'or by ' : 'by '}${monthYear(s.dueDate)}` : ''].filter(Boolean).join(' ')

  return (
    <Sheet open onClose={close} title={task.name}>
      <div className="stack-sm">
        {justCleared ? (
          <div className="banner banner-green">
            <IconCheck />
            <div>
              <strong>Done. Nice work.</strong>
              <div className="small">Next due {justCleared}.</div>
            </div>
          </div>
        ) : (
          <div className={`due-box due-${st.status}`}>
            {st.status !== 'off' && <StatusPill status={st.status} />}
            <div className="due-main">{st.status === 'off' ? 'Not flagged when due' : dueLine(st, car)}</div>
            <div className="small muted">
              {st.tread
                ? 'Based on your latest tread reading. Tires also age out after about 6 years, whatever the tread.'
                : !st.last && 'Without a record, the last service is estimated from your kilometers.'}
              {!st.tread && intervalParts.length > 0 && ` Recommended ${intervalParts.join(' or ')}${car.specs.drivingStyle === 'severe' ? ' (severe conditions)' : ''}.`}
            </div>
          </div>
        )}

        <div className="last-service">
          <span className="last-service-label">Last service</span>
          {st.last ? (
            <span>
              <strong>{dayMonth(st.last.date)}</strong> at <strong>{km(st.last.km)}</strong>
              {st.last.note ? <span className="muted"> · {st.last.note}</span> : null}
            </span>
          ) : (
            <span className="muted">No record yet. Mark it as done to start the history.</span>
          )}
          {lastReceipt && (
            <button className="receipt-btn last-receipt" onClick={() => onReceipt(lastReceipt)}>
              <IconReceipt /> View receipt
            </button>
          )}
        </div>

        <label className="toggle alert-toggle">
          <span className="alert-toggle-text">
            <strong>Due alerts</strong>
            <span className="tiny muted">{task.dashWarning ? `${task.dashWarning} Off unless you turn it on.` : 'Flag this job in red and amber when it comes due.'}</span>
          </span>
          <input type="checkbox" role="switch" checked={alertsOn(task, car)} onChange={(e) => setAlerts(car.id, task.id, e.target.checked)} />
          <span className="toggle-ui" />
        </label>

        {TIRE_TASKS.includes(task.id) && <TreadCard car={car} />}

        <p>{task.why}</p>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setClearing((c) => !c)}>
            <IconCheck /> Mark as done
          </button>
          <button className="btn btn-soft" onClick={() => onBook(task.id)}>
            <IconCalendar /> Book
          </button>
        </div>

        {clearing && (
          <div className="card inset form">
            <div className="grid-2">
              <label className="field">
                <span>Odometer (km)</span>
                <input inputMode="numeric" value={doneKm} onChange={(e) => setDoneKm(e.target.value)} placeholder={car.odometerKm.toLocaleString('en-CA')} />
              </label>
              <label className="field">
                <span>Date</span>
                <input type="date" value={doneDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDoneDate(e.target.value)} />
              </label>
            </div>
            <p className="small muted">Next due {nextText(preview)}.</p>
            <button
              className="btn btn-green btn-block"
              onClick={() => {
                clearTask(car.id, task.id, { km: kmVal, date: dateVal })
                setJustCleared(nextText(preview))
                setClearing(false)
              }}
            >
              Clear task
            </button>
          </div>
        )}

        <h3>Rough cost</h3>
        <div className="cost-table">
          {(Object.entries(task.costs) as [Provider, [number, number]][]).map(([p, r]) => (
            <div key={p} className="cost-row">
              <span>{PROVIDERS[p].name}</span>
              <strong>{money(scale(r))}</strong>
            </div>
          ))}
          {task.diy && (
            <div className="cost-row diy">
              <span>Do it yourself</span>
              <strong>{money(task.diy.cost)}</strong>
            </div>
          )}
        </div>
        {task.costNote && <p className="small muted">{task.costNote}</p>}
        <p className="tiny muted">Estimates in CAD before tax, based on typical Canadian pricing. Your shop’s quote may differ.</p>

        <h3>What you’ll need</h3>
        <ul className="bullets">
          {task.materials(car.specs).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>

        {task.diy ? (
          <>
            <h3>
              Do it yourself <span className={`pill ${task.diy.difficulty === 'Easy' ? 'pill-green' : 'pill-amber'}`}>{task.diy.difficulty}</span>{' '}
              <span className="muted small">about {task.diy.minutes} min</span>
            </h3>
            <ol className="steps-list">
              {task.diy.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="small muted">We recommend a shop for this one.</p>
        )}
        <a className="btn btn-soft btn-block" href={yt} target="_blank" rel="noreferrer">
          <IconPlay /> Watch how-to videos for your {car.model}
        </a>

        {history.length > 0 && (
          <>
            <h3>History</h3>
            <div className="list card inset">
              {history
                .map((h, i) => ({ h, i }))
                .reverse()
                .map(({ h, i }) => {
                  const r = findReceipt(car, h.receiptId)
                  return (
                  <div key={i} className="row">
                    <div className="row-main">
                      <div className="row-title">{km(h.km)}</div>
                      <div className="row-sub">{dayMonth(h.date)}{h.note ? ` · ${h.note}` : ''}</div>
                    </div>
                    {r && (
                      <button className="receipt-btn" onClick={() => onReceipt(r)}>
                        <IconReceipt /> Receipt
                      </button>
                    )}
                    <button className="link-btn" onClick={() => removeRecord(car.id, task.id, i)}>
                      Remove
                    </button>
                  </div>
                )
                })}
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}
