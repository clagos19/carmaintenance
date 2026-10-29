import { useState } from 'react'
import { dayMonth, km } from '../lib/format'
import { KIND_LABEL, NEW_TREAD, POSITIONS, POS_LABEL, TREAD_LIMITS, depthStatus, latest, setWear } from '../lib/tread'
import { addTireSet, addTreadReading, clearTask, mountTireSet, removeTireSet, removeTreadReading } from '../store'
import type { Car, TireKind, TirePos, TireSet } from '../types'

const KINDS: TireKind[] = ['winter', 'all-season', 'all-weather', 'summer']
const today = () => new Date().toISOString().slice(0, 10)

/** Tread depth per tire, per set, on the tire jobs. */
export function TreadCard({ car }: { car: Car }) {
  const sets = car.tireSets ?? []
  const [sel, setSel] = useState<string | null>(null)
  const [mode, setMode] = useState<'view' | 'add-set' | 'reading'>('view')
  const set = sets.find((s) => s.id === sel) ?? sets.find((s) => s.mounted) ?? sets[0]
  const setup = car.specs.tireSetup

  const quickAdd = (list: [string, TireKind][]) => {
    let first = ''
    for (const [name, kind] of list) {
      const id = addTireSet(car.id, name, kind)
      first ||= id
    }
    setSel(first)
  }

  return (
    <section className="tread card inset">
      <div className="tread-head">
        <h3>Tire tread</h3>
        {sets.length > 0 && mode === 'view' && (
          <button className="link-btn" onClick={() => setMode('add-set')}>+ Add set</button>
        )}
      </div>

      {sets.length === 0 && mode === 'view' && (
        <div className="stack-sm">
          <p className="small muted">Measure each tire with a gauge (in 32nds of an inch) to know exactly when to buy new tires.</p>
          <div className="btn-row">
            {setup === 'seasonal' ? (
              <button className="btn btn-soft" onClick={() => quickAdd([['Winter', 'winter'], ['All-season', 'all-season']])}>Add winter + all-season sets</button>
            ) : (
              <button className="btn btn-soft" onClick={() => quickAdd([[KIND_LABEL[setup], setup]])}>
                Add my {KIND_LABEL[setup].toLowerCase()} tires
              </button>
            )}
            <button className="btn btn-soft" onClick={() => setMode('add-set')}>Other set</button>
          </div>
        </div>
      )}

      {mode === 'add-set' && <AddSet car={car} onDone={(id) => { if (id) setSel(id); setMode('view') }} />}

      {set && mode !== 'add-set' && (
        <>
          {sets.length > 1 && (
            <div className="chips">
              {sets.map((s) => (
                <button key={s.id} className={`chip ${s.id === set.id ? 'chip-on' : ''}`} onClick={() => { setSel(s.id); setMode('view') }}>
                  {s.name}{s.mounted ? ' · on car' : ''}
                </button>
              ))}
            </div>
          )}
          {mode === 'reading' ? (
            <AddReading car={car} set={set} onDone={() => setMode('view')} />
          ) : (
            <SetView car={car} set={set} onMeasure={() => setMode('reading')} />
          )}
        </>
      )}
    </section>
  )
}

function SetView({ car, set, onMeasure }: { car: Car; set: TireSet; onMeasure: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const r = latest(set)
  const w = setWear(set)
  const lim = TREAD_LIMITS[set.kind]
  return (
    <div className="stack-sm">
      <TireGrid kind={set.kind} depths={r?.depths ?? {}} />
      <p className="small">
        {w ? (
          <>
            Most worn: <strong>{w.depth}/32</strong> {POS_LABEL[w.pos].toLowerCase()}.{' '}
            {w.status === 'overdue'
              ? `Time for new ${set.name.toLowerCase()} tires.`
              : w.kmLeft !== null
                ? `About ${km(w.kmLeft)} until ${w.replaceAt}/32 at your wear rate.`
                : `Replace at ${w.replaceAt}/32.`}
          </>
        ) : (
          <span className="muted">No readings yet for this set.</span>
        )}
      </p>
      <p className="tiny muted">
        {KIND_LABEL[set.kind]} tires: we flag them at {lim.soon}/32 and say replace at {lim.replace}/32. New ones have about {NEW_TREAD[set.kind]}/32; 2/32 is the legal minimum.
      </p>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onMeasure}>Add reading</button>
        {!set.mounted && <button className="btn btn-soft" onClick={() => mountTireSet(car.id, set.id)}>Put on car</button>}
      </div>

      {set.readings.length > 0 && (
        <div className="list tread-log">
          {set.readings
            .map((x, i) => ({ x, i }))
            .reverse()
            .map(({ x, i }) => (
              <div key={i} className="row">
                <div className="row-main">
                  <div className="row-title small">{dayMonth(x.date)} · {km(x.km)}</div>
                  <div className="row-sub">{POSITIONS.map((p) => `${p} ${x.depths[p] ?? '–'}`).join('  ')}</div>
                </div>
                <button className="link-btn" onClick={() => removeTreadReading(car.id, set.id, i)}>Remove</button>
              </div>
            ))}
        </div>
      )}
      {confirm ? (
        <div className="btn-row">
          <button className="btn btn-soft" onClick={() => setConfirm(false)}>Keep</button>
          <button className="btn btn-red" onClick={() => removeTireSet(car.id, set.id)}>Remove {set.name} set</button>
        </div>
      ) : (
        <button className="link-btn muted-link" onClick={() => setConfirm(true)}>Remove this set</button>
      )}
    </div>
  )
}

function TireGrid({ kind, depths, onStep }: { kind: TireKind; depths: Partial<Record<TirePos, number>>; onStep?: (p: TirePos, d: number) => void }) {
  return (
    <div className="tire-grid">
      <div className="tire-car" aria-hidden />
      {POSITIONS.map((p) => {
        const d = depths[p]
        const st = d === undefined ? 'none' : depthStatus(kind, d)
        return (
          <div key={p} className={`tire tire-${p} tire-${st}`}>
            <span className="tire-pos">{POS_LABEL[p]}</span>
            {onStep ? (
              <span className="tire-step">
                <button aria-label={`Less tread ${POS_LABEL[p]}`} onClick={() => onStep(p, Math.max(0, (d ?? NEW_TREAD[kind]) - 1))}>−</button>
                <strong>{d ?? '–'}<small>/32</small></strong>
                <button aria-label={`More tread ${POS_LABEL[p]}`} onClick={() => onStep(p, Math.min(20, (d ?? NEW_TREAD[kind] - 1) + 1))}>+</button>
              </span>
            ) : (
              <strong>{d ?? '–'}<small>/32</small></strong>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AddReading({ car, set, onDone }: { car: Car; set: TireSet; onDone: () => void }) {
  const prev = latest(set)?.depths
  const [depths, setDepths] = useState<Partial<Record<TirePos, number>>>(
    Object.fromEntries(POSITIONS.map((p) => [p, prev?.[p] ?? NEW_TREAD[set.kind]])),
  )
  const [date, setDate] = useState(today())
  const [odo, setOdo] = useState(car.odometerKm.toLocaleString('en-CA'))
  const [logCheck, setLogCheck] = useState(true)

  const save = () => {
    const kmVal = parseInt(odo.replace(/\D/g, ''), 10) || car.odometerKm
    const iso = new Date(date + 'T12:00:00').toISOString()
    addTreadReading(car.id, set.id, { date: iso, km: kmVal, depths })
    if (logCheck) clearTask(car.id, 'tire-check', { km: kmVal, date: iso, note: `Tread measured on ${set.name.toLowerCase()} set` })
    onDone()
  }

  return (
    <div className="stack-sm">
      <p className="small muted">Use + and − to set each tire’s tread, in 32nds. Measure in the middle of the tread.</p>
      <TireGrid kind={set.kind} depths={depths} onStep={(p, d) => setDepths((x) => ({ ...x, [p]: d }))} />
      <div className="grid-2">
        <label className="field">
          <span>Odometer (km)</span>
          <input inputMode="numeric" value={odo} onChange={(e) => setOdo(e.target.value)} />
        </label>
        <label className="field">
          <span>Date</span>
          <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <label className="check-line small">
        <input type="checkbox" checked={logCheck} onChange={(e) => setLogCheck(e.target.checked)} /> Also log a tire check
      </label>
      <div className="btn-row">
        <button className="btn btn-soft" onClick={onDone}>Cancel</button>
        <button className="btn btn-green" onClick={save}>Save reading</button>
      </div>
    </div>
  )
}

function AddSet({ car, onDone }: { car: Car; onDone: (id?: string) => void }) {
  const [kind, setKind] = useState<TireKind>('winter')
  const [name, setName] = useState('')
  return (
    <div className="stack-sm">
      <div className="chips">
        {KINDS.map((k) => (
          <button key={k} className={`chip ${k === kind ? 'chip-on' : ''}`} onClick={() => setKind(k)}>{KIND_LABEL[k]}</button>
        ))}
      </div>
      <label className="field">
        <span>Name</span>
        <input value={name} placeholder={KIND_LABEL[kind]} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="btn-row">
        <button className="btn btn-soft" onClick={() => onDone()}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onDone(addTireSet(car.id, name.trim() || KIND_LABEL[kind], kind))}>Add set</button>
      </div>
    </div>
  )
}
