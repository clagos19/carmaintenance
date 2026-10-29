import { useEffect, useMemo, useState } from 'react'
import { SideView } from '../art/CarArt'
import { CATALOG, catalogBody } from '../data/catalog'
import { MAKES, findMake, findModel, guessBody } from '../data/vehicles'
import { back, go } from '../lib/nav'
import { ASSUMPTION_ORDER, SPEC_LABELS, SPEC_OPTIONS, formatSpec, resolveSpecs } from '../lib/specs'
import { decodeVin, fetchModels } from '../lib/vpic'
import { CAR_COLORS, addCar, useCar, type NewCar } from '../store'
import type { CarSpecs, SpecKey } from '../types'
import { IconBack, IconCheck, IconChevron, IconSearch } from './Icons'
import { SourceTag } from './bits'

type Step = 'make' | 'model' | 'year' | 'choose' | 'profile' | 'lookup'

const thisYear = new Date().getFullYear()
const YEARS = Array.from({ length: thisYear + 2 - 1995 }, (_, i) => thisYear + 1 - i)

export function AddCar() {
  const [step, setStep] = useState<Step>('make')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(thisYear - 3)
  const [trim, setTrim] = useState('')
  const [carId, setCarId] = useState<string>()

  const order: Step[] = ['make', 'model', 'year', 'choose', 'profile', 'lookup']
  const prev = () => {
    if (step === 'make') back()
    else if (step === 'lookup') go('/')
    else setStep(order[order.indexOf(step) - 1])
  }

  const finish = (n: Omit<NewCar, 'make' | 'model' | 'year' | 'trim'>) => {
    const car = addCar({ make, model, year, trim: trim || undefined, ...n })
    setCarId(car.id)
    setStep('lookup')
  }

  return (
    <div className="stack add">
      <div className="topbar">
        <button className="icon-btn" onClick={prev} aria-label="Back">
          <IconBack />
        </button>
        <div className="steps" aria-hidden>
          {['make', 'model', 'year', 'choose'].map((s, i) => (
            <span key={s} className={order.indexOf(step) >= i ? 'on' : ''} />
          ))}
        </div>
        <span style={{ width: 40 }} />
      </div>

      {step === 'make' && <PickMake onPick={(m) => { setMake(m); setModel(''); setStep('model') }} />}
      {step === 'model' && <PickModel make={make} onPick={(m) => { setModel(m); setStep('year') }} />}
      {step === 'year' && (
        <div className="stack">
          <header className="page-head">
            <p className="eyebrow">{make} {model}</p>
            <h1>Which year?</h1>
          </header>
          <div className="year-grid">
            {YEARS.map((y) => (
              <button key={y} className={`chip ${y === year ? 'chip-on' : ''}`} onClick={() => setYear(y)}>
                {y}
              </button>
            ))}
          </div>
          <label className="field">
            <span>Trim (optional)</span>
            <input value={trim} onChange={(e) => setTrim(e.target.value)} placeholder="e.g. EX, Sport, XLE" />
          </label>
          <button className="btn btn-primary btn-block" onClick={() => setStep('choose')}>
            Continue
          </button>
        </div>
      )}
      {step === 'choose' && (
        <div className="stack">
          <div className="hero-art">
            <SideView body={findModel(make, model)?.body ?? catalogBody(make, model) ?? guessBody(model)} color={CAR_COLORS[0]} />
          </div>
          <header className="page-head center">
            <p className="eyebrow">Adding</p>
            <h1>{year} {make} {model}</h1>
          </header>
          <button className="choice" onClick={() => setStep('profile')}>
            <div>
              <div className="choice-title">Create a profile</div>
              <div className="muted small">Two minutes. Kilometers, driving conditions, tires and a few details so the plan fits your car.</div>
            </div>
            <IconChevron />
          </button>
          <button className="choice" onClick={() => finish({ profileComplete: false })}>
            <div>
              <div className="choice-title">Just get started</div>
              <div className="muted small">We’ll use typical specs and flag our assumptions so you can fix them later.</div>
            </div>
            <IconChevron />
          </button>
        </div>
      )}
      {step === 'profile' && <Profile make={make} model={model} onDone={finish} />}
      {step === 'lookup' && carId && <Lookup make={make} model={model} year={year} carId={carId} />}
    </div>
  )
}

const ALL_MAKES = [...new Set([...MAKES.map((m) => m.name), ...Object.keys(CATALOG)])].sort((a, b) => a.localeCompare(b))
const title = (s: string) => s.trim().replace(/\b\w/g, (c) => c.toUpperCase())

/** Free-text entry for anything not in the lists */
function Manual({ label, placeholder, onDone }: { label: string; placeholder: string; onDone: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState('')
  if (!open) {
    return (
      <button className="choice manual" onClick={() => setOpen(true)}>
        <div>
          <div className="choice-title">{label}</div>
          <div className="muted small">Type it in. We’ll use typical specs and flag them as assumptions.</div>
        </div>
        <IconChevron />
      </button>
    )
  }
  return (
    <div className="card form">
      <label className="field">
        <span>{label}</span>
        <div className="input-row">
          <input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} onKeyDown={(e) => e.key === 'Enter' && v.trim() && onDone(v.trim())} />
          <button className="btn btn-primary" disabled={!v.trim()} onClick={() => onDone(v.trim())}>Next</button>
        </div>
      </label>
    </div>
  )
}

function PickMake({ onPick }: { onPick: (m: string) => void }) {
  const [q, setQ] = useState('')
  const list = ALL_MAKES.filter((n) => n.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Which brand?</h1>
      </header>
      <div className="search">
        <IconSearch />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands" />
      </div>
      <div className="brand-grid">
        {list.map((n) => (
          <button key={n} className="brand" onClick={() => onPick(n)}>
            <span className="brand-mark">{n[0]}</span>
            <span>{n}</span>
          </button>
        ))}
      </div>
      {q.trim() && !list.length && (
        <button className="choice" onClick={() => onPick(title(q))}>
          <div className="choice-title">Use “{title(q)}”</div>
          <IconChevron />
        </button>
      )}
      <Manual label="My brand isn’t listed" placeholder="e.g. Hummer" onDone={(v) => onPick(title(v))} />
    </div>
  )
}

function PickModel({ make, onPick }: { make: string; onPick: (m: string) => void }) {
  const [q, setQ] = useState('')
  const [more, setMore] = useState<string[]>([])
  const full = findMake(make)?.models.map((m) => m.name) ?? []
  const catalog = (Object.entries(CATALOG).find(([m]) => m.toLowerCase() === make.toLowerCase())?.[1] ?? []).map((m) => m.name)

  useEffect(() => {
    let alive = true
    fetchModels(make).then((m) => alive && setMore(m))
    return () => {
      alive = false
    }
  }, [make])

  const needle = q.toLowerCase()
  const known = [...new Set([...full, ...catalog])].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  const top = known.filter((n) => n.toLowerCase().includes(needle))
  const has = (n: string) => known.some((b) => b.toLowerCase() === n.toLowerCase())
  const extra = needle ? more.filter((n) => n.toLowerCase().includes(needle) && !has(n)).slice(0, 20) : []

  return (
    <div className="stack">
      <header className="page-head">
        <p className="eyebrow">{make}</p>
        <h1>Which model?</h1>
      </header>
      <div className="search">
        <IconSearch />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models" />
      </div>
      {(top.length > 0 || extra.length > 0) && (
        <div className="list card">
          {top.map((n) => (
            <button key={n} className="row" onClick={() => onPick(n)}>
              <div className="row-main">
                <div className="row-title">{n}</div>
                <div className="row-sub">{full.includes(n) ? 'Full spec sheet' : 'Typical specs for this model type'}</div>
              </div>
              <IconChevron />
            </button>
          ))}
          {extra.map((n) => (
            <button key={n} className="row" onClick={() => onPick(n)}>
              <div className="row-main">
                <div className="row-title">{n}</div>
                <div className="row-sub">From the NHTSA vehicle database · some assumptions</div>
              </div>
              <IconChevron />
            </button>
          ))}
        </div>
      )}
      {q.trim() && !top.length && !extra.length && (
        <button className="choice" onClick={() => onPick(q.trim())}>
          <div className="choice-title">Use “{q.trim()}”</div>
          <IconChevron />
        </button>
      )}
      <Manual label="My model isn’t listed" placeholder="e.g. Grand Cherokee SRT" onDone={onPick} />
    </div>
  )
}

const PROFILE_KEYS: SpecKey[] = ['powertrain', 'transmission', 'drivetrain', 'drivingStyle', 'tireSetup']

function Profile({ make, model, onDone }: { make: string; model: string; onDone: (n: Omit<NewCar, 'make' | 'model' | 'year' | 'trim'>) => void }) {
  const base = useMemo(() => resolveSpecs(make, model).specs, [make, model])
  const [nickname, setNickname] = useState('')
  const [color, setColor] = useState(CAR_COLORS[0])
  const [odo, setOdo] = useState('')
  const [annual, setAnnual] = useState('')
  const [lastOil, setLastOil] = useState('')
  const [vin, setVin] = useState('')
  const [vinMsg, setVinMsg] = useState('')
  const [given, setGiven] = useState<Partial<CarSpecs>>({})
  const val = { ...base, ...given }

  const lookupVin = async () => {
    setVinMsg('Looking up…')
    const r = await decodeVin(vin)
    if (!r) return setVinMsg('Could not decode that VIN. Check it and try again, or skip it.')
    setGiven((g) => ({ ...g, ...r.specs }))
    const found = Object.keys(r.specs).length
    setVinMsg(`Found ${r.year ?? ''} ${r.make ?? ''} ${r.model ?? ''}. Filled in ${found} detail${found === 1 ? '' : 's'}.`)
  }

  const num = (s: string) => (s.trim() ? Math.max(0, parseInt(s.replace(/\D/g, ''), 10) || 0) : undefined)

  return (
    <div className="stack">
      <header className="page-head">
        <p className="eyebrow">{make} {model}</p>
        <h1>Car profile</h1>
        <p className="muted">Everything is optional. Whatever you skip, we’ll assume and flag.</p>
      </header>

      <section className="card form">
        <label className="field">
          <span>Nickname</span>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Family SUV" />
        </label>
        <div className="field">
          <span>Colour</span>
          <div className="swatches">
            {CAR_COLORS.map((c) => (
              <button key={c} className={`swatch ${c === color ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={`Colour ${c}`} />
            ))}
          </div>
        </div>
        <label className="field">
          <span>Current odometer (km)</span>
          <input inputMode="numeric" value={odo} onChange={(e) => setOdo(e.target.value)} placeholder="e.g. 84,500" />
        </label>
        <label className="field">
          <span>Km driven per year</span>
          <input inputMode="numeric" value={annual} onChange={(e) => setAnnual(e.target.value)} placeholder="About 20,000 if unsure" />
        </label>
        <label className="field">
          <span>Odometer at last oil change (km)</span>
          <input inputMode="numeric" value={lastOil} onChange={(e) => setLastOil(e.target.value)} placeholder="Check the sticker on your windshield" />
        </label>
      </section>

      <section className="card form">
        <label className="field">
          <span>VIN (optional, fills specs automatically)</span>
          <div className="input-row">
            <input value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="17 characters, on the dash or door jamb" maxLength={17} />
            <button className="btn btn-soft" disabled={vin.trim().length !== 17} onClick={lookupVin}>
              Look up
            </button>
          </div>
        </label>
        {vinMsg && <p className="small muted">{vinMsg}</p>}
        {PROFILE_KEYS.map((k) => (
          <label key={k} className="field">
            <span>{SPEC_LABELS[k]}</span>
            <select value={String(val[k])} onChange={(e) => setGiven((g) => ({ ...g, [k]: e.target.value }))}>
              {SPEC_OPTIONS[k]!.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        ))}
        <label className="field">
          <span>Tire size</span>
          <input value={String(val.tireSize)} onChange={(e) => setGiven((g) => ({ ...g, tireSize: e.target.value }))} />
        </label>
      </section>

      <button
        className="btn btn-primary btn-block"
        onClick={() => {
          const annualKm = num(annual)
          onDone({
            nickname: nickname.trim() || undefined,
            color,
            odometerKm: num(odo),
            lastOilKm: num(lastOil),
            // Fields shown in the profile were reviewed by the user, so they count as theirs.
            given: { ...Object.fromEntries(PROFILE_KEYS.map((k) => [k, val[k]])), ...given, ...(annualKm ? { annualKm } : {}) },
            profileComplete: true,
          })
        }}
      >
        Save and look up specs
      </button>
    </div>
  )
}

function Lookup({ make, model, year, carId }: { make: string; model: string; year: number; carId: string }) {
  const [shown, setShown] = useState(0)
  const car = useCar(carId)!
  const { specs, sources } = car
  const keys = ASSUMPTION_ORDER.filter((k) => !(specs.powertrain === 'ev' && ['oilType', 'oilCapacityL', 'oilIntervalKm', 'sparkPlugKm', 'timingBelt'].includes(k)))
  const found = findModel(make, model)

  useEffect(() => {
    if (shown >= keys.length) return
    const t = setTimeout(() => setShown((s) => s + 1), 110)
    return () => clearTimeout(t)
  }, [shown, keys.length])

  const done = shown >= keys.length
  return (
    <div className="stack">
      <header className="page-head">
        <p className="eyebrow">{done ? 'Spec sheet ready' : 'Looking up specs…'}</p>
        <h1>{year} {make} {model}</h1>
        <p className="muted small">
          {found
            ? 'Matched in our spec sheet for this model. Anything marked Assumed is a best guess you can change from the maintenance screen.'
            : 'This model is not in our spec sheet yet, so we used typical values for the brand and body style. They are marked Assumed.'}
        </p>
      </header>
      <div className="card list">
        {keys.slice(0, shown).map((k) => (
          <div key={k} className="row fade-in">
            <div className="row-main">
              <div className="row-sub">{SPEC_LABELS[k]}</div>
              <div className="row-title">{formatSpec(k, specs)}</div>
            </div>
            <SourceTag source={sources[k]} />
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-block" disabled={!done} onClick={() => go(`/car/${carId}`)}>
        <IconCheck /> Open maintenance plan
      </button>
    </div>
  )
}
