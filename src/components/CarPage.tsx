import { useEffect, useRef, useState } from 'react'
import { PROVIDERS } from '../data/providers'
import { TASKS_BY_ID } from '../data/tasks'
import { carName, dayMonth, dueLine, km } from '../lib/format'
import { back, go } from '../lib/nav'
import { ASSUMPTION_ORDER, SPEC_LABELS, formatSpec } from '../lib/specs'
import { summary, type CarTask } from '../lib/status'
import { CAR_COLORS, dailyKm, removeAppointment, removeCar, setKmAuto, setOdometer, updateCarInfo, useCar } from '../store'
import type { Car, SpecKey } from '../types'
import { BookingSheet } from './BookingSheet'
import { IconBack, IconChevron, IconGauge, IconMore } from './Icons'
import { Sheet } from './Sheet'
import { SpecEditor } from './SpecEditor'
import { TaskSheet } from './TaskSheet'
import { ViewPager } from './ViewPager'
import { SourceTag, StatusDot } from './bits'

const EV_SKIP: SpecKey[] = ['oilType', 'oilCapacityL', 'oilIntervalKm', 'sparkPlugKm', 'timingBelt']

export function CarPage({ id, openTask }: { id: string; openTask?: string }) {
  const car = useCar(id)
  const [taskId, setTaskId] = useState<string | null>(openTask ?? null)
  const [bookId, setBookId] = useState<string | null>(null)
  const [specKey, setSpecKey] = useState<SpecKey | null>(null)
  const [menu, setMenu] = useState(false)
  const [showAll, setShowAll] = useState(false)

  if (!car) {
    return (
      <div className="stack">
        <p className="muted">This car is no longer in your garage.</p>
        <a className="btn btn-soft" href="#/">Back to garage</a>
      </div>
    )
  }

  const { now, soon, all } = summary(car)
  const specKeys = ASSUMPTION_ORDER.filter((k) => !(car.specs.powertrain === 'ev' && EV_SKIP.includes(k)))
  const assumed = specKeys.filter((k) => car.sources[k] === 'assumed')
  const upcoming = car.appointments.map((a, i) => ({ a, i })).filter(({ a }) => new Date(a.date).getTime() > Date.now() - 86400000)

  return (
    <div className="stack">
      <div className="topbar">
        <button className="icon-btn" onClick={() => back()} aria-label="Back">
          <IconBack />
        </button>
        <span className="topbar-title">{car.nickname || `${car.make} ${car.model}`}</span>
        <button className="icon-btn" onClick={() => setMenu(true)} aria-label="Car options">
          <IconMore />
        </button>
      </div>

      <header className="page-head tight">
        <h1>{car.nickname || car.model}</h1>
        <p className="muted">{carName(car)}{car.trim ? ` ${car.trim}` : ''} · {car.specs.engine}</p>
      </header>

      <Odometer car={car} />

      <section className="card summary-card">
        <div className="summary-stats">
          <div className={`stat ${now.length ? 'stat-red' : ''}`}>
            <span className="stat-num">{now.length}</span>
            <span className="stat-label">Do now</span>
          </div>
          <div className={`stat ${soon.length ? 'stat-amber' : ''}`}>
            <span className="stat-num">{soon.length}</span>
            <span className="stat-label">Coming up</span>
          </div>
        </div>
        {[...now, ...soon].slice(0, 6).map((t) => (
          <TaskRow key={t.task.id} t={t} car={car} onOpen={setTaskId} />
        ))}
        {now.length + soon.length === 0 && <p className="muted small pad">Nothing due. Keep your kilometers up to date and we’ll flag jobs as they come up.</p>}
        {upcoming.length > 0 && (
          <div className="appts">
            {upcoming.map(({ a, i }) => (
              <div key={i} className="appt">
                <div>
                  <div className="row-title">{PROVIDERS[a.provider].name} · {dayMonth(a.date)} {new Date(a.date).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}</div>
                  <div className="row-sub">{a.taskIds.map((t) => TASKS_BY_ID[t]?.name).join(', ')}</div>
                </div>
                <button className="link-btn" onClick={() => removeAppointment(car.id, i)}>Cancel</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {assumed.length > 0 && (
        <section className="card assume">
          <div className="assume-head">
            <span className="assume-icon">!</span>
            <div>
              <strong>{assumed.length} assumption{assumed.length === 1 ? '' : 's'} in this plan</strong>
              <div className="small muted">Tap one to confirm or change it.</div>
            </div>
          </div>
          <div className="chips">
            {assumed.map((k) => (
              <button key={k} className="chip chip-assumed" onClick={() => setSpecKey(k)}>
                <span className="muted">{SPEC_LABELS[k]}:</span> {formatSpec(k, car.specs)}
              </button>
            ))}
          </div>
        </section>
      )}

      <ViewPager car={car} onOpen={setTaskId} />

      <section>
        <h2 className="section-title">All maintenance</h2>
        <div className="card list">
          {(showAll ? all : all.slice(0, 8)).map((t) => (
            <TaskRow key={t.task.id} t={t} car={car} onOpen={setTaskId} />
          ))}
          {all.length > 8 && (
            <button className="row more-row" onClick={() => setShowAll((s) => !s)}>
              {showAll ? 'Show less' : `Show all ${all.length}`}
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="section-title">Spec sheet</h2>
        <div className="card list">
          {specKeys.map((k) => (
            <button key={k} className="row" onClick={() => setSpecKey(k)}>
              <div className="row-main">
                <div className="row-sub">{SPEC_LABELS[k]}</div>
                <div className="row-title">{formatSpec(k, car.specs)}</div>
              </div>
              <SourceTag source={car.sources[k]} />
            </button>
          ))}
        </div>
        <p className="tiny muted pad">Spec sheet values are typical for this model. Your owner’s manual is the final word.</p>
      </section>

      <TaskSheet car={car} taskId={taskId} onClose={() => setTaskId(null)} onBook={(t) => { setTaskId(null); setBookId(t) }} />
      <BookingSheet car={car} taskId={bookId} onClose={() => setBookId(null)} />
      <SpecEditor car={car} specKey={specKey} onClose={() => setSpecKey(null)} />
      <CarMenu car={car} open={menu} onClose={() => setMenu(false)} />
    </div>
  )
}

function TaskRow({ t, car, onOpen }: { t: CarTask; car: Car; onOpen: (id: string) => void }) {
  return (
    <button className="row" onClick={() => onOpen(t.task.id)}>
      <StatusDot status={t.st.status} />
      <div className="row-main">
        <div className="row-title">{t.task.name}</div>
        <div className="row-sub">
          {dueLine(t.st, car)}
          {t.st.estimated && t.st.status !== 'ok' ? ' · estimated' : ''}
        </div>
      </div>
      <IconChevron />
    </button>
  )
}

function Odometer({ car }: { car: Car }) {
  const [v, setV] = useState(car.odometerKm ? car.odometerKm.toLocaleString('en-CA') : '')
  const [saved, setSaved] = useState(false)
  const timer = useRef<number>()
  const focused = useRef(false)
  const dirty = useRef(false)

  useEffect(() => {
    if (!focused.current) setV(car.odometerKm ? car.odometerKm.toLocaleString('en-CA') : '')
  }, [car.odometerKm])

  const commit = (raw: string) => {
    if (!dirty.current) return
    dirty.current = false
    const n = parseInt(raw.replace(/\D/g, ''), 10)
    if (!Number.isFinite(n) || (n === car.odometerKm && !car.odometerEstimated)) return
    setOdometer(car.id, n)
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  const days = Math.floor((Date.now() - new Date(car.odometerUpdatedAt).getTime()) / 86400000)
  const stale = car.odometerKm === 0 || days > 30

  const perDay = Math.round(dailyKm(car))
  const fromReadings = car.odometerLog.length >= 2 && perDay !== Math.round(car.specs.annualKm / 365)

  return (
    <section className={`card odo ${stale && !car.kmAuto ? 'odo-stale' : ''}`}>
      <div className="odo-top">
        <div className="odo-icon"><IconGauge /></div>
        <label className="odo-main">
          <span className="small muted">
            {car.odometerKm === 0 ? 'Enter your current kilometers' : car.odometerEstimated ? 'Odometer (estimated)' : 'Odometer'}
          </span>
          <span className="odo-input">
            <input
              className={car.odometerEstimated ? 'est' : ''}
              style={{ width: `${Math.max(v.length, 1) * 0.62 + 0.4}em` }}
              inputMode="numeric"
              enterKeyHint="done"
              value={v}
              placeholder="0"
              onFocus={() => (focused.current = true)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 7)
                dirty.current = true
                setV(digits ? parseInt(digits, 10).toLocaleString('en-CA') : '')
                clearTimeout(timer.current)
                timer.current = window.setTimeout(() => commit(digits), 900)
              }}
              onBlur={(e) => {
                focused.current = false
                clearTimeout(timer.current)
                commit(e.target.value)
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
            <span className="odo-unit">km</span>
          </span>
        </label>
        <span className={`odo-saved ${saved ? 'show' : ''}`}>Saved</span>
      </div>
      <div className="odo-foot">
        <span className="tiny muted">
          {car.odometerEstimated
            ? `Estimated by KM auto. Last reading ${days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`}. Type the real number to correct it.`
            : car.odometerKm
              ? days === 0 ? 'Updated today' : `Updated ${days} day${days === 1 ? '' : 's'} ago`
              : 'Saves automatically'}
        </span>
        <label className="toggle">
          <span className="toggle-text">
            <strong>KM auto</strong>
            <span className="tiny muted">~{perDay} km/day{fromReadings ? '' : ' (assumed)'}</span>
          </span>
          <input type="checkbox" role="switch" checked={!!car.kmAuto} onChange={(e) => setKmAuto(car.id, e.target.checked)} />
          <span className="toggle-ui" />
        </label>
      </div>
    </section>
  )
}

function CarMenu({ car, open, onClose }: { car: Car; open: boolean; onClose: () => void }) {
  const [name, setName] = useState(car.nickname ?? '')
  const [confirm, setConfirm] = useState(false)
  return (
    <Sheet open={open} onClose={onClose} title="Car options">
      <div className="stack-sm">
        <label className="field">
          <span>Nickname</span>
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => updateCarInfo(car.id, { nickname: name.trim() || undefined })} placeholder={`${car.make} ${car.model}`} />
        </label>
        <div className="field">
          <span>Colour</span>
          <div className="swatches">
            {CAR_COLORS.map((c) => (
              <button key={c} className={`swatch ${c === car.color ? 'on' : ''}`} style={{ background: c }} onClick={() => updateCarInfo(car.id, { color: c })} aria-label={`Colour ${c}`} />
            ))}
          </div>
        </div>
        <p className="small muted">Last {Math.min(car.odometerLog.length, 5)} odometer readings: {car.odometerLog.slice(-5).map((o) => km(o.km)).join(', ') || 'none yet'}</p>
        {confirm ? (
          <div className="btn-row">
            <button className="btn btn-red" onClick={() => { removeCar(car.id); onClose(); go('/') }}>
              Yes, remove it
            </button>
            <button className="btn btn-soft" onClick={() => setConfirm(false)}>Keep</button>
          </div>
        ) : (
          <button className="btn btn-soft-red btn-block" onClick={() => setConfirm(true)}>
            Remove this car
          </button>
        )}
      </div>
    </Sheet>
  )
}
