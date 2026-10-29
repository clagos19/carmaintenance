import { useRef, useState } from 'react'
import { SideView } from '../art/CarArt'
import { carName, dueLine, km } from '../lib/format'
import { summary } from '../lib/status'
import { exportData, importData, useCars } from '../store'
import { downloadFile } from '../lib/ics'
import { CarHero } from './CarHero'
import { IconChevron, IconPlus } from './Icons'
import { StatusDot } from './bits'

export function Garage() {
  const cars = useCars()
  const sums = cars.map((c) => ({ car: c, ...summary(c) }))
  const nowCount = sums.reduce((n, s) => n + s.now.length, 0)
  const soonCount = sums.reduce((n, s) => n + s.soon.length, 0)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  return (
    <div className="stack">
      <header className="page-head">
        <p className="eyebrow">{new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1>Garage</h1>
      </header>

      {cars.length === 0 ? (
        <div className="empty card">
          <SideView body="suv" color="#c9ccd3" />
          <h2>Add your first car</h2>
          <p className="muted">Pick the brand, model and year. We’ll pull typical specs and build a maintenance plan you can adjust.</p>
          <a className="btn btn-primary" href="#/add">
            <IconPlus /> Add a car
          </a>
        </div>
      ) : (
        <>
          <section className="card summary-card">
            <div className="summary-stats">
              <div className={`stat ${nowCount ? 'stat-red' : ''}`}>
                <span className="stat-num">{nowCount}</span>
                <span className="stat-label">Need attention now</span>
              </div>
              <div className={`stat ${soonCount ? 'stat-amber' : ''}`}>
                <span className="stat-num">{soonCount}</span>
                <span className="stat-label">Coming up soon</span>
              </div>
            </div>
            {sums.flatMap((s) => s.now.slice(0, 3).map((t) => ({ ...t, car: s.car }))).slice(0, 4).map(({ task, st, car }) => (
              <a key={car.id + task.id} className="row" href={`#/car/${car.id}?task=${task.id}`}>
                <StatusDot status={st.status} />
                <div className="row-main">
                  <div className="row-title">{task.name}</div>
                  <div className="row-sub">{car.nickname || `${car.make} ${car.model}`} · {dueLine(st, car)}</div>
                </div>
                <IconChevron />
              </a>
            ))}
          </section>

          <h2 className="section-title">Your cars</h2>
          <div className="car-list">
            {sums.map(({ car, now, soon }) => (
              <a key={car.id} className="car-card" href={`#/car/${car.id}`}>
                <div className="car-card-art">
                  <CarHero car={car} />
                </div>
                <div className="car-card-info">
                  <div>
                    <div className="car-card-name">{car.nickname || `${car.make} ${car.model}`}</div>
                    <div className="muted small">{carName(car)}{car.trim ? ` ${car.trim}` : ''} · {km(car.odometerKm)}</div>
                  </div>
                  <div className="pills">
                    {now.length > 0 && <span className="pill pill-red">{now.length} now</span>}
                    {soon.length > 0 && <span className="pill pill-amber">{soon.length} soon</span>}
                    {now.length + soon.length === 0 && <span className="pill pill-green">All good</span>}
                  </div>
                </div>
              </a>
            ))}
            <a className="car-card car-card-add" href="#/add">
              <IconPlus /> Add another car
            </a>
          </div>
        </>
      )}

      <section className="card subtle">
        <h3>Your data</h3>
        <p className="muted small">Everything is saved on this phone. Make a backup now and then, or to move to a new phone.</p>
        <div className="btn-row">
          <button className="btn btn-soft" onClick={() => downloadFile(`car-maintenance-backup-${new Date().toISOString().slice(0, 10)}.json`, exportData(), 'application/json')}>
            Back up
          </button>
          <button className="btn btn-soft" onClick={() => fileRef.current?.click()}>
            Restore
          </button>
        </div>
        {msg && <p className="small">{msg}</p>}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            try {
              importData(await f.text())
              setMsg('Backup restored.')
            } catch {
              setMsg('That file is not a backup from this app.')
            }
            e.target.value = ''
          }}
        />
      </section>
    </div>
  )
}
