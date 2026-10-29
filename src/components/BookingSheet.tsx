import { useState } from 'react'
import { PROVIDERS, mapsUrl } from '../data/providers'
import { TASKS_BY_ID } from '../data/tasks'
import { carName } from '../lib/format'
import { downloadFile, icsFor } from '../lib/ics'
import { carTasks } from '../lib/status'
import { addAppointment } from '../store'
import type { Car, Provider } from '../types'
import { IconCalendar, IconLink, IconMap } from './Icons'
import { Sheet } from './Sheet'
import { StatusDot } from './bits'

function defaultTime() {
  const d = new Date(Date.now() + 2 * 86400000)
  d.setHours(9, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`
}

export function BookingSheet({ car, taskId, onClose }: { car: Car; taskId: string | null; onClose: () => void }) {
  const task = taskId ? TASKS_BY_ID[taskId] : null
  const [provider, setProvider] = useState<Provider | null>(null)
  const [extra, setExtra] = useState<string[]>([])
  const [when, setWhen] = useState(defaultTime)
  const [saved, setSaved] = useState(false)

  if (!task) return null
  const p = provider ?? task.bookWith[0]
  const info = PROVIDERS[p]
  // Other jobs due now or soon that the same shop can do in one visit.
  const bundle = carTasks(car).filter((t) => t.task.id !== task.id && t.st.status !== 'ok' && t.task.bookWith.includes(p))
  const ids = [task.id, ...extra.filter((id) => bundle.some((b) => b.task.id === id))]
  const names = ids.map((id) => TASKS_BY_ID[id].name)

  const close = () => {
    setProvider(null)
    setExtra([])
    setSaved(false)
    onClose()
  }

  const save = () => {
    const date = new Date(when).toISOString()
    addAppointment(car.id, { taskIds: ids, provider: p, date })
    setSaved(true)
  }

  const ics = () =>
    downloadFile(
      'appointment.ics',
      icsFor(`${info.name}: ${names.join(', ')}`, new Date(when).toISOString(), info.name, `${carName(car)}\n${names.join('\n')}`),
      'text/calendar',
    )

  return (
    <Sheet open onClose={close} title="Book an appointment">
      <div className="stack-sm">
        <p className="muted small">For {task.name.toLowerCase()} on your {car.nickname || `${car.make} ${car.model}`}.</p>
        <div className="provider-list">
          {task.bookWith.map((id) => (
            <button key={id} className={`provider ${id === p ? 'on' : ''}`} onClick={() => setProvider(id)}>
              <strong>{PROVIDERS[id].name}</strong>
              <span className="small muted">{PROVIDERS[id].blurb}</span>
            </button>
          ))}
        </div>

        {bundle.length > 0 && (
          <>
            <h3>Add to the same visit</h3>
            <div className="list card inset">
              {bundle.map(({ task: t, st }) => (
                <label key={t.id} className="row check-row">
                  <input
                    type="checkbox"
                    checked={extra.includes(t.id)}
                    onChange={(e) => setExtra((x) => (e.target.checked ? [...x, t.id] : x.filter((i) => i !== t.id)))}
                  />
                  <StatusDot status={st.status} />
                  <span className="row-title">{t.name}</span>
                </label>
              ))}
            </div>
          </>
        )}

        <div className="btn-row">
          <a className="btn btn-soft" href={info.site(car.make)} target="_blank" rel="noreferrer">
            <IconLink /> {p === 'dealer' ? 'Find dealer' : `${info.name} site`}
          </a>
          <a className="btn btn-soft" href={mapsUrl(info.mapsQuery(car.make))} target="_blank" rel="noreferrer">
            <IconMap /> Nearest
          </a>
        </div>

        <h3>Save your appointment</h3>
        <label className="field">
          <span>Date and time</span>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        {saved ? (
          <>
            <div className="banner banner-green">
              <IconCalendar />
              <div>
                <strong>Saved.</strong>
                <div className="small">It shows on this car’s summary and in Agenda.</div>
              </div>
            </div>
            <button className="btn btn-soft btn-block" onClick={ics}>
              Add to iPhone calendar
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-block" onClick={save}>
            Save appointment
          </button>
        )}
      </div>
    </Sheet>
  )
}
